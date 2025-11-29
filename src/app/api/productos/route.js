import { query } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");
    const marca = searchParams.get("marca");
    const search = searchParams.get("search");

    let sql = `
      SELECT p.*, c.nombre as categoria_nombre, m.nombre as marca_nombre,
             COALESCE(SUM(i.cantidad_disponible), 0) as stock,
             COALESCE(MAX(i.cantidad_minima), 0) as stock_minimo
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN marcas m ON p.marca_id = m.id
      LEFT JOIN inventario i ON p.id = i.producto_id
      WHERE p.activo = true
    `;
    const params = [];
    let paramCount = 0;

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

    sql += ` GROUP BY p.id, c.nombre, m.nombre ORDER BY p.nombre`;

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
      stock_minimo,
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
      INSERT INTO productos (nombre, descripcion, precio, precio_costo, categoria_id, marca_id, sku, imagen_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      nombre,
      descripcion || '',
      precio,
      precio_costo || 0,
      categoria_id || null,
      marca_id || null,
      sku || null,
      imagen_url || null
    ]);

    const newProduct = productRes.rows[0];

    // Insert inventory for default location (assuming ID 1 exists, if not we should create it or handle error)
    // We'll try to get the first location ID
    const locRes = await query('SELECT id FROM ubicaciones LIMIT 1');
    const locationId = locRes.rows.length > 0 ? locRes.rows[0].id : 1;

    await query(`
      INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible, cantidad_minima)
      VALUES ($1, $2, $3, $4)
    `, [newProduct.id, locationId, stock || 0, stock_minimo || 0]);

    return Response.json({ ...newProduct, stock, stock_minimo });
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
        fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $10
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
      id
    ]);

    // Update inventory (simplification: update all locations or just the first one found)
    // We'll update the inventory for the first location found for this product, or insert if not exists
    const locRes = await query('SELECT id FROM ubicaciones LIMIT 1');
    const locationId = locRes.rows.length > 0 ? locRes.rows[0].id : 1;

    // Check if inventory exists
    const invCheck = await query('SELECT id FROM inventario WHERE producto_id = $1 AND ubicacion_id = $2', [id, locationId]);

    if (invCheck.rows.length > 0) {
      await query(`
            UPDATE inventario 
            SET cantidad_disponible = $1, cantidad_minima = $2
            WHERE producto_id = $3 AND ubicacion_id = $4
        `, [stock, stock_minimo, id, locationId]);
    } else {
      await query(`
            INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible, cantidad_minima)
            VALUES ($1, $2, $3, $4)
        `, [id, locationId, stock, stock_minimo]);
    }

    return Response.json({ ...productRes.rows[0], stock, stock_minimo });
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
      SET activo = false, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `, [id]);

    return Response.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error deleting producto:", error);
    return Response.json({ error: "Error deleting producto" }, { status: 500 });
  }
}
