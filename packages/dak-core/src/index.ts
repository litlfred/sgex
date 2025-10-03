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

// Core types
export * from './types';

// Core services
export { DAKService, dakService } from './dak-service';
export { DAKValidationService } from './validation';
export { ActorDefinitionCore, actorDefinitionCore } from './actor-definition';

// Base component classes and utilities
export * from './base-component';
export * from './fsh-utils';

// Re-export commonly used types for convenience
export type {
  DAK,
  DAKRepository,
  DAKMetadata,
  DAKValidationResult,
  DAKValidationError,
  DAKValidationWarning,
  DAKPublisher
} from './types';

export type {
  ActorDefinition,
  ActorValidationResult
} from './actor-definition';

export {
  DAKComponentType,
  DAKAssetType
} from './types';