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
    return window.SGEX_ROUTES_CONFIG.getDAKComponentNames();
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

/**
 * Generate React Router Route objects for all DAK components
 * This creates the standard route patterns for each DAK component:
 * - /{component}
 * - /{component}/:user/:repo  
 * - /{component}/:user/:repo/:branch
 * - /{component}/:user/:repo/:branch/*
 * 
 * @param {Object} componentMap - Map of component names to React components
 * @returns {Array} Array of route objects for React Router
 */
export const generateDAKRoutes = (componentMap) => {
  const routes = [];
  
  // Get configuration 
  const config = (typeof window !== 'undefined' && window.SGEX_ROUTES_CONFIG) 
    ? window.SGEX_ROUTES_CONFIG 
    : null;
  
  if (!config) {
    console.warn('SGEX route configuration not available for dynamic route generation');
    return routes;
  }
  
  // Generate routes for each DAK component
  const componentNames = config.getDAKComponentNames();
  
  componentNames.forEach(componentName => {
    const reactComponentName = config.getReactComponent(componentName);
    const ReactComponent = componentMap[reactComponentName];
    
    if (!ReactComponent) {
      console.warn(`React component ${reactComponentName} not found for DAK component ${componentName}`);
      return;
    }
    
    // Generate the standard DAK route patterns
    routes.push(
      {
        path: `/${componentName}`,
        element: ReactComponent,
        key: `${componentName}-base`
      },
      {
        path: `/${componentName}/:user/:repo`,
        element: ReactComponent,
        key: `${componentName}-user-repo`
      },
      {
        path: `/${componentName}/:user/:repo/:branch`,
        element: ReactComponent,
        key: `${componentName}-user-repo-branch`
      },
      {
        path: `/${componentName}/:user/:repo/:branch/*`,
        element: ReactComponent,
        key: `${componentName}-user-repo-branch-asset`
      }
    );
  });
  
  return routes;
};