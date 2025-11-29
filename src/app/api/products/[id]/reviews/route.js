import { query } from '@/lib/db';

export async function loader({ request, params }) {
    const productId = params.id;
    try {
        const result = await query(
            `SELECT r.id, r.calificacion, r.comentario, r.fecha_review, c.nombre as cliente_nombre
       FROM reviews r
       JOIN clientes c ON r.cliente_id = c.id
       WHERE r.producto_id = $1
       ORDER BY r.fecha_review DESC`,
            [productId]
        );
        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error fetching reviews' }), { status: 500 });
    }
}

export async function action({ request, params }) {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const productId = params.id;
    const { userId, calificacion, comentario } = await request.json();

    try {
        // Get cliente_id from user_id
        const clientRes = await query('SELECT id FROM clientes WHERE user_id = $1', [userId]);
        if (clientRes.rows.length === 0) throw new Error('Cliente no encontrado');
        const clienteId = clientRes.rows[0].id;

        await query(
            `INSERT INTO reviews (producto_id, cliente_id, calificacion, comentario, verificado)
       VALUES ($1, $2, $3, $4, true)`,
            [productId, clienteId, calificacion, comentario]
        );

        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Error posting review' }), { status: 500 });
    }
}
