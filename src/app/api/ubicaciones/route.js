import { pool } from '@/lib/db';

export async function GET() {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM ubicaciones ORDER BY id ASC');
        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching ubicaciones:', error);
        return Response.json({ error: 'Error fetching ubicaciones' }, { status: 500 });
    } finally {
        client.release();
    }
}
