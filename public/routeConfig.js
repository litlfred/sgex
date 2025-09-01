/**
 * SGEX Route Configuration Service
 * 
 * This service provides access to the route configuration and supports lazy loading.
 * It automatically detects the deployment type and loads the appropriate configuration:
 * - routes-config.json for main site and feature branches
 * - routes-config.deploy.json for deploy branch  
 * 
 * Features:
 * 1. Lazy loading support with React.lazy() compatible paths
 * 2. Automatic deployment type detection
 * 3. Shared between App.js and 404.html
 * 4. Dynamic route generation with zero hardcoded maintenance
 * 
 * When adding new components:
 * 1. Add component to appropriate config file with path and routes
 * 2. Components are loaded lazily - no direct imports needed
 * 
 * The system automatically:
 * - Loads the correct configuration based on deployment
 * - Generates all React Router routes dynamically
 * - Handles lazy loading and suspense boundaries
 * - Works across all deployment scenarios
 */

// Global configuration object that will be available in both environments
window.SGEX_ROUTES_CONFIG = null;

// Detect deployment type based on current URL and environment
function getDeploymentType() {
  // Check if we're in a simple deployment (deploy branch)
  if (typeof window !== 'undefined') {
    var path = window.location.pathname;
    // If we're at the root with minimal functionality, likely deploy branch
    if (path === '/' || path === '/sgex/' || path.endsWith('/branch-listing')) {
      return 'deploy';
    }
  }
  
  // Default to main deployment type
  return 'main';
}

// Get appropriate config file name based on deployment type  
function getConfigFileName(deployType) {
  return deployType === 'deploy' ? './routes-config.deploy.json' : './routes-config.json';
}

// Synchronous configuration loading using XMLHttpRequest for 404.html compatibility
function loadRouteConfigSync(deployType) {
  try {
    deployType = deployType || getDeploymentType();
    var configFile = getConfigFileName(deployType);
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', configFile, false); // Synchronous request
    xhr.send();
    
    if (xhr.status === 200) {
      var config = JSON.parse(xhr.responseText);
      
      // Create the service object with helper methods
      window.SGEX_ROUTES_CONFIG = {
        /**
         * Deployment type (main or deploy)
         */
        deployType: config.deployType || deployType,

        /**
         * DAK component configurations with lazy loading paths.
         * Each entry includes component name and import path for React.lazy()
         */
        dakComponents: config.dakComponents || {},

        /**
         * Standard app component configurations with routes and lazy loading paths
         */
        standardComponents: config.standardComponents || {},

        /**
         * Simple component mapping for deploy branch
         */
        components: config.components || {},

        /**
         * Test routes for framework testing
         */
        testRoutes: config.testRoutes || [],

        /**
         * Deployed branches for GitHub Pages routing.
         */
        deployedBranches: config.deployedBranches || [],

        /**
         * Get list of DAK component names
         * @returns {Array} Array of valid DAK component names
         */
        getDAKComponentNames: function() {
          return Object.keys(this.dakComponents);
        },

        /**
         * Get all component names (DAK + standard + deploy-specific)
         * @returns {Array} Array of all valid component names
         */
        getAllComponentNames: function() {
          var dakNames = Object.keys(this.dakComponents);
          var standardNames = Object.keys(this.standardComponents);
          var deployNames = Object.keys(this.components);
          return dakNames.concat(standardNames).concat(deployNames);
        },

        /**
         * Get React component name for a DAK component
         * @param {string} component - DAK component name
         * @returns {string|null} React component name or null if not found
         */
        getReactComponent: function(component) {
          var dakComp = this.dakComponents[component];
          return dakComp ? dakComp.component || dakComp : null;
        },

        /**
         * Get component import path for lazy loading
         * @param {string} componentName - Component name
         * @returns {string|null} Import path or null if not found
         */
        getComponentPath: function(componentName) {
          // Check DAK components
          for (var dakName in this.dakComponents) {
            var dakComp = this.dakComponents[dakName];
            if (dakComp.component === componentName) {
              return dakComp.path;
            }
          }
          
          // Check standard components
          var standardComp = this.standardComponents[componentName];
          if (standardComp) {
            return standardComp.path;
          }
          
          // Check deploy components
          var deployComp = this.components[componentName];
          if (deployComp) {
            return deployComp.path;
          }
          
          return null;
        },

        /**
         * Get all routes for a component
         * @param {string} componentName - Component name
         * @returns {Array} Array of route objects
         */
        getComponentRoutes: function(componentName) {
          var standardComp = this.standardComponents[componentName];
          if (standardComp && standardComp.routes) {
            return standardComp.routes;
          }
          
          var deployComp = this.components[componentName];
          if (deployComp && deployComp.routes) {
            return deployComp.routes;
          }
          
          return [];
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
         * Get all route paths from component configurations
         * @returns {Array} Array of valid route paths
         */
        getAllRoutePaths: function() {
          var routePaths = [];
          
          // Extract route paths from standard components
          for (var compName in this.standardComponents) {
            var comp = this.standardComponents[compName];
            if (comp.routes) {
              for (var i = 0; i < comp.routes.length; i++) {
                var route = comp.routes[i];
                var path = route.path || route;
                if (path && path !== '*') {
                  // Convert route path to component identifier (remove leading slash and parameters)
                  var routePath = path.replace(/^\//, '').split('/')[0].split(':')[0];
                  if (routePath && routePaths.indexOf(routePath) === -1) {
                    routePaths.push(routePath);
                  }
                }
              }
            }
          }
          
          // Extract route paths from deploy components
          for (var compName in this.components) {
            var comp = this.components[compName];
            if (comp.routes) {
              for (var i = 0; i < comp.routes.length; i++) {
                var route = comp.routes[i];
                var path = route.path || route;
                if (path && path !== '*') {
                  // Convert route path to component identifier (remove leading slash and parameters)
                  var routePath = path.replace(/^\//, '').split('/')[0].split(':')[0];
                  if (routePath && routePaths.indexOf(routePath) === -1) {
                    routePaths.push(routePath);
                  }
                }
              }
            }
          }
          
          return routePaths;
        },

        /**
         * Check if a component name is valid (any type)
         * @param {string} componentName - Component name to validate
         * @returns {boolean} True if component is valid
         */
        isValidComponent: function(componentName) {
          // Check component names first
          if (this.getAllComponentNames().includes(componentName)) {
            return true;
          }
          
          // Check route paths second
          return this.getAllRoutePaths().includes(componentName);
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
      throw new Error('Failed to load ' + configFile + ': ' + xhr.status);
    }
  } catch (error) {
    console.error('Failed to load SGEX route configuration:', error);
    return null;
  }
}

// Asynchronous configuration loading for modern environments
async function loadRouteConfigAsync(deployType) {
  try {
    deployType = deployType || getDeploymentType();
    var configFile = getConfigFileName(deployType);
    
    const response = await fetch(configFile);
    if (!response.ok) {
      throw new Error(`Failed to load ${configFile}: ${response.status}`);
    }
    return loadRouteConfigSync(deployType); // Use the sync version to create the config object
  } catch (error) {
    console.error('Failed to load SGEX route configuration:', error);
    return null;
  }
}

// For synchronous access (mainly for 404.html and immediate use)
function getSGEXRouteConfig(deployType) {
  if (!window.SGEX_ROUTES_CONFIG) {
    // Try to load synchronously if not already loaded
    loadRouteConfigSync(deployType);
    
    // If still failed, provide a minimal fallback configuration
    if (!window.SGEX_ROUTES_CONFIG) {
      console.warn('Using fallback route configuration due to loading failure');
      deployType = deployType || getDeploymentType();
      
      // Create minimal working configuration with essential routes
      window.SGEX_ROUTES_CONFIG = {
        deployType: deployType,
        dakComponents: {
          "dashboard": {
            "component": "DAKDashboard",
            "path": "./components/DAKDashboard"
          }
        },
        standardComponents: {
          "BranchListingPage": {
            "component": "BranchListingPage",
            "path": "./components/BranchListingPage",
            "routes": ["/"]
          },
          "DAKDashboard": {
            "component": "DAKDashboard", 
            "path": "./components/DAKDashboard",
            "routes": ["/dashboard", "/dashboard/:user/:repo", "/dashboard/:user/:repo/:branch"]
          },
          "LandingPage": {
            "component": "LandingPage",
            "path": "./components/LandingPage", 
            "routes": ["/welcome"]
          },
          "SelectProfilePage": {
            "path": "./components/SelectProfilePage",
            "routes": [
              { "path": "/select_profile", "exact": true },
              { "path": "/select_profile/:user", "exact": true },
              { "path": "/select_profile/:user/:repo", "exact": true },
              { "path": "/select_profile/:user/:repo/:branch", "exact": true },
              { "path": "/select_profile/:user/:repo/:branch/*" }
            ]
          },
          "DAKActionSelection": {
            "path": "./components/DAKActionSelection",
            "routes": [
              { "path": "/dak-action", "exact": true },
              { "path": "/dak-action/:user", "exact": true },
              { "path": "/dak-action/:user/:repo", "exact": true },
              { "path": "/dak-action/:user/:repo/:branch", "exact": true },
              { "path": "/dak-action/:user/:repo/:branch/*" }
            ]
          },
          "OrganizationSelection": {
            "path": "./components/OrganizationSelection",
            "routes": [
              { "path": "/organization-selection", "exact": true },
              { "path": "/organization-selection/:user", "exact": true },
              { "path": "/organization-selection/:user/:repo", "exact": true },
              { "path": "/organization-selection/:user/:repo/:branch", "exact": true },
              { "path": "/organization-selection/:user/:repo/:branch/*" }
            ]
          }
        },
        components: {},
        testRoutes: [],
        deployedBranches: [],
        
        // Helper methods
        getDAKComponentNames: function() {
          return Object.keys(this.dakComponents);
        },
        getAllComponentNames: function() {
          var dakNames = Object.keys(this.dakComponents);
          var standardNames = Object.keys(this.standardComponents);
          var deployNames = Object.keys(this.components);
          return dakNames.concat(standardNames).concat(deployNames);
        },
        getAllRoutePaths: function() {
          var routePaths = [];
          
          // Extract route paths from standard components
          for (var compName in this.standardComponents) {
            var comp = this.standardComponents[compName];
            if (comp.routes) {
              for (var i = 0; i < comp.routes.length; i++) {
                var route = comp.routes[i];
                var path = route.path || route;
                if (path && path !== '*') {
                  // Convert route path to component identifier (remove leading slash and parameters)
                  var routePath = path.replace(/^\//, '').split('/')[0].split(':')[0];
                  if (routePath && routePaths.indexOf(routePath) === -1) {
                    routePaths.push(routePath);
                  }
                }
              }
            }
          }
          
          // Extract route paths from deploy components
          for (var compName in this.components) {
            var comp = this.components[compName];
            if (comp.routes) {
              for (var i = 0; i < comp.routes.length; i++) {
                var route = comp.routes[i];
                var path = route.path || route;
                if (path && path !== '*') {
                  // Convert route path to component identifier (remove leading slash and parameters)
                  var routePath = path.replace(/^\//, '').split('/')[0].split(':')[0];
                  if (routePath && routePaths.indexOf(routePath) === -1) {
                    routePaths.push(routePath);
                  }
                }
              }
            }
          }
          
          return routePaths;
        },
        getReactComponent: function(component) {
          var dakComp = this.dakComponents[component];
          return dakComp ? dakComp.component || dakComp : null;
        },
        getComponentPath: function(componentName) {
          // Check DAK components
          for (var dakName in this.dakComponents) {
            var dakComp = this.dakComponents[dakName];
            if (dakComp.component === componentName) {
              return dakComp.path;
            }
          }
          
          // Check standard components
          var standardComp = this.standardComponents[componentName];
          if (standardComp) {
            return standardComp.path;
          }
          
          // Check deploy components
          var deployComp = this.components[componentName];
          if (deployComp) {
            return deployComp.path;
          }
          
          return null;
        },
        getRoutes: function(componentName) {
          var dakComp = this.dakComponents[componentName];
          if (dakComp && dakComp.routes) {
            return dakComp.routes;
          }
          
          var standardComp = this.standardComponents[componentName];
          if (standardComp && standardComp.routes) {
            return standardComp.routes;
          }
          
          var deployComp = this.components[componentName];
          if (deployComp && deployComp.routes) {
            return deployComp.routes;
          }
          
          return [];
        },
        isValidDAKComponent: function(component) {
          return Object.prototype.hasOwnProperty.call(this.dakComponents, component);
        },
        isValidComponent: function(componentName) {
          // Check component names first
          if (this.getAllComponentNames().includes(componentName)) {
            return true;
          }
          
          // Check route paths second
          return this.getAllRoutePaths().includes(componentName);
        },
        isDeployedBranch: function(branch) {
          return this.deployedBranches.includes(branch);
        }
      };
    }
  }
  return window.SGEX_ROUTES_CONFIG;
}

// Load configuration immediately for browsers
if (typeof window !== 'undefined') {
  var deployType = getDeploymentType();
  
  // Try synchronous load first
  loadRouteConfigSync(deployType);
  
  // If that failed, try async load for development environments
  if (!window.SGEX_ROUTES_CONFIG) {
    loadRouteConfigAsync(deployType).then(config => {
      if (config) {
        console.log('SGEX route configuration loaded successfully (async) - ' + deployType);
      }
    });
  } else {
    console.log('SGEX route configuration loaded successfully (sync) - ' + deployType);
  }
}

// Make functions available globally
window.loadSGEXRouteConfig = loadRouteConfigSync;
window.getSGEXRouteConfig = getSGEXRouteConfig;