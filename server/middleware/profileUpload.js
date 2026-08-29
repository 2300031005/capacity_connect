const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Root uploads directory & profiles subdirectory
const uploadBaseDir = path.join(__dirname, '../uploads');
const profilesDir = path.join(uploadBaseDir, 'profiles');

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Disk storage configuration for user profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(profilesDir)) {
      fs.mkdirSync(profilesDir, { recursive: true });
    }
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user._id.toString() : 'guest';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${userId}-${uniqueSuffix}${extension}`);
  },
});

// File filter: only allow image formats (jpeg, jpg, png, webp, gif)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();

  const isExtValid = allowedExtensions.test(ext);
  const isMimeValid = mime.startsWith('image/');

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  }

  return cb(
    new Error(
      `Unsupported file format: ${file.originalname}. Please upload an image file (JPG, JPEG, PNG, WEBP, or GIF).`
    )
  );
};

// 5MB max file size for avatar pictures
const profileUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = profileUpload;
