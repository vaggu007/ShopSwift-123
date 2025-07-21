const express = require('express');
const fs = require('fs');
const path = require('path');

console.log("products.js loaded! __dirname:", __dirname);
const router = express.Router();

// Improved function with error handling
function loadProducts() {
  const dataPath = path.join(__dirname, '../data/products.json');
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(jsonData);
  } catch (err) {
    // Log error for debugging
    console.error("Error loading products.json:", err.message);
    return null; // Indicate failure
  }
}


router.get('/', (req, res) => {
  let products = loadProducts();
  if (!products) {
    return res.status(500).json({ error: 'Could not load products data.' });
  }

  // Filter by category
  if (req.query.category) {
    products = products.filter(
      p => p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  // Filter by inStock
  if (req.query.inStock === 'true') {
    products = products.filter(p => p.inStock === true);
  }

  // Search
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    products = products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Sort
  if (req.query.sort === 'price_asc') {
    products = products.sort((a, b) => a.price - b.price);
  } else if (req.query.sort === 'price_desc') {
    products = products.sort((a, b) => b.price - a.price);
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || products.length;
  const start = (page - 1) * limit;
  const paginated = products.slice(start, start + limit);

  res.json({
    total: products.length,
    page,
    limit,
    products: paginated
  });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const products = loadProducts();
  if (!products) {
    return res.status(500).json({ error: 'Could not load products data.' });
  }
  const product = products.find(p => String(p.id) === String(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', (req, res) => {
  const products = loadProducts();
  if (!products) {
    return res.status(500).json({ error: 'Could not load products data.' });
  }
  const product = products.find(p => String(p.id) === String(req.params.id));
  if (product && product.reviews) {
    res.json(product.reviews);
  } else if (product) {
    res.status(404).json({ error: 'No reviews found for this product.' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

module.exports = router;