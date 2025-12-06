import { pool } from '@/lib/db';

export async function GET(request, { params }) {
    const client = await pool.connect();
    try {
        const { id } = await params;
        const result = await client.query(`
            SELECT p.*, 
                   d.calle,
                   d.ciudad,
                   d.estado,
                   d.pais
            FROM proveedores p
            LEFT JOIN direcciones d ON p.direccion_id = d.id
            WHERE p.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return Response.json({ error: 'Proveedor no encontrado' }, { status: 404 });
        }

        return Response.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching proveedor:', error);
        return Response.json({ error: 'Error fetching proveedor' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function PUT(request, { params }) {
    const client = await pool.connect();
    try {
        const { id } = await params;
        const { nombre, contacto, telefono, email, calle, ciudad, estado, pais, activo } = await request.json();

        if (!nombre) {
            return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        await client.query('BEGIN');

        // Get current provider to find address ID
        const currentRes = await client.query('SELECT direccion_id FROM proveedores WHERE id = $1', [id]);
        if (currentRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return Response.json({ error: 'Proveedor no encontrado' }, { status: 404 });
        }

        let direccionId = currentRes.rows[0].direccion_id;
        const calleValue = calle && calle.trim() !== '' ? calle : 'Sin calle';
        const paisValue = pais || 'Bolivia';

        // Update or Create Address
        if (direccionId) {
            await client.query(
                `UPDATE direcciones 
                 SET calle = $1, ciudad = $2, estado = $3, pais = $4
                 WHERE id = $5`,
                [calleValue, ciudad, estado, paisValue, direccionId]
            );
        } else {
            const dirRes = await client.query(
                `INSERT INTO direcciones (calle, ciudad, estado, pais)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id`,
                [calleValue, ciudad, estado, paisValue]
            );
            direccionId = dirRes.rows[0].id;
        }

        // Update Provider
        const result = await client.query(
            `UPDATE proveedores 
             SET nombre = $1, 
                 contacto = $2, 
                 telefono = $3, 
                 email = $4, 
                 direccion_id = $5, 
                 activo = $6
             WHERE id = $7
             RETURNING *`,
            [nombre, contacto, telefono, email, direccionId, activo, id]
        );

        await client.query('COMMIT');
        return Response.json(result.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating proveedor:', error);
        return Response.json({ error: 'Error updating proveedor' }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function DELETE(request, { params }) {
    const client = await pool.connect();
    try {
        const { id } = await params;

        const result = await client.query(
            `UPDATE proveedores 
             SET activo = false
             WHERE id = $1 
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return Response.json({ error: 'Proveedor no encontrado' }, { status: 404 });
        }

        return Response.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting proveedor:', error);
        return Response.json({ error: 'Error deleting proveedor' }, { status: 500 });
    } finally {
        client.release();
    }
}
