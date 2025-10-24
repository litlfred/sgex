/**
 * DAK Validation Framework - Core Types
 * 
 * Type definitions for the WHO SMART Guidelines DAK Validation Framework.
 * These types are exported for JSON Schema generation.
 * 
 * @module validation/types
 */

/**
 * Validation rule metadata
 * @example
 * {
 *   "code": "BPMN-BUSINESS-RULE-TASK-ID-001",
 *   "level": "error",
 *   "component": "business-processes",
 *   "title": "Business Rule Task ID Required",
 *   "description": "All businessRuleTask elements must have an @id attribute"
 * }
 */
export interface ValidationRuleMetadata {
  /** Unique validation rule code (e.g., "BPMN-BUSINESS-RULE-TASK-ID-001") */
  code: string;
  
  /** Validation level */
  level: 'error' | 'warning' | 'info';
  
  /** Associated DAK component type */
  component: string;
  
  /** Human-readable rule title (translatable) */
  title: string;
  
  /** Detailed rule description (translatable) */
  description: string;
  
  /** File types this rule applies to */
  fileTypes: string[];
  
  /** Optional WHO authoring convention reference */
  conventionReference?: string;
  
  /** Optional standards reference (e.g., BPMN 2.0 spec section) */
  standardsReference?: string;
}

/**
 * Validation violation
 * @example
 * {
 *   "ruleCode": "BPMN-BUSINESS-RULE-TASK-ID-001",
 *   "level": "error",
 *   "message": "businessRuleTask at line 42 is missing required @id attribute",
 *   "filePath": "input/business-processes/anc-workflow.bpmn",
 *   "line": 42,
 *   "column": 5
 * }
 */
export interface ValidationViolation {
  /** Rule code that was violated */
  ruleCode: string;
  
  /** Violation level */
  level: 'error' | 'warning' | 'info';
  
  /** Human-readable violation message (translatable) */
  message: string;
  
  /** File path where violation occurred */
  filePath: string;
  
  /** Line number (optional) */
  line?: number;
  
  /** Column number (optional) */
  column?: number;
  
  /** XPath or JSONPath to violation location (optional) */
  path?: string;
  
  /** Suggested fix (optional, translatable) */
  suggestion?: string;
  
  /** Additional context data */
  context?: Record<string, any>;
}

/**
 * File validation result
 * @example
 * {
 *   "filePath": "input/business-processes/anc-workflow.bpmn",
 *   "fileType": "bpmn",
 *   "component": "business-processes",
 *   "violations": [],
 *   "isValid": true,
 *   "errorCount": 0,
 *   "warningCount": 0,
 *   "infoCount": 0,
 *   "timestamp": "2025-01-10T12:00:00.000Z"
 * }
 */
export interface FileValidationResult {
  /** File path */
  filePath: string;
  
  /** File type/extension */
  fileType: string;
  
  /** Associated DAK component */
  component: string;
  
  /** List of violations found */
  violations: ValidationViolation[];
  
  /** Whether file passed all error-level validations */
  isValid: boolean;
  
  /** Number of error-level violations */
  errorCount: number;
  
  /** Number of warning-level violations */
  warningCount: number;
  
  /** Number of info-level violations */
  infoCount: number;
  
  /** Validation timestamp */
  timestamp: Date;
  
  /** Validation duration in milliseconds */
  duration?: number;
}

/**
 * DAK validation report
 * @example
 * {
 *   "repository": { "owner": "who", "repo": "anc-dak", "branch": "main" },
 *   "timestamp": "2025-01-10T12:00:00.000Z",
 *   "summary": {
 *     "totalFiles": 25,
 *     "validFiles": 23,
 *     "filesWithErrors": 1,
 *     "filesWithWarnings": 2,
 *     "totalErrors": 3,
 *     "totalWarnings": 5,
 *     "totalInfo": 8
 *   },
 *   "fileResults": [],
 *   "canSave": true
 * }
 */
export interface DAKValidationReport {
  /** Repository context */
  repository: {
    owner: string;
    repo: string;
    branch: string;
  };
  
  /** Report generation timestamp */
  timestamp: Date;
  
  /** Validation summary */
  summary: {
    totalFiles: number;
    validFiles: number;
    filesWithErrors: number;
    filesWithWarnings: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
  };
  
  /** Individual file results */
  fileResults: FileValidationResult[];
  
  /** Overall validation result - true if no errors found */
  isValid: boolean;
  
  /** Whether files can be saved (no error-level violations) */
  canSave: boolean;
  
  /** Total validation duration in milliseconds */
  duration?: number;
  
  /** Override information if user overrode errors */
  override?: {
    timestamp: Date;
    explanation: string;
    user: string;
  };
}

/**
 * Validation rule definition
 * Combines metadata with validation logic
 */
export interface ValidationRule {
  /** Rule metadata */
  metadata: ValidationRuleMetadata;
  
  /** Validation function */
  validate: (filePath: string, content: string, context: ValidationContext) => Promise<ValidationViolation[]>;
}

/**
 * Validation context
 * Helper utilities provided to validation rules
 */
export interface ValidationContext {
  /** Get XML parser */
  getXMLParser: () => any;
  
  /** Get JSON parser */
  getJSONParser: () => any;
  
  /** Parse XML content */
  parseXML: (content: string) => Document;
  
  /** Parse JSON content */
  parseJSON: <T = any>(content: string) => T;
  
  /** Parse YAML content */
  parseYAML: <T = any>(content: string) => T;
  
  /** Check if content is well-formed XML */
  isWellFormedXML: (content: string) => boolean;
  
  /** Check if content is valid JSON */
  isValidJSON: (content: string) => boolean;
  
  /** Get file content from repository/staging */
  getFileContent: (filePath: string) => Promise<string>;
  
  /** List files matching pattern */
  listFiles: (pattern: string) => Promise<string[]>;
  
  /** Get line number from offset */
  getLineNumber: (content: string, offset: number) => number;
  
  /** Get column number from offset */
  getColumnNumber: (content: string, offset: number) => number;
  
  /** Generate XPath expression */
  getXPath: (element: any) => string;
  
  /** Get repository context */
  getRepositoryContext: () => { owner: string; repo: string; branch: string } | undefined;
  
  /** Set repository context */
  setRepositoryContext: (context: { owner: string; repo: string; branch: string }) => void;
}

/**
 * Validation rule registry configuration
 */
export interface ValidationRuleRegistryConfig {
  /** Whether to enable rule caching */
  enableCache?: boolean;
  
  /** Maximum cache size */
  maxCacheSize?: number;
  
  /** Whether to throw on duplicate rule registration */
  throwOnDuplicate?: boolean;
}

/**
 * Component validation options
 */
export interface ComponentValidationOptions {
  /** Component type to validate */
  component: string;
  
  /** Specific file patterns to validate */
  filePatterns?: string[];
  
  /** Rule codes to include (null = all) */
  includeRules?: string[];
  
  /** Rule codes to exclude */
  excludeRules?: string[];
  
  /** Whether to include cross-file validations */
  includeCrossFile?: boolean;
}

/**
 * Save with override request
 */
export interface SaveWithOverrideRequest {
  /** Files to save */
  files: Array<{
    path: string;
    content: string;
  }>;
  
  /** Override explanation (minimum 10 characters) */
  explanation: string;
  
  /** Commit message */
  commitMessage: string;
  
  /** User identity */
  user: string;
  
  /** Validation report being overridden */
  validationReport: DAKValidationReport;
}
