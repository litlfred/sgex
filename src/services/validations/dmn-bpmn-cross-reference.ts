/**
 * DMN-BPMN-CROSS-REFERENCE Validation (TypeScript)
 * 
 * In BPMN business rule tasks that reference DMN files, 
 * the referenced DMN decision SHALL exist
 */

import { ValidationDefinition, ValidationContext, DAKValidationResult, DAKFile } from '../../types/core';

// Helper functions
const isBPMNContent = (content: string): boolean => {
  return content.includes('http://www.omg.org/spec/BPMN/') || 
         content.includes('businessRuleTask') ||
         content.includes('bpmn:');
};

const isDMNContent = (content: string): boolean => {
  return content.includes('http://www.omg.org/spec/DMN/') || 
         content.includes('dmn:') ||
         content.includes('<decision');
};

const extractDMNReferences = (bpmnContent: string): string[] => {
  const references: string[] = [];
  
  // Look for DMN references in business rule tasks
  // This is a simplified approach - in practice, you'd want more sophisticated parsing
  const dmnRefRegex = /dmn[:\-_]?(?:decision|ref|name)[\s]*=[\s]*["']([^"']+)["']/gi;
  let match;
  
  while ((match = dmnRefRegex.exec(bpmnContent)) !== null) {
    references.push(match[1]);
  }
  
  return references;
};

const extractDMNDecisions = (dmnContent: string): string[] => {
  const decisions: string[] = [];
  
  // Extract decision IDs and names from DMN content
  const decisionRegex = /<dmn:decision[^>]+(?:id|name)[\s]*=[\s]*["']([^"']+)["']/gi;
  let match;
  
  while ((match = decisionRegex.exec(dmnContent)) !== null) {
    decisions.push(match[1]);
  }
  
  return decisions;
};

const dmnBpmnCrossReference: ValidationDefinition = {
  id: 'dmn-bpmn-cross-reference',
  component: 'business-processes',
  level: 'warning',
  fileTypes: ['bpmn', 'xml'],
  descriptionKey: 'validation.dmnBpmn.crossReference.description',
  description: 'In BPMN business rule tasks that reference DMN files, the referenced DMN decision SHALL exist',
  
  async validate(filePath: string, content: string, context: ValidationContext): Promise<DAKValidationResult | null> {
    // Only validate BPMN files that contain business rule tasks
    if (!filePath.endsWith('.bpmn') && !filePath.endsWith('.xml') && !isBPMNContent(content)) {
      return null;
    }
    
    // Skip if no business rule tasks are present
    if (!content.includes('businessRuleTask')) {
      return null;
    }
    
    try {
      // Extract DMN references from BPMN content
      const dmnReferences = extractDMNReferences(content);
      
      if (dmnReferences.length === 0) {
        return null; // No DMN references to validate
      }
      
      // Get all available DMN files from context
      const dakFiles = context.dakFiles || [];
      const dmnFiles = dakFiles.filter((file: DAKFile) => 
        file.path.endsWith('.dmn') || isDMNContent(file.content)
      );
      
      if (dmnFiles.length === 0) {
        return {
          validationId: 'dmn-bpmn-cross-reference',
          component: 'business-processes',
          level: 'warning',
          description: 'In BPMN business rule tasks that reference DMN files, the referenced DMN decision SHALL exist',
          filePath,
          message: `BPMN file references DMN decisions but no DMN files found in DAK`,
          line: 1,
          column: 1,
          suggestion: 'Add the referenced DMN files to the DAK or remove DMN references from business rule tasks'
        };
      }
      
      // Collect all available DMN decisions
      const availableDecisions: string[] = [];
      dmnFiles.forEach((dmnFile: DAKFile) => {
        const decisions = extractDMNDecisions(dmnFile.content);
        availableDecisions.push(...decisions);
      });
      
      // Check for missing references
      const missingReferences = dmnReferences.filter(ref => 
        !availableDecisions.includes(ref)
      );
      
      if (missingReferences.length > 0) {
        return {
          validationId: 'dmn-bpmn-cross-reference',
          component: 'business-processes',
          level: 'warning',
          description: 'In BPMN business rule tasks that reference DMN files, the referenced DMN decision SHALL exist',
          filePath,
          message: `BPMN references missing DMN decisions: ${missingReferences.join(', ')}`,
          line: 1,
          column: 1,
          suggestion: `Create DMN decisions with IDs: ${missingReferences.join(', ')} or update BPMN references to match existing decisions: ${availableDecisions.join(', ')}`
        };
      }
      
      return null; // Valid cross-references
      
    } catch (error: any) {
      return {
        validationId: 'dmn-bpmn-cross-reference',
        component: 'business-processes',
        level: 'error',
        description: 'In BPMN business rule tasks that reference DMN files, the referenced DMN decision SHALL exist',
        filePath,
        message: `Error validating DMN-BPMN cross-references: ${error.message}`,
        line: 1,
        column: 1,
        suggestion: 'Check BPMN and DMN file structure and references'
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
  standard: 'BPMN 2.0 + DMN 1.3',
  reference: 'https://www.omg.org/spec/BPMN/2.0/ and https://www.omg.org/spec/DMN/1.3/',
  severity: 'medium'
};

export default dmnBpmnCrossReference;