/**
 * Utility function to get the appropriate image path based on the current theme
 * This can be used outside React components
 * 
 * @module themeUtils
 */

/**
 * Get the appropriate image path based on the current theme
 * Converts base image paths to theme-specific variants
 * @param baseImagePath - The base image path (e.g., "sgex-mascot.png", "/sgex/cat-paw-icon.svg")
 * @returns The theme-appropriate image path
 * 
 * @example
 * // In dark mode:
 * getThemeImagePath("sgex-mascot.png"); // "sgex-mascot_grey_tabby.png"
 * getThemeImagePath("/sgex/cat-paw-icon.svg"); // "/sgex/cat-paw-icon_dark.svg"
 * 
 * // In light mode:
 * getThemeImagePath("sgex-mascot.png"); // "sgex-mascot.png"
 */
export const getThemeImagePath = (baseImagePath: string): string => {
  const isDarkMode = document.body.classList.contains('theme-dark');
  
  if (isDarkMode) {
    // Convert base image to dark mode version
    // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
    // e.g., "/sgex/cat-paw-icon.svg" -> "/sgex/cat-paw-icon_dark.svg"
    if (baseImagePath.endsWith('.svg')) {
      return baseImagePath.replace(/\.svg$/, '_dark.svg');
    } else if (baseImagePath.endsWith('.png')) {
      return baseImagePath.replace(/\.png$/, '_grey_tabby.png');
    }
  }
  
  // Return original path for light mode or unsupported file types
  return baseImagePath;
};

export default getThemeImagePath;
