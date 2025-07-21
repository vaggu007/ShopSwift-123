const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
  let query = Product.find();

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Build filters
  const filters = {};

  // Status filter (always filter by active for public)
  if (req.user && req.user.role === 'admin') {
    if (reqQuery.status) filters.status = reqQuery.status;
  } else {
    filters.status = 'active';
    filters.isPublished = true;
  }

  // Category filter
  if (reqQuery.category) {
    filters.category = reqQuery.category;
  }

  // Brand filter
  if (reqQuery.brand) {
    filters.brand = new RegExp(reqQuery.brand, 'i');
  }

  // Price range filter
  if (reqQuery.minPrice || reqQuery.maxPrice) {
    filters.price = {};
    if (reqQuery.minPrice) filters.price.$gte = parseFloat(reqQuery.minPrice);
    if (reqQuery.maxPrice) filters.price.$lte = parseFloat(reqQuery.maxPrice);
  }

  // Rating filter
  if (reqQuery.minRating) {
    filters.rating = { $gte: parseFloat(reqQuery.minRating) };
  }

  // In stock filter
  if (reqQuery.inStock === 'true') {
    filters.$or = [
      { stock: { $gt: 0 } },
      { allowBackorder: true }
    ];
  }

  // Featured/trending/new filters
  if (reqQuery.featured === 'true') filters.featured = true;
  if (reqQuery.trending === 'true') filters.trending = true;
  if (reqQuery.newArrival === 'true') filters.newArrival = true;
  if (reqQuery.bestSeller === 'true') filters.bestSeller = true;

  // Search functionality
  if (reqQuery.search) {
    filters.$text = { $search: reqQuery.search };
  }

  // Apply filters
  query = query.find(filters);

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // Default sort by creation date
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments(filters);

  query = query.skip(startIndex).limit(limit);

  // Populate
  query = query.populate('category', 'name slug')
               .populate('reviews.user', 'firstName lastName');

  // Execute query
  const products = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination,
    products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res, next) => {
  let product;

  // Check if the parameter is an ObjectId or a slug
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    // It's an ObjectId
    product = await Product.findById(req.params.id);
  } else {
    // It's a slug
    product = await Product.findOne({ slug: req.params.id });
  }

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check if user can view this product
  if (!req.user || req.user.role !== 'admin') {
    if (product.status !== 'active' || !product.isPublished) {
      return next(new ErrorResponse('Product not found', 404));
    }
  }

  // Populate related data
  await product.populate([
    { path: 'category', select: 'name slug path' },
    { path: 'reviews.user', select: 'firstName lastName avatar' },
    { path: 'relatedProducts', select: 'name price images slug rating' },
    { path: 'crossSellProducts', select: 'name price images slug rating' },
    { path: 'upsellProducts', select: 'name price images slug rating' }
  ]);

  // Increment views (don't wait for it)
  product.incrementViews().catch(err => console.error('Failed to increment views:', err));

  res.status(200).json({
    success: true,
    product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Validate category exists
  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }
  }

  const product = await Product.create(req.body);

  // Populate category
  await product.populate('category', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Validate category if being updated
  if (req.body.category && req.body.category !== product.category.toString()) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }
  }

  // Add updatedBy
  req.body.updatedBy = req.user.id;

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('category', 'name slug');

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res, next) => {
  const { q, category, brand, minPrice, maxPrice, minRating, sort, page = 1, limit = 20 } = req.query;

  if (!q) {
    return next(new ErrorResponse('Search query is required', 400));
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sort || '-rating',
    category,
    brand,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    minRating: minRating ? parseFloat(minRating) : undefined
  };

  const products = await Product.searchProducts(q, options);
  const total = products.length; // This is a simplified count

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    query: q,
    products
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId);
  
  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 20,
    sort: req.query.sort || '-createdAt',
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
    inStock: req.query.inStock === 'true'
  };

  const products = await Product.findByCategory(req.params.categoryId, options);
  const total = await Product.countDocuments({ 
    category: req.params.categoryId, 
    status: 'active',
    isPublished: true 
  });

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    category: {
      id: category._id,
      name: category.name,
      slug: category.slug
    },
    products
  });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, images } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check if user already reviewed this product
  const existingReview = product.reviews.find(
    review => review.user.toString() === req.user.id.toString()
  );

  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this product', 400));
  }

  // Check if user purchased this product (optional check)
  // const hasPurchased = await Order.findOne({
  //   customer: req.user.id,
  //   'items.product': product._id,
  //   status: 'delivered'
  // });

  const reviewData = {
    user: req.user.id,
    name: `${req.user.firstName} ${req.user.lastName}`,
    rating: Number(rating),
    comment,
    images: images || [],
    // isVerifiedPurchase: !!hasPurchased
  };

  await product.addReview(reviewData);

  // Add review to user's reviews
  await User.findByIdAndUpdate(req.user.id, {
    $push: { reviews: product.reviews[product.reviews.length - 1]._id }
  });

  res.status(201).json({
    success: true,
    message: 'Review added successfully'
  });
});

// @desc    Update product review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
const updateProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, images } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const review = product.reviews.id(req.params.reviewId);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  // Check if user owns this review
  if (review.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this review', 403));
  }

  // Update review
  review.rating = rating || review.rating;
  review.comment = comment || review.comment;
  review.images = images || review.images;

  // Recalculate product rating
  const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
  product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;
  product.numReviews = product.reviews.length;

  // Update rating distribution
  product.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  product.reviews.forEach(rev => {
    product.ratingDistribution[rev.rating]++;
  });

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Review updated successfully'
  });
});

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const review = product.reviews.id(req.params.reviewId);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  // Check if user owns this review
  if (review.user.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }

  // Remove review
  product.reviews.pull(req.params.reviewId);

  // Recalculate ratings
  if (product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;
    product.numReviews = product.reviews.length;

    // Update rating distribution
    product.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    product.reviews.forEach(rev => {
      product.ratingDistribution[rev.rating]++;
    });
  } else {
    product.rating = 0;
    product.numReviews = 0;
    product.ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  await product.save();

  // Remove review from user's reviews
  await User.findByIdAndUpdate(review.user, {
    $pull: { reviews: req.params.reviewId }
  });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private (Admin)
const updateProductStock = asyncHandler(async (req, res, next) => {
  const { quantity, operation = 'set' } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (operation === 'set') {
    product.stock = quantity;
  } else if (operation === 'add') {
    product.stock += quantity;
  } else if (operation === 'subtract') {
    product.stock = Math.max(0, product.stock - quantity);
  } else {
    return next(new ErrorResponse('Invalid operation. Use set, add, or subtract', 400));
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Stock updated successfully',
    stock: product.stock
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    featured: true,
    status: 'active',
    isPublished: true
  })
  .populate('category', 'name slug')
  .sort('-createdAt')
  .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

// @desc    Get trending products
// @route   GET /api/products/trending
// @access  Public
const getTrendingProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    trending: true,
    status: 'active',
    isPublished: true
  })
  .populate('category', 'name slug')
  .sort('-views -purchases')
  .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({
    newArrival: true,
    status: 'active',
    isPublished: true
  })
  .populate('category', 'name slug')
  .sort('-createdAt')
  .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  addProductReview,
  updateProductReview,
  deleteProductReview,
  updateProductStock,
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals
};