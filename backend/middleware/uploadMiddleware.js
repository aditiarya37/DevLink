const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinaryConfig');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'devlink_posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    public_id: (req, file) => {
      const originalName = file.originalname.split('.')[0];
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${originalName}-${uniqueSuffix}`;
    },
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image file.'), false);
    }
  }
});

const uploadPostImage = upload.single('postImage');

module.exports = { uploadPostImage };