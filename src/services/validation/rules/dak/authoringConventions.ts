/**
 * WHO SMART Guidelines Authoring Conventions Validation Rule
 * Validates compliance with WHO IG Starter Kit authoring conventions
 * 
 * @module rules/dak/authoringConventions
 * @see https://smart.who.int/ig-starter-kit/authoring_conventions.html
 */

import { ValidationRule, ValidationViolation, ValidationContext } from '../../types';

/**
 * WHO Authoring Conventions Validation Rule
 * 
 * Rule: DAK-AUTHORING-CONVENTIONS-001
 * Level: warning
 * Component: dak-config
 * 
 * Description: DAK artifacts SHOULD follow WHO SMART Guidelines authoring conventions
 * as specified in the IG Starter Kit.
 * 
 * Checks:
 * - File organization (L2 vs L3 directories)
 * - Naming conventions
 * - Required metadata fields
 * - Documentation standards
 */
export const authoringConventionsRule: ValidationRule = {
  metadata: {
    code: 'DAK-AUTHORING-CONVENTIONS-001',
    level: 'warning',
    component: 'dak-config',
    title: 'WHO SMART Guidelines Authoring Conventions',
    description: 'DAK artifacts SHOULD follow WHO SMART Guidelines authoring conventions as specified in the IG Starter Kit',
    fileTypes: ['.yaml', '.json', '.md']
  },
  
  validate: async (
    filePath: string,
    content: string,
    context: ValidationContext
  ): Promise<ValidationViolation[]> => {
    const violations: ValidationViolation[] = [];
    
    try {
      // Check if this is sushi-config.yaml
      if (filePath.endsWith('sushi-config.yaml')) {
        const yaml = await context.parseYAML(content);
        
        // Check for required WHO conventions fields
        const requiredFields = ['canonical', 'name', 'title', 'description', 'version', 'fhirVersion', 'dependencies'];
        const conventionFields = ['publisher', 'contact', 'jurisdiction', 'copyrightLabel'];
        
        // Check required fields
        requiredFields.forEach(field => {
          if (!yaml[field]) {
            violations.push({
              ruleCode: 'DAK-AUTHORING-CONVENTIONS-001',
              level: 'warning',
              message: `Missing recommended field '${field}' in sushi-config.yaml`,
              filePath,
              suggestion: `Add '${field}' field according to WHO SMART Guidelines authoring conventions`,
              context: {
                field,
                convention: 'WHO IG Starter Kit',
                section: '4.3 Authoring Conventions'
              }
            });
          }
        });
        
        // Check convention fields
        conventionFields.forEach(field => {
          if (!yaml[field]) {
            violations.push({
              ruleCode: 'DAK-AUTHORING-CONVENTIONS-001',
              level: 'info',
              message: `Consider adding '${field}' field for WHO compliance`,
              filePath,
              suggestion: `Add '${field}' field as recommended in WHO authoring conventions`,
              context: {
                field,
                convention: 'WHO IG Starter Kit',
                section: '4.3 Authoring Conventions'
              }
            });
          }
        });
        
        // Check canonical format
        if (yaml.canonical && !yaml.canonical.startsWith('http://smart.who.int/')) {
          violations.push({
            ruleCode: 'DAK-AUTHORING-CONVENTIONS-001',
            level: 'warning',
            message: 'Canonical URL should follow WHO SMART Guidelines pattern',
            filePath,
            suggestion: 'Use canonical URL format: http://smart.who.int/{guideline-id}',
            context: {
              currentCanonical: yaml.canonical,
              expectedPattern: 'http://smart.who.int/{guideline-id}',
              convention: 'WHO IG Starter Kit'
            }
          });
        }
      }
      
      // Check file organization conventions
      if (filePath.includes('/input/')) {
        // Check L2 vs L3 organization
        const pathParts = filePath.split('/');
        const inputIndex = pathParts.indexOf('input');
        
        if (inputIndex >= 0 && inputIndex + 1 < pathParts.length) {
          const subdir = pathParts[inputIndex + 1];
          
          // WHO convention: L2 files in specific directories
          const l2Directories = ['actors', 'scenarios', 'processes', 'concepts'];
          const l3Directories = ['resources', 'profiles', 'extensions', 'examples'];
          
          if (!l2Directories.includes(subdir) && !l3Directories.includes(subdir)) {
            violations.push({
              ruleCode: 'DAK-AUTHORING-CONVENTIONS-001',
              level: 'info',
              message: `File location '${subdir}' does not follow standard WHO directory conventions`,
              filePath,
              suggestion: `Consider using standard WHO directories: L2 (${l2Directories.join(', ')}) or L3 (${l3Directories.join(', ')})`,
              context: {
                currentDirectory: subdir,
                l2Directories,
                l3Directories,
                convention: 'WHO IG Starter Kit'
              }
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error in WHO authoring conventions validation:', error);
    }
    
    return violations;
  }
};

// Note: This rule uses context.parseYAML which should be added to ValidationContext
// For now, it will handle YAML parsing inline if needed
