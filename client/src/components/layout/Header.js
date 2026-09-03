// ============================================
// Header/Navigation Component
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector';
import ThemeToggle from '../common/ThemeToggle';
import BrandName from '../common/BrandName';
import ConfirmDialog from '../common/ConfirmDialog';
import useAuthStore from '../../stores/authStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../locales/translations';
import '../../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const t = (path) => getTranslation(path, language);

  // Determine if we're on the landing page (public view)
  const isLandingPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';
  // Home: header scuro in stile GitHub
  const isHome = location.pathname === '/';

  // Il bottone apre il popup di conferma; l'uscita avviene solo su "Sì"
  const handleLogout = () => setLogoutDialogOpen(true);

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // `header-over-hero` = en-tête transparent posé sur la photo :
  // uniquement sur l'accueil. Ailleurs (connexion, inscription…),
  // le fond est clair et le texte doit rester foncé.
  return (
    <header className={`header ${isLandingPage ? 'header-landing' : 'header-app'} ${isHome ? 'header-over-hero header-dark' : ''}`}>
      <div className="header-container">
        <div className="header-logo">
          <Link to={isAuthenticated ? "/dashboard" : "/"}>
            <h1>
              <img
                src="/logo-afroitalia.png"
                alt=""
                className="logo-img"
                width="40"
                height="40"
              />
              <BrandName />
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          {isLandingPage && !isAuthenticated ? (
            // Landing Page Mode - Only Login and Register
            <>
              <Link to="/login" className="nav-button login-button">{t('footer.signIn')}</Link>
              <Link to="/register" className="nav-button register-button">{t('footer.signUp')}</Link>
              <LanguageSelector />
              <ThemeToggle />
            </>
          ) : (
            // App Mode - Full Navigation
            <>
              {isAuthenticated && (
                <Link to="/dashboard" className="nav-link">{t('app.nav.dashboard')}</Link>
              )}
              <Link to="/activities" className="nav-link">{t('app.nav.activities')}</Link>

              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="nav-link">{t('app.nav.profile')}</Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="nav-link">{t('app.nav.admin')}</Link>
                  )}
                  <button onClick={handleLogout} className="nav-button logout-button">
                    {t('app.nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-button login-button">{t('app.nav.login')}</Link>
                  <Link to="/register" className="nav-button register-button">{t('app.nav.signup')}</Link>
                </>
              )}
              <LanguageSelector />
              <ThemeToggle />
            </>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span className="menu-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="header-nav mobile-nav">
          {isLandingPage && !isAuthenticated ? (
            // Landing Page Mode - Only Login and Register
            <>
              <Link to="/login" className="nav-link" onClick={toggleMobileMenu}>{t('footer.signIn')}</Link>
              <Link to="/register" className="nav-link" onClick={toggleMobileMenu}>{t('footer.signUp')}</Link>
              <LanguageSelector />
              <ThemeToggle />
            </>
          ) : (
            // App Mode - Full Navigation
            <>
              {isAuthenticated && (
                <Link to="/dashboard" className="nav-link" onClick={toggleMobileMenu}>{t('app.nav.dashboard')}</Link>
              )}
              <Link to="/activities" className="nav-link" onClick={toggleMobileMenu}>{t('app.nav.activities')}</Link>

              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="nav-link" onClick={toggleMobileMenu}>{t('app.nav.profile')}</Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="nav-link" onClick={toggleMobileMenu}>{t('app.nav.admin')}</Link>
                  )}
                  <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="nav-button logout-button">
                    {t('app.nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link" onClick={toggleMobileMenu}>{t('app.nav.login')}</Link>
                  <Link to="/register" className="nav-link" onClick={toggleMobileMenu}>{t('app.nav.signup')}</Link>
                </>
              )}
            </>
          )}
        </nav>
      )}

      {/* Popup di conferma uscita */}
      <ConfirmDialog
        open={logoutDialogOpen}
        title={t('app.nav.logoutTitle')}
        message={t('app.nav.logoutMessage')}
        yesLabel={t('app.nav.logoutYes')}
        cancelLabel={t('app.nav.logoutCancel')}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </header>
  );
};

export default Header;
