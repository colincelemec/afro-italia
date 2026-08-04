// ============================================
// Middleware: Rate Limiter
// ============================================

const rateLimit = require('express-rate-limit');

// In sviluppo i limiti vengono disattivati: il dev mode di React
// (StrictMode raddoppia le richieste) e i reload esauriscono subito
// le 100 richieste/15min, bloccando anche il login.
const isDev = process.env.NODE_ENV !== 'production';

// Rate limiter global pour toutes les routes API
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes par défaut
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requêtes par fenêtre
  skip: () => isDev, // mai bloccare in sviluppo
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez réessayer plus tard.'
  },
  standardHeaders: true, // Retourner les infos de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactiver les headers `X-RateLimit-*`
});

// Rate limiter strict pour l'authentification (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  skipSuccessfulRequests: true, // Ne compter que les requêtes échouées
  skip: () => isDev, // mai bloccare in sviluppo
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
  }
});

// Rate limiter pour la création de contenu
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 créations max par heure
  message: {
    success: false,
    message: 'Trop de créations. Veuillez réessayer plus tard.'
  }
});

module.exports = {
  limiter,
  authLimiter,
  createLimiter
};
