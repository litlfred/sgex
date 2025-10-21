/**
 * Service Integration Module
 * 
 * Integrates the DAK Validation Framework with existing SGeX services.
 * Provides bridge functions for GitHub, Staging Ground, and DAK Compliance services.
 * 
 * @module validation/integration
 */

import type { DAKArtifactValidationService } from './DAKArtifactValidationService';
import type { DAKValidationReport, ComponentValidationOptions, FileValidationResult } from './types';

/**
 * Integration result
 */
export interface IntegrationResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Integrate validation service with GitHub service
 * 
 * @param githubService - GitHub service instance
 * @param validationService - DAK artifact validation service
 * @returns Integration result
 */
export function integrateWithGitHub(
  githubService: any,
  validationService: DAKArtifactValidationService
): IntegrationResult {
  try {
    // Add validation methods to GitHub service prototype
    if (!githubService.validateRepository) {
      githubService.validateRepository = async function(
        owner: string,
        repo: string,
        branch: string = 'main',
        options?: ComponentValidationOptions
      ): Promise<DAKValidationReport> {
        return await validationService.validateRepository(owner, repo, branch, options);
      };
    }
    
    if (!githubService.validateComponent) {
      githubService.validateComponent = async function(
        owner: string,
        repo: string,
        branch: string,
        component: string,
        options?: ComponentValidationOptions
      ): Promise<FileValidationResult[]> {
        return await validationService.validateComponent(owner, repo, branch, component, options);
      };
    }
    
    return {
      success: true,
      message: 'Successfully integrated validation service with GitHub service'
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to integrate with GitHub service: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
}

/**
 * Integrate validation service with Staging Ground service
 * 
 * @param stagingService - Staging ground service instance
 * @param validationService - DAK artifact validation service
 * @returns Integration result
 */
export function integrateWithStagingGround(
  stagingService: any,
  validationService: DAKArtifactValidationService
): IntegrationResult {
  try {
    // Add validation method to staging ground service
    if (!stagingService.validateStagingGround) {
      stagingService.validateStagingGround = async function(): Promise<DAKValidationReport> {
        const stagingGround = stagingService.getStagingGround();
        const files = stagingGround.files.map((file: any) => ({
          path: file.path,
          content: file.content,
          metadata: file.metadata
        }));
        
        return await validationService.validateStagingGround(files);
      };
    }
    
    // Add canSave validation check
    if (!stagingService.canSaveWithValidation) {
      stagingService.canSaveWithValidation = async function(): Promise<{
        canSave: boolean;
        report: DAKValidationReport;
      }> {
        const report = await stagingService.validateStagingGround();
        const canSave = validationService.canSave(report);
        
        return { canSave, report };
      };
    }
    
    // Add save with override support
    if (!stagingService.saveWithOverride) {
      stagingService.saveWithOverride = async function(
        explanation: string,
        commitMessage: string
      ): Promise<any> {
        const stagingGround = stagingService.getStagingGround();
        const files = stagingGround.files.map((file: any) => ({
          path: file.path,
          content: file.content,
          metadata: file.metadata
        }));
        
        // Create a minimal validation report for the override
        const minimalReport: DAKValidationReport = {
          repository: {
            owner: '',
            repo: '',
            branch: ''
          },
          timestamp: new Date(),
          summary: {
            totalFiles: files.length,
            validFiles: 0,
            filesWithErrors: files.length,
            filesWithWarnings: 0,
            totalErrors: 1,
            totalWarnings: 0,
            totalInfo: 0
          },
          fileResults: [],
          canSave: false
        };
        
        const result = await validationService.saveWithOverride({
          files,
          explanation,
          commitMessage,
          user: 'DAK Author <author@example.com>',
          validationReport: minimalReport
        });
        
        return result;
      };
    }
    
    return {
      success: true,
      message: 'Successfully integrated validation service with Staging Ground service'
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to integrate with Staging Ground service: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
}

/**
 * Integrate validation service with DAK Compliance service
 * 
 * @param complianceService - DAK compliance service instance
 * @param validationService - DAK artifact validation service
 * @returns Integration result
 */
export function integrateWithDAKCompliance(
  complianceService: any,
  validationService: DAKArtifactValidationService
): IntegrationResult {
  try {
    // Bridge existing compliance service validators with new validation framework
    // This allows gradual migration of existing validators to the new system
    
    if (!complianceService.useNewValidationFramework) {
      complianceService.useNewValidationFramework = true;
      
      // Store reference to new validation service
      complianceService._dakValidationService = validationService;
      
      // Add method to run both old and new validators
      complianceService.validateWithBothFrameworks = async function(
        filePath: string,
        content: string,
        fileType: string,
        component?: string
      ): Promise<{
        oldFramework: any;
        newFramework: FileValidationResult;
      }> {
        // Run old framework validation
        const oldResult = await complianceService.validateFile(filePath, content);
        
        // Run new framework validation
        const newResult = await validationService.validateFile(filePath, content, fileType, component || 'unknown');
        
        return {
          oldFramework: oldResult,
          newFramework: newResult
        };
      };
    }
    
    return {
      success: true,
      message: 'Successfully integrated validation service with DAK Compliance service'
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to integrate with DAK Compliance service: ${error instanceof Error ? error.message : String(error)}`,
      details: error
    };
  }
}

/**
 * Validate repository files using GitHub service
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name
 * @param options - Validation options
 * @returns Validation report
 */
export async function validateRepositoryFiles(
  owner: string,
  repo: string,
  branch: string = 'main',
  options?: ComponentValidationOptions
): Promise<DAKValidationReport> {
  // This function is provided as a convenience for direct validation
  // without requiring service integration
  const { dakArtifactValidationService } = await import('./index');
  
  return await dakArtifactValidationService.validateRepository(owner, repo, branch, options);
}

/**
 * Validate staged files
 * 
 * @param files - Array of staged files
 * @param options - Validation options
 * @returns Validation report
 */
export async function validateStagedFiles(
  files: Array<{ path: string; content: string; metadata?: any }>,
  options?: ComponentValidationOptions
): Promise<DAKValidationReport> {
  // This function is provided as a convenience for direct validation
  // without requiring service integration
  const { dakArtifactValidationService } = await import('./index');
  
  // Map files to include required fileType and component fields
  const mappedFiles = files.map(file => ({
    path: file.path,
    content: file.content,
    fileType: file.path.split('.').pop() || 'unknown',
    component: file.metadata?.component || 'unknown'
  }));
  
  return await dakArtifactValidationService.validateStagingGround(mappedFiles);
}

/**
 * Initialize all service integrations
 * 
 * @param services - Object containing service instances
 * @returns Object with integration results
 */
export async function initializeAllIntegrations(services: {
  githubService?: any;
  stagingGroundService?: any;
  dakComplianceService?: any;
}): Promise<{
  github?: IntegrationResult;
  stagingGround?: IntegrationResult;
  dakCompliance?: IntegrationResult;
}> {
  const { dakArtifactValidationService } = await import('./index');
  const results: any = {};
  
  if (services.githubService) {
    results.github = integrateWithGitHub(services.githubService, dakArtifactValidationService);
  }
  
  if (services.stagingGroundService) {
    results.stagingGround = integrateWithStagingGround(services.stagingGroundService, dakArtifactValidationService);
  }
  
  if (services.dakComplianceService) {
    results.dakCompliance = integrateWithDAKCompliance(services.dakComplianceService, dakArtifactValidationService);
  }
  
  return results;
}

export default {
  integrateWithGitHub,
  integrateWithStagingGround,
  integrateWithDAKCompliance,
  validateRepositoryFiles,
  validateStagedFiles,
  initializeAllIntegrations
};
