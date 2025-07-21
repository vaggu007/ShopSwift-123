const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  const {
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    shippingMethod = 'standard',
    customerNotes,
    isGift,
    giftMessage
  } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorResponse('No order items provided', 400));
  }

  if (!shippingAddress) {
    return next(new ErrorResponse('Shipping address is required', 400));
  }

  // Validate and calculate order items
  const orderItems = [];
  let subtotal = 0;

  for (let item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return next(new ErrorResponse(`Product not found: ${item.product}`, 404));
    }

    if (product.status !== 'active' || !product.isPublished) {
      return next(new ErrorResponse(`Product not available: ${product.name}`, 400));
    }

    // Check stock
    if (product.trackQuantity && product.stock < item.quantity) {
      return next(new ErrorResponse(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.primaryImage,
      price: product.price,
      quantity: item.quantity,
      sku: product.sku,
      total: itemTotal
    });
  }

  // Calculate shipping cost
  const shippingOptions = {
    standard: 0,
    express: 9.99,
    overnight: 19.99
  };
  const shippingCost = shippingOptions[shippingMethod] || 0;

  // Calculate tax (8% default)
  const taxRate = 0.08;
  const tax = Math.round((subtotal + shippingCost) * taxRate * 100) / 100;

  // Calculate total
  const total = subtotal + shippingCost + tax;

  // Create order
  const orderData = {
    customer: req.user.id,
    customerEmail: req.user.email,
    customerPhone: req.user.phone,
    items: orderItems,
    subtotal,
    tax,
    taxRate,
    shippingCost,
    total,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    payment: {
      method: paymentMethod,
      amount: total,
      status: 'pending'
    },
    shipping: {
      method: shippingMethod,
      cost: shippingCost
    },
    customerNotes,
    isGift,
    giftMessage
  };

  const order = await Order.create(orderData);

  // Update product stock
  for (let item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, purchases: item.quantity }
    });
  }

  // Clear user's cart
  await User.findByIdAndUpdate(req.user.id, {
    $set: { cart: [] }
  });

  // Update user's total spent
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { totalSpent: total },
    $push: { orders: order._id }
  });

  // Send order confirmation email
  try {
    await sendEmail({
      email: order.customerEmail,
      template: 'orderConfirmation',
      data: {
        customerName: `${req.user.firstName} ${req.user.lastName}`,
        orderNumber: order.orderNumber,
        orderDate: order.orderDate.toLocaleDateString(),
        total: total.toFixed(2),
        trackingUrl: `${req.protocol}://${req.get('host')}/orders/${order._id}`,
        appName: 'ShopSwift'
      }
    });
  } catch (error) {
    console.error('Order confirmation email failed:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private (Admin)
const getOrders = asyncHandler(async (req, res, next) => {
  let query = Order.find();

  // Build filters
  const filters = {};

  if (req.query.status) filters.status = req.query.status;
  if (req.query.paymentStatus) filters['payment.status'] = req.query.paymentStatus;
  if (req.query.shippingStatus) filters['shipping.status'] = req.query.shippingStatus;
  
  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filters.orderDate = {};
    if (req.query.startDate) filters.orderDate.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filters.orderDate.$lte = new Date(req.query.endDate);
  }

  // Customer filter
  if (req.query.customer) filters.customer = req.query.customer;

  // Apply filters
  query = query.find(filters);

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-orderDate');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Order.countDocuments(filters);

  query = query.skip(startIndex).limit(limit);

  // Populate
  query = query.populate('customer', 'firstName lastName email')
               .populate('items.product', 'name images slug');

  // Execute query
  const orders = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pagination,
    orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name images slug');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check if user can access this order
  if (req.user.role !== 'admin' && order.customer._id.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }

  res.status(200).json({
    success: true,
    order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  const oldStatus = order.status;
  await order.updateStatus(status, note, req.user.id);

  // Send email notification for certain status changes
  if (status === 'shipped' && oldStatus !== 'shipped') {
    try {
      await sendEmail({
        email: order.customerEmail,
        template: 'orderShipped',
        data: {
          customerName: `${order.customer?.firstName} ${order.customer?.lastName}`,
          orderNumber: order.orderNumber,
          trackingNumber: order.shipping?.trackingNumber || 'TBD',
          carrier: order.shipping?.carrier || 'Standard Carrier',
          estimatedDelivery: order.estimatedDelivery?.toLocaleDateString() || 'TBD',
          trackingUrl: order.shipping?.trackingUrl || `${req.protocol}://${req.get('host')}/orders/${order._id}`,
          appName: 'ShopSwift'
        }
      });
    } catch (error) {
      console.error('Shipping notification email failed:', error);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    order
  });
});

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private (Admin)
const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { status, transactionId, failureReason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  order.payment.status = status;
  if (transactionId) order.payment.transactionId = transactionId;
  if (failureReason) order.payment.failureReason = failureReason;

  if (status === 'completed') {
    order.payment.paidAt = new Date();
    if (order.status === 'pending') {
      order.status = 'confirmed';
    }
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully',
    order
  });
});

// @desc    Update shipping info
// @route   PUT /api/orders/:id/shipping
// @access  Private (Admin)
const updateShippingInfo = asyncHandler(async (req, res, next) => {
  const { 
    trackingNumber, 
    carrier, 
    estimatedDelivery, 
    status,
    trackingUrl 
  } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
  if (carrier) order.shipping.carrier = carrier;
  if (estimatedDelivery) order.shipping.estimatedDelivery = new Date(estimatedDelivery);
  if (status) order.shipping.status = status;
  if (trackingUrl) order.shipping.trackingUrl = trackingUrl;

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Shipping info updated successfully',
    order
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check if user can cancel this order
  if (req.user.role !== 'admin' && order.customer.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized to cancel this order', 403));
  }

  if (!order.canBeCancelled) {
    return next(new ErrorResponse('Order cannot be cancelled at this stage', 400));
  }

  // Restore product stock
  for (let item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }
    });
  }

  const shouldRefund = order.isPaid;
  await order.cancel(reason, shouldRefund);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order
  });
});

// @desc    Request order return
// @route   POST /api/orders/:id/return
// @access  Private
const requestReturn = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check if user can return this order
  if (req.user.role !== 'admin' && order.customer.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized to return this order', 403));
  }

  if (!order.canBeReturned) {
    return next(new ErrorResponse('Order cannot be returned', 400));
  }

  order.returnReason = reason;
  order.returnStatus = 'requested';
  
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Return request submitted successfully',
    order
  });
});

// @desc    Get order analytics
// @route   GET /api/orders/analytics
// @access  Private (Admin)
const getOrderAnalytics = asyncHandler(async (req, res, next) => {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate = new Date(),
    groupBy = 'day'
  } = req.query;

  const salesData = await Order.getSalesAnalytics({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    groupBy
  });

  // Get overall stats
  const totalStats = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);

  // Get status distribution
  const statusDistribution = await Order.aggregate([
    {
      $match: {
        orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      salesData,
      totalStats: totalStats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
      statusDistribution
    }
  });
});

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Private
const getOrderByNumber = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
    .populate('customer', 'firstName lastName email phone')
    .populate('items.product', 'name images slug');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check if user can access this order
  if (req.user.role !== 'admin' && order.customer._id.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse('Not authorized to access this order', 403));
  }

  res.status(200).json({
    success: true,
    order
  });
});

// @desc    Add order note
// @route   POST /api/orders/:id/notes
// @access  Private (Admin)
const addOrderNote = asyncHandler(async (req, res, next) => {
  const { note, isAdminNote = true } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  if (isAdminNote) {
    order.adminNotes = order.adminNotes ? `${order.adminNotes}\n---\n${note}` : note;
  } else {
    order.notes = order.notes ? `${order.notes}\n---\n${note}` : note;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Note added successfully',
    order
  });
});

module.exports = {
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
};