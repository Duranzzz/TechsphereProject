-- Limpiar tablas (Orden inverso de dependencias)
TRUNCATE TABLE 
    kardex, garantias, envios, detalles_venta, detalles_compra, ventas, compras, 
    inventario, reviews, productos, proveedores, empleados, cliente_direcciones, clientes, 
    users, ubicaciones, metodos_pago, marcas, categorias, direcciones
CASCADE;

-- Reiniciar secuencias
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categorias_id_seq RESTART WITH 1;
ALTER SEQUENCE marcas_id_seq RESTART WITH 1;
ALTER SEQUENCE metodos_pago_id_seq RESTART WITH 1;
ALTER SEQUENCE ubicaciones_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE cliente_direcciones_id_seq RESTART WITH 1;
ALTER SEQUENCE empleados_id_seq RESTART WITH 1;
ALTER SEQUENCE proveedores_id_seq RESTART WITH 1;
ALTER SEQUENCE direcciones_id_seq RESTART WITH 1;
ALTER SEQUENCE productos_id_seq RESTART WITH 1;
ALTER SEQUENCE inventario_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;
ALTER SEQUENCE compras_id_seq RESTART WITH 1;
ALTER SEQUENCE detalles_compra_id_seq RESTART WITH 1;
ALTER SEQUENCE ventas_id_seq RESTART WITH 1;
ALTER SEQUENCE detalles_venta_id_seq RESTART WITH 1;
ALTER SEQUENCE envios_id_seq RESTART WITH 1;
ALTER SEQUENCE garantias_id_seq RESTART WITH 1;
ALTER SEQUENCE kardex_id_seq RESTART WITH 1;

-- ========================================
-- 1. CATÁLOGOS BASE
-- ========================================

-- Métodos de Pago
INSERT INTO metodos_pago (nombre) VALUES 
('efectivo'), 
('tarjeta'), 
('transferencia'), 
('qr'),
('paypal');

-- Direcciones (Base)
INSERT INTO direcciones (calle, ciudad, estado, pais) VALUES 
('Av. Principal 123', 'Santa Cruz', 'Santa Cruz', 'Bolivia'), -- 1: Almacén Central
('Av. Banzer 4to Anillo', 'Santa Cruz', 'Santa Cruz', 'Bolivia'), -- 2: Tienda Norte
('Barrio Sirari, Calle 1', 'Santa Cruz de la Sierra', 'Santa Cruz', 'Bolivia'), -- 3: Cliente 1
('Barrio Equipetrol, Calle 2', 'Yacuiba', 'Tarija', 'Bolivia'), -- 4: Cliente 2
('Av. 9 de Julio', 'Buenos Aires', 'Buenos Aires', 'Argentina'), -- 5: Cliente 3
('Rua da Prata', 'Lisboa', 'Lisboa', 'Portugal'), -- 6: Cliente 4
('123 Tech St, Silicon Valley', 'San Francisco', 'California', 'USA'), -- 7: Proveedor 1
('Oficina Central', 'Santa Cruz', 'Santa Cruz', 'Bolivia'); -- 8: Empleado 1

-- Ubicaciones (Tiendas/Almacenes)
INSERT INTO ubicaciones (nombre, tipo, direccion_id) VALUES 
('Almacén Central', 'almacen', 1),
('Tienda Norte', 'tienda', 2);

-- Categorías
INSERT INTO categorias (nombre, descripcion, activa) VALUES 
('Smartphones', 'Teléfonos inteligentes y accesorios', true),
('Laptops', 'Computadoras portátiles y ultrabooks', true),
('Gaming', 'Equipos y accesorios para gaming', true),
('Audio', 'Auriculares, parlantes y equipos de audio', true),
('Accesorios', 'Cables, cargadores y otros accesorios', true),
('Tabletas', 'Dispositivos portátiles para trabajo y entretenimiento', true),
('Wearables', 'Relojes inteligentes y dispositivos de fitness', true);

-- Marcas
INSERT INTO marcas (nombre, pais_origen, sitio_web) VALUES 
('Apple', 'Estados Unidos', 'https://apple.com'),
('Samsung', 'Corea del Sur', 'https://samsung.com'),
('Sony', 'Japón', 'https://sony.com'),
('Dell', 'Estados Unidos', 'https://dell.com'),
('ASUS', 'Taiwán', 'https://asus.com'),
('HP', 'Estados Unidos', 'https://hp.com'),
('Lenovo', 'China', 'https://lenovo.com'),
('Redragon', 'China', 'https://redragonzone.com');

-- ========================================
-- 2. USUARIOS Y ENTIDADES
-- ========================================

-- Users (Passwords are placeholders/hashed)
INSERT INTO users (nombre, email, password, rol) VALUES 
('Admin TechSphere', 'admin@techsphere.com', '$argon2id$v=19$m=65536,t=3,p=4$jCDeAaFRH7yzJxVhpuNIbw$mrBdakeMTViLISq4AqFqrVoDp9zFs5MPCCXF/b6Lv6Y', 'admin'), -- 1
('Vendedor Default', 'vendedor@techsphere.com', '$argon2id$v=19$m=65536,t=3,p=4$WPCtdrShDoL+6gp1vIzZzg$L41IJFME9cawQm/p32+p0l4W77z5DwIOCDqpxzHl2HI', 'empleado'), -- 2
('Leonardo Duran', 'leonardoduran@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$placeholder', 'cliente'), -- 3
('Marcelo Aguilera', 'marceloaguilera@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$placeholder', 'cliente'), -- 4
('Leonel Messi', 'leonelmessi@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$placeholder', 'cliente'), -- 5
('Cristiano Ronaldo', 'cristianoronaldo@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$placeholder', 'cliente'); -- 6

-- Clientes
-- Clientes
INSERT INTO clientes (nombre, apellido, telefono, tipo, activo, user_id) VALUES 
('Leonardo', 'Duran', '+59173111977', 'consumidor_final', true, 3),
('Marcelo', 'Aguilera', '+59161975956', 'consumidor_final', true, 4),
('Leonel', 'Messi', '1234567890', 'consumidor_final', true, 5),
('Cristiano', 'Ronaldo', '0987654321', 'consumidor_final', true, 6);

-- Cliente Direcciones (Vincular direcciones existentes a clientes)
INSERT INTO cliente_direcciones (cliente_id, direccion_id, alias, es_principal) VALUES
(1, 3, 'Casa', true), -- Leonardo -> Dirección 3
(2, 4, 'Casa', true), -- Marcelo -> Dirección 4
(3, 5, 'Casa', true), -- Messi -> Dirección 5
(4, 6, 'Casa', true); -- CR7 -> Dirección 6

-- Empleados
INSERT INTO empleados (nombre, apellido, telefono, puesto, activo, user_id, direccion_id) VALUES 
('Vendedor', 'Default', '+59170000000', 'vendedor', true, 2, 8);

-- Proveedores (Sin usuario asociado por ahora)
INSERT INTO proveedores (nombre, contacto, telefono, email, activo, direccion_id) VALUES 
('Tech Distributors Inc.', 'Carlos Méndez', '+59173111977', 'techdistributors@gmail.com', true, 7);

-- ========================================
-- 3. PRODUCTOS E INVENTARIO
-- ========================================

-- Productos
INSERT INTO productos (nombre, descripcion, precio, precio_costo, categoria_id, marca_id, sku, imagen_url) VALUES 
('iPhone 15 Pro', 'Smartphone premium con chip A17 Pro', 1299.99, 950.00, 1, 1, 'IPH15PRO', 'https://nextlevel.com.bo/cdn/shop/files/IPHONE15PROMAX_256_1024x1024@2x.jpg?v=1728942145'),
('MacBook Air M2', 'Laptop ultradelgada con chip M2', 1199.99, 850.00, 2, 1, 'MBA-M2', 'https://www.machines.com.my/cdn/shop/files/MacBook_Air_13_in_Midnight_PDP_Image_Position-1__WWEN.jpg?v=1730310712&width=713'),
('Galaxy S24 Ultra', 'Smartphone Android flagship', 1199.99, 880.00, 1, 2, 'GS24ULTRA', 'https://incomm.com.bn/img/uploaditemdetail/dt17490ded155d25242556c60e92ba9d202f691593.png'),
('PlayStation 5', 'Consola de videojuegos de última generación', 499.99, 380.00, 3, 3, 'PS5-STD', 'https://www.jbhifi.com.au/cdn/shop/files/784128-Product-0-I-638616198003053141.jpg?v=1726542858'),
('AirPods Pro', 'Auriculares inalámbricos con cancelación de ruido', 249.99, 180.00, 4, 1, 'APP-GEN2', 'https://www.ismartbolivia.com/wp-content/uploads/2020/05/MQD83-800x800.jpeg'),
('Dell XPS 13', 'Laptop premium con pantalla InfinityEdge', 999.99, 700.00, 2, 4, 'XPS13-2024', 'https://www.jbhifi.com.au/cdn/shop/files/796191-Product-0-I-638777674218331408.jpg?v=1742170692'),
('iPad Pro 12.9"', 'Tableta profesional con chip M2', 1099.99, 800.00, 6, 1, 'IPADPRO12-9', 'https://istore.co.bw/cdn/shop/products/iPad_ProM2_WiFi_Cellular_SpaceGrey_Position1_9d3a94d3-ea4c-4a06-977b-02572cbbf9b6_2048x.png?v=1677825158');

-- Inventario (Asignando stock al Almacén Central)
INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible, cantidad_minima) VALUES 
(1, 1, 25, 5), -- iPhone
(2, 1, 15, 3), -- MacBook
(3, 1, 20, 5), -- Galaxy
(4, 1, 10, 2), -- PS5
(5, 1, 50, 10), -- AirPods
(6, 1, 18, 4), -- Dell
(7, 1, 29, 5); -- iPad

-- ========================================
-- 4. TRANSACCIONES (EJEMPLOS)
-- ========================================

-- Ventas (Nota: metodo_pago_id 1 = efectivo, 2 = tarjeta)
INSERT INTO ventas (cliente_id, empleado_id, subtotal, impuestos, total, estado, metodo_pago_id) VALUES 
(1, 1, 1299.99, 0, 1299.99, 'completada', 2), -- Venta 1
(2, 1, 249.99, 0, 249.99, 'completada', 1);  -- Venta 2

-- Detalles Venta
INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario, descuento) VALUES 
(1, 1, 1, 1299.99, 0), -- iPhone en Venta 1
(2, 5, 1, 249.99, 0);  -- AirPods en Venta 2

-- Kardex (Movimientos iniciales de inventario)
INSERT INTO kardex (producto_id, ubicacion_id, tipo_movimiento, cantidad, saldo_anterior, saldo_actual, observacion) VALUES 
(1, 1, 'inventario_inicial', 25, 0, 25, 'Carga inicial'),
(2, 1, 'inventario_inicial', 15, 0, 15, 'Carga inicial'),
(3, 1, 'inventario_inicial', 20, 0, 20, 'Carga inicial'),
(4, 1, 'inventario_inicial', 10, 0, 10, 'Carga inicial'),
(5, 1, 'inventario_inicial', 50, 0, 50, 'Carga inicial'),
(6, 1, 'inventario_inicial', 18, 0, 18, 'Carga inicial'),
(7, 1, 'inventario_inicial', 29, 0, 29, 'Carga inicial');

-- Reviews (Ejemplos)
INSERT INTO reviews (producto_id, cliente_id, calificacion, comentario, verificado) VALUES 
(1, 1, 5, 'Excelente teléfono, la cámara es increíble.', true),
(5, 2, 4, 'Buen sonido, pero la batería podría durar más.', true);