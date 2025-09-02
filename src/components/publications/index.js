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
export { default as IndicatorsPublication } from './IndicatorsPublication';
export { default as QuestionnairesPublication } from './QuestionnairesPublication';
export { default as TerminologyPublication } from './TerminologyPublication';
export { default as HealthInterventionsPublication } from './HealthInterventionsPublication';
export { default as UserScenariosPublication } from './UserScenariosPublication';
export { default as FunctionalRequirementsPublication } from './FunctionalRequirementsPublication';
export { default as AllComponentsPublication } from './AllComponentsPublication';

/**
 * Publication Component Registry
 * Maps component types to their publication implementations
 */
export const PUBLICATION_COMPONENTS = {
  'health-interventions': 'HealthInterventionsPublication',
  'generic-personas': 'ActorsPublication',
  'user-scenarios': 'UserScenariosPublication',
  'business-processes': 'BusinessProcessesPublication',
  'core-data-elements': 'CoreDataDictionaryPublication',
  'decision-support': 'DecisionSupportPublication', 
  'program-indicators': 'IndicatorsPublication',
  'functional-requirements': 'FunctionalRequirementsPublication',
  'test-scenarios': 'TestingPublication',
  // Legacy mappings for backward compatibility
  'actors': 'ActorsPublication',
  'testing': 'TestingPublication',
  'indicators': 'IndicatorsPublication',
  'core-data-dictionary': 'CoreDataDictionaryPublication',
  'questionnaires': 'QuestionnairesPublication',
  'terminology': 'TerminologyPublication',
  'all-components': 'AllComponentsPublication'
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