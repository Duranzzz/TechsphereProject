import { sql } from '@/app/api/utils/sql';

export async function GET() {
    try {
        const proveedores = await sql('SELECT * FROM proveedores WHERE activo = true ORDER BY nombre ASC');
        return Response.json(proveedores);
    } catch (error) {
        console.error('Error fetching proveedores:', error);
        return Response.json({ error: 'Error fetching proveedores' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { nombre, contacto, telefono, email, direccion } = await request.json();

        if (!nombre) {
            return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
        }

        const result = await sql(
            `INSERT INTO proveedores (nombre, contacto, telefono, email, direccion)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [nombre, contacto, telefono, email, direccion]
        );

        return Response.json(result[0], { status: 201 });
    } catch (error) {
        console.error('Error creating proveedor:', error);
        return Response.json({ error: 'Error creating proveedor' }, { status: 500 });
    }
}
