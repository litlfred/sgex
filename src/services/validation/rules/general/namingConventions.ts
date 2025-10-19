/**
 * File Naming Conventions Validation Rule
 * Validates that files follow standard naming conventions
 * 
 * @module rules/general/namingConventions
 */

import { ValidationRule, ValidationViolation, ValidationContext } from '../../types';

/**
 * File Naming Conventions Validation Rule
 * 
 * Rule: FILE-NAMING-001
 * Level: warning
 * Component: general
 * 
 * Description: Files SHOULD follow standard naming conventions.
 * - Use lowercase with hyphens (kebab-case)
 * - Avoid spaces and special characters
 * - Use descriptive names
 * - Match file type conventions
 */
export const namingConventionsRule: ValidationRule = {
  metadata: {
    code: 'FILE-NAMING-001',
    level: 'warning',
    component: 'general',
    title: 'File Naming Conventions',
    description: 'Files SHOULD follow standard naming conventions: lowercase with hyphens (kebab-case), no spaces or special characters',
    fileTypes: ['*'] // Applies to all files
  },
  
  validate: async (
    filePath: string,
    content: string,
    context: ValidationContext
  ): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];
    
    try {
      const fileName = filePath.split('/').pop() || filePath;
      const fileNameWithoutExt = fileName.replace(/\.[^.]+$/, '');
      
      // Check for spaces
      if (fileName.includes(' ')) {
        violations.push({
          ruleCode: 'FILE-NAMING-001',
          level: 'warning',
          message: `File name contains spaces: "${fileName}"`,
          filePath,
          suggestion: 'Replace spaces with hyphens (kebab-case) for better compatibility',
          context: {
            fileName,
            issue: 'spaces',
            suggested: fileName.replace(/ /g, '-')
          }
        });
      }
      
      // Check for uppercase letters
      if (fileNameWithoutExt !== fileNameWithoutExt.toLowerCase()) {
        // Exception: PascalCase is acceptable for FHIR resources
        const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(fileNameWithoutExt);
        const isFHIRFile = filePath.includes('/resources/') || filePath.includes('/profiles/') || filePath.endsWith('.fsh');
        
        if (!isPascalCase || !isFHIRFile) {
          violations.push({
            ruleCode: 'FILE-NAMING-001',
            level: 'info',
            message: `File name contains uppercase letters: "${fileName}"`,
            filePath,
            suggestion: 'Consider using lowercase with hyphens (kebab-case) for consistency',
            context: {
              fileName,
              issue: 'uppercase',
              suggested: fileNameWithoutExt.toLowerCase().replace(/[A-Z]/g, (match, offset) => 
                offset > 0 ? '-' + match.toLowerCase() : match.toLowerCase()
              ) + fileName.substring(fileNameWithoutExt.length)
            }
          });
        }
      }
      
      // Check for special characters
      const specialChars = /[^a-zA-Z0-9.\-_]/g;
      if (specialChars.test(fileName)) {
        const invalidChars = fileName.match(specialChars) || [];
        violations.push({
          ruleCode: 'FILE-NAMING-001',
          level: 'warning',
          message: `File name contains special characters: ${invalidChars.join(', ')}`,
          filePath,
          suggestion: 'Use only alphanumeric characters, hyphens, and underscores',
          context: {
            fileName,
            issue: 'special-characters',
            invalidCharacters: invalidChars,
            suggested: fileName.replace(specialChars, '-')
          }
        });
      }
      
      // Check for very short names
      if (fileNameWithoutExt.length < 3) {
        violations.push({
          ruleCode: 'FILE-NAMING-001',
          level: 'info',
          message: `File name is very short: "${fileName}"`,
          filePath,
          suggestion: 'Use descriptive names that clearly indicate the file content',
          context: {
            fileName,
            issue: 'too-short',
            length: fileNameWithoutExt.length
          }
        });
      }
      
      // Check for very long names
      if (fileNameWithoutExt.length > 50) {
        violations.push({
          ruleCode: 'FILE-NAMING-001',
          level: 'info',
          message: `File name is very long (${fileNameWithoutExt.length} characters)`,
          filePath,
          suggestion: 'Consider using a shorter, more concise name',
          context: {
            fileName,
            issue: 'too-long',
            length: fileNameWithoutExt.length
          }
        });
      }
      
    } catch (error) {
      console.error('Error in file naming conventions validation:', error);
    }
    
    return violations;
  }
};
