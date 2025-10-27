/**
 * BPMN Start Event Validation Rule
 * Every BPMN process SHOULD have at least one start event
 * 
 * @module rules/bpmn/startEvent
 */

import { ValidationRule, ValidationViolation, ValidationContext } from '../../types';

/**
 * BPMN Start Event Validation Rule
 * 
 * Rule: BPMN-START-EVENT-001
 * Level: warning
 * Component: business-processes
 * 
 * Description: Every BPMN process SHOULD have at least one start event.
 * Start events define entry points for process execution.
 */
export const startEventRule: ValidationRule = {
  metadata: {
    code: 'BPMN-START-EVENT-001',
    level: 'warning',
    component: 'business-processes',
    title: 'BPMN Process Start Event',
    description: 'Every BPMN process SHOULD have at least one start event. Start events define entry points for process execution.',
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
      
      // Find all process elements
      const processes = xmlDoc.querySelectorAll('process');
      
      if (processes.length === 0) {
        return violations; // No processes found, not an error for this rule
      }
      
      processes.forEach((process: Element) => {
        const processId = process.getAttribute('id');
        const processName = process.getAttribute('name') || processId;
        
        // Check for start events in this process
        // Support various namespace prefixes: bpmn:, bpmn2:, or no prefix
        const startEvents = process.querySelectorAll('startEvent, bpmn\\:startEvent, bpmn2\\:startEvent');
        
        if (startEvents.length === 0) {
          const xpath = context.getXPath(process);
          const line = context.getLineNumber(content, content.indexOf(process.outerHTML));
          
          violations.push({
            ruleCode: 'BPMN-START-EVENT-001',
            level: 'warning',
            message: `Process "${processName}" does not have a start event`,
            filePath,
            line,
            path: xpath,
            suggestion: 'Add a start event to define the entry point for this process. Start events are essential for process execution.',
            context: {
              processId,
              processName,
              elementCount: process.children.length
            }
          });
        }
      });
      
    } catch (error) {
      // If XML parsing fails, let other rules handle it
      console.error('Error in BPMN start event validation:', error);
    }
    
    return violations;
  }
};
