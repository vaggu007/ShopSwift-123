const {
  createPaymentIntent,
  confirmPaymentIntent,
  retrievePaymentIntent,
  cancelPaymentIntent,
  createRefund,
  createCustomer,
  retrieveCustomer,
  updateCustomer,
  createSetupIntent,
  listPaymentMethods,
  detachPaymentMethod,
  verifyWebhookSignature,
  formatAmount
} = require('../config/stripe');
const Order = require('../models/Order');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create payment intent for order
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { orderId, savePaymentMethod = false } = req.body;

  // Find the order
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Verify order belongs to user
  if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }

  // Check if order is already paid
  if (order.paymentInfo.status === 'completed') {
    return next(new ErrorResponse('Order is already paid', 400));
  }

  try {
    // Get or create Stripe customer
    let stripeCustomerId = req.user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await createCustomer(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
        { userId: req.user.id.toString() }
      );
      stripeCustomerId = customer.id;
      
      // Save Stripe customer ID to user
      await User.findByIdAndUpdate(req.user.id, { stripeCustomerId });
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      order.total,
      order.currency || 'usd',
      {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: req.user.id.toString()
      }
    );

    // Update order with payment intent ID
    order.paymentInfo.paymentIntentId = paymentIntent.id;
    order.paymentInfo.status = 'pending';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        orderId: order._id,
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return next(new ErrorResponse('Failed to create payment intent', 500));
  }
});

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId, paymentMethodId } = req.body;

  try {
    const paymentIntent = await confirmPaymentIntent(paymentIntentId, paymentMethodId);
    
    // Find and update order
    const order = await Order.findOne({ 'paymentInfo.paymentIntentId': paymentIntentId });
    
    if (!order) {
      return next(new ErrorResponse('Order not found for this payment', 404));
    }

    // Update order payment status
    if (paymentIntent.status === 'succeeded') {
      order.paymentInfo.status = 'completed';
      order.paymentInfo.paidAt = new Date();
      order.paymentInfo.paymentMethod = paymentIntent.payment_method;
      order.status = 'confirmed';
      
      // Add to status history
      order.statusHistory.push({
        status: 'confirmed',
        updatedBy: req.user.id,
        note: 'Payment completed successfully'
      });
    } else {
      order.paymentInfo.status = 'failed';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: paymentIntent.status === 'succeeded' ? 'Payment confirmed successfully' : 'Payment failed',
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        orderId: order._id,
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return next(new ErrorResponse('Failed to confirm payment', 500));
  }
});

// @desc    Get payment status
// @route   GET /api/payments/:paymentIntentId/status
// @access  Private
exports.getPaymentStatus = asyncHandler(async (req, res, next) => {
  const { paymentIntentId } = req.params;

  try {
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);
    
    // Find associated order
    const order = await Order.findOne({ 'paymentInfo.paymentIntentId': paymentIntentId });

    res.status(200).json({
      success: true,
      message: 'Payment status retrieved successfully',
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        orderId: order?._id,
        orderNumber: order?.orderNumber
      }
    });
  } catch (error) {
    console.error('Error retrieving payment status:', error);
    return next(new ErrorResponse('Failed to retrieve payment status', 500));
  }
});

// @desc    Cancel payment
// @route   POST /api/payments/:paymentIntentId/cancel
// @access  Private
exports.cancelPayment = asyncHandler(async (req, res, next) => {
  const { paymentIntentId } = req.params;

  try {
    const paymentIntent = await cancelPaymentIntent(paymentIntentId);
    
    // Find and update order
    const order = await Order.findOne({ 'paymentInfo.paymentIntentId': paymentIntentId });
    
    if (order) {
      // Verify order belongs to user or user is admin
      if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to cancel this payment', 403));
      }

      order.paymentInfo.status = 'cancelled';
      order.status = 'cancelled';
      
      // Add to status history
      order.statusHistory.push({
        status: 'cancelled',
        updatedBy: req.user.id,
        note: 'Payment cancelled by user'
      });
      
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment cancelled successfully',
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        orderId: order?._id
      }
    });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    return next(new ErrorResponse('Failed to cancel payment', 500));
  }
});

// @desc    Create refund
// @route   POST /api/payments/:paymentIntentId/refund
// @access  Private/Admin
exports.createRefund = asyncHandler(async (req, res, next) => {
  const { paymentIntentId } = req.params;
  const { amount, reason = 'requested_by_customer' } = req.body;

  try {
    const refund = await createRefund(paymentIntentId, amount, reason);
    
    // Find and update order
    const order = await Order.findOne({ 'paymentInfo.paymentIntentId': paymentIntentId });
    
    if (order) {
      order.paymentInfo.refunds = order.paymentInfo.refunds || [];
      order.paymentInfo.refunds.push({
        refundId: refund.id,
        amount: refund.amount / 100, // Convert from cents
        reason: refund.reason,
        status: refund.status,
        createdAt: new Date(refund.created * 1000)
      });
      
      // Update order status if fully refunded
      if (refund.amount === order.total * 100) {
        order.status = 'refunded';
        order.statusHistory.push({
          status: 'refunded',
          updatedBy: req.user.id,
          note: `Full refund processed: ${formatAmount(refund.amount, refund.currency)}`
        });
      } else {
        order.statusHistory.push({
          status: order.status,
          updatedBy: req.user.id,
          note: `Partial refund processed: ${formatAmount(refund.amount, refund.currency)}`
        });
      }
      
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: 'Refund created successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        orderId: order?._id
      }
    });
  } catch (error) {
    console.error('Error creating refund:', error);
    return next(new ErrorResponse('Failed to create refund', 500));
  }
});

// @desc    Get user payment methods
// @route   GET /api/payments/payment-methods
// @access  Private
exports.getPaymentMethods = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user.stripeCustomerId) {
    return res.status(200).json({
      success: true,
      message: 'No payment methods found',
      data: { paymentMethods: [] }
    });
  }

  try {
    const paymentMethods = await listPaymentMethods(user.stripeCustomerId);

    res.status(200).json({
      success: true,
      message: 'Payment methods retrieved successfully',
      data: {
        paymentMethods: paymentMethods.data.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year
          } : null,
          created: new Date(pm.created * 1000)
        }))
      }
    });
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    return next(new ErrorResponse('Failed to retrieve payment methods', 500));
  }
});

// @desc    Remove payment method
// @route   DELETE /api/payments/payment-methods/:paymentMethodId
// @access  Private
exports.removePaymentMethod = asyncHandler(async (req, res, next) => {
  const { paymentMethodId } = req.params;

  try {
    await detachPaymentMethod(paymentMethodId);

    res.status(200).json({
      success: true,
      message: 'Payment method removed successfully',
      data: { paymentMethodId }
    });
  } catch (error) {
    console.error('Error removing payment method:', error);
    return next(new ErrorResponse('Failed to remove payment method', 500));
  }
});

// @desc    Create setup intent for saving payment methods
// @route   POST /api/payments/setup-intent
// @access  Private
exports.createSetupIntent = asyncHandler(async (req, res, next) => {
  try {
    // Get or create Stripe customer
    let stripeCustomerId = req.user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await createCustomer(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`,
        { userId: req.user.id.toString() }
      );
      stripeCustomerId = customer.id;
      
      // Save Stripe customer ID to user
      await User.findByIdAndUpdate(req.user.id, { stripeCustomerId });
    }

    const setupIntent = await createSetupIntent(stripeCustomerId, {
      userId: req.user.id.toString()
    });

    res.status(200).json({
      success: true,
      message: 'Setup intent created successfully',
      data: {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id
      }
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return next(new ErrorResponse('Failed to create setup intent', 500));
  }
});

// @desc    Handle Stripe webhooks
// @route   POST /api/payments/webhook
// @access  Public (but verified)
exports.handleWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = verifyWebhookSignature(req.body, sig, endpointSecret);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return next(new ErrorResponse('Webhook verification failed', 400));
  }
});

// Helper function to handle successful payment
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const order = await Order.findOne({ 
    'paymentInfo.paymentIntentId': paymentIntent.id 
  });

  if (order) {
    order.paymentInfo.status = 'completed';
    order.paymentInfo.paidAt = new Date();
    order.status = 'confirmed';
    
    order.statusHistory.push({
      status: 'confirmed',
      note: 'Payment completed via webhook'
    });
    
    await order.save();
  }
};

// Helper function to handle failed payment
const handlePaymentIntentFailed = async (paymentIntent) => {
  const order = await Order.findOne({ 
    'paymentInfo.paymentIntentId': paymentIntent.id 
  });

  if (order) {
    order.paymentInfo.status = 'failed';
    order.status = 'cancelled';
    
    order.statusHistory.push({
      status: 'cancelled',
      note: 'Payment failed via webhook'
    });
    
    await order.save();
  }
};

// Helper function to handle successful setup intent
const handleSetupIntentSucceeded = async (setupIntent) => {
  console.log('Setup intent succeeded:', setupIntent.id);
  // Additional logic for handling successful payment method setup
};