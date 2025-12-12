import { pool } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = params; // user_id

        // Obtener cliente por user_id
        const result = await pool.query(
            'SELECT id, nombre, apellido, telefono, tipo FROM clientes WHERE user_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return Response.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        return Response.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching cliente:', error);
        return Response.json({ error: 'Error al obtener cliente' }, { status: 500 });
    }
}
