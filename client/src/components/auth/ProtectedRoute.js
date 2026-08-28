// ============================================
// ProtectedRoute — réservé aux utilisateurs connectés
//
// On mémorise la page demandée : après connexion, l'utilisateur y
// est renvoyé automatiquement au lieu d'atterrir sur la dashboard.
// ============================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
