const express = require('express');
const router = express.Router();
const {
  getCompetencies,
  getCompetencyById,
  createCompetency,
  updateCompetency,
  toggleCompetencyStatus,
  deleteCompetency,
} = require('../controllers/competencyController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getCompetencies);
router.get('/:id', optionalAuth, getCompetencyById);

// Admin-only competency management routes
router.post('/', protect, authorize('admin'), createCompetency);
router.put('/:id', protect, authorize('admin'), updateCompetency);
router.patch('/:id/status', protect, authorize('admin'), toggleCompetencyStatus);
router.delete('/:id', protect, authorize('admin'), deleteCompetency);

module.exports = router;
