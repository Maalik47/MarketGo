const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'marketgo_secret_key_2026';

app.use(cors());
app.use(express.json());

function readJSON(file) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8') || '[]');
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(__dirname, file), JSON.stringify(data, null, 2));
}

// Auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// ===================== AUTH =====================

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Todos los campos son obligatorios' });

  const users = readJSON('users.json');
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'El email ya está registrado' });

  const hash = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), name, email, password: hash };
  users.push(user);
  writeJSON('users.json', users);

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const users = readJSON('users.json');
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ user: req.user });
});

// ===================== PRODUCTS (user's) =====================

app.get('/api/products', auth, (req, res) => {
  const products = readJSON('products.json');
  const userProducts = products.filter(p => p.userId === req.user.id);
  res.json(userProducts);
});

app.post('/api/products', auth, (req, res) => {
  const { name, category, price, stock, desc } = req.body;
  if (!name || !category || !price || !desc) return res.status(400).json({ error: 'Completa todos los campos' });

  const products = readJSON('products.json');
  const product = {
    id: Date.now(),
    userId: req.user.id,
    name,
    category,
    price: parseFloat(price),
    stock: parseInt(stock) || 1,
    desc,
    views: Math.floor(Math.random() * 400) + 10,
    simulatedSales: Math.floor(Math.random() * 30),
    createdAt: new Date().toISOString()
  };
  products.push(product);
  writeJSON('products.json', products);
  res.json(product);
});

app.put('/api/products/:id', auth, (req, res) => {
  const products = readJSON('products.json');
  const index = products.findIndex(p => p.id === parseInt(req.params.id) && p.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const { name, category, price, stock, desc } = req.body;
  Object.assign(products[index], { name, category, price: parseFloat(price), stock: parseInt(stock) || 1, desc });
  writeJSON('products.json', products);
  res.json(products[index]);
});

app.delete('/api/products/:id', auth, (req, res) => {
  const products = readJSON('products.json');
  const index = products.findIndex(p => p.id === parseInt(req.params.id) && p.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const removed = products.splice(index, 1)[0];
  writeJSON('products.json', products);
  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`MarketGo API corriendo en http://localhost:${PORT}`);
});
