import { sql } from "@/app/api/utils/sql";


export async function POST(request) {
  try {
    const body = await request.json();
    const { cliente, productos, empleado_id, metodo_pago } = body;

    if (!cliente || !productos || productos.length === 0) {
      return Response.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await sql.transaction(async (tx) => {
      // 1. Handle Client
      let clienteId = null;

      // Check if client exists by email (if provided)
      if (cliente.email) {
        const existingClient = await tx`
          SELECT id FROM clientes WHERE email = ${cliente.email}
        `;
        if (existingClient.length > 0) {
          clienteId = existingClient[0].id;
        }
      }

      // If not found or no email, create new client
      if (!clienteId) {
        // If we don't have email but have name, we still create a client
        // For "Consumer Final" with no data, we might want a generic client, 
        // but here we assume data is passed or we create a new one.
        const newClient = await tx`
          INSERT INTO clientes (nombre, apellido, email, telefono, direccion, tipo)
          VALUES (
            ${cliente.nombre}, 
            ${cliente.apellido || ''}, 
            ${cliente.email || null}, 
            ${cliente.telefono || null}, 
            ${cliente.direccion || null},
            'consumidor_final'
          )
          RETURNING id
        `;
        clienteId = newClient[0].id;
      }

      // 2. Calculate Totals
      let subtotal = 0;
      const detalles = [];

      for (const item of productos) {
        // Verify price and stock (optional but recommended)
        // For now we trust the frontend price or fetch it? 
        // Better to fetch current price to avoid tampering, but for this demo we use passed price or fetch.
        // Let's fetch to be safe and get stock.
        const productData = await tx`
          SELECT precio, stock FROM productos WHERE id = ${item.id}
        `;

        if (productData.length === 0) {
          throw new Error(`Producto ${item.id} no encontrado`);
        }

        const precio = Number(productData[0].precio);
        const cantidad = Number(item.cantidad);

        if (productData[0].stock < cantidad) {
          throw new Error(`Stock insuficiente para producto ${item.id}`);
        }

        const itemSubtotal = precio * cantidad;
        subtotal += itemSubtotal;

        detalles.push({
          producto_id: item.id,
          cantidad: cantidad,
          precio_unitario: precio,
          subtotal: itemSubtotal
        });

        // 4. Update Stock
        await tx`
          UPDATE productos 
          SET stock = stock - ${cantidad}
          WHERE id = ${item.id}
        `;
      }

      const impuestos = subtotal * 0.0; // 0% tax for now or configurable
      const total = subtotal + impuestos;

      // 3. Insert Sale
      const nuevaVenta = await tx`
        INSERT INTO ventas (
          cliente_id, 
          empleado_id, 
          subtotal, 
          impuestos, 
          total, 
          metodo_pago, 
          estado
        )
        VALUES (
          ${clienteId}, 
          ${empleado_id || null}, 
          ${subtotal}, 
          ${impuestos}, 
          ${total}, 
          ${metodo_pago || 'efectivo'}, 
          'completada'
        )
        RETURNING id
      `;

      const ventaId = nuevaVenta[0].id;

      // Insert Details
      for (const detalle of detalles) {
        await tx`
          INSERT INTO detalles_venta (
            venta_id, 
            producto_id, 
            cantidad, 
            precio_unitario
          )
          VALUES (
            ${ventaId}, 
            ${detalle.producto_id}, 
            ${detalle.cantidad}, 
            ${detalle.precio_unitario}
          )
        `;
      }

      return { ventaId, total };
    });

    return Response.json({ success: true, data: result });

  } catch (error) {
    console.error("Error processing sale:", error);
    return Response.json(
      { error: error.message || "Error al procesar la venta" },
      { status: 500 }
    );
  }
}
