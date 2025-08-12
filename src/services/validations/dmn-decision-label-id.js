/**
 * DMN-DECISION-LABEL-ID Validation
 * 
 * DMN tables SHALL have dmn:decision with @label and @id as required
 */

// Helper functions
const isDMNContent = (content) => {
  return content.includes('http://www.omg.org/spec/DMN/') || 
         content.includes('dmn:') ||
         content.includes('<decision');
};

const findElementLineNumber = (content, element, index) => {
  // Try to find approximate line number by searching for decision elements
  const lines = content.split('\n');
  let foundCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<decision') || lines[i].includes('dmn:decision')) {
      if (foundCount === index) {
        return i + 1;
      }
      foundCount++;
    }
  }
  
  return 1; // Fallback
};

export default {
  id: 'dmn-decision-label-id',
  component: 'decision-support-logic',
  level: 'error',
  fileTypes: ['dmn', 'xml'],
  descriptionKey: 'validation.dmn.decisionLabelId.description',
  description: 'DMN decisions SHALL have @label and @id attributes',
  
  async validate(filePath, content, context) {
    // Only validate DMN files
    if (!filePath.endsWith('.dmn') && !isDMNContent(content)) {
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
          suggestion: 'Fix XML syntax errors before validating DMN structure'
        };
      }
      
      // Find all decision elements (with and without namespace prefix)
      const decisions = doc.querySelectorAll('decision, dmn\\:decision, *[localName="decision"]');
      const violations = [];
      
      decisions.forEach((decision, index) => {
        const id = decision.getAttribute('id');
        const label = decision.getAttribute('label');
        const issues = [];
        
        if (!id || id.trim() === '') {
          issues.push('missing @id attribute');
        }
        
        if (!label || label.trim() === '') {
          issues.push('missing @label attribute');
        }
        
        if (issues.length > 0) {
          const lineNumber = findElementLineNumber(content, decision, index);
          violations.push({
            message: `Decision ${index + 1} is ${issues.join(' and ')}`,
            line: lineNumber,
            column: 1,
            suggestion: 'Add both @id and @label attributes to the decision element',
            element: decision.outerHTML.substring(0, 100) + (decision.outerHTML.length > 100 ? '...' : ''),
            missingAttributes: issues
          });
        }
      });
      
      if (violations.length > 0) {
        return {
          message: `Found ${violations.length} decision(s) with missing required attributes`,
          violations: violations,
          suggestion: 'All decision elements must have both @id and @label attributes'
        };
      }
      
      return null; // Valid
      
    } catch (error) {
      return {
        message: `Validation error: ${error.message}`,
        line: 1,
        column: 1,
        suggestion: 'Ensure the file is valid XML/DMN format'
      };
    }
  },
  
  metadata: {
    standard: 'DMN 1.3',
    reference: 'https://smart.who.int/ig-starter-kit/authoring_conventions.html',
    severity: 'critical'
  }
};