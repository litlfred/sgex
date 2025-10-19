/**
 * FHIR FSH Naming Conventions Validation Rule
 * 
 * Validates that FHIR Shorthand (FSH) files follow WHO naming conventions.
 * This ensures consistency across WHO SMART Guidelines implementations.
 * 
 * @module validation/rules/fhir/fshConventions
 */

import type {
  ValidationRule,
  ValidationViolation,
  ValidationContext as IValidationContext
} from '../../types';

/**
 * FHIR FSH Naming Conventions Validation Rule
 * 
 * @openapi
 * components:
 *   schemas:
 *     FHIRFSHConventionsRule:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "FHIR-FSH-CONVENTIONS-001"
 *         level:
 *           type: string
 *           enum: [warning]
 *         component:
 *           type: string
 *           example: "fhir-profiles"
 * 
 * @example
 * // Good naming convention
 * Profile: ANCPatient
 * Extension: ANCContactNumber
 * ValueSet: ANCRecommendations
 * 
 * @example
 * // Poor naming convention (should be warning)
 * Profile: myprofile
 * Extension: ext_anc
 */
export const fshConventionsRule: ValidationRule = {
  metadata: {
    code: 'FHIR-FSH-CONVENTIONS-001',
    level: 'warning',
    component: 'fhir-profiles',
    title: 'FHIR FSH Naming Conventions',
    description: 'FHIR Shorthand (FSH) files SHOULD follow WHO naming conventions with PascalCase for profiles, extensions, and value sets'
  },
  
  /**
   * Validate FSH naming conventions
   */
  async validate(
    filePath: string,
    content: string,
    context: IValidationContext
  ): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    
    try {
      const lines = content.split('\n');
      
      // Check each FSH declaration
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and comments
        if (line === '' || line.startsWith('//')) {
          continue;
        }
        
        // Check Profile, Extension, ValueSet declarations
        const declarationTypes = ['Profile:', 'Extension:', 'ValueSet:', 'CodeSystem:'];
        
        for (const declType of declarationTypes) {
          if (line.startsWith(declType)) {
            const name = line.substring(declType.length).trim();
            
            // Check for PascalCase (starts with capital, no spaces/underscores)
            const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(name);
            
            if (!isPascalCase) {
              let suggestion = '';
              
              if (name.includes('_')) {
                suggestion = `Use PascalCase instead of snake_case: ${name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()).replace(/^[a-z]/, (letter) => letter.toUpperCase())}`;
              } else if (name.includes(' ')) {
                suggestion = `Remove spaces and use PascalCase: ${name.replace(/ /g, '')}`;
              } else if (name.match(/^[a-z]/)) {
                suggestion = `Capitalize first letter: ${name.charAt(0).toUpperCase() + name.slice(1)}`;
              } else {
                suggestion = 'Use PascalCase naming (e.g., ANCPatient, ANCContactNumber)';
              }
              
              violations.push({
                ruleCode: 'FHIR-FSH-CONVENTIONS-001',
                level: 'warning',
                message: `FSH ${declType.slice(0, -1)} name '${name}' does not follow PascalCase convention`,
                filePath,
                line: i + 1,
                suggestion,
                context: {
                  declarationType: declType.slice(0, -1),
                  name
                }
              });
            }
            
            // Check for WHO prefix (optional but recommended)
            const fileName = filePath.split('/').pop() || '';
            const hasWHOPrefix = name.startsWith('WHO') || name.startsWith('SMART');
            
            // Only suggest WHO prefix if file is in a WHO/SMART context
            if (!hasWHOPrefix && (fileName.includes('who') || fileName.includes('smart') || filePath.includes('smart-'))) {
              violations.push({
                ruleCode: 'FHIR-FSH-CONVENTIONS-001',
                level: 'warning',
                message: `FSH ${declType.slice(0, -1)} name '${name}' should consider using WHO or SMART prefix for WHO SMART Guidelines`,
                filePath,
                line: i + 1,
                suggestion: `Consider prefixing with project identifier (e.g., ANC${name}, SMART${name})`,
                context: {
                  declarationType: declType.slice(0, -1),
                  name
                }
              });
            }
          }
        }
      }
      
      return violations;
      
    } catch (error) {
      // General error - return as violation
      return [{
        ruleCode: 'FHIR-FSH-CONVENTIONS-001',
        level: 'warning',
        message: `Unexpected error checking FSH naming conventions: ${error instanceof Error ? error.message : String(error)}`,
        filePath,
        line: 0,
        suggestion: 'Check file encoding and format'
      }];
    }
  }
};

export default fshConventionsRule;
