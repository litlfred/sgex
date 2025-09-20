/**
 * Question Loader for Modular FAQ System
 * Dynamically loads question definitions and executors from the questions directory
 */
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class QuestionLoader {
    questionsPath;
    loadedQuestions;
    constructor() {
        this.questionsPath = path.join(__dirname, '../../questions');
        this.loadedQuestions = new Map();
    }
    /**
     * Load all questions from the questions directory
     */
    async loadAllQuestions() {
        try {
            await this.scanQuestionsDirectory();
            return this.loadedQuestions;
        }
        catch (error) {
            throw new Error(`Failed to load questions: ${error.message}`);
        }
    }
    /**
     * Get a loaded question by ID
     */
    getQuestion(id) {
        return this.loadedQuestions.get(id);
    }
    /**
     * Get all loaded questions
     */
    getAllQuestions() {
        return Array.from(this.loadedQuestions.values());
    }
    /**
     * Recursively scan questions directory and load questions
     */
    async scanQuestionsDirectory() {
        await this.scanDirectory(this.questionsPath);
    }
    /**
     * Scan a directory for question definitions and executors
     */
    async scanDirectory(dirPath) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    // Check if this directory contains a question (has both definition.json and executor.ts)
                    const definitionPath = path.join(fullPath, 'definition.json');
                    const executorPath = path.join(fullPath, 'executor.ts');
                    try {
                        await fs.access(definitionPath);
                        await fs.access(executorPath);
                        // This directory contains a question
                        await this.loadQuestion(fullPath);
                    }
                    catch {
                        // This directory doesn't contain a complete question, scan recursively
                        await this.scanDirectory(fullPath);
                    }
                }
            }
        }
        catch (error) {
            // Directory doesn't exist or can't be read, skip silently
            console.warn(`Could not scan directory ${dirPath}: ${error.message}`);
        }
    }
    /**
     * Load a question from a directory containing definition.json and executor.ts
     */
    async loadQuestion(questionDir) {
        try {
            const definitionPath = path.join(questionDir, 'definition.json');
            const executorPath = path.join(questionDir, 'executor.ts');
            // Load definition
            const definitionContent = await fs.readFile(definitionPath, 'utf-8');
            const definition = JSON.parse(definitionContent);
            // Load executor
            // Note: In a production environment, we might need to compile TypeScript first
            // For now, we'll need to handle this differently since we can't directly import .ts files
            const executorModule = await this.loadExecutorModule(executorPath);
            if (!executorModule.executor) {
                throw new Error(`Executor module does not export 'executor' function: ${executorPath}`);
            }
            const questionModule = {
                definition,
                executor: executorModule.executor
            };
            this.loadedQuestions.set(definition.id, questionModule);
            console.log(`Loaded question: ${definition.id} from ${questionDir}`);
        }
        catch (error) {
            console.error(`Failed to load question from ${questionDir}:`, error.message);
            throw error;
        }
    }
    /**
     * Load executor module (handling TypeScript compilation)
     */
    async loadExecutorModule(executorPath) {
        // Convert .ts to .js path for the compiled version
        const compiledPath = executorPath.replace(/\.ts$/, '.js');
        try {
            // Try to load the compiled JavaScript version first
            const module = await import(compiledPath);
            return module;
        }
        catch (error) {
            // If compiled version doesn't exist, we need to handle TypeScript compilation
            // For now, throw an error indicating the need for compilation
            throw new Error(`Compiled executor not found: ${compiledPath}. Please run 'npm run build' to compile TypeScript files.`);
        }
    }
    /**
     * Get question schemas for API documentation
     */
    getQuestionSchemas() {
        const schemas = {};
        for (const [id, question] of this.loadedQuestions) {
            if (question.definition.schema) {
                schemas[id] = question.definition.schema;
            }
        }
        return schemas;
    }
    /**
     * Validate question directory structure
     */
    static async validateQuestionDirectory(questionDir) {
        try {
            const definitionPath = path.join(questionDir, 'definition.json');
            const executorPath = path.join(questionDir, 'executor.ts');
            await fs.access(definitionPath);
            await fs.access(executorPath);
            // Validate definition.json structure
            const definitionContent = await fs.readFile(definitionPath, 'utf-8');
            const definition = JSON.parse(definitionContent);
            const requiredFields = ['id', 'level', 'title', 'description', 'parameters', 'tags'];
            for (const field of requiredFields) {
                if (!definition[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=QuestionLoader.js.map