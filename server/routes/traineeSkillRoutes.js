const express = require('express');
const router = express.Router();
const { getMySkills, getMyCompetencies } = require('../controllers/traineeSkillController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Trainee-only skill profile and competency routes
router.get('/trainees/me/skills', protect, authorize('trainee'), getMySkills);
router.get('/trainees/me/competencies', protect, authorize('trainee'), getMyCompetencies);

module.exports = router;
