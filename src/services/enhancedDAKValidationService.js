/**
 * Enhanced DAK Validation Service
 * 
 * Main orchestrator for the DAK Validation Framework.
 * Provides high-level validation APIs for DAK repositories, components, and files.
 */

import dakValidationRegistry, { DAK_COMPONENTS, VALIDATION_LEVELS } from './dakValidationRegistry.js';
import githubService from './githubService.js';

class EnhancedDAKValidationService {
  constructor() {
    this.registry = dakValidationRegistry;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Validate an entire DAK repository
   */
  async validateDAK(owner, repo, branch = 'main', options = {}) {
    const cacheKey = `${owner}/${repo}/${branch}`;
    
    // Check cache if not forcing refresh
    if (!options.forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.results;
      }
    }

    try {
      // Get all files from the repository
      const files = await this.getDAKFiles(owner, repo, branch);
      
      if (!files || files.length === 0) {
        return {
          error: 'Could not retrieve DAK files',
          summary: { error: 1, warning: 0, info: 0 },
          byComponent: {},
          byFile: {},
          canSave: false,
          total: 1
        };
      }

      // Create validation context
      const context = {
        owner,
        repo,
        branch,
        dakFiles: files,
        githubService: githubService
      };

      // Run all validations
      const allResults = [];
      
      for (const file of files) {
        const fileResults = await this.registry.validateFile(file.path, file.content, context);
        allResults.push(...fileResults);
      }

      // Format results
      const formattedResults = this.registry.formatResults(allResults);
      
      // Add metadata
      formattedResults.metadata = {
        owner,
        repo,
        branch,
        filesValidated: files.length,
        validatedAt: new Date().toISOString(),
        validationFrameworkVersion: '1.0.0'
      };

      // Cache results
      this.cache.set(cacheKey, {
        results: formattedResults,
        timestamp: Date.now()
      });

      return formattedResults;

    } catch (error) {
      console.error('Error validating DAK:', error);
      return {
        error: `Validation failed: ${error.message}`,
        summary: { error: 1, warning: 0, info: 0 },
        byComponent: {},
        byFile: {},
        canSave: false,
        total: 1
      };
    }
  }

  /**
   * Validate a specific DAK component
   */
  async validateComponent(component, files, options = {}) {
    if (!DAK_COMPONENTS[component]) {
      throw new Error(`Unknown DAK component: ${component}`);
    }

    try {
      // Create validation context
      const context = {
        component,
        dakFiles: files,
        ...options.context
      };

      const results = await this.registry.validateByComponent(component, files, context);
      return this.registry.formatResults(results);

    } catch (error) {
      console.error(`Error validating component ${component}:`, error);
      return {
        error: `Component validation failed: ${error.message}`,
        summary: { error: 1, warning: 0, info: 0 },
        byComponent: {},
        byFile: {},
        canSave: false,
        total: 1
      };
    }
  }

  /**
   * Validate a single file
   */
  async validateFile(filePath, content, options = {}) {
    try {
      const context = {
        ...options.context
      };

      const results = await this.registry.validateFile(filePath, content, context);
      return this.registry.formatResults(results);

    } catch (error) {
      console.error(`Error validating file ${filePath}:`, error);
      return {
        error: `File validation failed: ${error.message}`,
        summary: { error: 1, warning: 0, info: 0 },
        byComponent: {},
        byFile: {},
        canSave: false,
        total: 1
      };
    }
  }

  /**
   * Validate staging ground files
   */
  async validateStagingGround(stagingGround, options = {}) {
    try {
      const files = stagingGround.files || [];
      
      // Create validation context
      const context = {
        stagingGround: true,
        dakFiles: files,
        ...options.context
      };

      const allResults = [];
      
      for (const file of files) {
        const fileResults = await this.registry.validateFile(file.path, file.content, context);
        allResults.push(...fileResults);
      }

      const formattedResults = this.registry.formatResults(allResults);
      
      // Add staging ground metadata
      formattedResults.metadata = {
        stagingGround: true,
        filesValidated: files.length,
        validatedAt: new Date().toISOString(),
        canUpload: formattedResults.canSave
      };

      return formattedResults;

    } catch (error) {
      console.error('Error validating staging ground:', error);
      return {
        error: `Staging ground validation failed: ${error.message}`,
        summary: { error: 1, warning: 0, info: 0 },
        byComponent: {},
        byFile: {},
        canSave: false,
        total: 1
      };
    }
  }

  /**
   * Get validation summary for dashboard display
   */
  getValidationSummary() {
    return this.registry.getComponentSummary();
  }

  /**
   * Get available validations for a component
   */
  getValidationsForComponent(component) {
    return this.registry.getValidationsForComponent(component);
  }

  /**
   * Run specific validation by ID
   */
  async runValidation(validationId, filePath, content, context = {}) {
    const validation = this.registry.getValidation(validationId);
    
    if (!validation) {
      throw new Error(`Validation not found: ${validationId}`);
    }

    try {
      const result = await validation.validate(filePath, content, context);
      
      if (result) {
        return {
          validationId: validation.id,
          component: validation.component,
          level: validation.level,
          description: validation.description,
          filePath: filePath,
          ...result
        };
      }

      return null; // Validation passed
      
    } catch (error) {
      console.error(`Error running validation ${validationId}:`, error);
      return {
        validationId: validation.id,
        component: validation.component,
        level: VALIDATION_LEVELS.ERROR,
        description: 'Validation execution failed',
        filePath: filePath,
        message: `Validation error: ${error.message}`,
        suggestion: 'Contact support if this error persists'
      };
    }
  }

  /**
   * Check if files can be saved (no error-level violations)
   */
  async canSaveFiles(files, context = {}) {
    const allResults = [];
    
    for (const file of files) {
      const fileResults = await this.registry.validateFile(file.path, file.content, context);
      allResults.push(...fileResults);
    }

    return this.registry.canSave(allResults);
  }

  /**
   * Get real-time validation for editor
   */
  async getEditorValidation(filePath, content, component, context = {}) {
    const fileExtension = this.getFileExtension(filePath);
    
    // Get relevant validations for this file and component
    const componentValidations = this.registry.getValidationsForComponent(component);
    const fileTypeValidations = this.registry.getValidationsForFileType(fileExtension);
    
    // Combine and deduplicate
    const relevantValidations = new Set([...componentValidations, ...fileTypeValidations]);
    
    const results = [];
    
    for (const validation of relevantValidations) {
      try {
        const result = await validation.validate(filePath, content, context);
        
        if (result) {
          results.push({
            validationId: validation.id,
            component: validation.component,
            level: validation.level,
            description: validation.description,
            filePath: filePath,
            ...result
          });
        }
      } catch (error) {
        console.error(`Error in editor validation ${validation.id}:`, error);
        // Don't add error results in real-time validation to avoid noise
      }
    }

    return results;
  }

  /**
   * Get DAK files from repository
   */
  async getDAKFiles(owner, repo, branch = 'main') {
    try {
      if (!githubService.isAuth()) {
        throw new Error('GitHub authentication required');
      }

      // Get repository tree
      const tree = await githubService.getRepositoryTree(owner, repo, branch);
      
      if (!tree || !tree.tree) {
        throw new Error('Could not retrieve repository tree');
      }

      // Filter for relevant files and get their contents
      const relevantFiles = tree.tree.filter(item => 
        item.type === 'blob' && this.isRelevantFile(item.path)
      );

      const files = [];
      
      // Get file contents (limit to reasonable number to avoid rate limits)
      const maxFiles = 100;
      const filesToProcess = relevantFiles.slice(0, maxFiles);
      
      for (const file of filesToProcess) {
        try {
          const content = await githubService.getFileContent(owner, repo, file.path, branch);
          
          if (content) {
            files.push({
              path: file.path,
              content: content,
              size: file.size,
              sha: file.sha
            });
          }
        } catch (error) {
          console.warn(`Could not get content for ${file.path}:`, error.message);
        }
      }

      return files;

    } catch (error) {
      console.error('Error getting DAK files:', error);
      throw error;
    }
  }

  /**
   * Check if file is relevant for validation
   */
  isRelevantFile(filePath) {
    // Skip hidden files and directories
    if (filePath.startsWith('.') && filePath !== '.gitignore') {
      return false;
    }

    // Skip node_modules and other build directories
    if (filePath.includes('node_modules/') || 
        filePath.includes('build/') || 
        filePath.includes('dist/') ||
        filePath.includes('.git/')) {
      return false;
    }

    // Include specific file types
    const relevantExtensions = [
      'yaml', 'yml', 'json', 'xml', 'bpmn', 'dmn', 
      'md', 'txt', 'fsh', 'feature', 'js', 'ts'
    ];

    const extension = this.getFileExtension(filePath);
    return relevantExtensions.includes(extension) || 
           filePath === 'sushi-config.yaml' ||
           filePath === 'README.md';
  }

  /**
   * Get file extension
   */
  getFileExtension(filePath) {
    const parts = filePath.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const enhancedDAKValidationService = new EnhancedDAKValidationService();

export default enhancedDAKValidationService;