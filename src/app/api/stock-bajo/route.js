import { pool } from '@/lib/db';

export async function GET() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                p.id as producto_id,
                p.nombre as producto_nombre,
                p.sku,
                p.imagen_url,
                i.ubicacion_id,
                u.nombre as ubicacion_nombre,
                i.cantidad_disponible as stock,
                i.cantidad_minima,
                (i.cantidad_minima - i.cantidad_disponible) as deficit
            FROM inventario i
            JOIN productos p ON i.producto_id = p.id
            JOIN ubicaciones u ON i.ubicacion_id = u.id
            WHERE i.cantidad_disponible <= i.cantidad_minima
              AND p.activo = true
            ORDER BY deficit DESC, p.nombre ASC
        `);

        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching stock bajo:', error);
        return Response.json({ error: 'Error fetching stock bajo' }, { status: 500 });
    } finally {
        client.release();
    }
}
