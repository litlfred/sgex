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
 * Clear the module cache (useful for testing)
 */
export function clearLazyImportCache() {
  moduleCache.clear();
}

/**
 * Library loader utilities for unified access
 */
const LibraryLoaderService = {
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
  clearLazyImportCache
};

export default LibraryLoaderService;