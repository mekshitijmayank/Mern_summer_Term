const multer = require('multer');
const path = require('path');
const fs = require('fs');

let storage;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('../config/cloudinary');
  
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      if (file.fieldname === 'brochure') {
        return {
          folder: 'estate-platform',
          resource_type: 'raw',
          format: 'pdf'
        };
      }
      return {
        folder: 'estate-platform',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }]
      };
    }
  });
  console.log('Multer configured with Cloudinary storage.');
} else {
  // Local fallback storage in server workspace
  const uploadDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const prefix = file.fieldname === 'brochure' ? 'brochure' : 'property';
      cb(null, `${prefix}-${Date.now()}${path.extname(file.originalname)}`);
    }
  });
  console.log('Multer configured with local file fallback storage.');
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'brochure') {
      const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
      if (isPdf) {
        return cb(null, true);
      }
      return cb(new Error('Only PDF files are accepted for the brochure'));
    }

    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp, gif) are allowed'));
  }
});

module.exports = upload;
