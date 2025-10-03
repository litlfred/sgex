/**
 * @sgex/utils
 * Utility services for SGEX - lazy loading and factory patterns
 * 
 * This package provides utility services with no dependencies on other SGEX packages.
 * It focuses on performance optimization through lazy loading and factory patterns.
 */

// Library loader functions
export * from './library-loader';

// Factory functions
export * from './lazy-factory';

// Re-export commonly used interfaces for convenience
export type {
  OctokitOptions,
  BpmnOptions,
  AjvOptions
} from './lazy-factory';