// ============================================
// ThemeToggle — interruttore lato scuro / lato chiaro
// Luna a sinistra, sole a destra, pomello scorrevole.
// ============================================

import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from './Icon';
import '../../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : 'theme-toggle--light'}`}
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Passa al lato chiaro' : 'Passa al lato scuro'}
      title={isDark ? 'Lato chiaro' : 'Lato scuro'}
    >
      <span className="theme-toggle__icon theme-toggle__icon--moon">
        <Icon name="moon" size={13} />
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--sun">
        <Icon name="sun" size={13} />
      </span>
      <span className="theme-toggle__knob" aria-hidden="true" />
    </button>
  );
};

export default ThemeToggle;
