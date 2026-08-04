// ============================================
// Forgot Password — demande de lien de réinitialisation
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';
import authService from '../services/authService';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const { language } = useLanguage();
  const t = (path) => getTranslation(path, language);

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!email) {
      setFieldError(t('forgotPwd.errEmailRequired'));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldError(t('forgotPwd.errEmailInvalid'));
      return;
    }
    setFieldError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email, language);
      setSent(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('forgotPwd.title')}</h1>
          <p>{t('forgotPwd.subtitle')}</p>
        </div>

        {sent ? (
          <div className="auth-form">
            <div className="success-message">{t('forgotPwd.sent')}</div>
            <div className="auth-switch">
              <p><Link to="/login">{t('forgotPwd.backToLogin')}</Link></p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {serverError && <div className="error-message">{serverError}</div>}

            <div className="form-group">
              <label htmlFor="email">{t('login.emailLabel')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
                className={fieldError ? 'error' : ''}
                placeholder={t('login.emailPlaceholder')}
              />
              {fieldError && <span className="field-error">{fieldError}</span>}
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? t('forgotPwd.sending') : t('forgotPwd.submit')}
            </button>

            <div className="auth-switch">
              <p><Link to="/login">{t('forgotPwd.backToLogin')}</Link></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
