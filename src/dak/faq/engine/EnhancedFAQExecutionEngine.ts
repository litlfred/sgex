/**
 * Enhanced FAQ Execution Engine with TypeScript Runtime Validation
 * 
 * This engine leverages the new TypeScript infrastructure while preserving
 * the manual question authoring approach and clear separation between
 * question definitions and execution logic.
 */

import faqSchemaService from '../../../services/faqSchemaService';
import { RuntimeValidationService } from '../../../services/runtimeValidationService';
import { 
  FAQQuestionDefinition, 
  FAQExecutionResult, 
  FAQValidationResult,
  FAQSystemConfig 
} from '../../../types/core';

export interface FAQExecutionContext {
  repositoryPath?: string;
  user?: string;
  repo?: string;
  branch?: string;
  locale?: string;
}

export interface FAQBatchExecutionRequest {
  questions: Array<{
    id: string;
    parameters: any;
  }>;
  context?: FAQExecutionContext;
}

export interface FAQBatchExecutionResult {
  results: Array<{
    questionId: string;
    success: boolean;
    result?: FAQExecutionResult;
    errors?: string[];
    warnings?: string[];
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    executionTime: number;
  };
}

export class EnhancedFAQExecutionEngine {
  private validationService: RuntimeValidationService;
  private config: FAQSystemConfig;

  constructor(config: Partial<FAQSystemConfig> = {}) {
    this.config = {
      mcpServerUrl: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001' 
        : '/faq-api',
      enableCaching: true,
      maxCacheAge: 3600,
      enableValidation: true,
      validationStrict: false,
      ...config
    };

    this.validationService = new RuntimeValidationService({
      strict: this.config.validationStrict,
      throwOnError: false,
      coerceTypes: true,
      removeAdditional: true
    });
  }

  /**
   * Execute a single FAQ question with enhanced validation
   */
  async executeSingleQuestion(
    questionId: string, 
    parameters: any, 
    context: FAQExecutionContext = {}
  ): Promise<{
    success: boolean;
    result?: FAQExecutionResult;
    errors?: string[];
    warnings?: string[];
  }> {
    const startTime = Date.now();
    
    try {
      // Step 1: Validate parameters using the enhanced schema service
      const validation = await faqSchemaService.validateQuestionParameters(questionId, parameters);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings
        };
      }

      // Step 2: Execute the question via MCP server
      const executionResult = await faqSchemaService.executeQuestion(
        questionId, 
        validation.sanitizedData || parameters,
        context
      );

      const executionTime = Date.now() - startTime;

      if (executionResult.success === false) {
        return {
          success: false,
          errors: executionResult.errors || ['Unknown execution error'],
          warnings: executionResult.warnings || []
        };
      }

      // Step 3: Optional validation of output schema (if enabled)
      if (this.config.enableValidation) {
        await this.validateOutput(questionId, executionResult);
      }

      return {
        success: true,
        result: {
          ...executionResult,
          meta: {
            ...executionResult.meta,
            executionTime,
            validationEnabled: this.config.enableValidation,
            validationWarnings: validation.warnings
          }
        },
        warnings: validation.warnings
      };

    } catch (error: any) {
      return {
        success: false,
        errors: [`Execution failed: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * Execute multiple FAQ questions in batch
   */
  async executeBatchQuestions(request: FAQBatchExecutionRequest): Promise<FAQBatchExecutionResult> {
    const startTime = Date.now();
    const results: FAQBatchExecutionResult['results'] = [];

    for (const question of request.questions) {
      const result = await this.executeSingleQuestion(
        question.id,
        question.parameters,
        request.context
      );

      results.push({
        questionId: question.id,
        ...result
      });
    }

    const executionTime = Date.now() - startTime;
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return {
      results,
      summary: {
        total: results.length,
        successful,
        failed,
        executionTime
      }
    };
  }

  /**
   * Get all available questions with their schemas
   */
  async getAvailableQuestions(): Promise<FAQQuestionDefinition[]> {
    const schemas = await faqSchemaService.getAllQuestionSchemas();
    return Object.values(schemas);
  }

  /**
   * Get questions filtered by level and tags
   */
  async getFilteredQuestions(
    level?: 'dak' | 'component' | 'asset',
    tags?: string[]
  ): Promise<FAQQuestionDefinition[]> {
    let questions = await this.getAvailableQuestions();

    if (level) {
      questions = questions.filter(q => q.level === level);
    }

    if (tags && tags.length > 0) {
      questions = questions.filter(q => 
        tags.some(tag => q.tags.includes(tag))
      );
    }

    return questions;
  }

  /**
   * Execute sample DAK questions for a repository
   */
  async executeSampleDAKQuestions(
    repository: string,
    branch?: string,
    locale: string = 'en'
  ): Promise<FAQBatchExecutionResult> {
    const dakQuestions = await this.getFilteredQuestions('dak');
    
    // Execute common DAK questions
    const sampleQuestions = dakQuestions
      .filter(q => ['dak-name', 'dak-version'].includes(q.id))
      .map(q => ({
        id: q.id,
        parameters: { repository, locale }
      }));

    return this.executeBatchQuestions({
      questions: sampleQuestions,
      context: {
        repositoryPath: repository,
        branch,
        locale
      }
    });
  }

  /**
   * Validate output against schema (optional enhanced validation)
   */
  private async validateOutput(questionId: string, result: any): Promise<void> {
    try {
      const schema = await faqSchemaService.getQuestionSchema(questionId);
      if (!schema?.schema.output) {
        return; // No output schema to validate against
      }

      const outputSchemaId = `faq-${questionId}-output`;
      
      if (!this.validationService.hasSchema(outputSchemaId)) {
        await this.validationService.registerSchema(outputSchemaId, schema.schema.output);
      }

      const validation = await this.validationService.validate(outputSchemaId, result);
      
      if (!validation.isValid) {
        console.warn(`Output validation failed for question ${questionId}:`, validation.errors);
      }
    } catch (error) {
      console.warn(`Output validation error for question ${questionId}:`, error);
    }
  }

  /**
   * Health check for the FAQ system
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    mcpServer: boolean;
    validation: boolean;
    message: string;
  }> {
    const mcpCheck = await faqSchemaService.healthCheck();
    
    // Test validation service
    let validationHealthy = true;
    try {
      await this.validationService.validate('test', { test: true });
    } catch (error) {
      validationHealthy = false;
    }

    return {
      healthy: mcpCheck.healthy && validationHealthy,
      mcpServer: mcpCheck.healthy,
      validation: validationHealthy,
      message: mcpCheck.healthy && validationHealthy 
        ? 'FAQ system is fully operational'
        : `Issues detected: MCP=${mcpCheck.healthy}, Validation=${validationHealthy}`
    };
  }
}

// Export a default instance
const enhancedFAQExecutionEngine = new EnhancedFAQExecutionEngine();

export default enhancedFAQExecutionEngine;