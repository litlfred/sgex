/**
 * Questionnaire Definition Core Logic
 * Pure business logic for managing FHIR Questionnaire definitions
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
  escapeFSHString,
  parseFSHField,
  FSH_PATTERNS
} from './fsh-utils';
import { DAKValidationError, DAKValidationWarning } from './types';

export interface QuestionnaireItem {
  linkId: string;
  text: string;
  type: string;
  required?: boolean;
  repeats?: boolean;
  readOnly?: boolean;
  answerOption?: Array<{ valueCoding?: { code: string; display: string } }>;
  initial?: Array<{ valueString?: string; valueBoolean?: boolean; valueInteger?: number }>;
  enableWhen?: Array<any>;
  item?: QuestionnaireItem[];
}

export interface QuestionnaireDefinition extends DAKComponentBase {
  url?: string;
  version?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  subjectType?: string[];
  date?: string;
  publisher?: string;
  contact?: Array<any>;
  useContext?: Array<any>;
  jurisdiction?: Array<any>;
  purpose?: string;
  copyright?: string;
  item?: QuestionnaireItem[];
  resourceType?: 'Questionnaire';
  [key: string]: any;
}

export class QuestionnaireDefinitionCore extends BaseDAKComponent<QuestionnaireDefinition> {
  
  constructor(questionnaire?: QuestionnaireDefinition) {
    super(questionnaire || createEmptyComponent<QuestionnaireDefinition>('questionnaire', {
      status: 'draft',
      resourceType: 'Questionnaire'
    }));
  }
  
  /**
   * Get JSON schema for questionnaire definitions
   */
  getSchema(): any {
    return {
      type: 'object',
      required: ['id', 'name', 'status'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { 
          type: 'string', 
          enum: ['draft', 'active', 'retired', 'unknown'] 
        },
        version: { type: 'string' },
        url: { type: 'string' },
        item: {
          type: 'array',
          items: {
            type: 'object',
            required: ['linkId', 'text', 'type'],
            properties: {
              linkId: { type: 'string' },
              text: { type: 'string' },
              type: { type: 'string' },
              required: { type: 'boolean' },
              repeats: { type: 'boolean' }
            }
          }
        }
      }
    };
  }

  /**
   * Generate FSH representation of questionnaire
   */
  generateFSH(): string {
    const q = this.component;
    
    let fsh = generateFSHHeader({
      type: 'Instance',
      id: q.id,
      title: q.name,
      description: q.description
    });
    
    fsh += '\nInstanceOf: Questionnaire\n';
    fsh += `Usage: #definition\n`;
    
    if (q.status) {
      fsh += `* status = #${q.status}\n`;
    }
    
    if (q.version) {
      fsh += `* version = "${escapeFSHString(q.version)}"\n`;
    }
    
    if (q.title) {
      fsh += `* title = "${escapeFSHString(q.title || q.name)}"\n`;
    }
    
    if (q.description) {
      fsh += `* description = "${escapeFSHString(q.description)}"\n`;
    }
    
    // Add items
    if (q.item && q.item.length > 0) {
      fsh += this.generateItemsFSH(q.item, 0);
    }

    return fsh;
  }

  /**
   * Generate FSH for questionnaire items recursively
   */
  private generateItemsFSH(items: QuestionnaireItem[], level: number): string {
    let fsh = '';
    const indent = '  '.repeat(level);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      fsh += `${indent}* item[${i}].linkId = "${escapeFSHString(item.linkId)}"\n`;
      fsh += `${indent}* item[${i}].text = "${escapeFSHString(item.text)}"\n`;
      fsh += `${indent}* item[${i}].type = #${item.type}\n`;
      
      if (item.required !== undefined) {
        fsh += `${indent}* item[${i}].required = ${item.required}\n`;
      }
      
      if (item.repeats !== undefined) {
        fsh += `${indent}* item[${i}].repeats = ${item.repeats}\n`;
      }
      
      // Nested items
      if (item.item && item.item.length > 0) {
        fsh += this.generateItemsFSH(item.item, level + 1);
      }
    }
    
    return fsh;
  }

  /**
   * Parse FSH content to questionnaire definition
   */
  parseFSH(fshContent: string): QuestionnaireDefinition {
    const metadata = extractFSHMetadata(fshContent);
    
    const questionnaire: QuestionnaireDefinition = {
      id: metadata.id || '',
      name: metadata.name || metadata.title || '',
      description: metadata.description || '',
      title: metadata.title || metadata.name || '',
      status: (metadata.status as any) || 'draft',
      type: 'questionnaire',
      resourceType: 'Questionnaire',
      item: []
    };

    // Parse items from FSH (basic implementation)
    // A full parser would extract all item definitions
    const itemMatches = fshContent.matchAll(/\*\s*item\[(\d+)\]\.linkId\s*=\s*"([^"]+)"/g);
    for (const match of itemMatches) {
      const index = parseInt(match[1]);
      const linkId = match[2];
      
      if (!questionnaire.item![index]) {
        questionnaire.item![index] = {
          linkId,
          text: '',
          type: 'string'
        };
      } else {
        questionnaire.item![index].linkId = linkId;
      }
    }

    return questionnaire;
  }

  /**
   * Validate questionnaire definition
   */
  validate(): ComponentValidationResult {
    const q = this.component;
    const errors: DAKValidationError[] = [];
    const warnings: DAKValidationWarning[] = [];

    // Use base validation
    const requiredValidation = this.validateRequiredFields(['id', 'name', 'status']);
    const idValidation = this.validateIdFormat(q.id);
    
    // Custom validation
    if (!['draft', 'active', 'retired', 'unknown'].includes(q.status)) {
      errors.push({
        code: 'INVALID_STATUS',
        message: `Status must be one of: draft, active, retired, unknown`,
        component: 'questionnaire'
      });
    }

    if (!q.item || q.item.length === 0) {
      warnings.push({
        code: 'NO_ITEMS',
        message: 'Questionnaire should have at least one item',
        component: 'questionnaire'
      });
    }

    // Validate items
    if (q.item) {
      for (let i = 0; i < q.item.length; i++) {
        const item = q.item[i];
        
        if (!item.linkId) {
          errors.push({
            code: 'MISSING_LINK_ID',
            message: `Item ${i} is missing linkId`,
            component: 'questionnaire'
          });
        }
        
        if (!item.text) {
          errors.push({
            code: 'MISSING_TEXT',
            message: `Item ${i} is missing text`,
            component: 'questionnaire'
          });
        }
        
        if (!item.type) {
          errors.push({
            code: 'MISSING_TYPE',
            message: `Item ${i} is missing type`,
            component: 'questionnaire'
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
   * Create an empty questionnaire template
   */
  static createEmpty(): QuestionnaireDefinition {
    return createEmptyComponent<QuestionnaireDefinition>('questionnaire', {
      status: 'draft',
      resourceType: 'Questionnaire',
      item: []
    });
  }

  /**
   * Extract FSH metadata from content (static helper for backward compatibility)
   */
  static extractMetadata(fshContent: string): {
    title?: string;
    name?: string;
    description?: string;
    status?: string;
  } {
    return extractFSHMetadata(fshContent);
  }
}

// Export singleton instance for backward compatibility
export const questionnaireDefinitionCore = new QuestionnaireDefinitionCore();
