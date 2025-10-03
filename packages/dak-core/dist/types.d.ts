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
    description: string | {
        uri: string;
    };
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
export interface HealthInterventions {
    /** Overview of the health interventions and WHO, regional or national recommendations */
    interventions: any[];
}
export interface GenericPersona {
    /** Depiction of the human and system actors */
    personas: any[];
}
export interface UserScenario {
    /** Narratives that describe how the different personas may interact */
    scenarios: any[];
}
export interface BusinessProcessWorkflow {
    /** Business processes and workflows for achieving health programme objectives */
    processes: any[];
}
export interface CoreDataElement {
    /** Data elements required throughout the different points of a workflow */
    elements: any[];
}
export interface DecisionSupportLogic {
    /** Decision-support logic and algorithms to support appropriate service delivery */
    logic: any[];
}
export interface ProgramIndicator {
    /** Core set of indicators for decision-making, performance metrics and reporting */
    indicators: any[];
}
export interface Requirements {
    /** High-level list of core functions and capabilities that the system must have */
    requirements: any[];
}
export interface TestScenario {
    /** Set of test scenarios to validate an implementation of the DAK */
    scenarios: any[];
}
/**
 * Complete Digital Adaptation Kit (DAK) representation
 * Logical Model for representing a complete DAK with metadata and all 9 DAK components
 */
export interface DAK extends DAKMetadata {
    /** Resource type identifier for DAK logical model */
    resourceType: 'DAK';
    /** Health Interventions and Recommendations */
    healthInterventions?: HealthInterventions[];
    /** Generic Personas */
    personas?: GenericPersona[];
    /** User Scenarios */
    userScenarios?: UserScenario[];
    /** Generic Business Processes and Workflows */
    businessProcesses?: BusinessProcessWorkflow[];
    /** Core Data Elements */
    dataElements?: CoreDataElement[];
    /** Decision-Support Logic */
    decisionLogic?: DecisionSupportLogic[];
    /** Program Indicators */
    indicators?: ProgramIndicator[];
    /** Functional and Non-Functional Requirements */
    requirements?: Requirements[];
    /** Test Scenarios */
    testScenarios?: TestScenario[];
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
export declare enum DAKComponentType {
    HEALTH_INTERVENTIONS = "healthInterventions",
    PERSONAS = "personas",
    USER_SCENARIOS = "userScenarios",
    BUSINESS_PROCESSES = "businessProcesses",
    DATA_ELEMENTS = "dataElements",
    DECISION_LOGIC = "decisionLogic",
    INDICATORS = "indicators",
    REQUIREMENTS = "requirements",
    TEST_SCENARIOS = "testScenarios"
}
/**
 * DAK Asset Types
 * Common asset types found in DAK repositories
 */
export declare enum DAKAssetType {
    BPMN = "bpmn",
    DMN = "dmn",
    FHIR_PROFILE = "fhir-profile",
    FHIR_EXTENSION = "fhir-extension",
    VALUE_SET = "value-set",
    CODE_SYSTEM = "code-system",
    QUESTIONNAIRE = "questionnaire",
    MEASURE = "measure",
    ACTOR_DEFINITION = "actor-definition"
}
