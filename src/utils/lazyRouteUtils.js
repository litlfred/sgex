import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';

/**
 * SGEX Lazy Route Generation Utility
 * 
 * This utility generates React Router routes dynamically using lazy loading
 * based on the route configuration loaded from JSON files.
 * 
 * Features:
 * 1. Lazy loading of all components using React.lazy()
 * 2. Automatic Suspense boundaries with loading fallbacks
 * 3. Dynamic route generation from configuration
 * 4. Support for different deployment types (main vs deploy)
 * 5. DAK component pattern generation (/{component}/:user/:repo/:branch/*)
 * 
 * Usage:
 *   const routes = generateLazyRoutes();
 *   return <Routes>{routes}</Routes>
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
    case 'TestDashboard':
      LazyComponent = React.lazy(() => import('../components/TestDashboard'));
      break;
    case 'BPMNViewerTestComponent':
      LazyComponent = React.lazy(() => import('../components/BPMNViewerTestComponent'));
      break;
    case 'DocumentationViewer':
      LazyComponent = React.lazy(() => import('../components/DocumentationViewer'));
      break;
    case 'PagesManager':
      LazyComponent = React.lazy(() => import('../components/PagesManager'));
      break;
    case 'LandingPageWithFramework':
      LazyComponent = React.lazy(() => import('../components/LandingPageWithFramework'));
      break;
    case 'TestDocumentationPage':
      LazyComponent = React.lazy(() => import('../components/TestDocumentationPage'));
      break;
    case 'AssetEditorTest':
      LazyComponent = React.lazy(() => import('../components/AssetEditorTest'));
      break;
    case 'BranchListingPage':
      LazyComponent = React.lazy(() => import('../components/BranchListingPage'));
      break;
    case 'NotFound':
      LazyComponent = React.lazy(() => import('../components/NotFound'));
      break;
    
    // DAK Components
    case 'DAKDashboard':
      LazyComponent = React.lazy(() => import('../components/DAKDashboard'));
      break;
    case 'DAKDashboardWithFramework':
      LazyComponent = React.lazy(() => import('../components/DAKDashboardWithFramework'));
      break;
    case 'TestingViewer':
      LazyComponent = React.lazy(() => import('../components/TestingViewer'));
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
  
  return [
    <Route key={`${routeName}-base`} path={basePath} element={<LazyComponent />} />,
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
  const config = window.getSGEXRouteConfig();
  
  if (!config) {
    console.warn('SGEX route configuration not loaded, falling back to minimal routes');
    return [
      <Route key="fallback-home" path="/" element={<div>Loading...</div>} />,
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

  // Generate test routes (main deployment only)
  if (config.deployType === 'main' && config.testRoutes) {
    config.testRoutes.forEach((testRoute, index) => {
      const LazyComponent = createLazyComponent('DAKDashboardWithFramework'); // Use dashboard component for test routes
      routes.push(
        <Route 
          key={`test-route-${index}`}
          path={testRoute.path}
          element={<LazyComponent />}
        />
      );
    });
  }

  return routes;
}

/**
 * Get list of valid DAK components for URL validation
 * @returns {Array} Array of valid DAK component names
 */
export function getValidDAKComponents() {
  const config = window.getSGEXRouteConfig();
  return config ? config.getDAKComponentNames() : [];
}

/**
 * Check if a component is valid for routing
 * @param {string} componentName - Component name to validate
 * @returns {boolean} True if component is valid
 */
export function isValidComponent(componentName) {
  const config = window.getSGEXRouteConfig();
  return config ? config.isValidComponent(componentName) : false;
}

/**
 * Utility functions for lazy route generation
 */
const LazyRouteUtils = {
  generateLazyRoutes,
  getValidDAKComponents,
  isValidComponent
};

export default LazyRouteUtils;