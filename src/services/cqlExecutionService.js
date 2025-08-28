/**
 * CQL Execution Service
 * 
 * Provides client-side execution of Clinical Quality Language (CQL) logic
 * using the cql-execution library. Supports loading ELM JSON, executing
 * against FHIR test data, and handling library dependencies.
 */

import { Repository, Executor, CodeService, PatientSource } from 'cql-execution';
import logger from '../utils/logger';

class CQLExecutionService {
  constructor() {
    this.logger = logger.getLogger('CQLExecutionService');
    this.elmLibraries = new Map(); // Cache for ELM JSON libraries
    this.valueSetDB = new Map(); // Value sets cache
    this.codeService = null;
  }

  /**
   * Initialize the service with basic code service
   */
  initialize() {
    // Create a basic code service for value set lookup
    this.codeService = new CodeService(this.valueSetDB);
    this.logger.info('CQL Execution Service initialized');
  }

  /**
   * Load ELM JSON content into the service
   * @param {string} libraryName - Name of the library
   * @param {Object} elmJson - ELM JSON object
   */
  loadLibrary(libraryName, elmJson) {
    try {
      if (!elmJson || typeof elmJson !== 'object') {
        throw new Error('Invalid ELM JSON provided');
      }

      this.elmLibraries.set(libraryName, elmJson);
      this.logger.info(`Loaded library: ${libraryName}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to load library ${libraryName}:`, error);
      throw error;
    }
  }

  /**
   * Convert CQL text to ELM JSON (placeholder - would need CQL-to-ELM translation service)
   * @param {string} cqlText - CQL source code
   * @returns {Object} ELM JSON object
   */
  translateCQL(cqlText) {
    // This is a placeholder - in a real implementation, this would call
    // a CQL translation service to convert CQL to ELM JSON
    this.logger.warn('CQL translation not implemented - provide ELM JSON directly');
    
    // Return a basic structure for demonstration
    return {
      library: {
        identifier: { id: 'Demo', version: '1.0.0' },
        schemaIdentifier: { id: 'urn:hl7-org:elm', version: 'r1' },
        usings: {
          def: [{ localIdentifier: 'System', uri: 'urn:hl7-org:elm-types:r1' }]
        },
        statements: {
          def: [
            {
              name: 'Patient',
              context: 'Patient',
              expression: { type: 'SingletonFrom', operand: { dataType: '{http://hl7.org/fhir}Patient', type: 'Retrieve' } }
            }
          ]
        }
      }
    };
  }

  /**
   * Execute CQL library against test data
   * @param {string} libraryName - Name of the library to execute
   * @param {Array} testData - Array of FHIR resources for execution context
   * @param {Object} parameters - Parameters to pass to CQL execution
   * @returns {Object} Execution results
   */
  async executeLibrary(libraryName, testData = [], parameters = {}) {
    try {
      if (!this.codeService) {
        this.initialize();
      }

      const elmJson = this.elmLibraries.get(libraryName);
      if (!elmJson) {
        throw new Error(`Library ${libraryName} not loaded`);
      }

      // Create repository with the ELM library
      const repository = new Repository(elmJson);
      
      // Create patient source from test data
      const patientSource = PatientSource.FHIRv401();
      
      // Load test data into patient source
      if (testData && testData.length > 0) {
        // Group test data by patient if needed
        const patientBundle = this.prepareTestData(testData);
        patientSource.loadBundles([patientBundle]);
      }

      // Create executor
      const executor = new Executor(repository, this.codeService, parameters);
      
      // Execute and get results
      const results = executor.exec(patientSource);
      
      this.logger.info(`Executed library ${libraryName}`, { 
        resultCount: Object.keys(results.patientResults || {}).length 
      });

      return {
        success: true,
        libraryName,
        results: results.patientResults || {},
        unfilteredResults: results.unfilteredResults || {},
        localIdPatientResultsMap: results.localIdPatientResultsMap || {}
      };

    } catch (error) {
      this.logger.error(`Failed to execute library ${libraryName}:`, error);
      return {
        success: false,
        libraryName,
        error: error.message,
        results: {}
      };
    }
  }

  /**
   * Prepare test data for CQL execution
   * @param {Array} testData - Raw test data (FHIR resources)
   * @returns {Object} FHIR Bundle for execution
   */
  prepareTestData(testData) {
    // Create a basic FHIR Bundle structure
    const bundle = {
      resourceType: 'Bundle',
      id: 'test-data-bundle',
      type: 'collection',
      entry: []
    };

    // Add test data as bundle entries
    testData.forEach((resource, index) => {
      if (resource && resource.resourceType) {
        bundle.entry.push({
          fullUrl: `urn:uuid:test-resource-${index}`,
          resource: resource
        });
      }
    });

    return bundle;
  }

  /**
   * Load value sets for CQL execution
   * @param {Array} valueSets - Array of value set definitions
   */
  loadValueSets(valueSets) {
    try {
      valueSets.forEach(valueSet => {
        if (valueSet.id && valueSet.codes) {
          this.valueSetDB.set(valueSet.id, valueSet.codes);
        }
      });
      
      // Reinitialize code service with updated value sets
      this.codeService = new CodeService(this.valueSetDB);
      this.logger.info(`Loaded ${valueSets.length} value sets`);
      
    } catch (error) {
      this.logger.error('Failed to load value sets:', error);
      throw error;
    }
  }

  /**
   * Get list of loaded libraries
   * @returns {Array} Array of library names
   */
  getLoadedLibraries() {
    return Array.from(this.elmLibraries.keys());
  }

  /**
   * Clear all loaded libraries and value sets
   */
  clear() {
    this.elmLibraries.clear();
    this.valueSetDB.clear();
    this.codeService = null;
    this.logger.info('CQL Execution Service cleared');
  }

  /**
   * Get library information
   * @param {string} libraryName - Name of the library
   * @returns {Object} Library metadata
   */
  getLibraryInfo(libraryName) {
    const elmJson = this.elmLibraries.get(libraryName);
    if (!elmJson) {
      return null;
    }

    const library = elmJson.library || {};
    return {
      name: libraryName,
      identifier: library.identifier || {},
      usings: library.usings?.def || [],
      includes: library.includes?.def || [],
      statements: library.statements?.def || [],
      parameters: library.parameters?.def || []
    };
  }
}

// Create singleton instance
const cqlExecutionService = new CQLExecutionService();

export default cqlExecutionService;