"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyLoadOctokit = lazyLoadOctokit;
exports.lazyLoadBpmnModeler = lazyLoadBpmnModeler;
exports.lazyLoadBpmnViewer = lazyLoadBpmnViewer;
exports.lazyLoadYaml = lazyLoadYaml;
exports.lazyLoadAjv = lazyLoadAjv;
exports.lazyLoadAjvFormats = lazyLoadAjvFormats;
exports.clearModuleCache = clearModuleCache;
exports.getCacheInfo = getCacheInfo;
// Cache for lazy-loaded modules to avoid repeated imports
const moduleCache = new Map();
/**
 * Lazy load Octokit for GitHub API operations
 * @returns Promise<Octokit> Octokit constructor
 */
async function lazyLoadOctokit() {
    const cacheKey = 'octokit';
    if (moduleCache.has(cacheKey)) {
        return moduleCache.get(cacheKey);
    }
    try {
        const { Octokit } = await Promise.resolve().then(() => __importStar(require('@octokit/rest')));
        moduleCache.set(cacheKey, Octokit);
        return Octokit;
    }
    catch (error) {
        throw new Error(`Failed to load Octokit: ${error}`);
    }
}
/**
 * Lazy load BPMN.js Modeler for BPMN editing
 * @returns Promise<BpmnModeler> BpmnModeler constructor
 */
async function lazyLoadBpmnModeler() {
    const cacheKey = 'bpmn-modeler';
    if (moduleCache.has(cacheKey)) {
        return moduleCache.get(cacheKey);
    }
    try {
        const BpmnModeler = await Promise.resolve().then(() => __importStar(require('bpmn-js/lib/Modeler')));
        const modeler = BpmnModeler.default;
        moduleCache.set(cacheKey, modeler);
        return modeler;
    }
    catch (error) {
        throw new Error(`Failed to load BPMN Modeler: ${error}`);
    }
}
/**
 * Lazy load BPMN.js Viewer for BPMN viewing
 * @returns Promise<BpmnViewer> BpmnViewer constructor
 */
async function lazyLoadBpmnViewer() {
    const cacheKey = 'bpmn-viewer';
    if (moduleCache.has(cacheKey)) {
        return moduleCache.get(cacheKey);
    }
    try {
        const BpmnViewer = await Promise.resolve().then(() => __importStar(require('bpmn-js/lib/Viewer')));
        const viewer = BpmnViewer.default;
        moduleCache.set(cacheKey, viewer);
        return viewer;
    }
    catch (error) {
        throw new Error(`Failed to load BPMN Viewer: ${error}`);
    }
}
/**
 * Lazy load js-yaml for YAML parsing
 * @returns Promise<yaml> yaml library
 */
async function lazyLoadYaml() {
    const cacheKey = 'yaml';
    if (moduleCache.has(cacheKey)) {
        return moduleCache.get(cacheKey);
    }
    try {
        const yaml = await Promise.resolve().then(() => __importStar(require('js-yaml')));
        moduleCache.set(cacheKey, yaml);
        return yaml;
    }
    catch (error) {
        throw new Error(`Failed to load js-yaml: ${error}`);
    }
}
/**
 * Lazy load AJV for JSON schema validation
 * @returns Promise<Ajv> AJV constructor
 */
async function lazyLoadAjv() {
    const cacheKey = 'ajv';
    if (moduleCache.has(cacheKey)) {
        return moduleCache.get(cacheKey);
    }
    try {
        const Ajv = await Promise.resolve().then(() => __importStar(require('ajv')));
        moduleCache.set(cacheKey, Ajv.default);
        return Ajv.default;
    }
    catch (error) {
        throw new Error(`Failed to load AJV: ${error}`);
    }
}
/**
 * Lazy load AJV formats for additional format validation
 * @returns Promise<addFormats> AJV formats function
 */
async function lazyLoadAjvFormats() {
    const cacheKey = 'ajv-formats';
    if (moduleCache.has(cacheKey)) {
        return moduleCache.get(cacheKey);
    }
    try {
        const addFormats = await Promise.resolve().then(() => __importStar(require('ajv-formats')));
        moduleCache.set(cacheKey, addFormats.default);
        return addFormats.default;
    }
    catch (error) {
        throw new Error(`Failed to load AJV formats: ${error}`);
    }
}
/**
 * Clear the module cache (useful for testing or memory management)
 */
function clearModuleCache() {
    moduleCache.clear();
}
/**
 * Get cache statistics
 * @returns Object with cache information
 */
function getCacheInfo() {
    return {
        size: moduleCache.size,
        keys: Array.from(moduleCache.keys())
    };
}
//# sourceMappingURL=library-loader.js.map