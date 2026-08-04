import React from 'react';
import Icon from '../common/Icon';
import BrandName from '../common/BrandName';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../locales/translations';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import '../../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const t = (path) => getTranslation(path, language);

  // Scorri verso una sezione della landing page (funziona da qualsiasi pagina)
  const goToSection = (e, sectionId) => {
    e.preventDefault();
    const scroll = () => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (location.pathname === '/') {
      scroll();
    } else {
      navigate('/');
      setTimeout(scroll, 250);
    }
  };

  // Torna in cima alla home
  const goHome = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Main Content */}
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <h3 className="footer-title"><BrandName /></h3>
            <p className="footer-description">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.quickLinks')}</h4>
            <ul className="footer-links">
              <li><a href="/" onClick={goHome}>{t('footer.home')}</a></li>
              <li><a href="#mission" onClick={(e) => goToSection(e, 'mission')}>{t('footer.about')}</a></li>
              <li><a href="#features" onClick={(e) => goToSection(e, 'features')}>{t('footer.features')}</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.legal')}</h4>
            <ul className="footer-links">
              <li><Link to="/legal/privacy">{t('footer.privacy')}</Link></li>
              <li><Link to="/legal/terms">{t('footer.terms')}</Link></li>
              <li><Link to="/legal/cookies">{t('footer.cookies')}</Link></li>
              <li><Link to="/legal/gdpr">{t('footer.gdpr')}</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.contact')}</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:info@afroitalia.com">
                  <Icon name="mail" size={14} /> info@afroitalia.com
                </a>
              </li>
              <li>
                <a href="tel:+393715412337">
                  <Icon name="phone" size={14} /> +39 371 541 2337
                </a>
              </li>
            </ul>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link social-facebook">
                <FaFacebookF className="social-icon" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link social-instagram">
                <FaInstagram className="social-icon" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="social-link social-x">
                <FaXTwitter className="social-icon" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-link social-linkedin">
                <FaLinkedinIn className="social-icon" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <div className="footer-copyright">
            <p>
              © {currentYear} AfroItalia. {t('footer.copyright')}
            </p>
            <p className="footer-tagline">
              {t('footer.tagline')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
