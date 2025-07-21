const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    
    // Extract field name from error
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    // Provide more specific messages for common fields
    if (field === 'email') {
      message = `Email '${value}' is already registered`;
    } else if (field === 'slug') {
      message = `This name is already taken`;
    } else if (field === 'sku') {
      message = `SKU '${value}' already exists`;
    } else {
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    }
    
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ErrorResponse(message, 401);
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = new ErrorResponse(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new ErrorResponse(message, 400);
  }

  // Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    let message = 'Payment processing error';
    
    switch (err.type) {
      case 'StripeCardError':
        message = err.message || 'Your card was declined';
        break;
      case 'StripeRateLimitError':
        message = 'Too many requests made to the API too quickly';
        break;
      case 'StripeInvalidRequestError':
        message = 'Invalid parameters were supplied to Stripe\'s API';
        break;
      case 'StripeAPIError':
        message = 'An error occurred internally with Stripe\'s API';
        break;
      case 'StripeConnectionError':
        message = 'Some kind of error occurred during the HTTPS communication';
        break;
      case 'StripeAuthenticationError':
        message = 'You probably used an incorrect API key';
        break;
      default:
        message = err.message || 'Payment processing error';
    }
    
    error = new ErrorResponse(message, 400);
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection error';
    error = new ErrorResponse(message, 500);
  }

  if (err.name === 'MongoTimeoutError') {
    const message = 'Database operation timed out';
    error = new ErrorResponse(message, 500);
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = new ErrorResponse(message, 429);
  }

  // Default to 500 server error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
};

// Handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Handle 404 errors
const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  const formattedErrors = {};
  
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      if (error.param) {
        formattedErrors[error.param] = error.msg;
      }
    });
  } else if (typeof errors === 'object') {
    Object.keys(errors).forEach(key => {
      formattedErrors[key] = errors[key].message || errors[key];
    });
  }
  
  return formattedErrors;
};

// Express-validator error handler
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = formatValidationErrors(errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  formatValidationErrors,
  handleValidationErrors
};