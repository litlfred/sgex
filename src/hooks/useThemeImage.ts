import { useState, useEffect } from 'react';

/**
 * Custom hook that returns the appropriate image path based on the current theme
 * 
 * @param baseImagePath - The base image path (e.g., "sgex-mascot.png", "authoring.png")
 * @returns The theme-appropriate image path
 * 
 * @example
 * const imagePath = useThemeImage('sgex-mascot.png');
 * // Light mode: "/sgex/sgex-mascot.png"
 * // Dark mode: "/sgex/sgex-mascot_grey_tabby.png"
 * 
 * @example
 * const iconPath = useThemeImage('cat-paw-icon.svg');
 * // Light mode: "/sgex/cat-paw-icon.svg"
 * // Dark mode: "/sgex/cat-paw-icon_dark.svg"
 */
const useThemeImage = (baseImagePath: string): string => {
  const [currentImagePath, setCurrentImagePath] = useState<string>(baseImagePath);

  useEffect(() => {
    const updateImagePath = (): void => {
      const isDarkMode = document.body.classList.contains('theme-dark');
      
      // Get the correct base path for the deployment environment
      const publicUrl = process.env.PUBLIC_URL || '';
      
      // Normalize the base image path (remove leading slash if present)
      const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
      
      let finalPath: string;
      if (isDarkMode) {
        // Convert base image to dark mode version
        // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
        // e.g., "cat-paw-icon.svg" -> "cat-paw-icon_dark.svg"
        let darkImageName: string;
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
