import { useState, useEffect } from 'react';

/**
 * Custom hook that returns the appropriate image path based on theme and screen size
 * Uses fallback strategy: starts with theme-aware image, then switches to responsive at runtime
 * @param {string} baseImagePath - The base image path (e.g., "sgex-mascot.png")
 * @param {Object} options - Configuration options
 * @param {boolean} options.forceMobile - Force mobile version regardless of screen size
 * @param {boolean} options.forceDesktop - Force desktop version regardless of screen size
 * @returns {string} The responsive image path
 */
const useResponsiveImage = (baseImagePath, options = {}) => {
  // Start with theme-aware path for build compatibility
  const getThemeAwarePath = () => {
    const isDarkMode = document.body && document.body.classList.contains('theme-dark');
    const publicUrl = process.env.PUBLIC_URL || '';
    const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
    
    if (isDarkMode) {
      const darkImageName = normalizedPath.replace(/\.png$/, '_grey_tabby.png');
      return publicUrl ? `${publicUrl}/${darkImageName}` : `/${darkImageName}`;
    } else {
      return publicUrl ? `${publicUrl}/${normalizedPath}` : `/${normalizedPath}`;
    }
  };

  const getResponsivePath = () => {
    const isDarkMode = document.body && document.body.classList.contains('theme-dark');
    const isMobile = options.forceMobile || (!options.forceDesktop && window.innerWidth <= 768);
    const publicUrl = process.env.PUBLIC_URL || '';
    const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
    
    let imageName = normalizedPath;
    
    // Apply theme modification first
    if (isDarkMode) {
      imageName = imageName.replace(/\.png$/, '_grey_tabby.png');
    }
    
    // Apply mobile modification if needed
    if (isMobile) {
      imageName = imageName.replace(/\.png$/, '_mobile.png');
    }
    
    return publicUrl ? `${publicUrl}/${imageName}` : `/${imageName}`;
  };

  const [currentImagePath, setCurrentImagePath] = useState(getThemeAwarePath);
  const [useResponsive, setUseResponsive] = useState(false);

  useEffect(() => {
    // After first render, switch to responsive mode
    setUseResponsive(true);
    
    const updateImagePath = () => {
      const newPath = useResponsive ? getResponsivePath() : getThemeAwarePath();
      setCurrentImagePath(newPath);
    };

    updateImagePath();

    // Create a MutationObserver to watch for body class changes (theme changes)
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateImagePath();
        }
      });
    });

    // Start observing the body for theme changes
    if (document.body) {
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Listen for window resize events (for responsive image selection)
    const handleResize = () => {
      updateImagePath();
    };

    // Debounce resize events to avoid excessive updates
    let resizeTimeout;
    const debouncedHandleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedHandleResize);

    // Cleanup observers and listeners on unmount
    return () => {
      themeObserver.disconnect();
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(resizeTimeout);
    };
  }, [baseImagePath, options.forceMobile, options.forceDesktop, useResponsive]);

  return currentImagePath;
};

export default useResponsiveImage;