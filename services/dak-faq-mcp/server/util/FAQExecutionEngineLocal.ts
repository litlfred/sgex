/**
 * Local FAQ Execution Engine for MCP Server
 * Uses modular question loading system with i18n support
 */

import path from 'path';
import fs from 'fs/promises';
import { FAQQuestion, ExecuteRequest, ExecuteResponse, CatalogFilters, FAQExecutionInput, FAQExecutionResult, StorageInterface } from '../../types.js';
import { QuestionLoader } from './QuestionLoader.js';

interface FAQExecutionContext {
  repositoryPath?: string;
  [key: string]: any;
}

export class FAQExecutionEngineLocal {
  private questionLoader: QuestionLoader;
  private initialized: boolean;

  constructor() {
    this.questionLoader = new QuestionLoader();
    this.initialized = false;
  }

  /**
   * Initialize the engine with available questions
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.questionLoader.loadAllQuestions();
      this.initialized = true;
    } catch (error: any) {
      throw new Error(`Failed to initialize local FAQ engine: ${error.message}`);
    }
  }

  /**
   * Get catalog of available questions
   */
  getCatalog(filters: CatalogFilters = {}): FAQQuestion[] {
    if (!this.initialized) {
      throw new Error('FAQ engine not initialized');
    }

    let questions = this.questionLoader.getAllQuestions().map(q => q.definition);

    // Apply filters
    if (filters.level) {
      questions = questions.filter(q => q.level === filters.level);
    }

    if (filters.tags && Array.isArray(filters.tags)) {
      questions = questions.filter(q => 
        filters.tags!.some(tag => q.tags.includes(tag))
      );
    }

    if (filters.componentType) {
      questions = questions.filter(q => q.componentType === filters.componentType);
    }

    if (filters.assetType) {
      questions = questions.filter(q => q.assetType === filters.assetType);
    }

    return questions;
  }

  /**
   * Execute batch of questions
   */
  async executeBatch(requests: ExecuteRequest[], context: FAQExecutionContext = {}): Promise<ExecuteResponse[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const results: ExecuteResponse[] = [];

    for (const request of requests) {
      try {
        const result = await this.executeQuestion(request, context);
        results.push({
          questionId: request.questionId,
          success: true,
          result,
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        results.push({
          questionId: request.questionId,
          success: false,
          error: {
            message: error.message,
            code: 'EXECUTION_ERROR'
          },
          result: {
            structured: {},
            narrative: `<h4>Error</h4><p class="error">${error.message}</p>`,
            errors: [error.message],
            warnings: [],
            meta: {}
          },
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Execute single question
   */
  private async executeQuestion(request: ExecuteRequest, context: FAQExecutionContext = {}): Promise<FAQExecutionResult> {
    const { questionId, parameters = {} } = request;

    const question = this.questionLoader.getQuestion(questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    // Create local storage interface
    const repositoryPath = context.repositoryPath || process.cwd();
    const storage = new LocalStorageImpl(repositoryPath);

    // Create a simple translation function (for MCP server, we'll use English defaults)
    const t = (key: string, options: any = {}) => {
      // Simple fallback translation - in a full implementation, this would load actual translations
      const translations: Record<string, string> = {
        'dak.faq.name.title': 'DAK Name',
        'dak.faq.name.description': 'Extracts the name of the DAK from sushi-config.yaml',
        'dak.faq.name.config_not_found': 'The sushi-config.yaml file was not found',
        'dak.faq.name.found': `The name of this DAK is **${options.name}**`,
        'dak.faq.name.not_found': 'No DAK name found in configuration',
        'dak.faq.name.no_name_field': 'No name field found in sushi-config.yaml',
        'dak.faq.name.read_error': `Error reading configuration: ${options.error}`,
        'dak.faq.version.title': 'DAK Version',
        'dak.faq.version.description': 'Extracts the version of the DAK from sushi-config.yaml',
        'dak.faq.version.config_not_found': 'The sushi-config.yaml file was not found',
        'dak.faq.version.found': `This DAK is version **${options.version}**`,
        'dak.faq.version.status': `Status: ${options.status}`,
        'dak.faq.version.not_found': 'No DAK version found in configuration',
        'dak.faq.version.no_version_field': 'No version field found in sushi-config.yaml',
        'dak.faq.version.read_error': `Error reading configuration: ${options.error}`,
        'dak.faq.decision_table_inputs.title': 'Decision Table Inputs',
        'dak.faq.decision_table_inputs.description': 'Analyzes DMN files to extract decision table input requirements',
        'dak.faq.decision_table_inputs.no_asset_file': 'No asset file specified',
        'dak.faq.decision_table_inputs.file_not_found': `DMN file not found: ${options.file}`,
        'dak.faq.decision_table_inputs.parse_error': 'Error parsing DMN XML file',
        'dak.faq.decision_table_inputs.analysis_error': `Error analyzing DMN file: ${options.error}`,
        'dak.faq.decision_table_inputs.no_tables': 'No decision tables found in this DMN file',
        'dak.faq.decision_table_inputs.found_tables': `Found ${options.count} decision table(s)`,
        'dak.faq.decision_table_inputs.hit_policy': 'Hit Policy',
        'dak.faq.decision_table_inputs.inputs': 'Inputs',
        'dak.faq.decision_table_inputs.outputs': 'Outputs',
        'dak.faq.decision_table_inputs.no_inputs': 'No inputs found in decision tables'
      };
      
      return translations[key] || key;
    };

    // Execute question
    const input: FAQExecutionInput = {
      ...parameters,
      storage,
      locale: parameters.locale || 'en',
      t
    };

    return await question.executor(input);
  }

  /**
   * Get question schemas for API documentation
   */
  getQuestionSchemas(): Record<string, any> {
    if (!this.initialized) {
      throw new Error('FAQ engine not initialized');
    }
    
    return this.questionLoader.getQuestionSchemas();
  }
}

/**
 * Local storage implementation for MCP server
 */
class LocalStorageImpl implements StorageInterface {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = path.resolve(rootPath);
  }

  async readFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.rootPath, filePath);
    
    // Security check
    if (!fullPath.startsWith(this.rootPath)) {
      throw new Error('Path traversal not allowed');
    }
    
    return await fs.readFile(fullPath);
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.rootPath, filePath);
      
      // Security check
      if (!fullPath.startsWith(this.rootPath)) {
        return false;
      }
      
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(pattern: string, options: Record<string, any> = {}): Promise<string[]> {
    // Simple implementation - would need glob for full pattern support
    const fullPath = path.join(this.rootPath, pattern.replace('*', ''));
    
    try {
      const files = await fs.readdir(path.dirname(fullPath));
      return files.map(file => path.join(path.dirname(pattern), file));
    } catch {
      return [];
    }
  }
}