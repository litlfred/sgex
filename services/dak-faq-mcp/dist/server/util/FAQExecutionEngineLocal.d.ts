/**
 * Local FAQ Execution Engine for MCP Server
 * Uses modular question loading system with i18n support
 */
import { FAQQuestion, ExecuteRequest, ExecuteResponse, CatalogFilters } from '../../types.js';
interface FAQExecutionContext {
    repositoryPath?: string;
    [key: string]: any;
}
export declare class FAQExecutionEngineLocal {
    private questionLoader;
    private initialized;
    constructor();
    /**
     * Initialize the engine with available questions
     */
    initialize(): Promise<void>;
    /**
     * Get catalog of available questions
     */
    getCatalog(filters?: CatalogFilters): FAQQuestion[];
    /**
     * Execute batch of questions
     */
    executeBatch(requests: ExecuteRequest[], context?: FAQExecutionContext): Promise<ExecuteResponse[]>;
    /**
     * Execute single question (public API)
     */
    executeSingle(request: ExecuteRequest, context?: FAQExecutionContext): Promise<ExecuteResponse>;
    /**
     * Execute single question (internal)
     */
    private executeQuestion;
    /**
     * Get question schemas for API documentation
     */
    getQuestionSchemas(): Record<string, any>;
}
export {};
//# sourceMappingURL=FAQExecutionEngineLocal.d.ts.map