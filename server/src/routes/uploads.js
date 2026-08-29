// ============================================
// Routes: Upload d'images
// ============================================

const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

/**
 * GET /api/uploads/status
 * Le formulaire sait s'il peut proposer l'envoi de fichiers
 */
router.get('/status', uploadController.getUploadStatus);

/**
 * GET /api/uploads/signature
 * Signature à usage unique pour un envoi direct vers Cloudinary
 */
router.get('/signature', protect, uploadController.getUploadSignature);

module.exports = router;
