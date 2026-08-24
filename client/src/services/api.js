// ============================================
// Service API - Configuration AJAX avec Fetch
// ============================================

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ============================================
// CONFIGURATION HEADERS
// ============================================

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// ============================================
// GESTION DES ERREURS
// ============================================

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // Si le token est expiré (401), déconnecter l'utilisateur
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Erreurs de validation (express-validator) : le serveur renvoie
    // un tableau `errors` détaillé. On le remonte au lieu du seul
    // message générique « Erreurs de validation », inutilisable.
    let message = data.message || 'Une erreur est survenue';
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const details = data.errors
        .map(e => e.msg || e.message)
        .filter(Boolean);
      if (details.length > 0) message = details.join(' · ');
    }

    const error = new Error(message);
    // Détail par champ, exploitable par les formulaires :
    // { phone: 'Numéro de téléphone invalide', … }
    if (Array.isArray(data.errors)) {
      error.fieldErrors = data.errors.reduce((acc, e) => {
        const field = e.path || e.param; // express-validator v7 = path, v6 = param
        if (field && !acc[field]) acc[field] = e.msg || e.message;
        return acc;
      }, {});
      error.errors = data.errors;
    }
    error.status = response.status;
    throw error;
  }

  return data;
};

// ============================================
// MÉTHODES HTTP (AJAX avec Fetch API)
// ============================================

const api = {
  /**
   * GET request
   */
  get: async (endpoint, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_URL}${endpoint}?${queryString}` : `${API_URL}${endpoint}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });

      return handleResponse(response);
    } catch (error) {
      console.error('GET Error:', error);
      throw error;
    }
  },

  /**
   * POST request
   */
  post: async (endpoint, data = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('POST Error:', error);
      throw error;
    }
  },

  /**
   * PUT request
   */
  put: async (endpoint, data = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('PUT Error:', error);
      throw error;
    }
  },

  /**
   * PATCH request
   */
  patch: async (endpoint, data = {}) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });

      return handleResponse(response);
    } catch (error) {
      console.error('PATCH Error:', error);
      throw error;
    }
  },

  /**
   * DELETE request
   */
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      return handleResponse(response);
    } catch (error) {
      console.error('DELETE Error:', error);
      throw error;
    }
  },

  /**
   * Upload de fichiers (FormData)
   */
  upload: async (endpoint, formData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Ne pas définir Content-Type pour FormData (le navigateur le fera automatiquement)
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }
};

export default api;
