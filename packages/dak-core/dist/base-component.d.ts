/**
 * Base DAK Component Class
 * Provides common validation, serialization, and storage patterns for all DAK components
 * Eliminates repeated patterns across different component implementations
 */
import { DAKValidationError, DAKValidationWarning } from './types';
/**
 * Base interface for all DAK components
 */
export interface DAKComponentBase {
    /** Unique identifier */
    id: string;
    /** Display name */
    name: string;
    /** Description */
    description: string;
    /** Component type (e.g., 'actor', 'questionnaire', 'decision-table') */
    type: string;
    /** Metadata */
    metadata?: Record<string, any>;
}
/**
 * Validation result for DAK components
 */
export interface ComponentValidationResult {
    isValid: boolean;
    errors: DAKValidationError[];
    warnings: DAKValidationWarning[];
}
/**
 * Storage interface for DAK components
 */
export interface ComponentStorage {
    /** Load component from storage */
    load(id: string): Promise<any>;
    /** Save component to storage */
    save(component: any, commitMessage?: string): Promise<void>;
    /** Delete component from storage */
    delete(id: string): Promise<void>;
    /** List all components */
    list(): Promise<any[]>;
}
/**
 * Abstract base class for DAK components
 * Provides common functionality that all DAK components can inherit
 */
export declare abstract class BaseDAKComponent<T extends DAKComponentBase> {
    protected component: T;
    constructor(component: T);
    /**
     * Get component data
     */
    getData(): T;
    /**
     * Update component data
     */
    updateData(updates: Partial<T>): void;
    /**
     * Validate component (must be implemented by subclasses)
     */
    abstract validate(): ComponentValidationResult;
    /**
     * Generate FSH representation (must be implemented by subclasses)
     */
    abstract generateFSH(): string;
    /**
     * Parse FSH content (must be implemented by subclasses)
     * Now async to support lazy loading of fsh-sushi parser
     */
    abstract parseFSH(fshContent: string): Promise<T>;
    /**
     * Get component schema for JSON validation
     */
    abstract getSchema(): any;
    /**
     * Validate required fields
     */
    protected validateRequiredFields(requiredFields: (keyof T)[]): ComponentValidationResult;
    /**
     * Validate ID format
     */
    protected validateIdFormat(id: string): ComponentValidationResult;
    /**
     * Validate FSH syntax of generated content
     */
    protected validateGeneratedFSH(): ComponentValidationResult;
    /**
     * Serialize to JSON
     */
    toJSON(): string;
    /**
     * Parse from JSON
     */
    fromJSON(json: string): T;
    /**
     * Clone component
     */
    clone(): BaseDAKComponent<T>;
}
/**
 * Mixin for storage operations
 * Can be composed with component classes to add storage capabilities
 */
export declare class StorageMixin<T extends DAKComponentBase> {
    private storage;
    constructor(storage: ComponentStorage);
    /**
     * Load component from storage
     */
    load(id: string): Promise<T>;
    /**
     * Save component to storage
     */
    save(component: T, commitMessage?: string): Promise<void>;
    /**
     * Delete component from storage
     */
    delete(id: string): Promise<void>;
    /**
     * List all components
     */
    list(): Promise<T[]>;
}
/**
 * Factory for creating DAK components
 */
export declare class DAKComponentFactory {
    private componentTypes;
    /**
     * Register a component type
     */
    register(type: string, componentClass: new (component: any) => BaseDAKComponent<any>): void;
    /**
     * Create a component instance
     */
    create(type: string, component: any): BaseDAKComponent<any>;
    /**
     * Get registered component types
     */
    getRegisteredTypes(): string[];
}
/**
 * Helper function to merge validation results
 */
export declare function mergeValidationResults(...results: ComponentValidationResult[]): ComponentValidationResult;
/**
 * Helper function to create empty component
 */
export declare function createEmptyComponent<T extends DAKComponentBase>(type: string, defaults?: Partial<T>): T;
