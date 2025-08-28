/**
 * Utility functions for handling navigation with command-click support
 */
import { combineUrlParts, normalizePath } from './urlNormalizationUtils';

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
  const basePath = process.env.PUBLIC_URL || '';
  const baseUrl = window.location.origin;
  
  // Normalize the relative path first
  const normalizedPath = normalizePath(relativePath);
  
  // Use the new combineUrlParts utility for proper URL construction
  const fullPath = combineUrlParts(basePath, normalizedPath);
  
  return `${baseUrl}${fullPath}`;
};

/**
 * Handles navigation with command-click support and automatic URL normalization
 * @param {MouseEvent} event - The click event
 * @param {string} path - The navigation path
 * @param {Function} navigate - React Router navigate function
 * @param {Object} state - Optional state to pass with navigation
 */
export const handleNavigationClick = (event, path, navigate, state = null) => {
  // Normalize the path before navigation
  const normalizedPath = normalizePath(path);
  
  if (shouldOpenInNewTab(event)) {
    // Open in new tab
    const fullUrl = constructFullUrl(normalizedPath);
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  } else {
    // Navigate in same tab
    if (state) {
      navigate(normalizedPath, { state });
    } else {
      navigate(normalizedPath);
    }
  }
};

/**
 * Creates a click handler that supports command-click for new tabs with URL normalization
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