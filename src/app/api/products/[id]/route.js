import { query } from '@/lib/db';

export async function loader({ request, params }) {
    const productId = params.id;
    try {
        const result = await query(
            `SELECT p.*, m.nombre as marca_nombre, c.nombre as categoria_nombre,
              COALESCE((SELECT SUM(cantidad_disponible) FROM inventario WHERE producto_id = p.id), 0) as stock,
              (SELECT AVG(calificacion) FROM reviews WHERE producto_id = p.id) as rating_promedio,
              (SELECT COUNT(*) FROM reviews WHERE producto_id = p.id) as total_reviews
       FROM productos p
       LEFT JOIN marcas m ON p.marca_id = m.id
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1`,
            [productId]
        );

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Producto no encontrado' }), { status: 404 });
        }

        return new Response(JSON.stringify(result.rows[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Error fetching product' }), { status: 500 });
    }
}
