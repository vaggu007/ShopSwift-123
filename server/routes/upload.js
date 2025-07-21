const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const {
  uploadProductImages,
  uploadCategoryImage,
  uploadUserAvatar
} = require('../config/cloudinary');
const {
  uploadProductImages: uploadProductImagesController,
  deleteProductImage,
  setPrimaryProductImage,
  uploadCategoryImage: uploadCategoryImageController,
  deleteCategoryImage,
  uploadUserAvatar: uploadUserAvatarController,
  deleteUserAvatar,
  getUploadStats
} = require('../controllers/uploadController');

const router = express.Router();

// Product image routes
router.post(
  '/products/:id/images',
  protect,
  authorize('admin'),
  uploadProductImages.array('images', 10), // Max 10 images
  [
    body('alt').optional().trim().isLength({ max: 255 }).withMessage('Alt text must be less than 255 characters'),
  ],
  handleValidationErrors,
  uploadProductImagesController
);

router.delete(
  '/products/:id/images/:imageId',
  protect,
  authorize('admin'),
  deleteProductImage
);

router.put(
  '/products/:id/images/:imageId/primary',
  protect,
  authorize('admin'),
  setPrimaryProductImage
);

// Category image routes
router.post(
  '/categories/:id/image',
  protect,
  authorize('admin'),
  uploadCategoryImage.single('image'),
  [
    body('alt').optional().trim().isLength({ max: 255 }).withMessage('Alt text must be less than 255 characters'),
  ],
  handleValidationErrors,
  uploadCategoryImageController
);

router.delete(
  '/categories/:id/image',
  protect,
  authorize('admin'),
  deleteCategoryImage
);

// User avatar routes
router.post(
  '/avatar',
  protect,
  uploadUserAvatar.single('avatar'),
  uploadUserAvatarController
);

router.delete(
  '/avatar',
  protect,
  deleteUserAvatar
);

// Admin statistics
router.get(
  '/stats',
  protect,
  authorize('admin'),
  getUploadStats
);

module.exports = router;