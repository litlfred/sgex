/**
 * Browser-only FSH Utilities
 * This version doesn't import fsh-sushi to avoid Node.js dependencies in browser bundles
 * Re-exports the same functions but with fallback-only behavior
 */
export * from './fsh-utils';
