/**
 * Utility function to get the appropriate image path based on the current theme
 * This can be used outside React components
 */

/**
 * Get the theme-appropriate image path
 * @param baseImagePath - The base image path (e.g., "sgex-mascot.png")
 * @returns The theme-appropriate image path
 */
export const getThemeImagePath = (baseImagePath: string): string => {
  const isDarkMode = document.body.classList.contains('theme-dark');
  
  // Get the correct base path for the deployment environment
  const publicUrl = process.env.PUBLIC_URL || '';
  
  // Normalize the base image path (remove leading slash if present)
  const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
  
  let finalPath: string;
  if (isDarkMode) {
    // Convert base image to dark mode version
    // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
    const darkImageName = normalizedPath.replace(/\.png$/, '_grey_tabby.png');
    finalPath = publicUrl ? `${publicUrl}/${darkImageName}` : `/${darkImageName}`;
  } else {
    // Use original image for light mode
    finalPath = publicUrl ? `${publicUrl}/${normalizedPath}` : `/${normalizedPath}`;
  }
  
  return finalPath;
};

export default getThemeImagePath;