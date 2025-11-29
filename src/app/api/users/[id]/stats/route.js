import { query } from '@/lib/db';

export async function loader({ request, params }) {
    const userId = params.id;

    try {
        // Get user stats
        const ventasResult = await query(
            `SELECT COUNT(*) as count, SUM(total) as total_spent 
       FROM ventas v
       JOIN clientes c ON v.cliente_id = c.id
       WHERE c.user_id = $1 AND v.estado = 'completada'`,
            [userId]
        );

        const reviewsResult = await query(
            `SELECT COUNT(*) as count 
       FROM reviews r
       JOIN clientes c ON r.cliente_id = c.id
       WHERE c.user_id = $1`,
            [userId]
        );

        return new Response(JSON.stringify({
            ventas: parseInt(ventasResult.rows[0].count),
            total_gastado: parseFloat(ventasResult.rows[0].total_spent || 0),
            reviews: parseInt(reviewsResult.rows[0].count)
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Profile stats error:', error);
        return new Response(JSON.stringify({ error: 'Error al obtener estadísticas' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
