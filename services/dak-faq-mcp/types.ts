/**
 * TypeScript type definitions for DAK FAQ MCP Server
 */

export interface FAQQuestion {
  id: string;
  level: 'dak' | 'component' | 'asset';
  title: string;
  description: string;
  parameters: FAQParameter[];
  tags: string[];
  componentType?: string;
  assetType?: string;
  version?: string;
  schema?: {
    input: any;
    output: any;
  };
  canonicalRefs?: CanonicalReference[]; // References to WHO ValueSets/Logical Models
}

export interface FAQParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
  canonicalUrl?: string; // Reference to canonical ValueSet or Logical Model
  valueSetBinding?: ValueSetBinding; // ValueSet binding information
}

export interface ValueSetBinding {
  strength: 'required' | 'extensible' | 'preferred' | 'example';
  valueSetUrl: string;
  description?: string;
}

export interface ExecuteRequest {
  questionId: string;
  parameters?: Record<string, any>;
  assetFiles?: string[];
}

export interface ExecuteRequestBody {
  requests: ExecuteRequest[];
  context?: {
    repositoryPath?: string;
    [key: string]: any;
  };
}

export interface SingleExecuteRequest {
  parameters?: Record<string, any>;
  assetFiles?: string[];
  context?: {
    repositoryPath?: string;
    [key: string]: any;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: ExecuteRequestBody;
}

export interface ExecuteResponse {
  success: boolean;
  questionId: string;
  result?: any;
  error?: {
    message: string;
    code: string;
  };
  timestamp: string;
}

export interface BatchExecuteResponse {
  success: boolean;
  timestamp: string;
  results: ExecuteResponse[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface CatalogFilters {
  level?: string;
  tags?: string[];
  componentType?: string;
  assetType?: string;
}

export interface CatalogResponse {
  success: boolean;
  timestamp: string;
  filters: CatalogFilters;
  count: number;
  questions: FAQQuestion[];
}

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    timestamp: string;
    details?: string[];
    path?: string;
    method?: string;
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  description: string;
}

export interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

// New interfaces for the modular question system
export interface FAQExecutionInput {
  storage: StorageInterface;
  locale?: string;
  t: (key: string, options?: any) => string; // Translation function
  [key: string]: any;
}

export interface FAQExecutionResult {
  structured: Record<string, any>;
  narrative: string;
  errors: string[];
  warnings: string[];
  meta: Record<string, any>;
}

export interface FAQExecutor {
  (input: FAQExecutionInput): Promise<FAQExecutionResult>;
}

export interface StorageInterface {
  readFile(filePath: string): Promise<Buffer>;
  fileExists(filePath: string): Promise<boolean>;
  listFiles(pattern: string, options?: Record<string, any>): Promise<string[]>;
}

export interface QuestionDefinition {
  id: string;
  level: 'dak' | 'component' | 'asset';
  title: string;
  description: string;
  parameters: FAQParameter[];
  tags: string[];
  componentType?: string;
  assetType?: string;
  version?: string;
  schema?: {
    input: any;
    output: any;
  };
}

export interface QuestionModule {
  definition: QuestionDefinition;
  executor: FAQExecutor;
}

// Canonical Schema Integration Types
export interface CanonicalReference {
  type: 'ValueSet' | 'LogicalModel' | 'StructureDefinition';
  url: string;
  description?: string;
  version?: string;
  purpose: string; // e.g., "parameter validation", "output structure"
}

export interface CanonicalSchema {
  url: string;
  version?: string;
  schema: any; // JSON Schema representation
  loadedAt: Date;
  source: 'remote' | 'cache';
}

export interface ValueSetExpansion {
  url: string;
  codes: ValueSetCode[];
  loadedAt: Date;
}

export interface ValueSetCode {
  code: string;
  display: string;
  system?: string;
  definition?: string;
}

export interface CanonicalValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedAgainst: string[]; // URLs of canonicals used for validation
}