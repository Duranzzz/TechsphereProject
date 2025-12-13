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
('Leonardo DiCaprio', 'leonardo.dicaprio@techsphere.com', '$argon2id$v=19$m=65536,t=3,p=4$6aOh72jTvUPcFvUYABLHtg$Vo9C/LLBHMThmeEzcymAQsREtVzbNafZWC59FFLEkys', 'empleado'),
('Brad Pitt', 'brad.pitt@techsphere.com', '$argon2id$v=19$m=65536,t=3,p=4$Mywv1kZH9VP2b0kF/z0gqg$L5xyLl9YT9ka3056CFpa15ANIofG0p3BybwCswiM02I', 'empleado'),
('Scarlett Johansson', 'scarlett.johansson@techsphere.com', '$argon2id$v=19$m=65536,t=3,p=4$jYkyyoqpdkjBCFSrgn86dQ$VY0bi+ypwSq4WD1jNW06ZLL/SEKIswsRymj1yLA1CpA', 'empleado'),
('Robert Downey Jr.', 'robert.downey@techsphere.com', '$argon2id$v=19$m=65536,t=3,p=4$ngI7nG5f1yumo/yX+BBK1w$EuaYEfLPeelvBpgqa9IwnfvataNXRWVLfaWlklMXPRI', 'empleado'),
('Lionel Messi', 'leo.messi10@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$IublT/LzcMMbZZyLtrsp+Q$QyHC0TJHiMrn/o6ukooNvosvx58/TWZPd9xk2XUTTiM', 'cliente'),
('Cristiano Ronaldo', 'cr7.siuuu@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$NEIyxuYffU6padll4Sfz+g$zoVz99prZ1Em82k/C0tg97ULiJBTC1NPWjb1TVZNjUs', 'cliente'),
('Neymar Jr', 'ney.joya@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$hnB2KN5OIryiQTiJwSDERQ$46XSF63T4DxiOWO+X2wxnVlysivs/34mQV+KJwF3XFA', 'cliente'),
('Kylian Mbappé', 'kiki.mbappe@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$N7xUmcbI//KcDuk+sKk/wQ$uB0Yah8omj7d217MdKrDs2sIEhFtLJSJ0EzmNDUqOls', 'cliente'),
('Erling Haaland', 'robot.haaland@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$w9YESglnSXRGiz37FqmKsA$UadPEgVTVAqd8b7VcRGcw28L0ZTHdLieQ+PiOMyGnyM', 'cliente'),
('Vinicius Jr', 'vini.bailar@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$7STdyDkTHZGF1682D9yo9A$IfS60wrHWnEB1yLDVrX6jK9boiKGacQUU/VSS9GlVCg', 'cliente'),
('Jude Bellingham', 'hey.jude@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$UXHBlWgsmGKkgxRa4326BQ$/jN/xUGCfXhTkfohmc9XmkX1CgKqULjime0p49ZmoqQ', 'cliente'),
('Kevin De Bruyne', 'kdb.assist@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$OT3vnxetCyC/6rpU2oeYOg$8sk22GeZmE3+FIdsf2YrVl6nbWyCYyFMnuGxRB072RA', 'cliente'),
('Luka Modric', 'lukita.magic@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$qV0LQo9T8Vu09YC3P9bqTg$OB0Y5GOHink9eghSfFBjbabe0tUwnvIy391XcYsr9K0', 'cliente'),
('Mohamed Salah', 'mo.salah@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$KSXF+dzNjjYQXA6iC/hkjA$3a7NTi8Xu+tLuYT/CNEMLtWA3scNEPAT30nm4jPagio', 'cliente'),
('Robert Lewandowski', 'lewy.gol@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$I6ln9figp0wt+C16PlM/Yw$G3Yzqzlc16aYwqE96R39HgcJkl9p3s+wD5tRvwRPVWU', 'cliente'),
('Sergio Ramos', 'sr4.camas@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$HbOxL2WoGHhI5AsV6eIgTA$JTDZM7ayCNgZ05W7gY9+gxnDiAMHCF7CdTphcRFk6S8', 'cliente');


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
INSERT INTO productos (nombre, descripcion, precio, precio_costo, categoria_id, marca_id, sku, activo, imagen_url, cantidad_minima, dias_garantia) VALUES 
-- Smartphones (6) (Min: 5, Garantia: 365)
('iPhone 15 Pro Max', 'Titanio, Chip A17 Pro, 256GB', 1199.00, 950.00, 1, 1, 'IPH15PM-256', true, 'https://nextlevel.com.bo/cdn/shop/files/IPHONE15PROMAX_256_720x.jpg?v=1728942145', 5, 365),
('iPhone 15', 'Aluminio, Chip A16, 128GB', 799.00, 600.00, 1, 1, 'IPH15-128', true, 'https://www.machines.com.my/cdn/shop/products/iPhone_15_Blue_PDP_Image_Position-1__GBEN_1e72ee66-26eb-4f82-8bb3-de765f0f0a94.jpg?v=1705480744&width=600', 5, 365),
('Samsung Galaxy S24 Ultra', 'Titanio, AI, S Pen, 512GB', 1299.00, 980.00, 1, 2, 'S24U-512', true, 'https://incomm.com.bn/img/uploaditemdetail/dt17490ded155d25242556c60e92ba9d202f691593.png', 5, 365),
('Samsung Galaxy Z Flip 5', 'Plegable, Pantalla Flex, 256GB', 999.00, 750.00, 1, 2, 'ZFLIP5', true, 'https://images.samsung.com/cl/smartphones/galaxy-z-flip5/images/galaxy-z-flip5-highlights-colors-mint-mo.jpg?imbypass=true', 5, 365),
('Google Pixel 8 Pro', 'Cámara AI, Tensor G3', 999.00, 720.00, 1, 8, 'PIXEL8P', true, 'https://m.media-amazon.com/images/I/71XEjCc4yLL._AC_SX425_.jpg', 5, 365),
('Sony Xperia 1 V', 'Para creadores, 4K OLED', 1399.00, 1000.00, 1, 3, 'XPERIA1V', true, 'https://i.blogs.es/50f860/experia/1024_2000.jpeg', 3, 365),

-- Laptops (6) (Min: 3, Garantia: 365/730)
('MacBook Pro 16 M3 Max', 'La bestia para pros', 3499.00, 2800.00, 2, 1, 'MBP16-M3MAX', true, 'https://www.hoxtonmacs.co.uk/cdn/shop/files/apple-macbook-pro-16-inch-macbook-pro-16-inch-m3-max-16-core-space-black-2023-excellent-46544620323132.jpg?v=1764057156&width=720', 2, 365),
('MacBook Air 15 M2', 'Delgada y ligera', 1299.00, 1000.00, 2, 1, 'MBA15-M2', true, 'https://www.machines.com.my/cdn/shop/products/MacBook_Air_15-in_M2_Midnight_PDP_Image_Position_1__global_2bd26923-1949-46bf-a486-78773e3f136a.jpg?v=1705597648&width=600', 5, 365),
('Dell XPS 15', 'Pantalla OLED 3.5K', 2199.00, 1700.00, 2, 7, 'XPS15-9530', true, 'https://dellstatic.luroconnect.com/media/catalog/product/cache/74ae05ef3745aec30d7f5a287debd7f5/n/o/notebook-xps-15-9530-t-black-gallery-1.jpg', 3, 730),
('ASUS ROG Strix Scar 18', 'Gaming extremo RTX 4090', 3899.00, 3100.00, 2, 6, 'ROG-SCAR18', true, 'https://shop.asus.com/media/catalog/product/0/2/02_scar_new_18_l_1_5.jpg?format=auto&optimize=medium&bg-color=255%2C255%2C255&fit=bounds&height=1000&width=1000&canvas=1000%3A1000', 2, 730),
('Samsung Galaxy Book4 Ultra', 'Pantalla AMOLED 3K', 2399.00, 1900.00, 2, 2, 'GALAXYBOOK4', true, 'https://image-us.samsung.com/SamsungUS/home/computing/galaxy-books/gb4-ultra-16/GB4Ultra_16_US_Copilot_Moonstone-Gray_001_Front-1600x1200.jpg?$product-details-jpg$', 3, 365),
('Dell Alienware M18', 'Potencia de escritorio', 2599.00, 2000.00, 2, 7, 'ALIENM18', true, 'https://i5.walmartimages.com/seo/Dell-Alienware-m18-R2-18-32GB-1GB-SSD-Core-i9-14900HX-2-20GHz-WIN11H-Dark-Metallic-Moon_f7bbde8c-92cb-408f-bfa8-96200296aa58.83992d0b1dd6fa7883ca9af0a9b20ba6.jpeg?odnHeight=573&odnWidth=573&odnBg=FFFFFF', 2, 730),

-- Gaming (6) (Min: 5-10, Garantia: 365)
('PlayStation 5 Slim', 'Consola con lector', 499.00, 420.00, 3, 3, 'PS5-SLIM', true, 'https://www.dismac.com.bo/media/catalog/product/c/f/cfi-2015b-2.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=&width=&canvas=:', 10, 365),
('Xbox Series X', 'La consola más potente', 499.00, 420.00, 3, 10, 'XBOX-SX', true, 'https://cms-assets.xboxservices.com/assets/bc/40/bc40fdf3-85a6-4c36-af92-dca2d36fc7e5.png?n=642227_Hero-Gallery-0_A1_857x676.png', 10, 365),
('Nintendo Switch OLED', 'Pantalla 7 pulgadas', 349.00, 280.00, 3, 9, 'SWITCH-OLED', true, 'https://www.compraderas.com.bo/wp-content/uploads/2021/12/nintendo-switch-oled.jpg.webp', 10, 365),
('Logitech G Pro X Superlight 2', 'Mouse esports wireless', 159.00, 100.00, 3, 5, 'GPRO-X2', true, 'https://eagleco.net/wp-content/uploads/2024/09/7860.jpg.webp', 8, 180),
('ASUS ROG Ally', 'Consola portátil Windows', 699.00, 550.00, 3, 6, 'ROG-ALLY', true, 'https://dlcdnwebimgs.asus.com/gain/4C877B23-808A-430C-A679-1F32A9F0D876/w717/h525', 5, 365),
('DualSense Edge', 'Control pro PS5', 199.00, 150.00, 3, 3, 'DUALSENSE-EDGE', true, 'https://imgix.bustle.com/uploads/image/2023/3/13/5a18eea6-26e6-4d7b-ad7b-3ff58ce6c89f-dualsense-edge-review-raymondwong-inverse-11.jpg?w=564&h=564&fit=crop&crop=faces', 8, 180),

-- Audio (6)
('AirPods Pro 2', 'USB-C, Cancelación ruido', 249.00, 180.00, 4, 1, 'APP2-USBC', true, 'https://www.ismartbolivia.com/wp-content/uploads/2020/05/MQD83-800x800.jpeg', 15, 365),
('AirPods Max', 'Audio de alta fidelidad', 549.00, 420.00, 4, 1, 'AIRPODS-MAX', true, 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-max-select-202409-midnight_FV1?wid=976&hei=916&fmt=jpeg&qlt=90&.v=azQxRkVJKzd6V3J0aGNqWFhLMzBmdmVWNWdHYnp5cHkwMldsSElEOHpyd0cyWGRFNFZ5QTk3bFlteis2Q2NNaWpENFdPQTN0TWQ4ejhtTWxrUHVDeElGZGV2eWhZaEljUzNSeDlxcDVuWGszbTFldUtUQzN0ellEWHZ3UUFYSS8', 5, 365),
('Sony WH-1000XM5', 'Mejor cancelación de ruido', 399.00, 280.00, 4, 3, 'SONY-XM5', true, 'https://metapod.com/cdn/shop/files/sony-wh-1000xm5-noise-cancelling-wireless-headphones-midnight-blue-34338795028676.jpg?v=1754022978&width=600', 5, 365),
('Samsung Galaxy Buds2 Pro', 'Audio 24-bit Hi-Fi', 229.00, 150.00, 4, 2, 'BUDS2PRO', true, 'https://dekoniaudio.com/wp-content/uploads/2023/12/galaxy-buds2-pro-bulletz-master-image-1.png', 10, 365),
('Logitech G733', 'Headset gaming wireless', 129.00, 80.00, 4, 5, 'G733-RGB', true, 'https://globaliraq.net/cdn/shop/files/2_a48f3794-0dd9-4a4e-b453-0a7cb764d74c.jpg?v=1729955548&width=600', 8, 180),
('Sony WF-1000XM5', 'Earbuds premium', 299.00, 210.00, 4, 3, 'SONY-WF-XM5', true, 'https://metapod.com/cdn/shop/files/SonyWF-1000XM5WirelessNoiseCancellingTrueWirelessEarphones_XM5__Pink_4.png?v=1754966592&width=600', 10, 365),

-- IA Hardware (5) (Min: 1-2, Garantia: 365-730)
('NVIDIA H100 Tensor Core', 'GPU para entrenamiento IA', 30000.00, 25000.00, 8, 4, 'H100-PCIE', true, 'https://media.router-switch.com/media/mf_webp/jpg/media/catalog/product/cache/b90fceee6a5fa7acd36a04c7b968181c/n/v/nvidia-8-h100-8ogb-sxm5-bun_1_1.webp', 1, 730),
('NVIDIA RTX 4090', 'GPU Consumo para IA local', 1599.00, 1200.00, 8, 4, 'RTX4090-FE', true, 'https://postperspective.com/wp-content/uploads/2022/10/GeForce-RTX4090-3QTR-Back-Left-1-624x423.jpg', 3, 365),
('NVIDIA Jetson AGX Orin', 'Kit desarrollo IA Edge', 1999.00, 1600.00, 8, 4, 'JETSON-ORIN', true, 'https://m.media-amazon.com/images/I/714DRkY4EkL._AC_SX425_.jpg', 2, 365),
('Google Coral Dev Board', 'TPU Edge Computing', 129.00, 90.00, 8, 8, 'CORAL-DEV', true, 'https://cdn-shop.adafruit.com/970x728/4385-03.jpg', 5, 180),
('AMD Instinct MI300X', 'Acelerador IA Data Center', 25000.00, 20000.00, 8, 10, 'MI300X', true, 'https://www.amd.com/content/dam/amd/en/images/products/data-centers/2325906-amd-instinct-platform-product.jpg', 1, 730),

-- Accesorios y Otros (11) (Min: 10-20, Garantia: 90-180)
('Apple Watch Ultra 2', 'El reloj definitivo', 799.00, 650.00, 7, 1, 'AW-ULTRA2', true, 'https://www.machines.com.my/cdn/shop/files/Apple_Watch_Ultra_2_49mm_Black_Titanium_Ocean_Band_Black_PDP_Image_Position_1__GBEN_ce4a0a46-7cdb-486b-bf57-a483554e7626.jpg?v=1726228853&width=1100', 5, 365),
('Samsung Galaxy Watch 6', 'Classic Rotating Bezel', 399.00, 280.00, 7, 2, 'GW6-CLASSIC', true, 'https://www.jbhifi.com.au/cdn/shop/products/654755-Product-0-I-638307592863552126.jpg?v=1695162562', 5, 365),
('iPad Pro 13 M4', 'OLED, Chip M4', 1299.00, 1000.00, 6, 1, 'IPADPRO-M4', true, 'https://www.ismartbolivia.com/wp-content/uploads/2024/05/ipad-pro-finish-select-202405-13inch-silver-scaled-e1715264561660-800x863.jpeg', 3, 365),
('Magic Keyboard iPad', 'Teclado flotante', 299.00, 200.00, 5, 1, 'MAGIC-KEY', true, 'https://eshop.macsales.com/images/_gallery_/bin/APLMXQT2LLAB-pimid72417-xl.jpg', 5, 180),
('Apple Pencil Pro', 'Nuevos gestos', 129.00, 90.00, 5, 1, 'PENCIL-PRO', true, 'https://assets.pawnamerica.com/ProductImages/b38d06b7-0cf9-4224-867a-9736dcccee08.jpg?_gl=1*pnvwwm*_gcl_au*MTg3MTQ5Nzc4LjE3NjUyOTQyMjE.', 8, 180),
('Cargador 35W Dual', 'Carga rápida 2 puertos', 59.00, 30.00, 5, 1, 'CHGR-35W', true, 'https://images-cdn.ubuy.co.in/646af3566d6b71475832a304-iphone-fast-charger-35w-dual-usb-c.jpg', 20, 90),
('Logitech MX Master 3S', 'Mejor mouse productividad', 99.00, 70.00, 5, 5, 'MX-MASTER3S', true, 'https://sysbol.com/2522-large_default/mouse-logitech-mx-master-3s.jpg', 8, 180),
('Logitech MX Keys S', 'Teclado premium', 109.00, 75.00, 5, 5, 'MX-KEYS', true, 'https://www.jbhifi.com.au/cdn/shop/products/647414-Product-0-I-638215360816914605.jpg?v=1685940253', 8, 180),
('Samsung T7 Shield 2TB', 'SSD Portable Rugged', 169.00, 110.00, 5, 2, 'T7-2TB', true, 'https://m.media-amazon.com/images/I/61CKrZWOcrL._AC_SX425_.jpg', 10, 365),
('Cable Thunderbolt 4', 'Pro cable 2m', 129.00, 60.00, 5, 1, 'THUNDER-4', true, 'https://www.istudiobyspvi.com/cdn/shop/files/thunderbolt-4-usbc-pro-cable-1-m_MU883.png?v=1718096124&width=1100', 15, 90),
('Soporte Laptop Alum', 'Ergonómico', 49.00, 20.00, 5, 1, 'LAP-STAND', true, 'https://www.efe.com.pe/media/catalog/product/s/o/soporte_1.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=&width=&canvas=:', 15, 90);


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
-- 10. VENTAS HISTÓRICAS (07-13 DIC 2025)
-- ========================================
INSERT INTO ventas (cliente_id, empleado_id, fecha, subtotal, total, estado, metodo_pago_id, direccion_id) VALUES 
(1, 2, '2025-12-07 10:15:00', 1199.00, 1199.00, 'completada', 2, 9),
(2, 3, '2025-12-07 14:30:00', 3499.00, 3499.00, 'completada', 2, 10),
(3, 4, '2025-12-07 18:45:00', 249.00, 249.00, 'completada', 1, 11),  
(4, 2, '2025-12-08 09:20:00', 1599.00, 1599.00, 'completada', 3, 12),
(5, 3, '2025-12-08 11:10:00', 499.00, 499.00, 'completada', 4, 13),
(6, 4, '2025-12-08 16:50:00', 1299.00, 1299.00, 'completada', 2, 14),  
(7, 2, '2025-12-09 10:00:00', 598.00, 598.00, 'completada', 2, 15),
(8, 3, '2025-12-09 13:20:00', 30000.00, 30000.00, 'completada', 3, 16),  
(9, 4, '2025-12-10 15:00:00', 999.00, 999.00, 'completada', 1, 17),  
(10, 2, '2025-12-10 17:30:00', 499.00, 499.00, 'completada', 2, 18),
(11, 3, '2025-12-11 10:45:00', 3899.00, 3899.00, 'completada', 3, 19),
(12, 4, '2025-12-11 12:15:00', 129.00, 129.00, 'completada', 1, 20), 
(1, 2, '2025-12-11 19:00:00', 1199.00, 1199.00, 'completada', 2, 9),
(2, 3, '2025-12-12 09:30:00', 799.00, 799.00, 'completada', 2, 10),
(3, 4, '2025-12-12 14:20:00', 159.00, 159.00, 'completada', 4, 11), 
(4, 2, '2025-12-12 16:40:00', 349.00, 349.00, 'completada', 1, 12),
(5, 3, '2025-12-13 08:00:00', 25000.00, 25000.00, 'completada', 3, 13), 
(6, 4, '2025-12-13 10:30:00', 229.00, 229.00, 'completada', 1, 14), 
(7, 2, '2025-12-13 12:00:00', 1399.00, 1399.00, 'completada', 2, 15),
(8, 3, '2025-12-13 13:15:00', 2199.00, 2199.00, 'completada', 2, 16); 

-- ========================================
-- 11. DETALLES_DE_VENTA (con ubicación de origen)
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
-- 12. REVIEWS (25 reviews usando solo productos IDs 1-40)
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