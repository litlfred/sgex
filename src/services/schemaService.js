/**
 * Schema Service
 * 
 * Centralized service for accessing and managing schemas in the React app.
 * Provides consistent access to minimal, required-field-only schemas.
 */

// Import schemas directly as modules for React app access
import dakActionFormSchema from '../schemas/dak-action-form.json';
import dakSelectionFormSchema from '../schemas/dak-selection-form.json';
import dakConfigFormSchema from '../schemas/dak-config-form.json';
import organizationSelectionFormSchema from '../schemas/organization-selection-form.json';
import sushiConfigSchema from '../schemas/sushi-config.json';
import actorDefinitionSchema from '../schemas/actor-definition.json';

class SchemaService {
  constructor() {
    this.schemas = new Map();
    this.initializeSchemas();
  }

  /**
   * Initialize all schemas with minimal required fields
   */
  initializeSchemas() {
    // Store original schemas
    this.schemas.set('dak-action-form-original', dakActionFormSchema);
    this.schemas.set('dak-selection-form-original', dakSelectionFormSchema);
    this.schemas.set('dak-config-form-original', dakConfigFormSchema);
    this.schemas.set('organization-selection-form-original', organizationSelectionFormSchema);
    this.schemas.set('sushi-config-original', sushiConfigSchema);
    this.schemas.set('actor-definition-original', actorDefinitionSchema);

    // Create minimal versions
    this.schemas.set('dak-question', this.createMinimalDAKQuestionSchema());
    this.schemas.set('dak-action-form', this.createMinimalDAKActionSchema());
    this.schemas.set('dak-selection-form', this.createMinimalDAKSelectionSchema());
    this.schemas.set('dak-config-form', this.createMinimalDAKConfigSchema());
  }

  /**
   * Create minimal DAK question schema with only required fields
   */
  createMinimalDAKQuestionSchema() {
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "$id": "https://litlfred.github.io/sgex/schemas/dak-question.json",
      "title": "DAK Question Form",
      "description": "Minimal schema for DAK questions requiring only repository identification",
      "type": "object",
      "properties": {
        "repositoryUrl": {
          "type": "string",
          "title": "DAK Repository URL",
          "description": "GitHub repository URL or path (e.g., 'user/repo' or 'https://github.com/user/repo')",
          "pattern": "^(https://github\\.com/)?[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+/?$",
          "examples": [
            "who/smart-immunizations",
            "https://github.com/who/smart-immunizations",
            "litlfred/anc-dak"
          ]
        },
        "locale": {
          "type": "string",
          "title": "Language/Locale",
          "description": "Optional language/locale preference",
          "enum": ["en", "fr", "es", "ar", "zh", "ru"],
          "default": "en"
        }
      },
      "required": ["repositoryUrl"],
      "additionalProperties": false,
      "uiSchema": {
        "repositoryUrl": {
          "ui:help": "Enter the GitHub repository URL or path (e.g., 'user/repo')",
          "ui:placeholder": "user/repository-name"
        },
        "locale": {
          "ui:help": "Optional: Select your preferred language"
        }
      }
    };
  }

  /**
   * Create minimal DAK action schema (already minimal)
   */
  createMinimalDAKActionSchema() {
    return {
      ...dakActionFormSchema,
      "description": "Minimal schema for DAK action selection"
    };
  }

  /**
   * Create minimal DAK selection schema 
   */
  createMinimalDAKSelectionSchema() {
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "$id": "https://litlfred.github.io/sgex/schemas/dak-selection-form-minimal.json",
      "title": "DAK Selection Form (Minimal)",
      "description": "Minimal schema for DAK repository selection",
      "type": "object",
      "properties": {
        "repositoryUrl": {
          "type": "string",
          "title": "DAK Repository",
          "description": "GitHub repository URL or path",
          "pattern": "^(https://github\\.com/)?[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+/?$"
        },
        "selectedProfile": {
          "type": "object",
          "title": "GitHub Profile",
          "properties": {
            "login": {
              "type": "string",
              "minLength": 1
            },
            "type": {
              "type": "string",
              "enum": ["User", "Organization"]
            }
          },
          "required": ["login", "type"]
        }
      },
      "required": ["repositoryUrl"],
      "additionalProperties": false
    };
  }

  /**
   * Create minimal DAK config schema
   */
  createMinimalDAKConfigSchema() {
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "$id": "https://litlfred.github.io/sgex/schemas/dak-config-form-minimal.json",
      "title": "DAK Configuration Form (Minimal)",
      "description": "Minimal schema for DAK configuration",
      "type": "object",
      "properties": {
        "repositoryUrl": {
          "type": "string",
          "title": "Target Repository",
          "description": "GitHub repository URL or path where DAK will be created/configured"
        },
        "sushiConfig": {
          "type": "object",
          "title": "Basic FHIR Implementation Guide Configuration",
          "properties": {
            "id": {
              "type": "string",
              "title": "Implementation Guide ID",
              "pattern": "^[a-z0-9][a-z0-9\\-\\.]*[a-z0-9]$",
              "minLength": 3
            },
            "title": {
              "type": "string",
              "title": "Implementation Guide Title",
              "minLength": 5
            },
            "description": {
              "type": "string",
              "title": "Description",
              "minLength": 20
            }
          },
          "required": ["id", "title", "description"]
        }
      },
      "required": ["repositoryUrl", "sushiConfig"],
      "additionalProperties": false
    };
  }

  /**
   * Get schema by name
   */
  getSchema(schemaName) {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      console.warn(`Schema '${schemaName}' not found. Available schemas:`, Array.from(this.schemas.keys()));
      return null;
    }
    return schema;
  }

  /**
   * Get all available schema names
   */
  getAvailableSchemas() {
    return Array.from(this.schemas.keys());
  }

  /**
   * Check if a schema exists
   */
  hasSchema(schemaName) {
    return this.schemas.has(schemaName);
  }

  /**
   * Validate data against a schema (basic validation)
   */
  validateData(schemaName, data) {
    const schema = this.getSchema(schemaName);
    if (!schema) {
      return { isValid: false, errors: [`Schema '${schemaName}' not found`] };
    }

    const errors = [];
    const requiredFields = schema.required || [];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!data.hasOwnProperty(field) || data[field] === null || data[field] === undefined) {
        errors.push(`Required field '${field}' is missing`);
      }
    }

    // Basic type checking for properties
    if (schema.properties) {
      for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
        if (data.hasOwnProperty(fieldName)) {
          const value = data[fieldName];
          if (fieldSchema.type === 'string' && typeof value !== 'string') {
            errors.push(`Field '${fieldName}' must be a string`);
          } else if (fieldSchema.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
            errors.push(`Field '${fieldName}' must be an object`);
          } else if (fieldSchema.pattern && typeof value === 'string') {
            const regex = new RegExp(fieldSchema.pattern);
            if (!regex.test(value)) {
              errors.push(`Field '${fieldName}' does not match required pattern`);
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse repository URL to extract user/repo
   */
  parseRepositoryUrl(repositoryUrl) {
    if (!repositoryUrl) return null;

    // Remove trailing slash
    const cleanUrl = repositoryUrl.replace(/\/$/, '');
    
    // Handle full GitHub URLs
    const githubUrlMatch = cleanUrl.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/);
    if (githubUrlMatch) {
      return {
        user: githubUrlMatch[1],
        repo: githubUrlMatch[2]
      };
    }

    // Handle user/repo format
    const pathMatch = cleanUrl.match(/^([^\/]+)\/([^\/]+)$/);
    if (pathMatch) {
      return {
        user: pathMatch[1],
        repo: pathMatch[2]
      };
    }

    return null;
  }

  /**
   * Create a repository URL from user/repo
   */
  createRepositoryUrl(user, repo, format = 'path') {
    if (!user || !repo) return null;
    
    if (format === 'full') {
      return `https://github.com/${user}/${repo}`;
    }
    
    return `${user}/${repo}`;
  }
}

// Create singleton instance
const schemaService = new SchemaService();

export default schemaService;