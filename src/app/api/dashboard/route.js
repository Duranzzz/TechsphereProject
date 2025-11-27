import { sql } from "@/app/api/utils/sql";

export async function GET() {
  try {
    const [ventasHoy, productosStock, ventasMes, topProductos, salesHistory] =
      await sql.transaction(async (tx) => {
        return await Promise.all([
          tx`
        SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as monto
        FROM ventas 
        WHERE DATE(fecha) = CURRENT_DATE AND estado = 'completada'
      `,
          tx`
        SELECT COUNT(*) as total
        FROM productos 
        WHERE stock <= stock_minimo AND activo = true
      `,
          tx`
        SELECT COUNT(*) as total, COALESCE(SUM(total), 0) as monto
        FROM ventas 
        WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND estado = 'completada'
      `,
          tx`
        SELECT p.nombre, SUM(dv.cantidad) as vendidos
        FROM detalles_venta dv
        JOIN productos p ON dv.producto_id = p.id
        JOIN ventas v ON dv.venta_id = v.id
        WHERE v.estado = 'completada'
        AND DATE(v.fecha) >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY p.id, p.nombre
        ORDER BY vendidos DESC
        LIMIT 5
      `,
          tx`
        SELECT TO_CHAR(DATE(fecha), 'YYYY-MM-DD') as fecha, SUM(total) as monto, COUNT(*) as cantidad
        FROM ventas 
        WHERE fecha >= CURRENT_DATE - INTERVAL '6 days'
        AND estado = 'completada'
        GROUP BY DATE(fecha)
        ORDER BY DATE(fecha) ASC
      `,
        ]);
      });

    return Response.json({
      ventasHoy: {
        total: parseInt(ventasHoy[0].total),
        monto: parseFloat(ventasHoy[0].monto),
      },
      productosStock: parseInt(productosStock[0].total),
      ventasMes: {
        total: parseInt(ventasMes[0].total),
        monto: parseFloat(ventasMes[0].monto),
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
