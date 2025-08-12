/**
 * Runtime Validation Service with TypeScript Types
 * 
 * This service provides runtime validation using JSON Schema validators
 * in conjunction with TypeScript to validate incoming JSON data against
 * schemas and safely cast validated data to corresponding TypeScript types.
 */

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { 
  GitHubRepository, 
  GitHubBranch, 
  GitHubUser, 
  DAKComponent,
  SushiConfig,
  AppContext,
  RouteParams,
  BaseComponentProps,
  ApiResponse,
  ThemeConfig
} from '../types/common';

// Type definitions for validation results
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: string[];
}

export interface SchemaValidator<T> {
  validate: ValidateFunction<T>;
  validateAndCast: (data: unknown) => ValidationResult<T>;
}

export interface ValidationService {
  validators: Map<string, SchemaValidator<any>>;
  registerSchema: <T>(name: string, schema: JSONSchemaType<T>) => void;
  validateAndCast: <T>(name: string, data: unknown) => ValidationResult<T>;
  loadSchemasFromDirectory: (schemasPath: string) => Promise<void>;
}

class RuntimeValidationService implements ValidationService {
  private ajv: Ajv;
  public validators: Map<string, SchemaValidator<any>>;

  constructor() {
    // Configure AJV with strict validation
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strict: true,
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: false
    });
    
    // Add format validators
    addFormats(this.ajv);
    
    this.validators = new Map();
    
    // Initialize with built-in schemas
    this.initializeBuiltInValidators();
  }

  /**
   * Register a JSON schema for a specific TypeScript type
   */
  registerSchema<T>(name: string, schema: JSONSchemaType<T>): void {
    try {
      const validate = this.ajv.compile<T>(schema);
      
      const validator: SchemaValidator<T> = {
        validate,
        validateAndCast: (data: unknown): ValidationResult<T> => {
          const isValid = validate(data);
          
          if (isValid) {
            // Safe cast to T since validation passed
            return {
              isValid: true,
              data: data as T
            };
          } else {
            return {
              isValid: false,
              errors: validate.errors?.map(err => 
                `${err.instancePath || 'root'}: ${err.message || 'Validation error'}`
              ) || ['Unknown validation error']
            };
          }
        }
      };
      
      this.validators.set(name, validator);
      console.log(`✓ Registered schema validator for: ${name}`);
    } catch (error) {
      console.error(`Failed to register schema for ${name}:`, error);
      throw error;
    }
  }

  /**
   * Validate data against a registered schema and safely cast to TypeScript type
   */
  validateAndCast<T>(name: string, data: unknown): ValidationResult<T> {
    const validator = this.validators.get(name);
    
    if (!validator) {
      return {
        isValid: false,
        errors: [`No validator registered for type: ${name}`]
      };
    }
    
    return validator.validateAndCast(data);
  }

  /**
   * Load schemas from the generated schemas directory
   */
  async loadSchemasFromDirectory(schemasPath: string = '/sgex/docs/schemas'): Promise<void> {
    try {
      // In browser environment, we need to fetch the schema index
      const indexResponse = await fetch(`${schemasPath}/index.json`);
      
      if (!indexResponse.ok) {
        console.warn(`Could not load schema index from ${schemasPath}/index.json`);
        return;
      }
      
      const schemaIndex = await indexResponse.json();
      
      if (schemaIndex.schemas && Array.isArray(schemaIndex.schemas)) {
        const loadPromises = schemaIndex.schemas.map(async (schemaInfo: any) => {
          try {
            const schemaResponse = await fetch(`${schemasPath}/${schemaInfo.file}`);
            
            if (schemaResponse.ok) {
              const schema = await schemaResponse.json();
              this.registerSchema(schemaInfo.name, schema);
            } else {
              console.warn(`Could not load schema: ${schemaInfo.file}`);
            }
          } catch (error) {
            console.warn(`Error loading schema ${schemaInfo.file}:`, error);
          }
        });
        
        await Promise.all(loadPromises);
        console.log(`✓ Loaded ${schemaIndex.schemas.length} schemas from ${schemasPath}`);
      }
    } catch (error) {
      console.warn(`Could not load schemas from directory ${schemasPath}:`, error);
    }
  }

  /**
   * Initialize validators for built-in types with inline schemas
   */
  private initializeBuiltInValidators(): void {
    // Basic inline schemas for core types
    // These provide fallback validation when generated schemas aren't available
    
    const gitHubRepositorySchema: JSONSchemaType<GitHubRepository> = {
      type: "object",
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        full_name: { type: "string" },
        owner: {
          type: "object",
          properties: {
            login: { type: "string" },
            type: { type: "string" }
          },
          required: ["login", "type"],
          additionalProperties: true
        },
        description: { type: "string", nullable: true },
        private: { type: "boolean" },
        default_branch: { type: "string" },
        created_at: { type: "string" },
        updated_at: { type: "string" },
        pushed_at: { type: "string" }
      },
      required: ["id", "name", "full_name", "owner", "private", "default_branch", "created_at", "updated_at", "pushed_at"],
      additionalProperties: true
    };

    const routeParamsSchema: JSONSchemaType<RouteParams> = {
      type: "object",
      properties: {
        user: { type: "string", nullable: true },
        repo: { type: "string", nullable: true },
        branch: { type: "string", nullable: true },
        asset: { type: "string", nullable: true }
      },
      required: [],
      additionalProperties: true
    };

    // Register built-in schemas
    this.registerSchema('GitHubRepository', gitHubRepositorySchema);
    this.registerSchema('RouteParams', routeParamsSchema);
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): { registeredValidators: number; availableTypes: string[] } {
    return {
      registeredValidators: this.validators.size,
      availableTypes: Array.from(this.validators.keys())
    };
  }

  /**
   * Utility method for type-safe GitHub API response validation
   */
  validateGitHubApiResponse<T>(data: unknown, expectedType: string): ValidationResult<T> {
    // Special handling for GitHub API responses with common patterns
    if (Array.isArray(data)) {
      // Handle array responses
      const results: T[] = [];
      const errors: string[] = [];
      
      data.forEach((item, index) => {
        const result = this.validateAndCast<T>(expectedType, item);
        if (result.isValid && result.data) {
          results.push(result.data);
        } else {
          errors.push(`Item ${index}: ${result.errors?.join(', ') || 'Invalid'}`);
        }
      });
      
      if (errors.length === 0) {
        return { isValid: true, data: results as unknown as T };
      } else {
        return { isValid: false, errors };
      }
    } else {
      // Handle single object responses
      return this.validateAndCast<T>(expectedType, data);
    }
  }
}

// Export singleton instance
export const validationService = new RuntimeValidationService();

// Export commonly used validation functions
export const validateGitHubRepository = (data: unknown): ValidationResult<GitHubRepository> =>
  validationService.validateAndCast<GitHubRepository>('GitHubRepository', data);

export const validateGitHubUser = (data: unknown): ValidationResult<GitHubUser> =>
  validationService.validateAndCast<GitHubUser>('GitHubUser', data);

export const validateDAKComponent = (data: unknown): ValidationResult<DAKComponent> =>
  validationService.validateAndCast<DAKComponent>('DAKComponent', data);

export const validateRouteParams = (data: unknown): ValidationResult<RouteParams> =>
  validationService.validateAndCast<RouteParams>('RouteParams', data);

// Initialize schemas on module load (browser environment)
if (typeof window !== 'undefined') {
  validationService.loadSchemasFromDirectory().catch(console.warn);
}

export default validationService;