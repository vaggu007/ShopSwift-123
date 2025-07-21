const express = require('express');
const { body, param } = require('express-validator');

const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  updateShippingInfo,
  cancelOrder,
  requestReturn,
  getOrderAnalytics,
  getOrderByNumber,
  addOrderNote
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// All order routes require authentication
router.use(protect);

// Validation middleware
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Each item must have a valid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 50 })
    .withMessage('Each item quantity must be between 1 and 50'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('shippingAddress.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('shippingAddress.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  body('shippingAddress.zipCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters'),
  body('paymentMethod')
    .isIn(['card', 'paypal', 'stripe', 'apple_pay', 'google_pay', 'bank_transfer', 'cash_on_delivery'])
    .withMessage('Please provide a valid payment method'),
  body('shippingMethod')
    .optional()
    .isIn(['standard', 'express', 'overnight', 'pickup'])
    .withMessage('Please provide a valid shipping method'),
  body('customerNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Customer notes cannot exceed 500 characters'),
  body('isGift')
    .optional()
    .isBoolean()
    .withMessage('isGift must be a boolean'),
  body('giftMessage')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Gift message cannot exceed 200 characters')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'])
    .withMessage('Please provide a valid order status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters')
];

const updatePaymentStatusValidation = [
  body('status')
    .isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'])
    .withMessage('Please provide a valid payment status'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Transaction ID must be between 1 and 100 characters'),
  body('failureReason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Failure reason cannot exceed 200 characters')
];

const updateShippingInfoValidation = [
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tracking number must be between 1 and 100 characters'),
  body('carrier')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Carrier must be between 1 and 100 characters'),
  body('estimatedDelivery')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid estimated delivery date'),
  body('status')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'])
    .withMessage('Please provide a valid shipping status'),
  body('trackingUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid tracking URL')
];

const cancelOrderValidation = [
  body('reason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Cancellation reason must be between 5 and 200 characters')
];

const requestReturnValidation = [
  body('reason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Return reason must be between 5 and 200 characters')
];

const addOrderNoteValidation = [
  body('note')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Note must be between 1 and 500 characters'),
  body('isAdminNote')
    .optional()
    .isBoolean()
    .withMessage('isAdminNote must be a boolean')
];

const mongoIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Please provide a valid order ID')
];

const orderNumberValidation = [
  param('orderNumber')
    .matches(/^ORD-\d{6}-\d{4}$/)
    .withMessage('Please provide a valid order number')
];

// Customer routes
router.post('/', createOrderValidation, handleValidationErrors, createOrder);
router.get('/number/:orderNumber', orderNumberValidation, handleValidationErrors, getOrderByNumber);
router.get('/:id', mongoIdValidation, handleValidationErrors, getOrder);
router.put('/:id/cancel', mongoIdValidation, cancelOrderValidation, handleValidationErrors, cancelOrder);
router.post('/:id/return', mongoIdValidation, requestReturnValidation, handleValidationErrors, requestReturn);

// Admin only routes
router.use(authorize('admin')); // All routes below require admin role

router.get('/', getOrders);
router.get('/analytics', getOrderAnalytics);
router.put('/:id/status', mongoIdValidation, updateOrderStatusValidation, handleValidationErrors, updateOrderStatus);
router.put('/:id/payment', mongoIdValidation, updatePaymentStatusValidation, handleValidationErrors, updatePaymentStatus);
router.put('/:id/shipping', mongoIdValidation, updateShippingInfoValidation, handleValidationErrors, updateShippingInfo);
router.post('/:id/notes', mongoIdValidation, addOrderNoteValidation, handleValidationErrors, addOrderNote);

module.exports = router;