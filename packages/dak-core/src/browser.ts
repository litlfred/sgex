/**
 * @sgex/dak-core/browser
 * Browser-compatible exports for WHO SMART Guidelines DAK utilities
 * 
 * This entry point excludes Node.js-specific modules (DAKService, DAKValidationService)
 * and only exports browser-safe utilities for FSH parsing and component management.
 */

// Base component classes and utilities (browser-safe)
export * from './base-component';
export * from './fsh-utils';

// Component classes (browser-safe)
export { ActorDefinitionCore, actorDefinitionCore } from './actor-definition';
export { QuestionnaireDefinitionCore, questionnaireDefinitionCore } from './questionnaire-definition';
export { DecisionTableCore, decisionTableCore } from './decision-table';

// Re-export browser-safe types
export type {
  DAKValidationError,
  DAKValidationWarning,
  DAKComponentType,
  DAKAssetType
} from './types';

export type {
  ActorDefinition,
  ActorValidationResult
} from './actor-definition';

export type {
  QuestionnaireDefinition,
  QuestionnaireItem
} from './questionnaire-definition';

export type {
  DecisionTable,
  DecisionTableVariable
} from './decision-table';
