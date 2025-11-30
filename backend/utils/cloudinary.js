// Cloudinary configuration and utility functions
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jaipur-gadgets/products', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto',
      },
    ],
  },
});

// Multer configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Utility function to delete image from Cloudinary
export const deleteImage = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return;

    // Get the path after 'upload'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Utility function to upload image directly (if needed)
export const uploadImage = async (filePath, folder = 'jaipur-gadgets/products') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      transformation: [
        {
          width: 800,
          height: 800,
          crop: 'limit',
          quality: 'auto',
        },
      ],
    });
    return result.secure_url; // Return the Cloudinary URL
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;

