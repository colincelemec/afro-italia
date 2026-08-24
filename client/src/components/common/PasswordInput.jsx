// ============================================
// PasswordInput — champ mot de passe avec bouton afficher/masquer
//
// Saisir un mot de passe à l'aveugle est la première cause d'échec
// d'inscription : une faute de frappe invisible, et l'utilisateur
// recommence sans comprendre. Le bouton œil corrige cela.
//
// S'utilise comme un <input> classique : mêmes props (value, onChange,
// name, id, placeholder, className).
// ============================================

import React, { useState } from 'react';
import Icon from './Icon';
import './PasswordInput.css';

const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  className = '',
  autoComplete = 'current-password',
  showLabel = 'Show password',
  hideLabel = 'Hide password',
  ...rest
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="pwd">
      <input
        type={visible ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`pwd__input ${className}`}
        autoComplete={autoComplete}
        {...rest}
      />
      <button
        type="button"                    /* jamais submit : ne valide pas le formulaire */
        className="pwd__toggle"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? hideLabel : showLabel}
        title={visible ? hideLabel : showLabel}
        tabIndex={-1}                    /* ne casse pas la navigation clavier du formulaire */
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </div>
  );
};

export default PasswordInput;
