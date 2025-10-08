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
/**
 * Lazy load Octokit for GitHub API operations
 * @returns Promise<Octokit> Octokit constructor
 */
export declare function lazyLoadOctokit(): Promise<any>;
/**
 * Lazy load BPMN.js Modeler for BPMN editing
 * @returns Promise<BpmnModeler> BpmnModeler constructor
 */
export declare function lazyLoadBpmnModeler(): Promise<any>;
/**
 * Lazy load BPMN.js Viewer for BPMN viewing
 * @returns Promise<BpmnViewer> BpmnViewer constructor
 */
export declare function lazyLoadBpmnViewer(): Promise<any>;
/**
 * Lazy load js-yaml for YAML parsing
 * @returns Promise<yaml> yaml library
 */
export declare function lazyLoadYaml(): Promise<any>;
/**
 * Lazy load AJV for JSON schema validation
 * @returns Promise<Ajv> AJV constructor
 */
export declare function lazyLoadAjv(): Promise<any>;
/**
 * Lazy load AJV formats for additional format validation
 * @returns Promise<addFormats> AJV formats function
 */
export declare function lazyLoadAjvFormats(): Promise<any>;
/**
 * Clear the module cache (useful for testing or memory management)
 */
export declare function clearModuleCache(): void;
/**
 * Get cache statistics
 * @returns Object with cache information
 */
export declare function getCacheInfo(): {
    size: number;
    keys: string[];
};
//# sourceMappingURL=library-loader.d.ts.map