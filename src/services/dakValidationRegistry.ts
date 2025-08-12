/**
 * DAK Validation Registry (TypeScript)
 * 
 * Central registry for all DAK validation definitions.
 * Manages validation discovery, registration, and execution.
 */

import { 
  ValidationDefinition, 
  DAKComponent, 
  ValidationLevel, 
  DAKValidationResult, 
  ValidationContext,
  ComponentSummary,
  ValidationSummary,
  FormattedValidationResults,
  DAKFile 
} from '../types/core';

// Import validation definitions
import dakSushiBase from './validations/dak-sushi-base.ts';
import jsonValid from './validations/json-valid.ts';
import bpmnBusinessRuleTaskId from './validations/bpmn-business-rule-task-id.ts';
import dmnDecisionLabelId from './validations/dmn-decision-label-id.ts';
import xmlWellFormed from './validations/xml-well-formed.ts';
import fileNamingConventions from './validations/file-naming-conventions.ts';
import dmnBpmnCrossReference from './validations/dmn-bpmn-cross-reference.ts';
// Note: Other validations will be migrated incrementally

/**
 * DAK component categories for grouping validations
 */
export const DAK_COMPONENTS: Record<string, DAKComponent> = {
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
export const VALIDATION_LEVELS: Record<string, ValidationLevel> = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

class DAKValidationRegistry {
  private validations: Map<string, ValidationDefinition> = new Map();
  private componentValidations: Map<string, ValidationDefinition[]> = new Map();

  constructor() {
    this.initializeValidations();
  }

  /**
   * Initialize and register all validation definitions
   */
  private initializeValidations(): void {
    const validationDefinitions: ValidationDefinition[] = [
      dakSushiBase,
      jsonValid,
      bpmnBusinessRuleTaskId,
      dmnDecisionLabelId,
      xmlWellFormed,
      fileNamingConventions,
      dmnBpmnCrossReference,
    ];

    validationDefinitions.forEach(validation => {
      this.registerValidation(validation);
    });

    console.log(`Registered ${this.validations.size} TypeScript validation definitions`);
  }

  /**
   * Register a single validation definition
   */
  registerValidation(validation: ValidationDefinition): void {
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
    this.componentValidations.get(validation.component)!.push(validation);
  }

  /**
   * Get all validations
   */
  getAllValidations(): ValidationDefinition[] {
    return Array.from(this.validations.values());
  }

  /**
   * Get validation by ID
   */
  getValidation(id: string): ValidationDefinition | undefined {
    return this.validations.get(id);
  }

  /**
   * Get validations for a specific component
   */
  getValidationsForComponent(component: string): ValidationDefinition[] {
    return this.componentValidations.get(component) || [];
  }

  /**
   * Get validations applicable to a specific file type
   */
  getValidationsForFileType(fileType: string): ValidationDefinition[] {
    return this.getAllValidations().filter(validation => 
      validation.fileTypes.includes('*') || 
      validation.fileTypes.includes(fileType)
    );
  }

  /**
   * Get validations by severity level
   */
  getValidationsByLevel(level: ValidationLevel): ValidationDefinition[] {
    return this.getAllValidations().filter(validation => 
      validation.level === level
    );
  }

  /**
   * Get all DAK components with their validation counts
   */
  getComponentSummary(): ComponentSummary {
    const summary: ComponentSummary = {};
    
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
  async validateFile(filePath: string, content: string, context: ValidationContext = {}): Promise<DAKValidationResult[]> {
    const fileExtension = this.getFileExtension(filePath);
    const applicableValidations = this.getValidationsForFileType(fileExtension);
    
    const results: DAKValidationResult[] = [];

    for (const validation of applicableValidations) {
      try {
        const result = await validation.validate(filePath, content, context);
        
        if (result) {
          results.push(result);
        }
      } catch (error: any) {
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
  async validateByComponent(component: string, files: DAKFile[], context: ValidationContext = {}): Promise<DAKValidationResult[]> {
    const componentValidations = this.getValidationsForComponent(component);
    const results: DAKValidationResult[] = [];

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
            results.push(result);
          }
        } catch (error: any) {
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
  private getFileExtension(filePath: string): string {
    const parts = filePath.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Check if validation can save (no error-level violations)
   */
  canSave(validationResults: DAKValidationResult[]): boolean {
    return !validationResults.some(result => result.level === VALIDATION_LEVELS.ERROR);
  }

  /**
   * Format validation results for display
   */
  formatResults(validationResults: DAKValidationResult[]): FormattedValidationResults {
    const summary: ValidationSummary = {
      error: 0,
      warning: 0,
      info: 0
    };

    const byComponent: Record<string, DAKValidationResult[]> = {};
    const byFile: Record<string, DAKValidationResult[]> = {};

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