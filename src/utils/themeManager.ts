/**
 * Global theme management utility
 * Handles loading and applying saved theme state across the application
 * 
 * @module themeManager
 */

/**
 * Theme type - dark or light mode
 * @example "dark"
 */
export type Theme = 'dark' | 'light';

/**
 * Gets the saved theme preference from localStorage
 * @returns 'dark' or 'light'
 * 
 * @example
 * const theme = getSavedTheme(); // "dark" or "light"
 */
export const getSavedTheme = (): Theme => {
  const savedTheme = localStorage.getItem('sgex-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }
  
  // Check system preference as fallback
  let prefersLight = false;
  try {
    if (window.matchMedia) {
      prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    }
  } catch (e) {
    // Fallback for test environments
    prefersLight = false;
  }
  
  // Default to dark mode unless user explicitly prefers light
  return prefersLight ? 'light' : 'dark';
};

/**
 * Applies theme to document body and saves to localStorage
 * @param theme - 'dark' or 'light'
 * 
 * @example
 * applyTheme("dark"); // Sets body class to 'theme-dark' and saves to localStorage
 */
export const applyTheme = (theme: Theme): void => {
  const isDark = theme === 'dark';
  document.body.className = isDark ? 'theme-dark' : 'theme-light';
  localStorage.setItem('sgex-theme', theme);
};

/**
 * Initializes theme from saved preferences
 * Should be called early in app initialization
 * @returns Current theme value
 * 
 * @example
 * const theme = initializeTheme(); // Loads and applies saved theme
 */
export const initializeTheme = (): Theme => {
  const theme = getSavedTheme();
  applyTheme(theme);
  return theme;
};

/**
 * Toggles between dark and light theme
 * @returns New theme value after toggle
 * 
 * @example
 * const newTheme = toggleTheme(); // Switches from dark to light or vice versa
 */
export const toggleTheme = (): Theme => {
  const currentTheme = getSavedTheme();
  const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  return newTheme;
};

/**
 * Theme manager utilities
 * @example
 * import { getSavedTheme, applyTheme, toggleTheme } from './themeManager';
 */
const themeManager = {
  getSavedTheme,
  applyTheme,
  initializeTheme,
  toggleTheme
};

export default themeManager;
