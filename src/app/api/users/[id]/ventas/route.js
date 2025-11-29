import { query } from '@/lib/db';

export async function loader({ request, params }) {
    const userId = params.id;

    try {
        const result = await query(
            `SELECT v.id, v.codigo_venta, v.fecha, v.total, v.estado,
              json_agg(json_build_object(
                'producto', p.nombre,
                'cantidad', dv.cantidad,
                'precio', dv.precio_unitario,
                'imagen', p.imagen_url
              )) as items
       FROM ventas v
       JOIN clientes c ON v.cliente_id = c.id
       JOIN detalles_venta dv ON v.id = dv.venta_id
       JOIN productos p ON dv.producto_id = p.id
       WHERE c.user_id = $1
       GROUP BY v.id
       ORDER BY v.fecha DESC`,
            [userId]
        );

        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Sales history error:', error);
        return new Response(JSON.stringify({ error: 'Error al obtener historial' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
