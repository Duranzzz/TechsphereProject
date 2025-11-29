import { query } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const producto_id = searchParams.get('producto_id');

    if (!producto_id) {
        return Response.json({ error: 'Producto ID requerido' }, { status: 400 });
    }

    try {
        const result = await query(
            `SELECT k.*, u.nombre as ubicacion_nombre
             FROM kardex k
             LEFT JOIN ubicaciones u ON k.ubicacion_id = u.id
             WHERE k.producto_id = $1 
             ORDER BY k.fecha DESC`,
            [producto_id]
        );
        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching kardex:', error);
        return Response.json({ error: 'Error fetching kardex' }, { status: 500 });
    }
}
