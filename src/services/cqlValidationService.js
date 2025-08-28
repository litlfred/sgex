/**
 * CQL Validation Service
 * 
 * Validates CQL data element references against the DAK data dictionary
 * and upstream dependencies to ensure all referenced elements are defined.
 */

import logger from '../utils/logger';
import cqlIntrospectionService from './cqlIntrospectionService';

class CQLValidationService {
  constructor() {
    this.logger = logger.getLogger('CQLValidationService');
    this.dataDictionary = new Map();
    this.upstreamDependencies = new Map();
  }

  /**
   * Load data dictionary for validation
   * @param {Object} dictionary - DAK data dictionary object
   */
  loadDataDictionary(dictionary) {
    try {
      this.dataDictionary.clear();
      
      if (!dictionary || !dictionary.concepts) {
        this.logger.warn('No data dictionary concepts provided');
        return;
      }

      // Index dictionary by different keys for lookup
      dictionary.concepts.forEach(concept => {
        if (concept.Code) {
          this.dataDictionary.set(concept.Code, concept);
        }
        if (concept.Display) {
          this.dataDictionary.set(concept.Display, concept);
        }
        if (concept.Definition) {
          // Create searchable keys from definition
          const definitionKeys = this.extractDefinitionKeys(concept.Definition);
          definitionKeys.forEach(key => {
            this.dataDictionary.set(key, concept);
          });
        }
      });

      this.logger.info(`Loaded data dictionary with ${dictionary.concepts.length} concepts`);
      
    } catch (error) {
      this.logger.error('Failed to load data dictionary:', error);
      throw error;
    }
  }

  /**
   * Load upstream dependencies for validation
   * @param {Array} dependencies - Array of upstream dependency data dictionaries
   */
  loadUpstreamDependencies(dependencies) {
    try {
      this.upstreamDependencies.clear();
      
      dependencies.forEach((dependency, index) => {
        const dependencyMap = new Map();
        
        if (dependency.concepts) {
          dependency.concepts.forEach(concept => {
            if (concept.Code) {
              dependencyMap.set(concept.Code, concept);
            }
            if (concept.Display) {
              dependencyMap.set(concept.Display, concept);
            }
          });
        }

        this.upstreamDependencies.set(dependency.name || `dependency-${index}`, dependencyMap);
      });

      this.logger.info(`Loaded ${dependencies.length} upstream dependencies`);
      
    } catch (error) {
      this.logger.error('Failed to load upstream dependencies:', error);
      throw error;
    }
  }

  /**
   * Validate CQL content against data dictionary
   * @param {string} cqlText - CQL source code
   * @param {Object} options - Validation options
   * @returns {Object} Validation results
   */
  validateCQL(cqlText, options = {}) {
    try {
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        dataElementValidation: [],
        valueSetValidation: [],
        libraryValidation: [],
        summary: {
          totalElements: 0,
          validElements: 0,
          invalidElements: 0,
          missingElements: 0
        }
      };

      // Parse CQL to extract references
      const parsed = cqlIntrospectionService.parseCQLText(cqlText);
      
      if (parsed.errors.length > 0) {
        validationResult.errors.push(...parsed.errors);
        validationResult.isValid = false;
      }

      // Validate data elements
      validationResult.dataElementValidation = this.validateDataElements(parsed.dataElements);
      
      // Validate value sets
      validationResult.valueSetValidation = this.validateValueSets(parsed.valueSets);
      
      // Validate library references
      validationResult.libraryValidation = this.validateLibraryReferences(parsed.libraries);

      // Calculate summary
      this.calculateValidationSummary(validationResult);

      // Check if validation passed
      validationResult.isValid = validationResult.errors.length === 0 && 
                                 validationResult.summary.invalidElements === 0;

      this.logger.info('CQL validation completed', {
        isValid: validationResult.isValid,
        errorCount: validationResult.errors.length,
        warningCount: validationResult.warnings.length
      });

      return validationResult;

    } catch (error) {
      this.logger.error('CQL validation failed:', error);
      return {
        isValid: false,
        errors: [error.message],
        warnings: [],
        dataElementValidation: [],
        valueSetValidation: [],
        libraryValidation: [],
        summary: { totalElements: 0, validElements: 0, invalidElements: 0, missingElements: 0 }
      };
    }
  }

  /**
   * Validate data elements against dictionary
   * @param {Array} dataElements - Array of data element references
   * @returns {Array} Validation results for each element
   */
  validateDataElements(dataElements) {
    return dataElements.map(element => {
      const validation = {
        element,
        isValid: false,
        source: null,
        concept: null,
        issues: []
      };

      // Check in main data dictionary
      if (this.dataDictionary.has(element)) {
        validation.isValid = true;
        validation.source = 'local';
        validation.concept = this.dataDictionary.get(element);
        return validation;
      }

      // Check in upstream dependencies
      for (const [depName, depMap] of this.upstreamDependencies) {
        if (depMap.has(element)) {
          validation.isValid = true;
          validation.source = depName;
          validation.concept = depMap.get(element);
          return validation;
        }
      }

      // Check for partial matches or similar elements
      const suggestions = this.findSimilarElements(element);
      if (suggestions.length > 0) {
        validation.issues.push({
          type: 'suggestion',
          message: `Element not found, did you mean: ${suggestions.join(', ')}?`
        });
      } else {
        validation.issues.push({
          type: 'missing',
          message: 'Element not found in data dictionary or upstream dependencies'
        });
      }

      return validation;
    });
  }

  /**
   * Validate value sets
   * @param {Array} valueSets - Array of value set references
   * @returns {Array} Validation results for each value set
   */
  validateValueSets(valueSets) {
    return valueSets.map(valueSet => {
      const validation = {
        valueSet,
        isValid: false,
        source: null,
        issues: []
      };

      // Basic validation - check if it looks like a valid value set reference
      if (this.isValidValueSetFormat(valueSet)) {
        validation.isValid = true;
        validation.source = 'format';
      } else {
        validation.issues.push({
          type: 'format',
          message: 'Value set reference does not follow expected format'
        });
      }

      return validation;
    });
  }

  /**
   * Validate library references
   * @param {Array} libraries - Array of library references
   * @returns {Array} Validation results for each library
   */
  validateLibraryReferences(libraries) {
    return libraries.map(library => {
      const validation = {
        library,
        isValid: true, // Assume valid for now - would need library registry
        source: 'unknown',
        issues: []
      };

      // Add warning about unverified library
      validation.issues.push({
        type: 'warning',
        message: 'Library reference not verified - ensure library is available at runtime'
      });

      return validation;
    });
  }

  /**
   * Find similar elements for suggestions
   * @param {string} element - Element to find similar matches for
   * @returns {Array} Array of similar element names
   */
  findSimilarElements(element) {
    const suggestions = [];
    const elementLower = element.toLowerCase();

    // Search in data dictionary
    for (const [key] of this.dataDictionary) {
      if (key.toLowerCase().includes(elementLower) || 
          elementLower.includes(key.toLowerCase())) {
        suggestions.push(key);
        if (suggestions.length >= 3) break; // Limit suggestions
      }
    }

    return suggestions;
  }

  /**
   * Check if value set reference follows valid format
   * @param {string} valueSet - Value set reference
   * @returns {boolean} True if format is valid
   */
  isValidValueSetFormat(valueSet) {
    // Check for common value set patterns
    const patterns = [
      /^urn:oid:\d+(\.\d+)*$/, // OID format
      /^https?:\/\/.*/, // URL format
      /.*\s+(Codes|Values|Set)$/, // Descriptive format
      /^[A-Z][a-zA-Z0-9\s]+$/ // Simple descriptive format
    ];

    return patterns.some(pattern => pattern.test(valueSet));
  }

  /**
   * Extract searchable keys from definition text
   * @param {string} definition - Definition text
   * @returns {Array} Array of searchable keys
   */
  extractDefinitionKeys(definition) {
    if (!definition) return [];

    const keys = [];
    
    // Extract FHIR resource types
    const resourceTypes = definition.match(/\b[A-Z][a-z]+\b/g);
    if (resourceTypes) {
      keys.push(...resourceTypes);
    }

    // Extract property paths
    const propertyPaths = definition.match(/\w+\.\w+/g);
    if (propertyPaths) {
      keys.push(...propertyPaths);
    }

    return [...new Set(keys)]; // Remove duplicates
  }

  /**
   * Calculate validation summary
   * @param {Object} validationResult - Validation result object to update
   */
  calculateValidationSummary(validationResult) {
    const summary = validationResult.summary;
    
    // Count data elements
    validationResult.dataElementValidation.forEach(validation => {
      summary.totalElements++;
      if (validation.isValid) {
        summary.validElements++;
      } else {
        summary.invalidElements++;
        if (validation.issues.some(issue => issue.type === 'missing')) {
          summary.missingElements++;
        }
      }
    });

    // Add value sets to totals
    validationResult.valueSetValidation.forEach(validation => {
      summary.totalElements++;
      if (validation.isValid) {
        summary.validElements++;
      } else {
        summary.invalidElements++;
      }
    });
  }

  /**
   * Generate validation report
   * @param {Object} validationResult - Validation result
   * @returns {string} Human-readable validation report
   */
  generateReport(validationResult) {
    const lines = [];
    
    lines.push('=== CQL Validation Report ===');
    lines.push('');
    
    // Summary
    lines.push('Summary:');
    lines.push(`  Total Elements: ${validationResult.summary.totalElements}`);
    lines.push(`  Valid Elements: ${validationResult.summary.validElements}`);
    lines.push(`  Invalid Elements: ${validationResult.summary.invalidElements}`);
    lines.push(`  Missing Elements: ${validationResult.summary.missingElements}`);
    lines.push(`  Overall Status: ${validationResult.isValid ? 'VALID' : 'INVALID'}`);
    lines.push('');

    // Errors
    if (validationResult.errors.length > 0) {
      lines.push('Errors:');
      validationResult.errors.forEach(error => {
        lines.push(`  - ${error}`);
      });
      lines.push('');
    }

    // Invalid data elements
    const invalidElements = validationResult.dataElementValidation.filter(v => !v.isValid);
    if (invalidElements.length > 0) {
      lines.push('Invalid Data Elements:');
      invalidElements.forEach(validation => {
        lines.push(`  - ${validation.element}`);
        validation.issues.forEach(issue => {
          lines.push(`    ${issue.type}: ${issue.message}`);
        });
      });
      lines.push('');
    }

    // Warnings
    if (validationResult.warnings.length > 0) {
      lines.push('Warnings:');
      validationResult.warnings.forEach(warning => {
        lines.push(`  - ${warning}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Clear validation data
   */
  clear() {
    this.dataDictionary.clear();
    this.upstreamDependencies.clear();
    this.logger.info('CQL validation service cleared');
  }
}

// Create singleton instance
const cqlValidationService = new CQLValidationService();

export default cqlValidationService;