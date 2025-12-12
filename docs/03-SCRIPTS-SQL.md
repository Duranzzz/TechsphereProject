# 3. Scripts SQL - Documentación Técnica

## 3.1 Introducción

Este documento detalla todos los scripts SQL del proyecto TechSphere, organizados por tipo (DDL, DML, Funciones, Triggers) y explicando las decisiones técnicas detrás de cada implementación.

**Archivos de Base de Datos**:
- [`ArquitecturaDB.sql`](../ArquitecturaDB.sql) - DDL completo (300 líneas)
- [`Functions.sql`](../Functions.sql) - Funciones y Triggers (405 líneas)
- [`Inserts.sql`](../Inserts.sql) - Datos de prueba (408 líneas)

**SGBD**: PostgreSQL 15+ (Neon Serverless)

## 3.2 DDL (Data Definition Language)

### 3.2.1 Configuración Inicial

```sql
SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
```

**Propósito**: Garantizar comportamiento consistente de la base de datos.

### 3.2.2 Tablas de Catálogos

#### Direcciones

```sql
CREATE TABLE public.direcciones (
    id SERIAL PRIMARY KEY,
    calle VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    pais VARCHAR(100) DEFAULT 'Bolivia',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**Tipos de Datos Justificados**:
- `SERIAL`: Auto-incremento eficiente para PK
- `VARCHAR(255)`: Longitud estándar para direcciones
- `VARCHAR(100)`: Suficiente para nombres de ciudades/estados/países
- `TIMESTAMPTZ`: Incluye zona horaria (America/La_Paz)

**Constraint**: `DEFAULT 'Bolivia'` asume operaciones principalmente en Bolivia

#### Categorías

```sql
CREATE TABLE public.categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints**:
- `UNIQUE` en nombre: Previene categorías duplicadas
- `DEFAULT TRUE`: Nuevas categorías activas por defecto

#### Ubicaciones

```sql
CREATE TABLE public.ubicaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('tienda', 'almacen')),
    direccion_id INTEGER REFERENCES public.direcciones(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**CHECK Constraint**: Solo permite 'tienda' o 'almacen', validación a nivel de BD

### 3.2.3 Autenticación

#### Users (Tabla Central)

```sql
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente' 
        CHECK (rol IN ('admin', 'empleado', 'cliente', 'proveedor')),
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**Características de Seguridad**:
- `UNIQUE` en email: Un email = un usuario
- `TEXT` para password: Soporta hashes largos de Argon2 (+100 caracteres)
- `CHECK` en rol: Solo roles válidos

**Índice para Login Rápido**:
```sql
CREATE INDEX idx_users_email ON public.users(email);
```

### 3.2.4 Entidades Principales

#### Clientes

```sql
CREATE TABLE public.clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    telefono VARCHAR(20),
    tipo VARCHAR(20) DEFAULT 'consumidor_final' 
        CHECK (tipo IN ('consumidor_final', 'empresa')),
    fecha_registro TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    user_id INTEGER UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**ON DELETE CASCADE**: Si se elimina el user, se elimina el cliente (integridad)
**UNIQUE en user_id**: Un usuario solo puede ser un cliente

#### Cliente-Direcciones (N:M)

```sql
CREATE TABLE public.cliente_direcciones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    direccion_id INTEGER NOT NULL REFERENCES public.direcciones(id) ON DELETE CASCADE,
    alias VARCHAR(50),
    es_principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cliente_direcciones_unico UNIQUE (cliente_id, direccion_id)
);
```

**UNIQUE Constraint**: Previene que un cliente tenga la misma dirección duplicada

### 3.2.5 Productos e Inventario

#### Productos

```sql
CREATE TABLE public.productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    precio_costo NUMERIC(10,2),
    categoria_id INTEGER REFERENCES public.categorias(id),
    marca_id INTEGER REFERENCES public.marcas(id),
    sku VARCHAR(50) UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    imagen_url TEXT,
    cantidad_minima INTEGER DEFAULT 5,
    dias_garantia INTEGER DEFAULT 365,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**Tipo NUMERIC(10,2)**:
- 10 dígitos totales max: 99,999,999.99 (suficiente para precios)
- 2 decimales: Precisión monetaria
- Mejor que FLOAT/DOUBLE: Sin errores de redondeo

**SKU UNIQUE**: Código de producto único para identificación

#### Inventario (Multi-ubicación)

```sql
CREATE TABLE public.inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    ubicacion_id INTEGER NOT NULL REFERENCES public.ubicaciones(id) ON DELETE CASCADE,
    cantidad_disponible INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_disponible >= 0),
    cantidad_reservada INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_reservada >= 0),
    cantidad_minima INTEGER NOT NULL DEFAULT 5,
    ultima_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT inventario_unico UNIQUE (producto_id, ubicacion_id)
);
```

**CHECK Constraints**: Previenen cantidades negativas (integridad de negocio)
**UNIQUE Constraint**: Un producto solo puede tener un registro por ubicación

### 3.2.6 Transacciones de Venta

#### Ventas (Encabezado)

```sql
CREATE TABLE public.ventas (
    id SERIAL PRIMARY KEY,
    codigo_venta VARCHAR(50) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    cliente_id INTEGER REFERENCES public.clientes(id),
    empleado_id INTEGER REFERENCES public.empleados(id),
    fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    subtotal NUMERIC(10,2) NOT NULL,
    impuestos NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    metodo_pago_id INTEGER REFERENCES public.metodos_pago(id),
    direccion_id INTEGER REFERENCES public.direcciones(id)
);
```

**gen_random_uuid()**: Genera código de venta único automáticamente
**CHECK en estado**: Solo permite estados válidos

#### Detalles de Venta

```sql
CREATE TABLE public.detalles_venta (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES public.ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES public.productos(id),
    ubicacion_id INTEGER REFERENCES public.ubicaciones(id),
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    descuento NUMERIC(10,2) DEFAULT 0,
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS 
        ((cantidad::numeric * precio_unitario) - descuento) STORED,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**GENERATED ALWAYS AS ... STORED**: 
- PostgreSQL calcula y almacena el valor automáticamente
- Garantiza consistencia (siempre es cantidad × precio - descuento)
- Mejor rendimiento en consultas (no requiere calcular en cada query)
- Se recalcula automáticamente si cambian los valores base

**Ventajas sobre columna normal**:
- ✅ No puede modificarse manualmente (integridad)
- ✅ Siempre consistente con los datos base
- ✅ Indexable y eficiente

#### Garantías (1:1 con Detalles)

```sql
CREATE TABLE public.garantias (
    id SERIAL PRIMARY KEY,
    detalle_venta_id INTEGER NOT NULL UNIQUE 
        REFERENCES public.detalles_venta(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa' 
        CHECK (estado IN ('activa', 'expirada', 'utilizada', 'cancelada')),
    detalles TEXT DEFAULT 'Sin detalles',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**UNIQUE en detalle_venta_id**: Garantiza relación 1:1 (un producto vendido = una garantía)

### 3.2.7 Kardex (Auditoría)

```sql
CREATE TABLE public.kardex (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES public.productos(id),
    ubicacion_id INTEGER REFERENCES public.ubicaciones(id),
    fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tipo_movimiento VARCHAR(20) NOT NULL,
    cantidad INTEGER NOT NULL,
    saldo_anterior INTEGER NOT NULL,
    saldo_actual INTEGER NOT NULL,
    referencia_tabla VARCHAR(50),
    referencia_id INTEGER,
    observacion TEXT
);
```

**Diseño para Trazabilidad**:
- `saldo_anterior` y `saldo_actual`: Facilita auditorías sin recalcular
- `referencia_tabla` + `referencia_id`: Polimórfico, rastrea origen del movimiento
- `tipo_movimiento`: entrada, salida, entrada_inicial, ajuste_manual

### 3.2.8 Índices para Optimización

```sql
-- Inventario (consultas frecuentes de stock)
CREATE INDEX idx_inventario_producto ON public.inventario(producto_id);
CREATE INDEX idx_inventario_ubicacion ON public.inventario(ubicacion_id);

-- Ventas (reportes por cliente y fecha)
CREATE INDEX idx_ventas_cliente ON public.ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON public.ventas(fecha);

-- Kardex (historial por producto)
CREATE INDEX idx_kardex_producto_fecha ON public.kardex(producto_id, fecha);

-- Reviews (calificaciones por producto)
CREATE INDEX idx_reviews_producto ON public.reviews(producto_id);

-- Users (login)
CREATE INDEX idx_users_email ON public.users(email);

-- Búsquedas en detalles
CREATE INDEX idx_detalles_venta_ubicacion ON public.detalles_venta(ubicacion_id);
CREATE INDEX idx_compras_ubicacion ON public.compras(ubicacion_id);
```

**Justificación de Índices**:
- `idx_users_email`: Login es O(log n) en lugar de O(n)
- `idx_ventas_fecha`: Reportes por rango de fechas optimizados
- `idx_kardex_producto_fecha`: Historial de movimientos eficiente
- Índices compuestos cuando se consultan juntas las columnas

## 3.3 Funciones Almacenadas

### 3.3.1 Registro Transaccional de Usuario

```sql
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
BEGIN
    -- 1. Insertar Dirección
    INSERT INTO direcciones (calle, ciudad, estado, pais) 
    VALUES (
        COALESCE(p_direccion->>'calle', 'Sin dirección'), 
        COALESCE(p_direccion->>'ciudad', 'Desconocida'), 
        COALESCE(p_direccion->>'estado', 'Desconocido'), 
        COALESCE(p_direccion->>'pais', 'Bolivia')
    ) 
    RETURNING id INTO v_dir_id;

    -- 2. Insertar User
    INSERT INTO users (nombre, email, password, rol)
    VALUES (p_nombre, p_email, p_password, 'cliente')
    RETURNING id INTO v_user_id;

    -- 3. Insertar Cliente
    INSERT INTO clientes (user_id, nombre, apellido, telefono, tipo)
    VALUES (v_user_id, p_nombre, p_apellido, p_telefono, 'consumidor_final')
    RETURNING id INTO v_cliente_id;

    -- 4. Vincular Dirección
    INSERT INTO cliente_direcciones (cliente_id, direccion_id, es_principal)
    VALUES (v_cliente_id, v_dir_id, true);

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;
```

**Ventajas**:
- ✅ **Transaccional**: Todo o nada (atomicidad)
- ✅ **Simplifica API**: Un solo query desde el backend
- ✅ **Consistencia**: Garantiza que se creen todos los registros relacionados
- ✅ **JSONB para dirección**: Flexible, permite datos opcionales

**Uso desde la API**:
```javascript
await pool.query(
    `SELECT registrar_usuario_nuevo($1, $2, $3, $4, $5, $6) as user_id`,
    [nombre, apellido, telefono, email, hashedPassword, direccionJSON]
);
```

### 3.3.2 CRUD de Productos

#### Crear Producto

```sql
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
    INSERT INTO productos (...)
    VALUES (...)
    RETURNING id INTO v_producto_id;
    
    RETURN v_producto_id;
END;
$$ LANGUAGE plpgsql;
```

**COALESCE**: Permite parámetros opcionales con valores por defecto

#### Actualizar Producto

```sql
CREATE OR REPLACE FUNCTION actualizar_producto(...) RETURNS VOID AS $$
BEGIN
    UPDATE productos
    SET nombre = p_nombre,
        descripcion = p_descripcion,
        ... 
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
```

## 3.4 Triggers (Automatización)

### 3.4.1 Kardex Automático

```sql
CREATE OR REPLACE FUNCTION procesar_kardex_automatico()
RETURNS TRIGGER AS $$
DECLARE
    diferencia INTEGER;
    tipo_mov TEXT;
    v_saldo_anterior INTEGER;
    v_saldo_actual INTEGER;
BEGIN
    -- CASO 1: INSERT (Stock Inicial)
    IF (TG_OP = 'INSERT') THEN
        diferencia := NEW.cantidad_disponible;
        v_saldo_anterior := 0;
        v_saldo_actual := NEW.cantidad_disponible;
        tipo_mov := 'entrada_inicial';
        
        IF diferencia > 0 THEN
            INSERT INTO kardex (...)
            VALUES (...);
        END IF;
        RETURN NEW;
    END IF;

    -- CASO 2: UPDATE (Cambio de Stock)
    IF (TG_OP = 'UPDATE') THEN
        diferencia := NEW.cantidad_disponible - OLD.cantidad_disponible;
        v_saldo_anterior := OLD.cantidad_disponible;
        v_saldo_actual := NEW.cantidad_disponible;

        IF diferencia = 0 THEN RETURN NEW; END IF;

        IF diferencia > 0 THEN 
            tipo_mov := 'entrada';
        ELSE 
            tipo_mov := 'salida';
            diferencia := ABS(diferencia);
        END IF;

        INSERT INTO kardex (...)
        VALUES (...);
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

**Trigger Definition**:
```sql
CREATE TRIGGER trg_auto_kardex
AFTER INSERT OR UPDATE ON inventario
FOR EACH ROW
EXECUTE FUNCTION procesar_kardex_automatico();
```

**Características Avanzadas**:
- ✅ **IF Condicionales**: Maneja INSERT vs UPDATE diferente
- ✅ **Bucle Implícito**: FOR EACH ROW procesa cada fila
- ✅ **TG_OP**: Variable especial que indica la operación (INSERT/UPDATE/DELETE)
- ✅ **OLD y NEW**: Registros antes/después del cambio

### 3.4.2 Actualización de Stock en Ventas

```sql
CREATE OR REPLACE FUNCTION restar_stock_venta()
RETURNS TRIGGER AS $$
DECLARE
    v_ubicacion_id INTEGER;
BEGIN
    -- Si no se especificó ubicación, seleccionar automáticamente
    IF NEW.ubicacion_id IS NULL THEN
        SELECT ubicacion_id INTO v_ubicacion_id
        FROM inventario
        WHERE producto_id = NEW.producto_id
          AND cantidad_disponible >= NEW.cantidad
        ORDER BY cantidad_disponible DESC
        LIMIT 1;
        
        IF v_ubicacion_id IS NULL THEN
            RAISE EXCEPTION 'Stock insuficiente para producto ID %', NEW.producto_id;
        END IF;
        
        NEW.ubicacion_id = v_ubicacion_id;
    END IF;
    
    -- Descontar stock
    UPDATE inventario 
    SET cantidad_disponible = cantidad_disponible - NEW.cantidad
    WHERE producto_id = NEW.producto_id 
      AND ubicacion_id = NEW.ubicacion_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo descontar stock para producto ID %', NEW.producto_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_movimiento_venta
BEFORE INSERT ON detalles_venta
FOR EACH ROW
EXECUTE FUNCTION restar_stock_venta();
```

**Lógica Inteligente**:
1. Si no se especificó ubicación → Busca la que tiene más stock
2. Valida que haya stock suficiente
3. Resta automáticamente
4. **BEFORE INSERT**: Modifica NEW antes de insertar
5. **RAISE EXCEPTION**: Cancela la transacción si falla

### 3.4.3 Suma de Stock en Compras (UPSERT)

```sql
CREATE OR REPLACE FUNCTION sumar_stock_compra()
RETURNS TRIGGER AS $$
DECLARE
    v_ubicacion_id INTEGER;
BEGIN
    -- Obtener ubicación de la compra
    SELECT ubicacion_id INTO v_ubicacion_id 
    FROM compras WHERE id = NEW.compra_id;

    -- UPSERT: Crear o actualizar inventario
    INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible, cantidad_minima)
    VALUES (NEW.producto_id, v_ubicacion_id, NEW.cantidad, 5)
    
    ON CONFLICT (producto_id, ubicacion_id) 
    DO UPDATE SET 
        cantidad_disponible = inventario.cantidad_disponible + NEW.cantidad,
        ultima_actualizacion = NOW();
        
    -- Actualizar precio de costo
    UPDATE productos SET precio_costo = NEW.precio_unitario
    WHERE id = NEW.producto_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**ON CONFLICT ... DO UPDATE (UPSERT)**:
- Si el producto **no existe** en esa ubicación → INSERT
- Si **ya existe** → UPDATE sumando cantidades
- Aprovecha constraint UNIQUE (producto_id, ubicacion_id)

### 3.4.4 Garantías Automáticas

```sql
CREATE OR REPLACE FUNCTION crear_garantia_auto()
RETURNS TRIGGER AS $$
DECLARE
    v_dias INTEGER;
BEGIN
    -- Obtener días de garantía del producto
    SELECT dias_garantia INTO v_dias 
    FROM productos 
    WHERE id = NEW.producto_id;

    -- Crear garantía
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

CREATE TRIGGER trg_auto_garantia
AFTER INSERT ON detalles_venta
FOR EACH ROW
EXECUTE FUNCTION crear_garantia_auto();
```

**Cálculo de Fecha**:
- `CURRENT_DATE + (365 || ' days')::INTERVAL`: Suma 365 días
- `COALESCE(v_dias, 365)`: Si no tiene configurado, usa 1 año

### 3.4.5 Timestamps Automáticos

```sql
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
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
```

**Aplicado a Múltiples Tablas con Bucle**:
```sql
DO $$
DECLARE
    t text;
    tablas text[] := ARRAY['users', 'clientes', 'categorias', 'marcas', ...];
BEGIN
    FOREACH t IN ARRAY tablas
    LOOP
        EXECUTE format('CREATE TRIGGER trg_upd_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_timestamp_column()', t, t);
    END LOOP;
END;
$$;
```

**Bucle FOREACH**: Crea triggers dinámicamente para múltiples tablas

### 3.4.6 Envíos Automáticos

```sql
CREATE OR REPLACE FUNCTION crear_envio_automatico()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.direccion_id IS NOT NULL THEN
        INSERT INTO envios (venta_id, direccion_id, estado, costo)
        VALUES (NEW.id, NEW.direccion_id, 'entregado', 50.00);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_envio
AFTER INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION crear_envio_automatico();
```

## 3.5 Views (Vistas)

### Vista de Garantías con Estado Calculado

```sql
CREATE OR REPLACE VIEW vista_garantias_estado AS
SELECT 
    g.*,
    CASE 
        WHEN g.fecha_fin < CURRENT_DATE THEN 'expirada'
        ELSE 'activa'
    END as estado_calculado
FROM garantias g;
```

**CASE Statement**: Calcula estado dinámicamente basado en fecha

## 3.6 DML (Data Manipulation Language)

### 3.6.1 Estrategia de Población de Datos

**Archivo**: `Inserts.sql` (408 líneas)

#### Limpieza y Reset de Secuencias

```sql
TRUNCATE TABLE kardex, garantias, envios, detalles_venta, ... CASCADE;

ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categorias_id_seq RESTART WITH 1;
...
```

**TRUNCATE CASCADE**: Limpia todo respetando dependencias
**ALTER SEQUENCE RESTART**: Reinicia IDs desde 1

#### Datos de Prueba

**Catálogos Base**:
- 5 métodos de pago
- 20 direcciones (tiendas, proveedores, clientes)
- 4 ubicaciones (3 tiendas + 1 almacén)
- 8 categorías de productos
- 10 marcas

**Usuarios**:
- 1 admin
- 4 empleados (actores de Hollywood)
- 12 clientes (futbolistas famosos)
- Passwords: todos hasheados con Argon2 (`usuario123`)

**Productos**:
- 40 productos tech reales (iPhones, MacBooks, PS5, RTX 4090, etc.)
- Precios realistas en USD
- Imágenes reales (URLs públicas)

**Transacciones de Prueba**:
- 5 compras a proveedores (stock inicial)
- 20 ventas históricas (diciembre 2025)
- 25 reviews de clientes

### 3.6.2 Inserts con Valores por Defecto

```sql
INSERT INTO metodos_pago (nombre) VALUES 
    ('efectivo'), ('tarjeta'), ('transferencia'), ('qr'), ('paypal');
```

**Nota**: `activo` y timestamps se asignan automáticamente (DEFAULT)

### 3.6.3 Compras que Activan Triggers

```sql
INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario) VALUES
    (1, 1, 50, 950.00);  -- iPhone 15 Pro Max, 50 unidades
```

**Efecto en Cascada**:
1. Trigger `sumar_stock_compra()` se dispara
2. Se hace UPSERT en `inventario`
3. Trigger `procesar_kardex_automatico()` registra en Kardex
4. Se actualiza `precio_costo` en `productos`

## 3.7 Configuración Final

```sql
ALTER ROLE neondb_owner SET timezone TO 'America/La_Paz';
```

**Zona Horaria**: Todos los TIMESTAMPTZ usan horario de Bolivia

---

**Próximo Documento**: [04-CASOS-DE-USO.md](./04-CASOS-DE-USO.md)
