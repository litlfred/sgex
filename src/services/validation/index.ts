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

// Export validation rules
export * from './rules';

// Export integration functions
export * from './integration';

// Create and export default validation service instance
import { ValidationRuleRegistry } from './ValidationRuleRegistry';
import { validationContext } from './ValidationContext';
import { createDAKArtifactValidationService } from './DAKArtifactValidationService';

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
