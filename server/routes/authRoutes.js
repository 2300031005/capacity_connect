const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Authentication Routes
router.post('/register', register);
router.post('/login', login);

// Protected Current User Route
router.get('/me', protect, getMe);

module.exports = router;
