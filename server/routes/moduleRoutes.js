const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createModule,
  getModules,
  updateModule,
  deleteModule,
  updateModuleOrder,
} = require('../controllers/moduleController');
const { protect, optionalAuth, authorizeRoles } = require('../middleware/authMiddleware');

// Module routes scoped by course or by module ID
router.post('/courses/:courseId/modules', protect, authorizeRoles('trainer', 'admin'), createModule);
router.get('/courses/:courseId/modules', optionalAuth, getModules);
router.put('/modules/:id', protect, authorizeRoles('trainer', 'admin'), updateModule);
router.delete('/modules/:id', protect, authorizeRoles('trainer', 'admin'), deleteModule);
router.patch('/modules/:id/order', protect, authorizeRoles('trainer', 'admin'), updateModuleOrder);

module.exports = router;
