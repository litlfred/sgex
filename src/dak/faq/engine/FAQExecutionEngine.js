/**
 * FAQ Execution Engine
 * Manages the execution of FAQ questions and batch processing
 */

import { QuestionContext, QuestionResult } from '../types/QuestionDefinition.js';
import parameterRegistryService from '../registry/ParameterRegistryService.js';
import { GitHubStorage } from '../storage/Storage.js';

class FAQExecutionEngine {
  constructor() {
    this.questionRegistry = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the engine with available questions
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Import and register all question components
      await this.loadQuestions();
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize FAQ engine: ${error.message}`);
    }
  }

  /**
   * Load all question components from the questions directory
   */
  async loadQuestions() {
    const questions = [
      // DAK-level questions
      {
        id: 'dak-name',
        module: () => import('../questions/dak/DakNameQuestion.js')
      },
      {
        id: 'dak-version', 
        module: () => import('../questions/dak/DakVersionQuestion.js')
      },
      // Component-level questions
      {
        id: 'business-process-workflows',
        module: () => import('../questions/component/businessProcess/BusinessProcessWorkflowsQuestion.js')
      }
    ];

    for (const questionConfig of questions) {
      try {
        const questionModule = await questionConfig.module();
        
        if (questionModule.metadata && questionModule.execute) {
          this.questionRegistry.set(questionConfig.id, {
            metadata: questionModule.metadata,
            execute: questionModule.execute,
            Render: questionModule.Render || null
          });
        } else {
          console.warn(`Question ${questionConfig.id} is missing required exports (metadata, execute)`);
        }
      } catch (error) {
        console.error(`Failed to load question ${questionConfig.id}:`, error);
      }
    }
  }

  /**
   * Get catalog of all available questions
   * @param {Object} filters - Optional filters (level, tags, etc.)
   * @returns {Array} - Array of question metadata
   */
  getCatalog(filters = {}) {
    if (!this.initialized) {
      throw new Error('FAQ engine not initialized');
    }

    const questions = Array.from(this.questionRegistry.values()).map(q => q.metadata);

    // Apply filters
    let filteredQuestions = questions;

    if (filters.level) {
      filteredQuestions = filteredQuestions.filter(q => q.level === filters.level);
    }

    if (filters.tags && Array.isArray(filters.tags)) {
      filteredQuestions = filteredQuestions.filter(q => 
        filters.tags.some(tag => q.tags.includes(tag))
      );
    }

    if (filters.componentType) {
      filteredQuestions = filteredQuestions.filter(q => 
        !q.componentTypes || q.componentTypes.length === 0 || q.componentTypes.includes(filters.componentType)
      );
    }

    if (filters.assetType) {
      filteredQuestions = filteredQuestions.filter(q => 
        !q.assetTypes || q.assetTypes.length === 0 || q.assetTypes.includes(filters.assetType)
      );
    }

    return filteredQuestions;
  }

  /**
   * Execute a batch of FAQ questions
   * @param {Array} requests - Array of question requests
   * @param {Object} context - Execution context (githubService, etc.)
   * @returns {Promise<Array>} - Array of execution results
   */
  async executeBatch(requests, context = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const results = [];

    for (const request of requests) {
      try {
        const result = await this.executeQuestion(request, context);
        results.push({
          questionId: request.questionId,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          questionId: request.questionId,
          success: false,
          error: error.message,
          result: new QuestionResult({
            structured: {},
            narrative: this.getErrorNarrative(request.locale || 'en_US', error.message),
            errors: [error.message],
            meta: {}
          })
        });
      }
    }

    return results;
  }

  /**
   * Execute a single FAQ question
   * @param {Object} request - Question request
   * @param {Object} context - Execution context
   * @returns {Promise<QuestionResult>} - Question result
   */
  async executeQuestion(request, context = {}) {
    const { questionId, parameters = {}, assetFiles = [] } = request;

    // Get question from registry
    const question = this.questionRegistry.get(questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    // Handle template questions (asset-level questions that need to be instantiated per asset)
    if (question.metadata.isTemplate && assetFiles.length > 0) {
      return await this.executeTemplateQuestion(question, request, context);
    }

    // Validate and normalize parameters
    const validation = parameterRegistryService.validateParameters(
      parameters,
      question.metadata.level,
      this.getQuestionType(question.metadata)
    );

    if (!validation.isValid) {
      throw new Error(`Parameter validation failed: ${validation.errors.join(', ')}`);
    }

    // Create storage interface
    const storage = this.createStorage(validation.normalized, context);

    // Create execution context
    const executionContext = new QuestionContext({
      repository: validation.normalized.repository,
      locale: validation.normalized.locale || 'en_US',
      branch: validation.normalized.branch || 'main',
      user: context.user || null,
      assetFile: validation.normalized.assetFile || null,
      componentType: validation.normalized.componentType || null,
      storage
    });

    // Execute the question
    const input = {
      ...validation.normalized,
      storage,
      context: executionContext
    };

    return await question.execute(input);
  }

  /**
   * Execute template question for multiple assets
   * @param {Object} question - Question definition
   * @param {Object} request - Original request
   * @param {Object} context - Execution context
   * @returns {Promise<QuestionResult>} - Aggregated result
   */
  async executeTemplateQuestion(question, request, context) {
    const { parameters = {}, assetFiles = [] } = request;
    const results = [];
    const allWarnings = [];
    const allErrors = [];

    for (const assetFile of assetFiles) {
      try {
        const assetParameters = { ...parameters, assetFile };
        
        // Validate parameters for this asset
        const validation = parameterRegistryService.validateParameters(
          assetParameters,
          question.metadata.level,
          this.getQuestionType(question.metadata)
        );

        if (!validation.isValid) {
          allErrors.push(`Asset ${assetFile}: ${validation.errors.join(', ')}`);
          continue;
        }

        // Create storage and context for this asset
        const storage = this.createStorage(validation.normalized, context);
        const executionContext = new QuestionContext({
          repository: validation.normalized.repository,
          locale: validation.normalized.locale || 'en_US',
          branch: validation.normalized.branch || 'main',
          user: context.user || null,
          assetFile: assetFile,
          componentType: validation.normalized.componentType || null,
          storage
        });

        const input = {
          ...validation.normalized,
          storage,
          context: executionContext
        };

        const result = await question.execute(input);
        results.push({
          assetFile,
          result
        });

        // Collect warnings and errors
        if (result.warnings) allWarnings.push(...result.warnings);
        if (result.errors) allErrors.push(...result.errors);

      } catch (error) {
        allErrors.push(`Asset ${assetFile}: ${error.message}`);
      }
    }

    // Aggregate results
    const aggregatedStructured = {
      assets: results.map(r => ({
        assetFile: r.assetFile,
        ...r.result.structured
      })),
      summary: {
        totalAssets: assetFiles.length,
        successfulAssets: results.length,
        failedAssets: assetFiles.length - results.length
      }
    };

    const aggregatedNarrative = this.aggregateNarratives(results, request.locale || 'en_US');

    return new QuestionResult({
      structured: aggregatedStructured,
      narrative: aggregatedNarrative,
      warnings: allWarnings,
      errors: allErrors,
      meta: {
        isAggregated: true,
        questionId: question.metadata.id,
        assetCount: assetFiles.length
      }
    });
  }

  /**
   * Create storage interface based on parameters and context
   * @param {Object} parameters - Validated parameters
   * @param {Object} context - Execution context
   * @returns {Storage} - Storage interface
   */
  createStorage(parameters, context) {
    if (context.githubService) {
      // Use GitHub storage for web application
      return new GitHubStorage(
        context.githubService,
        parameters.repository,
        parameters.branch || 'main'
      );
    } else {
      // This would be implemented for MCP server with local storage
      throw new Error('Local storage not implemented in web context');
    }
  }

  /**
   * Get question type for parameter validation
   * @param {Object} metadata - Question metadata
   * @returns {string} - Question type
   */
  getQuestionType(metadata) {
    if (metadata.componentTypes && metadata.componentTypes.length > 0) {
      return metadata.componentTypes[0];
    }
    if (metadata.assetTypes && metadata.assetTypes.length > 0) {
      return metadata.assetTypes[0];
    }
    return null;
  }

  /**
   * Aggregate narratives from multiple results
   * @param {Array} results - Array of asset results
   * @param {string} locale - Locale for output
   * @returns {string} - Aggregated narrative HTML
   */
  aggregateNarratives(results, locale) {
    if (results.length === 0) {
      return `<h4>No Results</h4><p>No assets were processed successfully.</p>`;
    }

    let html = `<h4>Asset Analysis Results</h4>`;
    html += `<p>Processed ${results.length} asset(s):</p>`;
    html += `<ul>`;

    for (const { assetFile, result } of results) {
      html += `<li><strong>${assetFile}</strong>`;
      if (result.errors && result.errors.length > 0) {
        html += ` <span class="error">(${result.errors.length} error(s))</span>`;
      } else if (result.warnings && result.warnings.length > 0) {
        html += ` <span class="warning">(${result.warnings.length} warning(s))</span>`;
      } else {
        html += ` <span class="success">✓</span>`;
      }
      html += `</li>`;
    }

    html += `</ul>`;
    return html;
  }

  /**
   * Get error narrative
   * @param {string} locale - Locale for error message
   * @param {string} error - Error message
   * @returns {string} - Error narrative HTML
   */
  getErrorNarrative(locale, error) {
    const errorMessages = {
      en_US: `<h4>Error</h4><p class="error">An error occurred while executing the question: ${error}</p>`,
      fr_FR: `<h4>Erreur</h4><p class="error">Une erreur s'est produite lors de l'exécution de la question: ${error}</p>`,
      es_ES: `<h4>Error</h4><p class="error">Ocurrió un error al ejecutar la pregunta: ${error}</p>`
    };

    return errorMessages[locale] || errorMessages['en_US'];
  }

  /**
   * Normalize locale string
   * @param {string} locale - Input locale
   * @returns {string} - Normalized locale
   */
  normalizeLocale(locale) {
    if (!locale) return 'en_US';
    
    // Handle common locale formats
    const normalized = locale.replace('-', '_');
    
    // Map to supported locales
    const supportedLocales = ['en_US', 'fr_FR', 'es_ES', 'ar_AR', 'zh_CN', 'ru_RU'];
    
    if (supportedLocales.includes(normalized)) {
      return normalized;
    }
    
    // Try base language
    const baseLanguage = normalized.split('_')[0];
    const baseLocaleMap = {
      'en': 'en_US',
      'fr': 'fr_FR', 
      'es': 'es_ES',
      'ar': 'ar_AR',
      'zh': 'zh_CN',
      'ru': 'ru_RU'
    };
    
    return baseLocaleMap[baseLanguage] || 'en_US';
  }
}

// Singleton instance
const faqExecutionEngine = new FAQExecutionEngine();

export default faqExecutionEngine;