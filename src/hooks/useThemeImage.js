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
      // For branch deployments, extract the base path from current URL
      let publicUrl = process.env.PUBLIC_URL || '';
      
      // If we're in a branch deployment (URL contains branch path), use dynamic path
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        // Match pattern like /sgex/branch-name/ or /sgex/copilot-branch-name/
        const branchMatch = pathname.match(/^(\/sgex\/[^/]+)/);
        if (branchMatch) {
          publicUrl = branchMatch[1];
        } else if (pathname.startsWith('/sgex')) {
          publicUrl = '/sgex';
        }
      }
      
      // Normalize the base image path (remove leading slash if present)
      const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
      
      let finalPath;
      if (isDarkMode) {
        // Convert base image to dark mode version
        // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
        // e.g., "cat-paw-icon.svg" -> "cat-paw-icon_dark.svg"
        let darkImageName;
        if (normalizedPath.endsWith('.svg')) {
          darkImageName = normalizedPath.replace(/\.svg$/, '_dark.svg');
        } else {
          darkImageName = normalizedPath.replace(/\.png$/, '_grey_tabby.png');
        }
        finalPath = publicUrl ? `${publicUrl}/${darkImageName}` : `/${darkImageName}`;
      } else {
        // Use original image for light mode
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