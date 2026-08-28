const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage for learning resources
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique timestamp-based filename preserving original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    const basename = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  },
});

// File filter for allowed learning resource types: PDF, PPT/PPTX, DOC/DOCX, Images
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|txt|csv|xlsx|xls/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  }
  
  cb(new Error(`Unsupported file type: ${path.extname(file.originalname)}. Allowed types: PDF, PPT, DOC, DOCX, Images, etc.`));
};

// Multer upload middleware instance (25MB limit per file)
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
