import { query } from "@/lib/db";

export async function GET() {
  try {
    const [ventasHoyRes, productosStockRes, ventasMesRes, topProductosRes, salesHistoryRes] =
      await Promise.all([
        query(`
        SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as monto
        FROM ventas 
        WHERE DATE(fecha) = CURRENT_DATE AND estado = 'completada'
      `),
        query(`
        SELECT COUNT(DISTINCT p.id) as total
        FROM productos p
        JOIN inventario i ON p.id = i.producto_id
        WHERE i.cantidad_disponible <= i.cantidad_minima AND p.activo = true
      `),
        query(`
        SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as monto
        FROM ventas 
        WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND estado = 'completada'
      `),
        query(`
        SELECT p.nombre, SUM(dv.cantidad) as vendidos
        FROM detalles_venta dv
        JOIN productos p ON dv.producto_id = p.id
        JOIN ventas v ON dv.venta_id = v.id
        WHERE v.estado = 'completada'
        AND DATE(v.fecha) >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY p.id, p.nombre
        ORDER BY vendidos DESC
        LIMIT 5
      `),
        query(`
        SELECT TO_CHAR(DATE(fecha), 'YYYY-MM-DD') as fecha, SUM(total) as monto, COUNT(*) as cantidad
        FROM ventas 
        WHERE fecha >= CURRENT_DATE - INTERVAL '6 days'
        AND estado = 'completada'
        GROUP BY DATE(fecha)
        ORDER BY DATE(fecha) ASC
      `),
      ]);

    const ventasHoy = ventasHoyRes.rows[0];
    const productosStock = productosStockRes.rows[0];
    const ventasMes = ventasMesRes.rows[0];
    const topProductos = topProductosRes.rows;
    const salesHistory = salesHistoryRes.rows;

    return Response.json({
      ventasHoy: {
        total: parseInt(ventasHoy.total),
        monto: parseFloat(ventasHoy.monto),
      },
      productosStock: parseInt(productosStock.total),
      ventasMes: {
        total: parseInt(ventasMes.total),
        monto: parseFloat(ventasMes.monto),
      },
      topProductos,
      salesHistory,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return Response.json(
      { error: "Error fetching dashboard data" },
      { status: 500 },
    );
  }
}
