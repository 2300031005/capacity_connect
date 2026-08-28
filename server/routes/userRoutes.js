const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getTrainers,
  getTrainerById,
} = require('../controllers/userManagementController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Platform User Management (Admin only)
router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.patch('/users/:id/status', protect, authorize('admin'), toggleUserStatus);

// Platform Trainer Management (Admin only)
router.get('/trainers', protect, authorize('admin'), getTrainers);
router.get('/trainers/:id', protect, authorize('admin'), getTrainerById);

module.exports = router;
