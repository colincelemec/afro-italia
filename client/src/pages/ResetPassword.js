// ============================================
// Reset Password — nouveau mot de passe via token (lien email)
// ============================================

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales/translations';
import PasswordInput from '../components/common/PasswordInput';
import authService from '../services/authService';
import '../styles/Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (path) => getTranslation(path, language);
  const [params] = useSearchParams();
  const token = params.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const err = {};
    if (!form.password) err.password = t('resetPwd.errRequired');
    else if (form.password.length < 6) err.password = t('resetPwd.errTooShort');
    if (!form.confirmPassword) err.confirmPassword = t('resetPwd.errRequired');
    else if (form.password !== form.confirmPassword) err.confirmPassword = t('resetPwd.errNoMatch');
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lien sans token → invalide
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{t('resetPwd.title')}</h1>
          </div>
          <div className="auth-form">
            <div className="error-message">{t('resetPwd.invalidLink')}</div>
            <div className="auth-switch">
              <p><Link to="/forgot-password">{t('resetPwd.requestNew')}</Link></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('resetPwd.title')}</h1>
          <p>{t('resetPwd.subtitle')}</p>
        </div>

        {done ? (
          <div className="auth-form">
            <div className="success-message">{t('resetPwd.success')}</div>
            <div className="auth-switch">
              <p><Link to="/login">{t('resetPwd.goLogin')}</Link></p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {serverError && <div className="error-message">{serverError}</div>}

            <div className="form-group">
              <label htmlFor="password">{t('resetPwd.newPassword')}</label>
              <PasswordInput
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder={t('resetPwd.newPasswordPh')}
                autoComplete="new-password"
                showLabel={getTranslation('common.showPassword', language)}
                hideLabel={getTranslation('common.hidePassword', language)}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('resetPwd.confirmPassword')}</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder={t('resetPwd.confirmPasswordPh')}
                autoComplete="new-password"
                showLabel={getTranslation('common.showPassword', language)}
                hideLabel={getTranslation('common.hidePassword', language)}
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? t('resetPwd.saving') : t('resetPwd.submit')}
            </button>

            <div className="auth-switch">
              <p><Link to="/login">{t('resetPwd.goLogin')}</Link></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
