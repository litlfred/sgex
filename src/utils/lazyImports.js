/**
 * Lazy Import Utilities
 * 
 * Provides centralized lazy loading functions for heavy libraries to improve
 * initial page responsiveness. These utilities ensure that large dependencies
 * are only loaded when actually needed.
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
 * Clear the module cache (useful for testing)
 */
export function clearLazyImportCache() {
  moduleCache.clear();
}

/**
 * Utility functions for lazy loading heavy dependencies
 */
const LazyImports = {
  lazyLoadOctokit,
  lazyLoadBpmnModeler,
  lazyLoadBpmnViewer,
  lazyLoadYaml,
  lazyLoadMDEditor,
  createLazyOctokit,
  createLazyBpmnModeler,
  createLazyBpmnViewer,
  clearLazyImportCache
};

export default LazyImports;