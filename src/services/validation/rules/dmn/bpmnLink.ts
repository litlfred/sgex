/**
 * DMN-BPMN Cross-Reference Validation Rule
 * 
 * Validates that DMN decision IDs are referenced by BPMN businessRuleTask elements.
 * This ensures proper integration between decision logic and business processes.
 * 
 * @module validation/rules/dmn/bpmnLink
 */

import type {
  ValidationRule,
  ValidationViolation,
  ValidationContext as IValidationContext
} from '../../types';

/**
 * DMN-BPMN Cross-Reference Validation Rule
 * 
 * @openapi
 * components:
 *   schemas:
 *     DMNBPMNLinkRule:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "DMN-BPMN-LINK-001"
 *         level:
 *           type: string
 *           enum: [warning]
 *         component:
 *           type: string
 *           example: "decision-logic"
 * 
 * @example
 * // DMN decision with matching BPMN task
 * <decision id="determine-contact-schedule" label="Determine ANC Contact Schedule">
 * ...
 * </decision>
 * 
 * // Corresponding BPMN task
 * <businessRuleTask id="determine-contact-schedule" name="Determine Contact Schedule" />
 */
export const dmnBpmnLinkRule: ValidationRule = {
  metadata: {
    code: 'DMN-BPMN-LINK-001',
    level: 'warning',
    component: 'decision-logic',
    title: 'DMN Decision Linked to BPMN',
    description: 'DMN decision @id SHOULD be associated with a bpmn:businessRuleTask with the same id in at least one BPMN diagram',
    fileTypes: ['dmn', 'xml']
  },
  
  /**
   * Validate DMN-BPMN cross-references
   */
  async validate(
    filePath: string,
    content: string,
    context: IValidationContext
  ): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    
    try {
      // Parse DMN content
      const doc = await context.parseXML(content);
      
      // Find all decision elements
      const namespaces = ['dmn', 'dmn:', 'dmn2:', 'dmn11:', 'dmn12:', 'dmn13:'];
      const selectors = namespaces.map(ns => `${ns}decision`).join(', ');
      const decisions = doc.querySelectorAll(selectors);
      
      if (decisions.length === 0) {
        return violations;
      }
      
      // Get all BPMN files in the repository
      const bpmnFiles = await context.listFiles('**/*.bpmn');
      
      if (bpmnFiles.length === 0) {
        // No BPMN files to check against - this is a warning, not an error
        decisions.forEach((decision) => {
          const id = decision.getAttribute('id');
          const label = decision.getAttribute('label');
          
          if (id) {
            const xpath = context.getXPath(decision);
            const line = 0;
            
            violations.push({
              ruleCode: 'DMN-BPMN-LINK-001',
              level: 'warning',
              message: `DMN decision '${id}' cannot be verified against BPMN files (no BPMN files found in repository)`,
              filePath,
              line,
              path: xpath,
              suggestion: 'Add BPMN diagrams that reference this decision, or verify this decision is intentionally standalone',
              context: {
                decisionId: id,
                decisionLabel: label || '(no label)',
                bpmnFilesChecked: 0
              }
            });
          }
        });
        return violations;
      }
      
      // Check each decision against BPMN files
      for (const decision of Array.from(decisions)) {
        const id = decision.getAttribute('id');
        const label = decision.getAttribute('label');
        
        if (!id || id.trim() === '') {
          continue; // Skip decisions without ID (handled by other rule)
        }
        
        // Search for matching businessRuleTask in BPMN files
        let foundMatch = false;
        
        for (const bpmnFile of bpmnFiles) {
          try {
            const bpmnContent = await context.getFileContent(bpmnFile);
            const bpmnDoc = await context.parseXML(bpmnContent);
            
            // Look for businessRuleTask with matching ID
            const bpmnNamespaces = ['bpmn', 'bpmn:', 'bpmn2:', 'bpmndi:'];
            const bpmnSelectors = bpmnNamespaces.map(ns => `${ns}businessRuleTask[id="${id}"]`).join(', ');
            const matchingTasks = bpmnDoc.querySelectorAll(bpmnSelectors);
            
            if (matchingTasks.length > 0) {
              foundMatch = true;
              break;
            }
          } catch (error) {
            // Skip files that can't be parsed
            continue;
          }
        }
        
        // If no match found, add warning
        if (!foundMatch) {
          const xpath = context.getXPath(decision);
          const line = 0;
          
          violations.push({
            ruleCode: 'DMN-BPMN-LINK-001',
            level: 'warning',
            message: `DMN decision '${id}' is not referenced by any BPMN businessRuleTask`,
            filePath,
            line,
            path: xpath,
            suggestion: `Consider adding a businessRuleTask in a BPMN file with id='${id}', or verify this decision is intentionally standalone`,
            context: {
              decisionId: id,
              decisionLabel: label || '(no label)',
              bpmnFilesChecked: bpmnFiles.length
            }
          });
        }
      }
      
      return violations;
      
    } catch (error) {
      // XML parsing error - return as violation
      return [{
        ruleCode: 'DMN-BPMN-LINK-001',
        level: 'warning',
        message: `Failed to parse DMN file for cross-reference validation: ${error instanceof Error ? error.message : String(error)}`,
        filePath,
        line: 0,
        suggestion: 'Ensure the file is well-formed XML'
      }];
    }
  }
};

export default dmnBpmnLinkRule;
