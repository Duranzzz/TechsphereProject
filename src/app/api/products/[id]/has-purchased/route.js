import { query } from '@/lib/db';

export async function GET(request, { params }) {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'user_id requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Get cliente_id from user_id
        const clientRes = await query('SELECT id FROM clientes WHERE user_id = $1', [userId]);
        if (clientRes.rows.length === 0) {
            return new Response(JSON.stringify({ hasPurchased: false }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        const clienteId = clientRes.rows[0].id;

        // Check if customer has purchased this product
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

        return new Response(
            JSON.stringify({ hasPurchased: purchaseCheck.rows[0].ha_comprado }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Purchase verification error:', error);
        return new Response(
            JSON.stringify({ error: 'Error al verificar compra' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
