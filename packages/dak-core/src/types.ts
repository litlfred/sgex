/**
 * WHO SMART Guidelines Digital Adaptation Kit (DAK) TypeScript Types
 * Based on the WHO SMART Guidelines DAK logical model
 * https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/DAK.fsh
 */

export interface DAKPublisher {
  /** Name of the publishing organization */
  name: string;
  /** URL of the publishing organization */
  url?: string;
}

export interface DAKMetadata {
  /** Identifier for the DAK (e.g., smart.who.int.base) */
  id: string;
  /** Short name for the DAK (e.g., Base) */
  name: string;
  /** Full title of the DAK (e.g., SMART Base) */
  title: string;
  /** Description of the DAK - either Markdown content or a URI to a Markdown file */
  description: string | { uri: string };
  /** Version of the DAK */
  version: string;
  /** Publication status of the DAK */
  status: 'draft' | 'active' | 'retired';
  /** Canonical URL for the DAK (e.g., http://smart.who.int/base) */
  publicationUrl: string;
  /** License under which the DAK is published */
  license: string;
  /** Year or year range for copyright */
  copyrightYear: string;
  /** Organization responsible for publishing the DAK */
  publisher: DAKPublisher;
}

// ============================================================================
// DAK Component Source Types
// Based on WHO SMART Guidelines updated logical model
// https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/DAK.fsh
// ============================================================================

/**
 * Base source type for DAK component sources
 * Supports IRI/canonical, URL (absolute/relative), or inline data
 */
export interface DAKComponentSource<T> {
  /** Canonical IRI reference (e.g., IRIS publication) */
  canonical?: string;
  
  /** URL reference - absolute or relative to input/ directory */
  url?: string;
  
  /** Inline instance data */
  data?: T;
  
  /** Metadata about the source */
  metadata?: {
    /** When this source was added */
    addedAt?: string;
    /** Who/what added this source */
    addedBy?: string;
    /** Last validation timestamp */
    lastValidated?: string;
    /** Source type for tracking */
    sourceType?: 'canonical' | 'url-absolute' | 'url-relative' | 'inline';
  };
}

/**
 * Source resolution result
 */
export interface ResolvedSource<T> {
  /** The resolved data */
  data: T;
  /** The source that was used */
  source: DAKComponentSource<T>;
  /** How the data was resolved */
  resolutionMethod: 'canonical' | 'url-absolute' | 'url-relative' | 'inline' | 'cache';
  /** When resolved */
  resolvedAt: Date;
}

/**
 * Source validation result
 */
export interface SourceValidationResult {
  isValid: boolean;
  sourceType: 'canonical' | 'url-absolute' | 'url-relative' | 'inline';
  errors: string[];
  warnings: string[];
}

/**
 * Save options for component instances
 */
export interface SaveOptions {
  /** Path for file-based saves (relative to input/) */
  path?: string;
  
  /** Whether to save as inline data in dak.json */
  inline?: boolean;
  
  /** Commit message for staging ground */
  message?: string;
  
  /** Update existing source or create new */
  updateExisting?: boolean;
}

// ============================================================================
// 9 DAK Components - Data Interfaces
// ============================================================================

export interface HealthInterventions {
  /** Unique identifier */
  id?: string;
  /** Overview of the health interventions and WHO, regional or national recommendations */
  interventions: any[];
}

export interface GenericPersona {
  /** Unique identifier */
  id?: string;
  /** Depiction of the human and system actors */
  personas: any[];
}

export interface UserScenario {
  /** Unique identifier */
  id?: string;
  /** Narratives that describe how the different personas may interact */
  scenarios: any[];
}

export interface BusinessProcessWorkflow {
  /** Unique identifier */
  id?: string;
  /** Business processes and workflows for achieving health programme objectives */
  processes: any[];
}

export interface CoreDataElement {
  /** Unique identifier */
  id?: string;
  /** Data elements required throughout the different points of a workflow */
  elements: any[];
}

export interface DecisionSupportLogic {
  /** Unique identifier */
  id?: string;
  /** Decision-support logic and algorithms to support appropriate service delivery */
  logic: any[];
}

export interface ProgramIndicator {
  /** Unique identifier */
  id?: string;
  /** Core set of indicators for decision-making, performance metrics and reporting */
  indicators: any[];
}

export interface Requirements {
  /** Unique identifier */
  id?: string;
  /** High-level list of core functions and capabilities that the system must have */
  requirements: any[];
}

export interface TestScenario {
  /** Unique identifier */
  id?: string;
  /** Set of test scenarios to validate an implementation of the DAK */
  scenarios: any[];
}

// ============================================================================
// Specific Source Types for Each of the 9 DAK Components
// ============================================================================

export type HealthInterventionsSource = DAKComponentSource<HealthInterventions>;
export type GenericPersonaSource = DAKComponentSource<GenericPersona>;
export type UserScenarioSource = DAKComponentSource<UserScenario>;
export type BusinessProcessWorkflowSource = DAKComponentSource<BusinessProcessWorkflow>;
export type CoreDataElementSource = DAKComponentSource<CoreDataElement>;
export type DecisionSupportLogicSource = DAKComponentSource<DecisionSupportLogic>;
export type ProgramIndicatorSource = DAKComponentSource<ProgramIndicator>;
export type RequirementsSource = DAKComponentSource<Requirements>;
export type TestScenarioSource = DAKComponentSource<TestScenario>;

/**
 * Complete Digital Adaptation Kit (DAK) representation
 * Logical Model for representing a complete DAK with metadata and all 9 DAK components
 * Updated to use Source types per WHO SMART Guidelines logical model
 */
export interface DAK extends DAKMetadata {
  /** Resource type identifier for DAK logical model */
  resourceType: 'DAK';
  
  // 9 DAK Components (all optional, cardinality 0..*) - now using Source types
  /** Health Interventions and Recommendations */
  healthInterventions?: HealthInterventionsSource[];
  /** Generic Personas */
  personas?: GenericPersonaSource[];
  /** User Scenarios */
  userScenarios?: UserScenarioSource[];
  /** Generic Business Processes and Workflows */
  businessProcesses?: BusinessProcessWorkflowSource[];
  /** Core Data Elements */
  dataElements?: CoreDataElementSource[];
  /** Decision-Support Logic */
  decisionLogic?: DecisionSupportLogicSource[];
  /** Program Indicators */
  indicators?: ProgramIndicatorSource[];
  /** Functional and Non-Functional Requirements */
  requirements?: RequirementsSource[];
  /** Test Scenarios */
  testScenarios?: TestScenarioSource[];
}

/**
 * DAK Repository Context
 * Represents a DAK within a GitHub repository context
 */
export interface DAKRepository {
  /** GitHub repository owner */
  owner: string;
  /** GitHub repository name */
  repo: string;
  /** Branch name (optional, defaults to main) */
  branch?: string;
  /** DAK metadata from sushi-config.yaml */
  dakMetadata?: DAKMetadata;
  /** Validation status */
  isValidDAK?: boolean;
  /** Last validation timestamp */
  lastValidated?: Date;
}

/**
 * DAK Validation Result
 */
export interface DAKValidationResult {
  /** Whether the DAK is valid */
  isValid: boolean;
  /** List of validation errors */
  errors: DAKValidationError[];
  /** List of validation warnings */
  warnings: DAKValidationWarning[];
  /** Validation timestamp */
  timestamp: Date;
}

export interface DAKValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Component where error occurred */
  component?: string;
  /** File path where error occurred */
  filePath?: string;
  /** Line number where error occurred */
  lineNumber?: number;
}

export interface DAKValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Component where warning occurred */
  component?: string;
  /** File path where warning occurred */
  filePath?: string;
  /** Line number where warning occurred */
  lineNumber?: number;
}

/**
 * DAK Component Types
 * Enumeration of the 9 DAK components
 */
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

/**
 * DAK Asset Types
 * Common asset types found in DAK repositories
 */
export enum DAKAssetType {
  BPMN = 'bpmn',
  DMN = 'dmn',
  FHIR_PROFILE = 'fhir-profile',
  FHIR_EXTENSION = 'fhir-extension',
  VALUE_SET = 'value-set',
  CODE_SYSTEM = 'code-system',
  QUESTIONNAIRE = 'questionnaire',
  MEASURE = 'measure',
  ACTOR_DEFINITION = 'actor-definition'
}