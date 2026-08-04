// ============================================
// ConfirmDialog — popup di conferma riutilizzabile
// Sì / Annulla, chiusura con Escape o click fuori.
// ============================================

import React, { useEffect, useRef } from 'react';
import Icon from './Icon';
import '../../styles/ConfirmDialog.css';

const ConfirmDialog = ({ open, title, message, yesLabel, cancelLabel, onConfirm, onCancel, icon = 'alert' }) => {
  const yesRef = useRef(null);

  // Escape per annullare + focus sul bottone principale
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    yesRef.current?.focus();
    // blocca lo scroll della pagina dietro al popup
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="cdialog-overlay" onClick={onCancel} role="presentation">
      <div
        className="cdialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cdialog-title"
        aria-describedby="cdialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cdialog__icon">
          <Icon name={icon} size={26} />
        </div>
        <h3 id="cdialog-title" className="cdialog__title">{title}</h3>
        <p id="cdialog-message" className="cdialog__message">{message}</p>
        <div className="cdialog__actions">
          <button className="cdialog__btn cdialog__btn--cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button ref={yesRef} className="cdialog__btn cdialog__btn--yes" onClick={onConfirm}>
            {yesLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
