import { sql } from '../../utils/sql';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const result = await sql('SELECT * FROM proveedores WHERE id = $1', [id]);

        if (result.length === 0) {
            return Response.json({ error: 'Proveedor no encontrado' }, { status: 404 });
        }

        return Response.json(result[0]);
    } catch (error) {
        console.error('Error fetching proveedor:', error);
        return Response.json({ error: 'Error fetching proveedor' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { nombre, contacto, telefono, email, direccion, activo } = await request.json();

        if (!nombre) {
            return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        const result = await sql(
            `UPDATE proveedores 
             SET nombre = $1, contacto = $2, telefono = $3, email = $4, direccion = $5, activo = $6, updated_at = NOW()
             WHERE id = $7
             RETURNING *`,
            [nombre, contacto, telefono, email, direccion, activo, id]
        );

        if (result.length === 0) {
            return Response.json({ error: 'Proveedor no encontrado' }, { status: 404 });
        }

        return Response.json(result[0]);
    } catch (error) {
        console.error('Error updating proveedor:', error);
        return Response.json({ error: 'Error updating proveedor' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Soft delete (set activo = false) or hard delete?
        // Usually soft delete is safer for referential integrity, but user asked for "Delete".
        // Let's check if there are dependencies (compras). If so, we might need soft delete or check first.
        // For now, let's try hard delete and catch foreign key errors, or just soft delete as default safety.
        // Given the "activo" field exists, soft delete is likely preferred.
        // However, the user asked for "Delete functionality".
        // Let's implement Soft Delete by default as it's safer and "activo" column exists.

        const result = await sql(
            `UPDATE proveedores SET activo = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.length === 0) {
            return Response.json({ error: 'Proveedor no encontrado' }, { status: 404 });
        }

        return Response.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting proveedor:', error);
        return Response.json({ error: 'Error deleting proveedor' }, { status: 500 });
    }
}
