import { pool } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });
    }

    try {
        const clientRes = await pool.query('SELECT id FROM clientes WHERE user_id = $1', [userId]);
        if (clientRes.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), { status: 404 });
        }
        const clienteId = clientRes.rows[0].id;

        const res = await pool.query(`
            SELECT d.*, cd.alias, cd.es_principal, cd.id as link_id
            FROM direcciones d
            JOIN cliente_direcciones cd ON d.id = cd.direccion_id
            WHERE cd.cliente_id = $1
            ORDER BY cd.es_principal DESC, d.created_at DESC
        `, [clienteId]);

        return new Response(JSON.stringify(res.rows), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}

export async function POST(request) {
    const client = await pool.connect();
    try {
        const body = await request.json();
        const { user_id, calle, ciudad, estado, pais, alias, es_principal } = body;

        await client.query('BEGIN');

        const clientRes = await client.query('SELECT id FROM clientes WHERE user_id = $1', [user_id]);
        if (clientRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), { status: 404 });
        }
        const clienteId = clientRes.rows[0].id;

        // If new address is principal, unset other principals
        if (es_principal) {
            await client.query('UPDATE cliente_direcciones SET es_principal = false WHERE cliente_id = $1', [clienteId]);
        }

        // Create Address
        const addrRes = await client.query(
            'INSERT INTO direcciones (calle, ciudad, estado, pais) VALUES ($1, $2, $3, $4) RETURNING id',
            [calle, ciudad, estado, pais || 'Bolivia']
        );
        const direccionId = addrRes.rows[0].id;

        // Link Address
        // If it's the first address, force it to be principal
        const countRes = await client.query('SELECT COUNT(*) FROM cliente_direcciones WHERE cliente_id = $1', [clienteId]);
        const isFirst = parseInt(countRes.rows[0].count) === 0;
        const finalPrincipal = isFirst ? true : es_principal;

        await client.query(
            'INSERT INTO cliente_direcciones (cliente_id, direccion_id, alias, es_principal) VALUES ($1, $2, $3, $4)',
            [clienteId, direccionId, alias || 'Casa', finalPrincipal]
        );

        await client.query('COMMIT');
        return new Response(JSON.stringify({ message: 'Dirección agregada', id: direccionId }), { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    } finally {
        client.release();
    }
}
