/**
 * Utility function to get the appropriate image path based on the current theme
 * This can be used outside React components
 * @param {string} baseImagePath - The base image path (e.g., "sgex-mascot.png", "cat-paw-icon.svg")
 * @returns {string} The theme-appropriate image path
 */
export const getThemeImagePath = (baseImagePath) => {
  const isDarkMode = document.body.classList.contains('theme-dark');
  
  // Get the correct base path for the deployment environment
  const publicUrl = process.env.PUBLIC_URL || '';
  
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
  
  return finalPath;
};

export default getThemeImagePath;