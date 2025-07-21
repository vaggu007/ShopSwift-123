const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for different types of uploads
const createStorage = (folder, allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `shopswift/${folder}`,
      allowed_formats: allowedFormats,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ],
      public_id: (req, file) => {
        const timestamp = Date.now();
        const originalName = file.originalname.split('.')[0];
        return `${originalName}_${timestamp}`;
      },
    },
  });
};

// Different storage configurations
const productImageStorage = createStorage('products');
const categoryImageStorage = createStorage('categories');
const userAvatarStorage = createStorage('users/avatars');

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Upload middleware configurations
const uploadProductImages = multer({
  storage: productImageStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 10, // Maximum 10 files
  },
  fileFilter: fileFilter,
});

const uploadCategoryImage = multer({
  storage: categoryImageStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    files: 1, // Single file
  },
  fileFilter: fileFilter,
});

const uploadUserAvatar = multer({
  storage: userAvatarStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024, // 2MB
    files: 1, // Single file
  },
  fileFilter: fileFilter,
});

// Utility functions
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error);
    throw error;
  }
};

const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting image info from Cloudinary:', error);
    throw error;
  }
};

// Transform image URL with specific transformations
const transformImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, transformations);
};

// Generate different sizes for responsive images
const generateResponsiveUrls = (publicId) => {
  return {
    thumbnail: transformImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    small: transformImageUrl(publicId, { width: 300, height: 300, crop: 'limit' }),
    medium: transformImageUrl(publicId, { width: 600, height: 600, crop: 'limit' }),
    large: transformImageUrl(publicId, { width: 1200, height: 1200, crop: 'limit' }),
    original: transformImageUrl(publicId, { quality: 'auto:best' }),
  };
};

module.exports = {
  cloudinary,
  uploadProductImages,
  uploadCategoryImage,
  uploadUserAvatar,
  deleteImage,
  deleteMultipleImages,
  getImageInfo,
  transformImageUrl,
  generateResponsiveUrls,
};