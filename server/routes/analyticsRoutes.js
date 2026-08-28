const express = require('express');
const router = express.Router();
const {
  getTraineeAnalytics,
  getTrainerAnalytics,
  getAdminAnalytics,
} = require('../controllers/analyticsController');
const {
  getTrainerAiTeachingInsights,
  getCourseAiTeachingInsights,
} = require('../controllers/trainerAiController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Trainee Analytics (Trainee only)
router.get('/trainee', protect, authorize('trainee'), getTraineeAnalytics);

// Trainer Analytics (Trainer only)
router.get('/trainer', protect, authorize('trainer'), getTrainerAnalytics);

// Trainer AI Teaching Assistant (Phase 7.6)
router.get(
  '/trainer/ai-teaching-insights',
  protect,
  authorize('trainer'),
  getTrainerAiTeachingInsights
);

router.post(
  '/trainer/ai-teaching-insights/refresh',
  protect,
  authorize('trainer'),
  getTrainerAiTeachingInsights
);

router.get(
  '/trainer/courses/:courseId/ai-insights',
  protect,
  authorize('trainer'),
  getCourseAiTeachingInsights
);

router.post(
  '/trainer/courses/:courseId/ai-insights/refresh',
  protect,
  authorize('trainer'),
  getCourseAiTeachingInsights
);

// Admin Analytics (Admin only)
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
