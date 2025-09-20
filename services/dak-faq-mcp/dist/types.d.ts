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
export interface FAQExecutionInput {
    storage: StorageInterface;
    locale?: string;
    t: (key: string, options?: any) => string;
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
export interface ValueSet {
    id: string;
    name: string;
    description?: string;
    conceptCount?: number;
}
export interface ValueSetListResponse {
    success: boolean;
    timestamp: string;
    count: number;
    valueSets: ValueSet[];
}
export interface DecisionTable {
    id: string;
    name: string;
    description?: string;
    file: string;
}
export interface DecisionTableListResponse {
    success: boolean;
    timestamp: string;
    count: number;
    decisionTables: DecisionTable[];
}
export interface BusinessProcess {
    id: string;
    name: string;
    description?: string;
}
export interface BusinessProcessListResponse {
    success: boolean;
    timestamp: string;
    count: number;
    businessProcesses: BusinessProcess[];
}
export interface Persona {
    id: string;
    name: string;
    role?: string;
    description?: string;
}
export interface PersonaListResponse {
    success: boolean;
    timestamp: string;
    count: number;
    personas: Persona[];
}
export interface Questionnaire {
    id: string;
    name: string;
    description?: string;
    questionCount?: number;
}
export interface QuestionnaireListResponse {
    success: boolean;
    timestamp: string;
    count: number;
    questionnaires: Questionnaire[];
}
//# sourceMappingURL=types.d.ts.map