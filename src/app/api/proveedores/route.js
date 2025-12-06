import { pool } from '@/lib/db';

export async function GET() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT p.*, 
                   d.calle || ', ' || d.ciudad || ', ' || d.pais as direccion
            FROM proveedores p
            LEFT JOIN direcciones d ON p.direccion_id = d.id
            WHERE p.activo = true 
            ORDER BY p.nombre ASC
        `);
        return Response.json(result.rows);
    } catch (error) {
        console.error('Error fetching proveedores:', error);
        return Response.json({ error: 'Error fetching proveedores' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function POST(request) {
    const client = await pool.connect();
    try {
        const { nombre, contacto, telefono, email, calle, ciudad, estado, pais } = await request.json();

        if (!nombre) {
            return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        await client.query('BEGIN');

        // 1. Create Address
        const calleValue = calle && calle.trim() !== '' ? calle : 'Sin calle';
        const paisValue = pais || 'Bolivia';
        const ciudadValue = ciudad || '';
        const estadoValue = estado || '';

        const addressRes = await client.query(
            `INSERT INTO direcciones (calle, ciudad, estado, pais) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id`,
            [calleValue, ciudadValue, estadoValue, paisValue]
        );
        const direccionId = addressRes.rows[0].id;

        // 2. Create Provider
        const res = await client.query(
            `INSERT INTO proveedores (nombre, contacto, telefono, email, direccion_id, activo) 
             VALUES ($1, $2, $3, $4, $5, true) 
             RETURNING *`,
            [nombre, contacto, telefono, email, direccionId]
        );

        await client.query('COMMIT');
        return Response.json(res.rows[0], { status: 201 });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating proveedor:', error);
        return Response.json({ error: 'Error creating proveedor' }, { status: 500 });
    } finally {
        client.release();
    }
}
