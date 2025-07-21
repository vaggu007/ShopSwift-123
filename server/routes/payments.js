const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  cancelPayment,
  createRefund,
  getPaymentMethods,
  removePaymentMethod,
  createSetupIntent,
  handleWebhook
} = require('../controllers/paymentController');

const router = express.Router();

// Payment intent routes
router.post(
  '/create-intent',
  protect,
  [
    body('orderId')
      .notEmpty()
      .withMessage('Order ID is required')
      .isMongoId()
      .withMessage('Invalid order ID format'),
    body('savePaymentMethod')
      .optional()
      .isBoolean()
      .withMessage('savePaymentMethod must be a boolean'),
  ],
  handleValidationErrors,
  createPaymentIntent
);

router.post(
  '/confirm',
  protect,
  [
    body('paymentIntentId')
      .notEmpty()
      .withMessage('Payment intent ID is required')
      .isString()
      .withMessage('Payment intent ID must be a string'),
    body('paymentMethodId')
      .notEmpty()
      .withMessage('Payment method ID is required')
      .isString()
      .withMessage('Payment method ID must be a string'),
  ],
  handleValidationErrors,
  confirmPayment
);

router.get(
  '/:paymentIntentId/status',
  protect,
  getPaymentStatus
);

router.post(
  '/:paymentIntentId/cancel',
  protect,
  cancelPayment
);

// Refund routes (Admin only)
router.post(
  '/:paymentIntentId/refund',
  protect,
  authorize('admin'),
  [
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number'),
    body('reason')
      .optional()
      .isIn(['duplicate', 'fraudulent', 'requested_by_customer'])
      .withMessage('Invalid refund reason'),
  ],
  handleValidationErrors,
  createRefund
);

// Payment methods routes
router.get(
  '/payment-methods',
  protect,
  getPaymentMethods
);

router.delete(
  '/payment-methods/:paymentMethodId',
  protect,
  removePaymentMethod
);

router.post(
  '/setup-intent',
  protect,
  createSetupIntent
);

// Webhook endpoint (public but verified)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

module.exports = router;