const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');

/**
 * @desc    Get all certificates earned by the authenticated trainee
 * @route   GET /api/certificates/my
 * @access  Private (Trainee only)
 */
const getMyCertificates = async (req, res, next) => {
  try {
    const traineeId = req.user._id;

    const certificates = await Certificate.find({ trainee: traineeId })
      .populate('course', 'title category level')
      .populate('trainer', 'name email department')
      .sort({ issuedAt: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single certificate by certificate ID
 * @route   GET /api/certificates/:certificateId
 * @access  Private (Certificate Owner, Course Trainer, Admin)
 */
const getCertificateById = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('course', 'title category level description')
      .populate('trainer', 'name email department')
      .populate('trainee', 'name email department');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // RBAC: Trainee owner, Trainer of course, or Admin
    const isTraineeOwner = req.user.role === 'trainee' && certificate.trainee._id.toString() === req.user._id.toString();
    const isTrainerOwner = req.user.role === 'trainer' && certificate.trainer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTraineeOwner && !isTrainerOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied to this certificate' });
    }

    return res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download certificate PDF
 * @route   GET /api/certificates/:certificateId/download
 * @access  Private (Certificate Owner, Course Trainer, Admin)
 */
const downloadCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // RBAC
    const isTraineeOwner = req.user.role === 'trainee' && certificate.trainee.toString() === req.user._id.toString();
    const isTrainerOwner = req.user.role === 'trainer' && certificate.trainer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTraineeOwner && !isTrainerOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const fullPath = path.join(__dirname, '..', certificate.filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate PDF file not found on disk.',
      });
    }

    return res.download(fullPath, `${certificate.certificateId}.pdf`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCertificates,
  getCertificateById,
  downloadCertificate,
};
