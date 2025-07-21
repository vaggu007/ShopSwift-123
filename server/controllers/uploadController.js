const { 
  deleteImage, 
  deleteMultipleImages, 
  generateResponsiveUrls 
} = require('../config/cloudinary');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Upload product images
// @route   POST /api/upload/products/:id/images
// @access  Private/Admin
exports.uploadProductImages = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one image', 400));
  }

  // Process uploaded files
  const uploadedImages = req.files.map(file => ({
    url: file.path,
    publicId: file.filename,
    alt: req.body.alt || product.name,
    isPrimary: false,
    responsiveUrls: generateResponsiveUrls(file.filename)
  }));

  // If this is the first image, make it primary
  if (product.images.length === 0 && uploadedImages.length > 0) {
    uploadedImages[0].isPrimary = true;
  }

  // Add images to product
  product.images.push(...uploadedImages);
  
  // Update product updatedAt and updatedBy
  product.updatedBy = req.user.id;
  
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: {
      productId: product._id,
      images: uploadedImages,
      totalImages: product.images.length
    }
  });
});

// @desc    Delete product image
// @route   DELETE /api/upload/products/:id/images/:imageId
// @access  Private/Admin
exports.deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const imageIndex = product.images.findIndex(
    img => img._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) {
    return next(new ErrorResponse('Image not found', 404));
  }

  const imageToDelete = product.images[imageIndex];

  try {
    // Delete from Cloudinary
    await deleteImage(imageToDelete.publicId);
    
    // Remove from product
    product.images.splice(imageIndex, 1);
    
    // If deleted image was primary, make first remaining image primary
    if (imageToDelete.isPrimary && product.images.length > 0) {
      product.images[0].isPrimary = true;
    }
    
    // Update product
    product.updatedBy = req.user.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        productId: product._id,
        deletedImageId: req.params.imageId,
        remainingImages: product.images.length
      }
    });
  } catch (error) {
    return next(new ErrorResponse('Error deleting image from cloud storage', 500));
  }
});

// @desc    Set primary product image
// @route   PUT /api/upload/products/:id/images/:imageId/primary
// @access  Private/Admin
exports.setPrimaryProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const imageIndex = product.images.findIndex(
    img => img._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) {
    return next(new ErrorResponse('Image not found', 404));
  }

  // Reset all images to not primary
  product.images.forEach(img => {
    img.isPrimary = false;
  });

  // Set selected image as primary
  product.images[imageIndex].isPrimary = true;
  
  // Update product
  product.updatedBy = req.user.id;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Primary image updated successfully',
    data: {
      productId: product._id,
      primaryImageId: req.params.imageId
    }
  });
});

// @desc    Upload category image
// @route   POST /api/upload/categories/:id/image
// @access  Private/Admin
exports.uploadCategoryImage = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload an image', 400));
  }

  // Delete old image if exists
  if (category.image && category.image.publicId) {
    try {
      await deleteImage(category.image.publicId);
    } catch (error) {
      console.error('Error deleting old category image:', error);
    }
  }

  // Update category with new image
  category.image = {
    url: req.file.path,
    publicId: req.file.filename,
    alt: req.body.alt || category.name,
    responsiveUrls: generateResponsiveUrls(req.file.filename)
  };
  
  category.updatedBy = req.user.id;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category image uploaded successfully',
    data: {
      categoryId: category._id,
      image: category.image
    }
  });
});

// @desc    Delete category image
// @route   DELETE /api/upload/categories/:id/image
// @access  Private/Admin
exports.deleteCategoryImage = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  if (!category.image || !category.image.publicId) {
    return next(new ErrorResponse('Category has no image to delete', 400));
  }

  try {
    // Delete from Cloudinary
    await deleteImage(category.image.publicId);
    
    // Remove from category
    category.image = undefined;
    category.updatedBy = req.user.id;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category image deleted successfully',
      data: {
        categoryId: category._id
      }
    });
  } catch (error) {
    return next(new ErrorResponse('Error deleting image from cloud storage', 500));
  }
});

// @desc    Upload user avatar
// @route   POST /api/upload/avatar
// @access  Private
exports.uploadUserAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload an image', 400));
  }

  const user = await User.findById(req.user.id);

  // Delete old avatar if exists
  if (user.avatar && user.avatar.publicId) {
    try {
      await deleteImage(user.avatar.publicId);
    } catch (error) {
      console.error('Error deleting old avatar:', error);
    }
  }

  // Update user with new avatar
  user.avatar = {
    url: req.file.path,
    publicId: req.file.filename,
    alt: `${user.firstName} ${user.lastName} avatar`,
    responsiveUrls: generateResponsiveUrls(req.file.filename)
  };
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      userId: user._id,
      avatar: user.avatar
    }
  });
});

// @desc    Delete user avatar
// @route   DELETE /api/upload/avatar
// @access  Private
exports.deleteUserAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user.avatar || !user.avatar.publicId) {
    return next(new ErrorResponse('User has no avatar to delete', 400));
  }

  try {
    // Delete from Cloudinary
    await deleteImage(user.avatar.publicId);
    
    // Remove from user
    user.avatar = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      data: {
        userId: user._id
      }
    });
  } catch (error) {
    return next(new ErrorResponse('Error deleting avatar from cloud storage', 500));
  }
});

// @desc    Get upload statistics (Admin only)
// @route   GET /api/upload/stats
// @access  Private/Admin
exports.getUploadStats = asyncHandler(async (req, res, next) => {
  // Count images across all products
  const productImageStats = await Product.aggregate([
    {
      $project: {
        imageCount: { $size: '$images' }
      }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalImages: { $sum: '$imageCount' },
        avgImagesPerProduct: { $avg: '$imageCount' }
      }
    }
  ]);

  // Count categories with images
  const categoryImageStats = await Category.aggregate([
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        categoriesWithImages: {
          $sum: {
            $cond: [{ $ne: ['$image', null] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Count users with avatars
  const userAvatarStats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        usersWithAvatars: {
          $sum: {
            $cond: [{ $ne: ['$avatar', null] }, 1, 0]
          }
        }
      }
    }
  ]);

  const stats = {
    products: productImageStats[0] || { totalProducts: 0, totalImages: 0, avgImagesPerProduct: 0 },
    categories: categoryImageStats[0] || { totalCategories: 0, categoriesWithImages: 0 },
    users: userAvatarStats[0] || { totalUsers: 0, usersWithAvatars: 0 }
  };

  res.status(200).json({
    success: true,
    message: 'Upload statistics retrieved successfully',
    data: stats
  });
});