/**
 * BPMN-BUSINESS-RULE-TASK-ID Validation (TypeScript)
 * 
 * In BPMN diagrams a bpmn:businessRuleTask SHALL have an @id attribute
 */

import { ValidationDefinition, ValidationContext, DAKValidationResult } from '../../types/core';

// Helper functions
const isBPMNContent = (content: string): boolean => {
  return content.includes('http://www.omg.org/spec/BPMN/') || 
         content.includes('businessRuleTask') ||
         content.includes('bpmn:');
};

const findElementLineNumber = (content: string, element: string, index: number): number => {
  // Try to find approximate line number by searching for businessRuleTask
  const lines = content.split('\n');
  let foundCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('businessRuleTask')) {
      if (foundCount === index) {
        return i + 1;
      }
      foundCount++;
    }
  }
  
  return 1; // Fallback
};

const bpmnBusinessRuleTaskId: ValidationDefinition = {
  id: 'bpmn-business-rule-task-id',
  component: 'business-processes',
  level: 'error',
  fileTypes: ['bpmn', 'xml'],
  descriptionKey: 'validation.bpmn.businessRuleTaskId.description',
  description: 'In BPMN diagrams a bpmn:businessRuleTask SHALL have an @id attribute',
  
  async validate(filePath: string, content: string, context: ValidationContext): Promise<DAKValidationResult | null> {
    // Only validate BPMN files or XML files that contain BPMN content
    if (!filePath.endsWith('.bpmn') && !filePath.endsWith('.xml') && !isBPMNContent(content)) {
      return null;
    }
    
    try {
      // Check for businessRuleTask elements without id
      const businessRuleTaskRegex = /<bpmn:businessRuleTask(?![^>]*\sid\s*=)[^>]*>/g;
      const matches = content.match(businessRuleTaskRegex);
      
      if (matches && matches.length > 0) {
        // Find the first businessRuleTask without an id
        const firstMatch = matches[0];
        const matchIndex = content.indexOf(firstMatch);
        const lineNumber = content.substring(0, matchIndex).split('\n').length;
        
        return {
          validationId: 'bpmn-business-rule-task-id',
          component: 'business-processes',
          level: 'error',
          description: 'In BPMN diagrams a bpmn:businessRuleTask SHALL have an @id attribute',
          filePath,
          message: `Found ${matches.length} businessRuleTask${matches.length > 1 ? 's' : ''} without required @id attribute`,
          line: lineNumber,
          column: 1,
          suggestion: 'Add id attribute to each bpmn:businessRuleTask element, e.g., <bpmn:businessRuleTask id="BusinessRuleTask_1">'
        };
      }
      
      return null; // Valid
      
    } catch (error: any) {
      return {
        validationId: 'bpmn-business-rule-task-id',
        component: 'business-processes',
        level: 'error',
        description: 'In BPMN diagrams a bpmn:businessRuleTask SHALL have an @id attribute',
        filePath,
        message: `Error parsing BPMN: ${error.message}`,
        line: 1,
        column: 1,
        suggestion: 'Ensure the BPMN file is well-formed XML'
      };
    }
  },
  
  findLineNumber(content: string, searchTerm: string): number | null {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchTerm)) {
        return i + 1;
      }
    }
    return null;
  }
};

// Add metadata for reference
export const metadata = {
  standard: 'BPMN 2.0',
  reference: 'http://www.omg.org/spec/BPMN/20100524/BPMN20.xsd',
  severity: 'critical'
};

export default bpmnBusinessRuleTaskId;