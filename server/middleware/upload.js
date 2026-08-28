const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Root uploads directory & resources subdirectory
const uploadBaseDir = path.join(__dirname, '../uploads');
const resourcesDir = path.join(uploadBaseDir, 'resources');

if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Configure disk storage for learning resources
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(resourcesDir)) {
      fs.mkdirSync(resourcesDir, { recursive: true });
    }
    cb(null, resourcesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique timestamp-based filename preserving sanitized original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  },
});

// File filter for allowed learning resource types: PDF, PPT/PPTX, DOC/DOCX, TXT, Images, Videos
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|ppt|pptx|txt|csv|xlsx|xls|mp4|webm|mov|mkv|avi/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  }
  
  cb(new Error(`Unsupported file type: ${path.extname(file.originalname)}. Allowed types: PDF, PPT, DOC, TXT, Images (PNG, JPG, WEBP), Videos (MP4, WEBM, MOV).`));
};

// Multer upload middleware instance (100MB limit for local multimedia resources)
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
