/**
 * Enhanced DAK Validation Service (TypeScript)
 * 
 * Main orchestrator for the DAK Validation Framework.
 * Provides high-level validation APIs for DAK repositories, components, and files.
 */

import dakValidationRegistry, { DAK_COMPONENTS, VALIDATION_LEVELS } from './dakValidationRegistry';
import githubService from './githubService';
import { 
  FormattedValidationResults, 
  ValidationContext, 
  DAKFile, 
  DAKValidationResult,
  ComponentSummary 
} from '../types/core';

interface ValidationCacheEntry {
  results: FormattedValidationResults;
  timestamp: number;
}

interface ValidateDAKOptions {
  forceRefresh?: boolean;
  context?: ValidationContext;
}

interface ValidateComponentOptions {
  context?: ValidationContext;
}

interface ValidateFileOptions {
  context?: ValidationContext;
}

interface ValidateStagingGroundOptions {
  context?: ValidationContext;
}

interface StagingGround {
  files?: DAKFile[];
  [key: string]: any;
}

class EnhancedDAKValidationService {
  private registry = dakValidationRegistry;
  private cache = new Map<string, ValidationCacheEntry>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Validate an entire DAK repository
   */
  async validateDAK(owner: string, repo: string, branch: string = 'main', options: ValidateDAKOptions = {}): Promise<FormattedValidationResults> {
    const cacheKey = `${owner}/${repo}/${branch}`;
    
    // Check cache if not forcing refresh
    if (!options.forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
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
      const context: ValidationContext = {
        owner,
        repo,
        branch,
        dakFiles: files,
        githubService: githubService,
        ...options.context
      };

      // Run all validations
      const allResults: DAKValidationResult[] = [];
      
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

    } catch (error: any) {
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
  async validateComponent(component: string, files: DAKFile[], options: ValidateComponentOptions = {}): Promise<FormattedValidationResults> {
    if (!DAK_COMPONENTS[component]) {
      throw new Error(`Unknown DAK component: ${component}`);
    }

    try {
      // Create validation context
      const context: ValidationContext = {
        component,
        dakFiles: files,
        ...options.context
      };

      const results = await this.registry.validateByComponent(component, files, context);
      return this.registry.formatResults(results);

    } catch (error: any) {
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
  async validateFile(filePath: string, content: string, options: ValidateFileOptions = {}): Promise<FormattedValidationResults> {
    try {
      const context: ValidationContext = {
        ...options.context
      };

      const results = await this.registry.validateFile(filePath, content, context);
      return this.registry.formatResults(results);

    } catch (error: any) {
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
  async validateStagingGround(stagingGround: StagingGround, options: ValidateStagingGroundOptions = {}): Promise<FormattedValidationResults> {
    try {
      const files = stagingGround.files || [];
      
      // Create validation context
      const context: ValidationContext = {
        stagingGround: true,
        dakFiles: files,
        ...options.context
      };

      const allResults: DAKValidationResult[] = [];
      
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

    } catch (error: any) {
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
  getValidationSummary(): ComponentSummary {
    return this.registry.getComponentSummary();
  }

  /**
   * Get available validations for a component
   */
  getValidationsForComponent(component: string) {
    return this.registry.getValidationsForComponent(component);
  }

  /**
   * Run specific validation by ID
   */
  async runValidation(validationId: string, filePath: string, content: string, context: ValidationContext = {}): Promise<DAKValidationResult | null> {
    const validation = this.registry.getValidation(validationId);
    
    if (!validation) {
      throw new Error(`Validation not found: ${validationId}`);
    }

    try {
      const result = await validation.validate(filePath, content, context);
      return result;
      
    } catch (error: any) {
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
  async canSaveFiles(files: DAKFile[], context: ValidationContext = {}): Promise<boolean> {
    const allResults: DAKValidationResult[] = [];
    
    for (const file of files) {
      const fileResults = await this.registry.validateFile(file.path, file.content, context);
      allResults.push(...fileResults);
    }

    return this.registry.canSave(allResults);
  }

  /**
   * Get real-time validation for editor
   */
  async getEditorValidation(filePath: string, content: string, component: string, context: ValidationContext = {}): Promise<DAKValidationResult[]> {
    const fileExtension = this.getFileExtension(filePath);
    
    // Get relevant validations for this file and component
    const componentValidations = this.registry.getValidationsForComponent(component);
    const fileTypeValidations = this.registry.getValidationsForFileType(fileExtension);
    
    // Combine and deduplicate
    const relevantValidationsSet = new Set([...componentValidations, ...fileTypeValidations]);
    const relevantValidations = Array.from(relevantValidationsSet);
    
    const results: DAKValidationResult[] = [];
    
    for (const validation of relevantValidations) {
      try {
        const result = await validation.validate(filePath, content, context);
        
        if (result) {
          results.push(result);
        }
      } catch (error: any) {
        console.error(`Error in editor validation ${validation.id}:`, error);
        // Don't add error results in real-time validation to avoid noise
      }
    }

    return results;
  }

  /**
   * Get DAK files from repository
   */
  async getDAKFiles(owner: string, repo: string, branch: string = 'main'): Promise<DAKFile[]> {
    try {
      if (!githubService.isAuth()) {
        throw new Error('GitHub authentication required');
      }

      // Get repository contents recursively
      const files: DAKFile[] = [];
      await this.getDAKFilesRecursive(owner, repo, '', branch, files);
      
      return files;

    } catch (error: any) {
      console.error('Error getting DAK files:', error);
      throw error;
    }
  }

  /**
   * Get DAK files recursively from directory
   */
  private async getDAKFilesRecursive(
    owner: string, 
    repo: string, 
    path: string, 
    branch: string, 
    files: DAKFile[]
  ): Promise<void> {
    try {
      const contents = await githubService.getDirectoryContents(owner, repo, path, branch);
      
      for (const item of contents) {
        if (item.type === 'file' && this.isRelevantFile(item.path || item.name)) {
          try {
            const content = await githubService.getFileContent(owner, repo, item.path || item.name, branch);
            
            if (content) {
              files.push({
                path: item.path || item.name,
                content: content,
                size: item.size,
                sha: item.sha
              });
            }
          } catch (error: any) {
            console.warn(`Could not get content for ${item.path || item.name}:`, error.message);
          }
        } else if (item.type === 'dir') {
          // Recursively get files from subdirectory
          await this.getDAKFilesRecursive(owner, repo, item.path || item.name, branch, files);
        }
      }
    } catch (error: any) {
      console.warn(`Could not get directory contents for ${path}:`, error.message);
    }
  }

  /**
   * Check if file is relevant for validation
   */
  private isRelevantFile(filePath: string): boolean {
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
  private getFileExtension(filePath: string): string {
    const parts = filePath.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
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