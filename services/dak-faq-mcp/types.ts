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
}

export interface FAQParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: any;
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