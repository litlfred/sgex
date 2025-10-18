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
 * 
 * @module componentRouteService
 */

import React, { Suspense } from 'react';

// Lazy import Route to avoid issues during testing
let Route: any;
try {
  const ReactRouterDom = require('react-router-dom');
  Route = ReactRouterDom.Route;
} catch (error) {
  // Fallback for testing environments
  Route = ({ children, element, ...props }: any) => element || children || null;
}

/**
 * Route configuration for DAK components
 */
export interface DAKComponentConfig {
  /** Component name */
  component: string;
  /** Whether to include branch parameter */
  includeBranch?: boolean;
}

/**
 * Route configuration for standard components
 */
export interface StandardComponentConfig {
  /** Component name */
  component: string;
  /** Route path */
  path?: string;
}

/**
 * Main route configuration
 */
export interface RouteConfig {
  /** Deployment type */
  deployType: string;
  /** DAK components configuration */
  dakComponents?: Record<string, DAKComponentConfig>;
  /** Standard components configuration */
  standardComponents?: Record<string, StandardComponentConfig>;
  /** Additional components */
  components?: Record<string, StandardComponentConfig>;
  /** Get DAK component names */
  getDAKComponentNames?: () => string[];
  /** Check if component is valid */
  isValidComponent?: (componentName: string) => boolean;
}

// Cache for lazy-loaded components to avoid re-creating them
const lazyComponentCache = new Map<string, React.ComponentType<any>>();

/**
 * Create a lazy-loaded component with Suspense boundary
 */
function createLazyComponent(componentName: string): React.ComponentType<any> {
  const cacheKey = componentName;
  
  if (lazyComponentCache.has(cacheKey)) {
    return lazyComponentCache.get(cacheKey)!;
  }

  // Create lazy component with explicit imports to avoid webpack warnings
  let LazyComponent: React.LazyExoticComponent<React.ComponentType<any>>;
  
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
    case 'LandingPage':
      LazyComponent = React.lazy(() => import('../components/LandingPage'));
      break;
    case 'NotFound':
      LazyComponent = React.lazy(() => import('../components/NotFound'));
      break;
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
    case 'PersonaViewer':
      LazyComponent = React.lazy(() => import('../components/PersonaViewer'));
      break;
    default:
      console.warn(`Unknown component ${componentName}, using fallback`);
      LazyComponent = React.lazy(() => import('../components/NotFound'));
      break;
  }
  
  // Wrap with Suspense and error boundary
  const SuspenseWrapper = (props: any) => (
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
 * Generate routes for a DAK component
 */
function generateDAKRoutes(routeName: string, dakComponent: DAKComponentConfig): React.JSX.Element[] {
  const Component = createLazyComponent(dakComponent.component);
  const routes: React.JSX.Element[] = [];

  if (dakComponent.includeBranch) {
    routes.push(
      <Route key={`${routeName}-full`} path={`/${routeName}/:user/:repo/:branch`} element={<Component />} />,
      <Route key={`${routeName}-no-branch`} path={`/${routeName}/:user/:repo`} element={<Component />} />
    );
  } else {
    routes.push(
      <Route key={`${routeName}-full`} path={`/${routeName}/:user/:repo`} element={<Component />} />
    );
  }

  return routes;
}

/**
 * Generate routes for a standard component
 */
function generateStandardRoutes(componentName: string, componentConfig: StandardComponentConfig): React.JSX.Element[] {
  const Component = createLazyComponent(componentConfig.component);
  const path = componentConfig.path || `/${componentName}`;

  return [
    <Route key={componentName} path={path} element={<Component />} />
  ];
}

/**
 * Generate lazy routes from configuration
 */
export function generateLazyRoutes(): React.JSX.Element[] {
  // Try to get route configuration from global
  let config: RouteConfig | null = null;
  try {
    if (typeof window !== 'undefined' && typeof (window as any).getSGEXRouteConfig === 'function') {
      config = (window as any).getSGEXRouteConfig();
    }
  } catch (error) {
    console.error('Error loading route configuration:', error);
  }

  // If config loading failed, show error
  if (!config) {
    const ErrorDisplay = () => (
      <div style={{ 
        padding: '40px 20px', 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        color: '#856404'
      }}>
        <h2 style={{ color: '#856404', marginTop: 0 }}>⚠️ Configuration Error</h2>
        <p><strong>Failed to load route configuration.</strong></p>
        <p>This usually means:</p>
        <ul style={{ color: '#856404' }}>
          <li>The <code>routes-config.json</code> file is missing from the build</li>
          <li>The deployment has not completed successfully</li>
        </ul>
        <h3 style={{ color: '#856404' }}>Troubleshooting:</h3>
        <ol style={{ color: '#856404' }}>
          <li>Check the browser console for detailed error messages</li>
          <li>Verify all deployment files are present</li>
          <li>Ensure <code>routeConfig.js</code> is loaded with correct PUBLIC_URL</li>
          <li>For branch deployments, verify files are in the correct directory</li>
        </ol>
        <p style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: '#fff', 
          border: '1px solid #ffc107',
          borderRadius: '4px',
          color: '#856404'
        }}>
          <strong>Current URL:</strong> {window.location.href}<br/>
          <strong>Hostname:</strong> {window.location.hostname}<br/>
          <strong>Pathname:</strong> {window.location.pathname}
        </p>
      </div>
    );
    
    return [
      <Route key="error-all" path="*" element={<ErrorDisplay />} />
    ];
  }

  const routes: React.JSX.Element[] = [];

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
 */
export function getValidDAKComponents(): string[] {
  try {
    if (typeof window !== 'undefined' && typeof (window as any).getSGEXRouteConfig === 'function') {
      const config: RouteConfig = (window as any).getSGEXRouteConfig();
      return config && config.getDAKComponentNames ? config.getDAKComponentNames() : [];
    }
  } catch (error) {
    console.warn('Error getting DAK components:', error);
  }
  return [];
}

/**
 * Check if a component is valid for routing
 */
export function isValidComponent(componentName: string): boolean {
  try {
    if (typeof window !== 'undefined' && typeof (window as any).getSGEXRouteConfig === 'function') {
      const config: RouteConfig = (window as any).getSGEXRouteConfig();
      return config && config.isValidComponent ? config.isValidComponent(componentName) : false;
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
