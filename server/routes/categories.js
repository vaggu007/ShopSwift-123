const express = require('express');
const { body, param } = require('express-validator');

const {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryBreadcrumb,
  getCategoryChildren,
  getCategoryAncestors,
  getCategoryDescendants,
  updateCategoryProductCount,
  updateAllCategoryProductCounts,
  getFeaturedCategories,
  reorderCategories,
  getCategoryStats
} = require('../controllers/categoryController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// Validation middleware
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid parent category ID'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Please provide a valid hex color')
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid parent category ID'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Please provide a valid hex color'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('featured must be a boolean')
];

const reorderCategoriesValidation = [
  body('categoryOrders')
    .isArray({ min: 1 })
    .withMessage('categoryOrders must be a non-empty array'),
  body('categoryOrders.*.id')
    .isMongoId()
    .withMessage('Each category order must have a valid ID'),
  body('categoryOrders.*.displayOrder')
    .isInt({ min: 0 })
    .withMessage('Each category order must have a valid display order')
];

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid category ID')
];

// Public routes
router.get('/featured', getFeaturedCategories);
router.get('/tree', getCategoryTree);
router.get('/', optionalAuth, getCategories);
router.get('/:id', optionalAuth, getCategory);
router.get('/:id/breadcrumb', mongoIdValidation, handleValidationErrors, getCategoryBreadcrumb);
router.get('/:id/children', mongoIdValidation, handleValidationErrors, getCategoryChildren);
router.get('/:id/ancestors', mongoIdValidation, handleValidationErrors, getCategoryAncestors);
router.get('/:id/descendants', mongoIdValidation, handleValidationErrors, getCategoryDescendants);

// Admin only routes
router.use(protect, authorize('admin')); // All routes below require admin authentication

router.post('/', createCategoryValidation, handleValidationErrors, createCategory);
router.put('/:id', mongoIdValidation, updateCategoryValidation, handleValidationErrors, updateCategory);
router.delete('/:id', mongoIdValidation, handleValidationErrors, deleteCategory);

// Category management routes
router.put('/:id/product-count', mongoIdValidation, handleValidationErrors, updateCategoryProductCount);
router.put('/update-all-product-counts', updateAllCategoryProductCounts);
router.put('/reorder', reorderCategoriesValidation, handleValidationErrors, reorderCategories);
router.get('/:id/stats', mongoIdValidation, handleValidationErrors, getCategoryStats);

module.exports = router;