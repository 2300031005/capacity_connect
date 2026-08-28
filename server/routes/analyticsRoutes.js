const express = require('express');
const router = express.Router();
const {
  getTraineeAnalytics,
  getTrainerAnalytics,
  getAdminAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Trainee Analytics (Trainee only)
router.get('/trainee', protect, authorize('trainee'), getTraineeAnalytics);

// Trainer Analytics (Trainer only)
router.get('/trainer', protect, authorize('trainer'), getTrainerAnalytics);

// Admin Analytics (Admin only)
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
