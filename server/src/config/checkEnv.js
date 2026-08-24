// ============================================
// Vérification de la configuration au démarrage
// Empêche de lancer la production avec des valeurs d'exemple
// (secret JWT public, mot de passe par défaut, etc.).
// Mieux vaut refuser de démarrer que d'exposer le site.
// ============================================

const isProduction = process.env.NODE_ENV === 'production';

// Valeurs présentes dans .env.example : jamais acceptables en production
const EXAMPLE_VALUES = [
  'your-super-secret-jwt-key-change-this-in-production',
  'your-refresh-token-secret',
  'your-google-maps-api-key',
  'sk_test_your_stripe_secret_key',
  'changeme',
  'password123',
];

const MIN_SECRET_LENGTH = 32;

/**
 * Contrôle les variables critiques.
 * En production : arrête le processus si un problème est détecté.
 * En développement : affiche simplement des avertissements.
 */
function checkEnv() {
  const errors = [];
  const warnings = [];

  // ── JWT : le cœur de l'authentification ──
  const jwt = process.env.JWT_SECRET;
  if (!jwt) {
    errors.push('JWT_SECRET est absent.');
  } else {
    if (EXAMPLE_VALUES.some(v => jwt.includes(v))) {
      errors.push(
        'JWT_SECRET utilise encore la valeur d\'exemple publiée dans .env.example : ' +
        'n\'importe qui peut forger un jeton d\'administrateur.'
      );
    }
    if (jwt.length < MIN_SECRET_LENGTH) {
      errors.push(`JWT_SECRET est trop court (${jwt.length} caractères, minimum ${MIN_SECRET_LENGTH}).`);
    }
  }

  // ── Base de données ──
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL est absent.');
  } else if (isProduction && process.env.DATABASE_URL.includes('localhost')) {
    warnings.push('DATABASE_URL pointe vers localhost alors que NODE_ENV=production.');
  }

  // ── URL du client (CORS) ──
  if (!process.env.CLIENT_URL) {
    warnings.push('CLIENT_URL est absent : le CORS retombera sur http://localhost:3000.');
  } else if (isProduction && process.env.CLIENT_URL.includes('localhost')) {
    errors.push('CLIENT_URL pointe vers localhost en production : le site réel sera bloqué par le CORS.');
  }

  // ── Emails ──
  if (isProduction && !process.env.SMTP_HOST) {
    warnings.push('SMTP non configuré : les emails seront seulement affichés dans les logs.');
  }

  // ── Rapport ──
  if (warnings.length > 0) {
    console.warn('\n⚠️  Avertissements de configuration :');
    warnings.forEach(w => console.warn('   • ' + w));
  }

  if (errors.length > 0) {
    console.error('\n❌ Configuration invalide :');
    errors.forEach(e => console.error('   • ' + e));

    if (isProduction) {
      console.error(
        '\nDémarrage interrompu pour raisons de sécurité.\n' +
        'Générez un secret solide avec :\n' +
        '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"\n'
      );
      process.exit(1);
    }
    console.error('\n(En développement on continue, mais corrigez avant de déployer.)\n');
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Configuration vérifiée');
  }

  return { errors, warnings };
}

module.exports = { checkEnv, EXAMPLE_VALUES, MIN_SECRET_LENGTH };
