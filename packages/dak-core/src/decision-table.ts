/**
 * Decision Table Core Logic
 * Pure business logic for managing DAK Decision Tables (DMN/FSH Code Systems)
 * Refactored to use base component class and shared FSH utilities
 */

import { 
  BaseDAKComponent, 
  DAKComponentBase,
  ComponentValidationResult,
  mergeValidationResults,
  createEmptyComponent
} from './base-component';
import { 
  extractFSHMetadata, 
  generateFSHHeader,
  generateFSHCodeSystem,
  parseFSHCodeSystem,
  escapeFSHString,
  FSHConcept
} from './fsh-utils';
import { DAKValidationError, DAKValidationWarning } from './types';

export interface DecisionTableVariable extends FSHConcept {
  Code?: string;
  Display?: string;
  Definition?: string;
  Tables?: string;
  Tabs?: string;
  CQL?: string;
  [key: string]: any;
}

export interface DecisionTable extends DAKComponentBase {
  url?: string;
  concepts: DecisionTableVariable[];
  valueSet?: string;
  codeSystem?: string;
  [key: string]: any;
}

export class DecisionTableCore extends BaseDAKComponent<DecisionTable> {
  
  constructor(decisionTable?: DecisionTable) {
    super(decisionTable || createEmptyComponent<DecisionTable>('decision-table', {
      concepts: []
    }));
  }
  
  /**
   * Get JSON schema for decision tables
   */
  getSchema(): any {
    return {
      type: 'object',
      required: ['id', 'name', 'concepts'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        concepts: {
          type: 'array',
          items: {
            type: 'object',
            required: ['code'],
            properties: {
              code: { type: 'string' },
              display: { type: 'string' },
              definition: { type: 'string' },
              properties: { type: 'object' }
            }
          }
        }
      }
    };
  }

  /**
   * Generate FSH representation of decision table code system
   */
  generateFSH(): string {
    const dt = this.component;
    
    // Use the shared FSH code system generator
    return generateFSHCodeSystem(
      dt.id,
      dt.name,
      dt.concepts
    );
  }

  /**
   * Parse FSH code system to decision table
   */
  parseFSH(fshContent: string): DecisionTable {
    const metadata = extractFSHMetadata(fshContent);
    const concepts = parseFSHCodeSystem(fshContent);
    
    // Convert FSHConcept to DecisionTableVariable format
    const variables: DecisionTableVariable[] = concepts.map(concept => ({
      Code: concept.code,
      Display: concept.display || concept.code,
      Definition: concept.definition || '',
      Tables: concept.properties?.Tables || '',
      Tabs: concept.properties?.Tabs || '',
      CQL: concept.properties?.CQL || '',
      ...concept
    }));
    
    const decisionTable: DecisionTable = {
      id: metadata.id || '',
      name: metadata.title || metadata.name || '',
      description: metadata.description || '',
      type: 'decision-table',
      concepts: variables
    };

    return decisionTable;
  }

  /**
   * Validate decision table
   */
  validate(): ComponentValidationResult {
    const dt = this.component;
    const errors: DAKValidationError[] = [];
    const warnings: DAKValidationWarning[] = [];

    // Use base validation
    const requiredValidation = this.validateRequiredFields(['id', 'name']);
    const idValidation = this.validateIdFormat(dt.id);
    
    // Custom validation
    if (!dt.concepts || dt.concepts.length === 0) {
      warnings.push({
        code: 'NO_CONCEPTS',
        message: 'Decision table should have at least one concept/variable',
        component: 'decision-table'
      });
    }

    // Validate concepts
    if (dt.concepts) {
      const codeSeen = new Set<string>();
      
      for (let i = 0; i < dt.concepts.length; i++) {
        const concept = dt.concepts[i];
        
        if (!concept.Code && !concept.code) {
          errors.push({
            code: 'MISSING_CODE',
            message: `Concept ${i} is missing code`,
            component: 'decision-table'
          });
        }
        
        const code = concept.Code || concept.code;
        if (code && codeSeen.has(code)) {
          errors.push({
            code: 'DUPLICATE_CODE',
            message: `Duplicate concept code: ${code}`,
            component: 'decision-table'
          });
        }
        codeSeen.add(code);
        
        if (!concept.Display && !concept.display) {
          warnings.push({
            code: 'MISSING_DISPLAY',
            message: `Concept ${code} is missing display text`,
            component: 'decision-table'
          });
        }
      }
    }

    return mergeValidationResults(
      requiredValidation,
      idValidation,
      { isValid: errors.length === 0, errors, warnings }
    );
  }

  /**
   * Create an empty decision table template
   */
  static createEmpty(): DecisionTable {
    return createEmptyComponent<DecisionTable>('decision-table', {
      concepts: []
    });
  }

  /**
   * Parse FSH code system (static helper for backward compatibility)
   */
  static parseFSHCodeSystem(fshContent: string): DecisionTableVariable[] {
    const concepts = parseFSHCodeSystem(fshContent);
    return concepts.map(concept => ({
      Code: concept.code,
      Display: concept.display || concept.code,
      Definition: concept.definition || '',
      Tables: concept.properties?.Tables || '',
      Tabs: concept.properties?.Tabs || '',
      CQL: concept.properties?.CQL || '',
      ...concept
    }));
  }

  /**
   * Create decision table from concepts
   */
  static fromConcepts(id: string, name: string, concepts: DecisionTableVariable[]): DecisionTable {
    return {
      id,
      name,
      description: '',
      type: 'decision-table',
      concepts
    };
  }

  /**
   * Get variables/concepts from decision table
   */
  getVariables(): DecisionTableVariable[] {
    return this.component.concepts;
  }

  /**
   * Add variable/concept to decision table
   */
  addVariable(variable: DecisionTableVariable): void {
    this.component.concepts.push(variable);
  }

  /**
   * Remove variable/concept from decision table
   */
  removeVariable(code: string): void {
    this.component.concepts = this.component.concepts.filter(
      v => v.Code !== code && v.code !== code
    );
  }

  /**
   * Find variable by code
   */
  findVariable(code: string): DecisionTableVariable | undefined {
    return this.component.concepts.find(
      v => v.Code === code || v.code === code
    );
  }

  /**
   * Update variable
   */
  updateVariable(code: string, updates: Partial<DecisionTableVariable>): void {
    const index = this.component.concepts.findIndex(
      v => v.Code === code || v.code === code
    );
    if (index >= 0) {
      this.component.concepts[index] = {
        ...this.component.concepts[index],
        ...updates
      };
    }
  }
}

// Export singleton instance for backward compatibility
export const decisionTableCore = new DecisionTableCore();
