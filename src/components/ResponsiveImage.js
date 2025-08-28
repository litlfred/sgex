import React, { useState, useEffect, useCallback } from 'react';
import useThemeImage from '../hooks/useThemeImage';
import { extractAltTextFromFilename } from '../utils/imageAltTextHelper';

/**
 * Responsive Image component that automatically selects the best image
 * based on screen size and theme with graceful fallback handling.
 * Shows alt text while loading and waits for full image load before display.
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
  aggressiveMobile = false, // Force mobile for action cards/buttons
  ...otherProps
}) => {
  // Auto-generate alt text if not provided
  const autoAlt = alt || extractAltTextFromFilename(src);
  
  // Track loading state
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Function to get the appropriate image path with aggressive mobile option
  const getResponsiveImagePath = useCallback(() => {
    // Use more aggressive mobile detection for action cards/buttons
    const mobileThreshold = aggressiveMobile ? 1024 : 768;
    const isMobile = forceMobile || (!forceDesktop && window.innerWidth <= mobileThreshold);
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
  }, [src, forceMobile, forceDesktop, aggressiveMobile]);

  const themeImagePath = useThemeImage(src);
  const [currentSrc, setCurrentSrc] = useState(() => getResponsiveImagePath());
  
  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(getResponsiveImagePath());
  }, [getResponsiveImagePath]);

  useEffect(() => {
    // Listen for window resize events
    const handleResize = () => {
      setIsLoading(true);
      setHasError(false);
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
      setIsLoading(true);
      setHasError(false);
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
    setHasError(true);
    setIsLoading(false);
    
    // If the responsive image fails, fall back to theme-aware image
    if (e.target.src !== themeImagePath) {
      console.log(`Responsive image failed: ${e.target.src}, falling back to theme image: ${themeImagePath}`);
      e.target.src = themeImagePath;
      setIsLoading(true); // Start loading again for fallback
    } else if (fallbackSrc && e.target.src !== fallbackSrc) {
      // If theme image also fails, try fallback
      e.target.src = fallbackSrc;
      setIsLoading(true); // Start loading again for fallback
    }
    
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    
    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <div className={`responsive-image-container ${className}`} style={style}>
      {/* Show alt text while loading or on error */}
      {(isLoading || hasError) && (
        <div className="responsive-image-alt-text" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
          minHeight: '40px',
          width: '100%'
        }}>
          {isLoading ? `Loading: ${autoAlt}` : autoAlt}
        </div>
      )}
      
      {/* Image element - hidden until loaded */}
      <img
        src={currentSrc}
        alt={autoAlt}
        className="responsive-image"
        style={{ 
          display: (isLoading || hasError) ? 'none' : 'block',
          width: '100%',
          height: 'auto'
        }}
        onLoad={handleLoad}
        onError={handleError}
        {...otherProps}
      />
    </div>
  );
};

export default ResponsiveImage;