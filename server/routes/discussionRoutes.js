const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getCourseDiscussions,
  createCourseDiscussionMessage,
} = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

// Get course discussion messages (Enrolled Trainees, Owner Trainer, Admin)
router.get('/courses/:courseId/discussions', protect, getCourseDiscussions);

// Post a message in course discussion (Enrolled Trainees, Owner Trainer, Admin)
router.post('/courses/:courseId/discussions', protect, createCourseDiscussionMessage);

module.exports = router;
