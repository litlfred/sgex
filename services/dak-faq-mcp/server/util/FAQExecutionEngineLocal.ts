/**
 * Local FAQ Execution Engine for MCP Server
 * Extends the base engine for local file system operations
 */

import path from 'path';
import fs from 'fs/promises';
import { FAQQuestion, ExecuteRequest, ExecuteResponse, CatalogFilters } from '../../types.js';

interface FAQQuestionRegistry {
  metadata: FAQQuestion;
  execute: (input: FAQExecutionInput) => Promise<FAQExecutionResult>;
}

interface FAQExecutionInput {
  storage: StorageInterface;
  locale?: string;
  [key: string]: any;
}

interface FAQExecutionResult {
  structured: Record<string, any>;
  narrative: string;
  errors: string[];
  warnings: string[];
  meta: Record<string, any>;
}

interface StorageInterface {
  readFile(filePath: string): Promise<Buffer>;
  fileExists(filePath: string): Promise<boolean>;
  listFiles(pattern: string, options?: Record<string, any>): Promise<string[]>;
}

interface FAQExecutionContext {
  repositoryPath?: string;
  [key: string]: any;
}

export class FAQExecutionEngineLocal {
  private questionRegistry: Map<string, FAQQuestionRegistry>;
  private initialized: boolean;

  constructor() {
    this.questionRegistry = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the engine with available questions
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // In MCP server, we need to dynamically import questions
      // This is a simplified version that would need to be expanded
      await this.loadQuestions();
      this.initialized = true;
    } catch (error: any) {
      throw new Error(`Failed to initialize local FAQ engine: ${error.message}`);
    }
  }

  /**
   * Load question modules (simplified for demo)
   */
  private async loadQuestions(): Promise<void> {
    // For the MCP server, we would need to either:
    // 1. Copy the question modules to the MCP server directory
    // 2. Create a build process that bundles them
    // 3. Or implement a different loading mechanism
    
    // For now, we'll register mock questions that demonstrate the structure
    this.registerMockQuestions();
  }

  /**
   * Register mock questions for demonstration
   */
  private registerMockQuestions(): void {
    // DAK Name Question
    this.questionRegistry.set('dak-name', {
      metadata: {
        id: 'dak-name',
        level: 'dak',
        title: 'DAK Name',
        description: 'Extracts the name of the DAK from sushi-config.yaml',
        parameters: [],
        tags: ['dak', 'metadata', 'name']
      },
      execute: async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
        const { storage, locale = 'en_US' } = input;
        
        try {
          const exists = await storage.fileExists('sushi-config.yaml');
          if (!exists) {
            return {
              structured: { name: null },
              narrative: `<h4>DAK Name</h4><p class="error">The sushi-config.yaml file was not found.</p>`,
              errors: ['sushi-config.yaml file not found'],
              warnings: [],
              meta: {}
            };
          }

          const content = await storage.readFile('sushi-config.yaml');
          const yaml = await import('js-yaml');
          const config = yaml.load(content.toString('utf-8')) as any;
          
          const name = config?.name || config?.title || config?.id || null;
          
          return {
            structured: { 
              name,
              id: config?.id,
              title: config?.title,
              version: config?.version 
            },
            narrative: name 
              ? `<h4>DAK Name</h4><p>The name of this DAK is <strong>${name}</strong>.</p>`
              : `<h4>DAK Name</h4><p>No name found in sushi-config.yaml.</p>`,
            errors: [],
            warnings: name ? [] : ['No name field found in sushi-config.yaml'],
            meta: {
              cacheHint: {
                scope: 'repository',
                key: 'dak-name',
                ttl: 3600,
                dependencies: ['sushi-config.yaml']
              }
            }
          };
        } catch (error: any) {
          return {
            structured: { name: null },
            narrative: `<h4>DAK Name</h4><p class="error">Error reading configuration: ${error.message}</p>`,
            errors: [error.message],
            warnings: [],
            meta: {}
          };
        }
      }
    });

    // DAK Version Question  
    this.questionRegistry.set('dak-version', {
      metadata: {
        id: 'dak-version',
        level: 'dak',
        title: 'DAK Version',
        description: 'Extracts the version of the DAK from sushi-config.yaml',
        parameters: [],
        tags: ['dak', 'metadata', 'version']
      },
      execute: async (input: FAQExecutionInput): Promise<FAQExecutionResult> => {
        const { storage, locale = 'en_US' } = input;
        
        try {
          const exists = await storage.fileExists('sushi-config.yaml');
          if (!exists) {
            return {
              structured: { version: null },
              narrative: `<h4>DAK Version</h4><p class="error">The sushi-config.yaml file was not found.</p>`,
              errors: ['sushi-config.yaml file not found'],
              warnings: [],
              meta: {}
            };
          }

          const content = await storage.readFile('sushi-config.yaml');
          const yaml = await import('js-yaml');
          const config = yaml.load(content.toString('utf-8')) as any;
          
          const version = config?.version || null;
          const status = config?.status || null;
          
          return {
            structured: { 
              version,
              status,
              releaseDate: config?.releaseDate || config?.date,
              name: config?.name,
              id: config?.id
            },
            narrative: version 
              ? `<h4>DAK Version</h4><p>This DAK is version <strong>${version}</strong>.</p>${status ? `<p>Status: ${status}</p>` : ''}`
              : `<h4>DAK Version</h4><p>No version found in sushi-config.yaml.</p>`,
            errors: [],
            warnings: version ? [] : ['No version field found in sushi-config.yaml'],
            meta: {
              cacheHint: {
                scope: 'repository',
                key: 'dak-version',
                ttl: 3600,
                dependencies: ['sushi-config.yaml']
              }
            }
          };
        } catch (error: any) {
          return {
            structured: { version: null },
            narrative: `<h4>DAK Version</h4><p class="error">Error reading configuration: ${error.message}</p>`,
            errors: [error.message],
            warnings: [],
            meta: {}
          };
        }
      }
    });
  }

  /**
   * Get catalog of available questions
   */
  getCatalog(filters: CatalogFilters = {}): FAQQuestion[] {
    if (!this.initialized) {
      throw new Error('FAQ engine not initialized');
    }

    let questions = Array.from(this.questionRegistry.values()).map(q => q.metadata);

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

    const question = this.questionRegistry.get(questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    // Create local storage interface
    const repositoryPath = context.repositoryPath || process.cwd();
    const storage = new LocalStorageImpl(repositoryPath);

    // Execute question
    const input: FAQExecutionInput = {
      ...parameters,
      storage,
      locale: parameters.locale || 'en_US'
    };

    return await question.execute(input);
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