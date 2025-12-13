import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	type RouteConfigEntry,
	index,
	route,
} from '@react-router/dev/routes';

// __dirname es la ubicación de ESTE archivo (src/app/)
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// TIPO: Cada nodo representa una carpeta o archivo
type Tree = {
	path: string;           // Ruta completa: "productos" o "producto/[id]"
	children: Tree[];       // Subcarpetas (árbol recursivo)
	hasPage: boolean;       // ¿Tiene page.jsx? → Es una página visible
	hasRoute: boolean;      // ¿Tiene route.js? → Es un endpoint API
	isParam: boolean;       // ¿Es parámetro? [id] → true
	paramName: string;      // Nombre del parámetro: "id"
	isCatchAll: boolean;    // ¿Es catch-all? [...slugs] → true
};

/**
 * FUNCIÓN PRINCIPAL: Escanea recursivamente src/app/
 * Lee el sistema de archivos y construye un árbol de rutas
 * 
 * @param dir - Directorio a escanear (ej: "src/app/productos")
 * @param basePath - Ruta acumulada (ej: "productos")
 * @returns Árbol con toda la estructura de carpetas/archivos
 */
function buildRouteTree(dir: string, basePath = ''): Tree {
	// Leer todos los archivos/carpetas de este directorio
	const files = readdirSync(dir);

	// Crear nodo para esta carpeta
	const node: Tree = {
		path: basePath,
		children: [],
		hasPage: false,
		hasRoute: false,
		isParam: false,
		isCatchAll: false,
		paramName: '',
	};

	// Detectar si la carpeta es un parámetro: [id], [slug], etc.
	const dirName = basePath.split('/').pop();
	if (dirName?.startsWith('[') && dirName.endsWith(']')) {
		node.isParam = true;
		const paramName = dirName.slice(1, -1); // Quitar corchetes: [id] → id

		// Catch-all: [...ids] → Captura múltiples segmentos
		if (paramName.startsWith('...')) {
			node.isCatchAll = true;
			node.paramName = paramName.slice(3); // [...ids] → ids
		} else {
			node.paramName = paramName;
		}
	}

	// Escanear todos los archivos en esta carpeta
	for (const file of files) {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat.isDirectory()) {
			// Es una subcarpeta → Recursión
			const childPath = basePath ? `${basePath}/${file}` : file;
			const childNode = buildRouteTree(filePath, childPath);
			node.children.push(childNode);
		} else if (file === 'page.jsx') {
			// Encontró página visual → Marcar
			node.hasPage = true;
		} else if (file === 'route.js' || file === 'route.ts') {
			// Encontró endpoint API → Marcar
			node.hasRoute = true;
		}
	}

	return node;
}

/**
 * CONVERSOR: Árbol de archivos → Rutas de React Router
 * Transforma la estructura de carpetas en configuración de rutas
 * 
 * EJEMPLOS:
 * • productos/page.jsx → route("/productos", "./productos/page.jsx")
 * • producto/[id]/page.jsx → route("/producto/:id", "./producto/[id]/page.jsx")
 * • api/ventas/route.js → route("/api/ventas", "./api/ventas/route.js")
 */
function generateRoutes(node: Tree): RouteConfigEntry[] {
	const routes: RouteConfigEntry[] = [];

	// CASO 1: Tiene page.jsx → Crear ruta de PÁGINA
	if (node.hasPage) {
		const componentPath =
			node.path === '' ? `./${node.path}page.jsx` : `./${node.path}/page.jsx`;

		if (node.path === '') {
			// Raíz (/) → Usar index()
			routes.push(index(componentPath));
		} else {
			// TRANSFORMAR PARÁMETROS:
			// [id] → :id (React Router syntax)
			// [...ids] → * (catch-all)
			let routePath = node.path;

			const segments = routePath.split('/');
			const processedSegments = segments.map((segment) => {
				if (segment.startsWith('[') && segment.endsWith(']')) {
					const paramName = segment.slice(1, -1);

					// Catch-all: [...ids] → *
					if (paramName.startsWith('...')) {
						return '*';
					}
					// Opcional: [[id]] → :id?
					if (paramName.startsWith('[') && paramName.endsWith(']')) {
						return `:${paramName.slice(1, -1)}?`;
					}
					// Normal: [id] → :id
					return `:${paramName}`;
				}
				return segment;
			});

			routePath = processedSegments.join('/');
			routes.push(route(routePath, componentPath));
		}
	}

	// CASO 2: Tiene route.js → Crear ruta de API
	if (node.hasRoute) {
		const routeFile = readdirSync(node.path ? join(__dirname, node.path) : __dirname)
			.find(f => f === 'route.js' || f === 'route.ts');
		const componentPath = node.path === '' ? `./${routeFile}` : `./${node.path}/${routeFile}`;

		// Misma transformación de parámetros
		let routePath = node.path;
		const segments = routePath.split('/');
		const processedSegments = segments.map((segment) => {
			if (segment.startsWith('[') && segment.endsWith(']')) {
				const paramName = segment.slice(1, -1);
				if (paramName.startsWith('...')) {
					return '*';
				}
				if (paramName.startsWith('[') && paramName.endsWith(']')) {
					return `:${paramName.slice(1, -1)}?`;
				}
				return `:${paramName}`;
			}
			return segment;
		});
		routePath = processedSegments.join('/');

		routes.push(route(routePath, componentPath));
	}

	// RECURSIÓN: Procesar todas las subcarpetas
	for (const child of node.children) {
		routes.push(...generateRoutes(child));
	}

	return routes;
}

// HMR (Hot Module Replacement) en desarrollo
// Detecta cambios en page.jsx y recarga automáticamente
if (import.meta.env.DEV) {
	import.meta.glob('./**/page.jsx', {});
	if (import.meta.hot) {
		import.meta.hot.accept((newSelf) => {
			import.meta.hot?.invalidate();
		});
	}
}

// EJECUTAR: Generar rutas automáticamente
const tree = buildRouteTree(__dirname);
const notFound = route('*?', './__create/not-found.tsx'); // 404
const routes = [...generateRoutes(tree), notFound];

export default routes;
