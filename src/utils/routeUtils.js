/**
 * Utility functions for extracting route information from React Router routes
 */

/**
 * Extract valid DAK component names from the shared route configuration
 * This function reads from the global SGEX route configuration that is shared
 * between App.js and 404.html to ensure consistency.
 * 
 * @returns {Array} Array of valid DAK component names
 */
export const extractDAKComponentsFromRoutes = () => {
  // In browser environment, try to get from global config first
  if (typeof window !== 'undefined' && window.SGEX_ROUTES_CONFIG) {
    return window.SGEX_ROUTES_CONFIG.dakComponents;
  }
  
  // Fallback for server-side rendering or if config not loaded
  // This should match the configuration in public/routes-config.js
  console.warn('SGEX route configuration not available, using fallback');
  return [
    'dashboard',                    
    'testing-viewer',              
    'core-data-dictionary-viewer', 
    'health-interventions',        
    'actor-editor',               
    'business-process-selection',  
    'bpmn-editor',                
    'bpmn-viewer',                
    'bpmn-source',                
    'decision-support-logic'       
  ];
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