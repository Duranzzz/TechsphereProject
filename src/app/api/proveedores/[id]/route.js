import { sql } from '@/app/api/utils/sql';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const result = await sql`SELECT * FROM proveedores WHERE id = ${id}`;

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

        const result = await sql`
            UPDATE proveedores 
            SET nombre = ${nombre}, 
                contacto = ${contacto}, 
                telefono = ${telefono}, 
                email = ${email}, 
                direccion = ${direccion}, 
                activo = ${activo}
            WHERE id = ${id}
            RETURNING *
        `;

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

        const result = await sql`
            UPDATE proveedores 
            SET activo = false
            WHERE id = ${id} 
            RETURNING *
        `;

        if (result.length === 0) {
            return Response.json({ error: 'Proveedor no encontrado' }, { status: 404 });
        }

        return Response.json({ message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting proveedor:', error);
        return Response.json({ error: 'Error deleting proveedor' }, { status: 500 });
    }
}
