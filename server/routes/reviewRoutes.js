const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getCourseReviews,
  createCourseReview,
  updateCourseReview,
  deleteCourseReview,
} = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Publicly read reviews for a course (or include user's review if logged in)
router.get('/courses/:courseId/reviews', optionalAuth, getCourseReviews);

// Trainees submit review for a course
router.post('/courses/:courseId/reviews', protect, createCourseReview);

// Edit/Delete review by review ID
router.put('/reviews/:id', protect, updateCourseReview);
router.delete('/reviews/:id', protect, deleteCourseReview);

module.exports = router;
