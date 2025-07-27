/**
 * DAK Compliance Service
 * 
 * Provides validation for DAK components with support for error, warning, and info levels.
 * Simplified version focused on staging ground integration.
 */

class DAKComplianceService {
  constructor() {
    this.validators = new Map();
    this.initializeDefaultValidators();
  }

  /**
   * Initialize default validators for common DAK file types
   */
  initializeDefaultValidators() {
    // Basic file validators
    this.addValidator('*', 'not-empty', {
      level: 'warning',
      description: 'Files should not be completely empty',
      validator: this.validateNotEmpty.bind(this)
    });

    // JSON file validators
    this.addValidator('json', 'valid-json', {
      level: 'error',
      description: 'JSON files must be valid JSON',
      validator: this.validateJSON.bind(this)
    });

    // XML file validators
    this.addValidator('xml', 'basic-xml', {
      level: 'warning',
      description: 'XML files should have basic structure',
      validator: this.validateBasicXML.bind(this)
    });

    this.addValidator('bpmn', 'basic-xml', {
      level: 'warning',
      description: 'BPMN files should have basic XML structure',
      validator: this.validateBasicXML.bind(this)
    });

    this.addValidator('dmn', 'basic-xml', {
      level: 'warning',
      description: 'DMN files should have basic XML structure',
      validator: this.validateBasicXML.bind(this)
    });
  }

  /**
   * Add a validator for a specific file type
   */
  addValidator(fileType, validatorName, config) {
    if (!this.validators.has(fileType)) {
      this.validators.set(fileType, new Map());
    }
    this.validators.get(fileType).set(validatorName, config);
  }

  /**
   * Validate files from staging ground
   */
  async validateFiles(files) {
    const results = {
      files: {},
      summary: {
        totalFiles: files.length,
        validFiles: 0,
        filesWithErrors: 0,
        filesWithWarnings: 0,
        totalIssues: 0
      }
    };

    for (const file of files) {
      const fileResults = await this.validateFile(file.path, file.content);
      results.files[file.path] = fileResults;

      // Update summary
      if (fileResults.length === 0) {
        results.summary.validFiles++;
      } else {
        const hasErrors = fileResults.some(r => r.level === 'error');
        const hasWarnings = fileResults.some(r => r.level === 'warning');
        
        if (hasErrors) results.summary.filesWithErrors++;
        if (hasWarnings) results.summary.filesWithWarnings++;
        
        results.summary.totalIssues += fileResults.length;
      }
    }

    return results;
  }

  /**
   * Validate a single file
   */
  async validateFile(filePath, content) {
    const fileExtension = this.getFileExtension(filePath);
    const results = [];

    // Get validators for this file type
    const fileTypeValidators = this.validators.get(fileExtension) || new Map();
    const globalValidators = this.validators.get('*') || new Map();

    // Run global validators first
    for (const [validatorName, config] of globalValidators) {
      try {
        const result = await config.validator(filePath, content);
        if (result) {
          results.push({
            validator: validatorName,
            level: config.level,
            message: result.message || config.description,
            suggestion: result.suggestion
          });
        }
      } catch (error) {
        console.warn(`Validator ${validatorName} failed:`, error);
      }
    }

    // Run file-type specific validators
    for (const [validatorName, config] of fileTypeValidators) {
      try {
        const result = await config.validator(filePath, content);
        if (result) {
          results.push({
            validator: validatorName,
            level: config.level,
            message: result.message || config.description,
            suggestion: result.suggestion
          });
        }
      } catch (error) {
        console.warn(`Validator ${validatorName} failed:`, error);
      }
    }

    return results;
  }

  /**
   * Get validation summary for display
   */
  getValidationSummary(validation) {
    if (!validation || !validation.summary) {
      return {
        error: 0,
        warning: 0,
        info: 0,
        hasIssues: false,
        canSave: true
      };
    }

    let errorCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    // Count issues by level
    Object.values(validation.files).forEach(fileResults => {
      fileResults.forEach(result => {
        switch (result.level) {
          case 'error':
            errorCount++;
            break;
          case 'warning':
            warningCount++;
            break;
          case 'info':
            infoCount++;
            break;
          default:
            // Unknown level, treat as info
            infoCount++;
            break;
        }
      });
    });

    const hasIssues = errorCount > 0 || warningCount > 0 || infoCount > 0;
    const canSave = errorCount === 0; // Can save if no errors (warnings are OK)

    return {
      error: errorCount,
      warning: warningCount,
      info: infoCount,
      hasIssues,
      canSave
    };
  }

  /**
   * Get file extension from path
   */
  getFileExtension(filePath) {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    // Map some extensions to standard types
    const extensionMap = {
      'bpmn': 'bpmn',
      'dmn': 'dmn',
      'xml': 'xml',
      'json': 'json',
      'md': 'markdown',
      'txt': 'text'
    };

    return extensionMap[extension] || extension || 'unknown';
  }

  // Validator implementations
  
  /**
   * Validate file is not empty
   */
  async validateNotEmpty(filePath, content) {
    if (!content || content.trim().length === 0) {
      return {
        message: 'File is empty or contains only whitespace',
        suggestion: 'Add some content to the file'
      };
    }
    return null;
  }

  /**
   * Validate JSON format
   */
  async validateJSON(filePath, content) {
    try {
      JSON.parse(content);
      return null;
    } catch (error) {
      return {
        message: `Invalid JSON: ${error.message}`,
        suggestion: 'Check JSON syntax and fix any formatting errors'
      };
    }
  }

  /**
   * Basic XML validation
   */
  async validateBasicXML(filePath, content) {
    if (!content.trim().startsWith('<')) {
      return {
        message: 'XML files should start with an opening tag',
        suggestion: 'Ensure the file starts with a valid XML declaration or root element'
      };
    }

    // Very basic check for balanced tags (simplified)
    const openTags = content.match(/<[^/][^>]*>/g) || [];
    
    if (openTags.length === 0) {
      return {
        message: 'No XML tags found',
        suggestion: 'Add proper XML structure with opening and closing tags'
      };
    }

    return null;
  }
}

// Create singleton instance
const dakComplianceService = new DAKComplianceService();

export default dakComplianceService;