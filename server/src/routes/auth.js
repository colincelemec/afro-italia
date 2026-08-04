// ============================================
// Routes: Authentication
// ============================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', authLimiter, validateLogin, authController.login);

/**
 * POST /api/auth/logout
 * Déconnexion (optionnel - côté client surtout)
 */
router.post('/logout', protect, authController.logout);

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', protect, authController.getMe);

/**
 * PUT /api/auth/update-password
 * Changer le mot de passe
 */
router.put('/update-password', protect, authController.updatePassword);

/**
 * POST /api/auth/forgot-password
 * Demander un reset de mot de passe
 */
router.post('/forgot-password', authLimiter, authController.forgotPassword);

/**
 * POST /api/auth/reset-password/:token
 * Réinitialiser le mot de passe avec le token
 */
router.post('/reset-password/:token', authController.resetPassword);

/**
 * POST /api/auth/google
 * Accesso con Google OAuth (verifica idToken lato client)
 */
router.post('/google', authLimiter, authController.googleAuth);

module.exports = router;
