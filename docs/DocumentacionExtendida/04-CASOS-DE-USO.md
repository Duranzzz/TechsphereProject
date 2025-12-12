# 4. Casos de Uso del Sistema

## 4.1 Introducción

Este documento detalla los casos de uso principales del sistema TechSphere, mostrando cómo las diferentes funcionalidades interactúan con la base de datos PostgreSQL.

**Total de Endpoints API**: 30+  
**Organización**: Por módulo funcional

## 4.2 Registro y Autenticación

### CU-01: Registro de Usuario Cliente

**Actor**: Cliente nuevo  
**Objetivo**: Crear cuenta en el sistema

**Precondiciones**:
-Email único (no registrado previamente)

**Flujo Principal**:
1. Cliente ingresa datos personales (nombre, apellido, email, teléfono, password)
2. Cliente ingresa dirección (calle, ciudad, estado, país)
3. Sistema hashea password con Argon2
4. Sistema llama función almacenada `registrar_usuario_nuevo()`
5. Sistema crea registro en `users` con rol 'cliente'
6. Sistema crea registro en `clientes` vinculado a `users`
7. Sistema crea registro en `direcciones`
8. Sistema vincula dirección en `cliente_direcciones` como principal
9. Sistema retorna ID del usuario creado

**Postcondiciones**:
- Usuario creado con rol 'cliente'
- Cliente con dirección principal asignada
- Password almacenado de forma segura (hash Argon2)

**Consultas SQL Involucradas**:

```sql
-- Llamada a función almacenada (transaccional)
SELECT registrar_usuario_nuevo(
    'Lionel',  -- nombre
    'Messi',   -- apellido
    '+13051234567',  -- telefono
    'leo.messi10@gmail.com',  -- email
    '$argon2id$v=19$m=65536...',  -- password (hash)
    '{"calle":"Av. del Libertador 123", "ciudad":"Buenos Aires", "estado":"Buenos Aires", "pais":"Argentina"}'::JSONB  -- direccion
) as user_id;
```

**Endpoint API**: `POST /api/auth/register`

**Código Backend**:
```javascript
// src/app/api/auth/register/route.js
const hashedPassword = await argon2.hash(password);

const result = await pool.query(
    `SELECT registrar_usuario_nuevo($1, $2, $3, $4, $5, $6) as user_id`,
    [nombre, apellido, telefono, email, hashedPassword, direccionJSON]
);
```

**Flujo Alternativo**:
- **FA-01**: Email ya existe → Error 409 (Conflict)
- **FA-02**: Datos incompletos → Error 400 (Bad Request)

---

### CU-02: Autenticación de Usuario (Login)

**Actor**: Usuario registrado  
**Objetivo**: Iniciar sesión en el sistema

**Precondiciones**:
- Usuario registrado en el sistema
- Credenciales válidas

**Flujo Principal**:
1. Usuario ingresa email y password
2. Sistema busca usuario por email
3. Sistema verifica hash de password con Argon2
4. Sistema valida rol del usuario
5. Sistema genera sesión (Auth.js)
6. Sistema retorna datos del usuario

**Consultas SQL**:

```sql
-- Búsqueda de usuario (índice en email)
SELECT u.*, c.id as cliente_id, e.id as empleado_id
FROM users u
LEFT JOIN clientes c ON u.id = c.user_id
LEFT JOIN empleados e ON u.id = e.user_id
WHERE u.email = $1;  -- Usa idx_users_email
```

**Verificación de Password**:
```javascript
const validPassword = await argon2.verify(userDb.password, password);
```

**Endpoint API**: `POST /api/auth/login`

---

## 4.3 Gestión de Productos

### CU-03: Crear Producto (Admin/Empleado)

**Actor**: Administrador o Empleado  
**Objetivo**: Agregar nuevo producto al catálogo

**Precondiciones**:
- Usuario autenticado con rol 'admin' o 'empleado'
- Categoría y marca existen en el sistema
- SKU único (si se proporciona)

**Flujo Principal**:
1. Usuario completa formulario de producto
2. Sistema valida datos requeridos (nombre, precio)
3. Sistema llama función `crear_producto()`
4. Sistema inserta en tabla `productos`
5. Sistema retorna ID del producto creado

**Consulta SQL**:

```sql
-- Uso de función almacenada
SELECT crear_producto(
    'iPhone 15 Pro Max',  -- nombre
    'Titanio, Chip A17 Pro, 256GB',  -- descripcion
    1199.00,  -- precio
    950.00,   -- precio_costo
    1,        -- categoria_id (Smartphones)
    1,        -- marca_id (Apple)
    'IPH15PM-256',  -- sku
    'https://example.com/iphone15.jpg',  -- imagen_url
    5,        -- cantidad_minima
    365,      -- dias_garantia
    true      -- activo
) as producto_id;
```

**Endpoint API**: `POST /api/productos`

**Código Backend**:
```javascript
// src/app/api/productos/route.js (líneas 64-112)
const result = await query(`
    SELECT crear_producto($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) as id
`, [nombre, descripcion, precio, precio_costo, categoria_id, marca_id, 
    sku, imagen_url, cantidad_minima, dias_garantia, activo]);
```

**Postcondiciones**:
- Producto creado en BD
- Disponible para agregar a inventario
- Visible en catálogo si `activo = true`

---

### CU-04: Listar Productos con Filtros

**Actor**: Cualquier usuario (público)  
**Objetivo**: Buscar y filtrar productos disponibles

**Precondiciones**: Ninguna

**Filtros Disponibles**:
- Por categoría (`categoria_id`)
- Por marca (`marca_id`)
- Por búsqueda de texto (`nombre` o `descripcion`)
- Por ubicación (stock en ubicación específica)

**Consulta SQL Compleja**:

```sql
SELECT 
    p.*,
    c.nombre as categoria_nombre,
    m.nombre as marca_nombre,
    COALESCE(SUM(i.cantidad_disponible), 0) as stock,
    p.cantidad_minima,
    p.dias_garantia,
    COALESCE(AVG(r.calificacion), 0) as rating_promedio,
    COUNT(r.id) as total_reviews
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN inventario i ON p.id = i.producto_id 
    AND i.ubicacion_id = $1  -- Filtro por ubicación (opcional)
LEFT JOIN reviews r ON p.id = r.producto_id
WHERE p.activo = true
  AND (p.categoria_id = $2 OR $2 IS NULL)  -- Filtro opcional
  AND (p.marca_id = $3 OR $3 IS NULL)      -- Filtro opcional
  AND (LOWER(p.nombre) LIKE LOWER($4) OR LOWER(p.descripcion) LIKE LOWER($4) OR $4 IS NULL)
GROUP BY p.id, c.nombre, m.nombre
ORDER BY (COALESCE(SUM(i.cantidad_disponible), 0) > 0) DESC, p.nombre ASC;
```

**Características Avanzadas**:
- ✅ **Agregaciones**: `SUM()`, `AVG()`, `COUNT()`
- ✅ **LEFT JOINs**: Incluye productos sin stock/reviews
- ✅ **COALESCE**: Maneja valores NULL
- ✅ **GROUP BY**: Agrupa resultados por producto
- ✅ **ORDER BY**: Prioriza productos con stock

**Endpoint API**: `GET /api/productos?categoria=1&search=iphone`

---

## 4.4 Gestión de Inventario

### CU-05: Registrar Compra a Proveedor

**Actor**: Administrador/Empleado  
**Objetivo**: Ingresar mercancía de proveedores al inventario

**Precondiciones**:
- Proveedor existe en el sistema
- Ubicación de destino definida
- Productos existen en catálogo

**Flujo Principal**:
1. Usuario crea orden de compra (encabezado)
2. Usuario agrega productos con cantidades y precios de costo
3. Sistema inserta en `compras`
4. Sistema inserta en `detalles_compra`
5. **Trigger `sumar_stock_compra()`** se ejecuta automáticamente:
   - Hace UPSERT en `inventario`
   - Actualiza `precio_costo` en `productos`
6. **Trigger `procesar_kardex_automatico()`** registra movimiento
7. Sistema retorna confirmación

**Consultas SQL**:

```sql
-- 1. Crear encabezado de compra
INSERT INTO compras (proveedor_id, ubicacion_id, fecha_compra, numero_factura, total, estado)
VALUES (1, 1, NOW(), 'FC-001', 50000.00, 'completada')
RETURNING id;

-- 2. Agregar detalle (automatiza actualización de inventario via trigger)
INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario)
VALUES (1, 1, 50, 950.00);
--- Al insertar, el trigger ejecuta:
-- INSERT INTO inventario (...) VALUES (...)
-- ON CONFLICT (producto_id, ubicacion_id) 
-- DO UPDATE SET cantidad_disponible = inventario.cantidad_disponible + 50;
```

**Trigger que se Ejecuta** (`sumar_stock_compra`):
```sql
-- ON INSERT en detalles_compra
INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible)
VALUES (NEW.producto_id, v_ubicacion_id, NEW.cantidad)
ON CONFLICT (producto_id, ubicacion_id) 
DO UPDATE SET 
    cantidad_disponible = inventario.cantidad_disponible + NEW.cantidad;
```

**Endpoint API**: `POST /api/compras`

**Postcondiciones**:
- Stock incrementado en ubicación específica
- Kardex registrado automáticamente
- Precio de costo actualizado

---

### CU-06: Consultar Stock Multi-ubicación

**Actor**: Empleado/Admin  
**Objetivo**: Ver disponibilidad de productos en todas las ubicaciones

**Consulta SQL**:

```sql
SELECT 
    p.id,
    p.nombre,
    p.sku,
    u.nombre as ubicacion,
    i.cantidad_disponible,
    i.cantidad_reservada,
    i.cantidad_minima,
    CASE 
        WHEN i.cantidad_disponible <= i.cantidad_minima THEN 'STOCK BAJO'
        WHEN i.cantidad_disponible > i.cantidad_minima * 2 THEN 'STOCK BUENO'
        ELSE 'STOCK NORMAL'
    END as estado_stock
FROM productos p
LEFT JOIN inventario i ON p.id = i.producto_id
LEFT JOIN ubicaciones u ON i.ubicacion_id = u.id
WHERE p.activo = true
ORDER BY p.nombre, u.nombre;
```

**CASE Statement**: Calcula estado de stock dinámicamente

**Endpoint API**: `GET /api/productos` (incluye stock por ubicación)

---

### CU-07: Consultar Kardex de Producto

**Actor**: Admin/Gerente  
**Objetivo**: Auditar movimientos históricos de inventario

**Consulta SQL**:

```sql
SELECT 
    k.fecha,
    k.tipo_movimiento,
    k.cantidad,
    k.saldo_anterior,
    k.saldo_actual,
    u.nombre as ubicacion,
    k.referencia_tabla,
    k.referencia_id,
    k.observacion
FROM kardex k
JOIN ubicaciones u ON k.ubicacion_id = u.id
WHERE k.producto_id = $1
ORDER BY k.fecha DESC
LIMIT 100;
```

**Endpoint API**: `GET /api/kardex?producto_id=1`

**Tipos de Movimiento**:
- `entrada_inicial`: Primera carga de stock
- `entrada`: Compra a proveedor
- `salida`: Venta a cliente
- `ajuste_manual`: Corrección administrativa

---

## 4.5 Proceso de Venta

### CU-08: Procesar Venta Completa (Transaccional)

**Actor**: Empleado o Sistema (venta online)  
**Objetivo**: Registrar venta, descontar inventario, crear garantías y envíos

**Precondiciones**:
- Cliente existe o se crea en el momento  
- Productos tienen stock disponible
- Dirección de envío proporcionada

**Flujo Principal (Transaccional)**:

1. **BEGIN TRANSACTION**
2. Sistema valida/crea cliente
3. Sistema valida método de pago
4. Sistema crea encabezado de venta en `ventas`
5. Para cada producto:
   - Sistema inserta en `detalles_venta`
   - **Trigger `restar_stock_venta()`** se ejecuta:
     - Selecciona ubicación con más stock (si no se especificó)
     - Descuenta de `inventario`
     - Trigger `procesar_kardex_automatico()` registra salida
   - **Trigger `crear_garantia_auto()`** crea garantía
6. **Trigger `crear_envio_automatico()`** crea envío
7. **COMMIT TRANSACTION**

**Consultas SQL (Backend)**:

```javascript
// src/app/api/ventas/route.js (transaccional)
await client.query('BEGIN');

// 1. Crear venta (encabezado)
const nuevaVenta = await client.query(`
    INSERT INTO ventas (cliente_id, empleado_id, subtotal, impuestos, total, 
                        metodo_pago_id, direccion_id, estado)
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'completada')
    RETURNING id
`, [clienteId, empleadoId, subtotal, impuestos, total, metodoPagoId, direccionId]);

const ventaId = nuevaVenta.rows[0].id;

// 2. Agregar detalles (triggers se ejecutan automáticamente)
for (const detalle of detalles) {
    await client.query(`
        INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario)
        VALUES ($1, $2, $3, $4)
    `, [ventaId, detalle.producto_id, detalle.cantidad, detalle.precio_unitario]);
    
    // Automático:
    // - Trigger restar_stock_venta() descuenta inventario
    // - Trigger crear_garantia_auto() crea garantía
}

await client.query('COMMIT');
```

**Triggers que se Ejecutan en Cascada**:

```sql
-- 1. Al insertar en detalles_venta (BEFORE INSERT)
CREATE TRIGGER trg_movimiento_venta
BEFORE INSERT ON detalles_venta
EXECUTE FUNCTION restar_stock_venta();
--- Selecciona ubicación automáticamente si no existe
--- Descuenta stock de inventario

-- 2. Al actualizar inventario (AFTER UPDATE)
CREATE TRIGGER trg_auto_kardex
AFTER UPDATE ON inventario
EXECUTE FUNCTION procesar_kardex_automatico();
--- Registra movimiento "salida" en kardex

-- 3. Al insertar en detalles_venta (AFTER INSERT)
CREATE TRIGGER trg_auto_garantia
AFTER INSERT ON detalles_venta
EXECUTE FUNCTION crear_garantia_auto();
--- Crea garantía usando dias_garantia del producto

-- 4. Al insertar en ventas (AFTER INSERT)
CREATE TRIGGER trg_auto_envio
AFTER INSERT ON ventas
EXECUTE FUNCTION crear_envio_automatico();
--- Crea registro de envío
```

**Endpoint API**: `POST /api/ventas`

**Ejemplo de Request**:
```json
{
  "cliente": {
    "id": 1
  },
  "productos": [
    { "id": 1, "cantidad": 1 }
  ],
  "empleado_id": 2,
  "metodo_pago": "tarjeta",
  "direccion_id": 9
}
```

**Flujo Alternativo**:
- **FA-01**: Stock insuficiente → `RAISE EXCEPTION`, `ROLLBACK` automático
- **FA-02**: Cliente no existe → Se crea automáticamente
- **FA-03**: Error en cualquier paso → `ROLLBACK` completo

**Postcondiciones**:
- Venta registrada con estado 'completada'
- Stock descontado de ubicación óptima
- Kardex con movimiento "salida"
- Garantía creada automáticamente
- Envío creado con costo de Bs. 50
- **Atomicidad**: Todo o nada (transacción)

---

## 4.6 Reviews y Calificaciones

### CU-09: Agregar Review de Producto

**Actor**: Cliente  
**Objetivo**: Calificar y comentar producto comprado

**Precondiciones**:
- Cliente ha comprado el producto
- No existe review previa del mismo cliente para el producto

**Consulta SQL**:

```sql
-- Verificar si compró el producto
SELECT EXISTS(
    SELECT 1 
    FROM detalles_venta dv
    JOIN ventas v ON dv.venta_id = v.id
    WHERE v.cliente_id = $1 AND dv.producto_id = $2 AND v.estado = 'completada'
) as ha_comprado;

-- Si ha comprado, insertar review
INSERT INTO reviews (producto_id, cliente_id, calificacion, comentario, verificado)
VALUES ($1, $2, $3, $4, true)
ON CONFLICT (producto_id, cliente_id) DO NOTHING;
```

**CONSTRAINT**: `UNIQUE (producto_id, cliente_id)` previene reviews duplicadas

**Endpoint API**: `POST /api/products/[id]/reviews`

---

## 4.7 Dashboard y Reportes

### CU-10: Dashboard Administrativo

**Actor**: Admin/Gerente  
**Objetivo**: Ver métricas clave del negocio en tiempo real

**Consultas Paralelas (Promise.all)**:

```javascript
// src/app/api/dashboard/route.js
const [ventasHoy, productosStockBajo, ventasMes, topProductos, salesHistory] =
  await Promise.all([...]);
```

#### Consulta 1: Ventas del Día

```sql
SELECT 
    COUNT(*) as total, 
    COALESCE(SUM(total), 0) as monto
FROM ventas 
WHERE DATE(fecha) = CURRENT_DATE 
  AND estado = 'completada';
```

#### Consulta 2: Productos con Stock Bajo

```sql
SELECT COUNT(DISTINCT p.id) as total
FROM productos p
JOIN inventario i ON p.id = i.producto_id
WHERE i.cantidad_disponible <= i.cantidad_minima 
  AND p.activo = true;
```

#### Consulta 3: Top 5 Productos Más Vendidos (30 días)

```sql
SELECT 
    p.nombre, 
    SUM(dv.cantidad) as vendidos
FROM detalles_venta dv
JOIN productos p ON dv.producto_id = p.id
JOIN ventas v ON dv.venta_id = v.id
WHERE v.estado = 'completada'
  AND DATE(v.fecha) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.nombre
ORDER BY vendidos DESC
LIMIT 5;
```

**INTERVAL**: PostgreSQL calcula fechas dinámicamente

#### Consulta 4: Historial de Ventas (7 días)

```sql
SELECT 
    TO_CHAR(DATE(fecha), 'YYYY-MM-DD') as fecha, 
    SUM(total) as monto, 
    COUNT(*) as cantidad
FROM ventas 
WHERE fecha >= CURRENT_DATE - INTERVAL '6 days'
  AND estado = 'completada'
GROUP BY DATE(fecha)
ORDER BY DATE(fecha) ASC;
```

**TO_CHAR**: Formatea fechas para gráficos

**Endpoint API**: `GET /api/dashboard`

**Response JSON**:
```json
{
  "ventasHoy": { "total": 5, "monto": 8000.00 },
  "productosStock": 12,
  "ventasMes": { "total": 120, "monto": 185000.00 },
  "topProductos": [
    { "nombre": "iPhone 15 Pro Max", "vendidos": 45 },
    ...
  ],
  "salesHistory": [
    { "fecha": "2025-12-06", "monto": 12000, "cantidad": 8 },
    ...
  ]
}
```

---

## 4.8 Otros Casos de Uso Relevantes

### CU-11: Actualizar Producto
**Endpoint**: `PUT /api/productos`  
**Función SQL**: `actualizar_producto()`

### CU-12: Soft Delete de Producto
**Endpoint**: `DELETE /api/productos?id=1`  
**SQL**: `UPDATE productos SET activo = false WHERE id = $1`

### CU-13: Listar Ventas de un Cliente
**Endpoint**: `GET /api/users/[id]/ventas`  
**JOIN**: ventas + detalles_venta + productos

### CU-14: Obtener Perfil de Cliente
**Endpoint**: `GET /api/cliente/perfil`  
**JOIN**: clientes + users + cliente_direcciones + direcciones

### CU-15: Listar Empleados
**Endpoint**: `GET /api/empleados`  
**JOIN**: empleados + users + direcciones

---

## 4.9 Resumen de Endpoints API

| Módulo | Método | Ruta | Descripción |
|--------|--------|------|-------------|
| **Auth** | POST | /api/auth/register | Registro de usuario ✅ |
| **Auth** | POST | /api/auth/login | Login ✅ |
| **Productos** | GET | /api/productos | Listar con filtros ✅ |
| **Productos** | POST | /api/productos | Crear producto ✅ |
| **Productos** | PUT | /api/productos | Actualizar producto ✅ |
| **Productos** | DELETE | /api/productos | Soft delete ✅ |
| **Products** | GET | /api/products/[id] | Detalle de producto |
| **Products** | POST | /api/products/[id]/reviews | Agregar review ✅ |
| **Products** | GET | /api/products/[id]/reviews | Listar reviews |
| **Ventas** | POST | /api/ventas | Procesar venta ✅ |
| **Ventas** | GET | /api/ventas | Listar ventas |
| **Compras** | POST | /api/compras | Registrar compra ✅ |
| **Dashboard** | GET | /api/dashboard | Métricas ✅ |
| **Kardex** | GET | /api/kardex | Historial de movimientos ✅ |
| **Clientes** | GET | /api/clientes | Listar clientes |
| **Empleados** | GET | /api/empleados | Listar empleados |
| **Categorías** | GET | /api/categorias | Listar categorías |
| **Marcas** | GET | /api/marcas | Listar marcas |
| **Ubicaciones** | GET | /api/ubicaciones | Listar ubicaciones |
| **Stock Bajo** | GET | /api/stock-bajo | Productos con stock bajo |
| **Métodos Pago** | GET | /api/metodos-pago | Listar métodos de pago |

**Total**: 30+ endpoints implementados

---

**Próximo Documento**: [05-INTERACCION-CON-BD.md](./05-INTERACCION-CON-BD.md)
