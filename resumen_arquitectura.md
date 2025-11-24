# Resumen de Arquitectura del Proyecto

Este documento ofrece una visión general de cómo funciona tu aplicación web, describiendo las tecnologías clave y la estructura de archivos.

## Tecnologías Principales

- **Frontend (Interfaz):** React Router v7.
  - Se encarga de lo que ves en el navegador.
  - Utiliza componentes de React para construir la interfaz.
- **Backend (Servidor):** Hono.
  - Un framework web ligero y rápido.
  - Maneja las peticiones API (datos) y sirve la aplicación.
- **Base de Datos:** PostgreSQL (Neon).
  - Donde se guardan tus productos, usuarios y ventas.
  - Se conecta a través de `@neondatabase/serverless`.
- **Autenticación:** Auth.js (anteriormente NextAuth).
  - Maneja el inicio de sesión, sesiones y protección de rutas.

## Estructura de Archivos Importante

### 1. Configuración y Servidor (`/__create`)
Esta carpeta contiene la "magia" que hace funcionar el servidor Hono y la carga automática de rutas.
- **`index.ts`**: El punto de entrada del servidor. Configura Hono, el middleware de autenticación y conecta la base de datos.
- **`route-builder.ts`**: Este archivo escanea tus carpetas en busca de archivos `route.js` y crea automáticamente las rutas de la API. (Aquí fue donde arreglamos el problema de Windows).

### 2. Código de la Aplicación (`/src`)
Aquí vive el código de tu proyecto.

#### Backend / API (`/src/app/api`)
Cada carpeta aquí representa una ruta de tu API.
- **`productos/route.js`**: Maneja la obtención (`GET`) y creación (`POST`) de productos.
- **`dashboard/route.js`**: Calcula los datos para el panel de administración (ventas, stock, etc.).
- **`utils/sql.js`**: Un pequeño archivo utilitario que establece la conexión con tu base de datos Neon.

#### Frontend (`/src/app`)
- **`routes.ts`** (o estructura de carpetas): Define las páginas de tu sitio (Inicio, Admin, Login).
- **`components/`**: Botones, tarjetas de productos, barras de navegación.

### 3. Autenticación (`/src/auth.js`)
Este archivo configura cómo los usuarios inician sesión. Define:
- **Proveedores:** En este caso, "Credentials" (email y contraseña).
- **Adaptador:** Conecta Auth.js con tu base de datos para guardar usuarios y sesiones.

## Flujo de Datos
1. **Usuario entra a la web:** React Router carga la página.
2. **Página pide datos:** El frontend hace una petición a `/api/productos`.
3. **Servidor recibe petición:** Hono recibe la petición y la envía a `src/app/api/productos/route.js`.
4. **Base de Datos:** `route.js` usa `sql.js` para pedir los productos a Neon PostgreSQL.
5. **Respuesta:** Los datos viajan de vuelta al frontend y se muestran en las "cards" de productos.
