/**
 * DAK Validation Framework
 * 
 * Entry point for the WHO SMART Guidelines DAK Validation Framework.
 * 
 * @module validation
 */

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

// Create and export default validation service instance
import { ValidationRuleRegistry } from './ValidationRuleRegistry';
import { validationContext } from './ValidationContext';
import { createDAKArtifactValidationService } from './DAKArtifactValidationService';
import { registerAllRules } from './rules';

// Create singleton registry
export const validationRegistry = new ValidationRuleRegistry({
  enableCache: true,
  maxCacheSize: 1000,
  throwOnDuplicate: false
});

// Register all validation rules
registerAllRules(validationRegistry);

// Create singleton validation service
export const dakArtifactValidationService = createDAKArtifactValidationService(
  validationRegistry,
  validationContext
);
