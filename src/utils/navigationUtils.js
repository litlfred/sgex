/**
 * Utility functions for handling navigation with command-click support
 */

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
 * Check if current location is the welcome page
 * @param {Object} location - React Router location object
 * @returns {boolean} - True if currently on welcome page
 */
export const isOnWelcomePage = (location) => {
  // Check if on root path (/) which is the welcome page in main deployment
  return location.pathname === '/' || location.pathname === '';
};

/**
 * Navigate to welcome page and focus PAT input, or just focus if already there
 * @param {Function} navigate - React Router navigate function
 * @param {Object} location - React Router location object
 * @param {Object} patTokenInputRef - Ref to PAT token input element (optional, for same-page focus)
 */
export const navigateToWelcomeWithFocus = (navigate, location, patTokenInputRef = null) => {
  if (isOnWelcomePage(location)) {
    // Already on welcome page, either focus directly or dispatch event
    if (patTokenInputRef?.current) {
      patTokenInputRef.current.focus();
    } else {
      // Dispatch custom event for WelcomePage to listen to
      window.dispatchEvent(new CustomEvent('focusPATInput'));
    }
  } else {
    // Navigate to welcome page with focus parameter
    navigate('/', {
      state: { focusPATInput: true }
    });
  }
};

/**
 * Handles navigation with command-click support
 * @param {MouseEvent} event - The click event
 * @param {string} path - The navigation path
 * @param {Function} navigate - React Router navigate function
 * @param {Object} state - Optional state to pass with navigation
 */
export const handleNavigationClick = (event, path, navigate, state = null) => {
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