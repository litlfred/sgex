/**
 * Utility function to get the appropriate image path based on the current theme
 * This can be used outside React components
 * 
 * @module themeUtils
 */

/**
 * Get the appropriate image path based on the current theme
 * Converts base image paths to theme-specific variants with correct deployment base path
 * @param baseImagePath - The base image path (e.g., "sgex-mascot.png", "cat-paw-icon.svg")
 * @returns The theme-appropriate image path with correct base URL
 * 
 * @example
 * // In dark mode:
 * getThemeImagePath("sgex-mascot.png"); // "/sgex/sgex-mascot_grey_tabby.png" or "/sgex/branch-name/sgex-mascot_grey_tabby.png"
 * getThemeImagePath("cat-paw-icon.svg"); // "/sgex/cat-paw-icon_dark.svg" or "/sgex/branch-name/cat-paw-icon_dark.svg"
 * 
 * // In light mode:
 * getThemeImagePath("sgex-mascot.png"); // "/sgex/sgex-mascot.png" or "/sgex/branch-name/sgex-mascot.png"
 */
export const getThemeImagePath = (baseImagePath: string): string => {
  const isDarkMode = document.body.classList.contains('theme-dark');
  
  // Get the correct base path for the deployment environment
  // For branch deployments, extract the base path from current URL
  let publicUrl = '/sgex';
  
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    // Match pattern like /sgex/branch-name/ or /sgex/copilot-branch-name/
    const branchMatch = pathname.match(/^(\/sgex\/[^/]+)/);
    if (branchMatch) {
      publicUrl = branchMatch[1];
    }
  }
  
  // Normalize the base image path (remove leading slash if present)
  const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
  
  let imagePath = normalizedPath;
  
  if (isDarkMode) {
    // Convert base image to dark mode version
    // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
    // e.g., "cat-paw-icon.svg" -> "cat-paw-icon_dark.svg"
    if (imagePath.endsWith('.svg')) {
      imagePath = imagePath.replace(/\.svg$/, '_dark.svg');
    } else if (imagePath.endsWith('.png')) {
      imagePath = imagePath.replace(/\.png$/, '_grey_tabby.png');
    }
  }
  
  // Return full path with base URL
  return `${publicUrl}/${imagePath}`;
};

export default getThemeImagePath;
