/**
 * FAQ Schema Service
 * Provides access to question schemas for the React application
 */
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class FAQSchemaService {
    static instance;
    schemas;
    questions;
    initialized;
    constructor() {
        this.schemas = new Map();
        this.questions = new Map();
        this.initialized = false;
    }
    static getInstance() {
        if (!FAQSchemaService.instance) {
            FAQSchemaService.instance = new FAQSchemaService();
        }
        return FAQSchemaService.instance;
    }
    /**
     * Initialize by loading all available question definitions
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            await this.loadSchemas();
            this.initialized = true;
        }
        catch (error) {
            console.error('Failed to initialize FAQ Schema Service:', error);
        }
    }
    /**
     * Load all available question schemas from the questions directory
     */
    async loadSchemas() {
        const questionsPath = path.resolve(__dirname, '../../questions');
        await this.scanQuestionsDirectory(questionsPath);
    }
    /**
     * Recursively scan questions directory for definition.json files
     */
    async scanQuestionsDirectory(dirPath) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    // Check if this directory contains a question definition
                    const definitionPath = path.join(fullPath, 'definition.json');
                    try {
                        await fs.access(definitionPath);
                        await this.loadQuestionDefinition(definitionPath);
                    }
                    catch {
                        // This directory doesn't contain a definition, scan recursively
                        await this.scanQuestionsDirectory(fullPath);
                    }
                }
            }
        }
        catch (error) {
            console.warn(`Could not scan directory ${dirPath}: ${error.message}`);
        }
    }
    /**
     * Load a question definition from a JSON file
     */
    async loadQuestionDefinition(definitionPath) {
        try {
            const content = await fs.readFile(definitionPath, 'utf-8');
            const question = JSON.parse(content);
            this.addQuestion(question);
            console.log(`Loaded question definition: ${question.id}`);
        }
        catch (error) {
            console.error(`Failed to load question definition from ${definitionPath}:`, error.message);
        }
    }
    /**
     * Add a question and its schema
     */
    addQuestion(question) {
        this.questions.set(question.id, question);
        if (question.schema) {
            this.schemas.set(question.id, question.schema);
        }
    }
    /**
     * Get all available question schemas
     */
    async getAllSchemas() {
        await this.initialize();
        const result = {};
        for (const [id, schema] of this.schemas) {
            result[id] = schema;
        }
        return result;
    }
    /**
     * Get schema for a specific question
     */
    async getQuestionSchema(questionId) {
        await this.initialize();
        return this.schemas.get(questionId) || null;
    }
    /**
     * Get all available questions
     */
    async getAllQuestions() {
        await this.initialize();
        return Array.from(this.questions.values());
    }
    /**
     * Get a specific question definition
     */
    async getQuestion(questionId) {
        await this.initialize();
        return this.questions.get(questionId) || null;
    }
    /**
     * Get questions by level
     */
    async getQuestionsByLevel(level) {
        await this.initialize();
        return Array.from(this.questions.values()).filter(q => q.level === level);
    }
    /**
     * Get questions by component type
     */
    async getQuestionsByComponentType(componentType) {
        await this.initialize();
        return Array.from(this.questions.values()).filter(q => q.componentType === componentType);
    }
    /**
     * Get questions by asset type
     */
    async getQuestionsByAssetType(assetType) {
        await this.initialize();
        return Array.from(this.questions.values()).filter(q => q.assetType === assetType);
    }
    /**
     * Validate question parameters against schema
     */
    async validateQuestionParameters(questionId, parameters) {
        const question = await this.getQuestion(questionId);
        if (!question) {
            return {
                isValid: false,
                errors: [`Question not found: ${questionId}`]
            };
        }
        const errors = [];
        // Check required parameters
        for (const param of question.parameters) {
            if (param.required && !parameters.hasOwnProperty(param.name)) {
                errors.push(`Missing required parameter: ${param.name}`);
            }
        }
        // Basic type validation (could be expanded)
        for (const param of question.parameters) {
            if (parameters.hasOwnProperty(param.name)) {
                const value = parameters[param.name];
                if (param.type === 'string' && typeof value !== 'string') {
                    errors.push(`Parameter ${param.name} must be a string`);
                }
                else if (param.type === 'number' && typeof value !== 'number') {
                    errors.push(`Parameter ${param.name} must be a number`);
                }
                else if (param.type === 'boolean' && typeof value !== 'boolean') {
                    errors.push(`Parameter ${param.name} must be a boolean`);
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Get OpenAPI schema for all questions
     */
    async getOpenAPISchema() {
        await this.initialize();
        const schemas = {};
        // Add common schemas
        schemas.ExecuteRequest = {
            type: 'object',
            properties: {
                questionId: { type: 'string', description: 'ID of the question to execute' },
                parameters: { type: 'object', description: 'Parameters for the question' }
            },
            required: ['questionId']
        };
        schemas.ExecuteResponse = {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                questionId: { type: 'string' },
                result: { type: 'object' },
                error: { type: 'object' },
                timestamp: { type: 'string', format: 'date-time' }
            }
        };
        // Add question-specific schemas
        for (const [id, schema] of this.schemas) {
            schemas[`${id}-input`] = schema.input;
            schemas[`${id}-output`] = schema.output;
        }
        return {
            openapi: '3.0.0',
            info: {
                title: 'DAK FAQ API',
                version: '1.0.0',
                description: 'FAQ system for WHO SMART Guidelines Digital Adaptation Kits'
            },
            components: {
                schemas
            }
        };
    }
}
//# sourceMappingURL=FAQSchemaService.js.map