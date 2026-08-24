// ============================================
// Middleware: Validation
// ============================================

const { body, validationResult } = require('express-validator');

// ── Numéros de téléphone professionnels ──
// Accepte : "+39 02 1234567", "02 1234567", "333 123 4567", "02-1234567",
// "(02) 1234567", "+39.06.12345678". Exige 6 à 15 chiffres au total.
const PHONE_REGEX = /^\+?[\d\s().-]{6,25}$/;
const PHONE_MIN_DIGITS = 6;
const PHONE_MAX_DIGITS = 15;

/** Vérifie le format ET le nombre de chiffres réels */
const isValidPhone = (value) => {
  if (!PHONE_REGEX.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= PHONE_MIN_DIGITS && digits.length <= PHONE_MAX_DIGITS;
};

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

  // Téléphone : on accepte les numéros professionnels tels qu'ils s'écrivent
  // en Italie — fixes ET mobiles, avec espaces, points, tirets, parenthèses
  // et indicatif international. (isMobilePhone refusait les fixes, ex. 02 1234567.)
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .custom(isValidPhone).withMessage('Numéro de téléphone invalide'),

  body('whatsapp')
    .optional({ checkFalsy: true })
    .trim()
    .custom(isValidPhone).withMessage('Numéro WhatsApp invalide'),

  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Email invalide'),

  // require_tld: un domaine complet est exigé (https://exemple → invalide)
  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({ require_protocol: false, require_tld: true })
    .withMessage('URL du site web invalide'),

  validate
];

/**
 * Validation d'une revendication de fiche (« C'est mon activité »)
 */
const validateClaim = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Le nom complet est requis')
    .isLength({ min: 2, max: 120 }).withMessage('Nom complet invalide'),

  body('role')
    .trim()
    .notEmpty().withMessage('Votre rôle dans l\'entreprise est requis')
    .isLength({ max: 80 }).withMessage('Rôle trop long'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Le téléphone est requis')
    .custom(isValidPhone).withMessage('Numéro de téléphone invalide'),

  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide'),

  body('message')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Message trop long (1000 caractères max)'),

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
  // Les IDs sont des cuid (ex. « cmf3x8k2p0000qw3h5n8t2y1a »), pas des UUID :
  // isUUID() rejetait donc toutes les publications d'avis.
  body('businessId')
    .notEmpty().withMessage('L\'ID de l\'entreprise est requis')
    .isString().withMessage('ID d\'entreprise invalide'),

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
  validateClaim,
  validateRegister,
  validateLogin,
  validateReview
};
