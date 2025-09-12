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
  lazyLoadAjvFormats 
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
 * Lazy factory utilities for unified access
 */
const LazyFactoryService = {
  createLazyOctokit,
  createLazyBpmnModeler,
  createLazyBpmnViewer,
  createLazyAjv
};

export default LazyFactoryService;