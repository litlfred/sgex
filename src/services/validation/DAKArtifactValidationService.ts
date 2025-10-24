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
      // List all files in the repository
      const allFiles = await this.context.listFiles('**/*');
      
      // Filter files to only those we can validate
      const validatableFiles = allFiles.filter(path => {
        const ext = path.split('.').pop()?.toLowerCase();
        return ext && ['bpmn', 'dmn', 'xml', 'json', 'yaml', 'yml', 'fsh'].includes(ext);
      });

      // Determine component and fileType for each file
      const filesToValidate = validatableFiles.map(path => {
        const ext = path.split('.').pop()?.toLowerCase() || '';
        let component = 'general';
        let fileType = ext;

        // Determine component based on path
        if (path.includes('/input/') || path.includes('\\input\\')) {
          if (path.includes('/vocabulary/') || ext === 'fsh') {
            component = 'terminology';
            fileType = 'fsh';
          } else if (path.includes('/profiles/')) {
            component = 'fhir-profiles';
          } else if (path.includes('/extensions/')) {
            component = 'fhir-extensions';
          }
        } else if (path.includes('/business-processes/') || ext === 'bpmn') {
          component = 'business-processes';
          fileType = 'bpmn';
        } else if (path.includes('/decision-logic/') || ext === 'dmn') {
          component = 'decision-logic';
          fileType = 'dmn';
        }

        // Check if we should skip this file based on component filter
        if (options?.component && component !== options.component) {
          return null;
        }

        return { path, fileType, component };
      }).filter((file): file is { path: string; fileType: string; component: string } => file !== null);

      // Fetch and validate files
      const fileResults: FileValidationResult[] = [];
      
      for (const file of filesToValidate) {
        try {
          const content = await this.context.getFileContent(file.path);
          const result = await this.validateFile(file.path, content, file.fileType, file.component);
          fileResults.push(result);
        } catch (error) {
          console.error(`Error validating file ${file.path}:`, error);
          // Add error as validation result
          fileResults.push({
            filePath: file.path,
            fileType: file.fileType,
            component: file.component,
            violations: [{
              ruleCode: 'FILE-ACCESS-ERROR',
              level: 'error',
              message: `Failed to access file: ${error instanceof Error ? error.message : String(error)}`,
              filePath: file.path
            }],
            isValid: false,
            errorCount: 1,
            warningCount: 0,
            infoCount: 0,
            timestamp: new Date()
          });
        }
      }

      // Calculate summary
      const summary = this.calculateSummary(fileResults);
      const isValid = summary.filesWithErrors === 0;

      return {
        repository: { owner, repo, branch },
        timestamp: new Date(),
        summary,
        fileResults,
        isValid,
        canSave: summary.filesWithErrors === 0,
        duration: Date.now() - startTime
      };
    } catch (error) {
      console.error('Error validating repository:', error);
      // Return error report
      return {
        repository: { owner, repo, branch },
        timestamp: new Date(),
        summary: {
          totalFiles: 0,
          validFiles: 0,
          filesWithErrors: 1,
          filesWithWarnings: 0,
          totalErrors: 1,
          totalWarnings: 0,
          totalInfo: 0
        },
        fileResults: [{
          filePath: 'repository',
          fileType: 'unknown',
          component: 'general',
          violations: [{
            ruleCode: 'REPOSITORY-ACCESS-ERROR',
            level: 'error',
            message: `Failed to access repository: ${error instanceof Error ? error.message : String(error)}`,
            filePath: 'repository'
          }],
          isValid: false,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
          timestamp: new Date()
        }],
        isValid: false,
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

    // Get rules for this component
    const componentRules = this.registry.getRulesByComponent(component);

    // TODO: Integrate with githubService to list component files
    // For now, return empty array as placeholder
    return [];
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
    const isValid = summary.filesWithErrors === 0;

    return {
      repository: {
        owner: 'staging',
        repo: 'staging',
        branch: 'staging'
      },
      timestamp: new Date(),
      summary,
      fileResults,
      isValid,
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
