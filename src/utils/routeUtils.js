/**
 * Utility functions for extracting route information from React Router routes
 */

/**
 * Extract valid DAK component names from the route patterns used in the application
 * This function analyzes the route patterns to identify DAK components that follow
 * the pattern: /{component}/:user/:repo/:branch?/*?
 * 
 * These are extracted from App.js routes that have user/repo/branch parameters
 * @returns {Array} Array of valid DAK component names
 */
export const extractDAKComponentsFromRoutes = () => {
  // Extract DAK components from the well-known route patterns in App.js
  // These correspond to routes that follow the pattern: /{component}/:user/:repo/:branch?/*?
  // 
  // Looking at App.js, these are the routes with :user/:repo/:branch patterns:
  const dakComponents = [
    'dashboard',                    // /dashboard/:user/:repo/:branch
    'testing-viewer',              // /testing-viewer/:user/:repo/:branch/*
    'core-data-dictionary-viewer', // /core-data-dictionary-viewer/:user/:repo/:branch/*
    'health-interventions',        // /health-interventions/:user/:repo/:branch/*
    'actor-editor',               // /actor-editor/:user/:repo/:branch/*
    'business-process-selection',  // /business-process-selection/:user/:repo/:branch
    'bpmn-editor',                // /bpmn-editor/:user/:repo/:branch/*
    'bpmn-viewer',                // /bpmn-viewer/:user/:repo/:branch/*
    'bpmn-source',                // /bpmn-source/:user/:repo/:branch/*
    'decision-support-logic'       // /decision-support-logic/:user/:repo/:branch/*
  ];
  
  return dakComponents;
};

/**
 * Check if a given component name is a valid DAK component
 * @param {string} component - Component name to validate
 * @returns {boolean} True if component is valid DAK component
 */
export const isValidDAKComponent = (component) => {
  const validComponents = extractDAKComponentsFromRoutes();
  return validComponents.includes(component);
};

/**
 * Parse a URL path to extract DAK component information
 * @param {string} pathname - URL pathname to parse
 * @returns {Object|null} Parsed DAK URL info or null if not a valid DAK URL
 */
export const parseDAKUrl = (pathname) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  // Valid DAK component routes have at least 3 segments: [component, user, repo]
  if (pathSegments.length >= 3) {
    const [component, user, repo, branch, ...assetPath] = pathSegments;
    
    if (isValidDAKComponent(component) && user && repo) {
      return {
        component,
        user,
        repo,
        branch,
        assetPath,
        isValid: true
      };
    }
  }
  
  return null;
};