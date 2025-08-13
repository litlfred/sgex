/**
 * DMN-DECISION-LABEL-ID Validation (TypeScript)
 * 
 * In DMN diagrams, decisions SHALL have both label and id attributes
 */

import { ValidationDefinition, ValidationContext, DAKValidationResult } from '../../types/core';

// Helper functions
const isDMNContent = (content: string): boolean => {
  return content.includes('http://www.omg.org/spec/DMN/') || 
         content.includes('dmndi:') ||
         content.includes('dmn:') ||
         content.includes('decision');
};

const findDecisionLineNumber = (content: string, index: number): number => {
  const lines = content.split('\n');
  let foundCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<dmn:decision') || lines[i].includes('<decision')) {
      if (foundCount === index) {
        return i + 1;
      }
      foundCount++;
    }
  }
  
  return 1; // Fallback
};

const dmnDecisionLabelId: ValidationDefinition = {
  id: 'dmn-decision-label-id',
  component: 'decision-support-logic',
  level: 'error',
  fileTypes: ['dmn', 'xml'],
  descriptionKey: 'validation.dmn.decisionLabelId.description',
  description: 'In DMN diagrams, decisions SHALL have both label and id attributes',
  
  async validate(filePath: string, content: string, context: ValidationContext): Promise<DAKValidationResult | null> {
    // Only validate DMN files or XML files that contain DMN content
    if (!filePath.endsWith('.dmn') && !filePath.endsWith('.xml') && !isDMNContent(content)) {
      return null;
    }
    
    try {
      // Check for decision elements without required attributes
      const decisionRegex = /<dmn:decision[^>]*>/g;
      const matches = Array.from(content.matchAll(decisionRegex));
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const decisionTag = match[0];
        
        // Check for id attribute
        const hasId = /\sid\s*=\s*["'][^"']*["']/.test(decisionTag);
        // Check for label attribute
        const hasLabel = /\slabel\s*=\s*["'][^"']*["']/.test(decisionTag);
        
        if (!hasId || !hasLabel) {
          const matchIndex = match.index || 0;
          const lineNumber = content.substring(0, matchIndex).split('\n').length;
          
          let message = 'Decision element missing required attributes: ';
          const missing = [];
          if (!hasId) missing.push('id');
          if (!hasLabel) missing.push('label');
          message += missing.join(', ');
          
          return {
            validationId: 'dmn-decision-label-id',
            component: 'decision-support-logic',
            level: 'error',
            description: 'In DMN diagrams, decisions SHALL have both label and id attributes',
            filePath,
            message,
            line: lineNumber,
            column: 1,
            suggestion: `Add missing attributes to dmn:decision element: ${missing.map(attr => `${attr}="value"`).join(', ')}`
          };
        }
      }
      
      return null; // Valid
      
    } catch (error: any) {
      return {
        validationId: 'dmn-decision-label-id',
        component: 'decision-support-logic',
        level: 'error',
        description: 'In DMN diagrams, decisions SHALL have both label and id attributes',
        filePath,
        message: `Error parsing DMN: ${error.message}`,
        line: 1,
        column: 1,
        suggestion: 'Ensure the DMN file is well-formed XML'
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
  standard: 'DMN 1.3',
  reference: 'https://www.omg.org/spec/DMN/1.3/',
  severity: 'critical'
};

export default dmnDecisionLabelId;