// ============================================
// Routes: Users
// ============================================

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

/**
 * GET /api/users/profile
 * Récupérer mon profil
 */
router.get('/profile', protect, userController.getProfile);

/**
 * PUT /api/users/profile
 * Mettre à jour mon profil
 */
router.put('/profile', protect, userController.updateProfile);

/**
 * GET /api/users/favorites
 * Récupérer mes entreprises favorites
 */
router.get('/favorites', protect, userController.getFavorites);

/**
 * GET /api/users/my-reviews
 * Récupérer mes avis
 */
router.get('/my-reviews', protect, userController.getMyReviews);

/**
 * DELETE /api/users/account
 * Supprimer mon compte
 */
router.delete('/account', protect, userController.deleteAccount);

module.exports = router;
