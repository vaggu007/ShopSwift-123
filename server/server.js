const express = require('express');
const path = require('path');

console.log("== SERVER.JS IS RUNNING ==");
console.log("Working Directory:", process.cwd());
console.log("__dirname:", __dirname);

const app = express();
const PORT = process.env.PORT || 5050;

// Log every request for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Mount product routes
const productsRouter = require('./routes/products');
console.log("Products router loaded!");
app.use('/api/products', productsRouter);
console.log("Products router mounted at /api/products");

// Mount extra endpoints router
const extraRouter = require('./routes/extra');
app.use('/api', extraRouter);
console.log("Extra router mounted at /api");

// Static assets for images
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Home
app.get('/', (req, res) => {
  res.send('ShopSwift Backend API Running!');
});

// Status endpoint
app.get('/api/status', (req, res) => {
  console.log("Status check endpoint hit");
  res.json({ status: 'OK', message: 'ShopSwift API online' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('== HEALTH CHECK HIT ==');
  res.json({ status: "HEALTHY" });
});

// Fallback 404 for unhandled routes (MUST BE LAST)
app.use((req, res) => {
  console.log(`404 Handler Hit for URL: ${req.originalUrl}`);
  res.status(404).send('404 - Not Found - URL: ' + req.originalUrl);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});