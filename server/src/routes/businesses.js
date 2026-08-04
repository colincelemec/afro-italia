// ============================================
// Routes: Businesses (Entreprises)
// ============================================

const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateBusiness } = require('../middleware/validation');

// ============================================
// ROUTES PUBLIQUES
// ============================================

/**
 * GET /api/businesses
 * Récupérer toutes les entreprises (avec pagination et filtres)
 * Query params: page, limit, city, category, search
 */
router.get('/', businessController.getAllBusinesses);

/**
 * GET /api/businesses/search
 * Recherche avancée d'entreprises
 * Query params: q, city, category, lat, lng, radius
 */
router.get('/search', businessController.searchBusinesses);

/**
 * GET /api/businesses/:slug
 * Récupérer une entreprise par son slug
 */
router.get('/:slug', businessController.getBusinessBySlug);

/**
 * GET /api/businesses/:id/reviews
 * Récupérer les avis d'une entreprise
 */
router.get('/:id/reviews', businessController.getBusinessReviews);

// ============================================
// ROUTES PROTÉGÉES (Authentification requise)
// ============================================

/**
 * POST /api/businesses
 * Créer une nouvelle entreprise (USER ou BUSINESS)
 */
router.post('/',
  protect,
  validateBusiness,
  businessController.createBusiness
);

/**
 * PUT /api/businesses/:id
 * Mettre à jour une entreprise (propriétaire uniquement)
 */
router.put('/:id',
  protect,
  validateBusiness,
  businessController.updateBusiness
);

/**
 * DELETE /api/businesses/:id
 * Supprimer une entreprise (propriétaire ou admin)
 */
router.delete('/:id',
  protect,
  businessController.deleteBusiness
);

/**
 * POST /api/businesses/:id/favorite
 * Ajouter aux favoris
 */
router.post('/:id/favorite',
  protect,
  businessController.toggleFavorite
);

/**
 * GET /api/businesses/my/list
 * Récupérer mes entreprises (propriétaire)
 */
router.get('/my/list',
  protect,
  businessController.getMyBusinesses
);

// ============================================
// ROUTES ADMIN
// ============================================

/**
 * PATCH /api/businesses/:id/verify
 * Vérifier une entreprise (ADMIN uniquement)
 */
router.patch('/:id/verify',
  protect,
  restrictTo('ADMIN'),
  businessController.verifyBusiness
);

/**
 * PATCH /api/businesses/:id/status
 * Changer le statut d'une entreprise (ADMIN uniquement)
 */
router.patch('/:id/status',
  protect,
  restrictTo('ADMIN'),
  businessController.updateBusinessStatus
);

module.exports = router;
