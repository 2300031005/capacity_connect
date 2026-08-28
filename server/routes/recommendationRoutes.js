const express = require('express');
const router = express.Router();
const {
  getCourseRecommendations,
  getSkillGuidance,
  getCourseRationale,
  getPersonalizedLearningPath,
  getCareerGoal,
  setCareerGoal,
  getCareerRoadmap,
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

// AI Career Goal & Learning Roadmap (Phase 7.4.1)
router.get(
  '/career-goal',
  protect,
  authorize('trainee'),
  getCareerGoal
);

router.post(
  '/career-goal',
  protect,
  authorize('trainee'),
  setCareerGoal
);

router.get(
  '/career-roadmap',
  protect,
  authorize('trainee'),
  getCareerRoadmap
);

router.post(
  '/career-roadmap/refresh',
  protect,
  authorize('trainee'),
  getCareerRoadmap
);

// Personalized AI Learning Path (Phase 7.4)
router.get(
  '/learning-path',
  protect,
  authorize('trainee'),
  getPersonalizedLearningPath
);

router.post(
  '/learning-path/refresh',
  protect,
  authorize('trainee'),
  getPersonalizedLearningPath
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
