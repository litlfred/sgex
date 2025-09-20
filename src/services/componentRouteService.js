import React, { Suspense } from 'react';

// Lazy import Route to avoid issues during testing
let Route;
try {
  const ReactRouterDom = require('react-router-dom');
  Route = ReactRouterDom.Route;
} catch (error) {
  // Fallback for testing environments
  Route = ({ children, element, ...props }) => element || children || null;
}

/**
 * SGEX Component Route Service
 * 
 * Handles React component lazy loading and route generation for the SGEX application.
 * This service provides:
 * 1. Lazy loading of React components with Suspense boundaries
 * 2. Dynamic route generation from configuration
 * 3. DAK component pattern generation (/{component}/:user/:repo/:branch/*)
 * 4. Component validation for routing
 * 
 * Split from lazyRouteUtils.js for better separation of concerns.
 */

// Cache for lazy-loaded components to avoid re-creating them
const lazyComponentCache = new Map();

/**
 * Create a lazy-loaded component with Suspense boundary
 * @param {string} componentName - Name of the component for debugging
 * @returns {React.Component} Lazy component wrapped in Suspense
 */
function createLazyComponent(componentName) {
  const cacheKey = componentName;
  
  if (lazyComponentCache.has(cacheKey)) {
    return lazyComponentCache.get(cacheKey);
  }

  // Create lazy component with explicit imports to avoid webpack warnings
  let LazyComponent;
  
  switch (componentName) {
    case 'WelcomePage':
      LazyComponent = React.lazy(() => import('../components/WelcomePage'));
      break;
    case 'SelectProfilePage':
      LazyComponent = React.lazy(() => import('../components/SelectProfilePage'));
      break;
    case 'DAKActionSelection':
      LazyComponent = React.lazy(() => import('../components/DAKActionSelection'));
      break;
    case 'DAKSelection':
      LazyComponent = React.lazy(() => import('../components/DAKSelection'));
      break;
    case 'OrganizationSelection':
      LazyComponent = React.lazy(() => import('../components/OrganizationSelection'));
      break;
    case 'DAKConfiguration':
      LazyComponent = React.lazy(() => import('../components/DAKConfiguration'));
      break;
    case 'RepositorySelection':
      LazyComponent = React.lazy(() => import('../components/RepositorySelection'));
      break;
    case 'DashboardRedirect':
      LazyComponent = React.lazy(() => import('../components/DashboardRedirect'));
      break;

    case 'DocumentationViewer':
      LazyComponent = React.lazy(() => import('../components/DocumentationViewer'));
      break;
    case 'PagesManager':
      LazyComponent = React.lazy(() => import('../components/PagesManager'));
      break;

    case 'BranchListingPage':
      LazyComponent = React.lazy(() => import('../components/BranchListingPage'));
      break;
    case 'NotFound':
      LazyComponent = React.lazy(() => import('../components/NotFound'));
      break;
    case 'DAKFAQDemo':
      LazyComponent = React.lazy(() => import('../components/DAKFAQDemo'));
      break;
    
    // DAK Components
    case 'DAKDashboard':
      LazyComponent = React.lazy(() => import('../components/DAKDashboard'));
      break;
    case 'DAKDashboardWithFramework':
      LazyComponent = React.lazy(() => import('../components/DAKDashboardWithFramework'));
      break;

    case 'CoreDataDictionaryViewer':
      LazyComponent = React.lazy(() => import('../components/CoreDataDictionaryViewer'));
      break;
    case 'ComponentEditor':
      LazyComponent = React.lazy(() => import('../components/ComponentEditor'));
      break;
    case 'ActorEditor':
      LazyComponent = React.lazy(() => import('../components/ActorEditor'));
      break;
    case 'BusinessProcessSelection':
      LazyComponent = React.lazy(() => import('../components/BusinessProcessSelection'));
      break;
    case 'BPMNEditor':
      LazyComponent = React.lazy(() => import('../components/BPMNEditor'));
      break;
    case 'BPMNViewer':
      LazyComponent = React.lazy(() => import('../components/BPMNViewer'));
      break;
    case 'BPMNSource':
      LazyComponent = React.lazy(() => import('../components/BPMNSource'));
      break;
    case 'DecisionSupportLogicView':
      LazyComponent = React.lazy(() => import('../components/DecisionSupportLogicView'));
      break;
    case 'QuestionnaireEditor':
      LazyComponent = React.lazy(() => import('../components/QuestionnaireEditor'));
      break;
    case 'ProgramIndicators':
      LazyComponent = React.lazy(() => import('../components/ProgramIndicators'));
      break;
    
    default:
      console.warn(`Unknown component ${componentName}, using fallback`);
      LazyComponent = React.lazy(() => import('../components/NotFound'));
      break;
  }
  
  // Wrap with Suspense and error boundary
  const SuspenseWrapper = (props) => (
    <Suspense fallback={
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading {componentName}...</p>
      </div>
    }>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  // Set display name for debugging
  SuspenseWrapper.displayName = `Lazy(${componentName})`;
  
  lazyComponentCache.set(cacheKey, SuspenseWrapper);
  return SuspenseWrapper;
}

/**
 * Generate standard DAK component routes (/{component}/:user/:repo/:branch/*)
 * @param {string} routeName - DAK route name (e.g., 'dashboard')
 * @param {Object} dakComponent - DAK component configuration
 * @returns {Array} Array of Route elements
 */
function generateDAKRoutes(routeName, dakComponent) {
  const componentName = dakComponent.component;
  const LazyComponent = createLazyComponent(componentName);
  
  const basePath = `/${routeName}`;
  
  // Special case for documentation - use document-specific routes instead of user/repo patterns
  if (routeName === 'docs') {
    return [
      <Route key={`${routeName}-base`} path={basePath} element={<LazyComponent />} />,
      <Route key={`${routeName}-docid`} path={`${basePath}/:docId`} element={<LazyComponent />} />
    ];
  }
  
  return [
    <Route key={`${routeName}-base`} path={basePath} element={<LazyComponent />} />,
    <Route key={`${routeName}-user`} path={`${basePath}/:user`} element={<LazyComponent />} />,
    <Route key={`${routeName}-user-repo`} path={`${basePath}/:user/:repo`} element={<LazyComponent />} />,
    <Route key={`${routeName}-user-repo-branch`} path={`${basePath}/:user/:repo/:branch`} element={<LazyComponent />} />,
    <Route key={`${routeName}-user-repo-branch-asset`} path={`${basePath}/:user/:repo/:branch/*`} element={<LazyComponent />} />
  ];
}

/**
 * Generate routes for standard components
 * @param {string} componentName - Component name
 * @param {Object} componentConfig - Component configuration with routes
 * @returns {Array} Array of Route elements
 */
function generateStandardRoutes(componentName, componentConfig) {
  const LazyComponent = createLazyComponent(componentName);
  
  return componentConfig.routes.map((routeConfig, index) => (
    <Route 
      key={`${componentName}-${index}`}
      path={routeConfig.path}
      element={<LazyComponent />}
    />
  ));
}

/**
 * Generate all lazy-loaded routes based on configuration
 * @returns {Array} Array of all Route elements
 */
export function generateLazyRoutes() {
  let config = null;
  
  // Safely try to get the config, handling the case where the function doesn't exist yet
  try {
    if (typeof window.getSGEXRouteConfig === 'function') {
      config = window.getSGEXRouteConfig();
    }
  } catch (error) {
    console.warn('Error getting SGEX route configuration:', error);
  }
  
  if (!config) {
    console.warn('SGEX route configuration not loaded, falling back to minimal routes');
    
    // Provide a more comprehensive fallback that includes essential routes for the help system
    const BranchListingPage = createLazyComponent('BranchListingPage');
    const DAKDashboard = createLazyComponent('DAKDashboard');
    const LandingPage = createLazyComponent('LandingPage');
    const DocumentationViewer = createLazyComponent('DocumentationViewer');
    
    return [
      <Route key="fallback-home" path="/" element={<BranchListingPage />} />,
      <Route key="fallback-dashboard" path="/dashboard" element={<DAKDashboard />} />,
      <Route key="fallback-dashboard-user" path="/dashboard/:user" element={<DAKDashboard />} />,
      <Route key="fallback-dashboard-user-repo" path="/dashboard/:user/:repo" element={<DAKDashboard />} />,
      <Route key="fallback-dashboard-user-repo-branch" path="/dashboard/:user/:repo/:branch" element={<DAKDashboard />} />,
      <Route key="fallback-welcome" path="/welcome" element={<LandingPage />} />,
      <Route key="fallback-docs" path="/docs/:docId" element={<DocumentationViewer />} />,
      <Route key="fallback-docs-default" path="/docs" element={<DocumentationViewer />} />,
      <Route key="fallback-404" path="*" element={<div>Page not found</div>} />
    ];
  }

  const routes = [];

  // Generate DAK component routes (main deployment only)
  if (config.deployType === 'main' && config.dakComponents) {
    Object.entries(config.dakComponents).forEach(([routeName, dakComponent]) => {
      routes.push(...generateDAKRoutes(routeName, dakComponent));
    });
  }

  // Generate standard component routes
  if (config.standardComponents) {
    Object.entries(config.standardComponents).forEach(([componentName, componentConfig]) => {
      routes.push(...generateStandardRoutes(componentName, componentConfig));
    });
  }

  // Generate deploy-specific component routes
  if (config.components) {
    Object.entries(config.components).forEach(([componentName, componentConfig]) => {
      routes.push(...generateStandardRoutes(componentName, componentConfig));
    });
  }

  return routes;
}

/**
 * Get list of valid DAK components for URL validation
 * @returns {Array} Array of valid DAK component names
 */
export function getValidDAKComponents() {
  try {
    if (typeof window.getSGEXRouteConfig === 'function') {
      const config = window.getSGEXRouteConfig();
      return config ? config.getDAKComponentNames() : [];
    }
  } catch (error) {
    console.warn('Error getting DAK components:', error);
  }
  return [];
}

/**
 * Check if a component is valid for routing
 * @param {string} componentName - Component name to validate
 * @returns {boolean} True if component is valid
 */
export function isValidComponent(componentName) {
  try {
    if (typeof window.getSGEXRouteConfig === 'function') {
      const config = window.getSGEXRouteConfig();
      return config ? config.isValidComponent(componentName) : false;
    }
  } catch (error) {
    console.warn('Error validating component:', error);
  }
  return false;
}

/**
 * Component route utilities for unified access
 */
const ComponentRouteService = {
  generateLazyRoutes,
  getValidDAKComponents,
  isValidComponent
};

export default ComponentRouteService;