-- Qulager дүкені: дерекқор (SQLite / MySQL / PostgreSQL үшін жалпы SQL)
-- Іске қосу (SQLite):  sqlite3 qulager.db < qulager.sql

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  slug VARCHAR(30) NOT NULL UNIQUE,
  title VARCHAR(80) NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  category_id INTEGER NOT NULL,
  name VARCHAR(120) NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  image VARCHAR(120),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_name VARCHAR(80),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  price INTEGER NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  author_uid VARCHAR(64) NOT NULL,   -- пікір иесі (жоюға тек сол ғана құқылы)
  author_name VARCHAR(40) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Санаттар
INSERT INTO categories (id, slug, title) VALUES (1, 'meat', 'Ет өнімдері');
INSERT INTO categories (id, slug, title) VALUES (2, 'dairy', 'Сүт өнімдері');
INSERT INTO categories (id, slug, title) VALUES (3, 'poultry', 'Аң-құс');
INSERT INTO categories (id, slug, title) VALUES (4, 'sub', 'Суб набор');
INSERT INTO categories (id, slug, title) VALUES (5, 'spices', 'Дәмдеуіштер');
INSERT INTO categories (id, slug, title) VALUES (6, 'own', 'Біздің өнімдер');

-- Өнімдер
INSERT INTO products (id, code, category_id, name, price, image) VALUES (1, 'beef', 1, 'Сиыр еті (сүйексіз)', 3200, 'images/products/beef.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (2, 'horse', 1, 'Жылқы еті (сұр ет)', 3800, 'images/products/horse.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (3, 'qazy', 1, 'Қолдың қазысы', 4500, 'images/products/qazy.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (4, 'lamb', 1, 'Жас қой еті', 2800, 'images/products/lamb.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (5, 'milk', 2, 'Табиғи сиыр сүті', 400, 'images/products/milk.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (6, 'ayran', 2, 'Қолдың айраны', 450, 'images/products/ayran.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (7, 'qaymaq', 2, 'Майлы қаймақ', 1200, 'images/products/qaymaq.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (8, 'qurt', 2, 'Түркістан құрты', 3500, 'images/products/qurt.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (9, 'chicken', 3, 'Бүтін тауық', 1600, 'images/products/chicken.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (10, 'quail', 3, 'Бөдене еті', 800, 'images/products/quail.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (11, 'fillet', 3, 'Тауық филесі', 2200, 'images/products/fillet.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (12, 'wings', 3, 'Тауық қанаттары', 1800, 'images/products/wings.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (13, 'liver', 4, 'Сиыр бауыры', 1500, 'images/products/liver.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (14, 'heart', 4, 'Сиыр жүрегі', 1800, 'images/products/heart.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (15, 'head', 4, 'Қойдың бас-сирағы', 2500, 'images/products/head.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (16, 'tongue', 4, 'Сиыр тілі', 3000, 'images/products/tongue.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (17, 'palau', 5, 'Палауға арналған дәмдеуіш', 500, 'images/products/palau.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (18, 'kebab', 5, 'Кәуап маринады', 600, 'images/products/kebab.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (19, 'pepper', 5, 'Қара бұрыш ұнтағы', 350, 'images/products/pepper.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (20, 'universal', 5, 'Әмбебап дәмдеуіш', 400, 'images/products/universal.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (21, 'tushpara', 6, 'Қолдың тұшпарасы', 2500, 'images/products/tushpara.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (22, 'manti', 6, 'Мәнті (кесілген ет)', 2800, 'images/products/manti.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (23, 'cutlet', 6, 'Үй котлеттері (10 дана)', 2200, 'images/products/cutlet.svg');
INSERT INTO products (id, code, category_id, name, price, image) VALUES (24, 'meatball', 6, 'Фрикадельки', 2400, 'images/products/meatball.svg');

-- Мысал тапсырыс
INSERT INTO orders (id, customer_name, phone, total) VALUES (1, 'Асхат', '+77001112233', 7400);
INSERT INTO order_items (order_id, product_id, qty, price) VALUES (1, 1, 2, 3200);
INSERT INTO order_items (order_id, product_id, qty, price) VALUES (1, 6, 2, 450);

INSERT INTO reviews (author_uid, author_name, rating, text) VALUES ('demo-uid-1', 'Асхат', 5, 'Ет өте балғын!');

-- Мысал сұраулар (емтиханға)
-- 1) Барлық өнімдер санатымен:
-- SELECT c.title, p.name, p.price FROM products p JOIN categories c ON c.id = p.category_id ORDER BY c.id;
-- 2) Әр санаттағы өнім саны мен орташа баға:
-- SELECT c.title, COUNT(*) AS cnt, AVG(p.price) AS avg_price FROM products p JOIN categories c ON c.id = p.category_id GROUP BY c.title;
-- 3) 3000 ₸-ден қымбат өнімдер:
-- SELECT name, price FROM products WHERE price > 3000 ORDER BY price DESC;
-- 5) Орташа баға (пікірлер): SELECT AVG(rating) FROM reviews;
-- 4) Тапсырыс құрамы:
-- SELECT o.id, p.name, oi.qty, oi.price*oi.qty AS sum FROM orders o JOIN order_items oi ON oi.order_id=o.id JOIN products p ON p.id=oi.product_id;
