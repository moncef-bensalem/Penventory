'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte de thème
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Récupérer le thème préféré du localStorage ou utiliser le mode clair par défaut
  const [theme, setTheme] = useState('light');
  
  // Charger le thème depuis le localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      // Appliquer le thème au document
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);
  
  // Sauvegarder le thème dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('theme', theme);
    // Appliquer le thème au document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  // Fonction pour changer de thème
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte de thème
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
