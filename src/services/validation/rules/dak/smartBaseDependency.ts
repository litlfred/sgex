/**
 * DAK SMART Base Dependency Validation Rule
 * 
 * Validates that sushi-config.yaml includes smart.who.int.base as a dependency.
 * This is required for all WHO SMART Guidelines Digital Adaptation Kits.
 * 
 * @module validation/rules/dak/smartBaseDependency
 */

import type {
  ValidationRule,
  ValidationViolation,
  ValidationContext as IValidationContext
} from '../../types';

/**
 * DAK SMART Base Dependency Validation Rule
 * 
 * @openapi
 * components:
 *   schemas:
 *     DAKSmartBaseDependencyRule:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "DAK-SMART-BASE-DEPENDENCY-001"
 *         level:
 *           type: string
 *           enum: [error]
 *         component:
 *           type: string
 *           example: "dak-config"
 * 
 * @example
 * // Valid sushi-config.yaml with SMART Base dependency
 * dependencies:
 *   smart.who.int.base: 0.1.0
 *   hl7.fhir.uv.extensions: 1.0.0
 */
export const smartBaseDependencyRule: ValidationRule = {
  metadata: {
    code: 'DAK-SMART-BASE-DEPENDENCY-001',
    level: 'error',
    component: 'dak-config',
    title: 'SMART Base Dependency Required',
    description: 'A DAK Implementation Guide SHALL have smart.who.int.base as a dependency in sushi-config.yaml'
  },
  
  /**
   * Validate smart.who.int.base dependency in sushi-config.yaml
   */
  async validate(
    filePath: string,
    content: string,
    context: IValidationContext
  ): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    
    try {
      // Parse YAML content
      let config: any;
      
      try {
        // Try to parse as YAML
        const yaml = await import('yaml');
        config = yaml.parse(content);
      } catch (error) {
        return [{
          ruleCode: 'DAK-SMART-BASE-DEPENDENCY-001',
          level: 'error',
          message: `Failed to parse sushi-config.yaml: ${error instanceof Error ? error.message : String(error)}`,
          filePath,
          line: 0,
          suggestion: 'Ensure the file is valid YAML format'
        }];
      }
      
      // Check if dependencies section exists
      if (!config.dependencies) {
        violations.push({
          ruleCode: 'DAK-SMART-BASE-DEPENDENCY-001',
          level: 'error',
          message: 'sushi-config.yaml is missing required "dependencies" section',
          filePath,
          line: 0,
          suggestion: 'Add a dependencies section with smart.who.int.base:\n\ndependencies:\n  smart.who.int.base: 0.1.0'
        });
        return violations;
      }
      
      // Check if smart.who.int.base is in dependencies
      const smartBaseDep = config.dependencies['smart.who.int.base'];
      
      if (!smartBaseDep) {
        violations.push({
          ruleCode: 'DAK-SMART-BASE-DEPENDENCY-001',
          level: 'error',
          message: 'sushi-config.yaml dependencies is missing required "smart.who.int.base" dependency',
          filePath,
          line: 0,
          suggestion: 'Add smart.who.int.base to dependencies:\n\ndependencies:\n  smart.who.int.base: 0.1.0',
          context: {
            existingDependencies: Object.keys(config.dependencies)
          }
        });
      }
      
      return violations;
      
    } catch (error) {
      // General error - return as violation
      return [{
        ruleCode: 'DAK-SMART-BASE-DEPENDENCY-001',
        level: 'error',
        message: `Unexpected error validating sushi-config.yaml: ${error instanceof Error ? error.message : String(error)}`,
        filePath,
        line: 0,
        suggestion: 'Check file format and structure'
      }];
    }
  }
};

export default smartBaseDependencyRule;
