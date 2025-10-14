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
 * - DAK Component Objects for managing component instances
 * - Source resolution for canonical, URL, and inline sources
 * - No web or MCP service dependencies
 */
export * from './types';
export { DAKService, dakService } from './dak-service';
export { DAKValidationService } from './validation';
export { ActorDefinitionCore, actorDefinitionCore } from './actor-definition';
export { QuestionnaireDefinitionCore, questionnaireDefinitionCore } from './questionnaire-definition';
export { DecisionTableCore, decisionTableCore } from './decision-table';
export { SourceResolutionService } from './sourceResolution';
export * from './dakComponentObject';
export * from './components';
export { DAKObject } from './dakObject';
export { DAKFactory } from './dakFactory';
export { StagingGroundIntegrationService, IStagingGroundService } from './stagingGroundIntegration';
export * from './base-component';
export * from './fsh-utils';
export type { DAK, DAKRepository, DAKMetadata, DAKValidationResult, DAKValidationError, DAKValidationWarning, DAKPublisher, DAKComponentSource, ResolvedSource, SourceValidationResult, SaveOptions, HealthInterventionsSource, GenericPersonaSource, UserScenarioSource, BusinessProcessWorkflowSource, CoreDataElementSource, DecisionSupportLogicSource, ProgramIndicatorSource, RequirementsSource, TestScenarioSource } from './types';
export type { ActorDefinition, ActorValidationResult } from './actor-definition';
export type { QuestionnaireDefinition, QuestionnaireItem } from './questionnaire-definition';
export type { DecisionTable, DecisionTableVariable } from './decision-table';
export { DAKComponentType, DAKAssetType } from './types';
