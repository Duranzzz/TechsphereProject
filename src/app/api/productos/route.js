import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");
    const marca = searchParams.get("marca");
    const search = searchParams.get("search");
    const ubicacion_id = searchParams.get("ubicacion_id");
    const params = [];

    let sql = `
      SELECT p.*, c.nombre as categoria_nombre, m.nombre as marca_nombre,
             COALESCE(SUM(i.cantidad_disponible), 0) as stock,
             p.cantidad_minima,
             p.dias_garantia,
             COALESCE(AVG(r.calificacion), 0) as rating_promedio,
             COUNT(r.id) as total_reviews
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN inventario i ON p.id = i.producto_id ${ubicacion_id ? `AND i.ubicacion_id = $${params.length + 1}` : ''}
      LEFT JOIN reviews r ON p.id = r.producto_id
      WHERE p.activo = true
    `;

    if (ubicacion_id) {
      params.push(ubicacion_id);
    }

    let paramCount = params.length;

    if (categoria) {
      paramCount++;
      sql += ` AND p.categoria_id = $${paramCount}`;
      params.push(categoria);
    }

    if (marca) {
      paramCount++;
      sql += ` AND p.marca_id = $${paramCount}`;
      params.push(marca);
    }

    if (search) {
      paramCount++;
      sql += ` AND (LOWER(p.nombre) LIKE LOWER($${paramCount}) OR LOWER(p.descripcion) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    sql += ` GROUP BY p.id, c.nombre, m.nombre ORDER BY (COALESCE(SUM(i.cantidad_disponible), 0) > 0) DESC, p.nombre ASC`;

    const result = await query(sql, params);
    return Response.json(result.rows);
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
      cantidad_minima,
      dias_garantia,
      categoria_id,
      marca_id,
      sku,
      imagen_url,
    } = body;

    if (!nombre || !precio) {
      return Response.json({ error: "Nombre y precio son requeridos" }, { status: 400 });
    }

    // Insert product
    const productRes = await query(`
      INSERT INTO productos (nombre, descripcion, precio, precio_costo, categoria_id, marca_id, sku, imagen_url, cantidad_minima, dias_garantia)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      nombre,
      descripcion || '',
      precio,
      precio_costo || 0,
      categoria_id || null,
      marca_id || null,
      sku || null,
      imagen_url || null,
      cantidad_minima || 5,
      dias_garantia || 365
    ]);

    const newProduct = productRes.rows[0];

    return Response.json({ ...newProduct, stock: 0, cantidad_minima, dias_garantia });
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
      cantidad_minima,
      dias_garantia,
      categoria_id,
      marca_id,
      sku,
      imagen_url,
      activo
    } = body;

    const productRes = await query(`
      UPDATE productos
      SET
        nombre = $1,
        descripcion = $2,
        precio = $3,
        precio_costo = $4,
        categoria_id = $5,
        marca_id = $6,
        sku = $7,
        imagen_url = $8,
        activo = $9,
        cantidad_minima = $10,
        dias_garantia = $11
      WHERE id = $12
      RETURNING *
    `, [
      nombre,
      descripcion,
      precio,
      precio_costo,
      categoria_id,
      marca_id,
      sku,
      imagen_url,
      activo,
      cantidad_minima,
      dias_garantia,
      id
    ]);

    // Update inventory (simplification: update all locations or just the first one found)
    // We'll update the inventory for the first location found for this product, or insert if not exists
    const locRes = await query('SELECT id FROM ubicaciones LIMIT 1');
    const locationId = locRes.rows.length > 0 ? locRes.rows[0].id : 1;

    // Check if inventory exists
    const invCheck = await query('SELECT id FROM inventario WHERE producto_id = $1 AND ubicacion_id = $2', [id, locationId]);

    if (invCheck.rows.length > 0) {
      // Don't update stock on product edit, only metadata
      await query(`
            UPDATE inventario 
            SET cantidad_minima = $1
            WHERE producto_id = $2 AND ubicacion_id = $3
        `, [cantidad_minima, id, locationId]);
    } else {
      await query(`
            INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible, cantidad_minima)
            VALUES ($1, $2, 0, $3)
        `, [id, locationId, cantidad_minima]);
    }

    return Response.json({ ...productRes.rows[0], cantidad_minima, dias_garantia });
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
    const result = await query(`
      UPDATE productos
      SET activo = false
      WHERE id = $1
      RETURNING id
    `, [id]);

    return Response.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting producto:", error);
    return Response.json({ error: "Error deleting producto" }, { status: 500 });
  }
}
