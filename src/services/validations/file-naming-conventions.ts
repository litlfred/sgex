/**
 * FILE-NAMING-CONVENTIONS Validation (TypeScript)
 * 
 * Files SHALL follow WHO SMART Guidelines naming conventions
 */

import { ValidationDefinition, ValidationContext, DAKValidationResult } from '../../types/core';

// Helper functions for naming validation
const isValidFileName = (fileName: string): boolean => {
  // Check for valid characters (alphanumeric, hyphens, underscores, dots)
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  return validPattern.test(fileName);
};

const isRecommendedNaming = (fileName: string): boolean => {
  // Recommended: lowercase with hyphens
  const recommendedPattern = /^[a-z0-9-]+(\.[a-z0-9]+)*$/;
  return recommendedPattern.test(fileName);
};

const getFileNameFromPath = (filePath: string): string => {
  return filePath.split('/').pop() || filePath;
};

const fileNamingConventions: ValidationDefinition = {
  id: 'file-naming-conventions',
  component: 'file-structure',
  level: 'warning',
  fileTypes: ['*'],
  descriptionKey: 'validation.fileNaming.conventions.description',
  description: 'Files SHALL follow WHO SMART Guidelines naming conventions',
  
  async validate(filePath: string, content: string, context: ValidationContext): Promise<DAKValidationResult | null> {
    const fileName = getFileNameFromPath(filePath);
    
    // Skip validation for certain system files
    const skipFiles = ['.gitignore', '.npmignore', '.env', '.env.local', '.env.development', '.env.production'];
    if (skipFiles.includes(fileName)) {
      return null;
    }
    
    // Skip hidden files and directories
    if (fileName.startsWith('.') && !skipFiles.includes(fileName)) {
      return null;
    }
    
    try {
      // Check for invalid characters
      if (!isValidFileName(fileName)) {
        return {
          validationId: 'file-naming-conventions',
          component: 'file-structure',
          level: 'error',
          description: 'Files SHALL follow WHO SMART Guidelines naming conventions',
          filePath,
          message: 'File name contains invalid characters',
          line: 1,
          column: 1,
          suggestion: 'Use only alphanumeric characters, hyphens, underscores, and dots in file names'
        };
      }
      
      // Check for spaces in file name
      if (fileName.includes(' ')) {
        return {
          validationId: 'file-naming-conventions',
          component: 'file-structure',
          level: 'error',
          description: 'Files SHALL follow WHO SMART Guidelines naming conventions',
          filePath,
          message: 'File name contains spaces',
          line: 1,
          column: 1,
          suggestion: 'Replace spaces with hyphens or underscores'
        };
      }
      
      // Check for uppercase letters (warning level)
      if (!isRecommendedNaming(fileName)) {
        const hasUppercase = /[A-Z]/.test(fileName);
        const hasUnderscore = fileName.includes('_');
        
        let message = 'File name does not follow recommended naming conventions';
        let suggestion = 'Use lowercase letters with hyphens for better consistency';
        
        if (hasUppercase) {
          message = 'File name contains uppercase letters';
          suggestion = 'Convert to lowercase for better consistency with WHO SMART Guidelines';
        } else if (hasUnderscore) {
          message = 'File name uses underscores instead of hyphens';
          suggestion = 'Consider using hyphens instead of underscores for consistency';
        }
        
        return {
          validationId: 'file-naming-conventions',
          component: 'file-structure',
          level: 'warning',
          description: 'Files SHALL follow WHO SMART Guidelines naming conventions',
          filePath,
          message,
          line: 1,
          column: 1,
          suggestion
        };
      }
      
      return null; // Valid naming
      
    } catch (error: any) {
      return {
        validationId: 'file-naming-conventions',
        component: 'file-structure',
        level: 'error',
        description: 'Files SHALL follow WHO SMART Guidelines naming conventions',
        filePath,
        message: `Error validating file name: ${error.message}`,
        line: 1,
        column: 1,
        suggestion: 'Check file name format and characters'
      };
    }
  }
};

// Add metadata for reference
export const metadata = {
  standard: 'WHO SMART Guidelines',
  reference: 'https://smart.who.int/ig-starter-kit/file_naming.html',
  severity: 'medium'
};

export default fileNamingConventions;