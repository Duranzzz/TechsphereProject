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

        // Verify customer has purchased this product
        const purchaseCheck = await query(
            `SELECT EXISTS (
                SELECT 1 
                FROM ventas v
                INNER JOIN detalles_venta dv ON v.id = dv.venta_id
                WHERE v.cliente_id = $1 
                  AND dv.producto_id = $2
                  AND v.estado = 'completada'
            ) as ha_comprado`,
            [clienteId, productId]
        );

        if (!purchaseCheck.rows[0].ha_comprado) {
            return new Response(
                JSON.stringify({ error: 'Solo puedes reseñar productos que has comprado' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

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

export async function PUT(request, { params }) {
    const productId = params.id;
    const { userId, calificacion, comentario } = await request.json();

    try {
        // Get cliente_id from user_id
        const clientRes = await query('SELECT id FROM clientes WHERE user_id = $1', [userId]);
        if (clientRes.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), { status: 404 });
        }
        const clienteId = clientRes.rows[0].id;

        // Verify review exists and belongs to user
        const reviewCheck = await query(
            'SELECT id FROM reviews WHERE producto_id = $1 AND cliente_id = $2',
            [productId, clienteId]
        );

        if (reviewCheck.rows.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Reseña no encontrada' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Update review
        await query(
            'UPDATE reviews SET calificacion = $1, comentario = $2, fecha_review = NOW() WHERE producto_id = $3 AND cliente_id = $4',
            [calificacion, comentario, productId, clienteId]
        );

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Error updating review' }), { status: 500 });
    }
}
