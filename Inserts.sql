insert into auth_users (name, email, "emailVerified", image)
values ('Admin TechSphere', 'admin@techsphere.com', null, null),
       ('Admin TechSphere', 'duran@techsphere.com', null, null);

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

insert into marcas (nombre, pais_origen, sitio_web)
values ('Apple', 'Estados Unidos', 'https://apple.com'),
       ('Samsung', 'Corea del Sur', 'https://samsung.com'),
       ('Sony', 'Japón', 'https://sony.com'),
       ('Dell', 'Estados Unidos', 'https://dell.com'),
       ('ASUS', 'Taiwán', 'https://asus.com');


insert into productos (nombre, descripcion, precio, precio_costo, stock, categoria_id, marca_id, sku, imagen_url)
values ('iPhone 15 Pro', 'Smartphone premium con chip A17 Pro', 1299.99, 950.00, 25, 1, 1, 'IPH15PRO', 'https://nextlevel.com.bo/cdn/shop/files/IPHONE15PROMAX_256_1024x1024@2x.jpg?v=1728942145'),
       ('MacBook Air M2', 'Laptop ultradelgada con chip M2', 1199.99, 850.00, 15, 2, 1, 'MBA-M2', 'https://www.machines.com.my/cdn/shop/files/MacBook_Air_13_in_Midnight_PDP_Image_Position-1__WWEN.jpg?v=1730310712&width=713'),
       ('Galaxy S24 Ultra', 'Smartphone Android flagship', 1199.99, 880.00, 20, 1, 2, 'GS24ULTRA', 'https://incomm.com.bn/img/uploaditemdetail/dt17490ded155d25242556c60e92ba9d202f691593.png'),
       ('PlayStation 5', 'Consola de videojuegos de última generación', 499.99, 380.00, 10, 3, 3, 'PS5-STD', 'https://www.jbhifi.com.au/cdn/shop/files/784128-Product-0-I-638616198003053141.jpg?v=1726542858'),
       ('AirPods Pro', 'Auriculares inalámbricos con cancelación de ruido', 249.99, 180.00, 50, 4, 1, 'APP-GEN2', 'https://www.ismartbolivia.com/wp-content/uploads/2020/05/MQD83-800x800.jpeg'),
       ('Dell XPS 13', 'Laptop premium con pantalla InfinityEdge', 999.99, 700.00, 18, 2, 4, 'XPS13-2024', 'https://www.jbhifi.com.au/cdn/shop/files/796191-Product-0-I-638777674218331408.jpg?v=1742170692');