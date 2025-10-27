/**
 * BPMN Namespace Validation Rule
 * BPMN files must use the correct BPMN 2.0 namespace
 * 
 * @module rules/bpmn/namespace
 */

import { ValidationRule, ValidationViolation, ValidationContext } from '../../types';

/**
 * BPMN Namespace Validation Rule
 * 
 * Rule: BPMN-NAMESPACE-001
 * Level: error
 * Component: business-processes
 * 
 * Description: BPMN files SHALL use the official BPMN 2.0 namespace.
 * The correct namespace is: http://www.omg.org/spec/BPMN/20100524/MODEL
 */
export const namespaceRule: ValidationRule = {
  metadata: {
    code: 'BPMN-NAMESPACE-001',
    level: 'error',
    component: 'business-processes',
    title: 'BPMN 2.0 Namespace Required',
    description: 'BPMN files SHALL use the official BPMN 2.0 namespace: http://www.omg.org/spec/BPMN/20100524/MODEL',
    fileTypes: ['.bpmn']
  },
  
  validate: async (
    filePath: string,
    content: string,
    context: ValidationContext
  ): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];
    
    try {
      const xmlDoc = await context.parseXML(content);
      const root = xmlDoc.documentElement;
      
      // Official BPMN 2.0 namespace
      const correctNamespace = 'http://www.omg.org/spec/BPMN/20100524/MODEL';
      
      // Check if the root element has the correct namespace
      const rootNamespace = root.namespaceURI || root.getAttribute('xmlns') || root.getAttribute('xmlns:bpmn') || root.getAttribute('xmlns:bpmn2');
      
      if (!rootNamespace) {
        violations.push({
          ruleCode: 'BPMN-NAMESPACE-001',
          level: 'error',
          message: 'BPMN file is missing the required BPMN 2.0 namespace declaration',
          filePath,
          line: 1,
          suggestion: `Add xmlns="${correctNamespace}" to the definitions element`,
          context: {
            rootElement: root.tagName,
            expectedNamespace: correctNamespace
          }
        });
      } else if (rootNamespace !== correctNamespace) {
        const line = context.getLineNumber(content, content.indexOf(rootNamespace));
        
        violations.push({
          ruleCode: 'BPMN-NAMESPACE-001',
          level: 'error',
          message: `Incorrect BPMN namespace: ${rootNamespace}`,
          filePath,
          line,
          suggestion: `Use the official BPMN 2.0 namespace: ${correctNamespace}`,
          context: {
            foundNamespace: rootNamespace,
            expectedNamespace: correctNamespace,
            rootElement: root.tagName
          }
        });
      }
      
    } catch (error) {
      // If XML parsing fails, let other rules handle it
      console.error('Error in BPMN namespace validation:', error);
    }
    
    return violations;
  }
};
