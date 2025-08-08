/**
 * SGEX Route Configuration Service
 * 
 * This service provides access to the route configuration from routes-config.json.
 * It is shared between:
 * 1. App.js for React Router route definitions (via routeUtils.js)
 * 2. 404.html for SPA routing and component validation
 * 
 * When adding new DAK components:
 * 1. Add the component mapping to routes-config.json: "route-name": "ReactComponentName"
 * 2. Import the React component in App.js and add it to importedComponents object
 * 
 * The system will automatically:
 * - Generate all React Router routes (/{component}, /{component}/:user/:repo, etc.)
 * - Match React component names to imported components automatically
 * - Update 404.html component validation
 * - Work across all deployment scenarios (local, GitHub Pages, standalone)
 * 
 * This ensures both the React app and GitHub Pages SPA routing
 * recognize the component as valid with zero hardcoded maintenance.
 */

// Global configuration object that will be available in both environments
window.SGEX_ROUTES_CONFIG = null;

// Synchronous configuration loading using XMLHttpRequest for 404.html compatibility
function loadRouteConfigSync() {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './routes-config.json', false); // Synchronous request
    xhr.send();
    
    if (xhr.status === 200) {
      var config = JSON.parse(xhr.responseText);
      
      // Create the service object with helper methods
      window.SGEX_ROUTES_CONFIG = {
        /**
         * DAK component configurations that define both routing and component mapping.
         * Each entry follows the pattern: /{component}/:user/:repo/:branch?/*?
         */
        dakComponents: config.dakComponents,

        /**
         * Deployed branches for GitHub Pages routing.
         */
        deployedBranches: config.deployedBranches,

        /**
         * Get list of DAK component names
         * @returns {Array} Array of valid DAK component names
         */
        getDAKComponentNames: function() {
          return Object.keys(this.dakComponents);
        },

        /**
         * Get React component name for a DAK component
         * @param {string} component - DAK component name
         * @returns {string|null} React component name or null if not found
         */
        getReactComponent: function(component) {
          return this.dakComponents[component] || null;
        },

        /**
         * Check if a component name is a valid DAK component
         * @param {string} component - Component name to validate
         * @returns {boolean} True if component is valid
         */
        isValidDAKComponent: function(component) {
          return Object.prototype.hasOwnProperty.call(this.dakComponents, component);
        },

        /**
         * Check if a branch name is a deployed branch
         * @param {string} branch - Branch name to validate  
         * @returns {boolean} True if branch is deployed
         */
        isDeployedBranch: function(branch) {
          return this.deployedBranches.includes(branch);
        }
      };
      
      return window.SGEX_ROUTES_CONFIG;
    } else {
      throw new Error('Failed to load routes-config.json: ' + xhr.status);
    }
  } catch (error) {
    console.error('Failed to load SGEX route configuration:', error);
    return null;
  }
}

// Asynchronous configuration loading for modern environments
async function loadRouteConfigAsync() {
  try {
    const response = await fetch('./routes-config.json');
    if (!response.ok) {
      throw new Error(`Failed to load routes-config.json: ${response.status}`);
    }
    return loadRouteConfigSync(); // Use the sync version to create the config object
  } catch (error) {
    console.error('Failed to load SGEX route configuration:', error);
    return null;
  }
}

// For synchronous access (mainly for 404.html and immediate use)
function getSGEXRouteConfig() {
  if (!window.SGEX_ROUTES_CONFIG) {
    // Try to load synchronously if not already loaded
    loadRouteConfigSync();
  }
  return window.SGEX_ROUTES_CONFIG;
}

// Load configuration immediately for browsers
if (typeof window !== 'undefined') {
  // Try synchronous load first
  loadRouteConfigSync();
  
  // If that failed, try async load for development environments
  if (!window.SGEX_ROUTES_CONFIG) {
    loadRouteConfigAsync().then(config => {
      if (config) {
        console.log('SGEX route configuration loaded successfully (async)');
      }
    });
  } else {
    console.log('SGEX route configuration loaded successfully (sync)');
  }
}

// Make functions available globally
window.loadSGEXRouteConfig = loadRouteConfigSync;
window.getSGEXRouteConfig = getSGEXRouteConfig;