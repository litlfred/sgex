/**
 * Validation Rules Registry
 * 
 * Central registry for all DAK validation rules.
 * Import and register all validation rules here.
 * 
 * @module validation/rules
 */

import { ValidationRuleRegistry } from '../ValidationRuleRegistry';
import { ValidationRule } from '../types';

// Import validation rules
import businessRuleTaskIdRule from './bpmn/businessRuleTaskId';

/**
 * Register all validation rules
 * 
 * @param registry - Validation rule registry instance
 */
export function registerAllRules(registry: ValidationRuleRegistry): void {
  // BPMN Rules
  registry.register(businessRuleTaskIdRule);

  // TODO: Add more rules as they are implemented
  // registry.register(bpmnStartEventRule);
  // registry.register(dmnDecisionIdRule);
  // registry.register(dmnBpmnLinkRule);
  // registry.register(dakDependencyRule);
  // registry.register(fshSyntaxRule);
}

/**
 * Get all available validation rules
 * 
 * @returns Array of all validation rules
 */
export function getAllAvailableRules(): ValidationRule[] {
  return [
    businessRuleTaskIdRule,
    // Add more rules here as they are implemented
  ];
}

/**
 * Export individual rules for testing
 */
export {
  businessRuleTaskIdRule
};
