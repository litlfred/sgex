import { useState, useEffect } from 'react';

/**
 * Custom hook that returns the appropriate image path based on the current theme and screen size
 * @param {string} baseImagePath - The base image path (e.g., "sgex-mascot.png", "authoring.png")
 * @returns {string} The theme-appropriate and size-appropriate image path
 */
const useThemeImage = (baseImagePath) => {
  const [currentImagePath, setCurrentImagePath] = useState(baseImagePath);

  useEffect(() => {
    const updateImagePath = () => {
      const isDarkMode = document.body.classList.contains('theme-dark');
      
      // Determine screen size for appropriate scaled image
      const screenWidth = window.innerWidth;
      let sizeVariant = '';
      
      // Use mobile version for screens under 768px, desktop version for larger
      if (screenWidth < 768) {
        sizeVariant = '_300';
      } else {
        sizeVariant = '_600';
      }
      
      // Get the correct base path for the deployment environment
      const publicUrl = process.env.PUBLIC_URL || '';
      
      // Normalize the base image path (remove leading slash if present)
      const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
      
      let finalPath;
      if (isDarkMode) {
        // Convert base image to dark mode version with size variant
        // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby_600.png"
        // e.g., "cat-paw-icon.svg" -> "cat-paw-icon_dark.svg" (SVGs don't need scaling)
        let darkImageName;
        if (normalizedPath.endsWith('.svg')) {
          darkImageName = normalizedPath.replace(/\.svg$/, '_dark.svg');
        } else {
          darkImageName = normalizedPath.replace(/\.png$/, `_grey_tabby${sizeVariant}.png`);
        }
        finalPath = publicUrl ? `${publicUrl}/${darkImageName}` : `/${darkImageName}`;
      } else {
        // Use scaled image for light mode
        if (normalizedPath.endsWith('.svg')) {
          // SVGs don't need scaling
          finalPath = publicUrl ? `${publicUrl}/${normalizedPath}` : `/${normalizedPath}`;
        } else {
          // Use scaled PNG version
          const scaledImageName = normalizedPath.replace(/\.png$/, `${sizeVariant}.png`);
          finalPath = publicUrl ? `${publicUrl}/${scaledImageName}` : `/${scaledImageName}`;
        }
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

    // Add resize listener to update image on screen size change
    const handleResize = () => {
      updateImagePath();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup observer and resize listener on unmount
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [baseImagePath]);

  return currentImagePath;
};

export default useThemeImage;