const Category = require('../models/Category');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res, next) => {
  let query = Category.find();

  // Build filters
  const filters = {};

  // Status filter (always filter by active for public)
  if (req.user && req.user.role === 'admin') {
    if (req.query.status) filters.status = req.query.status;
  } else {
    filters.status = 'active';
    filters.isVisible = true;
  }

  // Parent filter
  if (req.query.parent) {
    filters.parent = req.query.parent === 'null' ? null : req.query.parent;
  }

  // Level filter
  if (req.query.level) {
    filters.level = parseInt(req.query.level);
  }

  // Featured filter
  if (req.query.featured === 'true') {
    filters.featured = true;
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
    query = query.sort('displayOrder name');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Category.countDocuments(filters);

  query = query.skip(startIndex).limit(limit);

  // Populate
  if (req.query.populate) {
    const populateFields = req.query.populate.split(',');
    populateFields.forEach(field => {
      if (field === 'parent') {
        query = query.populate('parent', 'name slug level');
      } else if (field === 'children') {
        query = query.populate('children', 'name slug level displayOrder');
      }
    });
  }

  // Execute query
  const categories = await query;

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
    count: categories.length,
    total,
    pagination,
    categories
  });
});

// @desc    Get category tree
// @route   GET /api/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res, next) => {
  const parentId = req.query.parent || null;
  const maxDepth = parseInt(req.query.maxDepth) || null;

  const tree = await Category.getCategoryTree(parentId);

  // Limit depth if specified
  const limitDepth = (categories, currentDepth = 0) => {
    if (maxDepth && currentDepth >= maxDepth) return [];
    
    return categories.map(category => ({
      ...category,
      children: limitDepth(category.children || [], currentDepth + 1)
    }));
  };

  const limitedTree = maxDepth ? limitDepth(tree) : tree;

  res.status(200).json({
    success: true,
    count: limitedTree.length,
    tree: limitedTree
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res, next) => {
  let category;

  // Check if the parameter is an ObjectId or a slug
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    category = await Category.findById(req.params.id);
  } else {
    category = await Category.findOne({ slug: req.params.id });
  }

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Check if user can view this category
  if (!req.user || req.user.role !== 'admin') {
    if (category.status !== 'active' || !category.isVisible) {
      return next(new ErrorResponse('Category not found', 404));
    }
  }

  // Populate related data
  await category.populate([
    { path: 'parent', select: 'name slug level' },
    { path: 'children', select: 'name slug level displayOrder productCount' }
  ]);

  // Get breadcrumb
  const breadcrumb = await Category.getBreadcrumb(category._id);

  // Increment views (don't wait for it)
  category.incrementViews().catch(err => console.error('Failed to increment views:', err));

  res.status(200).json({
    success: true,
    category: {
      ...category.toJSON(),
      breadcrumb
    }
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Validate parent category exists if specified
  if (req.body.parent) {
    const parentCategory = await Category.findById(req.body.parent);
    if (!parentCategory) {
      return next(new ErrorResponse('Parent category not found', 404));
    }
  }

  const category = await Category.create(req.body);

  // Populate parent
  if (category.parent) {
    await category.populate('parent', 'name slug level');
  }

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Validate parent category if being updated
  if (req.body.parent && req.body.parent !== category.parent?.toString()) {
    // Check if new parent exists
    const parentCategory = await Category.findById(req.body.parent);
    if (!parentCategory) {
      return next(new ErrorResponse('Parent category not found', 404));
    }

    // Prevent circular reference
    const descendants = await category.getDescendants();
    const descendantIds = descendants.map(desc => desc._id.toString());
    
    if (descendantIds.includes(req.body.parent)) {
      return next(new ErrorResponse('Cannot set a descendant as parent (circular reference)', 400));
    }
  }

  // Add updatedBy
  req.body.updatedBy = req.user.id;

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('parent', 'name slug level');

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  
  if (productCount > 0 && !req.query.force) {
    return next(new ErrorResponse(
      `Cannot delete category with ${productCount} products. Use ?force=true to move products to parent category or uncategorized.`, 
      400
    ));
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// @desc    Get category breadcrumb
// @route   GET /api/categories/:id/breadcrumb
// @access  Public
const getCategoryBreadcrumb = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const breadcrumb = await Category.getBreadcrumb(req.params.id);

  res.status(200).json({
    success: true,
    breadcrumb
  });
});

// @desc    Get category children
// @route   GET /api/categories/:id/children
// @access  Public
const getCategoryChildren = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const children = await Category.find({ 
    parent: req.params.id,
    status: 'active',
    isVisible: true
  }).sort('displayOrder name');

  res.status(200).json({
    success: true,
    count: children.length,
    children
  });
});

// @desc    Get category ancestors
// @route   GET /api/categories/:id/ancestors
// @access  Public
const getCategoryAncestors = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const ancestors = await category.getAncestors();

  res.status(200).json({
    success: true,
    count: ancestors.length,
    ancestors
  });
});

// @desc    Get category descendants
// @route   GET /api/categories/:id/descendants
// @access  Public
const getCategoryDescendants = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const descendants = await category.getDescendants();

  res.status(200).json({
    success: true,
    count: descendants.length,
    descendants
  });
});

// @desc    Update category product count
// @route   PUT /api/categories/:id/product-count
// @access  Private (Admin)
const updateCategoryProductCount = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  await category.updateProductCount();

  res.status(200).json({
    success: true,
    message: 'Product count updated successfully',
    productCount: category.productCount
  });
});

// @desc    Update all categories product count
// @route   PUT /api/categories/update-all-product-counts
// @access  Private (Admin)
const updateAllCategoryProductCounts = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({});

  const updatePromises = categories.map(category => category.updateProductCount());
  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: 'All category product counts updated successfully',
    updatedCount: categories.length
  });
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
const getFeaturedCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;

  const categories = await Category.find({
    featured: true,
    status: 'active',
    isVisible: true
  })
  .sort('displayOrder name')
  .limit(limit);

  res.status(200).json({
    success: true,
    count: categories.length,
    categories
  });
});

// @desc    Reorder categories
// @route   PUT /api/categories/reorder
// @access  Private (Admin)
const reorderCategories = asyncHandler(async (req, res, next) => {
  const { categoryOrders } = req.body;

  if (!Array.isArray(categoryOrders)) {
    return next(new ErrorResponse('categoryOrders must be an array', 400));
  }

  // Update display order for each category
  const updatePromises = categoryOrders.map(({ id, displayOrder }) => 
    Category.findByIdAndUpdate(id, { displayOrder }, { runValidators: true })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: 'Categories reordered successfully'
  });
});

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Private (Admin)
const getCategoryStats = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Get product count
  const productCount = await Product.countDocuments({ 
    category: req.params.id,
    status: 'active',
    isPublished: true
  });

  // Get total value of products in this category
  const productValues = await Product.aggregate([
    { 
      $match: { 
        category: category._id,
        status: 'active',
        isPublished: true
      }
    },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        averagePrice: { $avg: '$price' },
        totalStock: { $sum: '$stock' }
      }
    }
  ]);

  const stats = {
    productCount,
    totalValue: productValues[0]?.totalValue || 0,
    averagePrice: productValues[0]?.averagePrice || 0,
    totalStock: productValues[0]?.totalStock || 0,
    views: category.views
  };

  res.status(200).json({
    success: true,
    stats
  });
});

module.exports = {
  getCategories,
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryBreadcrumb,
  getCategoryChildren,
  getCategoryAncestors,
  getCategoryDescendants,
  updateCategoryProductCount,
  updateAllCategoryProductCounts,
  getFeaturedCategories,
  reorderCategories,
  getCategoryStats
};