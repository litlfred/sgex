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
  const baseUrl = window.location.origin;
  const currentPath = window.location.pathname;
  
  // Remove leading slash from relativePath if present to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  // Detect if we're in a branch deployment context
  // Look for pattern: /sgex/branch-name/component/... where branch-name is likely a git branch
  // Common git branch patterns: feature/, hotfix/, develop, branch names with dashes, etc.
  // Exclude known component names that might appear in this position
  const knownComponents = ['dashboard', 'docs', 'welcome', 'landing', 'test-', 'actor-', 'bpmn-', 'decision-support-', 'questionnaire-', 'core-data-', 'testing-', 'business-process-', 'publications-'];
  
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  // Check if we have the pattern: ['sgex', 'potential-branch', 'component', ...]
  if (pathSegments.length >= 3 && pathSegments[0] === 'sgex') {
    const potentialBranch = pathSegments[1];
    const potentialComponent = pathSegments[2];
    
    // If the second segment looks like a branch name and the third segment looks like a component
    // or if the second segment contains branch-like patterns (dashes, dots, etc.)
    const isLikelyBranch = 
      potentialBranch.includes('-') ||
      potentialBranch.includes('.') ||
      potentialBranch.includes('_') ||
      potentialBranch.startsWith('feature') ||
      potentialBranch.startsWith('hotfix') ||
      potentialBranch.startsWith('copilot') ||
      potentialBranch === 'develop' ||
      potentialBranch === 'staging';
    
    const isKnownComponent = knownComponents.some(comp => potentialComponent?.startsWith(comp));
    
    if (isLikelyBranch && (isKnownComponent || potentialComponent)) {
      return `${baseUrl}/sgex/${potentialBranch}/${cleanPath}`;
    }
  }
  
  // Default behavior for main deployment (use PUBLIC_URL if available)
  const basePath = process.env.PUBLIC_URL || '';
  
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