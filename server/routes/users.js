const express = require('express');
const { body, param } = require('express-validator');

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getUserOrders,
  getUserStats
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Validation middleware
const addToCartValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Please provide a valid product ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50')
];

const updateCartValidation = [
  body('quantity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50')
];

const addressValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('zipCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

const updateAddressValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('zipCode')
    .optional()
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

const mongoIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Please provide a valid product ID')
];

const addressIdValidation = [
  param('addressId')
    .isMongoId()
    .withMessage('Please provide a valid address ID')
];

const moveToCartValidation = [
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Quantity must be between 1 and 50')
];

// Cart routes
router.get('/cart', getCart);
router.post('/cart', addToCartValidation, handleValidationErrors, addToCart);
router.put('/cart/:productId', mongoIdValidation, updateCartValidation, handleValidationErrors, updateCartItem);
router.delete('/cart/:productId', mongoIdValidation, handleValidationErrors, removeFromCart);
router.delete('/cart', clearCart);

// Wishlist routes
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', mongoIdValidation, handleValidationErrors, addToWishlist);
router.delete('/wishlist/:productId', mongoIdValidation, handleValidationErrors, removeFromWishlist);
router.delete('/wishlist', clearWishlist);
router.post('/wishlist/:productId/move-to-cart', 
  mongoIdValidation, 
  moveToCartValidation, 
  handleValidationErrors, 
  moveToCart
);

// Address routes
router.get('/addresses', getAddresses);
router.post('/addresses', addressValidation, handleValidationErrors, addAddress);
router.put('/addresses/:addressId', 
  addressIdValidation, 
  updateAddressValidation, 
  handleValidationErrors, 
  updateAddress
);
router.delete('/addresses/:addressId', addressIdValidation, handleValidationErrors, deleteAddress);
router.put('/addresses/:addressId/default', addressIdValidation, handleValidationErrors, setDefaultAddress);

// Order history and stats
router.get('/orders', getUserOrders);
router.get('/stats', getUserStats);

module.exports = router;