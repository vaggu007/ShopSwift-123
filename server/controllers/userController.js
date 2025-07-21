const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('cart.product', 'name price images slug stock isAvailable');

  // Filter out products that no longer exist
  const validCartItems = user.cart.filter(item => item.product);

  // Update cart if items were removed
  if (validCartItems.length !== user.cart.length) {
    user.cart = validCartItems;
    await user.save({ validateBeforeSave: false });
  }

  // Calculate totals
  const subtotal = validCartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  res.status(200).json({
    success: true,
    cart: {
      items: validCartItems,
      itemCount: validCartItems.reduce((count, item) => count + item.quantity, 0),
      subtotal: Math.round(subtotal * 100) / 100
    }
  });
});

// @desc    Add item to cart
// @route   POST /api/users/cart
// @access  Private
const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  // Validate product exists and is available
  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.status !== 'active' || !product.isPublished) {
    return next(new ErrorResponse('Product is not available', 400));
  }

  // Check stock availability
  if (product.trackQuantity && product.stock < quantity) {
    return next(new ErrorResponse(`Only ${product.stock} items available in stock`, 400));
  }

  const user = await User.findById(req.user.id);

  // Check if item already exists in cart
  const existingItem = user.cart.find(item => 
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    
    // Check stock for new quantity
    if (product.trackQuantity && product.stock < newQuantity) {
      return next(new ErrorResponse(`Only ${product.stock} items available in stock`, 400));
    }
    
    existingItem.quantity = newQuantity;
  } else {
    user.cart.push({
      product: productId,
      quantity,
      price: product.price,
      addedAt: new Date()
    });
  }

  await user.save();

  // Return updated cart
  await user.populate('cart.product', 'name price images slug stock');

  res.status(200).json({
    success: true,
    message: 'Item added to cart successfully',
    cart: user.cart
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/users/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  if (quantity < 1) {
    return next(new ErrorResponse('Quantity must be at least 1', 400));
  }

  // Validate product and stock
  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.trackQuantity && product.stock < quantity) {
    return next(new ErrorResponse(`Only ${product.stock} items available in stock`, 400));
  }

  const user = await User.findById(req.user.id);
  const cartItem = user.cart.find(item => 
    item.product.toString() === productId.toString()
  );

  if (!cartItem) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  cartItem.quantity = quantity;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Cart item updated successfully'
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const user = await User.findById(req.user.id);
  const itemIndex = user.cart.findIndex(item => 
    item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  user.cart.splice(itemIndex, 1);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Item removed from cart successfully'
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/users/cart
// @access  Private
const clearCart = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.cart = [];
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully'
  });
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('wishlist', 'name price images slug rating numReviews isAvailable');

  // Filter out products that no longer exist
  const validWishlistItems = user.wishlist.filter(product => product);

  // Update wishlist if items were removed
  if (validWishlistItems.length !== user.wishlist.length) {
    user.wishlist = validWishlistItems.map(product => product._id);
    await user.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    success: true,
    wishlist: validWishlistItems,
    count: validWishlistItems.length
  });
});

// @desc    Add item to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Validate product exists
  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const user = await User.findById(req.user.id);

  // Check if already in wishlist
  if (user.wishlist.includes(productId)) {
    return next(new ErrorResponse('Product already in wishlist', 400));
  }

  user.wishlist.push(productId);
  await user.save();

  // Update product wishlist count
  await Product.findByIdAndUpdate(productId, {
    $inc: { wishlistCount: 1 }
  });

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist successfully'
  });
});

// @desc    Remove item from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const user = await User.findById(req.user.id);
  const itemIndex = user.wishlist.findIndex(id => 
    id.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse('Product not found in wishlist', 404));
  }

  user.wishlist.splice(itemIndex, 1);
  await user.save();

  // Update product wishlist count
  await Product.findByIdAndUpdate(productId, {
    $inc: { wishlistCount: -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist successfully'
  });
});

// @desc    Clear entire wishlist
// @route   DELETE /api/users/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  // Update wishlist count for all products
  if (user.wishlist.length > 0) {
    await Product.updateMany(
      { _id: { $in: user.wishlist } },
      { $inc: { wishlistCount: -1 } }
    );
  }

  user.wishlist = [];
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist cleared successfully'
  });
});

// @desc    Move item from wishlist to cart
// @route   POST /api/users/wishlist/:productId/move-to-cart
// @access  Private
const moveToCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  // Validate product
  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.status !== 'active' || !product.isPublished) {
    return next(new ErrorResponse('Product is not available', 400));
  }

  // Check stock
  if (product.trackQuantity && product.stock < quantity) {
    return next(new ErrorResponse(`Only ${product.stock} items available in stock`, 400));
  }

  const user = await User.findById(req.user.id);

  // Check if in wishlist
  const wishlistIndex = user.wishlist.findIndex(id => 
    id.toString() === productId.toString()
  );

  if (wishlistIndex === -1) {
    return next(new ErrorResponse('Product not found in wishlist', 404));
  }

  // Add to cart
  const existingCartItem = user.cart.find(item => 
    item.product.toString() === productId.toString()
  );

  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + quantity;
    
    if (product.trackQuantity && product.stock < newQuantity) {
      return next(new ErrorResponse(`Only ${product.stock} items available in stock`, 400));
    }
    
    existingCartItem.quantity = newQuantity;
  } else {
    user.cart.push({
      product: productId,
      quantity,
      price: product.price,
      addedAt: new Date()
    });
  }

  // Remove from wishlist
  user.wishlist.splice(wishlistIndex, 1);

  await user.save();

  // Update product wishlist count
  await Product.findByIdAndUpdate(productId, {
    $inc: { wishlistCount: -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Product moved from wishlist to cart successfully'
  });
});

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('addresses');

  res.status(200).json({
    success: true,
    addresses: user.addresses,
    count: user.addresses.length
  });
});

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // If this is the first address or marked as default, make it default
  if (user.addresses.length === 0 || req.body.isDefault) {
    // Remove default from all other addresses
    user.addresses.forEach(address => {
      address.isDefault = false;
    });
    req.body.isDefault = true;
  }

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    address: user.addresses[user.addresses.length - 1]
  });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  // If setting as default, remove default from others
  if (req.body.isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // Update address fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      address[key] = req.body[key];
    }
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    address
  });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  const wasDefault = address.isDefault;
  user.addresses.pull(req.params.addressId);

  // If deleted address was default, make first remaining address default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully'
  });
});

// @desc    Set default address
// @route   PUT /api/users/addresses/:addressId/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  // Remove default from all addresses
  user.addresses.forEach(addr => {
    addr.isDefault = false;
  });

  // Set this address as default
  address.isDefault = true;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Default address updated successfully'
  });
});

// @desc    Get user order history
// @route   GET /api/users/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;

  const options = { page, limit };
  if (status) options.status = status;

  const orders = await Order.getCustomerOrders(req.user.id, options);
  const total = await Order.countDocuments({ customer: req.user.id });

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    orders
  });
});

// @desc    Get user profile stats
// @route   GET /api/users/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Get order statistics
  const orderStats = await Order.aggregate([
    { $match: { customer: user._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);

  const stats = {
    totalOrders: orderStats[0]?.totalOrders || 0,
    totalSpent: orderStats[0]?.totalSpent || 0,
    averageOrderValue: orderStats[0]?.averageOrderValue || 0,
    cartItems: user.cart.length,
    wishlistItems: user.wishlist.length,
    addresses: user.addresses.length,
    loyaltyPoints: user.loyaltyPoints,
    memberSince: user.createdAt
  };

  res.status(200).json({
    success: true,
    stats
  });
});

module.exports = {
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
};