// ============================================
// Middleware: Validation
// ============================================

const { body, validationResult } = require('express-validator');

/**
 * Middleware pour vérifier les erreurs de validation
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreurs de validation',
      errors: errors.array()
    });
  }

  next();
};

/**
 * Validation pour la création/modification d'une entreprise
 */
const validateBusiness = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 255 }).withMessage('Le nom doit contenir entre 2 et 255 caractères'),

  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 20 }).withMessage('La description doit contenir au moins 20 caractères'),

  // Les IDs sont des cuid (et non des UUID) → on valide juste qu'ils sont présents
  body('cityId')
    .notEmpty().withMessage('La ville est requise')
    .isString().withMessage('ID de ville invalide'),

  body('categoryId')
    .notEmpty().withMessage('La catégorie est requise')
    .isString().withMessage('ID de catégorie invalide'),

  body('address')
    .trim()
    .notEmpty().withMessage('L\'adresse est requise'),

  // Coordonnées facultatives : à défaut, on utilise le centre de la ville côté contrôleur
  body('latitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),

  body('longitude')
    .optional({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide'),

  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('any').withMessage('Numéro de téléphone invalide'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Email invalide'),

  body('website')
    .optional({ checkFalsy: true })
    .isURL().withMessage('URL du site web invalide'),

  validate
];

/**
 * Validation pour l'inscription
 */
const validateRegister = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre')
    .matches(/[a-zA-Z]/).withMessage('Le mot de passe doit contenir au moins une lettre'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Le prénom doit contenir entre 2 et 100 caractères'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit contenir entre 2 et 100 caractères'),

  validate
];

/**
 * Validation pour la connexion
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide'),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis'),

  validate
];

/**
 * Validation pour un review
 */
const validateReview = [
  body('businessId')
    .notEmpty().withMessage('L\'ID de l\'entreprise est requis')
    .isUUID().withMessage('ID d\'entreprise invalide'),

  body('rating')
    .notEmpty().withMessage('La note est requise')
    .isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Le commentaire ne peut pas dépasser 1000 caractères'),

  validate
];

module.exports = {
  validate,
  validateBusiness,
  validateRegister,
  validateLogin,
  validateReview
};
