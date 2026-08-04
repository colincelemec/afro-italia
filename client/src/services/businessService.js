// ============================================
// Service: Business (Entreprises)
// Appels AJAX vers l'API REST
// ============================================

import api from './api';

const businessService = {
  /**
   * Récupérer toutes les entreprises (avec pagination et filtres)
   * @param {Object} params - { page, limit, city, category, subscription }
   */
  getAllBusinesses: async (params = {}) => {
    try {
      const response = await api.get('/businesses', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Rechercher des entreprises
   * @param {Object} params - { q, city, category, lat, lng, radius }
   */
  searchBusinesses: async (params) => {
    try {
      const response = await api.get('/businesses/search', params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupérer une entreprise par son slug
   * @param {string} slug
   */
  getBusinessBySlug: async (slug) => {
    try {
      const response = await api.get(`/businesses/${slug}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupérer les avis d'une entreprise
   * @param {string} id
   * @param {Object} params - { page, limit }
   */
  getBusinessReviews: async (id, params = {}) => {
    try {
      const response = await api.get(`/businesses/${id}/reviews`, params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Créer une nouvelle entreprise
   * @param {Object} businessData
   */
  createBusiness: async (businessData) => {
    try {
      const response = await api.post('/businesses', businessData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mettre à jour une entreprise
   * @param {string} id
   * @param {Object} updateData
   */
  updateBusiness: async (id, updateData) => {
    try {
      const response = await api.put(`/businesses/${id}`, updateData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprimer une entreprise
   * @param {string} id
   */
  deleteBusiness: async (id) => {
    try {
      const response = await api.delete(`/businesses/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Ajouter/retirer des favoris
   * @param {string} id
   */
  toggleFavorite: async (id) => {
    try {
      const response = await api.post(`/businesses/${id}/favorite`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupérer la liste des villes (référentiel formulaire)
   */
  getCities: async () => {
    try {
      const response = await api.get('/meta/cities');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupérer la liste des catégories (référentiel formulaire)
   */
  getCategories: async () => {
    try {
      const response = await api.get('/meta/categories');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupérer mes entreprises
   */
  getMyBusinesses: async () => {
    try {
      const response = await api.get('/businesses/my/list');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Vérifier une entreprise (ADMIN)
   * @param {string} id
   */
  verifyBusiness: async (id) => {
    try {
      const response = await api.patch(`/businesses/${id}/verify`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Changer le statut d'une entreprise (ADMIN)
   * @param {string} id
   * @param {string} status
   */
  updateBusinessStatus: async (id, status) => {
    try {
      const response = await api.patch(`/businesses/${id}/status`, { status });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default businessService;
