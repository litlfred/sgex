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
         * Check if a component name is valid (any type)
         * @param {string} componentName - Component name to validate
         * @returns {boolean} True if component is valid
         */
        isValidComponent: function(componentName) {
          return this.getAllComponentNames().includes(componentName);
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
          return this.getAllComponentNames().includes(componentName);
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

// ========================================
// CENTRALIZED ROUTING LOGIC
// ========================================

/**
 * Main routing function for SGEX SPA 
 * Handles all URL patterns for both GitHub Pages and local deployments
 */
function performSGEXRouting() {
  var l = window.location;
  
  // First check if this is an existing redirect to prevent infinite loops
  if (l.search && l.search.indexOf('?/') === 0) {
    console.error('SGEX 404.html: Detected existing redirect, stopping to prevent infinite loop');
    showSGEXErrorPage('Redirect Loop Detected', 
      'This URL has already been processed by the routing system but still resulted in a 404. This may indicate a configuration issue.',
      'routing-loop');
    return;
  }

  var pathSegments = l.pathname.split('/').filter(Boolean);
  
  // Check if this is GitHub Pages deployment
  var isGitHubPages = l.hostname === 'litlfred.github.io' || l.hostname.endsWith('.github.io');
  var routeConfig = getSGEXRouteConfig();

  if (isGitHubPages) {
    // GitHub Pages deployment - handle /sgex/ prefixed URLs
    handleSGEXGitHubPagesDeployment(pathSegments, l, routeConfig);
  } else {
    // Local deployment - handle both /sgex/ prefixed and root-level URLs
    handleSGEXLocalDeployment(pathSegments, l, routeConfig);
  }
}

function handleSGEXGitHubPagesDeployment(pathSegments, l, routeConfig) {
  // GitHub Pages deployment - check URL pattern
  if (pathSegments.length === 0 || pathSegments[0] !== 'sgex') {
    showSGEXErrorPage('Invalid URL Pattern', 
      'Expected URL to start with /sgex/ but got: ' + l.pathname,
      'invalid-base-path');
    return;
  }

  if (pathSegments.length === 1) {
    // Just /sgex/ - redirect to root
    redirectToSGEXSPA('/sgex/', '');
    return;
  }

  // Check if second segment is a deployed branch
  var secondSegment = pathSegments[1];
  
  if (routeConfig && routeConfig.isDeployedBranch && routeConfig.isDeployedBranch(secondSegment)) {
    // Branch deployment pattern: /sgex/:branch/:component/...
    handleSGEXBranchDeployment(pathSegments, l, routeConfig, '/sgex/');
  } else if (routeConfig && routeConfig.isValidComponent && routeConfig.isValidComponent(secondSegment)) {
    // Component-first pattern: /sgex/:component/:user/:repo/:branch
    handleSGEXComponentFirst(pathSegments, l, '/sgex/');
  } else if (pathSegments.length === 3 && pathSegments[2] === 'index.html') {
    // Branch deployment with index.html: /sgex/:branch/index.html
    // Redirect to the branch root which should load the welcome page
    var branchPath = '/sgex/' + secondSegment + '/';
    console.log('SGEX Branch Deployment Redirect (index.html):', {
      from: l.pathname,
      to: branchPath,
      branch: secondSegment
    });
    l.replace(l.protocol + '//' + l.host + branchPath);
  } else {
    // Handle unknown branch-only URLs by redirecting to branch root  
    if (pathSegments.length === 2) {
      // Just /sgex/:unknown-branch/ - redirect to branch root
      console.log('SGEX Branch Root Redirect (unknown branch):', {
        from: l.pathname,
        branch: secondSegment,
        note: 'Unknown branch name, redirecting to branch root'
      });
      var branchPath = '/sgex/' + secondSegment + '/';
      redirectToSGEXSPA(branchPath, '');
      return;
    }

    // Before showing error, check if this could be a branch-first pattern
    // If we have at least 3 segments and the third segment is a valid component,
    // treat the second segment as a branch name regardless of deployed status
    if (pathSegments.length >= 3 && 
        routeConfig && 
        routeConfig.isValidComponent && 
        routeConfig.isValidComponent(pathSegments[2])) {
      // Treat as branch deployment: /sgex/:branch/:component/...
      console.log('SGEX Branch Deployment (undeployed branch):', {
        from: l.pathname,
        branch: secondSegment,
        component: pathSegments[2],
        note: 'Branch not in deployedBranches list, but treating as valid branch'
      });
      handleSGEXBranchDeployment(pathSegments, l, routeConfig, '/sgex/');
    } else {
      // Unknown pattern - show error
      showSGEXErrorPage('Unknown URL Pattern', 
        'The URL pattern is not recognized. Expected either /sgex/:branch/:component or /sgex/:component/:user/:repo (with optional :branch/:asset) but got: ' + l.pathname,
        'unknown-pattern');
    }
  }
}

function handleSGEXLocalDeployment(pathSegments, l, routeConfig) {
  // Local deployment - support both /sgex/ prefixed and root-level URLs
  var hasStandardPrefix = pathSegments.length > 0 && pathSegments[0] === 'sgex';
  var basePath = hasStandardPrefix ? '/sgex/' : '/';
  var relevantSegments = hasStandardPrefix ? pathSegments : ['sgex'].concat(pathSegments);

  if (relevantSegments.length <= 1) {
    // Root path - redirect to SPA root
    redirectToSGEXSPA(basePath, '');
    return;
  }

  // Check if first meaningful segment is a deployed branch
  var firstSegment = relevantSegments[1];
  
  if (routeConfig && routeConfig.isDeployedBranch && routeConfig.isDeployedBranch(firstSegment)) {
    // Branch deployment pattern: /:branch/:component/... or /sgex/:branch/:component/...
    handleSGEXBranchDeployment(relevantSegments, l, routeConfig, basePath);
  } else if (routeConfig && routeConfig.isValidComponent && routeConfig.isValidComponent(firstSegment)) {
    // Component-first pattern: /:component/:user/:repo/... or /sgex/:component/:user/:repo/...
    handleSGEXComponentFirst(relevantSegments, l, basePath);
  } else {
    // Simple SPA routing for unknown patterns
    var routePath = hasStandardPrefix ? pathSegments.slice(1).join('/') : pathSegments.join('/');
    if (routePath) {
      redirectToSGEXSPA(basePath, routePath);
    } else {
      redirectToSGEXSPA(basePath, '');
    }
  }
}

function handleSGEXBranchDeployment(pathSegments, l, routeConfig, basePath) {
  if (pathSegments.length < 3) {
    // Just /:branch/ - redirect to branch root
    var branchPath = basePath + pathSegments[1] + '/';
    redirectToSGEXSPA(branchPath, '');
    return;
  }

  var branch = pathSegments[1];
  var component = pathSegments[2];
  
  // Validate component exists in the deployed branch
  if (!routeConfig.isValidComponent(component)) {
    showSGEXErrorPage('Invalid Component', 
      'Component "' + component + '" is not valid for branch "' + branch + '". Check the component name and try again.',
      'invalid-component-for-branch');
    return;
  }

  // Route to branch SPA: basePath:branch/?/:component/...
  // This handles all patterns including:
  // - /sgex/:branch/:component (basic component access)
  // - /sgex/:branch/:component/:user/:repo (DAK repository access)
  // - /sgex/:branch/:component/:user/:repo/:branch (specific branch access)
  // - /sgex/:branch/:component/:user/:repo/:branch/:asset (asset pages)
  var branchPath = basePath + pathSegments[1] + '/';
  var routePath = pathSegments.slice(2).join('/');
  redirectToSGEXSPA(branchPath, routePath);
}

function handleSGEXComponentFirst(pathSegments, l, basePath) {
  // Component-first pattern: /:component/:user/:repo/:branch
  // Also handles asset pages: /:component/:user/:repo/:branch/:asset
  // Route to main SPA: basePath?/:component/...
  // This preserves all path segments including asset identifiers
  var routePath = pathSegments.slice(1).join('/'); // Remove prefix
  redirectToSGEXSPA(basePath, routePath);
}

function redirectToSGEXSPA(basePath, routePath) {
  var l = window.location;
  var newUrl = l.protocol + '//' + l.host + basePath;
  
  if (routePath) {
    newUrl += '?/' + routePath.replace(/&/g, '~and~');
  }
  
  if (l.search) {
    newUrl += (routePath ? '&' : '?') + l.search.slice(1).replace(/&/g, '~and~');
  }
  
  newUrl += l.hash;
  
  console.log('SGEX SPA Routing Redirect:', {
    from: l.pathname,
    to: newUrl,
    basePath: basePath,
    routePath: routePath
  });
  
  l.replace(newUrl);
}

function showSGEXErrorPage(title, message, errorCode) {
  var l = window.location;
  var bugReportUrl = 'https://github.com/litlfred/sgex/issues/new?' + 
    'title=' + encodeURIComponent('[URL Routing Error] ' + title) +
    '&body=' + encodeURIComponent(
      'Error Code: ' + errorCode + '\n\n' +
      'URL: ' + l.href + '\n' +
      'Hostname: ' + l.hostname + '\n' +
      'Path: ' + l.pathname + '\n' +
      'Search: ' + l.search + '\n' +
      'Hash: ' + l.hash + '\n\n' +
      'Message: ' + message + '\n\n' +
      'Please describe what you were trying to do when this error occurred:'
    ) +
    '&labels=' + encodeURIComponent('bug,routing');

  var errorHTML = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">' +
      '<h1 style="color: #d73527;">SGEX URL Routing Error</h1>' +
      '<h2>' + title + '</h2>' +
      '<p style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: left;">' + message + '</p>' +
      '<p><strong>Error Code:</strong> ' + errorCode + '</p>' +
      '<div style="margin: 30px 0;">' +
        '<a href="https://litlfred.github.io/sgex/" style="background: #0078d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Go to SGEX Home</a>' +
        '<a href="' + bugReportUrl + '" target="_blank" style="background: #d73527; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">Report Bug</a>' +
      '</div>' +
      '<p style="color: #666; font-size: 12px;">If you think this is a bug, please use the "Report Bug" button to help us fix it.</p>' +
    '</div>';

  // Ensure DOM is ready before setting innerHTML
  function setErrorHTML() {
    try {
      // Wait for document to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          if (document.body) {
            document.body.innerHTML = errorHTML;
          } else {
            // Create body if it doesn't exist
            document.body = document.createElement('body');
            document.documentElement.appendChild(document.body);
            document.body.innerHTML = errorHTML;
          }
        });
      } else {
        // Document is ready
        if (document.body) {
          document.body.innerHTML = errorHTML;
        } else {
          // Body doesn't exist, create it
          document.body = document.createElement('body');
          if (document.documentElement) {
            document.documentElement.appendChild(document.body);
          }
          document.body.innerHTML = errorHTML;
        }
      }
    } catch (error) {
      // Last resort: use document.write (not ideal but better than crashing)
      console.error('Failed to set error HTML via DOM manipulation:', error);
      document.write('<body>' + errorHTML + '</body>');
    }
  }
  
  setErrorHTML();
}

// Make functions available globally
window.loadSGEXRouteConfig = loadRouteConfigSync;
window.getSGEXRouteConfig = getSGEXRouteConfig;
window.performSGEXRouting = performSGEXRouting;
window.showSGEXErrorPage = showSGEXErrorPage;