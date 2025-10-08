"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLazyOctokit = createLazyOctokit;
exports.createLazyBpmnModeler = createLazyBpmnModeler;
exports.createLazyBpmnViewer = createLazyBpmnViewer;
exports.createLazyAjv = createLazyAjv;
exports.createDAKBpmnModeler = createDAKBpmnModeler;
exports.createDAKBpmnViewer = createDAKBpmnViewer;
exports.createDAKAjv = createDAKAjv;
exports.createGitHubClient = createGitHubClient;
const library_loader_1 = require("./library-loader");
/**
 * Create a lazy-loaded Octokit instance
 * @param options - Octokit configuration options
 * @returns Promise<Octokit> Configured Octokit instance
 */
async function createLazyOctokit(options = {}) {
    const Octokit = await (0, library_loader_1.lazyLoadOctokit)();
    return new Octokit(options);
}
/**
 * Create a lazy-loaded BPMN Modeler instance
 * @param options - BpmnModeler configuration options
 * @returns Promise<BpmnModeler> Configured BpmnModeler instance
 */
async function createLazyBpmnModeler(options = {}) {
    const BpmnModeler = await (0, library_loader_1.lazyLoadBpmnModeler)();
    return new BpmnModeler(options);
}
/**
 * Create a lazy-loaded BPMN Viewer instance
 * @param options - BpmnViewer configuration options
 * @returns Promise<BpmnViewer> Configured BpmnViewer instance
 */
async function createLazyBpmnViewer(options = {}) {
    const BpmnViewer = await (0, library_loader_1.lazyLoadBpmnViewer)();
    return new BpmnViewer(options);
}
/**
 * Create a lazy-loaded AJV instance with common configuration
 * @param options - AJV configuration options
 * @returns Promise<Ajv> Configured AJV instance
 */
async function createLazyAjv(options = {}) {
    const [Ajv, addFormats] = await Promise.all([
        (0, library_loader_1.lazyLoadAjv)(),
        (0, library_loader_1.lazyLoadAjvFormats)()
    ]);
    const defaultOptions = {
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
async function createDAKBpmnModeler(container, additionalModules = []) {
    const options = {
        container,
        additionalModules: [
            // Default DAK-specific modules could be added here
            ...additionalModules
        ],
        keyboard: {
            bindTo: typeof container === 'string' ? document.querySelector(container) : container
        }
    };
    return createLazyBpmnModeler(options);
}
/**
 * Factory function for creating BPMN Viewer with DAK-specific configuration
 * @param container - Container element or selector
 * @returns Promise<BpmnViewer> DAK-configured BPMN Viewer
 */
async function createDAKBpmnViewer(container) {
    const options = {
        container
    };
    return createLazyBpmnViewer(options);
}
/**
 * Factory function for creating AJV instance with DAK schema validation
 * @returns Promise<Ajv> DAK-configured AJV instance
 */
async function createDAKAjv() {
    const options = {
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
async function createGitHubClient(auth) {
    const options = {
        auth,
        userAgent: 'SGEX-Workbench/1.0',
        request: {
            timeout: 15000, // 15 second timeout
            retries: 3
        }
    };
    return createLazyOctokit(options);
}
//# sourceMappingURL=lazy-factory.js.map