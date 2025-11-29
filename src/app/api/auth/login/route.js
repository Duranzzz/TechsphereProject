import { query } from '@/lib/db';
import argon2 from 'argon2';

export async function action({ request }) {
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
            'SELECT id, nombre, email, password, rol, foto_url FROM users WHERE email = $1',
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
