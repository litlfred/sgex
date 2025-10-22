/**
 * FHIR FSH Syntax Validation Rule
 * 
 * Validates basic FHIR Shorthand (FSH) file syntax.
 * This ensures FSH files can be processed by the SUSHI compiler.
 * 
 * @module validation/rules/fhir/fshSyntax
 */

import type {
  ValidationRule,
  ValidationViolation,
  ValidationContext as IValidationContext
} from '../../types';

/**
 * FHIR FSH Syntax Validation Rule
 * 
 * @openapi
 * components:
 *   schemas:
 *     FHIRFSHSyntaxRule:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "FHIR-FSH-SYNTAX-001"
 *         level:
 *           type: string
 *           enum: [error]
 *         component:
 *           type: string
 *           example: "fhir-profiles"
 * 
 * @example
 * // Valid FSH file
 * Profile: ANCPatient
 * Parent: Patient
 * * identifier MS
 * * name MS
 */
export const fshSyntaxRule: ValidationRule = {
  metadata: {
    code: 'FHIR-FSH-SYNTAX-001',
    level: 'error',
    component: 'fhir-profiles',
    title: 'FHIR FSH Syntax Valid',
    description: 'FHIR Shorthand (FSH) files SHALL have valid syntax that can be processed by the SUSHI compiler',
    fileTypes: ['fsh']
  },
  
  /**
   * Validate FSH file syntax
   */
  async validate(
    filePath: string,
    content: string,
    context: IValidationContext
  ): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    
    try {
      // Basic FSH syntax validation
      const lines = content.split('\n');
      
      // Track FSH declarations
      let hasDeclaration = false;
      const validDeclarations = [
        'Profile:',
        'Extension:',
        'ValueSet:',
        'CodeSystem:',
        'Instance:',
        'Invariant:',
        'RuleSet:',
        'Mapping:',
        'Logical:',
        'Resource:'
      ];
      
      // Check for at least one FSH declaration
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and comments
        if (line === '' || line.startsWith('//')) {
          continue;
        }
        
        // Check if line starts with a valid declaration
        if (validDeclarations.some(decl => line.startsWith(decl))) {
          hasDeclaration = true;
          
          // Validate declaration has a name
          const parts = line.split(':');
          if (parts.length < 2 || parts[1].trim() === '') {
            violations.push({
              ruleCode: 'FHIR-FSH-SYNTAX-001',
              level: 'error',
              message: `FSH declaration is missing a name`,
              filePath,
              line: i + 1,
              suggestion: 'Add a name after the colon (e.g., "Profile: MyProfile")',
              context: {
                lineContent: line
              }
            });
          }
        }
        
        // Check for common syntax errors
        
        // Unclosed strings
        const singleQuotes = (line.match(/'/g) || []).length;
        const doubleQuotes = (line.match(/"/g) || []).length;
        
        if (singleQuotes % 2 !== 0) {
          violations.push({
            ruleCode: 'FHIR-FSH-SYNTAX-001',
            level: 'error',
            message: 'Unclosed single quote in FSH file',
            filePath,
            line: i + 1,
            suggestion: 'Ensure all strings are properly quoted',
            context: {
              lineContent: line
            }
          });
        }
        
        if (doubleQuotes % 2 !== 0) {
          violations.push({
            ruleCode: 'FHIR-FSH-SYNTAX-001',
            level: 'error',
            message: 'Unclosed double quote in FSH file',
            filePath,
            line: i + 1,
            suggestion: 'Ensure all strings are properly quoted',
            context: {
              lineContent: line
            }
          });
        }
        
        // Invalid rule syntax (rules should start with *)
        if (line.startsWith('*') && line.length > 1) {
          const ruleContent = line.substring(1).trim();
          
          // Check if rule has valid format
          if (ruleContent === '') {
            violations.push({
              ruleCode: 'FHIR-FSH-SYNTAX-001',
              level: 'error',
              message: 'Empty FSH rule (line starts with * but has no content)',
              filePath,
              line: i + 1,
              suggestion: 'Add rule content after * (e.g., "* identifier MS")',
              context: {
                lineContent: line
              }
            });
          }
        }
      }
      
      // Check if file has at least one FSH declaration
      if (!hasDeclaration) {
        violations.push({
          ruleCode: 'FHIR-FSH-SYNTAX-001',
          level: 'error',
          message: 'FSH file does not contain any valid FSH declarations (Profile, Extension, ValueSet, etc.)',
          filePath,
          line: 0,
          suggestion: `Start your FSH file with a declaration like:\n\nProfile: MyProfile\nParent: Patient\n* identifier MS`
        });
      }
      
      return violations;
      
    } catch (error) {
      // General error - return as violation
      return [{
        ruleCode: 'FHIR-FSH-SYNTAX-001',
        level: 'error',
        message: `Unexpected error validating FSH file: ${error instanceof Error ? error.message : String(error)}`,
        filePath,
        line: 0,
        suggestion: 'Check file encoding and format'
      }];
    }
  }
};

export default fshSyntaxRule;
