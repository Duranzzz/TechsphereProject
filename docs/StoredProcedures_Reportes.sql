-- ========================================================
-- PROCEDIMIENTOS ALMACENADOS PARA REPORTES Y CONSULTAS COMUNES
-- Basado en ArquitecturaDB.sql
-- ========================================================

-- Borrar versiones anteriores para permitir cambios de tipos de datos
DROP FUNCTION IF EXISTS public.obtener_info_producto_completa(INTEGER);
DROP FUNCTION IF EXISTS public.listar_usuarios_completo(VARCHAR);
DROP FUNCTION IF EXISTS public.reporte_ventas_periodo(TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.kardex_producto_detalle(INTEGER);

-- 1. OBTENER INFORMACIÓN DETALLADA DE PRODUCTO
-- Retorna info del producto + categoría + marca + stock total + rating promedio
-- Útil para: Ficha de producto en frontend, listas de catálogo
CREATE OR REPLACE FUNCTION public.obtener_info_producto_completa(p_producto_id INTEGER DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    nombre VARCHAR,
    sku VARCHAR,
    precio NUMERIC,
    categoria VARCHAR,
    marca VARCHAR,
    stock_total BIGINT,
    rating_promedio NUMERIC,
    total_reviews BIGINT,
    activo BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nombre,
        p.sku,
        p.precio,
        c.nombre AS categoria,
        m.nombre AS marca,
        COALESCE(SUM(i.cantidad_disponible), 0) AS stock_total,
        ROUND(COALESCE(AVG(r.calificacion), 0), 2) AS rating_promedio,
        COUNT(r.id) AS total_reviews,
        p.activo
    FROM public.productos p
    LEFT JOIN public.categorias c ON p.categoria_id = c.id
    LEFT JOIN public.marcas m ON p.marca_id = m.id
    LEFT JOIN public.inventario i ON p.id = i.producto_id
    LEFT JOIN public.reviews r ON p.id = r.producto_id
    WHERE (p_producto_id IS NULL OR p.id = p_producto_id)
    GROUP BY p.id, c.nombre, m.nombre
    ORDER BY p.nombre ASC;
END;
$$ LANGUAGE plpgsql;

-- 2. LISTAR USUARIOS CON INFO EXTENDIDA
-- Retorna usuarios unificando datos de Clientes y Empleados
-- Útil para: Panel de administración de usuarios, login
CREATE OR REPLACE FUNCTION public.listar_usuarios_completo(p_rol VARCHAR DEFAULT NULL)
RETURNS TABLE (
    user_id INTEGER,
    email VARCHAR,
    rol VARCHAR,
    nombre_completo TEXT,
    telefono VARCHAR,
    tipo_entidad TEXT, -- 'cliente' o 'empleado'
    estado_entidad BOOLEAN,
    fecha_registro TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id AS user_id,
        u.email,
        u.rol,
        COALESCE(c.nombre || ' ' || COALESCE(c.apellido, ''), e.nombre || ' ' || COALESCE(e.apellido, ''), u.nombre) AS nombre_completo,
        COALESCE(c.telefono, e.telefono) AS telefono,
        CASE 
            WHEN c.id IS NOT NULL THEN 'cliente'
            WHEN e.id IS NOT NULL THEN 'empleado'
            ELSE 'usuario_base'
        END AS tipo_entidad,
        COALESCE(c.activo, e.activo, TRUE) AS estado_entidad,
        u.created_at AS fecha_registro
    FROM public.users u
    LEFT JOIN public.clientes c ON u.id = c.user_id
    LEFT JOIN public.empleados e ON u.id = e.user_id
    WHERE (p_rol IS NULL OR u.rol = p_rol)
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. REPORTE DE VENTAS POR PERIODO
-- Retorna historial de ventas con nombres legibles
-- Útil para: Dashboard de ventas, reportes mensuales
CREATE OR REPLACE FUNCTION public.reporte_ventas_periodo(p_fecha_inicio TIMESTAMPTZ, p_fecha_fin TIMESTAMPTZ)
RETURNS TABLE (
    codigo_venta VARCHAR,
    fecha TIMESTAMPTZ,
    cliente_nombre TEXT,
    empleado_nombre TEXT,
    total NUMERIC,
    estado VARCHAR,
    metodo_pago VARCHAR,
    items_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.codigo_venta,
        v.fecha,
        c.nombre || ' ' || COALESCE(c.apellido, '') AS cliente_nombre,
        COALESCE(e.nombre || ' ' || COALESCE(e.apellido, ''), 'Venta Online') AS empleado_nombre,
        v.total,
        v.estado,
        mp.nombre AS metodo_pago,
        COUNT(dv.id) AS items_count
    FROM public.ventas v
    LEFT JOIN public.clientes c ON v.cliente_id = c.id
    LEFT JOIN public.empleados e ON v.empleado_id = e.id
    LEFT JOIN public.metodos_pago mp ON v.metodo_pago_id = mp.id
    LEFT JOIN public.detalles_venta dv ON v.id = dv.venta_id
    WHERE v.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY v.id, c.nombre, c.apellido, e.nombre, e.apellido, mp.nombre
    ORDER BY v.fecha DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. KARDEX DETALLADO POR PRODUCTO
-- Muestra el historial de movimientos de un producto con ubicación
-- Útil para: Auditoría de inventario, tracking de stock
CREATE OR REPLACE FUNCTION public.kardex_producto_detalle(p_producto_id INTEGER)
RETURNS TABLE (
    fecha TIMESTAMPTZ,
    ubicacion VARCHAR,
    tipo_movimiento character varying(20),
    cantidad INTEGER,
    saldo_anterior INTEGER,
    saldo_actual INTEGER,
    observacion TEXT,
    referencia TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        k.fecha,
        u.nombre AS ubicacion,
        k.tipo_movimiento,
        k.cantidad,
        k.saldo_anterior,
        k.saldo_actual,
        k.observacion,
        k.referencia_tabla || ' #' || k.referencia_id AS referencia
    FROM public.kardex k
    JOIN public.ubicaciones u ON k.ubicacion_id = u.id
    WHERE k.producto_id = p_producto_id
    ORDER BY k.fecha DESC;
END;
$$ LANGUAGE plpgsql;
