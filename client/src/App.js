import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/App.css';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Activities from './pages/Activities';
import BusinessDetail from './pages/BusinessDetail';
import Admin from './pages/Admin';
import AddService from './pages/AddService';
import LegalPage from './pages/LegalPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Chatbot di assistenza (widget flottante)
import ChatBot from './components/common/ChatBot';
import ScrollToTop from './components/common/ScrollToTop';

// Context
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Store
import useAuthStore from './stores/authStore';

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
    <ThemeProvider>
    <LanguageProvider>
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/legal/:type" element={<LegalPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activities"
                element={
                  <ProtectedRoute>
                    <Activities />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/businesses/:slug"
                element={
                  <ProtectedRoute>
                    <BusinessDetail />
                  </ProtectedRoute>
                }
              />

              {/* Pubblica un servizio/attività - qualunque utente autenticato */}
              <Route
                path="/add-service"
                element={
                  <ProtectedRoute>
                    <AddService />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-business"
                element={
                  <ProtectedRoute>
                    <AddService />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-service/:id"
                element={
                  <ProtectedRoute>
                    <AddService />
                  </ProtectedRoute>
                }
              />

              {/* Admin Panel - solo ADMIN */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />

              {/* Catch all - pagina 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {/* Footer visibile solo per i visitatori non autenticati */}
          {!isAuthenticated && <Footer />}
          {/* Chatbot di assistenza, sempre disponibile */}
          <ChatBot />
        </div>
      </Router>
    </ToastProvider>
    </LanguageProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
