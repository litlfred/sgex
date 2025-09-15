/**
 * SGEX Library Loader Service
 * 
 * Handles lazy loading of heavy JavaScript libraries to optimize initial page load performance.
 * This service provides:
 * 1. Lazy loading of external libraries (BPMN.js, Octokit, js-yaml, etc.)
 * 2. Module caching to prevent repeated imports
 * 3. Optimized imports with error handling
 * 
 * Split from lazyRouteUtils.js for better separation of concerns.
 */

// Cache for lazy-loaded modules to avoid repeated imports
const moduleCache = new Map();

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
 * Lazy load html2canvas for screenshot functionality
 * @returns {Promise<html2canvas>} html2canvas function
 */
export async function lazyLoadHtml2Canvas() {
  const cacheKey = 'html2canvas';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default;
  moduleCache.set(cacheKey, html2canvas);
  return html2canvas;
}

/**
 * Lazy load React Router DOM for routing functionality
 * @returns {Promise<Object>} React Router DOM module
 */
export async function lazyLoadReactRouter() {
  const cacheKey = 'react-router-dom';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const reactRouterModule = await import('react-router-dom');
  moduleCache.set(cacheKey, reactRouterModule);
  return reactRouterModule;
}

/**
 * Lazy load i18next for internationalization
 * @returns {Promise<i18n>} i18next instance
 */
export async function lazyLoadI18n() {
  const cacheKey = 'i18next';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const i18nModule = await import('i18next');
  const i18n = i18nModule.default;
  moduleCache.set(cacheKey, i18n);
  return i18n;
}

/**
 * Lazy load react-i18next for React i18n integration
 * @returns {Promise<Object>} react-i18next module
 */
export async function lazyLoadReactI18n() {
  const cacheKey = 'react-i18next';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const reactI18nModule = await import('react-i18next');
  moduleCache.set(cacheKey, reactI18nModule);
  return reactI18nModule;
}

/**
 * Lazy load web-vitals for performance monitoring
 * @returns {Promise<Object>} web-vitals module
 */
export async function lazyLoadWebVitals() {
  const cacheKey = 'web-vitals';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const webVitalsModule = await import('web-vitals');
  moduleCache.set(cacheKey, webVitalsModule);
  return webVitalsModule;
}

/**
 * Lazy load node-fetch for server-side fetch operations
 * @returns {Promise<fetch>} fetch function
 */
export async function lazyLoadNodeFetch() {
  const cacheKey = 'node-fetch';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  // Only load node-fetch in Node.js environment
  if (typeof window === 'undefined') {
    const fetchModule = await import('node-fetch');
    const fetchFn = fetchModule.default;
    moduleCache.set(cacheKey, fetchFn);
    return fetchFn;
  } else {
    // Return browser's native fetch
    moduleCache.set(cacheKey, fetch);
    return fetch;
  }
}

/**
 * Lazy load BPMN Moddle for BPMN model processing
 * @returns {Promise<BpmnModdle>} BpmnModdle constructor
 */
export async function lazyLoadBpmnModdle() {
  const cacheKey = 'bpmn-moddle';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const BpmnModdleModule = await import('bpmn-moddle');
  const BpmnModdle = BpmnModdleModule.default;
  moduleCache.set(cacheKey, BpmnModdle);
  return BpmnModdle;
}

/**
 * Lazy load React Testing Library for component testing
 * @returns {Promise<Object>} React Testing Library module
 */
export async function lazyLoadReactTestingLibrary() {
  const cacheKey = 'react-testing-library';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const rtlModule = await import('@testing-library/react');
  moduleCache.set(cacheKey, rtlModule);
  return rtlModule;
}

/**
 * Lazy load User Event for testing user interactions
 * @returns {Promise<Object>} User Event module
 */
export async function lazyLoadUserEvent() {
  const cacheKey = 'user-event';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  const userEventModule = await import('@testing-library/user-event');
  moduleCache.set(cacheKey, userEventModule);
  return userEventModule;
}

/**
 * Preload critical libraries in the background
 * This improves perceived performance by loading commonly used libraries
 */
export function preloadCriticalLibraries() {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  // Preload after initial page load to avoid blocking
  setTimeout(() => {
    // Preload commonly used libraries
    lazyLoadOctokit().catch(() => {}); // GitHub API is frequently used
    lazyLoadYaml().catch(() => {}); // YAML parsing is common
    lazyLoadReactMarkdown().catch(() => {}); // Markdown rendering is common
    lazyLoadDOMPurify().catch(() => {}); // Security is important
  }, 1000); // Wait 1 second after page load
}

/**
 * Preload editor libraries when editing is likely
 */
export function preloadEditorLibraries() {
  setTimeout(() => {
    lazyLoadBpmnModeler().catch(() => {});
    lazyLoadBpmnViewer().catch(() => {});
    lazyLoadMDEditor().catch(() => {});
    lazyLoadAjv().catch(() => {});
    lazyLoadAjvFormats().catch(() => {});
  }, 500);
}

/**
 * Clear the module cache (useful for testing)
 */
export function clearLazyImportCache() {
  moduleCache.clear();
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus() {
  return {
    cached: Array.from(moduleCache.keys()),
    size: moduleCache.size,
    memoryUsage: moduleCache.size * 50 // Rough estimate in KB
  };
}

/**
 * Library loader utilities for unified access
 */
const LibraryLoaderService = {
  // Core libraries
  lazyLoadOctokit,
  lazyLoadBpmnModeler,
  lazyLoadBpmnViewer,
  lazyLoadBpmnModdle,
  lazyLoadYaml,
  
  // Editor libraries
  lazyLoadMDEditor,
  lazyLoadSyntaxHighlighter,
  lazyLoadSyntaxHighlighterStyles,
  
  // Rendering libraries
  lazyLoadReactMarkdown,
  lazyLoadDOMPurify,
  lazyLoadRehypeRaw,
  
  // Validation libraries
  lazyLoadAjv,
  lazyLoadAjvFormats,
  
  // Utility libraries
  lazyLoadHtml2Canvas,
  lazyLoadReactRouter,
  lazyLoadI18n,
  lazyLoadReactI18n,
  lazyLoadWebVitals,
  lazyLoadNodeFetch,
  
  // Testing libraries
  lazyLoadReactTestingLibrary,
  lazyLoadUserEvent,
  
  // Preloading functions
  preloadCriticalLibraries,
  preloadEditorLibraries,
  
  // Utility functions
  clearLazyImportCache,
  getCacheStatus
};

export default LibraryLoaderService;