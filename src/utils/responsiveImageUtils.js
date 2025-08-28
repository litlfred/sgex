/**
 * Responsive image utilities for automatically selecting the appropriate image based on
 * screen size and theme. Supports mobile-optimized images for better performance.
 */

/**
 * Detect if the current screen is mobile-sized with optional aggressive threshold
 * @param {boolean} aggressive - Use more aggressive mobile detection (1024px instead of 768px)
 * @returns {boolean} True if screen width is mobile-sized
 */
export const isMobileScreen = (aggressive = false) => {
  const threshold = aggressive ? 1024 : 768;
  return window.innerWidth <= threshold;
};

/**
 * Get the appropriate image path based on theme and screen size
 * @param {string} baseImagePath - The base image path (e.g., "sgex-mascot.png")
 * @param {Object} options - Configuration options
 * @param {boolean} options.forceMobile - Force mobile version regardless of screen size
 * @param {boolean} options.forceDesktop - Force desktop version regardless of screen size
 * @param {boolean} options.aggressiveMobile - Use aggressive mobile detection (1024px threshold)
 * @returns {string} The appropriate image path
 */
export const getResponsiveImagePath = (baseImagePath, options = {}) => {
  const isDarkMode = document.body.classList.contains('theme-dark');
  const isMobile = options.forceMobile || (!options.forceDesktop && isMobileScreen(options.aggressiveMobile));
  
  // Get the correct base path for the deployment environment
  const publicUrl = process.env.PUBLIC_URL || '';
  
  // Normalize the base image path (remove leading slash if present)
  const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
  
  let imageName = normalizedPath;
  
  // Apply theme modification first
  if (isDarkMode) {
    // Convert base image to dark mode version
    // e.g., "sgex-mascot.png" -> "sgex-mascot_grey_tabby.png"
    imageName = imageName.replace(/\.png$/, '_grey_tabby.png');
  }
  
  // Apply mobile modification if needed
  if (isMobile) {
    // Convert to mobile version
    // e.g., "sgex-mascot.png" -> "sgex-mascot_mobile.png"
    // or "sgex-mascot_grey_tabby.png" -> "sgex-mascot_grey_tabby_mobile.png"
    imageName = imageName.replace(/\.png$/, '_mobile.png');
  }
  
  // Construct final path
  const finalPath = publicUrl ? `${publicUrl}/${imageName}` : `/${imageName}`;
  
  return finalPath;
};

/**
 * Create a picture element with responsive image sources
 * This enables browsers to automatically select the best image
 * @param {string} baseImagePath - The base image path
 * @param {string} alt - Alt text for the image
 * @param {Object} attributes - Additional attributes for the img element
 * @returns {string} HTML string for picture element
 */
export const createResponsivePictureHTML = (baseImagePath, alt = '', attributes = {}) => {
  const publicUrl = process.env.PUBLIC_URL || '';
  const normalizedPath = baseImagePath.startsWith('/') ? baseImagePath.slice(1) : baseImagePath;
  
  // Build all image variants
  const variants = {
    // Light theme
    desktopLight: publicUrl ? `${publicUrl}/${normalizedPath}` : `/${normalizedPath}`,
    mobileLight: publicUrl ? `${publicUrl}/${normalizedPath.replace(/\.png$/, '_mobile.png')}` : `/${normalizedPath.replace(/\.png$/, '_mobile.png')}`,
    // Dark theme
    desktopDark: publicUrl ? `${publicUrl}/${normalizedPath.replace(/\.png$/, '_grey_tabby.png')}` : `/${normalizedPath.replace(/\.png$/, '_grey_tabby.png')}`,
    mobileDark: publicUrl ? `${publicUrl}/${normalizedPath.replace(/\.png$/, '_grey_tabby_mobile.png')}` : `/${normalizedPath.replace(/\.png$/, '_grey_tabby_mobile.png')}`
  };
  
  const attrString = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  return `
    <picture>
      <!-- Dark theme sources -->
      <source media="(prefers-color-scheme: dark) and (max-width: 768px)" srcset="${variants.mobileDark}">
      <source media="(prefers-color-scheme: dark)" srcset="${variants.desktopDark}">
      <!-- Light theme sources -->
      <source media="(max-width: 768px)" srcset="${variants.mobileLight}">
      <!-- Default fallback -->
      <img src="${variants.desktopLight}" alt="${alt}" ${attrString}>
    </picture>
  `.trim();
};

/**
 * Preload responsive images for better performance
 * @param {string[]} imageUrls - Array of base image URLs to preload
 */
export const preloadResponsiveImages = (imageUrls) => {
  imageUrls.forEach(url => {
    // Preload both mobile and desktop versions
    const mobileUrl = getResponsiveImagePath(url, { forceMobile: true });
    const desktopUrl = getResponsiveImagePath(url, { forceDesktop: true });
    
    // Create link elements for preloading
    [mobileUrl, desktopUrl].forEach(imageUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      document.head.appendChild(link);
    });
  });
};

export default getResponsiveImagePath;