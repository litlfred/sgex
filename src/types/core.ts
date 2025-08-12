/**
 * Core DAK Validation Type Definitions
 * 
 * TypeScript types for the DAK validation framework
 */

// ====================
// GitHub API Types (Basic subset for validation)
// ====================

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
  name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  description?: string;
  fork: boolean;
  url: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
}

// ====================
// DAK Validation Framework Types
// ====================

export type ValidationLevel = 'error' | 'warning' | 'info';

export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  value?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  path?: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface DAKValidationResult {
  validationId: string;
  component: string;
  level: ValidationLevel;
  description: string;
  filePath: string;
  message?: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ValidationContext {
  owner?: string;
  repo?: string;
  branch?: string;
  dakFiles?: DAKFile[];
  githubService?: any;
  component?: string;
  stagingGround?: boolean;
  [key: string]: any;
}

export interface DAKFile {
  path: string;
  content: string;
  size?: number;
  sha?: string;
}

export interface ValidationDefinition {
  id: string;
  component: string;
  level: ValidationLevel;
  fileTypes: string[];
  descriptionKey?: string;
  description: string;
  validate: (filePath: string, content: string, context: ValidationContext) => Promise<DAKValidationResult | null>;
  findLineNumber?: (content: string, searchTerm: string) => number | null;
}

export interface DAKComponent {
  id: string;
  name: string;
  description: string;
}

export interface ValidationSummary {
  error: number;
  warning: number;
  info: number;
}

export interface FormattedValidationResults {
  summary: ValidationSummary;
  byComponent: Record<string, DAKValidationResult[]>;
  byFile: Record<string, DAKValidationResult[]>;
  canSave: boolean;
  total: number;
  error?: string;
  metadata?: {
    owner?: string;
    repo?: string;
    branch?: string;
    filesValidated?: number;
    validatedAt?: string;
    validationFrameworkVersion?: string;
    stagingGround?: boolean;
    canUpload?: boolean;
  };
}

export interface ComponentSummary {
  [componentId: string]: DAKComponent & {
    validationCount: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
}

// ====================
// SUSHI Config Types
// ====================

export interface SushiConfig {
  id?: string;
  canonical?: string;
  version?: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  license?: string;
  date?: string;
  publisher?: {
    name?: string;
    url?: string;
  };
  contact?: Array<{
    name?: string;
    telecom?: Array<{
      system?: string;
      value?: string;
    }>;
  }>;
  dependencies?: Record<string, string>;
  fhirVersion?: string[];
  FSHOnly?: boolean;
  applyExtensionMetadataToRoot?: boolean;
  parameters?: Array<{
    code?: string;
    value?: string;
  }>;
  copyrightYear?: string;
  releaseLabel?: string;
}

export interface DAKRepository extends GitHubRepository {
  sushiConfig: SushiConfig;
  isDak: true;
}

export interface DAKValidationServiceResult {
  isValid: boolean;
  hasSushiConfig: boolean;
  hasWhoBaseDependency: boolean;
  sushiConfig?: SushiConfig;
  errors: string[];
  warnings: string[];
}

// ====================
// Runtime Validation Types
// ====================

export interface RuntimeValidationConfig {
  strict: boolean;
  throwOnError: boolean;
  coerceTypes: boolean;
  removeAdditional: boolean;
}

export interface ValidatedData<T> {
  data: T;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// ====================
// Cache Types
// ====================

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  size: number;
}

export interface CacheStatistics {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  oldestEntry?: string;
  newestEntry?: string;
}

// ====================
// Utility Types
// ====================

export type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

export type AsyncResult<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}>;