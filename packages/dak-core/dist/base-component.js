"use strict";
/**
 * Base DAK Component Class
 * Provides common validation, serialization, and storage patterns for all DAK components
 * Eliminates repeated patterns across different component implementations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAKComponentFactory = exports.StorageMixin = exports.BaseDAKComponent = void 0;
exports.mergeValidationResults = mergeValidationResults;
exports.createEmptyComponent = createEmptyComponent;
const fsh_utils_1 = require("./fsh-utils");
/**
 * Abstract base class for DAK components
 * Provides common functionality that all DAK components can inherit
 */
class BaseDAKComponent {
    constructor(component) {
        this.component = component;
    }
    /**
     * Get component data
     */
    getData() {
        return this.component;
    }
    /**
     * Update component data
     */
    updateData(updates) {
        this.component = { ...this.component, ...updates };
    }
    /**
     * Validate required fields
     */
    validateRequiredFields(requiredFields) {
        const errors = [];
        const warnings = [];
        for (const field of requiredFields) {
            const value = this.component[field];
            if (value === undefined || value === null || value === '') {
                errors.push({
                    code: 'MISSING_REQUIRED_FIELD',
                    message: `Field '${String(field)}' is required`,
                    component: this.component.type
                });
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validate ID format
     */
    validateIdFormat(id) {
        const errors = [];
        const warnings = [];
        if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id)) {
            errors.push({
                code: 'INVALID_ID_FORMAT',
                message: 'ID must start with a letter and contain only letters, numbers, hyphens, and underscores',
                component: this.component.type
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validate FSH syntax of generated content
     */
    validateGeneratedFSH() {
        const errors = [];
        const warnings = [];
        try {
            const fsh = this.generateFSH();
            const result = (0, fsh_utils_1.validateFSHSyntax)(fsh);
            if (!result.isValid) {
                errors.push(...result.errors.map(msg => ({
                    code: 'FSH_SYNTAX_ERROR',
                    message: msg,
                    component: this.component.type
                })));
            }
            warnings.push(...result.warnings.map(msg => ({
                code: 'FSH_SYNTAX_WARNING',
                message: msg,
                component: this.component.type
            })));
        }
        catch (error) {
            errors.push({
                code: 'FSH_GENERATION_ERROR',
                message: `Failed to generate FSH: ${error}`,
                component: this.component.type
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Serialize to JSON
     */
    toJSON() {
        return JSON.stringify(this.component, null, 2);
    }
    /**
     * Parse from JSON
     */
    fromJSON(json) {
        return JSON.parse(json);
    }
    /**
     * Clone component
     */
    clone() {
        const ComponentClass = this.constructor;
        return new ComponentClass({ ...this.component });
    }
}
exports.BaseDAKComponent = BaseDAKComponent;
/**
 * Mixin for storage operations
 * Can be composed with component classes to add storage capabilities
 */
class StorageMixin {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Load component from storage
     */
    async load(id) {
        return await this.storage.load(id);
    }
    /**
     * Save component to storage
     */
    async save(component, commitMessage) {
        await this.storage.save(component, commitMessage);
    }
    /**
     * Delete component from storage
     */
    async delete(id) {
        await this.storage.delete(id);
    }
    /**
     * List all components
     */
    async list() {
        return await this.storage.list();
    }
}
exports.StorageMixin = StorageMixin;
/**
 * Factory for creating DAK components
 */
class DAKComponentFactory {
    constructor() {
        this.componentTypes = new Map();
    }
    /**
     * Register a component type
     */
    register(type, componentClass) {
        this.componentTypes.set(type, componentClass);
    }
    /**
     * Create a component instance
     */
    create(type, component) {
        const ComponentClass = this.componentTypes.get(type);
        if (!ComponentClass) {
            throw new Error(`Unknown component type: ${type}`);
        }
        return new ComponentClass(component);
    }
    /**
     * Get registered component types
     */
    getRegisteredTypes() {
        return Array.from(this.componentTypes.keys());
    }
}
exports.DAKComponentFactory = DAKComponentFactory;
/**
 * Helper function to merge validation results
 */
function mergeValidationResults(...results) {
    const errors = [];
    const warnings = [];
    for (const result of results) {
        errors.push(...result.errors);
        warnings.push(...result.warnings);
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Helper function to create empty component
 */
function createEmptyComponent(type, defaults) {
    return {
        id: '',
        name: '',
        description: '',
        type,
        metadata: {},
        ...defaults
    };
}
//# sourceMappingURL=base-component.js.map