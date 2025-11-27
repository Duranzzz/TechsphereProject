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

CREATE TABLE public.auth_accounts (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type character varying(255) NOT NULL,
    provider character varying(255) NOT NULL,
    "providerAccountId" character varying(255) NOT NULL,
    refresh_token text,
    access_token text,
    expires_at bigint,
    id_token text,
    scope text,
    session_state text,
    token_type text,
    password text
);

ALTER TABLE public.auth_accounts OWNER TO neondb_owner;

CREATE SEQUENCE public.auth_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.auth_accounts_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.auth_accounts_id_seq OWNED BY public.auth_accounts.id;

CREATE TABLE public.auth_sessions (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    expires timestamp with time zone NOT NULL,
    "sessionToken" character varying(255) NOT NULL
);

ALTER TABLE public.auth_sessions OWNER TO neondb_owner;

CREATE SEQUENCE public.auth_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.auth_sessions_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.auth_sessions_id_seq OWNED BY public.auth_sessions.id;

CREATE TABLE public.auth_users (
    id integer NOT NULL,
    name character varying(255),
    email character varying(255),
    "emailVerified" timestamp with time zone,
    image text
);

ALTER TABLE public.auth_users OWNER TO neondb_owner;

CREATE SEQUENCE public.auth_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.auth_users_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.auth_users_id_seq OWNED BY public.auth_users.id;

CREATE TABLE public.auth_verification_token (
    identifier text NOT NULL,
    expires timestamp with time zone NOT NULL,
    token text NOT NULL
);

ALTER TABLE public.auth_verification_token OWNER TO neondb_owner;

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activa boolean DEFAULT true
);

ALTER TABLE public.categorias OWNER TO neondb_owner;

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.categorias_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100),
    email character varying(255),
    telefono character varying(20),
    direccion text,
    tipo character varying(20) DEFAULT 'consumidor_final'::character varying,
    fecha_registro timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true,
    CONSTRAINT clientes_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['consumidor_final'::character varying, 'empresa'::character varying])::text[])))
);

ALTER TABLE public.clientes OWNER TO neondb_owner;

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.clientes_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;

-- MODIFIED: Compras Header
CREATE TABLE public.compras (
    id integer NOT NULL,
    proveedor_id integer,
    fecha_compra timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    numero_factura character varying(100),
    total numeric(10,2) NOT NULL,
    estado character varying(20) DEFAULT 'completada'::character varying,
    fecha_registro timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.compras OWNER TO neondb_owner;

CREATE SEQUENCE public.compras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.compras_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.compras_id_seq OWNED BY public.compras.id;

-- NEW: Detalles Compra
CREATE TABLE public.detalles_compra (
    id integer NOT NULL,
    compra_id integer,
    producto_id integer,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    subtotal numeric(10,2) GENERATED ALWAYS AS ((((cantidad)::numeric * precio_unitario))) STORED
);

ALTER TABLE public.detalles_compra OWNER TO neondb_owner;

CREATE SEQUENCE public.detalles_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.detalles_compra_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.detalles_compra_id_seq OWNED BY public.detalles_compra.id;

CREATE TABLE public.detalles_venta (
    id integer NOT NULL,
    venta_id integer,
    producto_id integer,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT 0,
    subtotal numeric(10,2) GENERATED ALWAYS AS ((((cantidad)::numeric * precio_unitario) - descuento)) STORED
);

ALTER TABLE public.detalles_venta OWNER TO neondb_owner;

CREATE SEQUENCE public.detalles_venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.detalles_venta_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.detalles_venta_id_seq OWNED BY public.detalles_venta.id;

CREATE TABLE public.empleados (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100),
    email character varying(255),
    telefono character varying(20),
    puesto character varying(20) DEFAULT 'vendedor'::character varying,
    fecha_contratacion date,
    activo boolean DEFAULT true,
    auth_user_id integer,
    CONSTRAINT empleados_puesto_check CHECK (((puesto)::text = ANY ((ARRAY['vendedor'::character varying, 'gerente'::character varying, 'administrativo'::character varying])::text[])))
);

ALTER TABLE public.empleados OWNER TO neondb_owner;

CREATE SEQUENCE public.empleados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.empleados_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.empleados_id_seq OWNED BY public.empleados.id;

CREATE TABLE public.garantias (
    id integer NOT NULL,
    venta_id integer,
    producto_id integer,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado character varying(20) DEFAULT 'activa'::character varying,
    detalles text,
    CONSTRAINT garantias_estado_check CHECK (((estado)::text = ANY ((ARRAY['activa'::character varying, 'expirada'::character varying, 'utilizada'::character varying])::text[])))
);

ALTER TABLE public.garantias OWNER TO neondb_owner;

CREATE SEQUENCE public.garantias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.garantias_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.garantias_id_seq OWNED BY public.garantias.id;

-- NEW: Kardex
CREATE TABLE public.kardex (
    id integer NOT NULL,
    producto_id integer,
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

CREATE SEQUENCE public.kardex_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.kardex_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.kardex_id_seq OWNED BY public.kardex.id;

CREATE TABLE public.marcas (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    pais_origen character varying(50),
    sitio_web character varying(255)
);

ALTER TABLE public.marcas OWNER TO neondb_owner;

CREATE SEQUENCE public.marcas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.marcas_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.marcas_id_seq OWNED BY public.marcas.id;

CREATE TABLE public.productos (
    id integer NOT NULL,
    nombre character varying(200) NOT NULL,
    descripcion text,
    precio numeric(10,2) NOT NULL,
    precio_costo numeric(10,2),
    stock integer DEFAULT 0,
    stock_minimo integer DEFAULT 5,
    categoria_id integer,
    marca_id integer,
    sku character varying(50),
    activo boolean DEFAULT true,
    fecha_creacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    imagen_url TEXT
);

ALTER TABLE public.productos OWNER TO neondb_owner;

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.productos_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;

CREATE TABLE public.proveedores (
    id integer NOT NULL,
    nombre character varying(200) NOT NULL,
    contacto character varying(100),
    telefono character varying(20),
    email character varying(255),
    direccion text,
    activo boolean DEFAULT true
);

ALTER TABLE public.proveedores OWNER TO neondb_owner;

CREATE SEQUENCE public.proveedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.proveedores_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;

CREATE TABLE public.ventas (
    id integer NOT NULL,
    cliente_id integer,
    empleado_id integer,
    fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    subtotal numeric(10,2) NOT NULL,
    impuestos numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    metodo_pago character varying(20) DEFAULT 'efectivo'::character varying,
    CONSTRAINT ventas_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'completada'::character varying, 'cancelada'::character varying])::text[]))),
    CONSTRAINT ventas_metodo_pago_check CHECK (((metodo_pago)::text = ANY ((ARRAY['efectivo'::character varying, 'tarjeta'::character varying, 'transferencia'::character varying])::text[])))
);

ALTER TABLE public.ventas OWNER TO neondb_owner;

CREATE SEQUENCE public.ventas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.ventas_id_seq OWNER TO neondb_owner;

ALTER SEQUENCE public.ventas_id_seq OWNED BY public.ventas.id;

ALTER TABLE ONLY public.auth_accounts ALTER COLUMN id SET DEFAULT nextval('public.auth_accounts_id_seq'::regclass);

ALTER TABLE ONLY public.auth_sessions ALTER COLUMN id SET DEFAULT nextval('public.auth_sessions_id_seq'::regclass);

ALTER TABLE ONLY public.auth_users ALTER COLUMN id SET DEFAULT nextval('public.auth_users_id_seq'::regclass);

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);

ALTER TABLE ONLY public.compras ALTER COLUMN id SET DEFAULT nextval('public.compras_id_seq'::regclass);

ALTER TABLE ONLY public.detalles_compra ALTER COLUMN id SET DEFAULT nextval('public.detalles_compra_id_seq'::regclass);

ALTER TABLE ONLY public.detalles_venta ALTER COLUMN id SET DEFAULT nextval('public.detalles_venta_id_seq'::regclass);

ALTER TABLE ONLY public.empleados ALTER COLUMN id SET DEFAULT nextval('public.empleados_id_seq'::regclass);

ALTER TABLE ONLY public.garantias ALTER COLUMN id SET DEFAULT nextval('public.garantias_id_seq'::regclass);

ALTER TABLE ONLY public.kardex ALTER COLUMN id SET DEFAULT nextval('public.kardex_id_seq'::regclass);

ALTER TABLE ONLY public.marcas ALTER COLUMN id SET DEFAULT nextval('public.marcas_id_seq'::regclass);

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);

ALTER TABLE ONLY public.ventas ALTER COLUMN id SET DEFAULT nextval('public.ventas_id_seq'::regclass);

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT auth_accounts_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth_verification_token
    ADD CONSTRAINT auth_verification_token_pkey PRIMARY KEY (identifier, token);

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_email_key UNIQUE (email);

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.detalles_compra
    ADD CONSTRAINT detalles_compra_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.detalles_venta
    ADD CONSTRAINT detalles_venta_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_email_key UNIQUE (email);

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.garantias
    ADD CONSTRAINT garantias_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_nombre_key UNIQUE (nombre);

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_sku_key UNIQUE (sku);

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.auth_accounts
    ADD CONSTRAINT "auth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.auth_users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.auth_users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id);

ALTER TABLE ONLY public.detalles_compra
    ADD CONSTRAINT detalles_compra_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.detalles_compra
    ADD CONSTRAINT detalles_compra_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);

ALTER TABLE ONLY public.detalles_venta
    ADD CONSTRAINT detalles_venta_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);

ALTER TABLE ONLY public.detalles_venta
    ADD CONSTRAINT detalles_venta_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.garantias
    ADD CONSTRAINT garantias_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);

ALTER TABLE ONLY public.garantias
    ADD CONSTRAINT garantias_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id);

ALTER TABLE ONLY public.kardex
    ADD CONSTRAINT kardex_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id);

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id);

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public.empleados(id);

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES public.auth_users(id);

ALTER ROLE neondb_owner SET timezone TO 'America/La_Paz';