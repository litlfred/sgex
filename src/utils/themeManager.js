/**
 * Global theme management utility
 * Handles loading and applying saved theme state across the application
 */

/**
 * Gets the saved theme preference from localStorage
 * @returns {string} 'dark' or 'light'
 */
export const getSavedTheme = () => {
  const savedTheme = localStorage.getItem('sgex-theme');
  if (savedTheme) {
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
 * @param {string} theme - 'dark' or 'light'
 */
export const applyTheme = (theme) => {
  const isDark = theme === 'dark';
  document.body.className = isDark ? 'theme-dark' : 'theme-light';
  localStorage.setItem('sgex-theme', theme);
};

/**
 * Initializes theme from saved preferences
 * Should be called early in app initialization
 */
export const initializeTheme = () => {
  const theme = getSavedTheme();
  applyTheme(theme);
  return theme;
};

/**
 * Toggles between dark and light theme
 * @returns {string} New theme value
 */
export const toggleTheme = () => {
  const currentTheme = getSavedTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  return newTheme;
};