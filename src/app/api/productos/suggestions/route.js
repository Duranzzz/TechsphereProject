import { query } from "@/lib/db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get("q");

        if (!q || q.length < 2) {
            return Response.json([]);
        }

        // Search for products where name or brand matches
        // ILIKE is case-insensitive
        const sql = `
      SELECT p.id, p.nombre, m.nombre as marca_nombre
      FROM productos p
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE p.nombre ILIKE $1 OR m.nombre ILIKE $1
      LIMIT 5
    `;
        const values = [`%${q}%`];

        const result = await query(sql, values);

        return Response.json(result.rows);
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return Response.json(
            { error: "Error fetching suggestions" },
            { status: 500 }
        );
    }
}
