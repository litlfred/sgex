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
      
      // Detect the deployment root path from the current URL
      // For main deployment: /sgex/
      // For branch deployment: /sgex/branch-name/
      let deploymentRoot = '/sgex/';
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/sgex/') && currentPath !== '/sgex/') {
        const pathParts = currentPath.split('/');
        if (pathParts.length >= 3 && pathParts[1] === 'sgex') {
          // Check if this might be a branch deployment by looking for a third segment
          // that's not a typical route like 'dashboard', 'welcome', etc.
          const possibleBranch = pathParts[2];
          const typicalRoutes = ['dashboard', 'welcome', 'docs', 'business-process-selection', 'decision-support-logic'];
          if (possibleBranch && !typicalRoutes.includes(possibleBranch)) {
            deploymentRoot = `/sgex/${possibleBranch}/`;
          }
        }
      }
      
      // Normalize the base image path (remove leading slash if present)
      const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
      
      // Always use absolute paths to prevent relative path resolution issues
      let finalPath;
      if (isDarkMode) {
        // Convert base image to dark mode version
        // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
        const darkImageName = normalizedPath.replace(/\.png$/, '_grey_tabby.png');
        finalPath = deploymentRoot + darkImageName;
      } else {
        // Use original image for light mode
        finalPath = deploymentRoot + normalizedPath;
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