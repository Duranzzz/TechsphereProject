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
        const { nombre, contacto, telefono, email, direccion } = await request.json();

        if (!nombre) {
            return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        await client.query('BEGIN');

        // Create Address
        let direccionId = null;
        if (direccion) {
            const dirRes = await client.query(
                `INSERT INTO direcciones (calle, ciudad, estado, codigo_postal, pais)
                 VALUES ($1, 'Unknown', 'Unknown', '0000', 'Unknown')
                 RETURNING id`,
                [direccion]
            );
            direccionId = dirRes.rows[0].id;
        }

        // Create Provider
        const result = await client.query(
            `INSERT INTO proveedores (nombre, contacto, telefono, email, direccion_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [nombre, contacto, telefono, email, direccionId]
        );

        await client.query('COMMIT');
        return Response.json(result.rows[0], { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating proveedor:', error);
        return Response.json({ error: 'Error creating proveedor' }, { status: 500 });
    } finally {
        client.release();
    }
}
