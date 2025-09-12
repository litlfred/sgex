/**
 * SGEX URL Processing Service
 * 
 * Handles URL parameter extraction, context restoration, and routing coordination
 * between the 404.html GitHub Pages handler and the React application.
 * 
 * Features:
 * - Extract routing parameters from URLs
 * - Restore context from session storage
 * - Preserve query parameters and URL fragments
 * - Support all deployment scenarios
 * - Handle direct URL entry and navigation
 */

class SGEXURLProcessor {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the URL processor and extract routing information
   * Call this early in the React app lifecycle
   */
  initialize() {
    if (this.initialized) return;
    
    try {
      this.processCurrentURL();
      this.restoreContextFromSession();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing SGEX URL processor:', error);
    }
  }

  /**
   * Process the current URL and extract routing parameters
   */
  processCurrentURL() {
    const location = window.location;
    const urlParams = new URLSearchParams(location.search);
    
    // Check if this is a routed URL from 404.html
    const routePath = urlParams.get('/');
    
    if (routePath) {
      // URL was processed by 404.html, extract the route
      const decodedRoute = decodeURIComponent(routePath);
      this.extractRouteComponents(decodedRoute);
      
      // Update browser URL to clean route without query parameters
      const cleanURL = this.buildCleanURL(decodedRoute, location);
      if (cleanURL !== location.href) {
        window.history.replaceState(null, '', cleanURL);
      }
    } else {
      // Direct navigation or clean URL, extract from pathname
      const pathname = location.pathname;
      const basePath = this.getBasePath();
      
      if (pathname.startsWith(basePath)) {
        const routePart = pathname.substring(basePath.length);
        this.extractRouteComponents(routePart);
      }
    }
  }

  /**
   * Extract route components from a route string
   * @param {string} route - Route string like "dashboard/user/repo/branch" or "intended-branch/component/user/repo"
   */
  extractRouteComponents(route) {
    if (!route) return;
    
    const segments = route.split('/').filter(Boolean);
    
    if (segments.length === 0) return;
    
    // Check if we have an intended branch stored (from non-deployed branch routing)
    const intendedBranch = typeof sessionStorage !== 'undefined' ? 
      sessionStorage.getItem('sgex_intended_branch') : null;
    
    let component, userIndex;
    
    if (intendedBranch && segments[0] === intendedBranch) {
      // Route format: intended-branch/component/user/repo/branch/asset
      component = segments[1];
      userIndex = 2;
      
      // Store the intended branch as deployment branch context
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('sgex_deployment_branch', intendedBranch);
      }
    } else {
      // Standard route format: component/user/repo/branch/asset
      component = segments[0];
      userIndex = 1;
    }
    
    // Store routing information for the app
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('sgex_current_component', component);
      
      // Extract user/repo/branch based on segment count and userIndex
      if (segments.length > userIndex) {
        const user = segments[userIndex];
        sessionStorage.setItem('sgex_selected_user', user);
        
        if (segments.length > userIndex + 1) {
          const repo = segments[userIndex + 1];
          sessionStorage.setItem('sgex_selected_repo', repo);
          
          if (segments.length > userIndex + 2) {
            const branch = segments[userIndex + 2];
            sessionStorage.setItem('sgex_selected_branch', branch);
            
            if (segments.length > userIndex + 3) {
              const asset = segments.slice(userIndex + 3).join('/');
              sessionStorage.setItem('sgex_selected_asset', asset);
            }
          }
        }
      }
    }
  }

  /**
   * Restore context from session storage
   */
  restoreContextFromSession() {
    if (typeof sessionStorage === 'undefined') return;
    
    const context = {
      component: sessionStorage.getItem('sgex_current_component'),
      user: sessionStorage.getItem('sgex_selected_user'),
      repo: sessionStorage.getItem('sgex_selected_repo'),
      branch: sessionStorage.getItem('sgex_selected_branch'),
      asset: sessionStorage.getItem('sgex_selected_asset'),
      deploymentBranch: sessionStorage.getItem('sgex_deployment_branch'),
      intendedBranch: sessionStorage.getItem('sgex_intended_branch')
    };
    
    // Store in a global for easy access
    window.SGEX_URL_CONTEXT = context;
    
    return context;
  }

  /**
   * Build a clean URL from route components
   * @param {string} route - Route string
   * @param {Location} location - Current location object
   */
  buildCleanURL(route, location) {
    const basePath = this.getBasePath();
    let cleanURL = `${location.protocol}//${location.host}${basePath}`;
    
    if (route) {
      cleanURL += route;
    }
    
    // Preserve query parameters (except the routing one)
    const urlParams = new URLSearchParams(location.search);
    urlParams.delete('/'); // Remove the routing parameter
    
    const queryString = urlParams.toString();
    if (queryString) {
      cleanURL += '?' + queryString;
    }
    
    // Preserve hash fragment
    if (location.hash) {
      cleanURL += location.hash;
    }
    
    return cleanURL;
  }

  /**
   * Get the base path for the current deployment
   */
  getBasePath() {
    const pathname = window.location.pathname;
    
    // Check if we're in a GitHub Pages deployment
    if (window.location.hostname.endsWith('.github.io')) {
      if (pathname.startsWith('/sgex/')) {
        // Check for branch deployment
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length >= 2 && segments[0] === 'sgex') {
          // Could be branch deployment like /sgex/main/ or /sgex/feature-branch/
          return `/sgex/${segments[1]}/`;
        }
        return '/sgex/';
      }
      return '/';
    }
    
    // Local development
    if (pathname.startsWith('/sgex/')) {
      return '/sgex/';
    }
    
    return '/';
  }

  /**
   * Get the current routing context
   */
  getContext() {
    if (!this.initialized) {
      this.initialize();
    }
    
    return window.SGEX_URL_CONTEXT || {};
  }

  /**
   * Build a URL for navigation
   * @param {string} component - Component name
   * @param {string} user - User name (optional)
   * @param {string} repo - Repository name (optional)
   * @param {string} branch - Branch name (optional)
   * @param {string} asset - Asset path (optional)
   * @param {Object} queryParams - Query parameters (optional)
   * @param {string} fragment - URL fragment (optional)
   */
  buildURL(component, user = null, repo = null, branch = null, asset = null, queryParams = null, fragment = null) {
    const basePath = this.getBasePath();
    let url = `${basePath}${component}`;
    
    if (user) {
      url += `/${user}`;
      
      if (repo) {
        url += `/${repo}`;
        
        if (branch) {
          url += `/${branch}`;
          
          if (asset) {
            url += `/${asset}`;
          }
        }
      }
    }
    
    // Add query parameters
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        searchParams.set(key, value);
      });
      url += '?' + searchParams.toString();
    }
    
    // Add fragment
    if (fragment) {
      url += '#' + fragment;
    }
    
    return url;
  }

  /**
   * Navigate to a component with context
   * @param {string} component - Component name
   * @param {Object} context - Navigation context
   */
  navigateToComponent(component, context = {}) {
    const { user, repo, branch, asset, queryParams, fragment } = context;
    const url = this.buildURL(component, user, repo, branch, asset, queryParams, fragment);
    
    // Update session storage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('sgex_current_component', component);
      if (user) sessionStorage.setItem('sgex_selected_user', user);
      if (repo) sessionStorage.setItem('sgex_selected_repo', repo);
      if (branch) sessionStorage.setItem('sgex_selected_branch', branch);
      if (asset) sessionStorage.setItem('sgex_selected_asset', asset);
    }
    
    return url;
  }

  /**
   * Clear stored context
   */
  clearContext() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('sgex_current_component');
      sessionStorage.removeItem('sgex_selected_user');
      sessionStorage.removeItem('sgex_selected_repo');
      sessionStorage.removeItem('sgex_selected_branch');
      sessionStorage.removeItem('sgex_selected_asset');
      sessionStorage.removeItem('sgex_deployment_branch');
      sessionStorage.removeItem('sgex_intended_branch');
    }
    
    window.SGEX_URL_CONTEXT = {};
  }
}

// ============================================================================
// UTILITY FUNCTIONS (Moved from routeUtils.js for consolidation)
// ============================================================================

/**
 * Extract valid DAK component names from the shared route configuration
 * @returns {Array} Array of valid DAK component names
 */
export const extractDAKComponentsFromRoutes = () => {
  // In browser environment, try to get from global config first
  if (typeof window !== 'undefined' && window.getSGEXRouteConfig) {
    const config = window.getSGEXRouteConfig();
    if (config) {
      return config.getDAKComponentNames();
    }
  }
  
  // Fallback for server-side rendering or if config not loaded
  console.warn('SGEX route configuration not available, using fallback');
  return [
    'dashboard',                    
    'core-data-dictionary-viewer', 
    'health-interventions',        
    'actor-editor',               
    'business-process-selection',  
    'bpmn-editor',                
    'bpmn-viewer',                
    'bpmn-source',                
    'decision-support-logic',
    'questionnaire-editor',
    'docs',
    'pages',
    'faq-demo'
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

// Create singleton instance
const urlProcessor = new SGEXURLProcessor();

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      urlProcessor.initialize();
    });
  } else {
    urlProcessor.initialize();
  }
}

export default urlProcessor;