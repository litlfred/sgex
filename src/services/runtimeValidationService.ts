/**
 * Runtime Validation Service
 * 
 * This service provides runtime validation of JSON data against TypeScript-generated
 * JSON schemas using AJV. It serves as a bridge between TypeScript compile-time
 * type checking and runtime data validation, with enhanced support for SGEX 
 * domain-specific validation including GitHub, FHIR, and DAK data.
 */

import Ajv, { JSONSchemaType, ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning, 
  RuntimeValidationConfig,
  ValidatedData,
  AsyncResult
} from '../types/core';

export interface SchemaRegistry {
  [typeName: string]: object;
}

export interface ValidationContext {
  strict?: boolean;
  coerceTypes?: boolean;
  removeAdditional?: boolean;
  throwOnError?: boolean;
}

export class RuntimeValidationService {
  private ajv: Ajv;
  private schemas: Map<string, any> = new Map();
  private validators: Map<string, ValidateFunction> = new Map();
  private config: RuntimeValidationConfig;

  constructor(config: Partial<RuntimeValidationConfig> = {}) {
    this.config = {
      strict: config.strict ?? false,
      throwOnError: config.throwOnError ?? false,
      coerceTypes: config.coerceTypes ?? true,
      removeAdditional: config.removeAdditional ?? true
    };

    this.ajv = new Ajv({
      strict: this.config.strict,
      coerceTypes: this.config.coerceTypes,
      removeAdditional: this.config.removeAdditional,
      allErrors: true,
      verbose: true,
      loadSchema: this.loadSchema.bind(this)
    });

    // Add format support (date, time, email, etc.)
    addFormats(this.ajv);

    // Add custom formats for SGEX-specific validation
    this.addCustomFormats();
  }

  /**
   * Add custom validation formats for GitHub, FHIR, and DAK data
   */
  private addCustomFormats(): void {
    // GitHub username format
    this.ajv.addFormat('github-username', {
      type: 'string',
      validate: (data: string) => /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(data)
    });

    // GitHub token format (basic validation)
    this.ajv.addFormat('github-token', {
      type: 'string',
      validate: (data: string) => /^(ghp_|github_pat_)[a-zA-Z0-9_]{16,}$/.test(data)
    });

    // FHIR ID format
    this.ajv.addFormat('fhir-id', {
      type: 'string', 
      validate: (data: string) => /^[A-Za-z0-9-.]{1,64}$/.test(data)
    });

    // DAK ID format
    this.ajv.addFormat('dak-id', {
      type: 'string',
      validate: (data: string) => /^[a-z0-9]([a-z0-9-])*[a-z0-9]$/.test(data)
    });

    // WHO SMART Guidelines dependency
    this.ajv.addFormat('who-smart-base', {
      type: 'string',
      validate: (data: string) => data === 'smart.who.int.base'
    });

    // Branch name format
    this.ajv.addFormat('git-branch', {
      type: 'string',
      validate: (data: string) => !/[\s~^:?*\[\]\\]/.test(data) && !data.startsWith('-') && !data.endsWith('.')
    });

    // Semantic version format
    this.ajv.addFormat('semver', {
      type: 'string',
      validate: (data: string) => /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?(\+[a-zA-Z0-9-]+)?$/.test(data)
    });
  }

  /**
   * Register a JSON schema for a TypeScript type
   */
  public registerSchema(typeName: string, schema: object): void {
    this.schemas.set(typeName, schema);
    const validator = this.ajv.compile(schema);
    this.validators.set(typeName, validator);
  }

  /**
   * Load schema asynchronously (for $ref resolution)
   */
  private async loadSchema(uri: string): Promise<object | boolean> {
    // Handle local schema references
    if (uri.startsWith('#/')) {
      return false; // Let AJV handle internal references
    }
    
    // Handle external schema loading if needed in the future
    console.warn(`External schema loading not implemented for: ${uri}`);
    return false;
  }

  /**
   * Validate data against a registered TypeScript type schema
   */
  public validate<T>(typeName: string, data: unknown): ValidatedData<T> {
    const validator = this.validators.get(typeName);
    if (!validator) {
      const error: ValidationError = {
        code: 'SCHEMA_NOT_FOUND',
        message: `No schema registered for type: ${typeName}`,
        path: '',
        value: typeName
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
          path: error.instancePath || error.schemaPath || '',
          value: error.data
        };
        
        // Classify certain errors as warnings instead
        if (this.isWarningError(error)) {
          warnings.push({
            code: validationError.code,
            message: validationError.message,
            path: validationError.path,
            value: validationError.value
          });
        } else {
          errors.push(validationError);
        }
      }
    }

    if (!isValid && errors.length > 0 && this.config.throwOnError) {
      throw new Error(`Validation failed: ${errors[0].message}`);
    }

    return {
      data: data as T,
      isValid: isValid && errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Determine if an AJV error should be treated as a warning
   */
  private isWarningError(error: ErrorObject): boolean {
    // Treat additional properties as warnings in non-strict mode
    if (!this.config.strict && error.keyword === 'additionalProperties') {
      return true;
    }
    
    // Treat format errors as warnings for some formats
    if (error.keyword === 'format') {
      const formatName = error.schema as string;
      return ['date-time', 'email', 'uri'].includes(formatName);
    }
    
    return false;
  }

  /**
   * Validate DAK configuration data
   */
  public async validateDAKConfig(data: unknown): Promise<AsyncResult<any>> {
    try {
      const result = this.validate('SushiConfig', data);
      return {
        success: result.isValid,
        data: result.isValid ? result.data : undefined,
        error: result.errors.length > 0 ? result.errors[0].message : undefined,
        errors: result.errors.map(e => e.message)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }

  /**
   * Validate GitHub repository data
   */
  public async validateGitHubRepository(data: unknown): Promise<AsyncResult<any>> {
    try {
      const result = this.validate('GitHubRepository', data);
      return {
        success: result.isValid,
        data: result.isValid ? result.data : undefined,
        error: result.errors.length > 0 ? result.errors[0].message : undefined,
        errors: result.errors.map(e => e.message)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }

  /**
   * Validate user authentication data
   */
  public async validateAuthenticationState(data: unknown): Promise<AsyncResult<any>> {
    try {
      const result = this.validate('AuthenticationState', data);
      return {
        success: result.isValid,
        data: result.isValid ? result.data : undefined,
        error: result.errors.length > 0 ? result.errors[0].message : undefined,
        errors: result.errors.map(e => e.message)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        errors: [error instanceof Error ? error.message : 'Validation failed']
      };
    }
  }

  /**
   * Batch validate multiple data items
   */
  public validateBatch<T>(typeName: string, dataItems: unknown[]): ValidatedData<T>[] {
    return dataItems.map(data => this.validate<T>(typeName, data));
  }

  /**
   * Check if a schema is registered for a given type
   */
  public hasType(typeName: string): boolean {
    return this.validators.has(typeName);
  }

  /**
   * Get validation statistics
   */
  public getValidationStats(): {
    registeredSchemas: number;
    compiledValidators: number;
    configuration: RuntimeValidationConfig;
  } {
    return {
      registeredSchemas: this.schemas.size,
      compiledValidators: this.validators.size,
      configuration: { ...this.config }
    };
  }

  /**
   * Load schemas from generated schema files
   */
  public async loadGeneratedSchemas(): Promise<void> {
    try {
      // In a real implementation, this would load from the generated schema files
      // For now, we'll register some basic schemas manually
      
      // Basic GitHub User schema
      this.registerSchema('GitHubUser', {
        type: 'object',
        required: ['login', 'id', 'avatar_url'],
        properties: {
          login: { type: 'string', format: 'github-username' },
          id: { type: 'number' },
          avatar_url: { type: 'string', format: 'uri' },
          name: { type: ['string', 'null'] },
          email: { type: ['string', 'null'], format: 'email' }
        }
      });

      // Basic SushiConfig schema
      this.registerSchema('SushiConfig', {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'dak-id' },
          version: { type: 'string', format: 'semver' },
          dependencies: {
            type: 'object',
            properties: {
              'smart.who.int.base': { type: 'string' }
            }
          }
        }
      });

    } catch (error) {
      console.warn('Failed to load generated schemas:', error);
    }
  }

  /**
   * Clear all registered schemas and validators
   */
  public clearSchemas(): void {
    this.schemas.clear();
    this.validators.clear();
  }
}

// Export singleton instance
export const runtimeValidationService = new RuntimeValidationService();
export default runtimeValidationService;