const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  publishCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect, optionalAuth, authorizeRoles } = require('../middleware/authMiddleware');

// Public / Catalog Routes
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourseById);

// Protected Course Management Routes (Trainer & Admin only)
router.post('/', protect, authorizeRoles('trainer', 'admin'), createCourse);
router.put('/:id', protect, authorizeRoles('trainer', 'admin'), updateCourse);
router.patch('/:id/publish', protect, authorizeRoles('trainer', 'admin'), publishCourse);
router.delete('/:id', protect, authorizeRoles('trainer', 'admin'), deleteCourse);

module.exports = router;
