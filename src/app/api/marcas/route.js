import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const marcas = await sql`
      SELECT * FROM marcas 
      ORDER BY nombre
    `;
    return Response.json(marcas);
  } catch (error) {
    console.error("Error fetching marcas:", error);
    return Response.json({ error: "Error fetching marcas" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, pais_origen, sitio_web } = body;

    const result = await sql`
      INSERT INTO marcas (nombre, pais_origen, sitio_web)
      VALUES (${nombre}, ${pais_origen}, ${sitio_web})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating marca:", error);
    return Response.json({ error: "Error creating marca" }, { status: 500 });
  }
}
