/**
 * DAK-SUSHI-BASE Validation
 * 
 * A DAK IG SHALL have smart.who.int.base as a dependency
 */

import * as yaml from 'js-yaml';
import { ValidationDefinition, ValidationContext, DAKValidationResult, SushiConfig } from '../../types/core';

const dakSushiBase: ValidationDefinition = {
  id: 'dak-sushi-base',
  component: 'dak-structure',
  level: 'error',
  fileTypes: ['yaml'],
  descriptionKey: 'validation.dak.sushiBase.description',
  description: 'DAK IG SHALL have smart.who.int.base as a dependency',
  
  async validate(filePath: string, content: string, context: ValidationContext): Promise<DAKValidationResult | null> {
    // Only validate sushi-config.yaml files
    if (!filePath.endsWith('sushi-config.yaml')) {
      return null;
    }
    
    try {
      const config = yaml.load(content) as SushiConfig;
      
      if (!config || typeof config !== 'object') {
        return {
          validationId: 'dak-sushi-base',
          component: 'dak-structure',
          level: 'error',
          description: 'DAK IG SHALL have smart.who.int.base as a dependency',
          filePath,
          message: 'sushi-config.yaml must contain a valid YAML object',
          line: 1,
          column: 1,
          suggestion: 'Ensure the file contains proper YAML object structure'
        };
      }
      
      // Check for dependencies section
      if (!config.dependencies || typeof config.dependencies !== 'object') {
        return {
          validationId: 'dak-sushi-base',
          component: 'dak-structure',
          level: 'error',
          description: 'DAK IG SHALL have smart.who.int.base as a dependency',
          filePath,
          message: 'sushi-config.yaml missing dependencies section',
          line: dakSushiBase.findLineNumber ? dakSushiBase.findLineNumber(content, 'dependencies') || 1 : 1,
          column: 1,
          suggestion: 'Add dependencies section with smart.who.int.base dependency'
        };
      }
      
      // Check for smart.who.int.base dependency
      if (!config.dependencies['smart.who.int.base']) {
        return {
          validationId: 'dak-sushi-base',
          component: 'dak-structure',
          level: 'error',
          description: 'DAK IG SHALL have smart.who.int.base as a dependency',
          filePath,
          message: 'Missing required smart.who.int.base dependency',
          line: dakSushiBase.findLineNumber ? dakSushiBase.findLineNumber(content, 'dependencies') || 1 : 1,
          column: 1,
          suggestion: 'Add "smart.who.int.base: current" to dependencies section'
        };
      }
      
      return null; // Valid
      
    } catch (error: any) {
      return {
        validationId: 'dak-sushi-base',
        component: 'dak-structure',
        level: 'error',
        description: 'DAK IG SHALL have smart.who.int.base as a dependency',
        filePath,
        message: `YAML parsing error: ${error.message}`,
        line: error.mark?.line || 1,
        column: error.mark?.column || 1,
        suggestion: 'Fix YAML syntax errors'
      };
    }
  },
  
  findLineNumber(content: string, searchTerm: string): number | null {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchTerm)) {
        return i + 1;
      }
    }
    return null;
  }
};

// Add metadata for reference
export const metadata = {
  standard: 'WHO SMART Guidelines',
  reference: 'https://smart.who.int/ig-starter-kit/authoring_conventions.html',
  severity: 'critical'
};

export default dakSushiBase;