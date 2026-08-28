const express = require('express');
const router = express.Router();
const {
  getMyCertificates,
  getCertificateById,
  downloadCertificate,
} = require('../controllers/certificateController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/certificates/my', protect, authorizeRoles('trainee'), getMyCertificates);
router.get('/certificates/:certificateId', protect, getCertificateById);
router.get('/certificates/:certificateId/download', protect, downloadCertificate);

module.exports = router;
