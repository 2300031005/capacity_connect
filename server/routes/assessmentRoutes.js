const express = require('express');
const router = express.Router();
const {
  getModuleQuiz,
  saveModuleQuiz,
  getFinalAssessment,
  saveFinalAssessment,
  deleteAssessment,
  toggleAssessmentStatus,
  submitAssessmentAttempt,
  getMyAssessmentAttempts,
  getCourseAssessmentResults,
} = require('../controllers/assessmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Module Quiz Routes
router.get('/modules/:moduleId/quiz', protect, getModuleQuiz);
router.post('/modules/:moduleId/quiz', protect, authorizeRoles('trainer', 'admin'), saveModuleQuiz);

// Final Course Assessment Routes
router.get('/courses/:courseId/final-assessment', protect, getFinalAssessment);
router.post(
  '/courses/:courseId/final-assessment',
  protect,
  authorizeRoles('trainer', 'admin'),
  saveFinalAssessment
);

// Assessment Management Routes
router.delete('/assessments/:id', protect, authorizeRoles('trainer', 'admin'), deleteAssessment);
router.put(
  '/assessments/:id/status',
  protect,
  authorizeRoles('trainer', 'admin'),
  toggleAssessmentStatus
);

// Trainee Attempt & Results Routes
router.post('/assessments/:id/attempt', protect, authorizeRoles('trainee'), submitAssessmentAttempt);
router.get(
  '/assessments/:id/my-attempts',
  protect,
  authorizeRoles('trainee'),
  getMyAssessmentAttempts
);

// Trainer & Admin Enrolled Assessment Results Roster Route
router.get(
  '/courses/:courseId/trainer-results',
  protect,
  authorizeRoles('trainer', 'admin'),
  getCourseAssessmentResults
);

module.exports = router;
