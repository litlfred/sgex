/**
 * File Size Validation Rule
 * Validates that files are within reasonable size limits
 * 
 * @module rules/general/fileSize
 */

import { ValidationRule, ValidationViolation, ValidationContext } from '../../types';

/**
 * File Size Validation Rule
 * 
 * Rule: FILE-SIZE-001
 * Level: warning
 * Component: general
 * 
 * Description: Files SHOULD be kept within reasonable size limits for performance.
 * Large files may cause performance issues in browsers and editors.
 * 
 * Limits:
 * - Warning: > 1 MB
 * - Info: > 500 KB
 */
export const fileSizeRule: ValidationRule = {
  metadata: {
    code: 'FILE-SIZE-001',
    level: 'warning',
    component: 'general',
    title: 'File Size Limit',
    description: 'Files SHOULD be kept within reasonable size limits for performance. Large files may cause browser and editor performance issues.',
    fileTypes: ['*'] // Applies to all files
  },
  
  validate: async (
    filePath: string,
    content: string,
    context: ValidationContext
  ): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];
    
    try {
      const sizeInBytes = new Blob([content]).size;
      const sizeInKB = sizeInBytes / 1024;
      const sizeInMB = sizeInKB / 1024;
      
      // Warning threshold: 1 MB
      if (sizeInMB > 1) {
        violations.push({
          ruleCode: 'FILE-SIZE-001',
          level: 'warning',
          message: `File size (${sizeInMB.toFixed(2)} MB) exceeds recommended limit of 1 MB`,
          filePath,
          suggestion: 'Consider splitting large files into smaller components or optimizing content',
          context: {
            sizeBytes: sizeInBytes,
            sizeKB: Math.round(sizeInKB),
            sizeMB: parseFloat(sizeInMB.toFixed(2)),
            threshold: '1 MB',
            type: 'performance'
          }
        });
      }
      // Info threshold: 500 KB
      else if (sizeInKB > 500) {
        violations.push({
          ruleCode: 'FILE-SIZE-001',
          level: 'info',
          message: `File size (${sizeInKB.toFixed(0)} KB) is approaching recommended limit`,
          filePath,
          suggestion: 'Monitor file size growth. Consider optimization if it continues to grow.',
          context: {
            sizeBytes: sizeInBytes,
            sizeKB: Math.round(sizeInKB),
            sizeMB: parseFloat(sizeInMB.toFixed(2)),
            threshold: '500 KB',
            type: 'performance'
          }
        });
      }
      
    } catch (error) {
      console.error('Error in file size validation:', error);
    }
    
    return violations;
  }
};
