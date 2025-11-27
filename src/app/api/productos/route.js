import { sql } from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");
    const marca = searchParams.get("marca");
    const search = searchParams.get("search");

    let query = `
      SELECT p.*, c.nombre as categoria_nombre, m.nombre as marca_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      WHERE p.activo = true
    `;
    const params = [];
    let paramCount = 0;

    if (categoria) {
      paramCount++;
      query += ` AND p.categoria_id = $${paramCount}`;
      params.push(categoria);
    }

    if (marca) {
      paramCount++;
      query += ` AND p.marca_id = $${paramCount}`;
      params.push(marca);
    }

    if (search) {
      paramCount++;
      query += ` AND (LOWER(p.nombre) LIKE LOWER($${paramCount}) OR LOWER(p.descripcion) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY p.nombre`;

    const productos = await sql(query, params);
    return Response.json(productos);
  } catch (error) {
    console.error("Error fetching productos:", error);
    return Response.json(
      { error: "Error fetching productos" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nombre,
      descripcion,
      precio,
      precio_costo,
      stock,
      stock_minimo,
      categoria_id,
      marca_id,
      sku,
      imagen_url,
    } = body;

    // Basic validation
    if (!nombre || !precio) {
      return Response.json({ error: "Nombre y precio son requeridos" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO productos (nombre, descripcion, precio, precio_costo, stock, stock_minimo, categoria_id, marca_id, sku, imagen_url)
      VALUES (
        ${nombre}, 
        ${descripcion || ''}, 
        ${precio}, 
        ${precio_costo || 0}, 
        ${stock || 0}, 
        ${stock_minimo || 0}, 
        ${categoria_id || null}, 
        ${marca_id || null}, 
        ${sku || null}, 
        ${imagen_url || null}
      )
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating producto:", error);
    return Response.json({ error: error.message || "Error creating producto" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      nombre,
      descripcion,
      precio,
      precio_costo,
      stock,
      stock_minimo,
      categoria_id,
      marca_id,
      sku,
      imagen_url,
      activo
    } = body;

    const result = await sql`
      UPDATE productos
      SET
        nombre = ${nombre},
        descripcion = ${descripcion},
        precio = ${precio},
        precio_costo = ${precio_costo},
        stock = ${stock},
        stock_minimo = ${stock_minimo},
        categoria_id = ${categoria_id},
        marca_id = ${marca_id},
        sku = ${sku},
        imagen_url = ${imagen_url},
        activo = ${activo},
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating producto:", error);
    return Response.json({ error: "Error updating producto" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID required" }, { status: 400 });
    }

    // Soft delete
    const result = await sql`
      UPDATE productos
      SET activo = false, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id
    `;

    return Response.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error("Error deleting producto:", error);
    return Response.json({ error: "Error deleting producto" }, { status: 500 });
  }
}
