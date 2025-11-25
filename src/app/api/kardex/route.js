import { sql } from '../utils/sql';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const producto_id = searchParams.get('producto_id');

    if (!producto_id) {
        return Response.json({ error: 'Producto ID requerido' }, { status: 400 });
    }

    try {
        const kardex = await sql(
            `SELECT * FROM kardex 
       WHERE producto_id = $1 
       ORDER BY fecha DESC`,
            [producto_id]
        );
        return Response.json(kardex);
    } catch (error) {
        console.error('Error fetching kardex:', error);
        return Response.json({ error: 'Error fetching kardex' }, { status: 500 });
    }
}
