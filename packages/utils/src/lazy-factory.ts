/**
 * SGEX Lazy Factory Service
 * 
 * Handles creation of configured instances for lazy-loaded libraries.
 * This service provides:
 * 1. Factory functions for creating pre-configured instances
 * 2. Instance configuration with sensible defaults
 * 3. Convenience functions for common use cases
 * 
 * Migrated from src/services/lazyFactoryService.js for better separation of concerns.
 */

import { 
  lazyLoadOctokit, 
  lazyLoadBpmnModeler, 
  lazyLoadBpmnViewer, 
  lazyLoadAjv,
  lazyLoadAjvFormats
} from './library-loader';

/**
 * Configuration options for Octokit
 */
export interface OctokitOptions {
  auth?: string;
  baseUrl?: string;
  userAgent?: string;
  previews?: string[];
  timeZone?: string;
  request?: {
    timeout?: number;
    retries?: number;
  };
}

/**
 * Configuration options for BPMN components
 */
export interface BpmnOptions {
  container?: string | HTMLElement;
  width?: number;
  height?: number;
  moddleExtensions?: any;
  additionalModules?: any[];
  keyboard?: {
    bindTo?: HTMLElement;
  };
}

/**
 * Configuration options for AJV
 */
export interface AjvOptions {
  allErrors?: boolean;
  verbose?: boolean;
  strict?: boolean;
  validateFormats?: boolean;
  addUsedSchema?: boolean;
}

/**
 * Create a lazy-loaded Octokit instance
 * @param options - Octokit configuration options
 * @returns Promise<Octokit> Configured Octokit instance
 */
export async function createLazyOctokit(options: OctokitOptions = {}): Promise<any> {
  const Octokit = await lazyLoadOctokit();
  return new Octokit(options);
}

/**
 * Create a lazy-loaded BPMN Modeler instance
 * @param options - BpmnModeler configuration options
 * @returns Promise<BpmnModeler> Configured BpmnModeler instance
 */
export async function createLazyBpmnModeler(options: BpmnOptions = {}): Promise<any> {
  const BpmnModeler = await lazyLoadBpmnModeler();
  return new BpmnModeler(options);
}

/**
 * Create a lazy-loaded BPMN Viewer instance
 * @param options - BpmnViewer configuration options
 * @returns Promise<BpmnViewer> Configured BpmnViewer instance
 */
export async function createLazyBpmnViewer(options: BpmnOptions = {}): Promise<any> {
  const BpmnViewer = await lazyLoadBpmnViewer();
  return new BpmnViewer(options);
}

/**
 * Create a lazy-loaded AJV instance with common configuration
 * @param options - AJV configuration options
 * @returns Promise<Ajv> Configured AJV instance
 */
export async function createLazyAjv(options: AjvOptions = {}): Promise<any> {
  const [Ajv, addFormats] = await Promise.all([
    lazyLoadAjv(),
    lazyLoadAjvFormats()
  ]);
  
  const defaultOptions: AjvOptions = {
    allErrors: true,
    verbose: true,
    strict: true,
    validateFormats: true,
    addUsedSchema: false,
    ...options
  };
  
  const ajv = new Ajv(defaultOptions);
  addFormats(ajv);
  
  return ajv;
}

/**
 * Factory function for creating BPMN Modeler with DAK-specific configuration
 * @param container - Container element or selector
 * @param additionalModules - Additional BPMN modules
 * @returns Promise<BpmnModeler> DAK-configured BPMN Modeler
 */
export async function createDAKBpmnModeler(
  container: string | HTMLElement,
  additionalModules: any[] = []
): Promise<any> {
  const options: BpmnOptions = {
    container,
    additionalModules: [
      // Default DAK-specific modules could be added here
      ...additionalModules
    ],
    keyboard: {
      bindTo: typeof container === 'string' ? document.querySelector(container) as HTMLElement : container
    }
  };
  
  return createLazyBpmnModeler(options);
}

/**
 * Factory function for creating BPMN Viewer with DAK-specific configuration
 * @param container - Container element or selector
 * @returns Promise<BpmnViewer> DAK-configured BPMN Viewer
 */
export async function createDAKBpmnViewer(container: string | HTMLElement): Promise<any> {
  const options: BpmnOptions = {
    container
  };
  
  return createLazyBpmnViewer(options);
}

/**
 * Factory function for creating AJV instance with DAK schema validation
 * @returns Promise<Ajv> DAK-configured AJV instance
 */
export async function createDAKAjv(): Promise<any> {
  const options: AjvOptions = {
    allErrors: true,
    verbose: true,
    strict: false, // DAK schemas might not be strict mode compatible
    validateFormats: true,
    addUsedSchema: false
  };
  
  return createLazyAjv(options);
}

/**
 * Factory function for creating GitHub API client with sensible defaults
 * @param auth - GitHub token or auth configuration
 * @returns Promise<Octokit> GitHub-configured Octokit instance
 */
export async function createGitHubClient(auth?: string): Promise<any> {
  const options: OctokitOptions = {
    auth,
    userAgent: 'SGEX-Workbench/1.0',
    request: {
      timeout: 15000, // 15 second timeout
      retries: 3
    }
  };
  
  return createLazyOctokit(options);
}