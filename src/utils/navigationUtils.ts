/**
 * Utility functions for handling navigation with command-click support
 */

/**
 * React Router location object type
 */
export interface Location {
  pathname: string;
  search?: string;
  hash?: string;
  state?: any;
}

/**
 * Detects if a click event should open in a new tab
 * @param event - The click event
 * @returns True if should open in new tab (Ctrl/Cmd+click)
 */
export const shouldOpenInNewTab = (event: MouseEvent): boolean => {
  return !!(event?.ctrlKey || event?.metaKey); // Ctrl on Windows/Linux, Cmd on Mac
};

/**
 * Constructs a full URL from a relative path using the current base URL
 * @param relativePath - The relative path (e.g., '/dashboard/user/repo')
 * @returns The full URL
 */
export const constructFullUrl = (relativePath: string): string => {
  const basePath = (process.env as any).PUBLIC_URL || '';
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
 * @param location - React Router location object
 * @returns True if currently on welcome page
 */
export const isOnWelcomePage = (location: Location): boolean => {
  // Check if on root path (/) which is the welcome page in main deployment
  return location.pathname === '/' || location.pathname === '';
};

/**
 * Navigate to welcome page and focus PAT input, or just focus if already there
 * @param navigate - React Router navigate function
 * @param location - React Router location object
 * @param patTokenInputRef - Ref to PAT token input element (optional, for same-page focus)
 */
export const navigateToWelcomeWithFocus = (
  navigate: NavigateFunction, 
  location: Location, 
  patTokenInputRef: React.RefObject<HTMLInputElement> | null = null
): void => {
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
 * Navigation function type from React Router
 */
export type NavigateFunction = (to: string, options?: { state?: any }) => void;

/**
 * Handles navigation with command-click support
 * @param event - The click event
 * @param path - The navigation path
 * @param navigate - React Router navigate function
 * @param state - Optional state to pass with navigation
 */
export const handleNavigationClick = (
  event: MouseEvent, 
  path: string, 
  navigate: NavigateFunction, 
  state: any = null
): void => {
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
 * Click handler function type
 */
export type ClickHandler = (event: MouseEvent) => void;

/**
 * Creates a click handler that supports command-click for new tabs
 * @param path - The navigation path
 * @param navigate - React Router navigate function
 * @param state - Optional state to pass with navigation
 * @returns Click handler function
 */
export const createNavigationClickHandler = (
  path: string, 
  navigate: NavigateFunction, 
  state: any = null
): ClickHandler => {
  return (event: MouseEvent) => {
    handleNavigationClick(event, path, navigate, state);
  };
};