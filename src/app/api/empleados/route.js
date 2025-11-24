import { sql } from "@/app/api/utils/sql";

export async function GET() {
    try {
        const empleados = await sql`SELECT id, nombre, apellido, puesto FROM empleados WHERE activo = true`;
        return Response.json(empleados);
    } catch (error) {
        return Response.json({ error: "Error fetching empleados" }, { status: 500 });
    }
}
