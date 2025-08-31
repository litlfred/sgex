/**
 * FAQ Schema Service 
 * Provides access to question schemas for the React application
 * Enhanced with WHO SMART Guidelines canonical schema integration
 */

import { FAQQuestion, CanonicalValidationResult } from '../../types.js';
import { CanonicalSchemaService } from './CanonicalSchemaService.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

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
    // Try different paths to find the questions directory
    const possiblePaths = [
      path.resolve(__dirname, '../../questions'),  // Original path
      path.resolve(__dirname, '../questions'),     // When running from dist
      path.resolve(process.cwd(), 'questions'),    // Relative to working directory
      path.resolve(process.cwd(), 'dist/questions') // When running npm start
    ];

    for (const questionsPath of possiblePaths) {
      try {
        await fs.access(questionsPath);
        console.log(`Found questions directory at: ${questionsPath}`);
        await this.scanQuestionsDirectory(questionsPath);
        return; // Success, exit early
      } catch (error) {
        // Try next path
        continue;
      }
    }

    console.warn('Could not find questions directory in any of the expected locations:', possiblePaths);
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
   * Validate question parameters using both manual schemas and canonical validation
   */
  async validateQuestionParameters(questionId: string, parameters: any): Promise<CanonicalValidationResult> {
    const question = await this.getQuestion(questionId);
    if (!question) {
      return {
        isValid: false,
        errors: [`Question not found: ${questionId}`],
        warnings: [],
        validatedAgainst: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const validatedAgainst: string[] = [];

    // Basic parameter validation (existing logic)
    for (const param of question.parameters) {
      if (param.required && !parameters.hasOwnProperty(param.name)) {
        errors.push(`Missing required parameter: ${param.name}`);
      }
    }

    // Enhanced validation with canonical schemas
    for (const param of question.parameters) {
      if (parameters.hasOwnProperty(param.name)) {
        const value = parameters[param.name];
        
        // Basic type validation
        if (param.type === 'string' && typeof value !== 'string') {
          errors.push(`Parameter ${param.name} must be a string`);
        } else if (param.type === 'number' && typeof value !== 'number') {
          errors.push(`Parameter ${param.name} must be a number`);
        } else if (param.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Parameter ${param.name} must be a boolean`);
        }

        // Canonical ValueSet validation
        if (param.valueSetBinding) {
          try {
            const isValid = await this.canonicalService.validateValueSetCode(
              param.valueSetBinding.valueSetUrl, 
              value
            );
            
            if (!isValid) {
              if (param.valueSetBinding.strength === 'required') {
                errors.push(`Parameter ${param.name} value '${value}' is not valid for required ValueSet ${param.valueSetBinding.valueSetUrl}`);
              } else {
                warnings.push(`Parameter ${param.name} value '${value}' is not in preferred ValueSet ${param.valueSetBinding.valueSetUrl}`);
              }
            }
            
            validatedAgainst.push(param.valueSetBinding.valueSetUrl);
          } catch (error: any) {
            warnings.push(`Could not validate parameter ${param.name} against ValueSet: ${error.message}`);
          }
        }

        // Canonical URL reference validation
        if (param.canonicalUrl) {
          try {
            const validationResult = await this.canonicalService.validateAgainstCanonical(
              param.canonicalUrl,
              { [param.name]: value }
            );
            
            if (!validationResult.isValid) {
              errors.push(...validationResult.errors.map(err => `Parameter ${param.name}: ${err}`));
            }
            
            validatedAgainst.push(param.canonicalUrl);
          } catch (error: any) {
            warnings.push(`Could not validate parameter ${param.name} against canonical schema: ${error.message}`);
          }
        }
      }
    }

    // Validate entire object against canonical references if present
    if (question.canonicalRefs) {
      for (const canonicalRef of question.canonicalRefs) {
        try {
          const validationResult = await this.canonicalService.validateAgainstCanonical(
            canonicalRef.url,
            parameters
          );
          
          if (!validationResult.isValid) {
            errors.push(...validationResult.errors.map(err => `Canonical validation (${canonicalRef.purpose}): ${err}`));
          }
          
          validatedAgainst.push(canonicalRef.url);
        } catch (error: any) {
          warnings.push(`Could not validate against canonical reference ${canonicalRef.url}: ${error.message}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validatedAgainst
    };
  }

  /**
   * Get OpenAPI schema for all questions with canonical references
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

    schemas.CanonicalValidationResult = {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } },
        validatedAgainst: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'URLs of canonical schemas used for validation'
        }
      },
      required: ['isValid', 'errors', 'warnings', 'validatedAgainst']
    };

    // Add question-specific schemas with canonical references
    for (const [id, schema] of this.schemas) {
      const question = this.questions.get(id);
      
      // Enhanced input schema with canonical references
      const inputSchema = { ...schema.input };
      if (question?.canonicalRefs) {
        inputSchema['x-canonical-refs'] = question.canonicalRefs;
      }
      
      // Add parameter-level canonical references
      if (question?.parameters && inputSchema.properties) {
        for (const param of question.parameters) {
          if (param.canonicalUrl || param.valueSetBinding) {
            const paramSchema = inputSchema.properties[param.name] || {};
            
            if (param.canonicalUrl) {
              paramSchema['x-canonical-url'] = param.canonicalUrl;
            }
            
            if (param.valueSetBinding) {
              paramSchema['x-valueset-binding'] = param.valueSetBinding;
              paramSchema.externalDocs = {
                description: `Browse ${param.valueSetBinding.description || 'ValueSet'}`,
                url: param.valueSetBinding.valueSetUrl
              };
            }
            
            inputSchema.properties[param.name] = paramSchema;
          }
        }
      }
      
      schemas[`${id}-input`] = inputSchema;
      schemas[`${id}-output`] = schema.output;
    }

    // Add canonical schema references
    const knownCanonicals = this.canonicalService.getKnownCanonicalUrls();
    schemas['KnownCanonicalReferences'] = {
      type: 'object',
      properties: {
        ValueSets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['ValueSet'] },
              url: { type: 'string', format: 'uri' },
              description: { type: 'string' },
              purpose: { type: 'string' }
            }
          }
        },
        LogicalModels: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['LogicalModel'] },
              url: { type: 'string', format: 'uri' },
              description: { type: 'string' },
              purpose: { type: 'string' }
            }
          }
        }
      },
      example: knownCanonicals
    };

    return {
      openapi: '3.0.0',
      info: {
        title: 'DAK FAQ API - Enhanced with WHO SMART Guidelines Canonical Schemas',
        version: '1.0.0',
        description: 'FAQ system for WHO SMART Guidelines Digital Adaptation Kits with integrated ValueSet and Logical Model validation',
        externalDocs: {
          description: 'WHO SMART Guidelines Implementation Guide',
          url: 'https://smart.who.int/ig-starter-kit/'
        }
      },
      components: {
        schemas
      },
      paths: {
        '/faq/canonical/known': {
          get: {
            summary: 'Get known canonical ValueSets and Logical Models',
            responses: {
              '200': {
                description: 'List of known canonical references',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/KnownCanonicalReferences' }
                  }
                }
              }
            }
          }
        },
        '/faq/canonical/validate': {
          post: {
            summary: 'Validate data against canonical schema',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      canonicalUrl: { type: 'string', format: 'uri' },
                      data: { type: 'object' }
                    },
                    required: ['canonicalUrl', 'data']
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Validation result',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/CanonicalValidationResult' }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Get available ValueSet codes for a parameter
   */
  async getParameterValueSetCodes(questionId: string, parameterName: string): Promise<string[]> {
    const question = await this.getQuestion(questionId);
    if (!question) {
      return [];
    }

    const parameter = question.parameters.find(p => p.name === parameterName);
    if (!parameter?.valueSetBinding) {
      return [];
    }

    try {
      const expansion = await this.canonicalService.expandValueSet(parameter.valueSetBinding.valueSetUrl);
      return expansion ? expansion.codes.map(c => c.code) : [];
    } catch (error: any) {
      console.warn(`Could not expand ValueSet for parameter ${parameterName}:`, error.message);
      return [];
    }
  }

  /**
   * Get enhanced question with canonical metadata
   */
  async getEnhancedQuestion(questionId: string): Promise<FAQQuestion | null> {
    const question = await this.getQuestion(questionId);
    if (!question) {
      return null;
    }

    // Clone question to avoid modifying cached version
    const enhanced = JSON.parse(JSON.stringify(question));

    // Add canonical metadata
    if (enhanced.canonicalRefs) {
      for (const ref of enhanced.canonicalRefs) {
        try {
          const schema = await this.canonicalService.loadCanonicalSchema(ref.url);
          if (schema) {
            ref.version = schema.version;
          }
        } catch (error: any) {
          console.warn(`Could not load canonical schema ${ref.url}:`, error.message);
        }
      }
    }

    return enhanced;
  }
}