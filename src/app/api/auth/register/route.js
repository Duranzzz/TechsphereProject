
import { pool } from '@/lib/db';
import argon2 from 'argon2';

export async function POST(request) {
    try {
        const body = await request.json();
        const { nombre, apellido, email, telefono, password, calle, ciudad, estado, pais } = body;

        // Hash password
        const hashedPassword = await argon2.hash(password);

        // Call Stored Function
        const result = await pool.query(
            `SELECT registrar_usuario_nuevo($1, $2, $3, $4, $5, $6) as user_id`,
            [
                nombre,
                apellido || '',   // Now passing surname
                telefono || null, // Now passing phone
                email,
                hashedPassword,
                {
                    calle: calle || '',
                    ciudad: ciudad,
                    estado: estado,
                    pais: pais || 'Bolivia'
                }
            ]
        );

        const userId = result.rows[0].user_id;

        return Response.json(
            { message: 'Usuario registrado correctamente', userId },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration error:', error);
        // Handle specific DB errors if needed
        if (error.code === '23505') { // Unique violation
            return Response.json(
                { error: 'El correo electrónico ya está registrado' },
                { status: 409 }
            );
        }
        return Response.json(
            { error: 'Error al registrar usuario: ' + error.message },
            { status: 500 }
        );
    }
}
