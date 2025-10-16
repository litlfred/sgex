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
 * 
 * @module lazyFactoryService
 */

import { 
  lazyLoadOctokit, 
  lazyLoadBpmnModeler, 
  lazyLoadBpmnViewer, 
  lazyLoadAjv, 
  lazyLoadAjvFormats 
} from './libraryLoaderService';

/**
 * Octokit configuration options
 * @example { "auth": "ghp_token123" }
 */
export interface OctokitOptions {
  /** GitHub Personal Access Token */
  auth?: string;
  /** Base URL for GitHub API */
  baseUrl?: string;
  /** Additional options */
  [key: string]: any;
}

/**
 * BPMN Modeler configuration options
 * @example { "container": "#canvas", "keyboard": { "bindTo": document } }
 */
export interface BpmnModelerOptions {
  /** Container element or selector */
  container?: string | HTMLElement;
  /** Keyboard configuration */
  keyboard?: {
    /** Element to bind keyboard events */
    bindTo?: Document | HTMLElement;
  };
  /** Additional options */
  [key: string]: any;
}

/**
 * BPMN Viewer configuration options
 * @example { "container": "#canvas" }
 */
export interface BpmnViewerOptions {
  /** Container element or selector */
  container?: string | HTMLElement;
  /** Additional options */
  [key: string]: any;
}

/**
 * AJV configuration options
 * @example { "allErrors": true, "strict": false }
 */
export interface AjvOptions {
  /** Collect all errors */
  allErrors?: boolean;
  /** Strict mode */
  strict?: boolean;
  /** Coerce types */
  coerceTypes?: boolean;
  /** Additional options */
  [key: string]: any;
}

/**
 * Create a lazy-loaded Octokit instance
 * 
 * @openapi
 * /api/factory/octokit:
 *   post:
 *     summary: Create Octokit instance
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               auth:
 *                 type: string
 *     responses:
 *       200:
 *         description: Octokit instance created
 */
export async function createLazyOctokit(options: OctokitOptions = {}): Promise<any> {
  const Octokit = await lazyLoadOctokit();
  return new Octokit(options);
}

/**
 * Create a lazy-loaded BPMN Modeler instance
 */
export async function createLazyBpmnModeler(options: BpmnModelerOptions = {}): Promise<any> {
  const BpmnModeler = await lazyLoadBpmnModeler();
  return new BpmnModeler(options);
}

/**
 * Create a lazy-loaded BPMN Viewer instance
 */
export async function createLazyBpmnViewer(options: BpmnViewerOptions = {}): Promise<any> {
  const BpmnViewer = await lazyLoadBpmnViewer();
  return new BpmnViewer(options);
}

/**
 * Create a lazy-loaded AJV instance with formats
 */
export async function createLazyAjv(options: AjvOptions = {}): Promise<any> {
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
