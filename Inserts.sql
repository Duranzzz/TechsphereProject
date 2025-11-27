-- Limpiar tablas
TRUNCATE TABLE auth_accounts, auth_sessions, auth_users, auth_verification_token, categorias, clientes, compras, detalles_compra, detalles_venta, empleados, garantias, kardex, marcas, productos, proveedores, ventas CASCADE;

-- Reiniciar secuencias
ALTER SEQUENCE auth_accounts_id_seq RESTART WITH 1;
ALTER SEQUENCE auth_sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE auth_users_id_seq RESTART WITH 1;
ALTER SEQUENCE categorias_id_seq RESTART WITH 1;
ALTER SEQUENCE clientes_id_seq RESTART WITH 1;
ALTER SEQUENCE compras_id_seq RESTART WITH 1;
ALTER SEQUENCE detalles_compra_id_seq RESTART WITH 1;
ALTER SEQUENCE detalles_venta_id_seq RESTART WITH 1;
ALTER SEQUENCE empleados_id_seq RESTART WITH 1;
ALTER SEQUENCE garantias_id_seq RESTART WITH 1;
ALTER SEQUENCE kardex_id_seq RESTART WITH 1;
ALTER SEQUENCE marcas_id_seq RESTART WITH 1;
ALTER SEQUENCE productos_id_seq RESTART WITH 1;
ALTER SEQUENCE proveedores_id_seq RESTART WITH 1;
ALTER SEQUENCE ventas_id_seq RESTART WITH 1;

insert into auth_users (name, email, "emailVerified", image)
values ('Admin TechSphere', 'admin@techsphere.com', null, null),
       ('Duran', 'duran@techsphere.com', null, null);

-- Las contraseñas están hasheadas usando npm argon2
insert into auth_accounts ("userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, id_token, scope, session_state, token_type, password)
values (1, 'credentials', 'credentials', '1', null, null, null, null, null, null, null, '$argon2id$v=19$m=65536,t=3,p=4$jCDeAaFRH7yzJxVhpuNIbw$mrBdakeMTViLISq4AqFqrVoDp9zFs5MPCCXF/b6Lv6Y'),
       (2, 'credentials', 'credentials', '2', null, null, null, null, null, null, null, '$argon2id$v=19$m=65536,t=3,p=4$WPCtdrShDoL+6gp1vIzZzg$L41IJFME9cawQm/p32+p0l4W77z5DwIOCDqpxzHl2HI');

insert into categorias (nombre, descripcion, activa)
values ('Smartphones', 'Teléfonos inteligentes y accesorios', true),
       ('Laptops', 'Computadoras portátiles y ultrabooks', true),
       ('Gaming', 'Equipos y accesorios para gaming', true),
       ('Audio', 'Auriculares, parlantes y equipos de audio', true),
       ('Accesorios', 'Cables, cargadores y otros accesorios', true),
       ('Tabletas', 'Dispositivos portátiles para trabajo y entretenimiento', true),
       ('Wearables', 'Relojes inteligentes y dispositivos de fitness', true);

insert into clientes (nombre, apellido, email, telefono, direccion, tipo, activo)
values ('Leonardo', 'Duran', 'leonardoduran@gmail.com', '+59173111977', 'Santa Cruz de la Sierra, Bolivia', 'consumidor_final', true),
       ('Marcelo', 'Aguilera', 'marceloaguilera@gmail.com', '+59161975956', 'Yacuiba, Tarija', 'consumidor_final', true),
       ('Leonel', 'Messi', 'leonelmessi@gmail.com', '1234567890', 'Argentina', 'consumidor_final', true),
       ('Cristiano', 'Ronaldo', 'cristianoronaldo@gmail.com', '0987654321', 'Portugal', 'consumidor_final', true);

insert into empleados (nombre, apellido, email, telefono, puesto, activo)
values ('Vendedor', 'Default', 'vendedor@techsphere.com', '+59170000000', 'vendedor', true);

insert into marcas (nombre, pais_origen, sitio_web)
values ('Apple', 'Estados Unidos', 'https://apple.com'),
       ('Samsung', 'Corea del Sur', 'https://samsung.com'),
       ('Sony', 'Japón', 'https://sony.com'),
       ('Dell', 'Estados Unidos', 'https://dell.com'),
       ('ASUS', 'Taiwán', 'https://asus.com'),
       ('HP', 'Estados Unidos', 'https://hp.com'),
       ('Lenovo', 'China', 'https://lenovo.com'),
       ('Redragon', 'China', 'https://redragonzone.com');

insert into productos (nombre, descripcion, precio, precio_costo, stock, categoria_id, marca_id, sku, imagen_url)
values ('iPhone 15 Pro', 'Smartphone premium con chip A17 Pro', 1299.99, 950.00, 25, 1, 1, 'IPH15PRO', 'https://nextlevel.com.bo/cdn/shop/files/IPHONE15PROMAX_256_1024x1024@2x.jpg?v=1728942145'),
       ('MacBook Air M2', 'Laptop ultradelgada con chip M2', 1199.99, 850.00, 15, 2, 1, 'MBA-M2', 'https://www.machines.com.my/cdn/shop/files/MacBook_Air_13_in_Midnight_PDP_Image_Position-1__WWEN.jpg?v=1730310712&width=713'),
       ('Galaxy S24 Ultra', 'Smartphone Android flagship', 1199.99, 880.00, 20, 1, 2, 'GS24ULTRA', 'https://incomm.com.bn/img/uploaditemdetail/dt17490ded155d25242556c60e92ba9d202f691593.png'),
       ('PlayStation 5', 'Consola de videojuegos de última generación', 499.99, 380.00, 10, 3, 3, 'PS5-STD', 'https://www.jbhifi.com.au/cdn/shop/files/784128-Product-0-I-638616198003053141.jpg?v=1726542858'),
       ('AirPods Pro', 'Auriculares inalámbricos con cancelación de ruido', 249.99, 180.00, 50, 4, 1, 'APP-GEN2', 'https://www.ismartbolivia.com/wp-content/uploads/2020/05/MQD83-800x800.jpeg'),
       ('Dell XPS 13', 'Laptop premium con pantalla InfinityEdge', 999.99, 700.00, 18, 2, 4, 'XPS13-2024', 'https://www.jbhifi.com.au/cdn/shop/files/796191-Product-0-I-638777674218331408.jpg?v=1742170692'),
       ('iPad Pro 12.9"', 'Tableta profesional con chip M2', 1099.99, 800.00, 29, 6, 1, 'IPADPRO12-9', 'https://istore.co.bw/cdn/shop/products/iPad_ProM2_WiFi_Cellular_SpaceGrey_Position1_9d3a94d3-ea4c-4a06-977b-02572cbbf9b6_2048x.png?v=1677825158');

 insert into proveedores (nombre, contacto, telefono, email, direccion, activo)
    values ('Tech Distributors Inc.', 'Carlos Méndez', '+59173111977', 'techdistributors@gmail.com', '123 Tech St, Silicon Valley, CA', true)