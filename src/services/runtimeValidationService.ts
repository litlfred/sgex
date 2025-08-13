/**
 * Runtime Validation Service
 * 
 * This service provides runtime validation of JSON data against TypeScript-generated
 * JSON schemas using AJV. It serves as a bridge between TypeScript compile-time
 * type checking and runtime data validation.
 */

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning, 
  RuntimeValidationConfig,
  ValidatedData 
} from '../types/core';

export class RuntimeValidationService {
  private ajv: Ajv;
  private validators: Map<string, ValidateFunction> = new Map();
  private schemas: Map<string, any> = new Map();
  private config: RuntimeValidationConfig;

  constructor(config: Partial<RuntimeValidationConfig> = {}) {
    this.config = {
      strict: false,
      throwOnError: false,
      coerceTypes: true,
      removeAdditional: true,
      ...config
    };

    this.ajv = new Ajv({
      strict: this.config.strict,
      coerceTypes: this.config.coerceTypes,
      removeAdditional: this.config.removeAdditional,
      allErrors: true,
      verbose: true
    });

    // Add format support (date, time, email, etc.)
    addFormats(this.ajv);

    // Add custom formats for SGEX-specific validation
    this.addCustomFormats();
  }

  /**
   * Register a JSON schema for validation
   */
  registerSchema<T>(schemaName: string, schema: any): void {
    try {
      const validator = this.ajv.compile(schema);
      this.validators.set(schemaName, validator);
      this.schemas.set(schemaName, schema);
    } catch (error) {
      console.error(`Failed to register schema ${schemaName}:`, error);
      if (this.config.throwOnError) {
        throw new Error(`Failed to register schema ${schemaName}: ${error}`);
      }
    }
  }

  /**
   * Validate data against a registered schema
   */
  validate<T>(schemaName: string, data: unknown): ValidatedData<T> {
    const validator = this.validators.get(schemaName);
    if (!validator) {
      const error: ValidationError = {
        code: 'SCHEMA_NOT_FOUND',
        message: `Schema '${schemaName}' not registered`,
        path: '',
        value: schemaName
      };

      if (this.config.throwOnError) {
        throw new Error(error.message);
      }

      return {
        data: data as T,
        isValid: false,
        errors: [error],
        warnings: []
      };
    }

    const isValid = validator(data);
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!isValid && validator.errors) {
      for (const error of validator.errors) {
        const validationError: ValidationError = {
          code: error.keyword?.toUpperCase() || 'VALIDATION_ERROR',
          message: error.message || 'Validation failed',
          path: error.instancePath,
          value: error.data
        };
        errors.push(validationError);
      }
    }

    if (!isValid && this.config.throwOnError) {
      throw new Error(`Validation failed for schema '${schemaName}': ${errors.map(e => e.message).join(', ')}`);
    }

    return {
      data: data as T,
      isValid,
      errors,
      warnings
    };
  }

  /**
   * Type-safe validation with automatic casting
   */
  validateAndCast<T>(schemaName: string, data: unknown): T {
    const result = this.validate<T>(schemaName, data);
    
    if (!result.isValid) {
      if (this.config.throwOnError) {
        throw new Error(`Validation failed: ${result.errors.map(e => e.message).join(', ')}`);
      }
      console.warn(`Validation failed for schema '${schemaName}':`, result.errors);
    }

    return result.data;
  }

  /**
   * Validate data and return Promise for async workflows
   */
  async validateAsync<T>(schemaName: string, data: unknown): Promise<ValidatedData<T>> {
    return Promise.resolve(this.validate<T>(schemaName, data));
  }

  /**
   * Bulk validation of multiple data items
   */
  validateBatch<T>(schemaName: string, dataArray: unknown[]): ValidatedData<T>[] {
    return dataArray.map(data => this.validate<T>(schemaName, data));
  }

  /**
   * Check if a schema is registered
   */
  hasSchema(schemaName: string): boolean {
    return this.validators.has(schemaName);
  }

  /**
   * Get list of registered schema names
   */
  getRegisteredSchemas(): string[] {
    return Array.from(this.validators.keys());
  }

  /**
   * Get the raw JSON schema for a registered schema
   */
  getSchema(schemaName: string): any | null {
    return this.schemas.get(schemaName) || null;
  }

  /**
   * Remove a registered schema
   */
  unregisterSchema(schemaName: string): void {
    this.validators.delete(schemaName);
    this.schemas.delete(schemaName);
  }

  /**
   * Clear all registered schemas
   */
  clearSchemas(): void {
    this.validators.clear();
    this.schemas.clear();
  }

  /**
   * Update validation configuration
   */
  updateConfig(newConfig: Partial<RuntimeValidationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate AJV instance with new config
    this.ajv = new Ajv({
      strict: this.config.strict,
      coerceTypes: this.config.coerceTypes,
      removeAdditional: this.config.removeAdditional,
      allErrors: true,
      verbose: true
    });

    addFormats(this.ajv);
    this.addCustomFormats();

    // Re-register all schemas with new AJV instance
    const schemasToReregister = Array.from(this.schemas.entries());
    this.validators.clear();
    
    for (const [name, schema] of schemasToReregister) {
      try {
        const validator = this.ajv.compile(schema);
        this.validators.set(name, validator);
      } catch (error) {
        console.error(`Failed to re-register schema ${name}:`, error);
      }
    }
  }

  /**
   * Add custom formats for SGEX-specific validation
   */
  private addCustomFormats(): void {
    // GitHub username format
    this.ajv.addFormat('github-username', {
      type: 'string',
      validate: (username: string) => {
        return /^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$/.test(username) && username.length <= 39;
      }
    });

    // GitHub repository name format
    this.ajv.addFormat('github-repo-name', {
      type: 'string',
      validate: (repoName: string) => {
        return /^[a-zA-Z0-9._-]+$/.test(repoName) && repoName.length <= 100;
      }
    });

    // GitHub token format (basic validation)
    this.ajv.addFormat('github-token', {
      type: 'string',
      validate: (token: string) => {
        // Basic validation - tokens should start with specific prefixes
        return /^(gh[pousr]_[a-zA-Z0-9]{36,}|[a-fA-F0-9]{40})$/.test(token);
      }
    });

    // FHIR ID format
    this.ajv.addFormat('fhir-id', {
      type: 'string',
      validate: (id: string) => {
        return /^[A-Za-z0-9\-\.]{1,64}$/.test(id);
      }
    });

    // DAK ID format (follows FHIR IG naming)
    this.ajv.addFormat('dak-id', {
      type: 'string',
      validate: (id: string) => {
        return /^[a-z]+(\.[a-z]+)*\.dak$/.test(id);
      }
    });
  }
}

// Create and export a default instance
export const runtimeValidator = new RuntimeValidationService({
  strict: false,
  throwOnError: false,
  coerceTypes: true,
  removeAdditional: true
});

// Export convenience functions
export const validateData = <T>(schemaName: string, data: unknown): ValidatedData<T> => {
  return runtimeValidator.validate<T>(schemaName, data);
};

export const validateAndCast = <T>(schemaName: string, data: unknown): T => {
  return runtimeValidator.validateAndCast<T>(schemaName, data);
};

export const registerSchema = <T>(schemaName: string, schema: any): void => {
  runtimeValidator.registerSchema(schemaName, schema);
};

/**
 * Decorator for automatic validation of function parameters
 */
export function ValidateParams(schemaName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const validationResult = runtimeValidator.validate(schemaName, args[0]);
      
      if (!validationResult.isValid) {
        console.warn(`Parameter validation failed for ${propertyName}:`, validationResult.errors);
        if (runtimeValidator['config'].throwOnError) {
          throw new Error(`Parameter validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
        }
      }
      
      return method.apply(this, args);
    };
  };
}

/**
 * Decorator for automatic validation of function return values
 */
export function ValidateReturn(schemaName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const result = method.apply(this, args);
      
      // Handle Promise returns
      if (result && typeof result.then === 'function') {
        return result.then((resolvedResult: any) => {
          const validationResult = runtimeValidator.validate(schemaName, resolvedResult);
          
          if (!validationResult.isValid) {
            console.warn(`Return value validation failed for ${propertyName}:`, validationResult.errors);
          }
          
          return resolvedResult;
        });
      }
      
      // Handle synchronous returns
      const validationResult = runtimeValidator.validate(schemaName, result);
      
      if (!validationResult.isValid) {
        console.warn(`Return value validation failed for ${propertyName}:`, validationResult.errors);
      }
      
      return result;
    };
  };
}