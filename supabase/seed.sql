-- ============================================================
-- MarketGo — Seed Products
-- Ejecutar en Supabase SQL Editor después de migration.sql
-- ============================================================

INSERT INTO products (user_id,name,category,price,stock,"desc",image,views,simulated_sales,seller_name,created_at) VALUES
(0,'Laptop Pro X1','Tecnología',5459958,10,'Potente laptop con procesador i9, 32GB RAM y SSD 1TB. Ideal para desarrollo y diseño.','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop',342,28,'MarketGo','2026-01-15T10:00:00.000Z'),
(0,'Monitor UltraWide 34"','Tecnología',2519958,15,'Pantalla curva 21:9 WQHD 144Hz. Experiencia inmersiva para máxima productividad.','https://images.unsplash.com/photo-1527443222154-69f3a7450ee0?w=600&h=400&fit=crop',256,15,'MarketGo','2026-01-20T10:00:00.000Z'),
(0,'Teclado Mecánico RGB','Tecnología',629958,30,'Switches Cherry MX Blue, retroiluminación RGB y construcción en aluminio.','https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop',189,22,'MarketGo','2026-02-01T10:00:00.000Z'),
(0,'Auriculares ANC Pro','Tecnología',1049958,20,'Cancelación de ruido activa, sonido Hi-Res, 40h de batería.','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop',410,35,'MarketGo','2026-02-05T10:00:00.000Z'),
(0,'Camiseta Premium Algodón','Moda',167958,50,'Camiseta de algodón orgánico, corte moderno y colores neutros.','https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop',320,45,'MarketGo','2026-01-10T10:00:00.000Z'),
(0,'Zapatos Deportivos Airmax','Moda',545958,25,'Diseño ergonómico con tecnología de amortiguación.','https://images.unsplash.com/photo-1595950653106-6c9ebd45d0a1?w=600&h=400&fit=crop',280,18,'MarketGo','2026-01-25T10:00:00.000Z'),
(0,'Reloj Inteligente GT4','Moda',839958,15,'Smartwatch con GPS, monitoreo de salud y batería de 14 días.','https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=400&fit=crop',510,32,'MarketGo','2026-02-10T10:00:00.000Z'),
(0,'Mochila Ejecutiva 40L','Moda',377958,20,'Mochila impermeable con compartimento para laptop de 15.6".','https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop',175,12,'MarketGo','2026-02-15T10:00:00.000Z'),
(0,'Lámpara LED Inteligente','Hogar',230958,40,'Lámpara WiFi con 16M colores, control por voz.','https://images.unsplash.com/photo-1507473885765-e3f5a6b0e9b0?w=600&h=400&fit=crop',230,25,'MarketGo','2026-01-05T10:00:00.000Z'),
(0,'Cafetera Automática Pro','Hogar',755958,12,'Cafetera programable con molinillo integrado.','https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=400&fit=crop',198,14,'MarketGo','2026-01-30T10:00:00.000Z'),
(0,'Robot Aspirador Smart','Hogar',1259958,8,'Aspirador robot con navegación láser y mapeo inteligente.','https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',340,20,'MarketGo','2026-02-20T10:00:00.000Z'),
(0,'Purificador de Aire HEPA','Hogar',923958,10,'Purificador con filtro HEPA True.','https://images.unsplash.com/photo-1585776294823-4e0f9b0a1c2d?w=600&h=400&fit=crop',150,8,'MarketGo','2026-03-01T10:00:00.000Z'),
(0,'Bicicleta Eléctrica Plegable','Deportes',3779958,5,'Bicicleta eléctrica con motor 500W, batería 48V, autonomía 60km.','https://images.unsplash.com/photo-1576433986499-6f9b8a0c3d5e?w=600&h=400&fit=crop',450,10,'MarketGo','2026-01-12T10:00:00.000Z'),
(0,'Pesas Ajustables 25kg','Deportes',1049958,20,'Set de pesas ajustables con sistema de cambio rápido.','https://images.unsplash.com/photo-1534438327276-14e5300c3a5f?w=600&h=400&fit=crop',290,16,'MarketGo','2026-02-08T10:00:00.000Z'),
(0,'Cinta de Correr Plegable','Deportes',2519958,7,'Cinta plegable con motor 2.5HP, inclinación motorizada.','https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&h=400&fit=crop',180,6,'MarketGo','2026-02-25T10:00:00.000Z'),
(0,'Kit Facial LED','Salud',545958,15,'Mascarilla LED con 7 colores de luz para tratamiento facial.','https://images.unsplash.com/photo-1596174866013-6a0b1c2d3e4f?w=600&h=400&fit=crop',165,11,'MarketGo','2026-01-18T10:00:00.000Z'),
(0,'Difusor Aromaterapia','Salud',180558,30,'Difusor ultrasónico con LED, capacidad 300ml.','https://images.unsplash.com/photo-1607611926008-4c9d0a1b2e3f?w=600&h=400&fit=crop',210,18,'MarketGo','2026-02-12T10:00:00.000Z'),
(0,'Masajeador Eléctrico Shiatsu','Salud',377958,12,'Masajeador de cuello y espalda con tecnología Shiatsu.','https://images.unsplash.com/photo-1544161515-5c9d8a7b6e5f?w=600&h=400&fit=crop',195,9,'MarketGo','2026-03-05T10:00:00.000Z'),
(0,'Guía Completa JavaScript','Libros',209958,25,'Aprende JavaScript desde cero hasta avanzado.','https://images.unsplash.com/photo-1517694712202-14d0a1b2c3d4?w=600&h=400&fit=crop',280,22,'MarketGo','2026-01-08T10:00:00.000Z'),
(0,'Marketing Digital 2026','Libros',167958,20,'Estrategias de marketing digital, SEO, SEM y redes sociales.','https://images.unsplash.com/photo-1553729459-5a0b1c2d3e4f?w=600&h=400&fit=crop',310,30,'MarketGo','2026-02-18T10:00:00.000Z');
