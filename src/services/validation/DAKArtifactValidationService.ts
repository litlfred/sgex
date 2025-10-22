/**
 * DAK Artifact Validation Service
 * 
 * Main orchestration service for validating WHO SMART Guidelines DAK artifacts.
 * Supports validation of:
 * - Individual files (staging ground, component editors)
 * - Complete repositories (validation reports)
 * - Component-specific validation (business processes, decision logic, etc.)
 * 
 * @module validation/DAKArtifactValidationService
 */

import {
  ValidationRule,
  FileValidationResult,
  DAKValidationReport,
  ValidationViolation,
  ComponentValidationOptions,
  SaveWithOverrideRequest
} from './types';
import { ValidationRuleRegistry } from './ValidationRuleRegistry';
import { ValidationContext } from './ValidationContext';

/**
 * DAK Artifact Validation Service
 * 
 * @openapi
 * components:
 *   schemas:
 *     DAKValidationReport:
 *       type: object
 *       required:
 *         - repository
 *         - timestamp
 *         - summary
 *         - fileResults
 *         - canSave
 *       properties:
 *         repository:
 *           type: object
 *           properties:
 *             owner:
 *               type: string
 *             repo:
 *               type: string
 *             branch:
 *               type: string
 */
export class DAKArtifactValidationService {
  private registry: ValidationRuleRegistry;
  private context: ValidationContext;

  constructor(
    registry: ValidationRuleRegistry,
    context: ValidationContext
  ) {
    this.registry = registry;
    this.context = context;
  }

  /**
   * Validate a single artifact file
   * 
   * @param filePath - Path to file
   * @param content - File content
   * @param fileType - File type/extension (e.g., 'bpmn', 'dmn', 'json')
   * @param component - DAK component type (e.g., 'business-processes')
   * @returns File validation result
   * 
   * @openapi
   * /api/validation/validate-file:
   *   post:
   *     summary: Validate a single file
   *     tags: [Validation]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - filePath
   *               - content
   *               - fileType
   *               - component
   *     responses:
   *       200:
   *         description: Validation result
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FileValidationResult'
   */
  async validateFile(
    filePath: string,
    content: string,
    fileType: string,
    component: string
  ): Promise<FileValidationResult> {
    const startTime = Date.now();
    const violations: ValidationViolation[] = [];

    // Get applicable rules for this file type
    const rules = this.registry.getRulesByFileType(fileType);

    // Run each validation rule
    for (const rule of rules) {
      try {
        const ruleViolations = await rule.validate(filePath, content, this.context);
        violations.push(...ruleViolations);
      } catch (error) {
        // If a validation rule throws an error, record it as a violation
        violations.push({
          ruleCode: rule.metadata.code,
          level: 'error',
          message: `Validation rule error: ${error instanceof Error ? error.message : String(error)}`,
          filePath,
          suggestion: 'This may indicate a problem with the validation rule or file content'
        });
      }
    }

    // Calculate counts by level
    const errorCount = violations.filter(v => v.level === 'error').length;
    const warningCount = violations.filter(v => v.level === 'warning').length;
    const infoCount = violations.filter(v => v.level === 'info').length;

    return {
      filePath,
      fileType,
      component,
      violations,
      isValid: errorCount === 0,
      errorCount,
      warningCount,
      infoCount,
      timestamp: new Date(),
      duration: Date.now() - startTime
    };
  }

  /**
   * Validate multiple files (e.g., staging ground)
   * 
   * @param files - Array of files to validate
   * @returns Array of file validation results
   * 
   * @openapi
   * /api/validation/validate-files:
   *   post:
   *     summary: Validate multiple files
   *     tags: [Validation]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - files
   *             properties:
   *               files:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - path
   *                     - content
   *                     - fileType
   *                     - component
   */
  async validateFiles(
    files: Array<{
      path: string;
      content: string;
      fileType: string;
      component: string;
    }>
  ): Promise<FileValidationResult[]> {
    const results: FileValidationResult[] = [];

    // Validate files in parallel for better performance
    const validationPromises = files.map(file =>
      this.validateFile(file.path, file.content, file.fileType, file.component)
    );

    const fileResults = await Promise.all(validationPromises);
    results.push(...fileResults);

    return results;
  }

  /**
   * Validate an entire DAK repository
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param branch - Branch name
   * @param options - Validation options
   * @returns Complete DAK validation report
   * 
   * @openapi
   * /api/validation/validate-repository:
   *   post:
   *     summary: Validate entire repository
   *     tags: [Validation]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - owner
   *               - repo
   *               - branch
   */
  async validateRepository(
    owner: string,
    repo: string,
    branch: string,
    options?: ComponentValidationOptions
  ): Promise<DAKValidationReport> {
    const startTime = Date.now();

    // Set repository context
    this.context.setRepositoryContext({ owner, repo, branch });

    try {
      // Get all files from repository using githubService
      const files = await this.context.getRepositoryFiles(owner, repo, branch);
      
      // Filter files based on component if specified
      const filesToValidate = options?.component
        ? files.filter(file => this.isComponentFile(file.path, options.component))
        : files;

      // Validate all files
      const fileResults = await this.validateFiles(
        filesToValidate.map(file => ({
          path: file.path,
          content: file.content,
          fileType: this.getFileType(file.path),
          component: this.getComponentFromPath(file.path)
        }))
      );

      // Calculate summary
      const summary = this.calculateSummary(fileResults);

      return {
        repository: { owner, repo, branch },
        timestamp: new Date(),
        summary,
        fileResults,
        canSave: summary.filesWithErrors === 0,
        duration: Date.now() - startTime
      };
    } catch (error) {
      // If repository access fails, return report with error
      console.error('Repository validation failed:', error);
      return {
        repository: { owner, repo, branch },
        timestamp: new Date(),
        summary: {
          totalFiles: 0,
          validFiles: 0,
          filesWithErrors: 0,
          filesWithWarnings: 0,
          totalErrors: 0,
          totalWarnings: 0,
          totalInfo: 0
        },
        fileResults: [],
        canSave: false,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Validate specific DAK component
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param branch - Branch name
   * @param component - Component type (e.g., 'business-processes')
   * @param options - Additional validation options
   * @returns Validation results for component files
   */
  async validateComponent(
    owner: string,
    repo: string,
    branch: string,
    component: string,
    options?: Omit<ComponentValidationOptions, 'component'>
  ): Promise<FileValidationResult[]> {
    // Set repository context
    this.context.setRepositoryContext({ owner, repo, branch });

    try {
      // Get all files from repository
      const files = await this.context.getRepositoryFiles(owner, repo, branch);
      
      // Filter to only component files
      const componentFiles = files.filter(file => this.isComponentFile(file.path, component));

      // Validate component files
      const fileResults = await this.validateFiles(
        componentFiles.map(file => ({
          path: file.path,
          content: file.content,
          fileType: this.getFileType(file.path),
          component: component
        }))
      );

      return fileResults;
    } catch (error) {
      console.error('Component validation failed:', error);
      return [];
    }
  }

  /**
   * Validate staging ground files before save
   * 
   * @param files - Files to validate
   * @returns Validation report
   */
  async validateStagingGround(
    files: Array<{
      path: string;
      content: string;
      fileType: string;
      component: string;
    }>
  ): Promise<DAKValidationReport> {
    const startTime = Date.now();

    // Validate all files
    const fileResults = await this.validateFiles(files);

    // Calculate summary
    const summary = this.calculateSummary(fileResults);

    return {
      repository: {
        owner: 'staging',
        repo: 'staging',
        branch: 'staging'
      },
      timestamp: new Date(),
      summary,
      fileResults,
      canSave: summary.filesWithErrors === 0,
      duration: Date.now() - startTime
    };
  }

  /**
   * Save files with error override
   * User provides explanation to override error-level violations
   * 
   * @param request - Save with override request
   * @returns Success status
   */
  async saveWithOverride(request: SaveWithOverrideRequest): Promise<boolean> {
    // Validate explanation length
    if (request.explanation.length < 10) {
      throw new Error('Override explanation must be at least 10 characters');
    }

    // Validate that files have validation errors to override
    if (request.validationReport.summary.totalErrors === 0) {
      throw new Error('No validation errors to override. Use normal save instead.');
    }

    // Create override metadata record
    const overrideRecord = {
      timestamp: new Date().toISOString(),
      user: request.user,
      explanation: request.explanation,
      commitMessage: request.commitMessage,
      validationErrors: request.validationReport.summary.totalErrors,
      validationWarnings: request.validationReport.summary.totalWarnings,
      filesAffected: request.files.length,
      fileList: request.files.map(f => f.path),
      violationSummary: request.validationReport.fileResults.map(fr => ({
        path: fr.filePath,
        errorCount: fr.violations.filter(v => v.level === 'error').length,
        warningCount: fr.violations.filter(v => v.level === 'warning').length
      }))
    };

    // Log override for audit trail (in production, this should go to a proper audit log)
    console.log('Validation override authorized:', overrideRecord);

    // Store override metadata in localStorage for audit purposes
    try {
      const overrideHistory = JSON.parse(localStorage.getItem('sgex_validation_overrides') || '[]');
      overrideHistory.push(overrideRecord);
      // Keep only last 100 overrides
      if (overrideHistory.length > 100) {
        overrideHistory.shift();
      }
      localStorage.setItem('sgex_validation_overrides', JSON.stringify(overrideHistory));
    } catch (error) {
      console.warn('Failed to store override in audit log:', error);
    }

    // Note: The actual file saving should be handled by the calling code (e.g., stagingGroundService)
    // after this method returns true. This method only validates and records the override decision.
    // The commit message should include the override explanation from the request.

    return true;
  }

  /**
   * Check if save is allowed (no error-level violations)
   * 
   * @param report - Validation report
   * @returns true if save is allowed
   */
  canSave(report: DAKValidationReport): boolean {
    return report.canSave;
  }

  /**
   * Get file type from file path
   * 
   * @param filePath - File path
   * @returns File type/extension
   */
  private getFileType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  /**
   * Get DAK component from file path
   * 
   * @param filePath - File path
   * @returns DAK component type
   */
  private getComponentFromPath(filePath: string): string {
    const path = filePath.toLowerCase();
    
    // Map directory patterns to DAK components
    if (path.includes('/bpmn/') || path.endsWith('.bpmn')) {
      return 'business-processes';
    } else if (path.includes('/dmn/') || path.endsWith('.dmn')) {
      return 'decision-logic';
    } else if (path.includes('/fsh/') || path.endsWith('.fsh')) {
      return 'fhir-profiles';
    } else if (path.includes('/questionnaires/') || path.includes('/forms/')) {
      return 'data-entry-forms';
    } else if (path.includes('/valuesets/') || path.includes('/codesystems/')) {
      return 'terminology';
    } else if (path.includes('sushi-config.yaml') || path.includes('dak.json')) {
      return 'dak-config';
    }
    
    return 'unknown';
  }

  /**
   * Check if file belongs to specified component
   * 
   * @param filePath - File path
   * @param component - DAK component type
   * @returns true if file belongs to component
   */
  private isComponentFile(filePath: string, component: string): boolean {
    const fileComponent = this.getComponentFromPath(filePath);
    
    // Map component names to patterns
    const componentMap: Record<string, string[]> = {
      'business-processes': ['business-processes'],
      'decision-logic': ['decision-logic'],
      'fhir-profiles': ['fhir-profiles'],
      'dak-config': ['dak-config'],
      'data-entry-forms': ['data-entry-forms'],
      'terminology': ['terminology']
    };
    
    const validComponents = componentMap[component] || [component];
    return validComponents.includes(fileComponent);
  }

  /**
   * Calculate summary statistics from file results
   * 
   * @param fileResults - Array of file validation results
   * @returns Summary statistics
   */
  private calculateSummary(fileResults: FileValidationResult[]) {
    return {
      totalFiles: fileResults.length,
      validFiles: fileResults.filter(r => r.isValid).length,
      filesWithErrors: fileResults.filter(r => r.errorCount > 0).length,
      filesWithWarnings: fileResults.filter(r => r.warningCount > 0).length,
      totalErrors: fileResults.reduce((sum, r) => sum + r.errorCount, 0),
      totalWarnings: fileResults.reduce((sum, r) => sum + r.warningCount, 0),
      totalInfo: fileResults.reduce((sum, r) => sum + r.infoCount, 0)
    };
  }

  /**
   * Get validation statistics
   * 
   * @returns Validation service statistics
   */
  getStatistics() {
    return {
      registeredRules: this.registry.getStatistics().totalRules,
      cacheSize: 0 // TODO: Implement cache tracking
    };
  }
}

// Export singleton instance factory
export function createDAKArtifactValidationService(
  registry: ValidationRuleRegistry,
  context: ValidationContext
): DAKArtifactValidationService {
  return new DAKArtifactValidationService(registry, context);
}
