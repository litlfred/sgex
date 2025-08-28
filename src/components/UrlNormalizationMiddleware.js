import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { normalizePath, pathNeedsNormalization, logUrlNormalization } from '../utils/urlNormalizationUtils';

/**
 * URL Normalization Middleware for React Router
 * 
 * This component automatically detects and fixes URLs with repeated slashes
 * by redirecting to the normalized version. It should be placed high in the
 * component tree to catch and fix malformed URLs before they reach other components.
 * 
 * Features:
 * - Automatically detects URLs with repeated slashes
 * - Redirects to normalized URLs (e.g., "/dashboard//user///repo" → "/dashboard/user/repo")
 * - Preserves query parameters and hash fragments
 * - Maintains browser history properly
 * - Logs normalization actions in development mode
 * - Minimal performance impact (only activates when needed)
 */
const UrlNormalizationMiddleware = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if the current path needs normalization
    if (pathNeedsNormalization(currentPath)) {
      const normalizedPath = normalizePath(currentPath);
      
      // Log the normalization in development
      logUrlNormalization('Router Middleware', currentPath, normalizedPath);
      
      // Construct the full normalized URL with search params and hash
      let fullNormalizedUrl = normalizedPath;
      
      if (location.search) {
        fullNormalizedUrl += location.search;
      }
      
      if (location.hash) {
        fullNormalizedUrl += location.hash;
      }
      
      // Replace the current URL with the normalized version
      // Using replace() instead of navigate() to avoid adding to history
      navigate(fullNormalizedUrl, { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

  // Render children normally - normalization happens in the background
  return children;
};

/**
 * Hook that provides a navigate function that automatically normalizes paths
 * This can be used in components that need guaranteed URL normalization
 */
export const useNormalizedNavigate = () => {
  const navigate = useNavigate();
  
  return (path, options = {}) => {
    const normalizedPath = normalizePath(path);
    
    // Log normalization if the path changed
    if (normalizedPath !== path) {
      logUrlNormalization('useNormalizedNavigate', path, normalizedPath);
    }
    
    return navigate(normalizedPath, options);
  };
};

/**
 * Higher-order component that ensures URLs are normalized before rendering
 * This can wrap individual route components for extra protection
 */
export const withUrlNormalization = (WrappedComponent) => {
  return function NormalizedRouteComponent(props) {
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
      const currentPath = location.pathname;
      
      if (pathNeedsNormalization(currentPath)) {
        const normalizedPath = normalizePath(currentPath);
        logUrlNormalization('HOC Wrapper', currentPath, normalizedPath);
        
        // Redirect to normalized URL
        navigate(normalizedPath + (location.search || '') + (location.hash || ''), 
                { replace: true });
        return;
      }
    }, [location.pathname, location.search, location.hash, navigate]);
    
    // Only render the wrapped component if the URL is already normalized
    if (pathNeedsNormalization(location.pathname)) {
      return (
        <div className="url-normalizing">
          <p>Normalizing URL...</p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
};

/**
 * Component that can be used in route definitions to catch malformed URLs
 * This is useful for specific routes that are particularly susceptible to URL issues
 */
export const NormalizedRoute = ({ component: Component, ...props }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (pathNeedsNormalization(currentPath)) {
      const normalizedPath = normalizePath(currentPath);
      logUrlNormalization('NormalizedRoute', currentPath, normalizedPath);
      
      navigate(normalizedPath + (location.search || '') + (location.hash || ''), 
              { replace: true });
    }
  }, [location, navigate]);
  
  // Show loading state while normalizing
  if (pathNeedsNormalization(location.pathname)) {
    return (
      <div className="route-normalizing">
        <div className="loading-spinner"></div>
        <p>Correcting URL format...</p>
      </div>
    );
  }
  
  return <Component {...props} />;
};

export default UrlNormalizationMiddleware;