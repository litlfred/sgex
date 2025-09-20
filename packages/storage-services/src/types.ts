/**
 * Common types for storage services
 * Defines minimal interfaces to avoid circular dependencies with dak-core
 */

export interface DAKRepository {
  owner: string;
  repo: string;
  branch?: string;
  dakMetadata?: any;
  isValidDAK?: boolean;
  lastValidated?: Date;
}

export interface DAKValidationResult {
  isValid: boolean;
  errors: any[];
  warnings: any[];
  timestamp: Date;
}

export enum DAKComponentType {
  HEALTH_INTERVENTIONS = 'healthInterventions',
  PERSONAS = 'personas', 
  USER_SCENARIOS = 'userScenarios',
  BUSINESS_PROCESSES = 'businessProcesses',
  DATA_ELEMENTS = 'dataElements',
  DECISION_LOGIC = 'decisionLogic',
  INDICATORS = 'indicators',
  REQUIREMENTS = 'requirements',
  TEST_SCENARIOS = 'testScenarios'
}