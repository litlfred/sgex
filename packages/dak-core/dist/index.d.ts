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
 * - No web or MCP service dependencies
 */
export * from './types';
export { DAKService, dakService } from './dak-service';
export { DAKValidationService } from './validation';
export { ActorDefinitionCore, actorDefinitionCore } from './actor-definition';
export type { DAK, DAKRepository, DAKMetadata, DAKValidationResult, DAKValidationError, DAKValidationWarning, DAKPublisher } from './types';
export type { ActorDefinition, ActorValidationResult } from './actor-definition';
export { DAKComponentType, DAKAssetType } from './types';
//# sourceMappingURL=index.d.ts.map