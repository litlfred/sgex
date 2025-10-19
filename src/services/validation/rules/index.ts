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

// BPMN Rules
import businessRuleTaskIdRule from './bpmn/businessRuleTaskId';

// DMN Rules
import decisionIdAndLabelRule from './dmn/decisionIdAndLabel';
import dmnBpmnLinkRule from './dmn/bpmnLink';

// DAK-Level Rules
import smartBaseDependencyRule from './dak/smartBaseDependency';
import dakJsonStructureRule from './dak/dakJsonStructure';

// FHIR FSH Rules
import fshSyntaxRule from './fhir/fshSyntax';
import fshConventionsRule from './fhir/fshConventions';

/**
 * Register all validation rules
 * 
 * @param registry - Validation rule registry instance
 */
export function registerAllRules(registry: ValidationRuleRegistry): void {
  // BPMN Rules
  registry.register(businessRuleTaskIdRule);

  // DMN Rules
  registry.register(decisionIdAndLabelRule);
  registry.register(dmnBpmnLinkRule);
  
  // DAK-Level Rules
  registry.register(smartBaseDependencyRule);
  registry.register(dakJsonStructureRule);
  
  // FHIR FSH Rules
  registry.register(fshSyntaxRule);
  registry.register(fshConventionsRule);
}

/**
 * Get all available validation rules
 * 
 * @returns Array of all validation rules
 */
export function getAllAvailableRules(): ValidationRule[] {
  return [
    // BPMN Rules (1)
    businessRuleTaskIdRule,
    
    // DMN Rules (2)
    decisionIdAndLabelRule,
    dmnBpmnLinkRule,
    
    // DAK-Level Rules (2)
    smartBaseDependencyRule,
    dakJsonStructureRule,
    
    // FHIR FSH Rules (2)
    fshSyntaxRule,
    fshConventionsRule
  ];
}

/**
 * Export individual rules for testing
 */
export {
  // BPMN
  businessRuleTaskIdRule,
  
  // DMN
  decisionIdAndLabelRule,
  dmnBpmnLinkRule,
  
  // DAK-Level
  smartBaseDependencyRule,
  dakJsonStructureRule,
  
  // FHIR FSH
  fshSyntaxRule,
  fshConventionsRule
};
