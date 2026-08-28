const express = require('express');
const router = express.Router();
const {
  getTrainerLearners,
  getTrainerLearnerDetails,
} = require('../controllers/trainerLearnerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Trainer Consolidated Learner Roster & Details (Trainer only)
router.get('/trainer/learners', protect, authorize('trainer'), getTrainerLearners);
router.get('/trainer/learners/:id', protect, authorize('trainer'), getTrainerLearnerDetails);

module.exports = router;
