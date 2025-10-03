/**
 * @sgex/dak-core
 * Core WHO SMART Guidelines DAK business logic and validation
 *
 * This package provides the foundational logic for working with
 * WHO SMART Guidelines Digital Adaptation Kits (DAKs).
 *
 * Key Features:
 * - DAK repository validation
 * - WHO SMART Guidelines schema compliance
 * - Component discovery and validation
 * - Asset management
 * - Shared FSH parsing and generation utilities
 * - Base component classes for all DAK types
 * - No web or MCP service dependencies
 */
export * from './types';
export { DAKService, dakService } from './dak-service';
export { DAKValidationService } from './validation';
export { ActorDefinitionCore, actorDefinitionCore } from './actor-definition';
export { QuestionnaireDefinitionCore, questionnaireDefinitionCore } from './questionnaire-definition';
export { DecisionTableCore, decisionTableCore } from './decision-table';
export * from './base-component';
export * from './fsh-utils';
export type { DAK, DAKRepository, DAKMetadata, DAKValidationResult, DAKValidationError, DAKValidationWarning, DAKPublisher } from './types';
export type { ActorDefinition, ActorValidationResult } from './actor-definition';
export type { QuestionnaireDefinition, QuestionnaireItem } from './questionnaire-definition';
export type { DecisionTable, DecisionTableVariable } from './decision-table';
export { DAKComponentType, DAKAssetType } from './types';
