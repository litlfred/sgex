/**
 * FAQ Schema Service
 * Provides access to question schemas for the React application
 */
import { FAQQuestion } from '../../types.js';
export declare class FAQSchemaService {
    private static instance;
    private schemas;
    private questions;
    private initialized;
    private constructor();
    static getInstance(): FAQSchemaService;
    /**
     * Initialize by loading all available question definitions
     */
    initialize(): Promise<void>;
    /**
     * Load all available question schemas from the questions directory
     */
    private loadSchemas;
    /**
     * Recursively scan questions directory for definition.json files
     */
    private scanQuestionsDirectory;
    /**
     * Load a question definition from a JSON file
     */
    private loadQuestionDefinition;
    /**
     * Add a question and its schema
     */
    private addQuestion;
    /**
     * Get all available question schemas
     */
    getAllSchemas(): Promise<Record<string, any>>;
    /**
     * Get schema for a specific question
     */
    getQuestionSchema(questionId: string): Promise<any | null>;
    /**
     * Get all available questions
     */
    getAllQuestions(): Promise<FAQQuestion[]>;
    /**
     * Get a specific question definition
     */
    getQuestion(questionId: string): Promise<FAQQuestion | null>;
    /**
     * Get questions by level
     */
    getQuestionsByLevel(level: 'dak' | 'component' | 'asset'): Promise<FAQQuestion[]>;
    /**
     * Get questions by component type
     */
    getQuestionsByComponentType(componentType: string): Promise<FAQQuestion[]>;
    /**
     * Get questions by asset type
     */
    getQuestionsByAssetType(assetType: string): Promise<FAQQuestion[]>;
    /**
     * Validate question parameters against schema
     */
    validateQuestionParameters(questionId: string, parameters: any): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    /**
     * Get OpenAPI schema for all questions
     */
    getOpenAPISchema(): Promise<any>;
}
//# sourceMappingURL=FAQSchemaService.d.ts.map