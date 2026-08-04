// ============================================
// Authentication Service
// Handles all authentication-related API calls
// ============================================

import api from './api';

/**
 * Il backend risponde con { success, message, data: { user, token } }.
 * Normalizziamo la risposta esponendo user e token al livello superiore.
 */
const normalizeAuthResponse = (response) => {
  const payload = response?.data || response || {};
  return { ...response, user: payload.user, token: payload.token };
};

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} User data with token
   */
  register: async (userData) => {
    try {
      const response = normalizeAuthResponse(await api.post('/auth/register', userData));

      // Store token and user data in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Email and password
   * @returns {Promise} User data with token
   */
  login: async (credentials) => {
    try {
      const response = normalizeAuthResponse(await api.post('/auth/login', credentials));

      // Store token and user data in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // La navigazione è gestita da chi chiama (SPA, niente ricaricamento completo)
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null
   */
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Get user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    try {
      const response = normalizeAuthResponse(await api.get('/auth/me'));

      // Update user data in localStorage
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} Updated user data
   */
  updateProfile: async (userData) => {
    try {
      const response = normalizeAuthResponse(await api.put('/users/profile', userData));

      // Update user data in localStorage
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login with Google
   * @param {string} idToken - Google ID token from @react-oauth/google
   * @returns {Promise} User data with token
   */
  googleLogin: async (accessToken) => {
    try {
      const response = normalizeAuthResponse(await api.post('/auth/google', { accessToken }));

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise}
   */
  forgotPassword: async (email, lang) => {
    try {
      return await api.post('/auth/forgot-password', { email, lang });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password
   * @param {string} token - Reset token (dal link email)
   * @param {string} newPassword - New password
   * @returns {Promise}
   */
  resetPassword: async (token, newPassword) => {
    try {
      // Il backend si aspetta il token nell'URL e { newPassword } nel body
      return await api.post(`/auth/reset-password/${token}`, { newPassword });
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
