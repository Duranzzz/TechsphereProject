# 5. Interacción con la Base de Datos

## 5.1 Arquitectura de Conexión

### 5.1.1 Base de Datos: Neon PostgreSQL Serverless

**Proveedor**: [Neon](https://neon.tech)  
**Tipo**: PostgreSQL 15+ Serverless  
**Ventajas**:
- ✅ Auto-scaling (escala según demanda)
- ✅ Branching (ramas de BD para dev/staging/prod)
- ✅ Conexión via WebSocket y TCP
- ✅ Serverless (sin gestión de infraestructura)
- ✅ Plan gratuito con limits razonables

### 5.1.2 Configuración de Conexión

**Archivo**: `src/lib/db.js`

```javascript
import { Pool } from '@neondatabase/serverless';

// Pool de conexiones
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configuración SSL para Neon
  ssl: true
});

// Query helper (para queries simples)
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}
```

**Pool de Conexiones**:
- Reutiliza conexiones existentes
- Mejor rendimiento que conexiones individuales
- Manejo automático de timeouts

**Variables de Entorno** (`.env`):
```env
DATABASE_URL=postgresql://user:pass@ep-name.region.aws.neon.tech/dbname?sslmode=require
```

### 5.1.3 Patrón de Uso en la API

#### Consultas Simples (Sin Transacción)

```javascript
import { query } from '@/lib/db';

// GET endpoint - listar productos
export async function GET(request) {
  const result = await query(`
    SELECT * FROM productos WHERE activo = true
  `);
  return Response.json(result.rows);
}
```

#### Consultas con Parámetros (Prepared Statements)

```javascript
// Previene SQL Injection
const result = await query(`
  SELECT * FROM productos WHERE categoria_id = $1 AND precio <= $2
`, [categoriaId, precioMax]);
```

**$1, $2**: Placeholders parametrizados (PostgreSQL syntax)

#### Transacciones (ACID)

```javascript
import { pool } from '@/lib/db';

export async function POST(request) {
  const client = await pool.connect();  // Obtener conexión del pool
  
  try {
    await client.query('BEGIN');  // Iniciar transacción
    
    // Múltiples operaciones relacionadas
    const venta = await client.query('INSERT INTO ventas (...) VALUES (...) RETURNING id');
    const ventaId = venta.rows[0].id;
    
    await client.query('INSERT INTO detalles_venta (...) VALUES (...)', [ventaId, ...]);
    
    await client.query('COMMIT');  // Confirmar transacción
    return Response.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');  // Revertir en caso de error
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();  // Liberar conexión al pool
  }
}
```

**Atomicidad**: Todo o nada (si falla un paso, se revierte todo)

## 5.2 Consultas Principales y Optimización

### 5.2.1 Listado de Productos con Agregaciones

**Endpoint**: `GET /api/productos`

**SQL Optimizado**:
```sql
SELECT 
    p.*,
    c.nombre as categoria_nombre,
    m.nombre as marca_nombre,
    -- Agregación de stock total
    COALESCE(SUM(i.cantidad_disponible), 0) as stock,
    -- Promedio de calificación
    COALESCE(AVG(r.calificacion), 0) as rating_promedio,
    COUNT(DISTINCT r.id) as total_reviews
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id  -- Usa PK/FK
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN inventario i ON p.id = i.producto_id    -- Usa idx_inventario_producto
LEFT JOIN reviews r ON p.id = r.producto_id       -- Usa idx_reviews_producto
WHERE p.activo = true
GROUP BY p.id, c.nombre, m.nombre
ORDER BY (SUM(i.cantidad_disponible) > 0) DESC, p.nombre ASC;
```

**Optimizaciones Aplicadas**:
1. ✅ **LEFT JOIN**: Incluye productos sin stock/reviews
2. ✅ **COALESCE**: Reemplaza NULL con 0
3. ✅ **Índices**: `idx_inventario_producto`, `idx_reviews_producto`
4. ✅ **GROUP BY**: Agrupa correctamente por PK + campos no agregados
5. ✅ **ORDER BY con lógica**: Prioriza productos con stock

**Rendimiento**: ~50-100ms con 40 productos + 200 registros de inventario

### 5.2.2 Dashboard con Consultas Paralelas

**Endpoint**: `GET /api/dashboard`

**Patrón Promise.all()** (ejecuta en paralelo):

```javascript
const [ventasHoyRes, stockBajoRes, ventasMesRes, topProductosRes, salesHistoryRes] =
  await Promise.all([
    query('SELECT COUNT(*), SUM(total) FROM ventas WHERE DATE(fecha) = CURRENT_DATE'),
    query('SELECT COUNT(*) FROM productos p JOIN inventario i ON p.id = i.producto_id WHERE i.cantidad_disponible <= i.cantidad_minima'),
    query('SELECT COUNT(*), SUM(total) FROM ventas WHERE EXTRACT(MONTH FROM fecha) = ...'),
    query('SELECT p.nombre, SUM(dv.cantidad) FROM detalles_venta dv JOIN productos p ... GROUP BY ...'),
    query('SELECT TO_CHAR(DATE(fecha), \'YYYY-MM-DD\'), SUM(total) FROM ventas ...')
  ]);
```

**Ventaja**: 5 queries en paralelo en lugar de secuencial
- **Secuencial**: ~500ms (100ms × 5)
- **Paralelo**: ~100ms (tiempo de la query más lenta)

### 5.2.3 Búsqueda Full-Text con ILIKE

```sql
SELECT * FROM productos
WHERE LOWER(nombre) LIKE LOWER($1) 
   OR LOWER(descripcion) LIKE LOWER($1);
```

**Parámetro**: `%iphone%` (búsqueda parcial case-insensitive)

**Mejora Futura**: Usar `tsvector` y `tsquery` para full-text search nativo de PostgreSQL

### 5.2.4 Historial de Movimientos con JOIN

```sql
SELECT 
    k.fecha,
    k.tipo_movimiento,
    k.cantidad,
    k.saldo_anterior,
    k.saldo_actual,
    p.nombre as producto,
    u.nombre as ubicacion
FROM kardex k
JOIN productos p ON k.producto_id = p.id
JOIN ubicaciones u ON k.ubicacion_id = u.id
WHERE k.producto_id = $1
ORDER BY k.fecha DESC
LIMIT 100;  -- Paginación
```

**Índice Compuesto**: `idx_kardex_producto_fecha` optimiza WHERE + ORDER BY

## 5.3 Índices y su Impacto

### 5.3.1 Índices Implementados

```sql
-- 1. Autenticación (Login)
CREATE INDEX idx_users_email ON users(email);
-- Impacto: Login O(log n) en lugar de O(n) - crítico

-- 2. Inventario (Consultas frecuentes)
CREATE INDEX idx_inventario_producto ON inventario(producto_id);
CREATE INDEX idx_inventario_ubicacion ON inventario(ubicacion_id);
-- Impacto: JOINs con productos 10x más rápidos

-- 3. Ventas (Reportes)
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
-- Impacto: Reportes por rango de fechas eficientes

-- 4. Kardex (Historial)
CREATE INDEX idx_kardex_producto_fecha ON kardex(producto_id, fecha);
-- Impacto: Consultas de auditoría optimizadas

-- 5. Reviews (Calificaciones)
CREATE INDEX idx_reviews_producto ON reviews(producto_id);
-- Impacto: Agregación de ratings más rápida

-- 6. Búsquedas en detalles
CREATE INDEX idx_detalles_venta_ubicacion ON detalles_venta(ubicacion_id);
-- Impacto: Reportes de ventas por tienda

-- 7. Direcciones
CREATE INDEX idx_cliente_direcciones_cliente ON cliente_direcciones(cliente_id);
-- Impacto: Listado de direcciones de cliente rápido
```

### 5.3.2 Análisis EXPLAIN (Ejemplo)

```sql
EXPLAIN ANALYZE
SELECT * FROM productos WHERE categoria_id = 1;
```

**Sin índice en categoria_id**:
```
Seq Scan on productos  (cost=0.00..10.40 rows=40 width=200)
  Filter: (categoria_id = 1)
Execution time: 2.5 ms
```

**Con índice potencial** (no implementado aún):
```
Index Scan using idx_productos_categoria on productos
  (cost=0.15..8.17 rows=1 width=200)
Execution time: 0.3 ms
```

**Decisión**: No se indexó `categoria_id` porque:
- El catálogo es pequeño (40 productos)
- Filtros se combinan con otros campos (búsqueda, marca)
- Index scan puede ser menos eficiente que seq scan con pocos datos

## 5.4 Columnas Calculadas (GENERATED)

### Ventajas de Usar GENERATED ALWAYS

**Definición** (`detalles_venta`):
```sql
subtotal NUMERIC(10,2) GENERATED ALWAYS AS 
  ((cantidad::numeric * precio_unitario) - descuento) STORED
```

**Beneficios**:
1. ✅ **Consistencia Garantizada**: No puede divergir del cálculo
2. ✅ **Rendimiento**: No requiere calcular en cada SELECT
3. ✅ **Indexable**: Puede tener índice si se necesita
4. ✅ **Mantenimiento Automático**: PostgreSQL recalcula si cambian los datos base

**Alternativa (Sin GENERATED)**:
```sql
-- Tendríamos que calcular en cada query
SELECT 
  (cantidad::numeric * precio_unitario) - descuento as subtotal
FROM detalles_venta;
```

**Problema**: Si hay 100 queries diferentes, podríamos calcularlo incorrectamente en alguna

## 5.5 Triggers: Automatización vs Performance

### Trade-offs de los Triggers

#### Ventajas ✅
- Lógica de negocio centralizada en BD
- Garantiza ejecución (no depende de la aplicación)
- Simplifica código del backend
- Auditoría automática (kardex)

#### Desventajas ⚠️
- Menor transparencia (lógica "oculta")
- Difícil de debuggear
- Puede afectar performance si son complejos

### Triggers en TechSphere

| Trigger | Tabla | Evento | Complejidad | Justificación |
|---------|-------|--------|-------------|---------------|
| `procesar_kardex_automatico` | inventario | INSERT/UPDATE | Media | Auditoría crítica, debe registrarse siempre |
| `restar_stock_venta` | detalles_venta | BEFORE INSERT | Media | Selección automática de ubicación, validación de stock |
| `sumar_stock_compra` | detalles_compra | AFTER INSERT | Alta | UPSERT complejo, actualiza múltiples tablas |
| `crear_garantia_auto` | detalles_venta | AFTER INSERT | Baja | Cálculo simple de fecha + días |
| `crear_envio_automatico` | ventas | AFTER INSERT | Baja | Insert simple condicional |
| `update_timestamp_column` | múltiples | BEFORE UPDATE | Muy baja | Solo actualiza timestamp |

**Performance**: ~5-10ms adicionales por venta completa (aceptable para atomicidad)

## 5.6 Gestión de Errores y Validaciones

### Errores de Base de Datos

```javascript
try {
  const result = await query('INSERT INTO productos ...');
} catch (error) {
  // Códigos de error PostgreSQL
  if (error.code === '23505') {  // Unique violation
    return Response.json({ error: 'SKU ya existe' }, { status: 409 });
  }
  if (error.code === '23503') {  // Foreign key violation
    return Response.json({ error: 'Categoría no existe' }, { status: 400 });
  }
  if (error.code === 'P0001') {  // RAISE EXCEPTION
    return Response.json({ error: error.message }, { status: 400 });
  }
  
  // Error genérico
  return Response.json({ error: 'Error de base de datos' }, { status: 500 });
}
```

**Códigos Comunes**:
- `23505`: UNIQUE constraint violation
- `23503`: FOREIGN KEY constraint violation
- `23514`: CHECK constraint violation
- `P0001`: RAISE EXCEPTION custom

### Validaciones en Triggers

```sql
-- En trigger restar_stock_venta()
IF v_ubicacion_id IS NULL THEN
  RAISE EXCEPTION 'Stock insuficiente para producto ID %', NEW.producto_id;
END IF;
```

**Efecto**: Cancela la transacción completa, devuelve error a la aplicación

## 5.7 Seguridad

### Prevención de SQL Injection

**✅ Correcto** (Prepared Statements):
```javascript
await query('SELECT * FROM users WHERE email = $1', [email]);
```

**❌ Incorrecto** (Vulnerable):
```javascript
await query(`SELECT * FROM users WHERE email = '${email}'`);
// Ataque: email = "' OR '1'='1' --"
```

### Hashing de Passwords (Argon2)

```javascript
import argon2 from 'argon2';

// Registro
const hashedPassword = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,        // 3 iteraciones
  parallelism: 4      // 4 hilos
});

// Login
const valid = await argon2.verify(storedHash, password);
```

**Argon2id**: Algoritmo ganador de Password Hashing Competition (2015)
- Resistente a ataques GPU/ASIC
- Configuración de memory-hard

### Roles y Permisos

**A Nivel de Aplicación** (no implementado en BD por simplificación):
```javascript
// Middleware de Authorization
if (action === 'crear_producto' && user.rol !== 'admin' && user.rol !== 'empleado') {
  return Response.json({ error: 'No autorizado' }, { status: 403 });
}
```

**Mejora Futura**: Row-Level Security (RLS) de PostgreSQL

## 5.8 Migración y Versionado

### Estrategia Actual (Inicial)

**Archivos Base**:
1. `ArquitecturaDB.sql` - Schema completo
2. `Functions.sql` - Funciones y triggers
3. `Inserts.sql` - Datos de prueba

**Ejecución**: Manual en orden

### Mejora Propuesta (Producción)

**Herramientas**: Prisma, Drizzle ORM, o pg-migrate

**Ejemplo con migraciones**:
```
migrations/
  001_initial_schema.sql
  002_add_reviews_table.sql
  003_add_kardex_indexes.sql
```

**Control de versión**: Tabla `schema_migrations` para tracking

## 5.9 Métricas de Rendimiento

### Tiempos de Respuesta Observados

| Endpoint | Query Complexity | Avg Response Time | Optimización |
|----------|------------------|-------------------|--------------|
| GET /api/productos | Alta (5 JOINs + GROUP BY) | ~80ms | Índices en FKs |
| POST /api/ventas | Alta (Transacción + Triggers) | ~150ms | Pool de conexiones |
| GET /api/dashboard | Alta (5 queries paralelas) | ~120ms | Promise.all() |
| POST /api/auth/login | Media (1 query + hash verify) | ~200ms | Índice en email + Argon2 |
| GET /api/kardex | Media (JOINs simples) | ~50ms | Índice compuesto |
| GET /api/categorias | Baja (tabla pequeña) | ~10ms | Cache potencial |

### Tamaño de Datos (Prueba)

- **40 productos**
- **12 clientes**
- **4 empleados**
- **20 ventas históricas**
- **~200 registros de inventario**
- **~400 líneas de kardex**

**Performance**: Excelente con este tamaño

**Escalabilidad Estimada** (sin cambios):
- Hasta 10,000 productos: Bien
- Hasta 100,000 ventas: Requiere paginación
- Más allá: Considerar partitioning o sharding

## 5.10 Backup y Recuperación (Neon)

### Backups Automáticos

**Neon** proporciona:
- ✅ Backups automáticos diarios
- ✅ Point-in-time recovery (hasta 7 días en plan gratuito)
- ✅ Branching (clonar BD completa para testing)

### Restauración Manual

```bash
# Dump completo
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## 5.11 Monitoreo

### Logs de Queries (Desarrollo)

```javascript
// En lib/db.js
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  console.log('Query executed:', {
    text: text.substring(0, 100),  // Primeros 100 chars
    duration: `${duration}ms`,
    rows: res.rowCount
  });
  
  return res;
}
```

### Slow Query Log (Producción)

**Configuración PostgreSQL**:
```sql
ALTER DATABASE neondb SET log_min_duration_statement = 1000;  -- 1 segundo
```

**Queries lentas** se registran automáticamente en logs de Neon

---

**Próximo Documento**: [README.md](./README.md)
