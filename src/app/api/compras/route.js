import { pool } from '@/lib/db';

export async function GET() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT c.*, p.nombre as proveedor_nombre
            FROM compras c
            LEFT JOIN proveedores p ON c.proveedor_id = p.id
            ORDER BY c.fecha_compra DESC
        `);
        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching compras:', error);
        return Response.json({ error: 'Error fetching compras' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function POST(request) {
    const client = await pool.connect();
    try {
        const { proveedor_id, numero_factura, fecha_compra, items } = await request.json();

        if (!proveedor_id || !items || items.length === 0) {
            return Response.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
        }

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
        const locationId = 1; // Default location

        await client.query('BEGIN');

        // 1. Insert Header
        const compraRes = await client.query(
            `INSERT INTO compras (proveedor_id, numero_factura, fecha_compra, total, estado)
             VALUES ($1, $2, $3, $4, 'completada')
             RETURNING id`,
            [proveedor_id, numero_factura, fecha_compra || new Date(), total]
        );
        const compraId = compraRes.rows[0].id;

        // 2. Process Items
        for (const item of items) {
            const { producto_id, cantidad, precio_unitario } = item;

            // Get current stock from Inventario
            const invRes = await client.query(
                'SELECT cantidad_disponible FROM inventario WHERE producto_id = $1 AND ubicacion_id = $2',
                [producto_id, locationId]
            );

            let saldoAnterior = 0;
            if (invRes.rows.length > 0) {
                saldoAnterior = invRes.rows[0].cantidad_disponible;
            } else {
                // If no inventory record, create one? Or assume 0.
                // We should probably ensure inventory record exists.
                // But if it doesn't, we can insert.
                // For now assume 0 if not found, but we will upsert later.
            }

            const saldoActual = saldoAnterior + parseInt(cantidad);

            // Insert Detail
            await client.query(
                `INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario)
                 VALUES ($1, $2, $3, $4)`,
                [compraId, producto_id, cantidad, precio_unitario]
            );

            // Update Stock in Inventario
            // Upsert logic
            await client.query(`
                INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible)
                VALUES ($1, $2, $3)
                ON CONFLICT (producto_id, ubicacion_id) 
                DO UPDATE SET cantidad_disponible = inventario.cantidad_disponible + $3, ultima_actualizacion = CURRENT_TIMESTAMP
            `, [producto_id, locationId, cantidad]);

            // Update Cost Price in Productos
            await client.query(
                `UPDATE productos SET precio_costo = $1, fecha_actualizacion = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [precio_unitario, producto_id]
            );

            // Insert Kardex
            await client.query(
                `INSERT INTO kardex (producto_id, ubicacion_id, fecha, tipo_movimiento, cantidad, saldo_anterior, saldo_actual, referencia_tabla, referencia_id, observacion)
                 VALUES ($1, $2, CURRENT_TIMESTAMP, 'compra', $3, $4, $5, 'compras', $6, $7)`,
                [producto_id, locationId, cantidad, saldoAnterior, saldoActual, compraId, `Compra Fac: ${numero_factura}`]
            );
        }

        await client.query('COMMIT');
        return Response.json({ id: compraId, total }, { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating compra:', error);
        return Response.json({ error: error.message || 'Error creating compra' }, { status: 500 });
    } finally {
        client.release();
    }
}
