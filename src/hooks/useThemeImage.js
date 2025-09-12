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
      // Always ensure we have a PUBLIC_URL for proper path resolution
      const publicUrl = process.env.PUBLIC_URL || '';
      
      // Normalize the base image path (remove leading slash if present)
      const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
      
      // IMPORTANT: Always use absolute paths to prevent relative path resolution issues
      // When the current URL is /dashboard/user/repo, relative paths would resolve incorrectly
      let finalPath;
      if (isDarkMode) {
        // Convert base image to dark mode version
        // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
        const darkImageName = normalizedPath.replace(/\.png$/, '_grey_tabby.png');
        // Force absolute path from root to prevent URL context issues
        finalPath = publicUrl ? `${publicUrl}/${darkImageName}` : `/${darkImageName}`;
      } else {
        // Use original image for light mode
        // Force absolute path from root to prevent URL context issues
        finalPath = publicUrl ? `${publicUrl}/${normalizedPath}` : `/${normalizedPath}`;
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