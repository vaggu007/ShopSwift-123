const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm a payment intent
const confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw error;
  }
};

// Retrieve a payment intent
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

// Cancel a payment intent
const cancelPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    throw error;
  }
};

// Create a refund
const createRefund = async (paymentIntentId, amount = null, reason = 'requested_by_customer') => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
      reason,
    };
    
    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }
    
    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};

// Create a customer
const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    
    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Retrieve a customer
const retrieveCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('Error retrieving customer:', error);
    throw error;
  }
};

// Update a customer
const updateCustomer = async (customerId, updateData) => {
  try {
    const customer = await stripe.customers.update(customerId, updateData);
    return customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

// Create a setup intent for saving payment methods
const createSetupIntent = async (customerId, metadata = {}) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      metadata,
    });
    
    return setupIntent;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw error;
  }
};

// List customer payment methods
const listPaymentMethods = async (customerId, type = 'card') => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });
    
    return paymentMethods;
  } catch (error) {
    console.error('Error listing payment methods:', error);
    throw error;
  }
};

// Detach a payment method
const detachPaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error('Error detaching payment method:', error);
    throw error;
  }
};

// Verify webhook signature
const verifyWebhookSignature = (payload, signature, endpointSecret) => {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

// Calculate application fee (for marketplace scenarios)
const calculateApplicationFee = (amount, feePercentage = 2.9) => {
  return Math.round(amount * (feePercentage / 100) * 100); // Convert to cents
};

// Format amount for display
const formatAmount = (amount, currency = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

// Get supported payment methods for a country
const getSupportedPaymentMethods = (country = 'US') => {
  const supportedMethods = {
    US: ['card', 'us_bank_account', 'link'],
    CA: ['card', 'acss_debit'],
    GB: ['card', 'bacs_debit'],
    EU: ['card', 'sepa_debit', 'giropay', 'ideal', 'sofort'],
    IN: ['card', 'upi'],
    AU: ['card', 'au_becs_debit'],
  };
  
  return supportedMethods[country.toUpperCase()] || ['card'];
};

// Create a product for recurring payments
const createProduct = async (name, description, metadata = {}) => {
  try {
    const product = await stripe.products.create({
      name,
      description,
      metadata,
    });
    
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Create a price for a product
const createPrice = async (productId, unitAmount, currency = 'usd', recurring = null) => {
  try {
    const priceData = {
      product: productId,
      unit_amount: Math.round(unitAmount * 100),
      currency: currency.toLowerCase(),
    };
    
    if (recurring) {
      priceData.recurring = recurring;
    }
    
    const price = await stripe.prices.create(priceData);
    return price;
  } catch (error) {
    console.error('Error creating price:', error);
    throw error;
  }
};

module.exports = {
  stripe,
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
  calculateApplicationFee,
  formatAmount,
  getSupportedPaymentMethods,
  createProduct,
  createPrice,
};