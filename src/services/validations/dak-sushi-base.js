/**
 * DAK-SUSHI-BASE Validation
 * 
 * A DAK IG SHALL have smart.who.int.base as a dependency
 */
export default {
  id: 'dak-sushi-base',
  component: 'dak-structure',
  level: 'error',
  fileTypes: ['yaml'],
  descriptionKey: 'validation.dak.sushiBase.description',
  description: 'DAK IG SHALL have smart.who.int.base as a dependency',
  
  async validate(filePath, content, context) {
    // Only validate sushi-config.yaml files
    if (!filePath.endsWith('sushi-config.yaml')) {
      return null;
    }
    
    try {
      const yaml = require('js-yaml');
      const config = yaml.load(content);
      
      if (!config || typeof config !== 'object') {
        return {
          message: 'sushi-config.yaml must contain a valid YAML object',
          line: 1,
          column: 1,
          suggestion: 'Ensure the file contains proper YAML object structure'
        };
      }
      
      // Check for dependencies section
      if (!config.dependencies || typeof config.dependencies !== 'object') {
        return {
          message: 'sushi-config.yaml missing dependencies section',
          line: this.findLineNumber(content, 'dependencies') || 1,
          column: 1,
          suggestion: 'Add dependencies section with smart.who.int.base dependency'
        };
      }
      
      // Check for smart.who.int.base dependency
      if (!config.dependencies['smart.who.int.base']) {
        return {
          message: 'Missing required smart.who.int.base dependency',
          line: this.findLineNumber(content, 'dependencies') || 1,
          column: 1,
          suggestion: 'Add "smart.who.int.base: current" to dependencies section'
        };
      }
      
      return null; // Valid
      
    } catch (error) {
      return {
        message: `YAML parsing error: ${error.message}`,
        line: error.mark?.line || 1,
        column: error.mark?.column || 1,
        suggestion: 'Fix YAML syntax errors'
      };
    }
  },
  
  findLineNumber(content, searchTerm) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchTerm)) {
        return i + 1;
      }
    }
    return null;
  },
  
  metadata: {
    standard: 'WHO SMART Guidelines',
    reference: 'https://smart.who.int/ig-starter-kit/authoring_conventions.html',
    severity: 'critical'
  }
};