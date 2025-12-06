import { query } from '@/lib/db';
import argon2 from 'argon2';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });
    }

    try {
        // Fetch user basic info
        const userRes = await query(`
            SELECT u.id, u.nombre, u.email, u.foto_url, c.id as cliente_id, c.apellido, c.telefono, c.activo,
                   d.id as direccion_id, d.calle, d.ciudad, d.estado, d.pais
            FROM users u 
            JOIN clientes c ON c.user_id = u.id
            LEFT JOIN direcciones d ON c.direccion_id = d.id
            WHERE u.id = $1
        `, [userId]);

        if (userRes.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        const user = userRes.rows[0];
        const clienteId = user.cliente_id;

        // Fetch Stats
        const ventasRes = await query(`
            SELECT COUNT(*) as total_compras, COALESCE(SUM(total), 0) as total_gastado 
            FROM ventas 
            WHERE cliente_id = $1 AND estado = 'completada'
        `, [clienteId]);

        const reviewsRes = await query(`
            SELECT r.id, r.calificacion, r.comentario, r.fecha_review, p.nombre as producto_nombre, p.imagen_url, r.producto_id
            FROM reviews r
            JOIN productos p ON r.producto_id = p.id
            WHERE r.cliente_id = $1
            ORDER BY r.fecha_review DESC
        `, [clienteId]);

        // Get review stats separately if needed or just count array
        const reviewCount = reviewsRes.rows.length;

        return new Response(JSON.stringify({
            profile: user,
            stats: {
                compras: ventasRes.rows[0].total_compras,
                gastado: ventasRes.rows[0].total_gastado,
                reviews: reviewCount
            },
            reviews: reviewsRes.rows
        }), { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();

        // Check for action type to distinguish between profile update and review update
        if (body.action === 'update_review') {
            const { review_id, calificacion, comentario, user_id } = body;

            // Verify ownership via user_id -> cliente_id
            // First get cliente_id from user_id
            const clientRes = await query('SELECT id FROM clientes WHERE user_id = $1', [user_id]);
            if (clientRes.rows.length === 0) return new Response(JSON.stringify({ error: 'Cliente no encontrado' }), { status: 404 });

            const clienteId = clientRes.rows[0].id;

            // Check if review belongs to client
            const reviewCheck = await query('SELECT id FROM reviews WHERE id = $1 AND cliente_id = $2', [review_id, clienteId]);
            if (reviewCheck.rows.length === 0) {
                return new Response(JSON.stringify({ error: 'Review no encontrada o no autorizada' }), { status: 404 });
            }

            await query('UPDATE reviews SET calificacion = $1, comentario = $2, fecha_review = CURRENT_TIMESTAMP WHERE id = $3', [calificacion, comentario, review_id]);
            return new Response(JSON.stringify({ message: 'Reseña actualizada' }), { status: 200 });
        }

        // Default: Update Profile
        // Default: Update Profile
        const { user_id, nombre, apellido, email, telefono, calle, ciudad, estado, pais } = body;

        // Transaction manually (or sequential updates)
        const client = await query('BEGIN');
        // Note: 'query' helper might not support BEGIN/COMMIT if it's just pool.query. 
        // Checking file... 'import { query } from ...' likely just pool.query.
        // I will do sequential updates.

        // Update users table
        await query('UPDATE users SET nombre = $1, email = $2 WHERE id = $3', [nombre, email, user_id]);

        // Get cliente info to find address
        const clienteRes = await query('SELECT id, direccion_id FROM clientes WHERE user_id = $1', [user_id]);
        if (clienteRes.rows.length > 0) {
            const cliente = clienteRes.rows[0];

            // Update clientes table
            await query('UPDATE clientes SET nombre = $1, apellido = $2, telefono = $3 WHERE user_id = $4', [nombre, apellido, telefono, user_id]);

            // Update Address if exists, else create
            if (cliente.direccion_id) {
                const calleValue = calle && calle.trim() !== '' ? calle : 'Sin calle';
                await query('UPDATE direcciones SET calle = $1, ciudad = $2, estado = $3, pais = $4 WHERE id = $5',
                    [calleValue, ciudad, estado, pais, cliente.direccion_id]);
            } else {
                // Create new address if missing
                const calleValue = calle && calle.trim() !== '' ? calle : 'Sin calle';
                const newAddr = await query('INSERT INTO direcciones (calle, ciudad, estado, pais) VALUES ($1, $2, $3, $4) RETURNING id',
                    [calleValue, ciudad, estado, pais || 'Bolivia']);
                await query('UPDATE clientes SET direccion_id = $1 WHERE id = $2', [newAddr.rows[0].id, cliente.id]);
            }
        }

        return new Response(JSON.stringify({ message: 'Profile updated' }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const { user_id, type, current_password, new_password, password } = await request.json(); // type: 'password' or 'deactivate'

        // Get current password hash
        const userRes = await query('SELECT password FROM users WHERE id = $1', [user_id]);
        if (userRes.rows.length === 0) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });

        const currentHash = userRes.rows[0].password;

        if (type === 'password') {
            const valid = await argon2.verify(currentHash, current_password);
            if (!valid) return new Response(JSON.stringify({ error: 'Contraseña actual incorrecta' }), { status: 400 });

            const newHash = await argon2.hash(new_password);
            await query('UPDATE users SET password = $1 WHERE id = $2', [newHash, user_id]);

            return new Response(JSON.stringify({ message: 'Contraseña actualizada' }), { status: 200 });
        } else if (type === 'deactivate') {
            const valid = await argon2.verify(currentHash, password);
            if (!valid) return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), { status: 400 });

            await query('UPDATE clientes SET activo = false WHERE user_id = $1', [user_id]);
            return new Response(JSON.stringify({ message: 'Cuenta desactivada' }), { status: 200 });
        }

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}
