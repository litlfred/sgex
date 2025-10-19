/**
 * DMN Decision ID and Label Validation Rule
 * 
 * Validates that all dmn:decision elements in DMN files have both @id and @label attributes.
 * This is required for proper DMN execution and human readability.
 * 
 * @module validation/rules/dmn/decisionIdAndLabel
 */

import type {
  ValidationRule,
  ValidationViolation,
  ValidationContext as IValidationContext
} from '../../types';

/**
 * DMN Decision ID and Label Validation Rule
 * 
 * @openapi
 * components:
 *   schemas:
 *     DMNDecisionIdAndLabelRule:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "DMN-DECISION-ID-LABEL-001"
 *         level:
 *           type: string
 *           enum: [error]
 *         component:
 *           type: string
 *           example: "decision-logic"
 * 
 * @example
 * // Valid DMN decision element
 * <decision id="determine-contact-schedule" label="Determine ANC Contact Schedule">
 *   <decisionTable>...</decisionTable>
 * </decision>
 * 
 * @example
 * // Invalid DMN decision element (missing label)
 * <decision id="determine-contact-schedule">
 *   <decisionTable>...</decisionTable>
 * </decision>
 */
export const decisionIdAndLabelRule: ValidationRule = {
  metadata: {
    code: 'DMN-DECISION-ID-LABEL-001',
    level: 'error',
    component: 'decision-logic',
    title: 'DMN Decision ID and Label Required',
    description: 'All dmn:decision elements SHALL have both @id and @label attributes as required by DMN 1.3 specification'
  },
  
  /**
   * Validate DMN decision elements for id and label attributes
   */
  async validate(
    filePath: string,
    content: string,
    context: IValidationContext
  ): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    
    try {
      // Parse XML content
      const doc = await context.parseXML(content);
      
      // Find all decision elements (support multiple namespace prefixes)
      const namespaces = ['dmn', 'dmn:', 'dmn2:', 'dmn11:', 'dmn12:', 'dmn13:'];
      const selectors = namespaces.map(ns => `${ns}decision`).join(', ');
      const decisions = doc.querySelectorAll(selectors);
      
      if (decisions.length === 0) {
        // No decisions found - this might be valid for some DMN files
        return violations;
      }
      
      // Track seen violations to avoid duplicates
      const seenViolations = new Set<string>();
      
      // Check each decision element
      decisions.forEach((decision, index) => {
        const id = decision.getAttribute('id');
        const label = decision.getAttribute('label');
        const name = decision.getAttribute('name');
        
        // Build unique key for this element
        const elementKey = `decision-${index}-${id || 'no-id'}`;
        
        // Check for missing ID
        if (!id || id.trim() === '') {
          const violationKey = `${elementKey}-missing-id`;
          if (!seenViolations.has(violationKey)) {
            seenViolations.add(violationKey);
            
            const xpath = context.getXPath(decision);
            const line = decision.lineNumber || 0;
            
            violations.push({
              ruleCode: 'DMN-DECISION-ID-LABEL-001',
              level: 'error',
              message: 'decision element is missing required @id attribute',
              filePath,
              line,
              path: xpath,
              suggestion: 'Add an @id attribute to uniquely identify this decision (e.g., id="determine-contact-schedule")',
              context: {
                elementName: decision.nodeName,
                name: name || '(unnamed)',
                label: label || '(no label)'
              }
            });
          }
        }
        
        // Check for missing label
        if (!label || label.trim() === '') {
          const violationKey = `${elementKey}-missing-label`;
          if (!seenViolations.has(violationKey)) {
            seenViolations.add(violationKey);
            
            const xpath = context.getXPath(decision);
            const line = decision.lineNumber || 0;
            
            violations.push({
              ruleCode: 'DMN-DECISION-ID-LABEL-001',
              level: 'error',
              message: 'decision element is missing required @label attribute',
              filePath,
              line,
              path: xpath,
              suggestion: 'Add a @label attribute for human readability (e.g., label="Determine ANC Contact Schedule")',
              context: {
                elementName: decision.nodeName,
                id: id || '(no id)',
                name: name || '(unnamed)'
              }
            });
          }
        }
      });
      
      return violations;
      
    } catch (error) {
      // XML parsing error - return as violation
      return [{
        ruleCode: 'DMN-DECISION-ID-LABEL-001',
        level: 'error',
        message: `Failed to parse DMN file: ${error instanceof Error ? error.message : String(error)}`,
        filePath,
        line: 0,
        suggestion: 'Ensure the file is well-formed XML and follows DMN 1.3 schema'
      }];
    }
  }
};

export default decisionIdAndLabelRule;
