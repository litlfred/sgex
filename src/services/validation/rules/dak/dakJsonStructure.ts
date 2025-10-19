/**
 * DAK dak.json Structure Validation Rule
 * 
 * Validates that dak.json conforms to the WHO SMART Base DAK schema.
 * This ensures proper DAK metadata and component source tracking.
 * 
 * @module validation/rules/dak/dakJsonStructure
 */

import type {
  ValidationRule,
  ValidationViolation,
  ValidationContext as IValidationContext
} from '../../types';

/**
 * DAK dak.json Structure Validation Rule
 * 
 * @openapi
 * components:
 *   schemas:
 *     DAKJsonStructureRule:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "DAK-JSON-STRUCTURE-001"
 *         level:
 *           type: string
 *           enum: [error]
 *         component:
 *           type: string
 *           example: "dak-config"
 * 
 * @example
 * // Valid dak.json structure
 * {
 *   "canonical": "http://smart.who.int/anc-dak",
 *   "url": "https://github.com/WorldHealthOrganization/smart-anc",
 *   "healthInterventions": { "sources": [...] },
 *   "businessProcesses": { "sources": [...] }
 * }
 */
export const dakJsonStructureRule: ValidationRule = {
  metadata: {
    code: 'DAK-JSON-STRUCTURE-001',
    level: 'error',
    component: 'dak-config',
    title: 'DAK JSON Structure Valid',
    description: 'dak.json SHALL conform to the WHO SMART Base DAK schema with required canonical, url, and component source properties'
  },
  
  /**
   * Validate dak.json structure against WHO SMART Base schema
   */
  async validate(
    filePath: string,
    content: string,
    context: IValidationContext
  ): Promise<ValidationViolation[]> {
    const violations: ValidationViolation[] = [];
    
    try {
      // Parse JSON content
      let dakJson: any;
      
      try {
        dakJson = await context.parseJSON(content);
      } catch (error) {
        return [{
          ruleCode: 'DAK-JSON-STRUCTURE-001',
          level: 'error',
          message: `Failed to parse dak.json: ${error instanceof Error ? error.message : String(error)}`,
          filePath,
          line: 0,
          suggestion: 'Ensure the file is valid JSON format'
        }];
      }
      
      // Check required top-level properties
      const requiredProps = ['canonical', 'url'];
      
      for (const prop of requiredProps) {
        if (!dakJson[prop]) {
          violations.push({
            ruleCode: 'DAK-JSON-STRUCTURE-001',
            level: 'error',
            message: `dak.json is missing required "${prop}" property`,
            filePath,
            line: 0,
            suggestion: `Add the ${prop} property to the root of dak.json`
          });
        }
      }
      
      // Validate canonical format (should be URI)
      if (dakJson.canonical && typeof dakJson.canonical === 'string') {
        try {
          new URL(dakJson.canonical);
        } catch {
          violations.push({
            ruleCode: 'DAK-JSON-STRUCTURE-001',
            level: 'error',
            message: 'dak.json "canonical" property must be a valid URI',
            filePath,
            line: 0,
            suggestion: 'Use format: http://smart.who.int/your-dak-name',
            context: {
              canonicalValue: dakJson.canonical
            }
          });
        }
      }
      
      // Validate url format (should be URI)
      if (dakJson.url && typeof dakJson.url === 'string') {
        try {
          new URL(dakJson.url);
        } catch {
          violations.push({
            ruleCode: 'DAK-JSON-STRUCTURE-001',
            level: 'error',
            message: 'dak.json "url" property must be a valid URI',
            filePath,
            line: 0,
            suggestion: 'Use format: https://github.com/organization/repository',
            context: {
              urlValue: dakJson.url
            }
          });
        }
      }
      
      // Check for component objects (at least one should exist)
      const componentNames = [
        'healthInterventions',
        'personas',
        'userScenarios',
        'businessProcesses',
        'dataElements',
        'decisionLogic',
        'indicators',
        'requirements',
        'testScenarios'
      ];
      
      const hasComponents = componentNames.some(comp => dakJson[comp]);
      
      if (!hasComponents) {
        violations.push({
          ruleCode: 'DAK-JSON-STRUCTURE-001',
          level: 'error',
          message: 'dak.json must contain at least one component object (healthInterventions, businessProcesses, etc.)',
          filePath,
          line: 0,
          suggestion: 'Add at least one DAK component with sources array'
        });
      }
      
      // Validate component structure (should have sources array)
      for (const compName of componentNames) {
        if (dakJson[compName]) {
          const comp = dakJson[compName];
          
          if (!comp.sources || !Array.isArray(comp.sources)) {
            violations.push({
              ruleCode: 'DAK-JSON-STRUCTURE-001',
              level: 'error',
              message: `dak.json component "${compName}" must have a "sources" array property`,
              filePath,
              line: 0,
              suggestion: `Add "sources": [] to the ${compName} component`,
              context: {
                component: compName
              }
            });
          }
        }
      }
      
      return violations;
      
    } catch (error) {
      // General error - return as violation
      return [{
        ruleCode: 'DAK-JSON-STRUCTURE-001',
        level: 'error',
        message: `Unexpected error validating dak.json: ${error instanceof Error ? error.message : String(error)}`,
        filePath,
        line: 0,
        suggestion: 'Check file format and structure against WHO SMART Base DAK schema'
      }];
    }
  }
};

export default dakJsonStructureRule;
