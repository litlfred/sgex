import { useState, useEffect } from 'react';
import { combineUrlParts } from '../utils/urlNormalizationUtils';

/**
 * Custom hook that returns the appropriate image path based on the current theme
 * @param {string} baseImagePath - The base image path (e.g., "sgex-mascot.png", "authoring.png")
 * @returns {string} The theme-appropriate image path
 */
const useThemeImage = (baseImagePath) => {
  const [currentImagePath, setCurrentImagePath] = useState(baseImagePath);

  useEffect(() => {
    const updateImagePath = () => {
      const isDarkMode = document.body.classList.contains('theme-dark');
      
      // Get the correct base path for the deployment environment
      const publicUrl = process.env.PUBLIC_URL || '';
      
      // Normalize the base image path (remove leading slash if present)
      const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
      
      let finalPath;
      if (isDarkMode) {
        // Convert base image to dark mode version
        // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
        const darkImageName = normalizedPath.replace(/\.png$/, '_grey_tabby.png');
        finalPath = combineUrlParts(publicUrl, darkImageName);
      } else {
        // Use original image for light mode
        finalPath = combineUrlParts(publicUrl, normalizedPath);
      }
      
      // Debug logging for deployment troubleshooting
      if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('github.io')) {
        console.log(`useThemeImage [${baseImagePath}]: dark=${isDarkMode}, path="${finalPath}"`);
      }
      
      setCurrentImagePath(finalPath);
    };

    // Initial update
    updateImagePath();

    // Create a MutationObserver to watch for body class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateImagePath();
        }
      });
    });

    // Start observing the body for class changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [baseImagePath]);

  return currentImagePath;
};

export default useThemeImage;