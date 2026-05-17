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
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'marketplace')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

function readJSON(file) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8') || '[]');
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(__dirname, file), JSON.stringify(data, null, 2));
}

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

// ===================== PRODUCTS =====================

// Public: get all products (no auth needed)
app.get('/api/products/public', (req, res) => {
  const products = readJSON('products.json');
  res.json(products);
});

// Auth: get user's own products
app.get('/api/products', auth, (req, res) => {
  const products = readJSON('products.json');
  const userProducts = products.filter(p => p.userId === req.user.id);
  res.json(userProducts);
});

function saveBase64Image(base64, id) {
  if (!base64 || !base64.startsWith('data:image')) return null;
  const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = Buffer.from(matches[2], 'base64');
  const filename = `product_${id}.${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), data);
  return `/uploads/${filename}`;
}

app.post('/api/products', auth, (req, res) => {
  const { name, category, price, stock, desc, image } = req.body;
  if (!name || !category || !price || !desc) return res.status(400).json({ error: 'Completa todos los campos' });
  const products = readJSON('products.json');
  const id = Date.now();
  const product = {
    id,
    userId: req.user.id,
    sellerName: req.user.name,
    name,
    category,
    price: parseFloat(price),
    stock: parseInt(stock) || 1,
    desc,
    image: null,
    views: Math.floor(Math.random() * 400) + 10,
    simulatedSales: Math.floor(Math.random() * 30),
    createdAt: new Date().toISOString()
  };
  if (image) {
    product.image = saveBase64Image(image, id);
  }
  products.push(product);
  writeJSON('products.json', products);
  res.json(product);
});

app.put('/api/products/:id', auth, (req, res) => {
  const products = readJSON('products.json');
  const index = products.findIndex(p => p.id === parseInt(req.params.id) && p.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });
  const { name, category, price, stock, desc, image } = req.body;
  Object.assign(products[index], { name, category, price: parseFloat(price), stock: parseInt(stock) || 1, desc });
  if (image && image.startsWith('data:image')) {
    products[index].image = saveBase64Image(image, products[index].id);
  }
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
