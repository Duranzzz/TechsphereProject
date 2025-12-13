// API Productos - GET/POST/PUT/DELETE /api/productos
// CRUD completo con queries complejas y funciones SQL

import { query } from "@/lib/db";

// GET - Listar productos con filtros opcionales
// Params: ?categoria=1&marca=2&search=iphone&ubicacion_id=1
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");
    const marca = searchParams.get("marca");
    const search = searchParams.get("search");
    const ubicacion_id = searchParams.get("ubicacion_id");
    const params = [];

    // Query con 4 LEFT JOINs + agregaciones (SUM, AVG, COUNT)
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

    // Agregar ubicacion_id si existe
    if (ubicacion_id) {
      params.push(ubicacion_id);
    }

    let paramCount = params.length;

    // Filtros dinámicos (solo agregan si existen)
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
      params.push(`%${search}%`);  // Búsqueda parcial
    }

    // GROUP BY requerido por agregaciones, ORDER BY prioriza con stock
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

// POST - Crear producto usando función SQL
export async function POST(request) {
  try {
    const body = await request.json();
    const {
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

    if (!nombre || !precio) {
      return Response.json({ error: "Nombre y precio son requeridos" }, { status: 400 });
    }

    // Llama a función almacenada crear_producto() (ver docs/03-SCRIPTS-SQL.md)
    const result = await query(`
      SELECT crear_producto($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) as id
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
      dias_garantia || 365,
      activo !== undefined ? activo : true
    ]);

    const productoId = result.rows[0].id;

    return Response.json({
      id: productoId,
      nombre,
      mensaje: 'Producto creado exitosamente'
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating producto:", error);
    return Response.json({ error: error.message || "Error creating producto" }, { status: 500 });
  }
}

// PUT - Actualizar producto usando función SQL
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

    // Llama a función almacenada actualizar_producto()
    await query(`
      SELECT actualizar_producto($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      id,
      nombre,
      descripcion,
      precio,
      precio_costo,
      categoria_id,
      marca_id,
      sku,
      imagen_url,
      cantidad_minima,
      dias_garantia,
      activo
    ]);

    return Response.json({
      id,
      mensaje: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error("Error updating producto:", error);
    return Response.json({ error: "Error updating producto" }, { status: 500 });
  }
}

// DELETE - Soft delete (marca activo = false)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "ID required" }, { status: 400 });
    }

    // No borra físicamente, solo desactiva
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
