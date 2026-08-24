// ============================================
// ClaimModal — « C'est mon activité »
// Modulo di rivendicazione di una scheda creata dal censimento.
// La verifica è manuale: la richiesta arriva nel pannello admin.
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import businessService from '../../services/businessService';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../locales/translations';
import { useToast } from '../../contexts/ToastContext';
import Icon from '../common/Icon';
import PhoneInput from '../common/PhoneInput';
import './ClaimModal.css';

const ClaimModal = ({ open, business, user, onClose, onSubmitted }) => {
  const { language } = useLanguage();
  const t = useCallback(
    (key) => getTranslation(`app.businessDetail.${key}`, language),
    [language]
  );
  const toast = useToast();

  const [form, setForm] = useState({
    fullName: '',
    role: '',
    phone: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Precompila con i dati dell'utente connesso
  useEffect(() => {
    if (!open) return;
    setForm(prev => ({
      ...prev,
      fullName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || prev.fullName,
      email: user?.email || prev.email,
    }));
    setErrors({});
    setServerError(null);
  }, [open, user]);

  // Chiusura con Escape + blocco dello scroll sotto la modale
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const change = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    setServerError(null);
  };

  const validate = () => {
    const err = {};
    if (!form.fullName.trim()) err.fullName = t('claimRequired');
    if (!form.role.trim()) err.role = t('claimRequired');
    if (!form.phone.trim()) err.phone = t('claimRequired');
    if (!form.email.trim()) err.email = t('claimRequired');
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await businessService.claimBusiness(business.id, {
        fullName: form.fullName.trim(),
        role: form.role.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      toast.success(t('claimSuccess'));
      onSubmitted?.();
      onClose();
    } catch (err) {
      setServerError(err.message);
      if (err.fieldErrors) setErrors(p => ({ ...p, ...err.fieldErrors }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="claim-overlay" onClick={onClose} role="presentation">
      <div
        className="claim"
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="claim__head">
          <div className="claim__icon"><Icon name="shield" size={22} /></div>
          <div>
            <h2 id="claim-title">{t('claimTitle')}</h2>
            <p className="claim__biz">{business?.name}</p>
          </div>
          <button className="claim__close" onClick={onClose} aria-label={t('claimCancel')}>✕</button>
        </header>

        <p className="claim__intro">{t('claimIntro')}</p>

        <form className="claim__form" onSubmit={submit}>
          <div className="claim__row">
            <div className="claim__field">
              <label htmlFor="claim-fullName">{t('claimFullName')} *</label>
              <input
                id="claim-fullName" name="fullName" type="text"
                value={form.fullName} onChange={change}
                className={errors.fullName ? 'claim__input claim__input--err' : 'claim__input'}
              />
              {errors.fullName && <span className="claim__err">{errors.fullName}</span>}
            </div>

            <div className="claim__field">
              <label htmlFor="claim-role">{t('claimRole')} *</label>
              <input
                id="claim-role" name="role" type="text"
                value={form.role} onChange={change}
                placeholder={t('claimRolePh')}
                className={errors.role ? 'claim__input claim__input--err' : 'claim__input'}
              />
              {errors.role && <span className="claim__err">{errors.role}</span>}
            </div>
          </div>

          <div className="claim__row">
            <div className="claim__field">
              <label htmlFor="claim-phone">{t('claimPhone')} *</label>
              <PhoneInput
                id="claim-phone"
                locale={language}
                value={form.phone}
                error={!!errors.phone}
                onChange={(e164) => {
                  setForm(p => ({ ...p, phone: e164 }));
                  if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
                }}
                searchPlaceholder={getTranslation('app.addService.searchCountry', language)}
                emptyLabel={getTranslation('app.addService.noCountryFound', language)}
                countryLabel={getTranslation('app.addService.country', language)}
              />
              {errors.phone && <span className="claim__err">{errors.phone}</span>}
            </div>

            <div className="claim__field">
              <label htmlFor="claim-email">{t('claimEmail')} *</label>
              <input
                id="claim-email" name="email" type="email"
                value={form.email} onChange={change}
                className={errors.email ? 'claim__input claim__input--err' : 'claim__input'}
              />
              {errors.email && <span className="claim__err">{errors.email}</span>}
            </div>
          </div>

          <div className="claim__field">
            <label htmlFor="claim-message">{t('claimMessage')}</label>
            <textarea
              id="claim-message" name="message" rows={3}
              value={form.message} onChange={change}
              placeholder={t('claimMessagePh')}
              className="claim__input"
            />
          </div>

          {serverError && (
            <p className="claim__server-err"><Icon name="alert" size={15} /> {serverError}</p>
          )}

          <div className="claim__actions">
            <button type="button" className="claim__btn" onClick={onClose}>
              {t('claimCancel')}
            </button>
            <button type="submit" className="claim__btn claim__btn--primary" disabled={submitting}>
              {submitting ? t('claimSending') : t('claimSubmit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
