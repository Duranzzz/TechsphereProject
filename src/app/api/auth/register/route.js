import { query } from '@/lib/db';
import argon2 from 'argon2';

export async function action({ request }) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { nombre, email, password } = await request.json();

        if (!nombre || !email || !password) {
            return new Response(JSON.stringify({ error: 'Todos los campos son requeridos' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if user exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return new Response(JSON.stringify({ error: 'El usuario ya existe' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const hashedPassword = await argon2.hash(password);

        const result = await query(
            `INSERT INTO users (nombre, email, password, rol) 
       VALUES ($1, $2, $3, 'cliente') 
       RETURNING id, nombre, email, rol, foto_url`,
            [nombre, email, hashedPassword]
        );

        const user = result.rows[0];

        // Also create a client record for this user
        await query(
            `INSERT INTO clientes (nombre, email, user_id, tipo)
         VALUES ($1, $2, $3, 'consumidor_final')`,
            [nombre, email, user.id]
        );

        return new Response(JSON.stringify({ user }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Register error:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
