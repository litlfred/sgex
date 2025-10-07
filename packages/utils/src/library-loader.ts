/**
 * SGEX Library Loader Service
 * 
 * Handles lazy loading of heavy JavaScript libraries to optimize initial page load performance.
 * This service provides:
 * 1. Lazy loading of external libraries (BPMN.js, Octokit, js-yaml, etc.)
 * 2. Module caching to prevent repeated imports
 * 3. Optimized imports with error handling
 * 
 * Migrated from src/services/libraryLoaderService.js for better separation of concerns.
 */

// Cache for lazy-loaded modules to avoid repeated imports
const moduleCache = new Map<string, any>();

/**
 * Lazy load Octokit for GitHub API operations
 * @returns Promise<Octokit> Octokit constructor
 */
export async function lazyLoadOctokit(): Promise<any> {
  const cacheKey = 'octokit';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  try {
    const { Octokit } = await import('@octokit/rest');
    moduleCache.set(cacheKey, Octokit);
    return Octokit;
  } catch (error) {
    throw new Error(`Failed to load Octokit: ${error}`);
  }
}

/**
 * Lazy load BPMN.js Modeler for BPMN editing
 * @returns Promise<BpmnModeler> BpmnModeler constructor
 */
export async function lazyLoadBpmnModeler(): Promise<any> {
  const cacheKey = 'bpmn-modeler';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  try {
    const BpmnModeler = await import('bpmn-js/lib/Modeler');
    const modeler = (BpmnModeler as any).default;
    moduleCache.set(cacheKey, modeler);
    return modeler;
  } catch (error) {
    throw new Error(`Failed to load BPMN Modeler: ${error}`);
  }
}

/**
 * Lazy load BPMN.js Viewer for BPMN viewing
 * @returns Promise<BpmnViewer> BpmnViewer constructor
 */
export async function lazyLoadBpmnViewer(): Promise<any> {
  const cacheKey = 'bpmn-viewer';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  try {
    const BpmnViewer = await import('bpmn-js/lib/Viewer');
    const viewer = (BpmnViewer as any).default;
    moduleCache.set(cacheKey, viewer);
    return viewer;
  } catch (error) {
    throw new Error(`Failed to load BPMN Viewer: ${error}`);
  }
}

/**
 * Lazy load js-yaml for YAML parsing
 * @returns Promise<yaml> yaml library
 */
export async function lazyLoadYaml(): Promise<any> {
  const cacheKey = 'yaml';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  try {
    const yaml = await import('js-yaml');
    moduleCache.set(cacheKey, yaml);
    return yaml;
  } catch (error) {
    throw new Error(`Failed to load js-yaml: ${error}`);
  }
}

/**
 * Lazy load AJV for JSON schema validation
 * @returns Promise<Ajv> AJV constructor
 */
export async function lazyLoadAjv(): Promise<any> {
  const cacheKey = 'ajv';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  try {
    const Ajv = await import('ajv');
    moduleCache.set(cacheKey, (Ajv as any).default);
    return (Ajv as any).default;
  } catch (error) {
    throw new Error(`Failed to load AJV: ${error}`);
  }
}

/**
 * Lazy load AJV formats for additional format validation
 * @returns Promise<addFormats> AJV formats function
 */
export async function lazyLoadAjvFormats(): Promise<any> {
  const cacheKey = 'ajv-formats';
  
  if (moduleCache.has(cacheKey)) {
    return moduleCache.get(cacheKey);
  }
  
  try {
    const addFormats = await import('ajv-formats');
    moduleCache.set(cacheKey, (addFormats as any).default);
    return (addFormats as any).default;
  } catch (error) {
    throw new Error(`Failed to load AJV formats: ${error}`);
  }
}

/**
 * Clear the module cache (useful for testing or memory management)
 */
export function clearModuleCache(): void {
  moduleCache.clear();
}

/**
 * Get cache statistics
 * @returns Object with cache information
 */
export function getCacheInfo(): { size: number; keys: string[] } {
  return {
    size: moduleCache.size,
    keys: Array.from(moduleCache.keys())
  };
}