import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM marcas 
      ORDER BY nombre
    `);
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching marcas:", error);
    return Response.json({ error: "Error fetching marcas" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, pais_origen, sitio_web } = body;

    const result = await query(
      `INSERT INTO marcas (nombre, pais_origen, sitio_web)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nombre, pais_origen, sitio_web]
    );

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating marca:", error);
    return Response.json({ error: "Error creating marca" }, { status: 500 });
  }
}
