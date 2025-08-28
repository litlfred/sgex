/**
 * CQL Introspection Service
 * 
 * Analyzes CQL and ELM JSON to extract data element references, library dependencies,
 * and other metadata for validation and navigation purposes.
 */

import logger from '../utils/logger';

class CQLIntrospectionService {
  constructor() {
    this.logger = logger.getLogger('CQLIntrospectionService');
  }

  /**
   * Parse CQL text to extract data element references
   * @param {string} cqlText - CQL source code
   * @returns {Object} Parsed references and metadata
   */
  parseCQLText(cqlText) {
    try {
      const result = {
        dataElements: new Set(),
        libraries: new Set(),
        valueSets: new Set(),
        parameters: new Set(),
        definitions: new Set(),
        context: null,
        errors: []
      };

      if (!cqlText || typeof cqlText !== 'string') {
        result.errors.push('Invalid CQL text provided');
        return this.formatResult(result);
      }

      const lines = cqlText.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip comments and empty lines
        if (!line || line.startsWith('//') || line.startsWith('/*')) {
          continue;
        }

        // Extract context
        const contextMatch = line.match(/context\s+(\w+)/i);
        if (contextMatch) {
          result.context = contextMatch[1];
        }

        // Extract include statements (library dependencies)
        const includeMatch = line.match(/include\s+([^\s]+)/i);
        if (includeMatch) {
          result.libraries.add(includeMatch[1]);
        }

        // Extract value set references
        const valueSetMatches = line.match(/"[^"]*"/g);
        if (valueSetMatches) {
          valueSetMatches.forEach(match => {
            const valueSet = match.replace(/"/g, '');
            if (this.isValueSetReference(valueSet)) {
              result.valueSets.add(valueSet);
            }
          });
        }

        // Extract data type references (FHIR resources)
        const dataTypeMatches = line.match(/\[([A-Z][a-zA-Z]+)\]/g);
        if (dataTypeMatches) {
          dataTypeMatches.forEach(match => {
            const dataType = match.replace(/[\[\]]/g, '');
            result.dataElements.add(dataType);
          });
        }

        // Extract parameter definitions
        const parameterMatch = line.match(/parameter\s+([^\s:]+)/i);
        if (parameterMatch) {
          result.parameters.add(parameterMatch[1]);
        }

        // Extract define statements
        const defineMatch = line.match(/define\s+([^\s:]+)/i);
        if (defineMatch) {
          result.definitions.add(defineMatch[1]);
        }

        // Extract resource property references
        const propertyMatches = line.match(/(\w+)\.(\w+)/g);
        if (propertyMatches) {
          propertyMatches.forEach(match => {
            result.dataElements.add(match);
          });
        }
      }

      this.logger.info('Parsed CQL text', {
        dataElements: result.dataElements.size,
        libraries: result.libraries.size,
        valueSets: result.valueSets.size
      });

      return this.formatResult(result);

    } catch (error) {
      this.logger.error('Failed to parse CQL text:', error);
      return {
        dataElements: [],
        libraries: [],
        valueSets: [],
        parameters: [],
        definitions: [],
        context: null,
        errors: [error.message]
      };
    }
  }

  /**
   * Parse ELM JSON to extract data element references
   * @param {Object} elmJson - ELM JSON object
   * @returns {Object} Parsed references and metadata
   */
  parseELMJson(elmJson) {
    try {
      const result = {
        dataElements: new Set(),
        libraries: new Set(),
        valueSets: new Set(),
        parameters: new Set(),
        definitions: new Set(),
        context: null,
        errors: []
      };

      if (!elmJson || !elmJson.library) {
        result.errors.push('Invalid ELM JSON provided');
        return this.formatResult(result);
      }

      const library = elmJson.library;

      // Extract library includes
      if (library.includes?.def) {
        library.includes.def.forEach(include => {
          if (include.localIdentifier) {
            result.libraries.add(include.localIdentifier);
          }
        });
      }

      // Extract parameters
      if (library.parameters?.def) {
        library.parameters.def.forEach(param => {
          if (param.name) {
            result.parameters.add(param.name);
          }
        });
      }

      // Extract statements (definitions)
      if (library.statements?.def) {
        library.statements.def.forEach(statement => {
          if (statement.name) {
            result.definitions.add(statement.name);
          }
          
          // Extract context from statements
          if (statement.context && !result.context) {
            result.context = statement.context;
          }

          // Recursively extract data elements from expressions
          this.extractFromExpression(statement.expression, result);
        });
      }

      // Extract value sets
      if (library.valueSets?.def) {
        library.valueSets.def.forEach(valueSet => {
          if (valueSet.name) {
            result.valueSets.add(valueSet.name);
          }
        });
      }

      this.logger.info('Parsed ELM JSON', {
        dataElements: result.dataElements.size,
        libraries: result.libraries.size,
        valueSets: result.valueSets.size
      });

      return this.formatResult(result);

    } catch (error) {
      this.logger.error('Failed to parse ELM JSON:', error);
      return {
        dataElements: [],
        libraries: [],
        valueSets: [],
        parameters: [],
        definitions: [],
        context: null,
        errors: [error.message]
      };
    }
  }

  /**
   * Recursively extract data elements from ELM expressions
   * @param {Object} expression - ELM expression object
   * @param {Object} result - Result object to accumulate findings
   */
  extractFromExpression(expression, result) {
    if (!expression) return;

    // Handle different expression types
    switch (expression.type) {
      case 'Retrieve':
        if (expression.dataType) {
          // Extract FHIR resource type from dataType
          const resourceType = this.extractResourceType(expression.dataType);
          if (resourceType) {
            result.dataElements.add(resourceType);
          }
        }
        break;

      case 'Property':
        if (expression.path) {
          result.dataElements.add(expression.path);
        }
        // Recursively process source
        this.extractFromExpression(expression.source, result);
        break;

      case 'InValueSet':
        if (expression.valueset) {
          result.valueSets.add(expression.valueset);
        }
        this.extractFromExpression(expression.code, result);
        break;

      case 'Equal':
      case 'NotEqual':
      case 'Less':
      case 'Greater':
      case 'And':
      case 'Or':
        // Binary operations
        this.extractFromExpression(expression.operand?.[0], result);
        this.extractFromExpression(expression.operand?.[1], result);
        break;

      case 'Exists':
      case 'Not':
        // Unary operations
        this.extractFromExpression(expression.operand, result);
        break;

      case 'Query':
        // Handle queries
        if (expression.source) {
          expression.source.forEach(source => {
            this.extractFromExpression(source.expression, result);
          });
        }
        this.extractFromExpression(expression.where, result);
        break;

      default:
        // Handle arrays of operands
        if (expression.operand && Array.isArray(expression.operand)) {
          expression.operand.forEach(operand => {
            this.extractFromExpression(operand, result);
          });
        }
        break;
    }
  }

  /**
   * Extract FHIR resource type from dataType string
   * @param {string} dataType - ELM dataType string
   * @returns {string} FHIR resource type
   */
  extractResourceType(dataType) {
    // Handle dataType like "{http://hl7.org/fhir}Patient"
    const match = dataType.match(/\{[^}]+\}(\w+)/);
    return match ? match[1] : dataType;
  }

  /**
   * Check if a string looks like a value set reference
   * @param {string} str - String to check
   * @returns {boolean} True if it looks like a value set reference
   */
  isValueSetReference(str) {
    // Value sets often have specific patterns (URIs, OIDs, or descriptive names)
    return str.includes('urn:') || 
           str.includes('http:') || 
           str.includes('oid:') ||
           str.includes(' Codes') ||
           str.includes(' Values') ||
           str.includes(' Set');
  }

  /**
   * Format result by converting Sets to Arrays
   * @param {Object} result - Result with Sets
   * @returns {Object} Result with Arrays
   */
  formatResult(result) {
    return {
      dataElements: Array.from(result.dataElements),
      libraries: Array.from(result.libraries),
      valueSets: Array.from(result.valueSets),
      parameters: Array.from(result.parameters),
      definitions: Array.from(result.definitions),
      context: result.context,
      errors: result.errors
    };
  }

  /**
   * Extract library references from CQL text
   * @param {string} cqlText - CQL source code
   * @returns {Array} Array of library references with line numbers
   */
  extractLibraryReferences(cqlText) {
    const references = [];
    
    if (!cqlText) return references;

    const lines = cqlText.split('\n');
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Match include statements
      const includeMatch = trimmedLine.match(/include\s+([^\s]+)(\s+version\s+[^\s]+)?(\s+called\s+([^\s]+))?/i);
      if (includeMatch) {
        references.push({
          type: 'include',
          library: includeMatch[1],
          version: includeMatch[2]?.replace(/\s*version\s+/i, '').trim(),
          alias: includeMatch[4],
          line: index + 1,
          text: trimmedLine
        });
      }

      // Match library function calls (LibraryName.FunctionName)
      const functionCallMatches = trimmedLine.matchAll(/([A-Z][a-zA-Z0-9_]*)\s*\.\s*([a-zA-Z][a-zA-Z0-9_]*)/g);
      for (const match of functionCallMatches) {
        references.push({
          type: 'function-call',
          library: match[1],
          function: match[2],
          line: index + 1,
          text: trimmedLine
        });
      }
    });

    return references;
  }

  /**
   * Get summary statistics for CQL content
   * @param {string} cqlText - CQL source code
   * @returns {Object} Summary statistics
   */
  getSummary(cqlText) {
    const parsed = this.parseCQLText(cqlText);
    const libraryRefs = this.extractLibraryReferences(cqlText);
    
    return {
      context: parsed.context,
      dataElementCount: parsed.dataElements.length,
      libraryCount: parsed.libraries.length,
      valueSetCount: parsed.valueSets.length,
      parameterCount: parsed.parameters.length,
      definitionCount: parsed.definitions.length,
      libraryReferences: libraryRefs.length,
      hasErrors: parsed.errors.length > 0,
      errors: parsed.errors
    };
  }
}

// Create singleton instance
const cqlIntrospectionService = new CQLIntrospectionService();

export default cqlIntrospectionService;