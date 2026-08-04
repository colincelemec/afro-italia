// ============================================
// Routes: Admin
// ============================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Toutes les routes admin nécessitent d'être ADMIN
router.use(protect);
router.use(restrictTo('ADMIN'));

/**
 * GET /api/admin/stats
 * Statistiques globales de la plateforme
 */
router.get('/stats', adminController.getStats);

/**
 * GET /api/admin/businesses
 * Liste de toutes les entreprises (avec filtres)
 */
router.get('/businesses', adminController.getAllBusinesses);

/**
 * GET /api/admin/businesses/pending
 * Entreprises en attente de vérification
 */
router.get('/businesses/pending', adminController.getPendingBusinesses);

/**
 * GET /api/admin/users
 * Liste de tous les utilisateurs
 */
router.get('/users', adminController.getAllUsers);

/**
 * PATCH /api/admin/users/:id/role
 * Changer le rôle d'un utilisateur
 */
router.patch('/users/:id/role', adminController.updateUserRole);

/**
 * GET /api/admin/reviews/reported
 * Avis signalés
 */
router.get('/reviews/reported', adminController.getReportedReviews);

/**
 * DELETE /api/admin/reviews/:id
 * Supprimer un avis (modération)
 */
router.delete('/reviews/:id', adminController.deleteReview);

/**
 * DELETE /api/admin/users/:id
 * Supprimer un utilisateur
 */
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
