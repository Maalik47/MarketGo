const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const JWT_SECRET = 'marketgo_secret_key_2026';

app.use(express.json());

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJSON(file) {
  const p = path.join(DATA_DIR, file);
  try {
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf-8') || '[]');
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

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
  if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Credenciales inválidas' });
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/me', auth, (req, res) => res.json({ user: req.user }));

app.get('/api/products', auth, (req, res) => {
  res.json(readJSON('products.json').filter(p => p.userId === req.user.id));
});

app.post('/api/products', auth, (req, res) => {
  const { name, category, price, stock, desc } = req.body;
  if (!name || !category || !price || !desc) return res.status(400).json({ error: 'Completa todos los campos' });
  const products = readJSON('products.json');
  const product = { id: Date.now(), userId: req.user.id, name, category, price: parseFloat(price), stock: parseInt(stock) || 1, desc, views: Math.floor(Math.random() * 400) + 10, simulatedSales: Math.floor(Math.random() * 30), createdAt: new Date().toISOString() };
  products.push(product);
  writeJSON('products.json', products);
  res.json(product);
});

app.put('/api/products/:id', auth, (req, res) => {
  const products = readJSON('products.json');
  const idx = products.findIndex(p => p.id === parseInt(req.params.id) && p.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
  const { name, category, price, stock, desc } = req.body;
  Object.assign(products[idx], { name, category, price: parseFloat(price), stock: parseInt(stock) || 1, desc });
  writeJSON('products.json', products);
  res.json(products[idx]);
});

app.delete('/api/products/:id', auth, (req, res) => {
  const products = readJSON('products.json');
  const idx = products.findIndex(p => p.id === parseInt(req.params.id) && p.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
  const removed = products.splice(idx, 1)[0];
  writeJSON('products.json', products);
  res.json(removed);
});

module.exports = app;
