/**
 * Base DAK Component Class
 * Provides common validation, serialization, and storage patterns for all DAK components
 * Eliminates repeated patterns across different component implementations
 */

import { 
  FSHMetadata, 
  extractFSHMetadata, 
  generateFSHHeader, 
  escapeFSHString,
  validateFSHSyntax,
  FSHValidationResult
} from './fsh-utils';
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
export abstract class BaseDAKComponent<T extends DAKComponentBase> {
  protected component: T;
  
  constructor(component: T) {
    this.component = component;
  }
  
  /**
   * Get component data
   */
  getData(): T {
    return this.component;
  }
  
  /**
   * Update component data
   */
  updateData(updates: Partial<T>): void {
    this.component = { ...this.component, ...updates };
  }
  
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
  protected validateRequiredFields(requiredFields: (keyof T)[]): ComponentValidationResult {
    const errors: DAKValidationError[] = [];
    const warnings: DAKValidationWarning[] = [];
    
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
  protected validateIdFormat(id: string): ComponentValidationResult {
    const errors: DAKValidationError[] = [];
    const warnings: DAKValidationWarning[] = [];
    
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
  protected validateGeneratedFSH(): ComponentValidationResult {
    const errors: DAKValidationError[] = [];
    const warnings: DAKValidationWarning[] = [];
    
    try {
      const fsh = this.generateFSH();
      const result = validateFSHSyntax(fsh);
      
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
      
    } catch (error) {
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
  toJSON(): string {
    return JSON.stringify(this.component, null, 2);
  }
  
  /**
   * Parse from JSON
   */
  fromJSON(json: string): T {
    return JSON.parse(json);
  }
  
  /**
   * Clone component
   */
  clone(): BaseDAKComponent<T> {
    const ComponentClass = this.constructor as new (component: T) => BaseDAKComponent<T>;
    return new ComponentClass({ ...this.component });
  }
}

/**
 * Mixin for storage operations
 * Can be composed with component classes to add storage capabilities
 */
export class StorageMixin<T extends DAKComponentBase> {
  private storage: ComponentStorage;
  
  constructor(storage: ComponentStorage) {
    this.storage = storage;
  }
  
  /**
   * Load component from storage
   */
  async load(id: string): Promise<T> {
    return await this.storage.load(id);
  }
  
  /**
   * Save component to storage
   */
  async save(component: T, commitMessage?: string): Promise<void> {
    await this.storage.save(component, commitMessage);
  }
  
  /**
   * Delete component from storage
   */
  async delete(id: string): Promise<void> {
    await this.storage.delete(id);
  }
  
  /**
   * List all components
   */
  async list(): Promise<T[]> {
    return await this.storage.list();
  }
}

/**
 * Factory for creating DAK components
 */
export class DAKComponentFactory {
  private componentTypes: Map<string, new (component: any) => BaseDAKComponent<any>> = new Map();
  
  /**
   * Register a component type
   */
  register(type: string, componentClass: new (component: any) => BaseDAKComponent<any>): void {
    this.componentTypes.set(type, componentClass);
  }
  
  /**
   * Create a component instance
   */
  create(type: string, component: any): BaseDAKComponent<any> {
    const ComponentClass = this.componentTypes.get(type);
    
    if (!ComponentClass) {
      throw new Error(`Unknown component type: ${type}`);
    }
    
    return new ComponentClass(component);
  }
  
  /**
   * Get registered component types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.componentTypes.keys());
  }
}

/**
 * Helper function to merge validation results
 */
export function mergeValidationResults(
  ...results: ComponentValidationResult[]
): ComponentValidationResult {
  const errors: DAKValidationError[] = [];
  const warnings: DAKValidationWarning[] = [];
  
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
export function createEmptyComponent<T extends DAKComponentBase>(
  type: string,
  defaults?: Partial<T>
): T {
  return {
    id: '',
    name: '',
    description: '',
    type,
    metadata: {},
    ...defaults
  } as T;
}
