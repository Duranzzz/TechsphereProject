-- Migration Script: Redesign for 3NF and Robustness
-- WARNING: This will TRUNCATE sales and purchase data to ensure schema integrity.

-- 1. Truncate tables that depend on products or might have conflicts
TRUNCATE TABLE public.detalles_venta CASCADE;
TRUNCATE TABLE public.ventas CASCADE;
TRUNCATE TABLE public.compras CASCADE;
TRUNCATE TABLE public.garantias CASCADE;

-- 2. Drop the old 'compras' table (it was 2NF/Denormalized)
DROP TABLE IF EXISTS public.compras CASCADE;

-- 3. Create the new 'compras' table (Header)
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
ALTER TABLE ONLY public.compras ALTER COLUMN id SET DEFAULT nextval('public.compras_id_seq'::regclass);
ALTER TABLE ONLY public.compras ADD CONSTRAINT compras_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.compras ADD CONSTRAINT compras_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id);

-- 4. Create the new 'detalles_compra' table (Details)
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
ALTER TABLE ONLY public.detalles_compra ALTER COLUMN id SET DEFAULT nextval('public.detalles_compra_id_seq'::regclass);
ALTER TABLE ONLY public.detalles_compra ADD CONSTRAINT detalles_compra_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.detalles_compra ADD CONSTRAINT detalles_compra_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.detalles_compra ADD CONSTRAINT detalles_compra_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);

-- 5. Create the 'kardex' table (Inventory Audit)
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
ALTER TABLE ONLY public.kardex ALTER COLUMN id SET DEFAULT nextval('public.kardex_id_seq'::regclass);
ALTER TABLE ONLY public.kardex ADD CONSTRAINT kardex_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.kardex ADD CONSTRAINT kardex_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);

-- 6. Verification Output
SELECT 'Migration Completed Successfully' as status;
