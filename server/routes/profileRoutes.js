const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const profileUpload = require('../middleware/profileUpload');

// User Profile Hub APIs (Identity strictly derived from JWT session)
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/photo', protect, profileUpload.single('photo'), uploadProfilePhoto);
router.delete('/photo', protect, removeProfilePhoto);

module.exports = router;
