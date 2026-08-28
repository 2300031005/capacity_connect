const express = require('express');
const router = express.Router();
const {
  getSkills,
  getSkillById,
  createSkill,
  updateSkill,
  toggleSkillStatus,
  deleteSkill,
} = require('../controllers/skillController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

// Public/authenticated skill listing
router.get('/', optionalAuth, getSkills);
router.get('/:id', optionalAuth, getSkillById);

// Admin-only skill management routes
router.post('/', protect, authorize('admin'), createSkill);
router.put('/:id', protect, authorize('admin'), updateSkill);
router.patch('/:id/status', protect, authorize('admin'), toggleSkillStatus);
router.delete('/:id', protect, authorize('admin'), deleteSkill);

module.exports = router;
