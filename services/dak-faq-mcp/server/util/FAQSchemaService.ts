/**
 * FAQ Schema Service 
 * Provides access to question schemas for the React application
 */

import { FAQQuestion } from '../../types.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { CanonicalSchemaService } from './CanonicalSchemaService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FAQSchemaService {
  private static instance: FAQSchemaService;
  private schemas: Map<string, any>;
  private questions: Map<string, FAQQuestion>;
  private initialized: boolean;
  private canonicalService: CanonicalSchemaService;

  private constructor() {
    this.schemas = new Map();
    this.questions = new Map();
    this.initialized = false;
    this.canonicalService = CanonicalSchemaService.getInstance();
  }

  public static getInstance(): FAQSchemaService {
    if (!FAQSchemaService.instance) {
      FAQSchemaService.instance = new FAQSchemaService();
    }
    return FAQSchemaService.instance;
  }

  /**
   * Initialize by loading all available question definitions
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await this.canonicalService.initialize();
      await this.loadSchemas();
      this.initialized = true;
    } catch (error: any) {
      console.error('Failed to initialize FAQ Schema Service:', error);
    }
  }

  /**
   * Load all available question schemas from the questions directory
   */
  private async loadSchemas(): Promise<void> {
    const questionsPath = path.resolve(__dirname, '../../questions');
    await this.scanQuestionsDirectory(questionsPath);
  }

  /**
   * Recursively scan questions directory for definition.json files
   */
  private async scanQuestionsDirectory(dirPath: string): Promise<void> {
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
          } catch {
            // This directory doesn't contain a definition, scan recursively
            await this.scanQuestionsDirectory(fullPath);
          }
        }
      }
    } catch (error: any) {
      console.warn(`Could not scan directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Load a question definition from a JSON file
   */
  private async loadQuestionDefinition(definitionPath: string): Promise<void> {
    try {
      const content = await fs.readFile(definitionPath, 'utf-8');
      const question: FAQQuestion = JSON.parse(content);
      
      this.addQuestion(question);
      console.log(`Loaded question definition: ${question.id}`);
    } catch (error: any) {
      console.error(`Failed to load question definition from ${definitionPath}:`, error.message);
    }
  }

  /**
   * Add a question and its schema
   */
  private addQuestion(question: FAQQuestion): void {
    this.questions.set(question.id, question);
    if (question.schema) {
      this.schemas.set(question.id, question.schema);
    }
  }

  /**
   * Get all available question schemas
   */
  async getAllSchemas(): Promise<Record<string, any>> {
    await this.initialize();
    const result: Record<string, any> = {};
    for (const [id, schema] of this.schemas) {
      result[id] = schema;
    }
    return result;
  }

  /**
   * Get schema for a specific question
   */
  async getQuestionSchema(questionId: string): Promise<any | null> {
    await this.initialize();
    return this.schemas.get(questionId) || null;
  }

  /**
   * Get all available questions
   */
  async getAllQuestions(): Promise<FAQQuestion[]> {
    await this.initialize();
    return Array.from(this.questions.values());
  }

  /**
   * Get a specific question definition
   */
  async getQuestion(questionId: string): Promise<FAQQuestion | null> {
    await this.initialize();
    return this.questions.get(questionId) || null;
  }

  /**
   * Get questions by level
   */
  async getQuestionsByLevel(level: 'dak' | 'component' | 'asset'): Promise<FAQQuestion[]> {
    await this.initialize();
    return Array.from(this.questions.values()).filter(q => q.level === level);
  }

  /**
   * Get questions by component type
   */
  async getQuestionsByComponentType(componentType: string): Promise<FAQQuestion[]> {
    await this.initialize();
    return Array.from(this.questions.values()).filter(q => q.componentType === componentType);
  }

  /**
   * Get questions by asset type
   */
  async getQuestionsByAssetType(assetType: string): Promise<FAQQuestion[]> {
    await this.initialize();
    return Array.from(this.questions.values()).filter(q => q.assetType === assetType);
  }

  /**
   * Get OpenAPI schema for all questions
   */
  async getOpenAPISchema(): Promise<any> {
    await this.initialize();
    const schemas: Record<string, any> = {};
    
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
      schemas[`${id}-input`] = await this.enhanceSchemaWithCanonicals(schema.input);
      schemas[`${id}-output`] = await this.enhanceSchemaWithCanonicals(schema.output);
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

  /**
   * Enhance a schema by resolving canonical URL references
   */
  private async enhanceSchemaWithCanonicals(schema: any): Promise<any> {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    const enhanced = { ...schema };

    // Check for x-canonical-url extension
    if (enhanced['x-canonical-url']) {
      const canonicalUrl = enhanced['x-canonical-url'];
      const resource = await this.canonicalService.fetchCanonicalResource(canonicalUrl);
      
      if (resource && resource.schema) {
        // Add description linking to canonical
        enhanced.description = enhanced.description 
          ? `${enhanced.description}\n\nCanonical: ${canonicalUrl}`
          : `Canonical: ${canonicalUrl}`;
        
        // If it's a ValueSet, add the enum values
        if (resource.type === 'ValueSet') {
          const enumValues = this.canonicalService.extractValueSetEnum(resource.schema);
          if (enumValues) {
            enhanced.enum = enumValues;
          }
        }
        
        // Add metadata
        enhanced['x-canonical-resource'] = {
          url: canonicalUrl,
          type: resource.type,
          lastFetched: resource.lastFetched
        };
      }
    }

    // Recursively enhance nested schemas
    if (enhanced.properties) {
      for (const key in enhanced.properties) {
        enhanced.properties[key] = await this.enhanceSchemaWithCanonicals(enhanced.properties[key]);
      }
    }

    if (enhanced.items) {
      enhanced.items = await this.enhanceSchemaWithCanonicals(enhanced.items);
    }

    if (enhanced.additionalProperties && typeof enhanced.additionalProperties === 'object') {
      enhanced.additionalProperties = await this.enhanceSchemaWithCanonicals(enhanced.additionalProperties);
    }

    return enhanced;
  }

  /**
   * Validate question parameters against schema, including canonical references
   */
  async validateQuestionParameters(questionId: string, parameters: any): Promise<{ isValid: boolean; errors: string[] }> {
    const question = await this.getQuestion(questionId);
    if (!question) {
      return {
        isValid: false,
        errors: [`Question not found: ${questionId}`]
      };
    }

    const errors: string[] = [];

    // Check required parameters
    for (const param of question.parameters) {
      if (param.required && !parameters.hasOwnProperty(param.name)) {
        errors.push(`Missing required parameter: ${param.name}`);
      }
    }

    // Get enhanced schema if available
    const schema = await this.getQuestionSchema(questionId);
    if (schema && schema.input) {
      const enhancedSchema = await this.enhanceSchemaWithCanonicals(schema.input);
      await this.validateAgainstEnhancedSchema(enhancedSchema, parameters, errors);
    } else {
      // Fallback to basic type validation
      for (const param of question.parameters) {
        if (parameters.hasOwnProperty(param.name)) {
          const value = parameters[param.name];
          if (param.type === 'string' && typeof value !== 'string') {
            errors.push(`Parameter ${param.name} must be a string`);
          } else if (param.type === 'number' && typeof value !== 'number') {
            errors.push(`Parameter ${param.name} must be a number`);
          } else if (param.type === 'boolean' && typeof value !== 'boolean') {
            errors.push(`Parameter ${param.name} must be a boolean`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate parameters against an enhanced schema
   */
  private async validateAgainstEnhancedSchema(
    schema: any,
    data: any,
    errors: string[],
    path: string = ''
  ): Promise<void> {
    if (!schema || !schema.properties) return;

    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const fullPath = path ? `${path}.${key}` : key;
      const value = data[key];

      // Check if property has canonical reference
      if ((propSchema as any)['x-canonical-url']) {
        const canonicalUrl = (propSchema as any)['x-canonical-url'];
        
        // If it's a ValueSet, validate against it
        if (value !== undefined) {
          const validation = await this.canonicalService.validateAgainstValueSet(
            String(value),
            canonicalUrl
          );
          
          if (!validation.isValid) {
            errors.push(`${fullPath}: ${validation.error}`);
          }
        }
      }

      // Validate enum values (including those from ValueSets)
      if ((propSchema as any).enum && value !== undefined) {
        if (!Array.isArray((propSchema as any).enum) || !(propSchema as any).enum.includes(value)) {
          errors.push(`${fullPath}: Value '${value}' is not in allowed values`);
        }
      }

      // Recursively validate nested objects
      if ((propSchema as any).type === 'object' && value && typeof value === 'object') {
        await this.validateAgainstEnhancedSchema(propSchema as any, value, errors, fullPath);
      }
    }
  }

  /**
   * Get canonical resources referenced in a question schema
   */
  async getCanonicalReferences(questionId: string): Promise<string[]> {
    const schema = await this.getQuestionSchema(questionId);
    if (!schema) return [];

    const references: string[] = [];
    
    const extractCanonicals = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (obj['x-canonical-url']) {
        references.push(obj['x-canonical-url']);
      }
      
      for (const value of Object.values(obj)) {
        if (typeof value === 'object') {
          extractCanonicals(value);
        }
      }
    };
    
    extractCanonicals(schema);
    return [...new Set(references)]; // Remove duplicates
  }

  /**
   * Audit all question schemas for canonical references
   */
  async auditCanonicalReferences(): Promise<{
    questionsWithCanonicals: string[];
    questionsWithoutCanonicals: string[];
    totalCanonicals: number;
    canonicalsByQuestion: Record<string, string[]>;
  }> {
    await this.initialize();
    
    const questionsWithCanonicals: string[] = [];
    const questionsWithoutCanonicals: string[] = [];
    const canonicalsByQuestion: Record<string, string[]> = {};
    let totalCanonicals = 0;

    for (const questionId of this.questions.keys()) {
      const canonicals = await this.getCanonicalReferences(questionId);
      
      if (canonicals.length > 0) {
        questionsWithCanonicals.push(questionId);
        canonicalsByQuestion[questionId] = canonicals;
        totalCanonicals += canonicals.length;
      } else {
        questionsWithoutCanonicals.push(questionId);
      }
    }

    return {
      questionsWithCanonicals,
      questionsWithoutCanonicals,
      totalCanonicals,
      canonicalsByQuestion
    };
  }
}