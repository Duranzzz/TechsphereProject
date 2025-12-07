import { query } from '@/lib/db';
import argon2 from 'argon2';

export async function POST(request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email y contraseña requeridos' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await query(
            `SELECT 
                u.id, 
                COALESCE(c.nombre, u.nombre) as nombre, 
                c.apellido, 
                u.email, 
                u.password, 
                u.rol, 
                u.foto_url,
                c.telefono,
                c.activo as cliente_activo,
                e.activo as empleado_activo,
                e.id as empleado_id,
                e.puesto
             FROM users u
             LEFT JOIN clientes c ON u.id = c.user_id
             LEFT JOIN empleados e ON u.id = e.user_id
             WHERE u.email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const user = result.rows[0];
        const validPassword = await argon2.verify(user.password, password);

        if (!validPassword) {
            return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if account is active for clients and employees
        if (user.rol === 'cliente') {
            // Note: If no client record exists despite role 'cliente', we strictly valid against user record? 
            // The LEFT JOIN returns null for cliente_activo if no record.
            // Assuming if they are role 'cliente', they SHOULD have a record, but if not, we default to active unless explicitly false?
            // Actually, if client record is missing, cliente_activo is null. We should handle that.
            // But based on inserts `active` defaults to true.

            if (user.cliente_activo === false) {
                return new Response(JSON.stringify({ error: 'Cuenta desactivada. Contacte a TechSphere.' }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        } else if (user.rol === 'empleado') {
            if (user.empleado_activo === false) {
                return new Response(JSON.stringify({ error: 'Cuenta desactivada. Contacte a TechSphere.' }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        // Clean up internal helper fields before returning
        delete user.cliente_activo;
        delete user.empleado_activo;

        // Remove password from response
        delete user.password;

        return new Response(JSON.stringify({ user }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
