const cloudinary = require('cloudinary').v2;

// Configure Cloudinary only if variables are defined in .env
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else {
  console.warn('Warning: Cloudinary credentials missing in environment. File uploads will fail.');
}

module.exports = cloudinary;
