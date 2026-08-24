// ============================================
// Détails d'erreur pour les réponses API
//
// En développement il est pratique de renvoyer error.message au client.
// En production c'est une fuite d'information : les messages de Prisma
// exposent les noms de tables, de colonnes et parfois des fragments de
// requêtes SQL, précieux pour un attaquant.
//
// Usage :
//   res.status(500).json({ success: false, message: '…', ...devDetails(error) });
// ============================================

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

/**
 * Renvoie { error: '…' } en développement, {} en production.
 * L'erreur complète reste toujours visible dans les logs serveur.
 */
function devDetails(error) {
  if (!isDev) return {};
  return { error: error?.message || String(error) };
}

module.exports = { devDetails, isDev };
