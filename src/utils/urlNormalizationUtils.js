/**
 * URL Normalization Utilities for SGEX Workbench
 * 
 * This utility provides comprehensive URL normalization to handle repeated slashes,
 * clean up malformed URLs, and ensure consistent routing behavior across the application.
 * 
 * Features:
 * 1. Remove repeated slashes from URLs (e.g., "///" becomes "/")
 * 2. Preserve protocol slashes in absolute URLs
 * 3. Handle edge cases in path construction
 * 4. Normalize DAK component URLs
 * 5. Integration with React Router for automatic normalization
 */

/**
 * Normalizes a URL path by removing repeated slashes while preserving important structure
 * @param {string} path - The URL path to normalize
 * @param {boolean} preserveTrailingSlash - Whether to preserve trailing slashes (default: false)
 * @returns {string} The normalized path
 */
export function normalizePath(path, preserveTrailingSlash = false) {
  if (!path || typeof path !== 'string') {
    return '/';
  }

  // Handle absolute URLs with protocols
  if (path.includes('://')) {
    const [protocol, ...rest] = path.split('://');
    const restPath = rest.join('://');
    return `${protocol}://${normalizePath(restPath, preserveTrailingSlash)}`;
  }

  // Remove repeated slashes, but keep the leading slash if it exists
  const hasLeadingSlash = path.startsWith('/');
  const hasTrailingSlash = path.endsWith('/') && path.length > 1;
  
  // Split by slash, filter out empty segments, then rejoin
  const segments = path.split('/').filter(segment => segment.length > 0);
  let normalizedPath = segments.join('/');
  
  // Restore leading slash if it was originally there
  if (hasLeadingSlash || normalizedPath.length === 0) {
    normalizedPath = '/' + normalizedPath;
  }
  
  // Restore trailing slash if preserveTrailingSlash is true and it was originally there
  if (preserveTrailingSlash && hasTrailingSlash && normalizedPath !== '/') {
    normalizedPath += '/';
  }
  
  return normalizedPath;
}

/**
 * Normalizes a full URL by cleaning up the path portion
 * @param {string} url - The full URL to normalize
 * @returns {string} The normalized URL
 */
export function normalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  try {
    const urlObj = new URL(url);
    urlObj.pathname = normalizePath(urlObj.pathname);
    return urlObj.toString();
  } catch (error) {
    // If it's not a valid absolute URL, treat it as a path
    return normalizePath(url);
  }
}

/**
 * Normalizes PUBLIC_URL and path combination to prevent double slashes
 * @param {string} publicUrl - The PUBLIC_URL environment variable
 * @param {string} path - The path to append
 * @returns {string} The properly combined URL
 */
export function combineUrlParts(publicUrl, path) {
  if (!publicUrl) {
    return normalizePath(path);
  }
  
  if (!path) {
    return normalizePath(publicUrl);
  }
  
  // Normalize both parts individually
  const normalizedPublicUrl = normalizePath(publicUrl);
  const normalizedPath = normalizePath(path);
  
  // Remove leading slash from path to avoid double slashes
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
  
  // Combine with proper slash handling
  if (normalizedPublicUrl.endsWith('/')) {
    return normalizedPublicUrl + cleanPath;
  } else {
    return normalizedPublicUrl + '/' + cleanPath;
  }
}

/**
 * Validates and normalizes DAK component URLs
 * @param {string} path - The DAK component path to normalize
 * @returns {Object} Object with { normalizedPath, isValid, components }
 */
export function normalizeDAKPath(path) {
  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split('/').filter(Boolean);
  
  // DAK paths should have at least 3 segments: [component, user, repo]
  if (segments.length < 3) {
    return {
      normalizedPath,
      isValid: false,
      components: {}
    };
  }
  
  const [component, user, repo, branch, ...assetPath] = segments;
  
  return {
    normalizedPath,
    isValid: !!(component && user && repo),
    components: {
      component,
      user,
      repo,
      branch,
      assetPath: assetPath.length > 0 ? assetPath.join('/') : null
    }
  };
}

/**
 * Creates a React Router wrapper that automatically normalizes paths
 * @param {Function} navigate - React Router navigate function
 * @returns {Function} Enhanced navigate function that normalizes paths
 */
export function createNormalizedNavigate(navigate) {
  return (path, options = {}) => {
    const normalizedPath = normalizePath(path);
    
    // Only redirect if the path actually changed
    if (normalizedPath !== path) {
      console.log(`URL normalization: ${path} → ${normalizedPath}`);
    }
    
    return navigate(normalizedPath, options);
  };
}

/**
 * React Router location normalizer that can be used as a wrapper
 * @param {Object} location - React Router location object
 * @returns {Object} Normalized location object
 */
export function normalizeLocation(location) {
  if (!location || !location.pathname) {
    return location;
  }
  
  const normalizedPathname = normalizePath(location.pathname);
  
  // Return a new location object with normalized pathname
  return {
    ...location,
    pathname: normalizedPathname
  };
}

/**
 * Higher-order component that provides URL normalization to React Router
 * This can be used to wrap components that need automatic URL normalization
 */
export function withUrlNormalization(WrappedComponent) {
  return function NormalizedComponent(props) {
    const navigate = props.navigate;
    
    if (navigate) {
      const normalizedNavigate = createNormalizedNavigate(navigate);
      return <WrappedComponent {...props} navigate={normalizedNavigate} />;
    }
    
    return <WrappedComponent {...props} />;
  };
}

/**
 * Custom hook that provides normalized navigation
 * @returns {Function} Normalized navigate function
 */
export function useNormalizedNavigation() {
  const { useNavigate } = require('react-router-dom');
  const navigate = useNavigate();
  return createNormalizedNavigate(navigate);
}

/**
 * Middleware function that can be used to normalize URLs in Express-like environments
 * @param {Object} req - Request object
 * @param {Object} res - Response object  
 * @param {Function} next - Next middleware function
 */
export function urlNormalizationMiddleware(req, res, next) {
  if (req.url) {
    const originalUrl = req.url;
    const normalizedUrl = normalizePath(originalUrl);
    
    if (normalizedUrl !== originalUrl) {
      console.log(`Server URL normalization: ${originalUrl} → ${normalizedUrl}`);
      
      // In a real server environment, you might want to redirect here
      // For client-side routing, we just log the normalization
      req.url = normalizedUrl;
    }
  }
  
  if (next) next();
}

/**
 * Utility to check if a path needs normalization
 * @param {string} path - The path to check
 * @returns {boolean} True if the path has repeated slashes
 */
export function pathNeedsNormalization(path) {
  if (!path || typeof path !== 'string') {
    return false;
  }
  
  // Check for repeated slashes (but allow protocol slashes)
  return /[^:]\/\/+/.test(path);
}

/**
 * Development helper to log URL normalization issues
 * @param {string} context - Context where the normalization is happening
 * @param {string} original - Original URL
 * @param {string} normalized - Normalized URL
 */
export function logUrlNormalization(context, original, normalized) {
  if (process.env.NODE_ENV === 'development' && original !== normalized) {
    console.log(`🔧 URL Normalization [${context}]: "${original}" → "${normalized}"`);
  }
}

/**
 * Batch normalize multiple URLs at once
 * @param {Array<string>} urls - Array of URLs to normalize
 * @returns {Array<string>} Array of normalized URLs
 */
export function normalizeUrls(urls) {
  if (!Array.isArray(urls)) {
    return [];
  }
  
  return urls.map(url => normalizePath(url));
}

/**
 * Configuration object for URL normalization behavior
 */
export const URL_NORMALIZATION_CONFIG = {
  // Whether to preserve trailing slashes in normalized URLs
  preserveTrailingSlash: false,
  
  // Whether to log normalization operations in development
  enableLogging: process.env.NODE_ENV === 'development',
  
  // Whether to automatically redirect malformed URLs
  autoRedirect: true,
  
  // Paths that should be excluded from normalization
  excludePaths: [
    '/api',  // API endpoints might have specific requirements
    '/static', // Static file paths
  ]
};

/**
 * Main export object with all normalization utilities
 */
const UrlNormalizationUtils = {
  normalizePath,
  normalizeUrl,
  combineUrlParts,
  normalizeDAKPath,
  createNormalizedNavigate,
  normalizeLocation,
  withUrlNormalization,
  useNormalizedNavigation,
  urlNormalizationMiddleware,
  pathNeedsNormalization,
  logUrlNormalization,
  normalizeUrls,
  URL_NORMALIZATION_CONFIG
};

export default UrlNormalizationUtils;