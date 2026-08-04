// ============================================
// BrandName — "AfroItalia" in Harlow Solid Italic
// Effetto speciale: scrittura progressiva lettera
// per lettera, con bagliore dorato finale.
// Fallback font: Yesteryear (Google Fonts).
// ============================================

import React from 'react';
import '../../styles/BrandName.css';

const LETTERS = 'AfroItalia'.split('');
const STAGGER = 0.14; // secondi tra una lettera e l'altra

const BrandName = ({ className = '' }) => (
  <span className={`brand-name ${className}`} aria-label="AfroItalia">
    {LETTERS.map((ch, i) => (
      <span
        key={i}
        className="brand-name__letter"
        style={{ animationDelay: `${0.2 + i * STAGGER}s` }}
        aria-hidden="true"
      >
        {ch}
      </span>
    ))}
    {/* Pennino luminoso che segue la scrittura */}
    <span
      className="brand-name__shine"
      style={{ animationDuration: `${0.2 + LETTERS.length * STAGGER + 0.4}s` }}
      aria-hidden="true"
    />
  </span>
);

export default BrandName;
