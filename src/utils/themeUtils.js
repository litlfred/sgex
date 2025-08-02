/**
 * Utility function to get the appropriate image path based on the current theme
 * This can be used outside React components
 * @param {string} baseImagePath - The base image path (e.g., "/sgex-mascot.png")
 * @returns {string} The theme-appropriate image path
 */
export const getThemeImagePath = (baseImagePath) => {
  const isDarkMode = document.body.classList.contains('theme-dark');
  
  if (isDarkMode) {
    // Convert base image to dark mode version
    // e.g., "/sgex-mascot.png" -> "/sgex-mascot_grey_tabby.png"
    return baseImagePath.replace(/\.png$/, '_grey_tabby.png');
  } else {
    // Use original image for light mode
    return baseImagePath;
  }
};

export default getThemeImagePath;