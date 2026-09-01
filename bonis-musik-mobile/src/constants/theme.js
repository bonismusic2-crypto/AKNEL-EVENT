import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LIGHT_THEME = {
  isDark: false,
  colors: {
    background: '#F9FAFB',      // Fond blanc / ivoire clair
    surface: '#FFFFFF',         // Cartes blanches
    card: '#FFFFFF',
    cardBorder: 'rgba(212, 175, 55, 0.25)',
    gold: '#C59B27',            // Or riche et visible
    goldLight: '#E5B93B',
    goldDark: '#997312',
    goldGradient: ['#E5B93B', '#C59B27', '#A67C1E'],
    textPrimary: '#111827',      // Texte noir / foncé
    textSecondary: '#4B5563',    // Gris anthracite doux
    textMuted: '#6B7280',
    border: '#E5E7EB',
    headerBg: '#FFFFFF',
    modalBg: '#FFFFFF',
    inputBg: '#F3F4F6',
    activeTab: '#C59B27',
    inactiveTab: '#9CA3AF',
    navBg: '#FFFFFF',
    navBorder: '#E5E7EB',
    success: '#059669',
    danger: '#DC2626',
  },
};

export const DARK_THEME = {
  isDark: true,
  colors: {
    background: '#0D0D0D',      // Noir profond élégant
    surface: '#171717',         // Surface gris très sombre
    card: '#1A1A1A',            // Cartes sombres
    cardBorder: 'rgba(197, 155, 39, 0.35)',
    gold: '#E5B93B',            // Or lumineux sur fond noir
    goldLight: '#F3D068',
    goldDark: '#C59B27',
    goldGradient: ['#F3D068', '#E5B93B', '#C59B27'],
    textPrimary: '#FFFFFF',      // Texte blanc pur
    textSecondary: '#D1D5DB',    // Gris clair très lisible
    textMuted: '#9CA3AF',
    border: '#27272A',
    headerBg: '#121212',
    modalBg: '#171717',
    inputBg: '#262626',
    activeTab: '#E5B93B',
    inactiveTab: '#71717A',
    navBg: '#141414',
    navBorder: 'rgba(255, 255, 255, 0.08)',
    success: '#10B981',
    danger: '#EF4444',
  },
};

// Instance par défaut (Light Theme par défaut)
export let THEME = LIGHT_THEME;

const ThemeContext = createContext({
  theme: LIGHT_THEME,
  isDarkMode: false,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

const THEME_STORAGE_KEY = '@bonis_theme_mode';

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Charger la préférence de thème sauvegardée
    const loadStoredTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored !== null) {
          const dark = JSON.parse(stored);
          setIsDarkMode(dark);
          THEME = dark ? DARK_THEME : LIGHT_THEME;
        } else {
          setIsDarkMode(false);
          THEME = LIGHT_THEME;
        }
      } catch (e) {
        console.warn('Error loading theme:', e);
      }
    };
    loadStoredTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const nextMode = !isDarkMode;
      setIsDarkMode(nextMode);
      THEME = nextMode ? DARK_THEME : LIGHT_THEME;
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(nextMode));
    } catch (e) {
      console.warn('Error saving theme:', e);
    }
  };

  const setDarkMode = async (value) => {
    try {
      setIsDarkMode(value);
      THEME = value ? DARK_THEME : LIGHT_THEME;
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(value));
    } catch (e) {
      console.warn('Error saving theme:', e);
    }
  };

  const currentTheme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, isDarkMode, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
