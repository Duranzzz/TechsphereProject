-- FUNCIONES

CREATE OR REPLACE FUNCTION registrar_usuario_nuevo(
    p_nombre TEXT, 
    p_apellido TEXT,
    p_telefono TEXT,
    p_email TEXT, 
    p_password TEXT, 
    p_direccion JSONB
) RETURNS INTEGER AS $$
DECLARE
    v_user_id INTEGER;
    v_dir_id INTEGER;
    v_cliente_id INTEGER;
    v_pais TEXT;
    v_estado TEXT;
BEGIN
    v_pais := COALESCE(p_direccion->>'pais', 'Bolivia');
    v_estado := COALESCE(p_direccion->>'estado', 'Desconocido');

    -- 1. Insertar Dirección
    INSERT INTO direcciones (calle, ciudad, estado, pais) 
    VALUES (
        COALESCE(p_direccion->>'calle', 'Sin Condirección'), 
        COALESCE(p_direccion->>'ciudad', 'Desconocida'), 
        v_estado, 
        v_pais
    ) 
    RETURNING id INTO v_dir_id;

    -- 2. Insertar User
    INSERT INTO users (nombre, email, password, rol)
    VALUES (p_nombre, p_email, p_password, 'cliente')
    RETURNING id INTO v_user_id;

    -- 3. Insertar Cliente (SIN direccion_id)
    INSERT INTO clientes (user_id, nombre, apellido, telefono, tipo)
    VALUES (
        v_user_id, 
        p_nombre, 
        p_apellido,
        p_telefono,
        'consumidor_final'
    )
    RETURNING id INTO v_cliente_id;

    -- 4. Vincular Dirección (Aquí es donde realmente se unen)
    INSERT INTO cliente_direcciones (cliente_id, direccion_id, es_principal)
    VALUES (v_cliente_id, v_dir_id, true);

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;


-----------------------------------------------------------------
-- FUNCIONES DE PRODUCTOS
-----------------------------------------------------------------

-- Crear un nuevo producto
CREATE OR REPLACE FUNCTION crear_producto(
    p_nombre VARCHAR(200),
    p_descripcion TEXT,
    p_precio NUMERIC(10,2),
    p_precio_costo NUMERIC(10,2),
    p_categoria_id INTEGER,
    p_marca_id INTEGER,
    p_sku VARCHAR(50),
    p_imagen_url TEXT,
    p_cantidad_minima INTEGER,
    p_dias_garantia INTEGER,
    p_activo BOOLEAN DEFAULT TRUE
) RETURNS INTEGER AS $$
DECLARE
    v_producto_id INTEGER;
BEGIN
    INSERT INTO productos (
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
    )
    VALUES (
        p_nombre, 
        p_descripcion, 
        p_precio, 
        p_precio_costo, 
        p_categoria_id, 
        p_marca_id, 
        p_sku, 
        p_imagen_url, 
        COALESCE(p_cantidad_minima, 5),
        COALESCE(p_dias_garantia, 365),
        p_activo
    )
    RETURNING id INTO v_producto_id;
    
    RETURN v_producto_id;
END;
$$ LANGUAGE plpgsql;

-- Actualizar un producto existente
CREATE OR REPLACE FUNCTION actualizar_producto(
    p_id INTEGER,
    p_nombre VARCHAR(200),
    p_descripcion TEXT,
    p_precio NUMERIC(10,2),
    p_precio_costo NUMERIC(10,2),
    p_categoria_id INTEGER,
    p_marca_id INTEGER,
    p_sku VARCHAR(50),
    p_imagen_url TEXT,
    p_cantidad_minima INTEGER,
    p_dias_garantia INTEGER,
    p_activo BOOLEAN
) RETURNS VOID AS $$
BEGIN
    UPDATE productos
    SET 
        nombre = p_nombre,
        descripcion = p_descripcion,
        precio = p_precio,
        precio_costo = p_precio_costo,
        categoria_id = p_categoria_id,
        marca_id = p_marca_id,
        sku = p_sku,
        imagen_url = p_imagen_url,
        cantidad_minima = p_cantidad_minima,
        dias_garantia = p_dias_garantia,
        activo = p_activo
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;




-- TRIGGERS

-----------------------------------------------------------------

CREATE OR REPLACE FUNCTION procesar_kardex_automatico()
RETURNS TRIGGER AS $$
DECLARE
    diferencia INTEGER;
    tipo_mov TEXT;
    ref_tabla TEXT := 'ajuste_manual';
    v_saldo_anterior INTEGER;
    v_saldo_actual INTEGER;
BEGIN
    -- CASO 1: INSERT (Stock Inicial)
    IF (TG_OP = 'INSERT') THEN
        diferencia := NEW.cantidad_disponible;
        v_saldo_anterior := 0;
        v_saldo_actual := NEW.cantidad_disponible;
        tipo_mov := 'entrada_inicial'; -- O 'compra' si prefieres
        
        IF diferencia > 0 THEN
            INSERT INTO kardex (
                producto_id, ubicacion_id, tipo_movimiento, cantidad,
                saldo_anterior, saldo_actual, referencia_tabla, observacion, fecha
            ) VALUES (
                NEW.producto_id, NEW.ubicacion_id, tipo_mov, diferencia,
                v_saldo_anterior, v_saldo_actual, 'inventario', 'Stock Inicial', NOW()
            );
        END IF;
        RETURN NEW;
    END IF;

    -- CASO 2: UPDATE (Cambio de Stock)
    IF (TG_OP = 'UPDATE') THEN
        diferencia := NEW.cantidad_disponible - OLD.cantidad_disponible;
        v_saldo_anterior := OLD.cantidad_disponible;
        v_saldo_actual := NEW.cantidad_disponible;

        -- Si no hubo cambio real, salir
        IF diferencia = 0 THEN RETURN NEW; END IF;

        -- Determinar tipo
        IF diferencia > 0 THEN 
            tipo_mov := 'entrada';
        ELSE 
            tipo_mov := 'salida';
            diferencia := ABS(diferencia);
        END IF;

        INSERT INTO kardex (
            producto_id, ubicacion_id, tipo_movimiento, cantidad,
            saldo_anterior, saldo_actual, referencia_tabla, observacion, fecha
        ) VALUES (
            NEW.producto_id, NEW.ubicacion_id, tipo_mov, diferencia,
            v_saldo_anterior, v_saldo_actual, ref_tabla, 'Movimiento automático', NOW()
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger aplicado a AMBOS eventos
DROP TRIGGER IF EXISTS trg_auto_kardex ON inventario;
CREATE TRIGGER trg_auto_kardex
AFTER INSERT OR UPDATE ON inventario
FOR EACH ROW
EXECUTE FUNCTION procesar_kardex_automatico();


-----------------------------------------------------------------


CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   -- Lógica condicional estricta para evitar errores de columna inexistente
   IF (TG_TABLE_NAME = 'inventario') THEN
      NEW.ultima_actualizacion = NOW();
   ELSIF (TG_TABLE_NAME = 'productos') THEN
      NEW.fecha_actualizacion = NOW();
   ELSE
      NEW.updated_at = NOW();
   END IF;
   
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Bucle de creación de triggers para TODAS las tablas solicitadas
DO $$
DECLARE
    t text;
    tablas text[] := ARRAY['users', 'clientes', 'categorias', 'marcas', 'empleados', 'cliente_direcciones', 'direcciones', 'metodos_pago', 'productos', 'inventario'];
BEGIN
    FOREACH t IN ARRAY tablas
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_upd_%s ON %I', t, t);
        EXECUTE format('CREATE TRIGGER trg_upd_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_timestamp_column()', t, t);
    END LOOP;
END;
$$;


-----------------------------------------------------------------


CREATE OR REPLACE FUNCTION crear_envio_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Ahora es directo: Obtenemos la dirección de la propia venta
    -- (Solo creamos envío si la venta tiene dirección asignada)
    IF NEW.direccion_id IS NOT NULL THEN
        INSERT INTO envios (venta_id, direccion_id, estado, costo)
        VALUES (NEW.id, NEW.direccion_id, 'entregado', 50.00);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- El trigger sigue igual
DROP TRIGGER IF EXISTS trg_auto_envio ON ventas;
CREATE TRIGGER trg_auto_envio
AFTER INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION crear_envio_automatico();


-----------------------------------------------------------------


-- A. Trigger para VENTAS (Selecciona ubicación automática si no se especifica)
CREATE OR REPLACE FUNCTION restar_stock_venta()
RETURNS TRIGGER AS $$
DECLARE
    v_ubicacion_id INTEGER;
BEGIN
    -- Si no se especificó ubicación, seleccionar automáticamente la con más stock
    IF NEW.ubicacion_id IS NULL THEN
        SELECT ubicacion_id INTO v_ubicacion_id
        FROM inventario
        WHERE producto_id = NEW.producto_id
          AND cantidad_disponible >= NEW.cantidad
        ORDER BY cantidad_disponible DESC
        LIMIT 1;
        
        IF v_ubicacion_id IS NULL THEN
            RAISE EXCEPTION 'Stock insuficiente para producto ID % (se requieren % unidades)', NEW.producto_id, NEW.cantidad;
        END IF;
        
        -- Actualizar el registro con la ubicación seleccionada
        NEW.ubicacion_id = v_ubicacion_id;
    END IF;
    
    -- Descontar de la ubicación (ya sea especificada o auto-seleccionada)
    UPDATE inventario 
    SET cantidad_disponible = cantidad_disponible - NEW.cantidad,
        ultima_actualizacion = NOW()
    WHERE producto_id = NEW.producto_id 
      AND ubicacion_id = NEW.ubicacion_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo descontar stock para producto ID % en ubicación ID %', NEW.producto_id, NEW.ubicacion_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_movimiento_venta ON detalles_venta;
CREATE TRIGGER trg_movimiento_venta
BEFORE INSERT ON detalles_venta
FOR EACH ROW
EXECUTE FUNCTION restar_stock_venta();

-- B. Trigger para COMPRAS (Suma/Crea Stock)
CREATE OR REPLACE FUNCTION sumar_stock_compra()
RETURNS TRIGGER AS $$
DECLARE
    v_stock_min_def INTEGER;
    v_ubicacion_id INTEGER;
BEGIN
    -- Obtenemos la ubicación de la compra padre
    SELECT ubicacion_id INTO v_ubicacion_id 
    FROM compras 
    WHERE id = NEW.compra_id;

    -- Obtenemos el default definido en el producto
    SELECT cantidad_minima INTO v_stock_min_def 
    FROM productos WHERE id = NEW.producto_id;

    -- Upsert: Usamos COALESCE por si acaso es null
    INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible, cantidad_minima)
    VALUES (NEW.producto_id, v_ubicacion_id, NEW.cantidad, COALESCE(v_stock_min_def, 5))
    
    ON CONFLICT (producto_id, ubicacion_id) 
    DO UPDATE SET 
        cantidad_disponible = inventario.cantidad_disponible + NEW.cantidad,
        ultima_actualizacion = NOW();
        
    -- Actualizar costo
    UPDATE productos SET precio_costo = NEW.precio_unitario, fecha_actualizacion = NOW()
    WHERE id = NEW.producto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_movimiento_compra ON detalles_compra;
CREATE TRIGGER trg_movimiento_compra
AFTER INSERT ON detalles_compra
FOR EACH ROW
EXECUTE FUNCTION sumar_stock_compra();


-----------------------------------------------------------------


CREATE OR REPLACE FUNCTION crear_garantia_auto()
RETURNS TRIGGER AS $$
DECLARE
    v_dias INTEGER;
BEGIN
    -- 1. Buscamos cuántos días de garantía tiene el producto vendido
    SELECT dias_garantia INTO v_dias 
    FROM productos 
    WHERE id = NEW.producto_id;

    -- 2. Insertamos la garantía automáticamente
    -- (COALESCE asegura que si no tiene dato, le de 1 año por defecto)
    INSERT INTO garantias (detalle_venta_id, fecha_inicio, fecha_fin, estado)
    VALUES (
        NEW.id, 
        CURRENT_DATE, 
        CURRENT_DATE + (COALESCE(v_dias, 365) || ' days')::INTERVAL, 
        'activa'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se dispara al vender un producto
DROP TRIGGER IF EXISTS trg_auto_garantia ON detalles_venta;
CREATE TRIGGER trg_auto_garantia
AFTER INSERT ON detalles_venta
FOR EACH ROW
EXECUTE FUNCTION crear_garantia_auto();


CREATE OR REPLACE VIEW vista_garantias_estado AS
SELECT 
    g.*,
    CASE 
        WHEN g.fecha_fin < CURRENT_DATE THEN 'expirada'
        ELSE 'activa'
    END as estado_calculado
FROM garantias g;


-----------------------------------------------------------------