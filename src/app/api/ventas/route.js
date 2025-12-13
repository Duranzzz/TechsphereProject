// API Ventas - POST /api/ventas
// Proceso de venta transaccional con triggers automáticos (stock, garantía, envío, kardex)

import { pool } from "@/lib/db";

export async function POST(request) {
  const client = await pool.connect(); // Obtener conexión del pool
  try {
    const body = await request.json();
    const { cliente, productos, empleado_id, metodo_pago, direccion_id } = body;

    // Validar datos requeridos
    if (!cliente || !productos || productos.length === 0 || !direccion_id) {
      return Response.json(
        { error: "Faltan datos requeridos (Cliente, Productos o Dirección)" },
        { status: 400 }
      );
    }

    await client.query('BEGIN'); // Iniciar transacción

    // 1. Manejar cliente - buscar existente o crear nuevo
    let clienteId = null;

    if (cliente.id) {
      clienteId = cliente.id;
    } else if (cliente.email) {
      // Buscar por email
      const existingClient = await client.query(`
         SELECT c.id 
         FROM clientes c 
         JOIN users u ON c.user_id = u.id 
         WHERE u.email = $1
       `, [cliente.email]);
      if (existingClient.rows.length > 0) clienteId = existingClient.rows[0].id;
    }

    // Crear cliente nuevo si no existe
    if (!clienteId) {
      const email = cliente.email || `cliente_${Date.now()}@system.local`;
      const userRes = await client.query(`
         INSERT INTO users (nombre, email, password, rol)
         VALUES ($1, $2, $3, 'cliente')
         RETURNING id
       `, [cliente.nombre, email, '$argon2id$v=19$m=65536,t=3,p=4$dummyhash$dummyhash']); // Password dummy para clientes del sistema
      const userId = userRes.rows[0].id;

      let direccionId = null;
      if (cliente.direccion) {
        const dirRes = await client.query(`
             INSERT INTO direcciones (calle, ciudad, codigo_postal, pais)
             VALUES ($1, 'Unknown', '0000', 'Unknown')
             RETURNING id
          `, [cliente.direccion]);
        direccionId = dirRes.rows[0].id;
      }

      const newClient = await client.query(`
         INSERT INTO clientes (user_id, nombre, apellido, telefono, direccion_id, tipo)
         VALUES ($1, $2, $3, $4, $5, 'consumidor_final')
         RETURNING id
       `, [userId, cliente.nombre, cliente.apellido || '', cliente.telefono || null, direccionId]);
      clienteId = newClient.rows[0].id;
    }

    // 2. Procesar productos - calcular subtotal
    let subtotal = 0;
    const detalles = [];

    for (const item of productos) {
      const cantidad = Number(item.cantidad);
      const prodRes = await client.query('SELECT precio FROM productos WHERE id = $1', [item.id]);
      const precio = Number(prodRes.rows[0].precio);
      const itemSubtotal = precio * cantidad;
      subtotal += itemSubtotal;

      detalles.push({
        producto_id: item.id,
        cantidad: cantidad,
        precio_unitario: precio,
        subtotal: itemSubtotal
        // ubicacion_id: NULL (el trigger lo asignará automáticamente)
      });
    }

    // 3. Buscar método de pago por nombre
    let metodo_pago_id = null;
    if (metodo_pago) {
      const metodoPagoRes = await client.query(`
        SELECT id FROM metodos_pago WHERE nombre = $1
      `, [metodo_pago === 'tarjeta' ? 'Tarjeta de Crédito' : (metodo_pago === 'efectivo' ? 'Efectivo' : 'Tarjeta de Crédito')]);
      metodo_pago_id = metodoPagoRes.rows.length > 0 ? metodoPagoRes.rows[0].id : null;
    }

    // 4. Crear venta (cabecera)
    const impuestos = subtotal * 0.13; // 13% IT en Bolivia
    const total = subtotal + impuestos;

    const ventaRes = await client.query(`
      INSERT INTO ventas (cliente_id, empleado_id, subtotal, impuestos, total, metodo_pago_id, direccion_id, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'completada')
      RETURNING id, codigo_venta
    `, [clienteId, empleado_id || null, subtotal, impuestos, total, metodo_pago_id, direccion_id]);

    const ventaId = ventaRes.rows[0].id;
    const codigoVenta = ventaRes.rows[0].codigo_venta;

    // 5. Insertar detalles - TRIGGERS SE EJECUTAN AUTOMÁTICAMENTE:
    // • restar_stock_venta() → Descuenta stock de ubicación con más disponible
    // • procesar_kardex_automatico() → Registra movimiento en kardex
    // • crear_garantia_auto() → Genera garantía por cada producto
    for (const detalle of detalles) {
      await client.query(`
        INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)
      `, [ventaId, detalle.producto_id, detalle.cantidad, detalle.precio_unitario]);
    }

    // 6. El trigger crear_envio_automatico() crea el envío automáticamente al insertar venta

    await client.query('COMMIT'); // Confirmar transacción

    return Response.json({
      success: true,
      venta_id: ventaId,
      codigo_venta: codigoVenta,
      total: total
    }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK'); // Revertir si hay error
    console.error("Error creating venta:", error);
    return Response.json({ error: error.message || "Error creating venta" }, { status: 500 });
  } finally {
    client.release(); // Liberar conexión al pool
  }
}

// GET - Listar ventas recientes con datos de cliente y empleado
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";

    const result = await pool.query(`
      SELECT 
        v.*,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        e.nombre as empleado_nombre,
        m.nombre as metodo_pago_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN empleados e ON v.empleado_id = e.id
      LEFT JOIN metodos_pago m ON v.metodo_pago_id = m.id
      ORDER BY v.fecha DESC
      LIMIT $1
    `, [limit]);

    return Response.json(result.rows);
  } catch (error) {
    console.error("Error fetching ventas:", error);
    return Response.json({ error: "Error fetching ventas" }, { status: 500 });
  }
}
