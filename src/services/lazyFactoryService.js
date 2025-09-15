/**
 * SGEX Lazy Factory Service
 * 
 * Handles creation of configured instances for lazy-loaded libraries.
 * This service provides:
 * 1. Factory functions for creating pre-configured instances
 * 2. Instance configuration with sensible defaults
 * 3. Convenience functions for common use cases
 * 
 * Split from lazyRouteUtils.js for better separation of concerns.
 */

import { 
  lazyLoadOctokit, 
  lazyLoadBpmnModeler, 
  lazyLoadBpmnViewer, 
  lazyLoadAjv, 
  lazyLoadAjvFormats,
  lazyLoadMonacoEditor,
  lazyLoadArchimateViewer,
  lazyLoadGraphVizService
} from './libraryLoaderService';

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
 * Create a lazy-loaded Monaco Editor instance
 * @param {Object} options - Monaco Editor configuration options
 * @returns {Promise<MonacoEditor>} Monaco Editor component
 */
export async function createLazyMonacoEditor(options = {}) {
  const MonacoEditor = await lazyLoadMonacoEditor();
  return MonacoEditor;
}

/**
 * Create a lazy-loaded ArchiMate Viewer instance
 * @param {Object} options - ArchiMate viewer configuration options
 * @returns {Promise<ArchiMateViewer>} Configured ArchiMate viewer instance
 */
export async function createLazyArchimateViewer(options = {}) {
  const ArchiMateViewer = await lazyLoadArchimateViewer();
  return new ArchiMateViewer(options);
}

/**
 * Create a lazy-loaded GraphViz Service instance
 * @returns {Promise<GraphVizService>} GraphViz service with layout methods
 */
export async function createLazyGraphVizService() {
  const GraphVizService = await lazyLoadGraphVizService();
  return GraphVizService;
}

/**
 * Lazy factory utilities for unified access
 */
const LazyFactoryService = {
  createLazyOctokit,
  createLazyBpmnModeler,
  createLazyBpmnViewer,
  createLazyAjv,
  createLazyMonacoEditor,
  createLazyArchimateViewer,
  createLazyGraphVizService
};

export default LazyFactoryService;