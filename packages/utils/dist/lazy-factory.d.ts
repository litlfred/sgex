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
export declare function createLazyOctokit(options?: OctokitOptions): Promise<any>;
/**
 * Create a lazy-loaded BPMN Modeler instance
 * @param options - BpmnModeler configuration options
 * @returns Promise<BpmnModeler> Configured BpmnModeler instance
 */
export declare function createLazyBpmnModeler(options?: BpmnOptions): Promise<any>;
/**
 * Create a lazy-loaded BPMN Viewer instance
 * @param options - BpmnViewer configuration options
 * @returns Promise<BpmnViewer> Configured BpmnViewer instance
 */
export declare function createLazyBpmnViewer(options?: BpmnOptions): Promise<any>;
/**
 * Create a lazy-loaded AJV instance with common configuration
 * @param options - AJV configuration options
 * @returns Promise<Ajv> Configured AJV instance
 */
export declare function createLazyAjv(options?: AjvOptions): Promise<any>;
/**
 * Factory function for creating BPMN Modeler with DAK-specific configuration
 * @param container - Container element or selector
 * @param additionalModules - Additional BPMN modules
 * @returns Promise<BpmnModeler> DAK-configured BPMN Modeler
 */
export declare function createDAKBpmnModeler(container: string | HTMLElement, additionalModules?: any[]): Promise<any>;
/**
 * Factory function for creating BPMN Viewer with DAK-specific configuration
 * @param container - Container element or selector
 * @returns Promise<BpmnViewer> DAK-configured BPMN Viewer
 */
export declare function createDAKBpmnViewer(container: string | HTMLElement): Promise<any>;
/**
 * Factory function for creating AJV instance with DAK schema validation
 * @returns Promise<Ajv> DAK-configured AJV instance
 */
export declare function createDAKAjv(): Promise<any>;
/**
 * Factory function for creating GitHub API client with sensible defaults
 * @param auth - GitHub token or auth configuration
 * @returns Promise<Octokit> GitHub-configured Octokit instance
 */
export declare function createGitHubClient(auth?: string): Promise<any>;
//# sourceMappingURL=lazy-factory.d.ts.map