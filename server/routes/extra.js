// /server/routes/extra.js
const express = require('express');
const fs = require('fs');
const path = require('path');

console.log("extra.js loaded!");

const router = express.Router();

function loadProducts() {
  const dataPath = path.join(__dirname, '../data/products.json');
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (err) {
    console.error("Error loading products.json:", err.message);
    return null;
  }
}

// GET /api/categories — Returns all unique categories
router.get('/categories', (req, res) => {
  console.log("GET /api/categories called!");
  const products = loadProducts();
  if (!products) return res.status(500).json({ error: 'Could not load products data.' });
  const categories = [...new Set(products.map(p => p.category))];
  res.json({ categories });
});

// GET /api/featured — Returns first 4 products as featured
router.get('/featured', (req, res) => {
  console.log("GET /api/featured called!");
  const products = loadProducts();
  if (!products) return res.status(500).json({ error: 'Could not load products data.' });
  const featured = products.slice(0, 4);
  res.json({ featured });
});

router.get('/test-categories', (req, res) => {
    res.json({ test: "Test endpoint works!" });
  });

module.exports = router;