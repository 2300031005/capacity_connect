const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrolledCourses,
  getCourseEnrollment,
  getCourseLearners,
  toggleModuleCompletion,
} = require('../controllers/enrollmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Trainee Course Enrollment Routes
router.post('/courses/:courseId/enroll', protect, authorizeRoles('trainee'), enrollInCourse);
router.get('/enrollments/my-courses', protect, authorizeRoles('trainee'), getMyEnrolledCourses);
router.get('/courses/:courseId/enrollment', protect, authorizeRoles('trainee'), getCourseEnrollment);
router.put(
  '/courses/:courseId/modules/:moduleId/toggle-complete',
  protect,
  authorizeRoles('trainee'),
  toggleModuleCompletion
);

// Trainer & Admin Enrolled Learners Inspection Route
router.get('/courses/:courseId/learners', protect, authorizeRoles('trainer', 'admin'), getCourseLearners);

module.exports = router;


