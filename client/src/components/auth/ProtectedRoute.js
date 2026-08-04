// ============================================
// Protected Route Component
// Redirects to login if user is not authenticated
// ============================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
