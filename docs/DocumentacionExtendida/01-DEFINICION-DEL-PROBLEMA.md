# 1. Definición del Problema

## 1.1 Contexto

En el mercado boliviano de tecnología, las tiendas enfrentan desafíos significativos en la gestión integral de sus operaciones comerciales. **TechSphere** surge como respuesta a la necesidad de un sistema robusto que permita gestionar eficientemente todos los aspectos de una tienda de tecnología moderna.

### Problemática Identificada

Las tiendas de tecnología tradicionales enfrentan:

1. **Gestión de Inventario Multi-ubicación**: Dificultad para controlar stock en múltiples tiendas y almacenes
2. **Trazabilidad de Movimientos**: Falta de registro histórico detallado de entradas y salidas de productos (Kardex)
3. **Proceso de Ventas Ineficiente**: Registro manual propenso a errores, sin validación automática de stock
4. **Control de Garantías**: Seguimiento deficiente de garantías de productos vendidos
5. **Gestión de Proveedores**: Falta de integración entre compras y actualización de inventario
6. **Análisis de Negocio**: Ausencia de reportes y métricas en tiempo real para toma de decisiones
7. **Experiencia del Cliente**: Sin sistema de reviews, seguimiento de pedidos ni historial de compras

## 1.2 Objetivos del Sistema

### Objetivo General

Desarrollar un sistema integral de gestión para tiendas de tecnología que permita administrar eficientemente productos, inventario, ventas, compras, clientes, empleados y proveedores, con trazabilidad completa de operaciones y análisis de negocio en tiempo real.

### Objetivos Específicos

1. **Gestión de Inventario**:
   - Controlar stock en múltiples ubicaciones (tiendas y almacenes)
   - Registro automático de movimientos en Kardex
   - Alertas de stock bajo
   - Selección automática de ubicación óptima para despacho

2. **Proceso de Ventas**:
   - Registro transaccional de ventas con validación de stock
   - Generación automática de garantías
   - Creación automática de envíos
   - Soporte para múltiples métodos de pago
   - Descuento de inventario automático

3. **Gestión de Compras**:
   - Registro de órdenes de compra a proveedores
   - Actualización automática de inventario al recibir mercancía
   - Actualización de precios de costo

4. **Gestión de Clientes y Usuarios**:
   - Sistema de autenticación seguro (Argon2)
   - Roles diferenciados (admin, empleado, cliente, proveedor)
   - Registro simplificado con función almacenada
   - Gestión de múltiples direcciones por cliente

5. **Trazabilidad y Auditoría**:
   - Kardex automático de movimientos de inventario
   - Timestamps automáticos (created_at, updated_at)
   - Historial de ventas y compras

6. **Análisis y Reportes**:
   - Dashboard con métricas clave (ventas del día, mes, productos más vendidos)
   - Reportes de stock bajo
   - Análisis de reviews y calificaciones
   - Historial de ventas por cliente

## 1.3 Alcance del Proyecto

### Funcionalidades Incluidas

#### Módulo de Productos
- ✅ CRUD completo de productos
- ✅ Categorización y marcas
- ✅ Imágenes y descripciones
- ✅ Control de productos activos/inactivos (soft delete)
- ✅ SKU único por producto
- ✅ Días de garantía configurables

#### Módulo de Inventario
- ✅ Gestión multi-ubicación (4 ubicaciones: 3 tiendas + 1 almacén)
- ✅ Control de stock disponible y reservado
- ✅ Cantidad mínima configurable por ubicación
- ✅ Kardex automático con triggers
- ✅ Validación de stock antes de ventas

#### Módulo de Ventas
- ✅ Proceso transaccional completo (BEGIN/COMMIT/ROLLBACK)
- ✅ Ventas a clientes registrados y no registrados
- ✅ Múltiples productos por venta
- ✅ Descuentos por producto
- ✅ Generación automática de garantías
- ✅ Creación automática de envíos
- ✅ Estados de venta (pendiente, completada, cancelada)

#### Módulo de Compras
- ✅ Registro de compras a proveedores
- ✅ Múltiples productos por compra
- ✅ Actualización automática de inventario (UPSERT)
- ✅ Actualización de precio de costo

#### Módulo de Clientes
- ✅ Registro con función almacenada
- ✅ Múltiples direcciones por cliente
- ✅ Tipos: consumidor final y empresa
- ✅ Historial de compras
- ✅ Sistema de reviews

#### Módulo de Empleados
- ✅ Gestión de empleados con roles (vendedor, gerente, administrativo)
- ✅ Vinculación con usuarios
- ✅ Tracking de ventas por empleado

#### Módulo de Proveedores
- ✅ Registro y gestión de proveedores
- ✅ Información de contacto
- ✅ Historial de compras

#### Módulo de Autenticación
- ✅ Login seguro con Argon2
- ✅ Registro de usuarios
- ✅ Sistema de roles (admin, empleado, cliente, proveedor)

#### Módulo de Reportes y Analytics
- ✅ Dashboard administrativo
- ✅ Ventas por período
- ✅ Productos más vendidos
- ✅ Stock bajo
- ✅ Reviews por producto

### Funcionalidades Fuera del Alcance

- ❌ Facturación electrónica (QR SIN)
- ❌ Integración con sistemas de pago externos (Stripe, PayPal activas)
- ❌ Marketplace multi-vendor
- ❌ Sistema de notificaciones por email/SMS
- ❌ Aplicación móvil nativa
- ❌ Devoluciones y reembolsos
- ❌ Programa de puntos/fidelidad

## 1.4 Supuestos del Negocio

### Operacionales

1. **Ubicaciones Fijas**: El sistema maneja 4 ubicaciones predefinidas:
   - TechSphere Central (Santa Cruz)
   - TechSphere La Paz
   - TechSphere Cochabamba
   - Almacén Principal (Santa Cruz)

2. **Envíos**: 
   - Todos los envíos tienen un costo fijo de Bs. 50
   - Estado por defecto: "entregado" (asumimos entrega inmediata para simplificación)
   - Se requiere dirección de envío para todas las ventas

3. **Garantías**:
   - Se generan automáticamente al vender un producto
   - Duración configurable por producto (default: 365 días)
   - Una garantía por producto vendido

4. **Stock**:
   - El sistema selecciona automáticamente la ubicación con más stock disponible
   - Cantidad mínima default: 5 unidades
   - No se permiten cantidades negativas

5. **Precios**:
   - Todos los precios en dólares (USD)
   - Impuestos: 0% (simplificación para proyecto académico)
   - Descuentos aplicados por producto, no por venta completa

### Técnicos

1. **Base de Datos**: 
   - PostgreSQL en Neon (Serverless)
   - Zona horaria: America/La_Paz
   - Encoding: UTF8

2. **Autenticación**:
   - Contraseñas hasheadas con Argon2
   - Passwords de prueba: todos usan "usuario123"

3. **Transacciones**:
   - Las ventas se procesan de forma transaccional (BEGIN/COMMIT)
   - Los triggers se ejecutan automáticamente

4. **Soft Deletes**:
   - Productos: se marcan como `activo = false`
   - No se eliminan físicamente para mantener integridad referencial

## 1.5 Requisitos No Funcionales

### Rendimiento
- Consultas optimizadas con 15+ índices
- Uso de columnas calculadas (GENERATED ALWAYS) para evitar cálculos repetitivos
- Pool de conexiones para múltiples peticiones concurrentes

### Seguridad
- Hashing de contraseñas con Argon2 (m=65536, t=3, p=4)
- Validación de roles a nivel de aplicación
- Prepared statements para prevenir SQL Injection

### Integridad de Datos
- Constraints: PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK
- Triggers para automatización (kardex, stock, garantías, envíos)
- Timestamps automáticos (created_at, updated_at)

### Escalabilidad
- Diseño normalizado hasta 3FN
- Separación de concerns (catálogos, transacciones, auxiliares)
- Arquitectura serverless (Neon PostgreSQL)

## 1.6 Beneficios Esperados

### Para el Negocio
1. **Visibilidad**: Conocimiento en tiempo real del estado del inventario en todas las ubicaciones
2. **Eficiencia**: Reducción de errores manuales mediante automatización con triggers
3. **Trazabilidad**: Historial completo de movimientos vía Kardex
4. **Toma de Decisiones**: Dashboard con métricas clave para análisis de negocio
5. **Control**: Gestión centralizada de productos, ventas y compras

### Para los Clientes
1. **Confianza**: Sistema de reviews y calificaciones
2. **Garantías**: Registro automático y seguimiento de garantías
3. **Historial**: Consulta de compras previas
4. **Múltiples Direcciones**: Gestión de direcciones de envío

### Para el Desarrollo Académico
1. **Aplicación Práctica**: Implementación real de conceptos de bases de datos
2. **Normalización**: Diseño hasta 3FN con justificación
3. **Características Avanzadas**: Triggers, funciones almacenadas, views, transacciones
4. **Optimización**: Uso estratégico de índices y columnas calculadas

---

**Próximo Documento**: [02-DISEÑO-RELACIONAL.md](./02-DISEÑO-RELACIONAL.md)
