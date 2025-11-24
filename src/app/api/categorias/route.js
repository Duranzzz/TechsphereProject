import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const categorias = await sql`
      SELECT * FROM categorias 
      WHERE activa = true 
      ORDER BY nombre
    `;
    return Response.json(categorias);
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

    const result = await sql`
      INSERT INTO categorias (nombre, descripcion)
      VALUES (${nombre}, ${descripcion})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating categoria:", error);
    return Response.json(
      { error: "Error creating categoria" },
      { status: 500 },
    );
  }
}
