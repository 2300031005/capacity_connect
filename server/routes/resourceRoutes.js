const express = require('express');
const router = express.Router({ mergeParams: true });
const upload = require('../middleware/upload');
const {
  createResource,
  getResources,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect, optionalAuth, authorizeRoles } = require('../middleware/authMiddleware');

// Resource routes scoped by module or by resource ID
router.post(
  '/modules/:moduleId/resources',
  protect,
  authorizeRoles('trainer', 'admin'),
  upload.single('file'),
  createResource
);
router.get('/modules/:moduleId/resources', protect, getResources);
router.put('/resources/:id', protect, authorizeRoles('trainer', 'admin'), updateResource);
router.delete('/resources/:id', protect, authorizeRoles('trainer', 'admin'), deleteResource);

module.exports = router;
