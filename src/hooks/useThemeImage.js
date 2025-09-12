import { useState, useEffect } from 'react';

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
      // Use window.location.origin + PUBLIC_URL for absolute paths
      const publicUrl = process.env.PUBLIC_URL || '';
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Normalize the base image path (remove leading slash if present)
      const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
      
      let finalPath;
      if (isDarkMode) {
        // Convert base image to dark mode version
        // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
        const darkImageName = normalizedPath.replace(/\.png$/, '_grey_tabby.png');
        if (publicUrl) {
          finalPath = `${origin}${publicUrl}/${darkImageName}`;
        } else {
          finalPath = `${origin}/${darkImageName}`;
        }
      } else {
        // Use original image for light mode
        if (publicUrl) {
          finalPath = `${origin}${publicUrl}/${normalizedPath}`;
        } else {
          finalPath = `${origin}/${normalizedPath}`;
        }
      }
      
      console.log('🖼️ useThemeImage: Updated image path', {
        baseImagePath,
        isDarkMode,
        publicUrl,
        origin,
        finalPath
      });
      
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