const express = require('express');
const { body, param, query } = require('express-validator');

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  addProductReview,
  updateProductReview,
  deleteProductReview,
  updateProductStock,
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals
} = require('../controllers/productController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// Validation middleware
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isMongoId()
    .withMessage('Please provide a valid category ID'),
  body('brand')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand is required and must not exceed 100 characters'),
  body('sku')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('SKU is required and must not exceed 50 characters'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid category ID'),
  body('brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must not exceed 100 characters'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Comment must be between 5 and 1000 characters')
];

const stockUpdateValidation = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('operation')
    .optional()
    .isIn(['set', 'add', 'subtract'])
    .withMessage('Operation must be set, add, or subtract')
];

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid product ID')
];

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProduct);

// Protected routes - Reviews
router.use(protect); // All routes below require authentication

router.post('/:id/reviews', 
  mongoIdValidation, 
  reviewValidation, 
  handleValidationErrors, 
  addProductReview
);

router.put('/:id/reviews/:reviewId', 
  [
    param('id').isMongoId().withMessage('Please provide a valid product ID'),
    param('reviewId').isMongoId().withMessage('Please provide a valid review ID'),
    ...reviewValidation
  ],
  handleValidationErrors, 
  updateProductReview
);

router.delete('/:id/reviews/:reviewId', 
  [
    param('id').isMongoId().withMessage('Please provide a valid product ID'),
    param('reviewId').isMongoId().withMessage('Please provide a valid review ID')
  ],
  handleValidationErrors, 
  deleteProductReview
);

// Admin only routes
router.use(authorize('admin')); // All routes below require admin role

router.post('/', createProductValidation, handleValidationErrors, createProduct);
router.put('/:id', mongoIdValidation, updateProductValidation, handleValidationErrors, updateProduct);
router.delete('/:id', mongoIdValidation, handleValidationErrors, deleteProduct);
router.put('/:id/stock', 
  mongoIdValidation, 
  stockUpdateValidation, 
  handleValidationErrors, 
  updateProductStock
);

module.exports = router;