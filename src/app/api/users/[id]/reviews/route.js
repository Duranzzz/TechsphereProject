import { query } from '@/lib/db';

export async function loader({ request, params }) {
    const userId = params.id;

    try {
        const result = await query(
            `SELECT r.id, r.calificacion, r.comentario, r.fecha_review,
              p.nombre as producto_nombre, p.imagen_url as producto_imagen, p.id as producto_id
       FROM reviews r
       JOIN clientes c ON r.cliente_id = c.id
       JOIN productos p ON r.producto_id = p.id
       WHERE c.user_id = $1
       ORDER BY r.fecha_review DESC`,
            [userId]
        );

        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('User reviews error:', error);
        return new Response(JSON.stringify({ error: 'Error al obtener reviews' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
