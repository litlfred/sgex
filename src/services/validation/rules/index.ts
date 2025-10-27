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
import { startEventRule } from './bpmn/startEvent';
import { namespaceRule } from './bpmn/namespace';

// DMN Rules
import decisionIdAndLabelRule from './dmn/decisionIdAndLabel';
import dmnBpmnLinkRule from './dmn/bpmnLink';

// DAK-Level Rules
import smartBaseDependencyRule from './dak/smartBaseDependency';
import dakJsonStructureRule from './dak/dakJsonStructure';
import { authoringConventionsRule } from './dak/authoringConventions';

// FHIR FSH Rules
import fshSyntaxRule from './fhir/fshSyntax';
import fshConventionsRule from './fhir/fshConventions';

// General Rules
import { fileSizeRule } from './general/fileSize';
import { namingConventionsRule } from './general/namingConventions';

/**
 * Register all validation rules
 * 
 * @param registry - Validation rule registry instance
 */
export function registerAllRules(registry: ValidationRuleRegistry): void {
  // BPMN Rules (3)
  registry.register(businessRuleTaskIdRule);
  registry.register(startEventRule);
  registry.register(namespaceRule);

  // DMN Rules (2)
  registry.register(decisionIdAndLabelRule);
  registry.register(dmnBpmnLinkRule);
  
  // DAK-Level Rules (3)
  registry.register(smartBaseDependencyRule);
  registry.register(dakJsonStructureRule);
  registry.register(authoringConventionsRule);
  
  // FHIR FSH Rules (2)
  registry.register(fshSyntaxRule);
  registry.register(fshConventionsRule);
  
  // General Rules (2)
  registry.register(fileSizeRule);
  registry.register(namingConventionsRule);
}

/**
 * Get all available validation rules
 * 
 * @returns Array of all validation rules
 */
export function getAllAvailableRules(): ValidationRule[] {
  return [
    // BPMN Rules (3)
    businessRuleTaskIdRule,
    startEventRule,
    namespaceRule,
    
    // DMN Rules (2)
    decisionIdAndLabelRule,
    dmnBpmnLinkRule,
    
    // DAK-Level Rules (3)
    smartBaseDependencyRule,
    dakJsonStructureRule,
    authoringConventionsRule,
    
    // FHIR FSH Rules (2)
    fshSyntaxRule,
    fshConventionsRule,
    
    // General Rules (2)
    fileSizeRule,
    namingConventionsRule
  ];
}

/**
 * Export individual rules for testing
 */
export {
  // BPMN (3)
  businessRuleTaskIdRule,
  startEventRule,
  namespaceRule,
  
  // DMN (2)
  decisionIdAndLabelRule,
  dmnBpmnLinkRule,
  
  // DAK-Level (3)
  smartBaseDependencyRule,
  dakJsonStructureRule,
  authoringConventionsRule,
  
  // FHIR FSH (2)
  fshSyntaxRule,
  fshConventionsRule,
  
  // General (2)
  fileSizeRule,
  namingConventionsRule
};
