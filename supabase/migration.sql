-- ============================================================
-- MarketGo — Migración Inicial
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Nota: la API usa service_role key, RLS no se aplica.
-- Estas policies son solo por si se usa anon key.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER DEFAULT 1,
  "desc" TEXT NOT NULL,
  image TEXT,
  views INTEGER DEFAULT 0,
  simulated_sales INTEGER DEFAULT 0,
  seller_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer y escribir (la API maneja auth con JWT)
CREATE POLICY "allow_all" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- Index para búsquedas
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
