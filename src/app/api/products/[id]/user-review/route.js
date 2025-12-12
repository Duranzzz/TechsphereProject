import { query } from '@/lib/db';

export async function GET(request, { params }) {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return new Response(JSON.stringify({ review: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Get cliente_id from user_id
        const clientRes = await query('SELECT id FROM clientes WHERE user_id = $1', [userId]);
        if (clientRes.rows.length === 0) {
            return new Response(JSON.stringify({ review: null }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const clienteId = clientRes.rows[0].id;

        // Get user's review for this product
        const result = await query(
            'SELECT * FROM reviews WHERE producto_id = $1 AND cliente_id = $2',
            [productId, clienteId]
        );

        return new Response(
            JSON.stringify({ review: result.rows[0] || null }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('User review fetch error:', error);
        return new Response(
            JSON.stringify({ error: 'Error al obtener reseña' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
