import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let sql = `
            SELECT clientes.id, clientes.nombre, clientes.apellido, clientes.telefono, clientes.tipo, users.email 
            FROM clientes 
            LEFT JOIN users ON clientes.user_id = users.id
            WHERE clientes.activo = true
        `;
        const params = [];

        if (search) {
            sql += ` AND (clientes.nombre ILIKE $1 OR clientes.apellido ILIKE $1 OR clientes.telefono ILIKE $1)`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY clientes.nombre LIMIT 20`;

        const result = await query(sql, params);

        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return Response.json({ error: 'Error fetching clients' }, { status: 500 });
    }
}
