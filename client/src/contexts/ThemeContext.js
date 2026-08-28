// ============================================
// ThemeContext — lato scuro / lato chiaro
// Applica data-theme su <html> e salva la scelta.
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'afroitalia-theme';
// Le thème clair est le défaut : il porte l'identité chaleureuse
// d'AfroItalia. Le sombre reste disponible pour ceux qui le préfèrent.
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
