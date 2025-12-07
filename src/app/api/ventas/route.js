import { pool } from "@/lib/db";

export async function POST(request) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { cliente, productos, empleado_id, metodo_pago } = body;

    if (!cliente || !productos || productos.length === 0) {
      return Response.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // 1. Handle Client
    let clienteId = null;

    if (cliente.id) {
      clienteId = cliente.id;
    } else if (cliente.email) {
      // Check if client exists by email (Fallback/Legacy)
      const existingClient = await client.query(`
        SELECT c.id 
        FROM clientes c 
        JOIN users u ON c.user_id = u.id 
        WHERE u.email = $1
      `, [cliente.email]);
      if (existingClient.rows.length > 0) {
        clienteId = existingClient.rows[0].id;
      }
    }

    // If still not found and no ID provided, try to create new client (Legacy/Fallback)
    if (!clienteId) {
      // ... existing creation logic if needed for other flows ...
      // For this refactor, we strongly encourage sending ID. 
      // If we really want to keep the "new client" feature working for other parts, we keep it.
      // But current requirement implies selection only.
      // Let's keep the creation logic wrapped in a check just in case, or simplify if the user wants STRICT selection.
      // "solo se tienen que seleccionar el cliente cuyos datos ya se tienen... y tampoco seleccionar un vendedor"

      // If we strictly follow "solo se tienen que seleccionar", maybe we should error if no ID?
      // But existing code supports creation. Let's keep it safe but prioritize ID.

      const email = cliente.email || `cliente_${Date.now()}@system.local`;
      const userRes = await client.query(`
        INSERT INTO users (nombre, email, password, rol)
        VALUES ($1, $2, $3, 'cliente')
        RETURNING id
      `, [cliente.nombre, email, '$argon2id$v=19$m=65536,t=3,p=4$dummyhash$dummyhash']);

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

    // 2. Calculate Totals and Check Stock
    let subtotal = 0;
    const detalles = [];
    const locationId = 1; // Default location

    for (const item of productos) {
      // Check stock in inventory
      const invRes = await client.query(`
        SELECT cantidad_disponible, cantidad_minima 
        FROM inventario 
        WHERE producto_id = $1 AND ubicacion_id = $2
      `, [item.id, locationId]);

      const stock = invRes.rows.length > 0 ? invRes.rows[0].cantidad_disponible : 0;
      const cantidad = Number(item.cantidad);

      if (stock < cantidad) {
        throw new Error(`Stock insuficiente para producto ${item.id}`);
      }

      // Get price
      const prodRes = await client.query('SELECT precio FROM productos WHERE id = $1', [item.id]);
      const precio = Number(prodRes.rows[0].precio);
      const itemSubtotal = precio * cantidad;
      subtotal += itemSubtotal;

      detalles.push({
        producto_id: item.id,
        cantidad: cantidad,
        precio_unitario: precio,
        subtotal: itemSubtotal
      });

      // Update Stock
      await client.query(`
        UPDATE inventario 
        SET cantidad_disponible = cantidad_disponible - $1
        WHERE producto_id = $2 AND ubicacion_id = $3
      `, [cantidad, item.id, locationId]);
    }

    const impuestos = subtotal * 0.0;
    const total = subtotal + impuestos;

    // Get Payment Method ID
    let metodoPagoId = null;
    if (metodo_pago) {
      // Try to find by name if string, or use as ID
      if (typeof metodo_pago === 'string' && isNaN(metodo_pago)) {
        const mpRes = await client.query('SELECT id FROM metodos_pago WHERE nombre ILIKE $1', [metodo_pago]);
        if (mpRes.rows.length > 0) metodoPagoId = mpRes.rows[0].id;
        else {
          // Create if not exists? Or default.
          const newMp = await client.query('INSERT INTO metodos_pago (nombre) VALUES ($1) RETURNING id', [metodo_pago]);
          metodoPagoId = newMp.rows[0].id;
        }
      } else {
        metodoPagoId = metodo_pago;
      }
    } else {
      // Default to 'Efectivo'
      const mpRes = await client.query("SELECT id FROM metodos_pago WHERE nombre = 'Efectivo'");
      if (mpRes.rows.length > 0) metodoPagoId = mpRes.rows[0].id;
    }

    // 3. Insert Sale
    const nuevaVenta = await client.query(`
      INSERT INTO ventas (
        cliente_id, 
        empleado_id, 
        subtotal, 
        impuestos, 
        total, 
        metodo_pago_id, 
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'completada')
      RETURNING id
    `, [clienteId, empleado_id || null, subtotal, impuestos, total, metodoPagoId]);

    const ventaId = nuevaVenta.rows[0].id;

    // Insert Details
    for (const detalle of detalles) {
      await client.query(`
        INSERT INTO detalles_venta (
          venta_id, 
          producto_id, 
          cantidad, 
          precio_unitario
        )
        VALUES ($1, $2, $3, $4)
      `, [ventaId, detalle.producto_id, detalle.cantidad, detalle.precio_unitario]);
    }

    await client.query('COMMIT');
    return Response.json({ success: true, data: { ventaId, total } });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error processing sale:", error);
    return Response.json(
      { error: error.message || "Error al procesar la venta" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
            SELECT v.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido, u.nombre as empleado_nombre
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            LEFT JOIN empleados e ON v.empleado_id = e.id
            LEFT JOIN users u ON e.user_id = u.id
            ORDER BY v.fecha DESC
            LIMIT 100
        `);
    return Response.json(result.rows);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Error fetching sales' }, { status: 500 });
  } finally {
    client.release();
  }
}
