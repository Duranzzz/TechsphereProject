-- ========================================
-- CLEANUP & RESETS
-- ========================================
TRUNCATE TABLE 
    kardex, garantias, envios, detalles_venta, detalles_compra, ventas, compras, 
    inventario, reviews, productos, proveedores, empleados, cliente_direcciones, clientes, 
    users, ubicaciones, metodos_pago, marcas, categorias, direcciones
CASCADE;

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
('efectivo'), ('tarjeta'), ('transferencia'), ('qr'), ('paypal');

-- Direcciones
INSERT INTO direcciones (calle, ciudad, estado, pais) VALUES 
-- Tiendas
('Av. Cristo Redentor 4to Anillo', 'Santa Cruz', 'Santa Cruz', 'Bolivia'), -- 1: Central
('Calle 21 de Calacoto', 'La Paz', 'La Paz', 'Bolivia'), -- 2: Norte
('Av. Pando', 'Cochabamba', 'Cochabamba', 'Bolivia'), -- 3: Sucursal Valle
('Av. Banzer 8vo Anillo', 'Santa Cruz', 'Santa Cruz', 'Bolivia'), -- 4: Almacén
-- Proveedores
('1 Infinite Loop', 'Cupertino', 'California', 'USA'), -- 5: Apple
('129 Samsung-ro', 'Suwon', 'Gyeonggi-do', 'South Korea'), -- 6: Samsung
('2788 San Tomas Expy', 'Santa Clara', 'California', 'USA'), -- 7: Nvidia
('700 Locust St', 'Dubuque', 'Iowa', 'USA'); -- 8: Tech Distributor

-- Ubicaciones
INSERT INTO ubicaciones (nombre, tipo, direccion_id) VALUES 
('TechSphere Central', 'tienda', 1),
('TechSphere La Paz', 'tienda', 2),
('TechSphere Cochabamba', 'tienda', 3),
('Almacén Principal', 'almacen', 4);

-- Categorías
INSERT INTO categorias (nombre, descripcion, activa) VALUES 
('Smartphones', 'Teléfonos inteligentes gama alta y media', true), -- 1
('Laptops', 'Portátiles para trabajo y gaming', true), -- 2
('Gaming', 'Consolas y periféricos', true), -- 3
('Audio', 'Auriculares y parlantes', true), -- 4
('Accesorios', 'Cables, fundas y cargadores', true), -- 5
('Tabletas', 'iPads y competencia', true), -- 6
('Wearables', 'Smartwatches y bands', true), -- 7
('Inteligencia Artificial', 'Hardware especializado para IA', true); -- 8

-- Marcas
INSERT INTO marcas (nombre, pais_origen, sitio_web) VALUES 
('Apple', 'USA', 'apple.com'), -- 1
('Samsung', 'South Korea', 'samsung.com'), -- 2
('Sony', 'Japan', 'sony.com'), -- 3
('NVIDIA', 'USA', 'nvidia.com'), -- 4
('Logitech', 'Switzerland', 'logitech.com'), -- 5
('ASUS', 'Taiwan', 'asus.com'), -- 6
('Dell', 'USA', 'dell.com'), -- 7
('Google', 'USA', 'store.google.com'), -- 8
('Nintendo', 'Japan', 'nintendo.com'), -- 9
('Microsoft', 'USA', 'microsoft.com'); -- 10

-- ========================================
-- 2. USUARIOS
-- ========================================

INSERT INTO users (nombre, email, password, rol) VALUES 
-- 1. Admin
('Admin TechSphere', 'admin@techsphere.com', '$argon2id$v=19$m=65536,t=3,p=4$jCDeAaFRH7yzJxVhpuNIbw$mrBdakeMTViLISq4AqFqrVoDp9zFs5MPCCXF/b6Lv6Y', 'admin'),
-- 2-5. Vendedores (Actores)
('Leonardo DiCaprio', 'leonardo.dicaprio@techsphere.com', '', 'empleado'),
('Brad Pitt', 'brad.pitt@techsphere.com', '', 'empleado'),
('Scarlett Johansson', 'scarlett.johansson@techsphere.com', '', 'empleado'),
('Robert Downey Jr.', 'robert.downey@techsphere.com', '', 'empleado'),
-- 6-17. Clientes (Futbolistas)
('Lionel Messi', 'leo.messi10@gmail.com', '', 'cliente'),
('Cristiano Ronaldo', 'cr7.siuuu@gmail.com', '', 'cliente'),
('Neymar Jr', 'ney.joya@gmail.com', '', 'cliente'),
('Kylian Mbappé', 'kiki.mbappe@gmail.com', '', 'cliente'),
('Erling Haaland', 'robot.haaland@gmail.com', '', 'cliente'),
('Vinicius Jr', 'vini.bailar@gmail.com', '', 'cliente'),
('Jude Bellingham', 'hey.jude@gmail.com', '', 'cliente'),
('Kevin De Bruyne', 'kdb.assist@gmail.com', '', 'cliente'),
('Luka Modric', 'lukita.magic@gmail.com', '', 'cliente'),
('Mohamed Salah', 'mo.salah@gmail.com', '', 'cliente'),
('Robert Lewandowski', 'lewy.gol@gmail.com', '', 'cliente'),
('Sergio Ramos', 'sr4.camas@gmail.com', '', 'cliente');

-- Empleados
INSERT INTO empleados (nombre, apellido, puesto, activo, user_id) VALUES 
('Leonardo', 'DiCaprio', 'gerente', true, 2),
('Brad', 'Pitt', 'vendedor', true, 3),
('Scarlett', 'Johansson', 'vendedor', true, 4),
('Robert', 'Downey Jr.', 'vendedor', true, 5);

-- Clientes
INSERT INTO clientes (nombre, apellido, telefono, tipo, activo, user_id) VALUES 
('Lionel', 'Messi', '+13051234567', 'consumidor_final', true, 6),
('Cristiano', 'Ronaldo', '+966501234567', 'consumidor_final', true, 7),
('Neymar', 'Jr', '+966507654321', 'consumidor_final', true, 8),
('Kylian', 'Mbappé', '+33612345678', 'consumidor_final', true, 9),
('Erling', 'Haaland', '+447123456789', 'consumidor_final', true, 10),
('Vinicius', 'Jr', '+34612345678', 'consumidor_final', true, 11),
('Jude', 'Bellingham', '+34687654321', 'consumidor_final', true, 12),
('Kevin', 'De Bruyne', '+447987654321', 'empresa', true, 13),
('Luka', 'Modric', '+34655555555', 'consumidor_final', true, 14),
('Mohamed', 'Salah', '+44755555555', 'consumidor_final', true, 15),
('Robert', 'Lewandowski', '+34644444444', 'consumidor_final', true, 16),
('Sergio', 'Ramos', '+34633333333', 'consumidor_final', true, 17);

-- Proveedores
INSERT INTO proveedores (nombre, contacto, email, activo, direccion_id) VALUES 
('Apple Distribution', 'Tim Cook', 'sales@apple.com', true, 5),
('Samsung Partners', 'Jay Y. Lee', 'b2b@samsung.com', true, 6),
('NVIDIA Enterprise', 'Jensen Huang', 'orders@nvidia.com', true, 7),
('Global Tech Wholesalers', 'John Smith', 'contact@globaltech.com', true, 8);

-- ========================================
-- 3. PRODUCTOS (40 ITEMS)
-- ========================================

INSERT INTO productos (nombre, descripcion, precio, precio_costo, categoria_id, marca_id, sku, imagen_url) VALUES 
-- Smartphoness (6)
('iPhone 15 Pro Max', 'Titanio, Chip A17 Pro, 256GB', 1199.00, 950.00, 1, 1, 'IPH15PM-256', ''),
('iPhone 15', 'Aluminio, Chip A16, 128GB', 799.00, 600.00, 1, 1, 'IPH15-128', ''),
('Samsung Galaxy S24 Ultra', 'Titanio, AI, S Pen, 512GB', 1299.00, 980.00, 1, 2, 'S24U-512', ''),
('Samsung Galaxy Z Flip 5', 'Plegable, Pantalla Flex, 256GB', 999.00, 750.00, 1, 2, 'ZFLIP5', ''),
('Google Pixel 8 Pro', 'Cámara AI, Tensor G3', 999.00, 720.00, 1, 8, 'PIXEL8P', ''),
('Sony Xperia 1 V', 'Para creadores, 4K OLED', 1399.00, 1000.00, 1, 3, 'XPERIA1V', ''),

-- Laptops (6)
('MacBook Pro 16 M3 Max', 'La bestia para pros', 3499.00, 2800.00, 2, 1, 'MBP16-M3MAX', ''),
('MacBook Air 15 M2', 'Delgada y ligera', 1299.00, 1000.00, 2, 1, 'MBA15-M2', ''),
('Dell XPS 15', 'Pantalla OLED 3.5K', 2199.00, 1700.00, 2, 7, 'XPS15-9530', ''),
('ASUS ROG Strix Scar 18', 'Gaming extremo RTX 4090', 3899.00, 3100.00, 2, 6, 'ROG-SCAR18', ''),
('Samsung Galaxy Book4 Ultra', 'Pantalla AMOLED 3K', 2399.00, 1900.00, 2, 2, 'GALAXYBOOK4', ''),
('Dell Alienware M18', 'Potencia de escritorio', 2599.00, 2000.00, 2, 7, 'ALIENM18', ''),

-- Gaming (6)
('PlayStation 5 Slim', 'Consola con lector', 499.00, 420.00, 3, 3, 'PS5-SLIM', ''),
('Xbox Series X', 'La consola más potente', 499.00, 420.00, 3, 10, 'XBOX-SX', ''),
('Nintendo Switch OLED', 'Pantalla 7 pulgadas', 349.00, 280.00, 3, 9, 'SWITCH-OLED', ''),
('Logitech G Pro X Superlight 2', 'Mouse esports wireless', 159.00, 100.00, 3, 5, 'GPRO-X2', ''),
('ASUS ROG Ally', 'Consola portátil Windows', 699.00, 550.00, 3, 6, 'ROG-ALLY', ''),
('DualSense Edge', 'Control pro PS5', 199.00, 150.00, 3, 3, 'DUALSENSE-EDGE', ''),

-- Audio (6)
('AirPods Pro 2', 'USB-C, Cancelación ruido', 249.00, 180.00, 4, 1, 'APP2-USBC', ''),
('AirPods Max', 'Audio de alta fidelidad', 549.00, 420.00, 4, 1, 'AIRPODS-MAX', ''),
('Sony WH-1000XM5', 'Mejor cancelación de ruido', 399.00, 280.00, 4, 3, 'SONY-XM5', ''),
('Samsung Galaxy Buds2 Pro', 'Audio 24-bit Hi-Fi', 229.00, 150.00, 4, 2, 'BUDS2PRO', ''),
('Logitech G733', 'Headset gaming wireless', 129.00, 80.00, 4, 5, 'G733-RGB', ''),
('Sony WF-1000XM5', 'Earbuds premium', 299.00, 210.00, 4, 3, 'SONY-WF-XM5', ''),

-- IA Hardware (5) - NEW CATEGORY
('NVIDIA H100 Tensor Core', 'GPU para entrenamiento IA', 30000.00, 25000.00, 8, 4, 'H100-PCIE', ''),
('NVIDIA RTX 4090', 'GPU Consumo para IA local', 1599.00, 1200.00, 8, 4, 'RTX4090-FE', ''),
('NVIDIA Jetson AGX Orin', 'Kit desarrollo IA Edge', 1999.00, 1600.00, 8, 4, 'JETSON-ORIN', ''),
('Google Coral Dev Board', 'TPU Edge Computing', 129.00, 90.00, 8, 8, 'CORAL-DEV', ''),
('AMD Instinct MI300X', 'Acelerador IA Data Center', 25000.00, 20000.00, 8, 10, 'MI300X', ''),

-- Accesorios y Otros (11)
('Apple Watch Ultra 2', 'El reloj definitivo', 799.00, 650.00, 7, 1, 'AW-ULTRA2', ''),
('Samsung Galaxy Watch 6', 'Classic Rotating Bezel', 399.00, 280.00, 7, 2, 'GW6-CLASSIC', ''),
('iPad Pro 13 M4', 'OLED, Chip M4', 1299.00, 1000.00, 6, 1, 'IPADPRO-M4', ''),
('Magic Keyboard iPad', 'Teclado flotante', 299.00, 200.00, 5, 1, 'MAGIC-KEY', ''),
('Apple Pencil Pro', 'Nuevos gestos', 129.00, 90.00, 5, 1, 'PENCIL-PRO', ''),
('Cargador 35W Dual', 'Carga rápida 2 puertos', 59.00, 30.00, 5, 1, 'CHGR-35W', ''),
('Logitech MX Master 3S', 'Mejor mouse productividad', 99.00, 70.00, 5, 5, 'MX-MASTER3S', ''),
('Logitech MX Keys S', 'Teclado premium', 109.00, 75.00, 5, 5, 'MX-KEYS', ''),
('Samsung T7 Shield 2TB', 'SSD Portable Rugged', 169.00, 110.00, 5, 2, 'T7-2TB', ''),
('Cable Thunderbolt 4', 'Pro cable 2m', 129.00, 60.00, 5, 1, 'THUNDER-4', ''),
('Soporte Laptop Alum', 'Ergonómico', 49.00, 20.00, 5, 1, 'LAP-STAND', '');


-- ========================================
-- 4. INVENTARIO & COMPRAS INICIALES (Stock Setup)
-- ========================================

-- Compra Inicial Proveedor 1 (Apple)
INSERT INTO compras (proveedor_id, fecha_compra, estado, total, fecha_registro) VALUES 
(1, '2025-11-20 09:00:00', 'completada', 100000.00, '2025-11-20 09:00:00'); -- 1

INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 50, 950.00), -- iPhone 15 PM
(1, 7, 20, 2800.00), -- MBP 16
(1, 25, 100, 180.00); -- AirPods Pro 2

-- Compra Inicial Proveedor 4 (Distribuidor Generico)
INSERT INTO compras (proveedor_id, fecha_compra, estado, total, fecha_registro) VALUES 
(4, '2025-11-25 10:00:00', 'completada', 50000.00, '2025-11-25 10:00:00'); -- 2

INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario) VALUES
(2, 26, 5, 1200.00), -- RTX 4090
(2, 13, 30, 420.00), -- PS5 Slim
(2, 33, 20, 1000.00); -- iPad Pro M4

-- Inventario Inicial (Central)
INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible, cantidad_minima) VALUES 
(1, 1, 45, 5), (2, 1, 20, 5), (3, 1, 30, 5), (4, 1, 15, 3), (5, 1, 25, 5), 
(6, 1, 10, 2), (7, 1, 18, 2), (8, 1, 30, 5), (9, 1, 12, 3), (10, 1, 5, 1),
(11, 1, 8, 2), (12, 1, 6, 1), (13, 1, 40, 10), (14, 1, 20, 5), (15, 1, 25, 5),
(16, 1, 50, 10), (17, 1, 15, 3), (18, 1, 20, 5), (19, 1, 10, 2), (20, 1, 5, 1),
(21, 1, 15, 3), (22, 1, 20, 4), (23, 1, 30, 5), (24, 1, 18, 4), (25, 1, 80, 10), -- AirPods High Stock
(26, 1, 4, 2), -- RTX 4090 Low Stock
(27, 1, 5, 1), (28, 1, 10, 2), (29, 1, 2, 0), -- H100 Very Low Stock
(30, 1, 50, 10), (31, 1, 15, 3), (32, 1, 20, 5), (33, 1, 18, 4), (34, 1, 12, 2),
(35, 1, 20, 5), (36, 1, 30, 5), (37, 1, 40, 5), (38, 1, 25, 5), (39, 1, 50, 10), (40, 1, 15, 3);

-- Kardex Inicial (Solo algunos ejemplos de carga inicial)
INSERT INTO kardex (producto_id, ubicacion_id, tipo_movimiento, cantidad, saldo_anterior, saldo_actual, observacion) VALUES
(1, 1, 'compra', 50, 0, 50, 'Compra Inicial Fact 001'),
(26, 1, 'compra', 5, 0, 5, 'Compra Inicial Fact 002');


-- ========================================
-- 5. VENTAS (HISTÓRICO 01-07 DIC)
-- ========================================
-- Se simulan 20 ventas distribuidas

-- 01 Dic
INSERT INTO ventas (cliente_id, empleado_id, fecha, subtotal, total, estado, metodo_pago_id) VALUES 
(6, 2, '2025-12-01 10:15:00', 1199.00, 1199.00, 'completada', 2), -- Messi, Leo D. (iPhone)
(7, 3, '2025-12-01 14:30:00', 3499.00, 3499.00, 'completada', 2), -- CR7, Brad P. (MacBook Max)
(8, 4, '2025-12-01 18:45:00', 249.00, 249.00, 'completada', 1); -- Neymar, Scarlett (AirPods)

INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 1199.00), -- iPhone
(2, 7, 1, 3499.00), -- MacBook
(3, 25, 1, 249.00); -- AirPods

-- 02 Dic
INSERT INTO ventas (cliente_id, empleado_id, fecha, subtotal, total, estado, metodo_pago_id) VALUES 
(9, 5, '2025-12-02 09:20:00', 1599.00, 1599.00, 'completada', 3), -- Mbappe, RDJ (RTX 4090)
(10, 2, '2025-12-02 11:10:00', 499.00, 499.00, 'completada', 4), -- Haaland, Leo D. (PS5)
(11, 3, '2025-12-02 16:50:00', 1299.00, 1299.00, 'completada', 2); -- Vini, Brad P. (S24 Ultra)

INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES
(4, 26, 1, 1599.00), 
(5, 13, 1, 499.00),
(6, 3, 1, 1299.00);

-- 03 Dic
INSERT INTO ventas (cliente_id, empleado_id, fecha, subtotal, total, estado, metodo_pago_id) VALUES 
(12, 4, '2025-12-03 10:00:00', 598.00, 598.00, 'completada', 2), -- Bellingham, Scarlett
(13, 5, '2025-12-03 13:20:00', 30000.00, 30000.00, 'completada', 3); -- KDB, RDJ (H100)!!

INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES
(7, 33, 1, 299.00), (7, 35, 1, 299.00), -- Magic Key + Acc
(8, 25, 1, 30000.00); -- H100

-- 04 Dic
INSERT INTO ventas (cliente_id, empleado_id, fecha, subtotal, total, estado, metodo_pago_id) VALUES 
(14, 2, '2025-12-04 15:00:00', 999.00, 999.00, 'completada', 1), -- Modric
(15, 3, '2025-12-04 17:30:00', 499.00, 499.00, 'completada', 2); -- Salah

INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES
(9, 4, 1, 999.00), -- Z Flip
(10, 14, 1, 499.00); -- Xbox

-- 05 Dic
INSERT INTO ventas (cliente_id, empleado_id, fecha, subtotal, total, estado, metodo_pago_id) VALUES 
(16, 4, '2025-12-05 10:45:00', 3899.00, 3899.00, 'completada', 3), -- Lewy (Gaming Laptop)
(17, 5, '2025-12-05 12:15:00', 129.00, 129.00, 'completada', 1), -- Ramos
(6, 2, '2025-12-05 19:00:00', 1199.00, 1199.00, 'completada', 2); -- Messi (Repeat buy)

INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES
(11, 10, 1, 3899.00),
(12, 23, 1, 129.00),
(13, 1, 1, 1199.00);

-- 06 Dic
INSERT INTO ventas (cliente_id, empleado_id, fecha, subtotal, total, estado, metodo_pago_id) VALUES 
(7, 3, '2025-12-06 09:30:00', 799.00, 799.00, 'completada', 2), -- CR7
(8, 4, '2025-12-06 14:20:00', 159.00, 159.00, 'completada', 4), -- Neymar
(9, 5, '2025-12-06 16:40:00', 349.00, 349.00, 'completada', 1); -- Mbappe

INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES
(14, 31, 1, 799.00), -- Watch Ultra
(15, 16, 1, 159.00), -- Mouse
(16, 15, 1, 349.00); -- Switch

-- 07 Dic (Hoy)
INSERT INTO ventas (cliente_id, empleado_id, fecha, subtotal, total, estado, metodo_pago_id) VALUES 
(10, 2, '2025-12-07 08:00:00', 25000.00, 25000.00, 'completada', 3), -- Haaland (AMD AI)
(11, 3, '2025-12-07 10:30:00', 229.00, 229.00, 'completada', 1), -- Vini
(12, 4, '2025-12-07 12:00:00', 1399.00, 1399.00, 'completada', 2), -- Jude
(13, 5, '2025-12-07 13:15:00', 2199.00, 2199.00, 'completada', 2); -- KDB

INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES
(17, 29, 1, 25000.00),
(18, 22, 1, 229.00),
(19, 6, 1, 1399.00),
(20, 9, 1, 2199.00);

-- Envíos (Todos entregados como solicitado)
INSERT INTO envios (venta_id, direccion_id, courier, numero_guia, costo, estado, fecha_envio, fecha_entrega) VALUES
(1, 3, 'FedEx', 'TRACK-001', 15.00, 'entregado', '2025-12-01 12:00:00', '2025-12-02 10:00:00'),
(2, 4, 'DHL', 'TRACK-002', 25.00, 'entregado', '2025-12-01 16:00:00', '2025-12-03 14:00:00'),
(4, 3, 'FedEx', 'TRACK-003', 10.00, 'entregado', '2025-12-02 15:00:00', '2025-12-03 12:00:00'),
(17, 4, 'Security Transport', 'SECURE-001', 500.00, 'entregado', '2025-12-07 09:00:00', '2025-12-07 18:00:00'); 
-- (Solo unos cuantos ejemplos de envío vinculados a direcciones reales, el resto asume retiro o envío simplificado)

-- ========================================
-- 6. REVIEWS (25 ITEMS)
-- ========================================

INSERT INTO reviews (producto_id, cliente_id, calificacion, comentario, verificado) VALUES
-- iPhone 15 PM
(1, 6, 5, 'La cámara es una locura, las fotos salen increíbles.', true),
(1, 7, 5, 'Batería dura todo el día, excelente.', true),
-- MacBook Max
(7, 7, 5, 'Renderiza videos 8K sin despeinarse.', true),
(7, 12, 4, 'Potente pero pesa un poco.', true),
-- AirPods Pro
(25, 8, 5, 'La cancelación de ruido es magia pura.', true),
(25, 17, 5, 'Perfectos para entrenar.', true),
-- RTX 4090
(26, 9, 5, 'Corriendo Cyberpunk a 4K 120fps.', true),
-- PS5
(13, 10, 5, 'El control DualSense cambia la experiencia.', true),
-- S24 Ultra
(3, 11, 4, 'La pantalla es la mejor del mercado, pero el soft tiene bloatware.', true),
(3, 12, 5, 'El zoom es irreal.', true),
-- Watch Ultra
(31, 7, 5, 'Indestructible, lo uso para bucear.', true),
-- Mouse
(16, 8, 5, 'Súper ligero, el aim mejora instantáneamente.', true),
-- Switch
(15, 9, 4, 'La pantalla OLED se ve hermosa.', true),
-- Xbox
(14, 15, 5, 'Gamepass es el mejor deal.', true),
-- H100
(29, 13, 5, 'Entrenando LLMs en horas en vez de días.', true),
-- Random others
(6, 12, 4, 'Buena cámara y sonido.', true),
(4, 14, 3, 'La bisagra se siente frágil.', true),
(10, 16, 5, 'Una nave espacial hecha laptop.', true),
(23, 11, 4, 'Buenos bajos.', true),
(9, 13, 5, 'La pantalla OLED de Dell es superior.', true),
(22, 17, 3, 'Se caen al correr.', true),
(29, 10, 5, 'Increíble potencia de cálculo.', true),
(31, 13, 5, 'Batería de 3 días real.', true),
(33, 12, 5, 'Caro pero vale la pena la calidad.', true),
(2, 6, 4, 'Para el precio está bien.', true);
