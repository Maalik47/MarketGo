const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const app = express();
const JWT_SECRET = 'marketgo_secret_key_2026';
app.use(express.json());

// ===================== DATABASE =====================
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const useSupabase = !!(SUPABASE_URL && SUPABASE_KEY);

let supabase;
if (useSupabase) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Usando Supabase');
}

// Fallback: JSON files (local dev)
function readJSON(file) {
  const dir = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, '..', 'data');
  const p = path.join(dir, file);
  try {
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf-8') || '[]');
  } catch { return []; }
}

function writeJSON(file, data) {
  const dir = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2));
}

// Seed for JSON fallback on Vercel
if (!useSupabase && process.env.VERCEL) {
  const dir = '/tmp/data';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    const seed = path.join(__dirname, '..', 'data');
    if (fs.existsSync(seed)) fs.readdirSync(seed).forEach(f => fs.copyFileSync(path.join(seed, f), path.join(dir, f)));
  }
}

// ===================== AUTH MIDDLEWARE =====================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Token inválido' }); }
}

// ===================== HELPERS =====================
function makeToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}
function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

// ===================== AUTH ENDPOINTS =====================
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    if (useSupabase) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
      if (existing) return res.status(400).json({ error: 'El email ya está registrado' });

      const hash = await bcrypt.hash(password, 10);
      const { data, error } = await supabase.from('users').insert({ name, email, password: hash }).select().single();
      if (error) throw error;

      const token = makeToken(data);
      res.json({ token, user: safeUser(data) });
    } else {
      const users = readJSON('users.json');
      if (users.find(u => u.email === email)) return res.status(400).json({ error: 'El email ya está registrado' });
      const hash = await bcrypt.hash(password, 10);
      const user = { id: Date.now(), name, email, password: hash };
      users.push(user);
      writeJSON('users.json', users);
      const token = makeToken(user);
      res.json({ token, user: safeUser(user) });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error interno: ' + err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

    let user;
    if (useSupabase) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error || !data) return res.status(400).json({ error: 'Credenciales inválidas' });
      user = data;
    } else {
      const users = readJSON('users.json');
      user = users.find(u => u.email === email);
      if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Credenciales inválidas' });
    const token = makeToken(user);
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Error interno: ' + err.message });
  }
});

app.get('/api/me', auth, (req, res) => res.json({ user: req.user }));

// ===================== PRODUCTS =====================
app.get('/api/products/public', async (req, res) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data.map(mapProduct));
    } else {
      res.json(readJSON('products.json'));
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products', auth, async (req, res) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase.from('products').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data.map(mapProduct));
    } else {
      res.json(readJSON('products.json').filter(p => p.userId === req.user.id));
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', auth, async (req, res) => {
  try {
    const { name, category, price, stock, desc } = req.body;
    if (!name || !category || !price || !desc) return res.status(400).json({ error: 'Completa todos los campos' });

    if (useSupabase) {
      const { data, error } = await supabase.from('products').insert({
        user_id: req.user.id, name, category, price: parseFloat(price), stock: parseInt(stock) || 1, desc,
        image: req.body.image || null, seller_name: req.user.name,
        views: Math.floor(Math.random() * 400) + 10, simulated_sales: Math.floor(Math.random() * 30)
      }).select().single();
      if (error) throw error;
      res.json(mapProduct(data));
    } else {
      const products = readJSON('products.json');
      const product = { id: Date.now(), userId: req.user.id, name, category, price: parseFloat(price), stock: parseInt(stock) || 1, desc, image: req.body.image || null, sellerName: req.user.name, views: Math.floor(Math.random() * 400) + 10, simulatedSales: Math.floor(Math.random() * 30), createdAt: new Date().toISOString() };
      products.push(product);
      writeJSON('products.json', products);
      res.json(product);
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, category, price, stock, desc } = req.body;

    if (useSupabase) {
      const { data, error } = await supabase.from('products').update({ name, category, price: parseFloat(price), stock: parseInt(stock) || 1, desc, image: req.body.image || null }).eq('id', id).eq('user_id', req.user.id).select().single();
      if (error || !data) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(mapProduct(data));
    } else {
      const products = readJSON('products.json');
      const idx = products.findIndex(p => p.id === id && p.userId === req.user.id);
      if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
      Object.assign(products[idx], { name, category, price: parseFloat(price), stock: parseInt(stock) || 1, desc, image: req.body.image || null });
      writeJSON('products.json', products);
      res.json(products[idx]);
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (useSupabase) {
      const { data, error } = await supabase.from('products').delete().eq('id', id).eq('user_id', req.user.id).select().single();
      if (error || !data) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(mapProduct(data));
    } else {
      const products = readJSON('products.json');
      const idx = products.findIndex(p => p.id === id && p.userId === req.user.id);
      if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
      const removed = products.splice(idx, 1)[0];
      writeJSON('products.json', products);
      res.json(removed);
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Map Supabase column names -> camelCase (same as JSON fallback)
function mapProduct(p) {
  return {
    id: p.id, userId: p.user_id, name: p.name, category: p.category,
    price: p.price, stock: p.stock, desc: p.desc,
    image: p.image, views: p.views, simulatedSales: p.simulated_sales,
    sellerName: p.seller_name, createdAt: p.created_at
  };
}

module.exports = app;
