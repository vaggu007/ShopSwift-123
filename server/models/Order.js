const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    public_id: String,
    url: String
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  variant: {
    name: String,
    value: String,
    price: Number
  },
  sku: String,
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  apartment: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'United States',
    trim: true
  },
  phone: {
    type: String,
    trim: true
  }
});

const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['card', 'paypal', 'stripe', 'apple_pay', 'google_pay', 'bank_transfer', 'cash_on_delivery'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  transactionId: String,
  paymentIntentId: String, // For Stripe
  paymentId: String, // For PayPal
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paidAt: Date,
  failureReason: String,
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundReason: String,
  refundedAt: Date
});

const shippingInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['standard', 'express', 'overnight', 'pickup'],
    default: 'standard'
  },
  cost: {
    type: Number,
    default: 0,
    min: 0
  },
  estimatedDelivery: Date,
  carrier: String,
  trackingNumber: String,
  trackingUrl: String,
  shippedAt: Date,
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
    default: 'pending'
  },
  notes: String
});

const orderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  note: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  customerPhone: String,
  
  // Order Items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountCode: String,
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Addresses
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  billingAddress: shippingAddressSchema,
  
  // Payment Information
  payment: paymentInfoSchema,
  
  // Shipping Information
  shipping: shippingInfoSchema,
  
  // Order Status
  status: {
    type: String,
    enum: [
      'pending',           // Order placed, payment pending
      'confirmed',         // Payment confirmed
      'processing',        // Order being prepared
      'shipped',          // Order shipped
      'delivered',        // Order delivered
      'cancelled',        // Order cancelled
      'returned',         // Order returned
      'refunded'          // Order refunded
    ],
    default: 'pending'
  },
  
  // Status History
  statusHistory: [orderStatusHistorySchema],
  
  // Special Instructions
  notes: String,
  customerNotes: String,
  adminNotes: String,
  
  // Dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  returnedAt: Date,
  
  // Cancellation/Return
  cancellationReason: String,
  returnReason: String,
  returnStatus: {
    type: String,
    enum: ['none', 'requested', 'approved', 'rejected', 'received', 'processed'],
    default: 'none'
  },
  
  // Gift Options
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  giftWrap: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  source: {
    type: String,
    enum: ['web', 'mobile', 'admin', 'api'],
    default: 'web'
  },
  referrer: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  
  // Fulfillment
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled'],
    default: 'unfulfilled'
  },
  
  // Reviews
  reviewRequested: {
    type: Boolean,
    default: false
  },
  reviewRequestedAt: Date,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'shipping.status': 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ orderDate: -1 });

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.orderDate) / (1000 * 60 * 60 * 24));
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed', 'processing'].includes(this.status);
});

// Virtual for can be returned
orderSchema.virtual('canBeReturned').get(function() {
  return this.status === 'delivered' && 
         this.deliveredAt && 
         (Date.now() - this.deliveredAt.getTime()) <= (30 * 24 * 60 * 60 * 1000); // 30 days
});

// Virtual for is paid
orderSchema.virtual('isPaid').get(function() {
  return this.payment && this.payment.status === 'completed';
});

// Virtual for estimated delivery date
orderSchema.virtual('estimatedDelivery').get(function() {
  if (this.shipping && this.shipping.estimatedDelivery) {
    return this.shipping.estimatedDelivery;
  }
  
  // Calculate based on shipping method
  const daysToAdd = {
    'standard': 7,
    'express': 3,
    'overnight': 1,
    'pickup': 0
  };
  
  const method = this.shipping?.method || 'standard';
  const baseDate = this.shippedAt || this.orderDate;
  const deliveryDate = new Date(baseDate);
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd[method]);
  
  return deliveryDate;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Find the latest order for this month
    const latestOrder = await this.constructor
      .findOne({ orderNumber: new RegExp(`^ORD-${year}${month}`) })
      .sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (latestOrder) {
      const lastSequence = parseInt(latestOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `ORD-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to update status history
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Pre-save middleware to set status dates
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'confirmed':
        if (!this.confirmedAt) this.confirmedAt = now;
        break;
      case 'shipped':
        if (!this.shippedAt) this.shippedAt = now;
        if (this.shipping) this.shipping.shippedAt = now;
        break;
      case 'delivered':
        if (!this.deliveredAt) this.deliveredAt = now;
        if (this.shipping) this.shipping.deliveredAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
      case 'returned':
        if (!this.returnedAt) this.returnedAt = now;
        break;
    }
  }
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('tax') || this.isModified('discount') || this.isModified('shippingCost')) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((total, item) => total + item.total, 0);
    
    // Calculate total
    this.total = this.subtotal + (this.tax || 0) + (this.shippingCost || 0) - (this.discount || 0);
    
    // Ensure total is not negative
    this.total = Math.max(0, this.total);
  }
  next();
});

// Static method to get orders by customer
orderSchema.statics.getCustomerOrders = function(customerId, options = {}) {
  const {
    page = 1,
    limit = 10,
    status,
    startDate,
    endDate
  } = options;

  const query = { customer: customerId };
  
  if (status) query.status = status;
  if (startDate || endDate) {
    query.orderDate = {};
    if (startDate) query.orderDate.$gte = new Date(startDate);
    if (endDate) query.orderDate.$lte = new Date(endDate);
  }

  return this.find(query)
    .populate('items.product', 'name slug images')
    .sort({ orderDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get sales analytics
orderSchema.statics.getSalesAnalytics = async function(options = {}) {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate = new Date(),
    groupBy = 'day' // day, week, month
  } = options;

  const matchStage = {
    orderDate: { $gte: startDate, $lte: endDate },
    status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
  };

  const groupFormat = {
    day: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
    week: { $dateToString: { format: '%Y-W%U', date: '$orderDate' } },
    month: { $dateToString: { format: '%Y-%m', date: '$orderDate' } }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: groupFormat[groupBy],
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        totalItems: { $sum: { $sum: '$items.quantity' } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Instance method to add status update
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note,
    updatedBy,
    timestamp: new Date()
  });
  
  return this.save();
};

// Instance method to calculate tax
orderSchema.methods.calculateTax = function(taxRate = 0.08) {
  this.taxRate = taxRate;
  this.tax = Math.round((this.subtotal * taxRate) * 100) / 100;
  return this.save();
};

// Instance method to apply discount
orderSchema.methods.applyDiscount = function(discountAmount, discountCode = '') {
  this.discount = Math.min(discountAmount, this.subtotal);
  this.discountCode = discountCode;
  return this.save();
};

// Instance method to mark as paid
orderSchema.methods.markAsPaid = function(paymentData = {}) {
  if (this.payment) {
    this.payment.status = 'completed';
    this.payment.paidAt = new Date();
    Object.assign(this.payment, paymentData);
  }
  
  if (this.status === 'pending') {
    this.status = 'confirmed';
  }
  
  return this.save();
};

// Instance method to cancel order
orderSchema.methods.cancel = function(reason = '', refund = false) {
  if (!this.canBeCancelled) {
    throw new Error('Order cannot be cancelled');
  }
  
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  
  if (refund && this.isPaid) {
    this.payment.status = 'refunded';
    this.payment.refundAmount = this.total;
    this.payment.refundedAt = new Date();
    this.payment.refundReason = reason;
  }
  
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);