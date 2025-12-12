import { pool } from '@/lib/db';

export async function DELETE(request, { params }) {
    const id = params.id; // direccion_id to delete (or link_id?) -> Let's treat ID as direccion_id for simplicity, but need verify ownership
    const { user_id } = await request.json(); // Pass user_id in body for security verification

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Verify ownership
        const clientRes = await client.query('SELECT id FROM clientes WHERE user_id = $1', [user_id]);
        if (clientRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), { status: 404 });
        }
        const clienteId = clientRes.rows[0].id;

        // Verify Link exists
        const check = await client.query('SELECT * FROM cliente_direcciones WHERE cliente_id = $1 AND direccion_id = $2', [clienteId, id]);
        if (check.rows.length === 0) {
            await client.query('ROLLBACK');
            return new Response(JSON.stringify({ error: 'Dirección no encontrada' }), { status: 404 });
        }

        // Delete Link
        await client.query('DELETE FROM cliente_direcciones WHERE cliente_id = $1 AND direccion_id = $2', [clienteId, id]);

        // Cleanup: If address has no other owners, delete it? 
        // For simple apps, yes. For historical records (orders), maybe keep?
        // Current constraint: ON DELETE CASCADE in users->clientes is defined, but what about addresses?
        // Let's keep it simple: Just delete the link. The address row remains orphaned or used by others. 
        // Actually, preventing orphans is good. Check usage.
        const usage = await client.query('SELECT COUNT(*) FROM cliente_direcciones WHERE direccion_id = $1', [id]);
        if (parseInt(usage.rows[0].count) === 0) {
            // Check if used in orders/envios? 
            // Envios table references direcciones(id). If we delete from direcciones, it might fail if FK exists without cascade or set null.
            // ArquitecturaDB says: direccion_id INTEGER NOT NULL REFERENCES public.direcciones(id)
            // Does not say ON DELETE CASCADE. So safe is to NOT delete data if used.
            // But we can try, and catch FK error.
            try {
                await client.query('DELETE FROM direcciones WHERE id = $1', [id]);
            } catch (e) {
                // Ignore FK violation, meaning it's used elsewhere (history)
            }
        }

        await client.query('COMMIT');
        return new Response(JSON.stringify({ message: 'Dirección eliminada' }), { status: 200 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    } finally {
        client.release();
    }
}

export async function PATCH(request, { params }) {
    const id = params.id; // direccion_id
    const client = await pool.connect();
    try {
        const body = await request.json();
        const { user_id, action } = body; // action: 'set_principal' or 'update'

        await client.query('BEGIN');

        const clientRes = await client.query('SELECT id FROM clientes WHERE user_id = $1', [user_id]);
        if (clientRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), { status: 404 });
        }
        const clienteId = clientRes.rows[0].id;

        if (action === 'set_principal') {
            // Unset all
            await client.query('UPDATE cliente_direcciones SET es_principal = false WHERE cliente_id = $1', [clienteId]);
            // Set specific
            const result = await client.query('UPDATE cliente_direcciones SET es_principal = true WHERE cliente_id = $1 AND direccion_id = $2', [clienteId, id]);

            if (result.rowCount === 0) {
                await client.query('ROLLBACK');
                return new Response(JSON.stringify({ error: 'Dirección no encontrada' }), { status: 404 });
            }
        } else if (action === 'update') {
            // Extract address fields
            const { calle, ciudad, estado, pais, alias } = body;

            // Verify ownership
            const ownership = await client.query(
                'SELECT * FROM cliente_direcciones WHERE cliente_id = $1 AND direccion_id = $2',
                [clienteId, id]
            );

            if (ownership.rows.length === 0) {
                await client.query('ROLLBACK');
                return new Response(JSON.stringify({ error: 'Dirección no encontrada o no autorizada' }), { status: 404 });
            }

            // Update direcciones table (calle, ciudad, estado, pais)
            await client.query(
                'UPDATE direcciones SET calle = $1, ciudad = $2, estado = $3, pais = $4, updated_at = NOW() WHERE id = $5',
                [calle, ciudad, estado, pais || 'Bolivia', id]
            );

            // Update cliente_direcciones table (alias)
            if (alias !== undefined) {
                await client.query(
                    'UPDATE cliente_direcciones SET alias = $1, updated_at = NOW() WHERE cliente_id = $2 AND direccion_id = $3',
                    [alias, clienteId, id]
                );
            }
        }

        await client.query('COMMIT');
        return new Response(JSON.stringify({ message: 'Actualizado' }), { status: 200 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    } finally {
        client.release();
    }
}
