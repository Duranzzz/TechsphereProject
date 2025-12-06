SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
SET default_tablespace = '';
SET default_table_access_method = heap;

-- ========================================
-- 1. TABLAS BASE Y CATÁLOGOS
-- ========================================

CREATE TABLE public.direcciones (
    id SERIAL PRIMARY KEY,
    calle VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    pais VARCHAR(100) DEFAULT 'Bolivia',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.direcciones OWNER TO neondb_owner;

CREATE TABLE public.categorias (
    id SERIAL PRIMARY KEY,
    nombre character varying(100) NOT NULL UNIQUE,
    descripcion text,
    activa boolean DEFAULT true
);
ALTER TABLE public.categorias OWNER TO neondb_owner;

CREATE TABLE public.marcas (
    id SERIAL PRIMARY KEY,
    nombre character varying(100) NOT NULL UNIQUE,
    pais_origen character varying(50),
    sitio_web character varying(255)
);
ALTER TABLE public.marcas OWNER TO neondb_owner;

CREATE TABLE public.metodos_pago (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE
);
ALTER TABLE public.metodos_pago OWNER TO neondb_owner;

CREATE TABLE public.ubicaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('tienda', 'almacen')),
    direccion_id INTEGER REFERENCES public.direcciones(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.ubicaciones OWNER TO neondb_owner;

-- ========================================
-- 2. AUTENTICACIÓN SIMPLIFICADA
-- ========================================

CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'empleado', 'cliente', 'proveedor')),
    foto_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.users OWNER TO neondb_owner;

-- ========================================
-- 3. ENTIDADES PRINCIPALES
-- ========================================

CREATE TABLE public.clientes (
    id SERIAL PRIMARY KEY,
    nombre character varying(100) NOT NULL,
    apellido character varying(100),
    telefono character varying(20),
    tipo character varying(20) DEFAULT 'consumidor_final' CHECK (tipo IN ('consumidor_final', 'empresa')),
    fecha_registro timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true,
    user_id INTEGER UNIQUE REFERENCES public.users(id) ON DELETE CASCADE
);
ALTER TABLE public.clientes OWNER TO neondb_owner;

CREATE TABLE public.cliente_direcciones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    direccion_id INTEGER NOT NULL REFERENCES public.direcciones(id) ON DELETE CASCADE,
    alias VARCHAR(50),
    es_principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cliente_direcciones_unico UNIQUE (cliente_id, direccion_id)
);
ALTER TABLE public.cliente_direcciones OWNER TO neondb_owner;

CREATE TABLE public.empleados (
    id SERIAL PRIMARY KEY,
    nombre character varying(100) NOT NULL,
    apellido character varying(100),
    telefono character varying(20),
    puesto character varying(20) DEFAULT 'vendedor' CHECK (puesto IN ('vendedor', 'gerente', 'administrativo')),
    fecha_contratacion date,
    activo boolean DEFAULT true,
    user_id INTEGER UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    direccion_id INTEGER REFERENCES public.direcciones(id)
);
ALTER TABLE public.empleados OWNER TO neondb_owner;

CREATE TABLE public.proveedores (
    id SERIAL PRIMARY KEY,
    nombre character varying(200) NOT NULL,
    contacto character varying(100),
    telefono character varying(20),
    email character varying(255), -- Email de contacto del proveedor (puede ser diferente al login)
    activo boolean DEFAULT true,
    user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL, -- Opcional, si el proveedor tiene acceso
    direccion_id INTEGER REFERENCES public.direcciones(id)
);
ALTER TABLE public.proveedores OWNER TO neondb_owner;

-- ========================================
-- 4. PRODUCTOS E INVENTARIO
-- ========================================

CREATE TABLE public.productos (
    id SERIAL PRIMARY KEY,
    nombre character varying(200) NOT NULL,
    descripcion text,
    precio numeric(10,2) NOT NULL,
    precio_costo numeric(10,2),
    categoria_id integer REFERENCES public.categorias(id),
    marca_id integer REFERENCES public.marcas(id),
    sku character varying(50) UNIQUE,
    activo boolean DEFAULT true,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    imagen_url TEXT
);
ALTER TABLE public.productos OWNER TO neondb_owner;

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
ALTER TABLE public.inventario OWNER TO neondb_owner;

CREATE TABLE public.reviews (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    cliente_id INTEGER NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    verificado BOOLEAN DEFAULT FALSE,
    fecha_review TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_unico UNIQUE (producto_id, cliente_id)
);
ALTER TABLE public.reviews OWNER TO neondb_owner;

-- ========================================
-- 5. COMPRAS Y VENTAS
-- ========================================

CREATE TABLE public.compras (
    id SERIAL PRIMARY KEY,
    proveedor_id integer REFERENCES public.proveedores(id),
    fecha_compra timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    numero_factura character varying(100),
    total numeric(10,2) NOT NULL,
    estado character varying(20) DEFAULT 'completada',
    fecha_registro timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.compras OWNER TO neondb_owner;

CREATE TABLE public.detalles_compra (
    id SERIAL PRIMARY KEY,
    compra_id integer REFERENCES public.compras(id) ON DELETE CASCADE,
    producto_id integer REFERENCES public.productos(id),
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) GENERATED ALWAYS AS ((cantidad::numeric * precio_unitario)) STORED
);
ALTER TABLE public.detalles_compra OWNER TO neondb_owner;

CREATE TABLE public.ventas (
    id SERIAL PRIMARY KEY,
    codigo_venta VARCHAR(50) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    cliente_id integer REFERENCES public.clientes(id),
    empleado_id integer REFERENCES public.empleados(id),
    fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    subtotal numeric(10,2) NOT NULL,
    impuestos numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    estado character varying(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
    metodo_pago_id INTEGER REFERENCES public.metodos_pago(id)
);
ALTER TABLE public.ventas OWNER TO neondb_owner;

CREATE TABLE public.detalles_venta (
    id SERIAL PRIMARY KEY,
    venta_id integer REFERENCES public.ventas(id) ON DELETE CASCADE,
    producto_id integer REFERENCES public.productos(id),
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT 0,
    subtotal numeric(10,2) GENERATED ALWAYS AS ((cantidad::numeric * precio_unitario) - descuento) STORED
);
ALTER TABLE public.detalles_venta OWNER TO neondb_owner;

CREATE TABLE public.envios (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL UNIQUE REFERENCES public.ventas(id) ON DELETE CASCADE,
    direccion_id INTEGER NOT NULL REFERENCES public.direcciones(id),
    courier VARCHAR(100) NOT NULL,
    numero_guia VARCHAR(100),
    costo DECIMAL(10,2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'preparando', 'transito', 'entregado', 'fallido')),
    fecha_envio TIMESTAMPTZ,
    fecha_entrega TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.envios OWNER TO neondb_owner;

CREATE TABLE public.garantias (
    id SERIAL PRIMARY KEY,
    detalle_venta_id INTEGER NOT NULL UNIQUE REFERENCES public.detalles_venta(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'expirada', 'utilizada', 'cancelada')),
    detalles TEXT
);
ALTER TABLE public.garantias OWNER TO neondb_owner;

CREATE TABLE public.kardex (
    id SERIAL PRIMARY KEY,
    producto_id integer REFERENCES public.productos(id),
    ubicacion_id integer REFERENCES public.ubicaciones(id),
    fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tipo_movimiento character varying(20) NOT NULL,
    cantidad integer NOT NULL,
    saldo_anterior integer NOT NULL,
    saldo_actual integer NOT NULL,
    referencia_tabla character varying(50),
    referencia_id integer,
    observacion text
);
ALTER TABLE public.kardex OWNER TO neondb_owner;

-- ========================================
-- 6. ÍNDICES
-- ========================================

CREATE INDEX idx_inventario_producto ON public.inventario(producto_id);
CREATE INDEX idx_inventario_ubicacion ON public.inventario(ubicacion_id);
CREATE INDEX idx_direcciones_busqueda ON public.direcciones(id);
CREATE INDEX idx_cliente_direcciones_cliente ON public.cliente_direcciones(cliente_id);
CREATE INDEX idx_ventas_cliente ON public.ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON public.ventas(fecha);
CREATE INDEX idx_kardex_producto_fecha ON public.kardex(producto_id, fecha);
CREATE INDEX idx_reviews_producto ON public.reviews(producto_id);
CREATE INDEX idx_users_email ON public.users(email);

-- ========================================
-- 7. CONFIGURACIÓN FINAL
-- ========================================

ALTER ROLE neondb_owner SET timezone TO 'America/La_Paz';