import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme context for managing dark/light mode with WHO colors
 */
const ThemeContext = createContext();

/**
 * WHO Color palette
 */
export const WHO_COLORS = {
  // Primary WHO colors
  blue: '#006cbe',      // WHO Blue - primary highlights and accents
  navy: '#040B76',      // WHO Navy - dark mode background
  lightBlue: '#c0dcf2', // WHO Light Blue - light mode background elements
  
  // Derived colors for better UX
  blueLight: '#338dd6',   // Lighter shade of WHO Blue for hover states
  blueDark: '#004a99',    // Darker shade of WHO Blue for pressed states
  navyLight: '#1a2380',   // Lighter navy for dark mode elements
  lightBlueLight: '#e0ebf7', // Very light blue for subtle backgrounds
  lightBlueDark: '#a0c8e8',  // Darker light blue for borders/separators
};

/**
 * Theme provider component
 */
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sgex-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Update CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      // Dark mode - use WHO Navy background
      root.style.setProperty('--who-primary-bg', WHO_COLORS.navy);
      root.style.setProperty('--who-secondary-bg', WHO_COLORS.navyLight);
      root.style.setProperty('--who-card-bg', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--who-text-primary', '#ffffff');
      root.style.setProperty('--who-text-secondary', 'rgba(255, 255, 255, 0.8)');
      root.style.setProperty('--who-text-muted', 'rgba(255, 255, 255, 0.6)');
      root.style.setProperty('--who-border-color', 'rgba(255, 255, 255, 0.2)');
      root.style.setProperty('--who-hover-bg', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--who-selected-bg', 'rgba(0, 108, 190, 0.3)');
    } else {
      // Light mode - use WHO Light Blue background
      root.style.setProperty('--who-primary-bg', '#ffffff');
      root.style.setProperty('--who-secondary-bg', WHO_COLORS.lightBlue);
      root.style.setProperty('--who-card-bg', '#ffffff');
      root.style.setProperty('--who-text-primary', '#333333');
      root.style.setProperty('--who-text-secondary', '#666666');
      root.style.setProperty('--who-text-muted', '#999999');
      root.style.setProperty('--who-border-color', WHO_COLORS.lightBlueDark);
      root.style.setProperty('--who-hover-bg', WHO_COLORS.lightBlueLight);
      root.style.setProperty('--who-selected-bg', 'rgba(0, 108, 190, 0.1)');
    }

    // WHO Blue colors (same for both themes)
    root.style.setProperty('--who-blue', WHO_COLORS.blue);
    root.style.setProperty('--who-blue-light', WHO_COLORS.blueLight);
    root.style.setProperty('--who-blue-dark', WHO_COLORS.blueDark);
    root.style.setProperty('--who-navy', WHO_COLORS.navy);
    root.style.setProperty('--who-light-blue', WHO_COLORS.lightBlue);
    root.style.setProperty('--who-light-blue-light', WHO_COLORS.lightBlueLight);
    root.style.setProperty('--who-light-blue-dark', WHO_COLORS.lightBlueDark);

    // Save theme preference
    localStorage.setItem('sgex-theme', isDarkMode ? 'dark' : 'light');
    
    // Update body class for theme-specific styling
    document.body.className = isDarkMode ? 'theme-dark' : 'theme-light';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeValue = {
    isDarkMode,
    toggleTheme,
    colors: WHO_COLORS,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context  
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;