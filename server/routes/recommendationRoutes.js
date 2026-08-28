const express = require('express');
const router = express.Router();
const {
  getCourseRecommendations,
  getSkillGuidance,
  getCourseRationale,
} = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Centralized AI Recommendations Hub (Phase 7.2 & 7.3)
router.get(
  '/recommendations',
  protect,
  authorize('trainee'),
  getCourseRecommendations
);

router.post(
  '/recommendations/refresh',
  protect,
  authorize('trainee'),
  getCourseRecommendations
);

// Contextual AI Actions (Phase 7.3)
router.get(
  '/skills/:skillName/guidance',
  protect,
  authorize('trainee'),
  getSkillGuidance
);

router.get(
  '/courses/:courseId/rationale',
  protect,
  authorize('trainee'),
  getCourseRationale
);

module.exports = router;
