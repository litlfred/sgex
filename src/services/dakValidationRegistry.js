/**
 * DAK Validation Registry
 * 
 * Central registry for all DAK validation definitions.
 * Manages validation discovery, registration, and execution.
 */

// Import all validation definitions
import dakSushiBase from './validations/dak-sushi-base.js';
import bpmnBusinessRuleTaskId from './validations/bpmn-business-rule-task-id.js';
import dmnDecisionLabelId from './validations/dmn-decision-label-id.js';
import dmnBpmnCrossReference from './validations/dmn-bpmn-cross-reference.js';
import xmlWellFormed from './validations/xml-well-formed.js';
import jsonValid from './validations/json-valid.js';
import fileNamingConventions from './validations/file-naming-conventions.js';

/**
 * DAK component categories for grouping validations
 */
export const DAK_COMPONENTS = {
  'dak-structure': {
    id: 'dak-structure',
    name: 'DAK Structure',
    description: 'Overall DAK repository structure and configuration'
  },
  'business-processes': {
    id: 'business-processes',
    name: 'Business Processes',
    description: 'BPMN workflows and process definitions'
  },
  'decision-support-logic': {
    id: 'decision-support-logic',
    name: 'Decision Support Logic',
    description: 'DMN decision tables and business rules'
  },
  'core-data-elements': {
    id: 'core-data-elements',
    name: 'Core Data Elements',
    description: 'Terminology and data model definitions'
  },
  'indicators': {
    id: 'indicators',
    name: 'Program Indicators',
    description: 'Performance indicators and measures'
  },
  'publications': {
    id: 'publications',
    name: 'Publications',
    description: 'Health interventions and recommendations'
  },
  'requirements': {
    id: 'requirements',
    name: 'Requirements',
    description: 'Functional and non-functional requirements'
  },
  'test-scenarios': {
    id: 'test-scenarios',
    name: 'Test Scenarios',
    description: 'Test cases and validation scenarios'
  },
  'personas': {
    id: 'personas',
    name: 'Generic Personas',
    description: 'User roles and actor definitions'
  },
  'user-scenarios': {
    id: 'user-scenarios',
    name: 'User Scenarios',
    description: 'Use case narratives and workflows'
  },
  'file-structure': {
    id: 'file-structure',
    name: 'File Structure',
    description: 'General file format and structure validations'
  }
};

/**
 * Validation severity levels
 */
export const VALIDATION_LEVELS = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

class DAKValidationRegistry {
  constructor() {
    this.validations = new Map();
    this.componentValidations = new Map();
    this.initializeValidations();
  }

  /**
   * Initialize and register all validation definitions
   */
  initializeValidations() {
    const validationDefinitions = [
      dakSushiBase,
      bpmnBusinessRuleTaskId,
      dmnDecisionLabelId,
      dmnBpmnCrossReference,
      xmlWellFormed,
      jsonValid,
      fileNamingConventions
    ];

    validationDefinitions.forEach(validation => {
      this.registerValidation(validation);
    });

    console.log(`Registered ${this.validations.size} validation definitions`);
  }

  /**
   * Register a single validation definition
   */
  registerValidation(validation) {
    if (!validation.id) {
      throw new Error('Validation must have an id');
    }

    if (this.validations.has(validation.id)) {
      console.warn(`Validation ${validation.id} is already registered. Overwriting.`);
    }

    // Store validation by ID
    this.validations.set(validation.id, validation);

    // Group by component
    if (!this.componentValidations.has(validation.component)) {
      this.componentValidations.set(validation.component, []);
    }
    this.componentValidations.get(validation.component).push(validation);
  }

  /**
   * Get all validations
   */
  getAllValidations() {
    return Array.from(this.validations.values());
  }

  /**
   * Get validation by ID
   */
  getValidation(id) {
    return this.validations.get(id);
  }

  /**
   * Get validations for a specific component
   */
  getValidationsForComponent(component) {
    return this.componentValidations.get(component) || [];
  }

  /**
   * Get validations applicable to a specific file type
   */
  getValidationsForFileType(fileType) {
    return this.getAllValidations().filter(validation => 
      validation.fileTypes.includes('*') || 
      validation.fileTypes.includes(fileType)
    );
  }

  /**
   * Get validations by severity level
   */
  getValidationsByLevel(level) {
    return this.getAllValidations().filter(validation => 
      validation.level === level
    );
  }

  /**
   * Get all DAK components with their validation counts
   */
  getComponentSummary() {
    const summary = {};
    
    Object.values(DAK_COMPONENTS).forEach(component => {
      const validations = this.getValidationsForComponent(component.id);
      summary[component.id] = {
        ...component,
        validationCount: validations.length,
        errorCount: validations.filter(v => v.level === VALIDATION_LEVELS.ERROR).length,
        warningCount: validations.filter(v => v.level === VALIDATION_LEVELS.WARNING).length,
        infoCount: validations.filter(v => v.level === VALIDATION_LEVELS.INFO).length
      };
    });

    return summary;
  }

  /**
   * Validate a single file against all applicable validations
   */
  async validateFile(filePath, content, context = {}) {
    const fileExtension = this.getFileExtension(filePath);
    const applicableValidations = this.getValidationsForFileType(fileExtension);
    
    const results = [];

    for (const validation of applicableValidations) {
      try {
        const result = await validation.validate(filePath, content, context);
        
        if (result) {
          results.push({
            validationId: validation.id,
            component: validation.component,
            level: validation.level,
            description: validation.description,
            filePath: filePath,
            ...result
          });
        }
      } catch (error) {
        console.error(`Error running validation ${validation.id}:`, error);
        results.push({
          validationId: validation.id,
          component: validation.component,
          level: VALIDATION_LEVELS.ERROR,
          description: 'Validation execution failed',
          filePath: filePath,
          message: `Validation error: ${error.message}`,
          suggestion: 'Contact support if this error persists'
        });
      }
    }

    return results;
  }

  /**
   * Validate files grouped by component
   */
  async validateByComponent(component, files, context = {}) {
    const componentValidations = this.getValidationsForComponent(component);
    const results = [];

    for (const file of files) {
      for (const validation of componentValidations) {
        try {
          const fileExtension = this.getFileExtension(file.path);
          
          // Check if validation applies to this file type
          if (!validation.fileTypes.includes('*') && 
              !validation.fileTypes.includes(fileExtension)) {
            continue;
          }

          const result = await validation.validate(file.path, file.content, context);
          
          if (result) {
            results.push({
              validationId: validation.id,
              component: validation.component,
              level: validation.level,
              description: validation.description,
              filePath: file.path,
              ...result
            });
          }
        } catch (error) {
          console.error(`Error running validation ${validation.id} on ${file.path}:`, error);
          results.push({
            validationId: validation.id,
            component: validation.component,
            level: VALIDATION_LEVELS.ERROR,
            description: 'Validation execution failed',
            filePath: file.path,
            message: `Validation error: ${error.message}`,
            suggestion: 'Contact support if this error persists'
          });
        }
      }
    }

    return results;
  }

  /**
   * Get file extension from path
   */
  getFileExtension(filePath) {
    const parts = filePath.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Check if validation can save (no error-level violations)
   */
  canSave(validationResults) {
    return !validationResults.some(result => result.level === VALIDATION_LEVELS.ERROR);
  }

  /**
   * Format validation results for display
   */
  formatResults(validationResults) {
    const summary = {
      error: 0,
      warning: 0,
      info: 0
    };

    const byComponent = {};
    const byFile = {};

    validationResults.forEach(result => {
      // Update summary counts
      summary[result.level]++;

      // Group by component
      if (!byComponent[result.component]) {
        byComponent[result.component] = [];
      }
      byComponent[result.component].push(result);

      // Group by file
      if (!byFile[result.filePath]) {
        byFile[result.filePath] = [];
      }
      byFile[result.filePath].push(result);
    });

    return {
      summary,
      byComponent,
      byFile,
      canSave: this.canSave(validationResults),
      total: validationResults.length
    };
  }
}

// Create singleton instance
const dakValidationRegistry = new DAKValidationRegistry();

export default dakValidationRegistry;