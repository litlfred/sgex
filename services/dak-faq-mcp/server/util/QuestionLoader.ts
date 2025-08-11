/**
 * Question Loader for Modular FAQ System
 * Dynamically loads question definitions and executors from the questions directory
 */

import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { QuestionDefinition, QuestionModule, FAQExecutor } from '../../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class QuestionLoader {
  private questionsPath: string;
  private loadedQuestions: Map<string, QuestionModule>;

  constructor() {
    this.questionsPath = path.join(__dirname, '../questions');
    this.loadedQuestions = new Map();
  }

  /**
   * Load all questions from the questions directory
   */
  async loadAllQuestions(): Promise<Map<string, QuestionModule>> {
    try {
      await this.scanQuestionsDirectory();
      return this.loadedQuestions;
    } catch (error: any) {
      throw new Error(`Failed to load questions: ${error.message}`);
    }
  }

  /**
   * Get a loaded question by ID
   */
  getQuestion(id: string): QuestionModule | undefined {
    return this.loadedQuestions.get(id);
  }

  /**
   * Get all loaded questions
   */
  getAllQuestions(): QuestionModule[] {
    return Array.from(this.loadedQuestions.values());
  }

  /**
   * Recursively scan questions directory and load questions
   */
  private async scanQuestionsDirectory(): Promise<void> {
    await this.scanDirectory(this.questionsPath);
  }

  /**
   * Scan a directory for question definitions and executors
   */
  private async scanDirectory(dirPath: string): Promise<void> {
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
          } catch {
            // This directory doesn't contain a complete question, scan recursively
            await this.scanDirectory(fullPath);
          }
        }
      }
    } catch (error: any) {
      // Directory doesn't exist or can't be read, skip silently
      console.warn(`Could not scan directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Load a question from a directory containing definition.json and executor.ts
   */
  private async loadQuestion(questionDir: string): Promise<void> {
    try {
      const definitionPath = path.join(questionDir, 'definition.json');
      const executorPath = path.join(questionDir, 'executor.ts');

      // Load definition
      const definitionContent = await fs.readFile(definitionPath, 'utf-8');
      const definition: QuestionDefinition = JSON.parse(definitionContent);

      // Load executor
      // Note: In a production environment, we might need to compile TypeScript first
      // For now, we'll need to handle this differently since we can't directly import .ts files
      const executorModule = await this.loadExecutorModule(executorPath);

      if (!executorModule.executor) {
        throw new Error(`Executor module does not export 'executor' function: ${executorPath}`);
      }

      const questionModule: QuestionModule = {
        definition,
        executor: executorModule.executor
      };

      this.loadedQuestions.set(definition.id, questionModule);
      console.log(`Loaded question: ${definition.id} from ${questionDir}`);

    } catch (error: any) {
      console.error(`Failed to load question from ${questionDir}:`, error.message);
      throw error;
    }
  }

  /**
   * Load executor module (handling TypeScript compilation)
   */
  private async loadExecutorModule(executorPath: string): Promise<{ executor: FAQExecutor }> {
    // Convert .ts to .js path for the compiled version
    const compiledPath = executorPath.replace(/\.ts$/, '.js');
    
    try {
      // Try to load the compiled JavaScript version first
      const module = await import(compiledPath);
      return module;
    } catch (error) {
      // If compiled version doesn't exist, we need to handle TypeScript compilation
      // For now, throw an error indicating the need for compilation
      throw new Error(`Compiled executor not found: ${compiledPath}. Please run 'npm run build' to compile TypeScript files.`);
    }
  }

  /**
   * Get question schemas for API documentation
   */
  getQuestionSchemas(): Record<string, any> {
    const schemas: Record<string, any> = {};
    
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
  static async validateQuestionDirectory(questionDir: string): Promise<boolean> {
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
    } catch {
      return false;
    }
  }
}