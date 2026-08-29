// Variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_URL = 'http://localhost:3000';
// SMTP et Stripe volontairement désactivés : les services passent en mode dev/console.
// On les fixe à '' (falsy) AVANT le chargement de dotenv : dotenv n'écrase pas
// les variables déjà définies, donc le .env local ne peut pas les réactiver.
process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.STRIPE_SECRET_KEY = '';
process.env.STRIPE_WEBHOOK_SECRET = '';
process.env.CLOUDINARY_CLOUD_NAME = '';
process.env.CLOUDINARY_API_KEY = '';
process.env.CLOUDINARY_API_SECRET = '';
