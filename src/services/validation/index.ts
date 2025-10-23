/**
 * DAK Validation Framework
 * 
 * Entry point for the WHO SMART Guidelines DAK Validation Framework.
 * 
 * @module validation
 */

import { ValidationRuleRegistry } from './ValidationRuleRegistry';
import { validationContext } from './ValidationContext';
import { createDAKArtifactValidationService } from './DAKArtifactValidationService';

// Export types
export * from './types';

// Export services
export { ValidationRuleRegistry } from './ValidationRuleRegistry';
export { ValidationContext, validationContext } from './ValidationContext';
export { 
  DAKArtifactValidationService,
  createDAKArtifactValidationService 
} from './DAKArtifactValidationService';
export { XSDValidationService, xsdValidationService } from './XSDValidationService';

// Export validation rules
export * from './rules';

// Export integration functions
export * from './integration';

// Create singleton registry
export const validationRegistry = new ValidationRuleRegistry({
  enableCache: true,
  maxCacheSize: 1000,
  throwOnDuplicate: false
});

// Create singleton validation service
export const dakArtifactValidationService = createDAKArtifactValidationService(
  validationRegistry,
  validationContext
);

// Lazy load validation rules - only register when first validation is triggered
let rulesRegistered = false;
export async function ensureRulesRegistered(): Promise<void> {
  if (rulesRegistered) return;
  
  // Dynamic import to defer loading of all validation rules
  const { registerAllRules } = await import('./rules');
  registerAllRules(validationRegistry);
  rulesRegistered = true;
}
