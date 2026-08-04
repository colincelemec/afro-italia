// ============================================
// Service Admin - Appels API du pannello amministratore
// Toutes les routes nécessitent un utilisateur ADMIN.
// ============================================

import api from './api';

const adminService = {
  // ── Statistiques globales ──
  getStats: () => api.get('/admin/stats'),

  // ── Entreprises ──
  getBusinesses: (params = {}) => api.get('/admin/businesses', params),
  getPendingBusinesses: () => api.get('/admin/businesses/pending'),

  /**
   * Vérifier (approuver) une entreprise → status VERIFIED
   */
  verifyBusiness: (id) => api.patch(`/businesses/${id}/verify`),

  /**
   * Changer le statut d'une entreprise
   * status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED'
   */
  updateBusinessStatus: (id, status) =>
    api.patch(`/businesses/${id}/status`, { status }),

  // ── Utilisateurs ──
  getUsers: (params = {}) => api.get('/admin/users', params),

  /**
   * Changer le rôle d'un utilisateur
   * role: 'USER' | 'BUSINESS' | 'ADMIN'
   */
  updateUserRole: (id, role) =>
    api.patch(`/admin/users/${id}/role`, { role }),

  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // ── Avis signalés (modération) ──
  getReportedReviews: () => api.get('/admin/reviews/reported'),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};

export default adminService;
