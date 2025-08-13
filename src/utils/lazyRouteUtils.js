import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';

/**
 * SGEX Unified Lazy Loading Utility
 * 
 * This utility provides comprehensive lazy loading capabilities for both
 * React components (routes) and heavy JavaScript libraries to optimize
 * initial page load performance.
 * 
 * Features:
 * 1. Route-level lazy loading of React components using React.lazy()
 * 2. Library-level lazy loading of heavy dependencies (BPMN.js, Octokit, etc.)
 * 3. Automatic Suspense boundaries with loading fallbacks
 * 4. Dynamic route generation from configuration
 * 5. Support for different deployment types (main vs deploy)
 * 6. DAK component pattern generation (/{component}/:user/:repo/:branch/*)
 * 7. Module caching to prevent repeated imports
 * 
 * Usage:
 *   // Route lazy loading
 *   const routes = generateLazyRoutes();
 *   return <Routes>{routes}</Routes>
 *   
 *   // Library lazy loading
 *   const Octokit = await lazyLoadOctokit();
 *   const modeler = await createLazyBpmnModeler();
 */

// Cache for lazy-loaded components to avoid re-creating them
const lazyComponentCache = new Map();

// Cache for lazy-loaded modules to avoid repeated imports
const moduleCache = new Map();

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
  const config = (typeof window !== 'undefined' && window.getSGEXRouteConfig) 
    ? window.getSGEXRouteConfig() 
    : null;
  
  if (!config) {
    console.warn('SGEX route configuration not loaded, using minimal fallback routes');
    // Minimal fallback routes for development
    return [
      <Route key="docs" path="/docs" element={<>{React.createElement(createLazyComponent('DocumentationViewer'))}</>} />,
      <Route key="docs-id" path="/docs/:docId" element={<>{React.createElement(createLazyComponent('DocumentationViewer'))}</>} />,
      <Route key="fallback-home" path="/" element={<>{React.createElement(createLazyComponent('WelcomePage'))}</>} />,
      <Route key="fallback-404" path="*" element={<>{React.createElement(createLazyComponent('NotFound'))}</>} />
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

// ============================================================================
// LIBRARY LAZY LOADING FUNCTIONS
// ============================================================================

/**
 * Lazy load Octokit for GitHub API operations
 * @returns {Promise<Octokit>} Octokit constructor
 */
export async function lazyLoadOctokit() {
  const cacheKey = 'octokit';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const { Octokit } = await import('@octokit/rest');
  moduleCache.set(cacheKey, Octokit);
  return Octokit;
}

/**
 * Lazy load BPMN.js Modeler for BPMN editing
 * @returns {Promise<BpmnModeler>} BpmnModeler constructor
 */
export async function lazyLoadBpmnModeler() {
  const cacheKey = 'bpmn-modeler';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const BpmnModeler = await import('bpmn-js/lib/Modeler');
  const modeler = BpmnModeler.default;
  moduleCache.set(cacheKey, modeler);
  return modeler;
}

/**
 * Lazy load BPMN.js Viewer for BPMN viewing
 * @returns {Promise<BpmnViewer>} BpmnViewer constructor
 */
export async function lazyLoadBpmnViewer() {
  const cacheKey = 'bpmn-viewer';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const BpmnViewer = await import('bpmn-js/lib/NavigatedViewer');
  const viewer = BpmnViewer.default;
  moduleCache.set(cacheKey, viewer);
  return viewer;
}

/**
 * Lazy load js-yaml for YAML parsing
 * @returns {Promise<yaml>} js-yaml module
 */
export async function lazyLoadYaml() {
  const cacheKey = 'js-yaml';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const yaml = await import('js-yaml');
  const yamlModule = yaml.default;
  moduleCache.set(cacheKey, yamlModule);
  return yamlModule;
}

/**
 * Lazy load MDEditor for markdown editing
 * @returns {Promise<MDEditor>} MDEditor component
 */
export async function lazyLoadMDEditor() {
  const cacheKey = 'md-editor';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const MDEditor = await import('@uiw/react-md-editor');
  const editor = MDEditor.default;
  moduleCache.set(cacheKey, editor);
  return editor;
}

/**
 * Lazy load react-syntax-highlighter for code syntax highlighting
 * @returns {Promise<SyntaxHighlighter>} Prism SyntaxHighlighter
 */
export async function lazyLoadSyntaxHighlighter() {
  const cacheKey = 'syntax-highlighter';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const { Prism } = await import('react-syntax-highlighter');
  moduleCache.set(cacheKey, Prism);
  return Prism;
}

/**
 * Lazy load syntax highlighter styles
 * @returns {Promise<Object>} oneLight style theme
 */
export async function lazyLoadSyntaxHighlighterStyles() {
  const cacheKey = 'syntax-highlighter-styles';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const { oneLight } = await import('react-syntax-highlighter/dist/esm/styles/prism');
  moduleCache.set(cacheKey, oneLight);
  return oneLight;
}

/**
 * Lazy load ReactMarkdown for markdown rendering
 * @returns {Promise<ReactMarkdown>} ReactMarkdown component
 */
export async function lazyLoadReactMarkdown() {
  const cacheKey = 'react-markdown';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const ReactMarkdown = await import('react-markdown');
  const component = ReactMarkdown.default;
  moduleCache.set(cacheKey, component);
  return component;
}

/**
 * Lazy load AJV for JSON schema validation
 * @returns {Promise<Ajv>} AJV constructor
 */
export async function lazyLoadAjv() {
  const cacheKey = 'ajv';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const AjvModule = await import('ajv');
  const Ajv = AjvModule.default;
  moduleCache.set(cacheKey, Ajv);
  return Ajv;
}

/**
 * Lazy load AJV formats for additional validation formats
 * @returns {Promise<Function>} addFormats function
 */
export async function lazyLoadAjvFormats() {
  const cacheKey = 'ajv-formats';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const addFormatsModule = await import('ajv-formats');
  const addFormats = addFormatsModule.default;
  moduleCache.set(cacheKey, addFormats);
  return addFormats;
}

/**
 * Lazy load DOMPurify for HTML sanitization
 * @returns {Promise<DOMPurify>} DOMPurify instance
 */
export async function lazyLoadDOMPurify() {
  const cacheKey = 'dompurify';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const DOMPurifyModule = await import('dompurify');
  let DOMPurify = DOMPurifyModule.default;
  
  // In browser environment, DOMPurify might need to be initialized with window
  if (typeof window !== 'undefined' && typeof DOMPurify === 'function') {
    // Some versions of DOMPurify export a factory function that needs the window object
    try {
      DOMPurify = DOMPurify(window);
    } catch (error) {
      // If it fails, DOMPurify might already be the correct object
      console.debug('DOMPurify initialization note:', error.message);
    }
  }
  
  moduleCache.set(cacheKey, DOMPurify);
  return DOMPurify;
}

/**
 * Lazy load rehype-raw for HTML table rendering in markdown
 * @returns {Promise<rehypeRaw>} rehypeRaw plugin
 */
export async function lazyLoadRehypeRaw() {
  const cacheKey = 'rehype-raw';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const rehypeRawModule = await import('rehype-raw');
  const rehypeRaw = rehypeRawModule.default;
  moduleCache.set(cacheKey, rehypeRaw);
  return rehypeRaw;
}

/**
 * Create a lazy-loaded Octokit instance
 * @param {Object} options - Octokit configuration options
 * @returns {Promise<Octokit>} Configured Octokit instance
 */
export async function createLazyOctokit(options = {}) {
  const Octokit = await lazyLoadOctokit();
  return new Octokit(options);
}

/**
 * Create a lazy-loaded BPMN Modeler instance
 * @param {Object} options - BpmnModeler configuration options
 * @returns {Promise<BpmnModeler>} Configured BpmnModeler instance
 */
export async function createLazyBpmnModeler(options = {}) {
  const BpmnModeler = await lazyLoadBpmnModeler();
  return new BpmnModeler(options);
}

/**
 * Create a lazy-loaded BPMN Viewer instance
 * @param {Object} options - BpmnViewer configuration options
 * @returns {Promise<BpmnViewer>} Configured BpmnViewer instance
 */
export async function createLazyBpmnViewer(options = {}) {
  const BpmnViewer = await lazyLoadBpmnViewer();
  return new BpmnViewer(options);
}

/**
 * Create a lazy-loaded AJV instance with formats
 * @param {Object} options - AJV configuration options
 * @returns {Promise<Ajv>} Configured AJV instance with formats added
 */
export async function createLazyAjv(options = {}) {
  const Ajv = await lazyLoadAjv();
  const addFormats = await lazyLoadAjvFormats();
  const ajv = new Ajv(options);
  addFormats(ajv);
  return ajv;
}

/**
 * Clear the module cache (useful for testing)
 */
export function clearLazyImportCache() {
  moduleCache.clear();
}

/**
 * Unified lazy loading utilities for routes and libraries
 */
const LazyUtils = {
  // Route lazy loading functions
  generateLazyRoutes,
  getValidDAKComponents,
  isValidComponent,
  
  // Library lazy loading functions
  lazyLoadOctokit,
  lazyLoadBpmnModeler,
  lazyLoadBpmnViewer,
  lazyLoadYaml,
  lazyLoadMDEditor,
  lazyLoadSyntaxHighlighter,
  lazyLoadSyntaxHighlighterStyles,
  lazyLoadReactMarkdown,
  lazyLoadAjv,
  lazyLoadAjvFormats,
  lazyLoadDOMPurify,
  lazyLoadRehypeRaw,
  createLazyOctokit,
  createLazyBpmnModeler,
  createLazyBpmnViewer,
  createLazyAjv,
  clearLazyImportCache
};

export default LazyUtils;