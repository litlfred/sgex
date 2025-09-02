// Publication Components - Component-Extension Pattern Implementation
// 
// This module exports reusable publication components that extend existing
// DAK components with print-optimized rendering capabilities.

export { default as PublicationView } from './PublicationView';
export { default as BusinessProcessesPublication } from './BusinessProcessesPublication';
export { default as DecisionSupportPublication } from './DecisionSupportPublication';
export { default as CoreDataDictionaryPublication } from './CoreDataDictionaryPublication';
export { default as TestingPublication } from './TestingPublication';
export { default as ActorsPublication } from './ActorsPublication';

/**
 * Publication Component Registry
 * Maps component types to their publication implementations
 */
export const PUBLICATION_COMPONENTS = {
  'business-processes': 'BusinessProcessesPublication',
  'decision-support': 'DecisionSupportPublication', 
  'core-data-dictionary': 'CoreDataDictionaryPublication',
  'testing': 'TestingPublication',
  'actors': 'ActorsPublication'
};

/**
 * Get publication component name for a given DAK component type
 * @param {string} componentType - DAK component type
 * @returns {string} Publication component name
 */
export const getPublicationComponent = (componentType) => {
  return PUBLICATION_COMPONENTS[componentType] || null;
};

/**
 * Check if a component type has publication support
 * @param {string} componentType - DAK component type
 * @returns {boolean} True if publication is supported
 */
export const hasPublicationSupport = (componentType) => {
  return componentType in PUBLICATION_COMPONENTS;
};

/**
 * Get all supported publication component types
 * @returns {Array<string>} Array of supported component types
 */
export const getSupportedPublicationTypes = () => {
  return Object.keys(PUBLICATION_COMPONENTS);
};