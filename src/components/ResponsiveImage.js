import React, { useState, useEffect, useCallback } from 'react';
import useThemeImage from '../hooks/useThemeImage';
import { extractAltTextFromFilename } from '../utils/imageAltTextHelper';

/**
 * Responsive Image component that automatically selects the best image
 * based on screen size and theme with graceful fallback handling
 */
const ResponsiveImage = ({
  src,
  alt,
  className = '',
  style = {},
  forceMobile = false,
  forceDesktop = false,
  fallbackSrc = null,
  onLoad = null,
  onError = null,
  ...otherProps
}) => {
  // Auto-generate alt text if not provided
  const autoAlt = alt || extractAltTextFromFilename(src);
  
  // Function to get the appropriate image path
  const getResponsiveImagePath = useCallback(() => {
    const isMobile = forceMobile || (!forceDesktop && window.innerWidth <= 768);
    const isDarkMode = document.body && document.body.classList.contains('theme-dark');
    const publicUrl = process.env.PUBLIC_URL || '';
    const normalizedPath = src.startsWith('/') ? src.slice(1) : src;
    
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
  }, [src, forceMobile, forceDesktop]);

  const themeImagePath = useThemeImage(src);
  const [currentSrc, setCurrentSrc] = useState(() => getResponsiveImagePath());
  
  // Update image source when dependencies change
  useEffect(() => {
    setCurrentSrc(getResponsiveImagePath());
  }, [getResponsiveImagePath]);

  useEffect(() => {
    // Listen for window resize events
    const handleResize = () => {
      setCurrentSrc(getResponsiveImagePath());
    };

    // Debounce resize events
    let resizeTimeout;
    const debouncedHandleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      clearTimeout(resizeTimeout);
    };
  }, [getResponsiveImagePath]);

  useEffect(() => {
    // Listen for theme changes
    const handleThemeChange = () => {
      setCurrentSrc(getResponsiveImagePath());
    };

    // Create a MutationObserver to watch for body class changes (theme changes)
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          handleThemeChange();
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

    return () => {
      themeObserver.disconnect();
    };
  }, [getResponsiveImagePath]);

  // Handle image load errors by falling back to theme image or provided fallback
  const handleError = (e) => {
    // If the responsive image fails, fall back to theme-aware image
    if (e.target.src !== themeImagePath) {
      console.log(`Responsive image failed: ${e.target.src}, falling back to theme image: ${themeImagePath}`);
      e.target.src = themeImagePath;
    } else if (fallbackSrc && e.target.src !== fallbackSrc) {
      // If theme image also fails, try fallback
      e.target.src = fallbackSrc;
    }
    
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = (e) => {
    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={autoAlt}
      className={`responsive-image ${className}`}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
      {...otherProps}
    />
  );
};

export default ResponsiveImage;