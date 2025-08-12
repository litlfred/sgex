/**
 * BPMN-BUSINESS-RULE-TASK-ID Validation
 * 
 * In BPMN diagrams a bpmn:businessRuleTask SHALL have an @id attribute
 */

// Helper functions
const isBPMNContent = (content) => {
  return content.includes('http://www.omg.org/spec/BPMN/') || 
         content.includes('businessRuleTask') ||
         content.includes('bpmn:');
};

const findElementLineNumber = (content, element, index) => {
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

export default {
  id: 'bpmn-business-rule-task-id',
  component: 'business-processes',
  level: 'error',
  fileTypes: ['bpmn', 'xml'],
  descriptionKey: 'validation.bpmn.businessRuleTaskId.description',
  description: 'BPMN business rule tasks SHALL have an @id attribute',
  
  async validate(filePath, content, context) {
    // Only validate BPMN files
    if (!filePath.endsWith('.bpmn') && !isBPMNContent(content)) {
      return null;
    }
    
    try {
      // Parse XML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return {
          message: `XML parsing error: ${parserError.textContent}`,
          line: 1,
          column: 1,
          suggestion: 'Fix XML syntax errors before validating BPMN structure'
        };
      }
      
      // Find all businessRuleTask elements (with and without namespace prefix)
      const businessRuleTasks = doc.querySelectorAll('businessRuleTask, bpmn\\:businessRuleTask, *[localName="businessRuleTask"]');
      const violations = [];
      
      businessRuleTasks.forEach((task, index) => {
        const id = task.getAttribute('id');
        
        if (!id || id.trim() === '') {
          const lineNumber = findElementLineNumber(content, task, index);
          violations.push({
            message: `Business rule task ${index + 1} is missing required @id attribute`,
            line: lineNumber,
            column: 1,
            suggestion: 'Add an @id attribute to the businessRuleTask element',
            element: task.outerHTML.substring(0, 100) + (task.outerHTML.length > 100 ? '...' : '')
          });
        }
      });
      
      if (violations.length > 0) {
        return {
          message: `Found ${violations.length} business rule task(s) without @id attributes`,
          violations: violations,
          suggestion: 'All businessRuleTask elements must have unique @id attributes'
        };
      }
      
      return null; // Valid
      
    } catch (error) {
      return {
        message: `Validation error: ${error.message}`,
        line: 1,
        column: 1,
        suggestion: 'Ensure the file is valid XML/BPMN format'
      };
    }
  },
  
  metadata: {
    standard: 'BPMN 2.0',
    reference: 'https://smart.who.int/ig-starter-kit/authoring_conventions.html',
    severity: 'critical'
  }
};