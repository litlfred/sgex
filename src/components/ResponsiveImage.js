import React, { useState, useEffect } from 'react';
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
  const themeImagePath = useThemeImage(src);
  const [currentSrc, setCurrentSrc] = useState(themeImagePath);
  const [hasAttemptedMobile, setHasAttemptedMobile] = useState(false);
  
  // Auto-generate alt text if not provided
  const autoAlt = alt || extractAltTextFromFilename(src);
  
  // Function to attempt loading mobile version
  const tryMobileVersion = () => {
    if (hasAttemptedMobile) return;
    
    const isMobile = forceMobile || (!forceDesktop && window.innerWidth <= 768);
    if (!isMobile) return;

    const isDarkMode = document.body && document.body.classList.contains('theme-dark');
    const publicUrl = process.env.PUBLIC_URL || '';
    const normalizedPath = src.startsWith('/') ? src.slice(1) : src;
    
    let imageName = normalizedPath;
    
    // Apply theme modification first
    if (isDarkMode) {
      imageName = imageName.replace(/\.png$/, '_grey_tabby.png');
    }
    
    // Apply mobile modification
    const mobileImageName = imageName.replace(/\.png$/, '_mobile.png');
    const mobilePath = publicUrl ? `${publicUrl}/${mobileImageName}` : `/${mobileImageName}`;
    
    // Test if mobile image exists by attempting to load it
    const testImg = new Image();
    testImg.onload = () => {
      setCurrentSrc(mobilePath);
    };
    testImg.onerror = () => {
      // Mobile image doesn't exist, keep using theme image
      console.log(`Mobile image not found: ${mobilePath}, using theme image: ${themeImagePath}`);
    };
    testImg.src = mobilePath;
    setHasAttemptedMobile(true);
  };

  // Update image source based on screen size and theme
  useEffect(() => {
    // Always start with theme image
    setCurrentSrc(themeImagePath);
    setHasAttemptedMobile(false);
    
    // After a brief delay, try mobile version if applicable
    const timer = setTimeout(() => {
      tryMobileVersion();
    }, 100);

    return () => clearTimeout(timer);
  }, [src, themeImagePath, forceMobile, forceDesktop]);

  useEffect(() => {
    // Listen for window resize events
    const handleResize = () => {
      setHasAttemptedMobile(false);
      tryMobileVersion();
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
  }, []);

  // Handle image load errors by falling back to original or provided fallback
  const handleError = (e) => {
    if (fallbackSrc && e.target.src !== fallbackSrc) {
      e.target.src = fallbackSrc;
    } else if (e.target.src !== themeImagePath) {
      // If responsive image fails, try theme-aware image
      e.target.src = themeImagePath;
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