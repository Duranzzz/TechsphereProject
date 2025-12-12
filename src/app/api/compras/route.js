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
        const { proveedor_id, ubicacion_id, numero_factura, fecha_compra, items } = await request.json();

        if (!proveedor_id || !ubicacion_id || !items || items.length === 0) {
            return Response.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
        }

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

        await client.query('BEGIN');

        // 1. Insert Header
        const compraRes = await client.query(
            `INSERT INTO compras (proveedor_id, ubicacion_id, numero_factura, fecha_compra, total, estado)
             VALUES ($1, $2, $3, $4, $5, 'completada')
             RETURNING id`,
            [proveedor_id, ubicacion_id, numero_factura,
                fecha_compra ? `${fecha_compra}T${new Date().toTimeString().slice(0, 8)}` : new Date(),
                total]
        );
        const compraId = compraRes.rows[0].id;

        // 2. Process Items
        for (const item of items) {
            const { producto_id, cantidad, precio_unitario } = item;

            // Insert Detail - El trigger sumar_stock_compra() se encarga de:
            // - Actualizar/crear inventario
            // - Actualizar precio_costo del producto  
            // - Registrar en kardex (vía trigger procesar_kardex_automatico)
            await client.query(
                `INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario)
                 VALUES ($1, $2, $3, $4)`,
                [compraId, producto_id, cantidad, precio_unitario]
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
