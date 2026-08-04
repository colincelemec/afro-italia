// ============================================
// Admin Route Component
// Accesso riservato agli utenti con ruolo ADMIN
// ============================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  // Non autenticato → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Autenticato ma non admin → dashboard
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
