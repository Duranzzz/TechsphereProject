import { sql } from '../utils/sql';

export async function GET() {
    try {
        const compras = await sql(`
      SELECT c.*, p.nombre as proveedor_nombre
      FROM compras c
      LEFT JOIN proveedores p ON c.proveedor_id = p.id
      ORDER BY c.fecha_compra DESC
    `);
        return Response.json(compras);
    } catch (error) {
        console.error('Error fetching compras:', error);
        return Response.json({ error: 'Error fetching compras' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { proveedor_id, numero_factura, fecha_compra, items } = await request.json();

        if (!proveedor_id || !items || items.length === 0) {
            return Response.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
        }

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

        const result = await sql.transaction(async (tx) => {
            // 1. Insert Header
            const compraResult = await tx(
                `INSERT INTO compras (proveedor_id, numero_factura, fecha_compra, total, estado)
         VALUES ($1, $2, $3, $4, 'completada')
         RETURNING id`,
                [proveedor_id, numero_factura, fecha_compra || new Date()]
            );
            const compraId = compraResult[0].id;

            // 2. Process Items
            for (const item of items) {
                const { producto_id, cantidad, precio_unitario } = item;

                // Get current stock for Kardex
                const productResult = await tx('SELECT stock FROM productos WHERE id = $1', [producto_id]);
                if (productResult.length === 0) throw new Error(`Producto ${producto_id} no encontrado`);

                const saldoAnterior = productResult[0].stock;
                const saldoActual = saldoAnterior + parseInt(cantidad);

                // Insert Detail
                await tx(
                    `INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario)
           VALUES ($1, $2, $3, $4)`,
                    [compraId, producto_id, cantidad, precio_unitario]
                );

                // Update Stock
                await tx(
                    `UPDATE productos SET stock = $1, precio_costo = $2, fecha_actualizacion = CURRENT_TIMESTAMP
           WHERE id = $3`,
                    [saldoActual, precio_unitario, producto_id]
                );

                // Insert Kardex
                await tx(
                    `INSERT INTO kardex (producto_id, fecha, tipo_movimiento, cantidad, saldo_anterior, saldo_actual, referencia_tabla, referencia_id, observacion)
           VALUES ($1, CURRENT_TIMESTAMP, 'compra', $2, $3, $4, 'compras', $5, $6)`,
                    [producto_id, cantidad, saldoAnterior, saldoActual, compraId, `Compra Fac: ${numero_factura}`]
                );
            }

            return { id: compraId, total };
        });

        return Response.json(result, { status: 201 });
    } catch (error) {
        console.error('Error creating compra:', error);
        return Response.json({ error: error.message || 'Error creating compra' }, { status: 500 });
    }
}
