/**
 * Runtime Validation Service
 * 
 * Provides runtime validation capabilities for TypeScript types using AJV
 * Integrates with the TypeScript type system to provide compile-time and runtime validation
 */

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { 
  ValidationError, 
  ValidationWarning, 
  ValidatedData, 
  RuntimeValidationConfig,
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

class RuntimeValidationService {
  private ajv: Ajv;
  private schemas: SchemaRegistry = {};
  private validators: Map<string, ValidateFunction> = new Map();
  private config: RuntimeValidationConfig;

  constructor(config: Partial<RuntimeValidationConfig> = {}) {
    this.config = {
      strict: config.strict ?? true,
      throwOnError: config.throwOnError ?? false,
      coerceTypes: config.coerceTypes ?? false,
      removeAdditional: config.removeAdditional ?? false
    };

    this.ajv = new Ajv({
      allErrors: true,
      strict: this.config.strict,
      coerceTypes: this.config.coerceTypes,
      removeAdditional: this.config.removeAdditional,
      loadSchema: this.loadSchema.bind(this)
    });

    // Add standard formats
    addFormats(this.ajv);
    
    // Add custom formats for SGEX domain
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
  }

  /**
   * Register a JSON schema for a TypeScript type
   */
  public registerSchema(typeName: string, schema: object): void {
    this.schemas[typeName] = schema;
    const validator = this.ajv.compile(schema);
    this.validators.set(typeName, validator);
  }

  /**
   * Load schema asynchronously (for $ref resolution)
   */
  private async loadSchema(uri: string): Promise<object | boolean> {
    // Extract type name from URI
    const typeName = uri.split('/').pop() || uri;
    
    if (this.schemas[typeName]) {
      return this.schemas[typeName];
    }

    // Try to load from generated schemas if available
    try {
      const response = await fetch(`/sgex/schemas/${typeName}.json`);
      if (response.ok) {
        const schema = await response.json();
        this.registerSchema(typeName, schema);
        return schema;
      }
    } catch (error) {
      console.warn(`Failed to load schema for ${typeName}:`, error);
    }

    return false;
  }

  /**
   * Validate data against a registered TypeScript type
   */
  public validate<T>(typeName: string, data: unknown, context?: ValidationContext): ValidatedData<T> {
    const validator = this.validators.get(typeName);
    
    if (!validator) {
      const error: ValidationError = {
        code: 'SCHEMA_NOT_FOUND',
        message: `Schema for type '${typeName}' not found`,
        path: typeName
      };

      if (context?.throwOnError ?? this.config.throwOnError) {
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
      for (const ajvError of validator.errors) {
        const error: ValidationError = {
          code: ajvError.keyword || 'VALIDATION_ERROR',
          message: this.formatErrorMessage(ajvError),
          path: ajvError.instancePath,
          value: ajvError.data
        };

        // Categorize as warning for certain non-critical validations
        if (this.isWarningError(ajvError)) {
          warnings.push({
            code: error.code,
            message: error.message,
            path: error.path,
            value: error.value
          });
        } else {
          errors.push(error);
        }
      }
    }

    const hasErrors = errors.length > 0;

    if (hasErrors && (context?.throwOnError ?? this.config.throwOnError)) {
      throw new Error(`Validation failed for ${typeName}: ${errors[0].message}`);
    }

    return {
      data: data as T,
      isValid: !hasErrors,
      errors,
      warnings
    };
  }

  /**
   * Validate and cast data to TypeScript type with runtime checking
   */
  public validateAndCast<T>(typeName: string, data: unknown, context?: ValidationContext): T {
    const result = this.validate<T>(typeName, data, context);
    
    if (!result.isValid) {
      throw new Error(`Type validation failed for ${typeName}: ${result.errors[0]?.message}`);
    }

    return result.data;
  }

  /**
   * Validate multiple objects of the same type efficiently
   */
  public validateBatch<T>(
    typeName: string, 
    dataArray: unknown[], 
    context?: ValidationContext
  ): ValidatedData<T>[] {
    return dataArray.map(data => this.validate<T>(typeName, data, context));
  }

  /**
   * Async validation for complex workflows
   */
  public async validateAsync<T>(
    typeName: string, 
    data: unknown, 
    context?: ValidationContext
  ): Promise<AsyncResult<T>> {
    try {
      const result = this.validate<T>(typeName, data, context);
      return {
        success: result.isValid,
        data: result.isValid ? result.data : undefined,
        error: result.errors[0]?.message,
        errors: result.errors.map(e => e.message)
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        errors: [error.message]
      };
    }
  }

  /**
   * Get all registered schema names
   */
  public getRegisteredTypes(): string[] {
    return Array.from(this.validators.keys());
  }

  /**
   * Check if a type is registered
   */
  public hasType(typeName: string): boolean {
    return this.validators.has(typeName);
  }

  /**
   * Format AJV error message for better readability
   */
  private formatErrorMessage(error: ErrorObject): string {
    const path = error.instancePath || 'root';
    const property = error.instancePath ? error.instancePath.split('/').pop() : 'data';
    
    switch (error.keyword) {
      case 'required':
        return `Missing required property: ${error.params?.missingProperty}`;
      case 'type':
        return `Expected ${error.params?.type} but received ${typeof error.data} at ${path}`;
      case 'format':
        return `Invalid ${error.params?.format} format for ${property}: "${error.data}"`;
      case 'minLength':
        return `${property} must be at least ${error.params?.limit} characters long`;
      case 'maxLength':
        return `${property} must not exceed ${error.params?.limit} characters`;
      case 'pattern':
        return `${property} does not match required pattern`;
      case 'enum':
        return `${property} must be one of: ${error.params?.allowedValues?.join(', ')}`;
      default:
        return error.message || `Validation error: ${error.keyword}`;
    }
  }

  /**
   * Determine if an error should be treated as a warning
   */
  private isWarningError(error: ErrorObject): boolean {
    // Treat certain validation failures as warnings rather than errors
    const warningKeywords = ['format', 'pattern'];
    const warningPaths = ['/description', '/title', '/name'];
    
    return warningKeywords.includes(error.keyword) || 
           warningPaths.some(path => error.instancePath?.startsWith(path));
  }
}

// Create singleton instance with default configuration
const runtimeValidationService = new RuntimeValidationService({
  strict: false, // Allow additional properties for flexibility
  coerceTypes: true, // Auto-convert compatible types
  removeAdditional: false, // Preserve extra properties
  throwOnError: false // Return validation results instead of throwing
});

// Register core types that are commonly used
const registerCoreTypes = async () => {
  try {
    // Register GitHub API types
    const githubUserSchema = {
      type: 'object',
      required: ['login', 'id', 'node_id', 'avatar_url', 'url', 'html_url', 'type', 'site_admin'],
      properties: {
        login: { type: 'string', format: 'github-username' },
        id: { type: 'number' },
        node_id: { type: 'string' },
        avatar_url: { type: 'string', format: 'uri' },
        url: { type: 'string', format: 'uri' },
        html_url: { type: 'string', format: 'uri' },
        type: { type: 'string' },
        site_admin: { type: 'boolean' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };

    runtimeValidationService.registerSchema('GitHubUser', githubUserSchema);

    // Register DAK validation types
    const dakValidationResultSchema = {
      type: 'object',
      required: ['validationId', 'component', 'level', 'description', 'filePath'],
      properties: {
        validationId: { type: 'string' },
        component: { type: 'string' },
        level: { type: 'string', enum: ['error', 'warning', 'info'] },
        description: { type: 'string' },
        filePath: { type: 'string' },
        message: { type: 'string' },
        line: { type: 'number' },
        column: { type: 'number' },
        suggestion: { type: 'string' }
      }
    };

    runtimeValidationService.registerSchema('DAKValidationResult', dakValidationResultSchema);

  } catch (error) {
    console.warn('Failed to register core schemas:', error);
  }
};

// Initialize core types registration
registerCoreTypes();

export default runtimeValidationService;
export { RuntimeValidationService };