/**
 * Utility functions for handling navigation with command-click support
 */

import { validateUrlScheme } from './securityUtils';

/**
 * Detects if a click event should open in a new tab
 * @param {MouseEvent} event - The click event
 * @returns {boolean} - True if should open in new tab (Ctrl/Cmd+click)
 */
export const shouldOpenInNewTab = (event) => {
  return !!(event?.ctrlKey || event?.metaKey); // Ctrl on Windows/Linux, Cmd on Mac
};

/**
 * Constructs a full URL from a relative path using the current base URL
 * @param {string} relativePath - The relative path (e.g., '/dashboard/user/repo')
 * @returns {string} - The full URL
 */
export const constructFullUrl = (relativePath) => {
  // Validate the relative path to prevent XSS
  if (!relativePath || typeof relativePath !== 'string') {
    return window.location.origin;
  }
  
  // Basic validation - don't allow dangerous protocols
  if (relativePath.includes('javascript:') || relativePath.includes('data:')) { // eslint-disable-line no-script-url
    console.warn('Blocked dangerous URL scheme in path:', relativePath);
    return window.location.origin;
  }
  
  const basePath = process.env.PUBLIC_URL || '';
  const baseUrl = window.location.origin;
  
  // Remove leading slash from relativePath if present to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  // Only add basePath if it's not empty
  if (!basePath) {
    return `${baseUrl}/${cleanPath}`;
  }
  
  // Ensure basePath ends with slash for proper joining
  const cleanBasePath = basePath.endsWith('/') ? basePath : basePath + '/';
  
  return `${baseUrl}${cleanBasePath}${cleanPath}`;
};

/**
 * Handles navigation with command-click support
 * @param {MouseEvent} event - The click event
 * @param {string} path - The navigation path
 * @param {Function} navigate - React Router navigate function
 * @param {Object} state - Optional state to pass with navigation
 */
export const handleNavigationClick = (event, path, navigate, state = null) => {
  // Validate the path to prevent malicious navigation
  if (!path || typeof path !== 'string') {
    console.warn('Invalid navigation path provided');
    return;
  }
  
  // For external URLs, validate the scheme
  if (path.includes('://')) {
    if (!validateUrlScheme(path)) {
      console.warn('Blocked navigation to potentially dangerous URL:', path);
      return;
    }
  }
  
  if (shouldOpenInNewTab(event)) {
    // Open in new tab
    const fullUrl = constructFullUrl(path);
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  } else {
    // Navigate in same tab
    if (state) {
      navigate(path, { state });
    } else {
      navigate(path);
    }
  }
};

/**
 * Creates a click handler that supports command-click for new tabs
 * @param {string} path - The navigation path
 * @param {Function} navigate - React Router navigate function
 * @param {Object} state - Optional state to pass with navigation
 * @returns {Function} - Click handler function
 */
export const createNavigationClickHandler = (path, navigate, state = null) => {
  return (event) => {
    handleNavigationClick(event, path, navigate, state);
  };
};