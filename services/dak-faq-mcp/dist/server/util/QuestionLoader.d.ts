/**
 * Question Loader for Modular FAQ System
 * Dynamically loads question definitions and executors from the questions directory
 */
import { QuestionModule } from '../../types.js';
export declare class QuestionLoader {
    private questionsPath;
    private loadedQuestions;
    constructor();
    /**
     * Load all questions from the questions directory
     */
    loadAllQuestions(): Promise<Map<string, QuestionModule>>;
    /**
     * Get a loaded question by ID
     */
    getQuestion(id: string): QuestionModule | undefined;
    /**
     * Get all loaded questions
     */
    getAllQuestions(): QuestionModule[];
    /**
     * Recursively scan questions directory and load questions
     */
    private scanQuestionsDirectory;
    /**
     * Scan a directory for question definitions and executors
     */
    private scanDirectory;
    /**
     * Load a question from a directory containing definition.json and executor.ts
     */
    private loadQuestion;
    /**
     * Load executor module (handling TypeScript compilation)
     */
    private loadExecutorModule;
    /**
     * Get question schemas for API documentation
     */
    getQuestionSchemas(): Record<string, any>;
    /**
     * Validate question directory structure
     */
    static validateQuestionDirectory(questionDir: string): Promise<boolean>;
}
//# sourceMappingURL=QuestionLoader.d.ts.map