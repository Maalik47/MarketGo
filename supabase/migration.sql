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

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permitir registro (insert anónimo en users)
CREATE POLICY "allow_insert" ON users
  FOR INSERT WITH CHECK (true);

-- Leer propio perfil
CREATE POLICY "allow_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  stock INTEGER DEFAULT 1,
  desc TEXT NOT NULL,
  image TEXT,
  views INTEGER DEFAULT 0,
  simulated_sales INTEGER DEFAULT 0,
  seller_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer productos
CREATE POLICY "allow_select_all" ON products
  FOR SELECT USING (true);

-- Usuarios autenticados pueden insertar sus propios productos
CREATE POLICY "allow_insert_own" ON products
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    user_id = auth.uid()::bigint
  );

-- Usuarios pueden actualizar sus productos
CREATE POLICY "allow_update_own" ON products
  FOR UPDATE USING (user_id = auth.uid()::bigint);

-- Usuarios pueden eliminar sus productos
CREATE POLICY "allow_delete_own" ON products
  FOR DELETE USING (user_id = auth.uid()::bigint);

-- Index para búsquedas
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
