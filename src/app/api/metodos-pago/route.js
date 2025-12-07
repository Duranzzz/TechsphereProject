import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT id, nombre FROM metodos_pago WHERE activo = true ORDER BY id');
        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return Response.json({ error: 'Error fetching payment methods' }, { status: 500 });
    }
}
