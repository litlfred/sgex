/**
 * Parameter registry service for DAK FAQ system
 * Manages parameter definitions and validation
 */

import yaml from 'js-yaml';
import { ParameterDefinition } from '../types/QuestionDefinition.js';

class ParameterRegistryService {
  constructor() {
    this.registry = null;
    this.loaded = false;
  }

  /**
   * Load parameter registry from YAML
   * @param {string} yamlContent - YAML content as string
   */
  loadFromYaml(yamlContent) {
    try {
      this.registry = yaml.load(yamlContent);
      this.loaded = true;
    } catch (error) {
      throw new Error(`Failed to parse parameter registry YAML: ${error.message}`);
    }
  }

  /**
   * Get parameters for a specific context
   * @param {string} level - Question level (dak, component, asset)
   * @param {string} type - Component or asset type
   * @returns {ParameterDefinition[]} - Array of parameter definitions
   */
  getParameters(level, type = null) {
    if (!this.loaded || !this.registry) {
      throw new Error('Parameter registry not loaded');
    }

    const parameters = [];
    
    // Add global defaults
    if (this.registry.defaults) {
      for (const [name, config] of Object.entries(this.registry.defaults)) {
        parameters.push(new ParameterDefinition({
          name,
          type: config.type,
          required: config.required || false,
          description: config.description || '',
          defaultValue: config.default || null,
          validation: config.validation || {}
        }));
      }
    }

    // Add level-specific parameters
    if (this.registry[level]) {
      if (type && this.registry[level][type]) {
        // Type-specific parameters
        for (const [name, config] of Object.entries(this.registry[level][type])) {
          parameters.push(new ParameterDefinition({
            name,
            ...config
          }));
        }
      } else if (!type) {
        // All parameters for the level
        for (const [paramName, config] of Object.entries(this.registry[level])) {
          if (typeof config === 'object' && config.type) {
            // Direct parameter definition
            parameters.push(new ParameterDefinition({
              name: paramName,
              ...config
            }));
          }
        }
      }
    }

    // Remove duplicates (later definitions override earlier ones)
    const uniqueParams = new Map();
    parameters.forEach(param => {
      uniqueParams.set(param.name, param);
    });

    return Array.from(uniqueParams.values());
  }

  /**
   * Validate parameters against registry
   * @param {Object} parameters - Parameters to validate
   * @param {string} level - Question level
   * @param {string} type - Component or asset type
   * @returns {Object} - Validation result with normalized parameters and errors
   */
  validateParameters(parameters, level, type = null) {
    const definitions = this.getParameters(level, type);
    const normalized = {};
    const errors = [];

    // Check required parameters
    for (const definition of definitions) {
      const value = parameters[definition.name];
      
      if (definition.required && (value === undefined || value === null)) {
        errors.push(`Required parameter '${definition.name}' is missing`);
        continue;
      }

      // Use default value if not provided
      const finalValue = value !== undefined ? value : definition.defaultValue;
      
      // Type validation
      if (finalValue !== null && finalValue !== undefined) {
        const typeError = this.validateParameterType(finalValue, definition);
        if (typeError) {
          errors.push(`Parameter '${definition.name}': ${typeError}`);
          continue;
        }

        // Custom validation
        const validationError = this.validateParameterCustom(finalValue, definition);
        if (validationError) {
          errors.push(`Parameter '${definition.name}': ${validationError}`);
          continue;
        }
      }

      normalized[definition.name] = finalValue;
    }

    // Check for unknown parameters
    for (const paramName of Object.keys(parameters)) {
      if (!definitions.find(def => def.name === paramName)) {
        errors.push(`Unknown parameter '${paramName}'`);
      }
    }

    return {
      normalized,
      errors,
      isValid: errors.length === 0
    };
  }

  /**
   * Validate parameter type
   * @param {any} value - Parameter value
   * @param {ParameterDefinition} definition - Parameter definition
   * @returns {string|null} - Error message or null if valid
   */
  validateParameterType(value, definition) {
    const expectedType = definition.type;
    const actualType = typeof value;

    switch (expectedType) {
      case 'string':
        if (actualType !== 'string') {
          return `Expected string, got ${actualType}`;
        }
        break;
      case 'boolean':
        if (actualType !== 'boolean') {
          return `Expected boolean, got ${actualType}`;
        }
        break;
      case 'number':
        if (actualType !== 'number' || isNaN(value)) {
          return `Expected number, got ${actualType}`;
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          return `Expected array, got ${actualType}`;
        }
        break;
      case 'object':
        if (actualType !== 'object' || Array.isArray(value)) {
          return `Expected object, got ${actualType}`;
        }
        break;
    }

    return null;
  }

  /**
   * Validate parameter against custom rules
   * @param {any} value - Parameter value
   * @param {ParameterDefinition} definition - Parameter definition
   * @returns {string|null} - Error message or null if valid
   */
  validateParameterCustom(value, definition) {
    if (!definition.validation) {
      return null;
    }

    const validation = definition.validation;

    // Pattern validation
    if (validation.pattern && typeof value === 'string') {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return `Value does not match pattern ${validation.pattern}`;
      }
    }

    // Enum validation
    if (validation.enum && Array.isArray(validation.enum)) {
      if (!validation.enum.includes(value)) {
        return `Value must be one of: ${validation.enum.join(', ')}`;
      }
    }

    // Length validation
    if (validation.minLength !== undefined && typeof value === 'string') {
      if (value.length < validation.minLength) {
        return `String must be at least ${validation.minLength} characters`;
      }
    }

    if (validation.maxLength !== undefined && typeof value === 'string') {
      if (value.length > validation.maxLength) {
        return `String must be at most ${validation.maxLength} characters`;
      }
    }

    // Numeric range validation
    if (validation.min !== undefined && typeof value === 'number') {
      if (value < validation.min) {
        return `Number must be at least ${validation.min}`;
      }
    }

    if (validation.max !== undefined && typeof value === 'number') {
      if (value > validation.max) {
        return `Number must be at most ${validation.max}`;
      }
    }

    return null;
  }

  /**
   * Get parameter schema for OpenAPI/JSON Schema generation
   * @param {string} level - Question level
   * @param {string} type - Component or asset type
   * @returns {Object} - JSON Schema object
   */
  getParameterSchema(level, type = null) {
    const definitions = this.getParameters(level, type);
    const properties = {};
    const required = [];

    for (const definition of definitions) {
      const property = {
        type: definition.type,
        description: definition.description
      };

      if (definition.defaultValue !== null) {
        property.default = definition.defaultValue;
      }

      if (definition.validation) {
        Object.assign(property, definition.validation);
      }

      properties[definition.name] = property;

      if (definition.required) {
        required.push(definition.name);
      }
    }

    return {
      type: 'object',
      properties,
      required
    };
  }
}

// Default registry content
const DEFAULT_REGISTRY_YAML = `
defaults:
  repository:
    type: string
    required: true
    description: "Repository context (always required)"
  locale:
    type: string
    required: false
    default: "en_US"
    description: "Locale for responses"
  branch:
    type: string
    required: false
    default: "main"
    description: "Git branch context"

dak:

component:
  businessProcess:
    componentType:
      type: string
      required: true
      default: "businessProcess"
      description: "Type of component being analyzed"

asset:
  lesson:
    assetFile:
      type: string
      required: true
      description: "Relative path to the lesson file"
`;

// Singleton instance
const parameterRegistryService = new ParameterRegistryService();

// Load default registry
parameterRegistryService.loadFromYaml(DEFAULT_REGISTRY_YAML);

export default parameterRegistryService;