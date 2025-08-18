/**
 * FAQ Schema Service - Enhanced with TypeScript Runtime Validation
 * 
 * This service provides access to FAQ question schemas and leverages the 
 * new TypeScript runtime validation infrastructure while preserving the 
 * manual question authoring approach.
 */

import { RuntimeValidationService } from './runtimeValidationService';

export interface FAQQuestionDefinition {
  id: string;
  level: 'dak' | 'component' | 'asset';
  title: string;
  description: string;
  parameters: FAQParameter[];
  tags: string[];
  schema: {
    input: any;
    output: any;
  };
}

export interface FAQParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
}

export interface FAQValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedData?: any;
}

export class FAQSchemaService {
  private validationService: RuntimeValidationService;
  private questionCache: Map<string, FAQQuestionDefinition> = new Map();
  private mcpServerUrl: string;

  constructor(mcpServerUrl: string = 'http://localhost:3001') {
    this.mcpServerUrl = mcpServerUrl;
    this.validationService = new RuntimeValidationService({
      strict: false,
      throwOnError: false,
      coerceTypes: true,
      removeAdditional: true
    });
  }

  /**
   * Get all available question schemas
   */
  async getAllQuestionSchemas(): Promise<Record<string, FAQQuestionDefinition>> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/faq/schemas`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const schemas = await response.json();
      
      // Cache the schemas
      Object.entries(schemas).forEach(([id, schema]) => {
        this.questionCache.set(id, schema as FAQQuestionDefinition);
      });
      
      return schemas;
    } catch (error) {
      console.error('Failed to fetch FAQ schemas:', error);
      return {};
    }
  }

  /**
   * Get schema for a specific question
   */
  async getQuestionSchema(questionId: string): Promise<FAQQuestionDefinition | null> {
    // Check cache first
    if (this.questionCache.has(questionId)) {
      return this.questionCache.get(questionId)!;
    }

    try {
      const response = await fetch(`${this.mcpServerUrl}/faq/schemas/${questionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const schema = await response.json();
      this.questionCache.set(questionId, schema);
      return schema;
    } catch (error) {
      console.error(`Failed to fetch schema for question ${questionId}:`, error);
      return null;
    }
  }

  /**
   * Validate question parameters using both manual schemas and runtime validation
   */
  async validateQuestionParameters(questionId: string, parameters: any): Promise<FAQValidationResult> {
    const schema = await this.getQuestionSchema(questionId);
    if (!schema) {
      return {
        isValid: false,
        errors: [`Question '${questionId}' not found`],
        warnings: []
      };
    }

    try {
      // First, validate against the manually authored JSON schema
      const schemaId = `faq-${questionId}-input`;
      
      // Register the schema if not already registered
      if (!this.validationService.hasSchema(schemaId)) {
        await this.validationService.registerSchema(schemaId, schema.schema.input);
      }

      // Perform validation using the enhanced runtime validation service
      const validationResult = await this.validationService.validate(schemaId, parameters);
      
      return {
        isValid: validationResult.isValid,
        errors: validationResult.errors.map(err => err.message),
        warnings: validationResult.warnings.map(warn => warn.message),
        sanitizedData: validationResult.data
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * Execute a single question with enhanced validation
   */
  async executeQuestion(questionId: string, parameters: any, context?: any): Promise<any> {
    // Validate parameters first
    const validationResult = await this.validateQuestionParameters(questionId, parameters);
    if (!validationResult.isValid) {
      return {
        success: false,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      };
    }

    try {
      const response = await fetch(`${this.mcpServerUrl}/faq/execute/${questionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parameters: validationResult.sanitizedData || parameters,
          context: context || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        errors: [`Execution failed: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * Get questions by level (dak, component, asset)
   */
  async getQuestionsByLevel(level: 'dak' | 'component' | 'asset'): Promise<FAQQuestionDefinition[]> {
    const allSchemas = await this.getAllQuestionSchemas();
    return Object.values(allSchemas).filter(schema => schema.level === level);
  }

  /**
   * Get questions by tags
   */
  async getQuestionsByTags(tags: string[]): Promise<FAQQuestionDefinition[]> {
    const allSchemas = await this.getAllQuestionSchemas();
    return Object.values(allSchemas).filter(schema => 
      tags.some(tag => schema.tags.includes(tag))
    );
  }

  /**
   * Clear schema cache
   */
  clearCache(): void {
    this.questionCache.clear();
  }

  /**
   * Health check for MCP server connectivity
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/health`);
      if (response.ok) {
        return { healthy: true, message: 'MCP server is running' };
      } else {
        return { healthy: false, message: `MCP server returned ${response.status}` };
      }
    } catch (error: any) {
      return { healthy: false, message: `Cannot connect to MCP server: ${error.message}` };
    }
  }
}

// Export a default instance
const faqSchemaService = new FAQSchemaService(
  process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001' 
    : '/faq-api'
);

export default faqSchemaService;