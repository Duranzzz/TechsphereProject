
import { pool } from '@/lib/db';
import argon2 from 'argon2';

export async function POST(request) {
    try {
        const body = await request.json();
        const { nombre, apellido, email, telefono, password, calle, ciudad, estado, pais } = body;

        // Basic validation
        if (!nombre || !email || !password || !ciudad || !estado) {
            return Response.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return Response.json(
                { error: 'El correo electrónico ya está registrado' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await argon2.hash(password);

        // Transaction for atomicity
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Create Address
            const calleValue = calle && calle.trim() !== '' ? calle : 'Sin calle';
            const paisValue = pais || 'Bolivia';

            const addressRes = await client.query(
                `INSERT INTO direcciones (calle, ciudad, estado, pais) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id`,
                [calleValue, ciudad, estado, paisValue]
            );
            const direccionId = addressRes.rows[0].id;

            // 2. Create User
            const userResult = await client.query(
                `INSERT INTO users (nombre, email, password, rol) 
                 VALUES ($1, $2, $3, 'cliente') 
                 RETURNING id`,
                [nombre, email, hashedPassword]
            );
            const userId = userResult.rows[0].id;

            // 3. Create Client Profile
            await client.query(
                `INSERT INTO clientes (nombre, apellido, telefono, user_id, tipo, direccion_id) 
                 VALUES ($1, $2, $3, $4, 'consumidor_final', $5)`,
                [nombre, apellido || null, telefono || null, userId, direccionId]
            );

            await client.query('COMMIT');

            return Response.json(
                { message: 'Usuario registrado correctamente', userId },
                { status: 201 }
            );

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Registration error:', error);
        return Response.json(
            { error: 'Error al registrar usuario' },
            { status: 500 }
        );
    }
}
