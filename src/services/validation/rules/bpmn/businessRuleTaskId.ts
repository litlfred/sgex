/**
 * BPMN Business Rule Task ID Validation Rule
 * 
 * Validates that all bpmn:businessRuleTask elements have an @id attribute.
 * This is required for linking BPMN business rule tasks to DMN decision tables.
 * 
 * Rule Code: BPMN-BUSINESS-RULE-TASK-ID-001
 * Level: error
 * Component: business-processes
 * 
 * @module validation/rules/bpmn/businessRuleTaskId
 */

import {
  ValidationRule,
  ValidationViolation,
  ValidationContext
} from '../../types';

/**
 * Rule metadata for Business Rule Task ID validation
 */
const metadata = {
  code: 'BPMN-BUSINESS-RULE-TASK-ID-001',
  level: 'error' as const,
  component: 'business-processes',
  title: 'Business Rule Task ID Required',
  description: 'All bpmn:businessRuleTask elements SHALL have an @id attribute for linking to DMN decision tables',
  fileTypes: ['bpmn', 'xml'],
  conventionReference: 'https://smart.who.int/ig-starter-kit/authoring_conventions.html',
  standardsReference: 'BPMN 2.0 Section 10.2'
};

/**
 * Validation logic for Business Rule Task ID
 * 
 * @param filePath - Path to BPMN file
 * @param content - File content
 * @param context - Validation context with parsing utilities
 * @returns Array of validation violations
 */
async function validate(
  filePath: string,
  content: string,
  context: ValidationContext
): Promise<ValidationViolation[]> {
  const violations: ValidationViolation[] = [];

  try {
    // Parse XML content
    const doc = context.parseXML(content);

    // Find all businessRuleTask elements
    const businessRuleTasks = doc.querySelectorAll(
      'businessRuleTask, bpmn:businessRuleTask, bpmn2:businessRuleTask'
    );

    // Check each businessRuleTask for @id attribute
    businessRuleTasks.forEach((task) => {
      const element = task as Element;
      const id = element.getAttribute('id');

      if (!id || id.trim() === '') {
        // Find line number if possible
        const taskString = element.outerHTML;
        const offset = content.indexOf(taskString);
        const line = offset >= 0 ? context.getLineNumber(content, offset) : undefined;

        violations.push({
          ruleCode: metadata.code,
          level: metadata.level,
          message: `businessRuleTask element is missing required @id attribute`,
          filePath,
          line,
          path: context.getXPath(element),
          suggestion: 'Add an @id attribute to the businessRuleTask element (e.g., id="determine-anc-contact-schedule")',
          context: {
            elementName: element.nodeName,
            name: element.getAttribute('name') || 'unnamed'
          }
        });
      }
    });
  } catch (error) {
    // If XML parsing fails, that should be caught by a separate XML validation rule
    // We don't report it here to avoid duplicate errors
    console.error(`Error validating ${filePath}:`, error);
  }

  return violations;
}

/**
 * Export the complete validation rule
 */
export const businessRuleTaskIdRule: ValidationRule = {
  metadata,
  validate
};

// Default export
export default businessRuleTaskIdRule;
