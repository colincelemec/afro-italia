// ============================================
// Server Entry Point
// ============================================

const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connecté à PostgreSQL via Prisma');

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 ============================================');
      console.log(`🚀 AfroItalia API Server`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🚀 URL: http://localhost:${PORT}`);
      console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
      console.log('🚀 ============================================');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// ============================================
// GESTION DE L'ARRÊT PROPRE
// ============================================

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} reçu. Arrêt du serveur...`);

  try {
    await prisma.$disconnect();
    console.log('✅ Déconnexion de la base de données réussie');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'arrêt:', error);
    process.exit(1);
  }
};

// Écouter les signaux d'arrêt
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Démarrer
startServer();
