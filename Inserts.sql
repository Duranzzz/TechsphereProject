-- ========================================
-- CLEANUP & RESEQUENCING
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
INSERT INTO metodos_pago (nombre) VALUES 
('efectivo'), ('tarjeta'), ('transferencia'), ('qr'), ('paypal');

INSERT INTO direcciones (calle, ciudad, estado, pais) VALUES 
-- Tiendas y Almacén
('Av. Cristo Redentor 4to Anillo', 'Santa Cruz', 'Santa Cruz', 'Bolivia'), -- 1: Central
('Calle 21 de Calacoto', 'La Paz', 'La Paz', 'Bolivia'), -- 2: Norte
('Av. Pando', 'Cochabamba', 'Cochabamba', 'Bolivia'), -- 3: Valle
('Av. Banzer 8vo Anillo', 'Santa Cruz', 'Santa Cruz', 'Bolivia'), -- 4: Almacén
-- Proveedores
('1 Infinite Loop', 'Cupertino', 'California', 'USA'), -- 5: Apple
('129 Samsung-ro', 'Suwon', 'Gyeonggi-do', 'South Korea'), -- 6: Samsung
('2788 San Tomas Expy', 'Santa Clara', 'California', 'USA'), -- 7: NVIDIA
('700 Locust St', 'Dubuque', 'Iowa', 'USA'), -- 8: Tech Distributor
-- Clientes
('Av. del Libertador 123', 'Buenos Aires', 'Buenos Aires', 'Argentina'), -- 9: Messi
('Riyadh Boulevard 456', 'Riyadh', 'Riyadh Province', 'Saudi Arabia'), -- 10: Ronaldo
('Avenida Atlântica 789', 'Rio de Janeiro', 'Rio de Janeiro', 'Brazil'), -- 11: Neymar
('Champs-Élysées 101', 'Paris', 'Île-de-France', 'France'), -- 12: Mbappé
('Manchester Road 202', 'Manchester', 'Greater Manchester', 'UK'), -- 13: Haaland
('Santiago Bernabéu 303', 'Madrid', 'Comunidad de Madrid', 'Spain'), -- 14: Vinicius
('Birmingham Street 404', 'Birmingham', 'West Midlands', 'UK'), -- 15: Bellingham
('Brussels Avenue 505', 'Brussels', 'Brussels-Capital', 'Belgium'), -- 16: De Bruyne
('Zagreb Square 606', 'Zagreb', 'Zagreb', 'Croatia'), -- 17: Modric
('Liverpool Dock 707', 'Liverpool', 'Merseyside', 'UK'), -- 18: Salah
('Marienplatz 808', 'Munich', 'Bavaria', 'Germany'), -- 19: Lewandowski
('Sevilla Plaza 909', 'Seville', 'Andalusia', 'Spain'); -- 20: Ramos

INSERT INTO ubicaciones (nombre, tipo, direccion_id) VALUES 
('TechSphere Central', 'tienda', 1),
('TechSphere La Paz', 'tienda', 2),
('TechSphere Cochabamba', 'tienda', 3),
('Almacén Principal', 'almacen', 4);

INSERT INTO categorias (nombre, descripcion, activa) VALUES 
('Smartphones', 'Teléfonos inteligentes gama alta y media', true), -- 1
('Laptops', 'Portátiles para trabajo y gaming', true), -- 2
('Gaming', 'Consolas y periféricos', true), -- 3
('Audio', 'Auriculares y parlantes', true), -- 4
('Accesorios', 'Cables, fundas y cargadores', true), -- 5
('Tabletas', 'iPads y competencia', true), -- 6
('Wearables', 'Smartwatches y bands', true), -- 7
('Inteligencia Artificial', 'Hardware especializado para IA', true); -- 8

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
('Admin TechSphere', 'admin@techsphere.com', '$argon2id$v=19$m=65536,t=3,p=4$jCDeAaFRH7yzJxVhpuNIbw$mrBdakeMTViLISq4AqFqrVoDp9zFs5MPCCXF/b6Lv6Y', 'admin'),
('Leonardo DiCaprio', 'leonardo.dicaprio@techsphere.com', '', 'empleado'),
('Brad Pitt', 'brad.pitt@techsphere.com', '', 'empleado'),
('Scarlett Johansson', 'scarlett.johansson@techsphere.com', '', 'empleado'),
('Robert Downey Jr.', 'robert.downey@techsphere.com', '', 'empleado'),
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


-- ========================================
-- 3. EMPLEADOS
-- ========================================
INSERT INTO empleados (nombre, apellido, puesto, activo, user_id, direccion_id) VALUES 
('Leonardo', 'DiCaprio', 'gerente', true, 2, 1),
('Brad', 'Pitt', 'vendedor', true, 3, 2),
('Scarlett', 'Johansson', 'vendedor', true, 4, 3),
('Robert', 'Downey Jr.', 'vendedor', true, 5, 1);


-- ========================================
-- 4. CLIENTES
-- ========================================
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


-- ========================================
-- 5. DIRECCIONES DE CLIENTES
-- ========================================
INSERT INTO cliente_direcciones (cliente_id, direccion_id, alias, es_principal) VALUES 
(1, 9, 'Domicilio Principal', true),
(2, 10, 'Domicilio Principal', true),
(3, 11, 'Domicilio Principal', true),
(4, 12, 'Domicilio Principal', true),
(5, 13, 'Domicilio Principal', true),
(6, 14, 'Domicilio Principal', true),
(7, 15, 'Domicilio Principal', true),
(8, 16, 'Oficina Corporativa', true),
(9, 17, 'Domicilio Principal', true),
(10, 18, 'Domicilio Principal', true),
(11, 19, 'Domicilio Principal', true),
(12, 20, 'Domicilio Principal', true);


-- ========================================
-- 6. PROVEEDORES
-- ========================================
INSERT INTO proveedores (nombre, contacto, email, activo, direccion_id) VALUES 
('Apple Distribution', 'Tim Cook', 'sales@apple.com', true, 5),
('Samsung Partners', 'Jay Y. Lee', 'b2b@samsung.com', true, 6),
('NVIDIA Enterprise', 'Jensen Huang', 'orders@nvidia.com', true, 7),
('Global Tech Wholesalers', 'John Smith', 'contact@globaltech.com', true, 8);


-- ========================================
-- 7. PRODUCTOS (40 ITEMS)
-- ========================================
INSERT INTO productos (nombre, descripcion, precio, precio_costo, categoria_id, marca_id, sku, activo, imagen_url) VALUES 
-- Smartphones (6)
('iPhone 15 Pro Max', 'Titanio, Chip A17 Pro, 256GB', 1199.00, 950.00, 1, 1, 'IPH15PM-256', true, ''),
('iPhone 15', 'Aluminio, Chip A16, 128GB', 799.00, 600.00, 1, 1, 'IPH15-128', true, ''),
('Samsung Galaxy S24 Ultra', 'Titanio, AI, S Pen, 512GB', 1299.00, 980.00, 1, 2, 'S24U-512', true, ''),
('Samsung Galaxy Z Flip 5', 'Plegable, Pantalla Flex, 256GB', 999.00, 750.00, 1, 2, 'ZFLIP5', true, ''),
('Google Pixel 8 Pro', 'Cámara AI, Tensor G3', 999.00, 720.00, 1, 8, 'PIXEL8P', true, ''),
('Sony Xperia 1 V', 'Para creadores, 4K OLED', 1399.00, 1000.00, 1, 3, 'XPERIA1V', true, ''),

-- Laptops (6)
('MacBook Pro 16 M3 Max', 'La bestia para pros', 3499.00, 2800.00, 2, 1, 'MBP16-M3MAX', true, ''),
('MacBook Air 15 M2', 'Delgada y ligera', 1299.00, 1000.00, 2, 1, 'MBA15-M2', true, ''),
('Dell XPS 15', 'Pantalla OLED 3.5K', 2199.00, 1700.00, 2, 7, 'XPS15-9530', true, ''),
('ASUS ROG Strix Scar 18', 'Gaming extremo RTX 4090', 3899.00, 3100.00, 2, 6, 'ROG-SCAR18', true, ''),
('Samsung Galaxy Book4 Ultra', 'Pantalla AMOLED 3K', 2399.00, 1900.00, 2, 2, 'GALAXYBOOK4', true, ''),
('Dell Alienware M18', 'Potencia de escritorio', 2599.00, 2000.00, 2, 7, 'ALIENM18', true, ''),

-- Gaming (6)
('PlayStation 5 Slim', 'Consola con lector', 499.00, 420.00, 3, 3, 'PS5-SLIM', true, ''),
('Xbox Series X', 'La consola más potente', 499.00, 420.00, 3, 10, 'XBOX-SX', true, ''),
('Nintendo Switch OLED', 'Pantalla 7 pulgadas', 349.00, 280.00, 3, 9, 'SWITCH-OLED', true, ''),
('Logitech G Pro X Superlight 2', 'Mouse esports wireless', 159.00, 100.00, 3, 5, 'GPRO-X2', true, ''),
('ASUS ROG Ally', 'Consola portátil Windows', 699.00, 550.00, 3, 6, 'ROG-ALLY', true, ''),
('DualSense Edge', 'Control pro PS5', 199.00, 150.00, 3, 3, 'DUALSENSE-EDGE', true, ''),

-- Audio (6)
('AirPods Pro 2', 'USB-C, Cancelación ruido', 249.00, 180.00, 4, 1, 'APP2-USBC', true, ''),
('AirPods Max', 'Audio de alta fidelidad', 549.00, 420.00, 4, 1, 'AIRPODS-MAX', true, ''),
('Sony WH-1000XM5', 'Mejor cancelación de ruido', 399.00, 280.00, 4, 3, 'SONY-XM5', true, ''),
('Samsung Galaxy Buds2 Pro', 'Audio 24-bit Hi-Fi', 229.00, 150.00, 4, 2, 'BUDS2PRO', true, ''),
('Logitech G733', 'Headset gaming wireless', 129.00, 80.00, 4, 5, 'G733-RGB', true, ''),
('Sony WF-1000XM5', 'Earbuds premium', 299.00, 210.00, 4, 3, 'SONY-WF-XM5', true, ''),

-- IA Hardware (5)
('NVIDIA H100 Tensor Core', 'GPU para entrenamiento IA', 30000.00, 25000.00, 8, 4, 'H100-PCIE', true, ''),
('NVIDIA RTX 4090', 'GPU Consumo para IA local', 1599.00, 1200.00, 8, 4, 'RTX4090-FE', true, ''),
('NVIDIA Jetson AGX Orin', 'Kit desarrollo IA Edge', 1999.00, 1600.00, 8, 4, 'JETSON-ORIN', true, ''),
('Google Coral Dev Board', 'TPU Edge Computing', 129.00, 90.00, 8, 8, 'CORAL-DEV', true, ''),
('AMD Instinct MI300X', 'Acelerador IA Data Center', 25000.00, 20000.00, 8, 10, 'MI300X', true, ''),

-- Accesorios y Otros (11)
('Apple Watch Ultra 2', 'El reloj definitivo', 799.00, 650.00, 7, 1, 'AW-ULTRA2', true, ''),
('Samsung Galaxy Watch 6', 'Classic Rotating Bezel', 399.00, 280.00, 7, 2, 'GW6-CLASSIC', true, ''),
('iPad Pro 13 M4', 'OLED, Chip M4', 1299.00, 1000.00, 6, 1, 'IPADPRO-M4', true, ''),
('Magic Keyboard iPad', 'Teclado flotante', 299.00, 200.00, 5, 1, 'MAGIC-KEY', true, ''),
('Apple Pencil Pro', 'Nuevos gestos', 129.00, 90.00, 5, 1, 'PENCIL-PRO', true, ''),
('Cargador 35W Dual', 'Carga rápida 2 puertos', 59.00, 30.00, 5, 1, 'CHGR-35W', true, ''),
('Logitech MX Master 3S', 'Mejor mouse productividad', 99.00, 70.00, 5, 5, 'MX-MASTER3S', true, ''),
('Logitech MX Keys S', 'Teclado premium', 109.00, 75.00, 5, 5, 'MX-KEYS', true, ''),
('Samsung T7 Shield 2TB', 'SSD Portable Rugged', 169.00, 110.00, 5, 2, 'T7-2TB', true, ''),
('Cable Thunderbolt 4', 'Pro cable 2m', 129.00, 60.00, 5, 1, 'THUNDER-4', true, ''),
('Soporte Laptop Alum', 'Ergonómico', 49.00, 20.00, 5, 1, 'LAP-STAND', true, '');


-- ========================================
-- 8. COMPRAS A PROVEEDORES (5 órdenes)
-- ========================================
-- Cada proveedor tiene su propia orden de compra con diferentes fechas
-- para simular llegadas de stock realistas durante noviembre 2025 y cada
-- entrega tiene su ubicacion de destino
INSERT INTO compras (proveedor_id, ubicacion_id, fecha_compra, estado, total, fecha_registro) VALUES 
-- Compra 1: Apple → TechSphere Central (ID 1)
(1, 1, '2025-11-15 09:00:00', 'completada', 185000.00, '2025-11-15 09:00:00'),
-- Compra 2: Samsung → TechSphere La Paz (ID 2)
(2, 2, '2025-11-18 14:00:00', 'completada', 95000.00, '2025-11-18 14:00:00'),
-- Compra 3: NVIDIA → Almacén Principal (ID 4)
(3, 4, '2025-11-20 10:30:00', 'completada', 180000.00, '2025-11-20 10:30:00'),
-- Compra 4: Global Tech → TechSphere Cochabamba (ID 3)
(4, 3, '2025-11-22 16:45:00', 'completada', 85000.00, '2025-11-22 16:45:00'),
-- Compra 5: TechSphere Import → TechSphere Central (ID 1)
(4, 1, '2025-11-25 11:00:00', 'completada', 25000.00, '2025-11-25 11:00:00');


-- ========================================
-- 9. DETALLES_COMPRA (40 registros)
-- ========================================
-- Cada producto del catálogo (IDs 1-40) tiene exactamente un registro de compra inicial
-- Las cantidades reflejan demanda esperada: alta para productos populares,
-- moderada para nicho, y baja para hardware de IA especializado
INSERT INTO detalles_compra (compra_id, producto_id, cantidad, precio_unitario) VALUES
-- COMPRA 1 (Apple) - 10 productos Apple
(1, 1, 50, 950.00),      -- iPhone 15 Pro Max
(1, 7, 20, 2800.00),     -- MacBook Pro 16
(1, 19, 100, 180.00),    -- AirPods Pro 2 
(1, 8, 30, 650.00),      -- MacBook Air 15
(1, 32, 25, 1000.00),    -- iPad Pro 13 M4 
(1, 33, 20, 200.00),     -- Magic Keyboard 
(1, 34, 30, 90.00),      -- Apple Pencil Pro 
(1, 35, 50, 30.00),      -- Cargador 35W Dual 
(1, 30, 15, 650.00),     -- Apple Watch Ultra 2 
(1, 39, 40, 60.00),      -- Cable Thunderbolt 4 

-- COMPRA 2 (Samsung) - 9 productos
(2, 3, 35, 980.00),      -- Galaxy S24 Ultra
(2, 4, 20, 750.00),      -- Galaxy Z Flip 5
(2, 11, 15, 1900.00),    -- Galaxy Book4 Ultra
(2, 22, 25, 150.00),     -- Galaxy Buds2 Pro
(2, 31, 20, 280.00),     -- Galaxy Watch 6
(2, 9, 18, 1700.00),     -- Dell XPS 15
(2, 38, 20, 110.00),     -- Samsung T7 Shield 2TB 
(2, 2, 30, 600.00),      -- iPhone 15
(2, 20, 25, 420.00),     -- AirPods Max 

-- COMPRA 3 (NVIDIA) - 5 productos de IA y gaming
(3, 25, 2, 25000.00),    -- H100 Tensor Core
(3, 26, 8, 1200.00),     -- RTX 4090
(3, 27, 3, 1600.00),     -- Jetson AGX Orin
(3, 10, 5, 3100.00),     -- ASUS ROG Strix Scar 18
(3, 29, 2, 20000.00),    -- AMD Instinct MI300X

-- COMPRA 4 (Global Tech) - 12 productos gaming y audio
(4, 13, 30, 420.00),     -- PS5 Slim
(4, 14, 15, 420.00),     -- Xbox Series X
(4, 15, 25, 280.00),     -- Nintendo Switch OLED
(4, 16, 20, 100.00),     -- Logitech G Pro X Superlight 2
(4, 17, 15, 550.00),     -- ASUS ROG Ally
(4, 18, 30, 150.00),     -- DualSense Edge
(4, 21, 20, 280.00),     -- Sony WH-1000XM5
(4, 23, 35, 80.00),      -- Logitech G733
(4, 24, 15, 210.00),     -- Sony WF-1000XM5
(4, 36, 20, 70.00),      -- Logitech MX Master 3S
(4, 37, 25, 75.00),      -- Logitech MX Keys S
(4, 5, 15, 720.00),      -- Google Pixel 8 Pro

-- COMPRA 5 (TechSphere Import) - 4 productos misceláneos
(5, 6, 12, 1000.00),     -- Sony Xperia 1 V
(5, 12, 8, 2000.00),     -- Dell Alienware M18
(5, 28, 15, 90.00),      -- Google Coral Dev Board
(5, 40, 40, 20.00);      -- Soporte Laptop Alum


-- ========================================
-- 10. KARDEX (40 movimientos de compra)
-- ========================================
-- Registro de entrada de stock por cada producto comprado.
-- Cada movimiento vincula a su compra correspondiente y especifica
-- la ubicación física donde se recibió el producto (distribución variada)
INSERT INTO kardex (producto_id, ubicacion_id, tipo_movimiento, cantidad, saldo_anterior, saldo_actual, referencia_tabla, referencia_id, observacion) VALUES
-- COMPRA 1 (Apple) - TechSphere Central (ID 1)
(1, 1, 'compra', 50, 0, 50, 'compras', 1, 'Stock Inicial'),
(7, 1, 'compra', 20, 0, 20, 'compras', 1, 'Stock Inicial'),
(19, 1, 'compra', 100, 0, 100, 'compras', 1, 'Stock Inicial'),
(8, 1, 'compra', 30, 0, 30, 'compras', 1, 'Stock Inicial'),
(32, 1, 'compra', 25, 0, 25, 'compras', 1, 'Stock Inicial'),
(33, 1, 'compra', 20, 0, 20, 'compras', 1, 'Stock Inicial'),
(34, 1, 'compra', 30, 0, 30, 'compras', 1, 'Stock Inicial'),
(35, 1, 'compra', 50, 0, 50, 'compras', 1, 'Stock Inicial'),
(30, 1, 'compra', 15, 0, 15, 'compras', 1, 'Stock Inicial'),
(39, 1, 'compra', 40, 0, 40, 'compras', 1, 'Stock Inicial'),

-- COMPRA 2 (Samsung) - TechSphere La Paz (ID 2)
(3, 2, 'compra', 35, 0, 35, 'compras', 2, 'Stock Inicial'),
(4, 2, 'compra', 20, 0, 20, 'compras', 2, 'Stock Inicial'),
(11, 2, 'compra', 15, 0, 15, 'compras', 2, 'Stock Inicial'),
(22, 2, 'compra', 25, 0, 25, 'compras', 2, 'Stock Inicial'),
(31, 2, 'compra', 20, 0, 20, 'compras', 2, 'Stock Inicial'),
(9, 2, 'compra', 18, 0, 18, 'compras', 2, 'Stock Inicial'),
(38, 2, 'compra', 20, 0, 20, 'compras', 2, 'Stock Inicial'),
(2, 2, 'compra', 30, 0, 30, 'compras', 2, 'Stock Inicial'),
(20, 2, 'compra', 25, 0, 25, 'compras', 2, 'Stock Inicial'),

-- COMPRA 3 (NVIDIA) - Almacén Principal (ID 4)
(25, 4, 'compra', 2, 0, 2, 'compras', 3, 'Stock Inicial'),
(26, 4, 'compra', 8, 0, 8, 'compras', 3, 'Stock Inicial'),
(27, 4, 'compra', 3, 0, 3, 'compras', 3, 'Stock Inicial'),
(10, 4, 'compra', 5, 0, 5, 'compras', 3, 'Stock Inicial'),
(29, 4, 'compra', 2, 0, 2, 'compras', 3, 'Stock Inicial'),

-- COMPRA 4 (Global Tech) - TechSphere Cochabamba (ID 3)
(13, 3, 'compra', 30, 0, 30, 'compras', 4, 'Stock Inicial'),
(14, 3, 'compra', 15, 0, 15, 'compras', 4, 'Stock Inicial'),
(15, 3, 'compra', 25, 0, 25, 'compras', 4, 'Stock Inicial'),
(16, 3, 'compra', 20, 0, 20, 'compras', 4, 'Stock Inicial'),
(17, 3, 'compra', 15, 0, 15, 'compras', 4, 'Stock Inicial'),
(18, 3, 'compra', 30, 0, 30, 'compras', 4, 'Stock Inicial'),
(21, 3, 'compra', 20, 0, 20, 'compras', 4, 'Stock Inicial'),
(23, 3, 'compra', 35, 0, 35, 'compras', 4, 'Stock Inicial'),
(24, 3, 'compra', 25, 0, 25, 'compras', 4, 'Stock Inicial'),
(36, 3, 'compra', 20, 0, 20, 'compras', 4, 'Stock Inicial'),
(37, 3, 'compra', 25, 0, 25, 'compras', 4, 'Stock Inicial'),
(5, 3, 'compra', 15, 0, 15, 'compras', 4, 'Stock Inicial'),

-- COMPRA 5 (TechSphere Import) - TechSphere Central (ID 1)
(6, 1, 'compra', 12, 0, 12, 'compras', 5, 'Stock Inicial'),
(12, 1, 'compra', 8, 0, 8, 'compras', 5, 'Stock Inicial'),
(28, 1, 'compra', 15, 0, 15, 'compras', 5, 'Stock Inicial'),
(40, 1, 'compra', 40, 0, 40, 'compras', 5, 'Stock Inicial');


-- ========================================
-- 11. INVENTARIO (40 productos, stock confirmado)
-- ========================================
-- Stock físico distribuido en las 4 ubicaciones. Cada cantidad coincide
-- EXACTAMENTE con su respectivo movimiento de kardex y detalle_compra.
-- La distribución refleja ubicación de recepción de cada compra.
INSERT INTO inventario (producto_id, ubicacion_id, cantidad_disponible, cantidad_reservada, cantidad_minima) VALUES 
-- Ubicación 1 (TechSphere Central) - 14 productos
(1, 1, 50, 0, 5), (7, 1, 20, 0, 2), (19, 1, 100, 0, 10), (8, 1, 30, 0, 5), (32, 1, 25, 0, 4),
(33, 1, 20, 0, 2), (34, 1, 30, 0, 5), (35, 1, 50, 0, 10), (30, 1, 15, 0, 3), (39, 1, 40, 0, 5),
(6, 1, 12, 0, 2), (12, 1, 8, 0, 1), (28, 1, 15, 0, 2), (40, 1, 40, 0, 8),

-- Ubicación 2 (TechSphere La Paz) - 9 productos
(3, 2, 35, 0, 5), (4, 2, 20, 0, 3), (11, 2, 15, 0, 2), (22, 2, 25, 0, 5), (31, 2, 20, 0, 4),
(9, 2, 18, 0, 2), (38, 2, 20, 0, 5), (2, 2, 30, 0, 5), (20, 2, 25, 0, 4),

-- Ubicación 3 (TechSphere Cochabamba) - 13 productos
(13, 3, 30, 0, 10), (14, 3, 15, 0, 5), (15, 3, 25, 0, 5), (16, 3, 20, 0, 3), (17, 3, 15, 0, 3),
(18, 3, 30, 0, 5), (21, 3, 20, 0, 5), (23, 3, 35, 0, 7), (24, 3, 25, 0, 5), (36, 3, 20, 0, 4),
(37, 3, 25, 0, 5), (5, 3, 15, 0, 3),

-- Ubicación 4 (Almacén Principal) - 4 productos de alto valor
(25, 4, 2, 0, 0), (26, 4, 8, 0, 2), (27, 4, 3, 0, 1), (10, 4, 5, 0, 1), (29, 4, 2, 0, 0);


-- ========================================
-- 12. VENTAS HISTÓRICAS (01-07 DIC 2025)
-- ========================================
INSERT INTO ventas (cliente_id, empleado_id, fecha, subtotal, total, estado, metodo_pago_id) VALUES 
(1, 2, '2025-12-01 10:15:00', 1199.00, 1199.00, 'completada', 2),
(2, 3, '2025-12-01 14:30:00', 3499.00, 3499.00, 'completada', 2),
(3, 4, '2025-12-01 18:45:00', 249.00, 249.00, 'completada', 1),  
(4, 2, '2025-12-02 09:20:00', 1599.00, 1599.00, 'completada', 3),
(5, 3, '2025-12-02 11:10:00', 499.00, 499.00, 'completada', 4),
(6, 4, '2025-12-02 16:50:00', 1299.00, 1299.00, 'completada', 2),  
(7, 2, '2025-12-03 10:00:00', 598.00, 598.00, 'completada', 2),
(8, 3, '2025-12-03 13:20:00', 30000.00, 30000.00, 'completada', 3),  
(9, 4, '2025-12-04 15:00:00', 999.00, 999.00, 'completada', 1),  
(10, 2, '2025-12-04 17:30:00', 499.00, 499.00, 'completada', 2),
(11, 3, '2025-12-05 10:45:00', 3899.00, 3899.00, 'completada', 3),
(12, 4, '2025-12-05 12:15:00', 129.00, 129.00, 'completada', 1), 
(1, 2, '2025-12-05 19:00:00', 1199.00, 1199.00, 'completada', 2),
(2, 3, '2025-12-06 09:30:00', 799.00, 799.00, 'completada', 2),
(3, 4, '2025-12-06 14:20:00', 159.00, 159.00, 'completada', 4), 
(4, 2, '2025-12-06 16:40:00', 349.00, 349.00, 'completada', 1),
(5, 3, '2025-12-07 08:00:00', 25000.00, 25000.00, 'completada', 3), 
(6, 4, '2025-12-07 10:30:00', 229.00, 229.00, 'completada', 1), 
(7, 2, '2025-12-07 12:00:00', 1399.00, 1399.00, 'completada', 2),
(8, 3, '2025-12-07 13:15:00', 2199.00, 2199.00, 'completada', 2); 

-- ========================================
-- 13. DETALLES_DE_VENTA (con ubicación de origen)
-- ========================================
-- Cada línea de venta registra desde qué ubicación física se despachó el producto.
-- La ubicación_id se extrae del inventario donde el producto estaba disponible.
-- Para ventas multi-producto (venta 7), cada item puede venir de ubicaciones diferentes.
INSERT INTO detalles_venta (venta_id, producto_id, ubicacion_id, cantidad, precio_unitario, descuento) VALUES
-- Venta 1: Messi, iPhone 15 Pro Max (ubicación Central)
(1, 1, 1, 1, 1199.00, 0.00),
-- Venta 2: Ronaldo, MacBook Pro 16 (ubicación Central)
(2, 7, 1, 1, 3499.00, 0.00),
-- Venta 3: Neymar, AirPods Pro 2 (ubicación Central)
(3, 19, 1, 1, 249.00, 0.00),
-- Venta 4: Mbappé, RTX 4090 (ubicación Almacén Principal)
(4, 26, 4, 1, 1599.00, 0.00),
-- Venta 5: Haaland, PS5 Slim (ubicación Cochabamba)
(5, 13, 3, 1, 499.00, 0.00),
-- Venta 6: Vinicius, Samsung S24 Ultra (ubicación La Paz)
(6, 3, 2, 1, 1299.00, 0.00),
-- Venta 7: Bellingham, Magic Keyboard + Pencil Pro (ambos de Central)
(7, 33, 1, 1, 299.00, 0.00), 
(7, 34, 1, 1, 299.00, 0.00),
-- Venta 8: De Bruyne (empresa), NVIDIA H100 (ubicación Almacén Principal)
(8, 25, 4, 1, 30000.00, 0.00),
-- Venta 9: Modric, Galaxy Z Flip 5 (ubicación La Paz)
(9, 4, 2, 1, 999.00, 0.00),
-- Venta 10: Salah, Xbox Series X (ubicación Cochabamba)
(10, 14, 3, 1, 499.00, 0.00),
-- Venta 11: Lewandowski, ASUS ROG Strix Scar 18 (ubicación Almacén Principal)
(11, 10, 4, 1, 3899.00, 0.00),
-- Venta 12: Ramos, Apple Pencil Pro (ubicación Central)
(12, 34, 1, 1, 129.00, 0.00),
-- Venta 13: Messi, iPhone 15 Pro Max - repite (ubicación Central)
(13, 1, 1, 1, 1199.00, 0.00),
-- Venta 14: Ronaldo, Apple Watch Ultra 2 (ubicación Central)
(14, 30, 1, 1, 799.00, 0.00),
-- Venta 15: Neymar, Logitech G Pro X Superlight 2 (ubicación Cochabamba)
(15, 16, 3, 1, 159.00, 0.00),
-- Venta 16: Mbappé, Nintendo Switch OLED (ubicación Cochabamba)
(16, 15, 3, 1, 349.00, 0.00),
-- Venta 17: Haaland, AMD Instinct MI300X (ubicación Almacén Principal)
(17, 29, 4, 1, 25000.00, 0.00),
-- Venta 18: Vinicius, Galaxy Buds2 Pro (ubicación La Paz)
(18, 22, 2, 1, 229.00, 0.00),
-- Venta 19: Bellingham, Sony Xperia 1 V (ubicación Central)
(19, 6, 1, 1, 1399.00, 0.00),
-- Venta 20: De Bruyne, Dell XPS 15 (ubicación La Paz)
(20, 9, 2, 1, 2199.00, 0.00);


-- ========================================
-- 14. ENVÍOS
-- ========================================
INSERT INTO envios (venta_id, direccion_id, courier, numero_guia, costo, estado, fecha_envio, fecha_entrega) VALUES
(1, 9, 'FedEx', 'TRACK-001', 15.00, 'entregado', '2025-12-01 12:00:00', '2025-12-02 10:00:00'),
(2, 10, 'DHL', 'TRACK-002', 25.00, 'entregado', '2025-12-01 16:00:00', '2025-12-03 14:00:00'),
(4, 12, 'FedEx', 'TRACK-003', 10.00, 'entregado', '2025-12-02 15:00:00', '2025-12-03 12:00:00'),
(17, 13, 'Security Transport', 'SECURE-001', 500.00, 'entregado', '2025-12-07 09:00:00', '2025-12-07 18:00:00');


-- ========================================
-- 15. REVIEWS (25 reviews usando solo productos IDs 1-40)
-- ========================================
INSERT INTO reviews (producto_id, cliente_id, calificacion, comentario, verificado) VALUES
(1, 1, 5, 'La cámara es una locura, las fotos salen increíbles.', true),
(1, 2, 5, 'Batería dura todo el día, excelente.', true),
(7, 2, 5, 'Renderiza videos 8K sin despeinarse.', true),
(7, 7, 4, 'Potente pero pesa un poco.', true),
(19, 3, 5, 'La cancelación de ruido es magia pura.', true),
(19, 12, 5, 'Perfectos para entrenar.', true),
(26, 4, 5, 'Corriendo Cyberpunk a 4K 120fps.', true),
(13, 5, 5, 'El control DualSense cambia la experiencia.', true),
(3, 6, 4, 'La pantalla es la mejor del mercado, pero el soft tiene bloatware.', true),
(3, 7, 5, 'El zoom es irreal.', true),
(30, 2, 5, 'Indestructible, lo uso para bucear.', true),
(16, 3, 5, 'Súper ligero, el aim mejora instantáneamente.', true),
(15, 4, 4, 'La pantalla OLED se ve hermosa.', true),
(14, 10, 5, 'Gamepass es el mejor deal.', true),
(25, 8, 5, 'Entrenando LLMs en horas en vez de días.', true),
(6, 7, 4, 'Buena cámara y sonido.', true),
(4, 9, 3, 'La bisagra se siente frágil.', true),
(10, 11, 5, 'Una nave espacial hecha laptop.', true),
(22, 6, 4, 'Buenos bajos.', true),
(9, 8, 5, 'La pantalla OLED de Dell es superior.', true),
(20, 12, 3, 'Se caen al correr.', true),
(29, 5, 5, 'Increíble potencia de cálculo.', true),
(31, 8, 5, 'Batería de 3 días real.', true),
(33, 7, 5, 'Caro pero vale la pena la calidad.', true),
(2, 1, 4, 'Para el precio está bien.', true);