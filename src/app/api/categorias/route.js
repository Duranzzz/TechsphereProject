import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM categorias 
      WHERE activa = true 
      ORDER BY nombre
    `);
    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching categorias:", error);
    return Response.json(
      { error: "Error fetching categorias" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, descripcion } = body;

    const result = await query(
      `INSERT INTO categorias (nombre, descripcion)
       VALUES ($1, $2)
       RETURNING *`,
      [nombre, descripcion]
    );

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating categoria:", error);
    return Response.json(
      { error: "Error creating categoria" },
      { status: 500 },
    );
  }
}
