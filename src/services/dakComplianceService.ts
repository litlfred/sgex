/**
 * DAK Compliance Service
 * 
 * Provides comprehensive validation for DAK components with support for error, warning, and info levels.
 * Designed to work in multiple environments: React client-side, command-line, and IDE integration.
 * 
 * @module dakComplianceService
 */

import { lazyLoadAjv, lazyLoadAjvFormats, lazyLoadYaml } from '../services/libraryLoaderService';

// Import schema as a module
const sushiConfigSchema = require('../schemas/sushi-config.json');

/**
 * Validation result
 * @example { "valid": true, "level": "error", "message": "File is valid" }
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation level */
  level: 'error' | 'warning' | 'info';
  /** Validation message */
  message: string;
  /** Error details */
  details?: any;
}

/**
 * Validator configuration
 */
export interface ValidatorConfig {
  /** Validation level */
  level: 'error' | 'warning' | 'info';
  /** Validator description */
  description: string;
  /** Validator function */
  validator: (content: string, filePath: string) => Promise<ValidationResult> | ValidationResult;
}

/**
 * File validation result
 */
export interface FileValidationResult {
  /** File path */
  filePath: string;
  /** File type */
  fileType: string;
  /** Validation results */
  results: ValidationResult[];
  /** Whether file passed all validations */
  passed: boolean;
  /** Error count */
  errorCount: number;
  /** Warning count */
  warningCount: number;
  /** Info count */
  infoCount: number;
}

/**
 * DAK validation summary
 */
export interface DAKValidationSummary {
  /** Total files validated */
  totalFiles: number;
  /** Files with errors */
  filesWithErrors: number;
  /** Files with warnings */
  filesWithWarnings: number;
  /** Total errors */
  totalErrors: number;
  /** Total warnings */
  totalWarnings: number;
  /** Total info messages */
  totalInfo: number;
  /** All validation results */
  results: FileValidationResult[];
}

/**
 * DAK Compliance Service class
 * 
 * @openapi
 * components:
 *   schemas:
 *     ValidationResult:
 *       type: object
 *       properties:
 *         valid:
 *           type: boolean
 *         level:
 *           type: string
 *           enum: [error, warning, info]
 */
class DAKComplianceService {
  private validators: Map<string, Map<string, ValidatorConfig>>;
  private ajv: any;
  private sushiConfigValidator: any;

  constructor() {
    this.validators = new Map();
    this.initializeSchemaValidator();
    this.initializeDefaultValidators();
  }

  /**
   * Initialize AJV schema validator for sushi-config.yaml
   */
  async initializeSchemaValidator(): Promise<void> {
    const Ajv = await lazyLoadAjv();
    const addFormats = await lazyLoadAjvFormats();
    
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(this.ajv);
    this.sushiConfigValidator = this.ajv.compile(sushiConfigSchema);
  }

  /**
   * Initialize default validators for common DAK file types
   */
  initializeDefaultValidators(): void {
    // XML file validators (general)
    this.addValidator('xml', 'xml-well-formed', {
      level: 'error',
      description: 'XML files must be well-formed',
      validator: this.validateXMLWellFormed.bind(this)
    });

    // BPMN file validators
    this.addValidator('bpmn', 'xml-well-formed', {
      level: 'error',
      description: 'BPMN files must be well-formed XML',
      validator: this.validateXMLWellFormed.bind(this)
    });

    this.addValidator('bpmn', 'bpmn-namespace', {
      level: 'error',
      description: 'BPMN files must use correct BPMN 2.0 namespace',
      validator: this.validateBPMNNamespace.bind(this)
    });

    this.addValidator('bpmn', 'has-start-event', {
      level: 'warning',
      description: 'BPMN process should have at least one start event',
      validator: this.validateBPMNStartEvent.bind(this)
    });

    // DMN file validators
    this.addValidator('dmn', 'xml-well-formed', {
      level: 'error',
      description: 'DMN files must be well-formed XML',
      validator: this.validateXMLWellFormed.bind(this)
    });

    // FSH file validators
    this.addValidator('fsh', 'fsh-syntax', {
      level: 'error',
      description: 'FSH files must use valid FHIR Shorthand syntax',
      validator: this.validateFSHSyntax.bind(this)
    });

    // YAML validators
    this.addValidator('yaml', 'yaml-syntax', {
      level: 'error',
      description: 'YAML files must be valid YAML',
      validator: this.validateYAMLSyntax.bind(this)
    });

    this.addValidator('yaml', 'sushi-config', {
      level: 'error',
      description: 'sushi-config.yaml must conform to schema',
      validator: this.validateSushiConfig.bind(this)
    });
  }

  /**
   * Add a validator for a file type
   */
  addValidator(fileType: string, validatorId: string, config: ValidatorConfig): void {
    if (!this.validators.has(fileType)) {
      this.validators.set(fileType, new Map());
    }
    this.validators.get(fileType)!.set(validatorId, config);
  }

  /**
   * Validate XML well-formedness
   */
  validateXMLWellFormed(content: string, filePath: string): ValidationResult {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      
      if (parseError) {
        return {
          valid: false,
          level: 'error',
          message: `XML parsing error: ${parseError.textContent}`,
          details: { filePath }
        };
      }
      
      return {
        valid: true,
        level: 'error',
        message: 'XML is well-formed'
      };
    } catch (error: any) {
      return {
        valid: false,
        level: 'error',
        message: `XML validation error: ${error.message}`,
        details: { filePath, error }
      };
    }
  }

  /**
   * Validate BPMN namespace
   */
  validateBPMNNamespace(content: string, filePath: string): ValidationResult {
    const bpmnNamespace = 'http://www.omg.org/spec/BPMN/20100524/MODEL';
    
    if (!content.includes(bpmnNamespace)) {
      return {
        valid: false,
        level: 'error',
        message: `BPMN file must include correct namespace: ${bpmnNamespace}`,
        details: { filePath }
      };
    }
    
    return {
      valid: true,
      level: 'error',
      message: 'BPMN namespace is correct'
    };
  }

  /**
   * Validate BPMN has start event
   */
  validateBPMNStartEvent(content: string, filePath: string): ValidationResult {
    const hasStartEvent = content.includes('startEvent') || content.includes('<bpmn:startEvent');
    
    if (!hasStartEvent) {
      return {
        valid: false,
        level: 'warning',
        message: 'BPMN process should have at least one start event',
        details: { filePath }
      };
    }
    
    return {
      valid: true,
      level: 'warning',
      message: 'BPMN has start event'
    };
  }

  /**
   * Validate FSH syntax
   */
  validateFSHSyntax(content: string, filePath: string): ValidationResult {
    // Basic FSH syntax validation
    const lines = content.split('\n');
    const errors: string[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        // Check for basic FSH keywords
        const keywords = ['Profile:', 'Instance:', 'Extension:', 'ValueSet:', 'CodeSystem:', 'Alias:'];
        const hasKeyword = keywords.some(k => trimmed.startsWith(k));
        if (!hasKeyword && index === 0) {
          errors.push(`Line ${index + 1}: FSH file should start with a definition keyword`);
        }
      }
    });
    
    if (errors.length > 0) {
      return {
        valid: false,
        level: 'error',
        message: 'FSH syntax errors found',
        details: { filePath, errors }
      };
    }
    
    return {
      valid: true,
      level: 'error',
      message: 'FSH syntax is valid'
    };
  }

  /**
   * Validate YAML syntax
   */
  async validateYAMLSyntax(content: string, filePath: string): Promise<ValidationResult> {
    try {
      const yaml = await lazyLoadYaml();
      yaml.load(content);
      
      return {
        valid: true,
        level: 'error',
        message: 'YAML syntax is valid'
      };
    } catch (error: any) {
      return {
        valid: false,
        level: 'error',
        message: `YAML syntax error: ${error.message}`,
        details: { filePath, error }
      };
    }
  }

  /**
   * Validate sushi-config.yaml against schema
   */
  async validateSushiConfig(content: string, filePath: string): Promise<ValidationResult> {
    try {
      const yaml = await lazyLoadYaml();
      const config = yaml.load(content);
      
      const valid = this.sushiConfigValidator(config);
      
      if (!valid) {
        return {
          valid: false,
          level: 'error',
          message: 'sushi-config.yaml does not conform to schema',
          details: {
            filePath,
            errors: this.sushiConfigValidator.errors
          }
        };
      }
      
      return {
        valid: true,
        level: 'error',
        message: 'sushi-config.yaml is valid'
      };
    } catch (error: any) {
      return {
        valid: false,
        level: 'error',
        message: `sushi-config validation error: ${error.message}`,
        details: { filePath, error }
      };
    }
  }

  /**
   * Validate a file
   */
  async validateFile(filePath: string, content: string, fileType: string): Promise<FileValidationResult> {
    const results: ValidationResult[] = [];
    const validators = this.validators.get(fileType);
    
    if (validators) {
      for (const [, config] of validators) {
        const result = await config.validator(content, filePath);
        results.push(result);
      }
    }
    
    const errorCount = results.filter(r => !r.valid && r.level === 'error').length;
    const warningCount = results.filter(r => !r.valid && r.level === 'warning').length;
    const infoCount = results.filter(r => !r.valid && r.level === 'info').length;
    
    return {
      filePath,
      fileType,
      results,
      passed: errorCount === 0,
      errorCount,
      warningCount,
      infoCount
    };
  }

  /**
   * Validate multiple files
   */
  async validateFiles(files: Array<{path: string; content: string; type: string}>): Promise<DAKValidationSummary> {
    const results: FileValidationResult[] = [];
    
    for (const file of files) {
      const result = await this.validateFile(file.path, file.content, file.type);
      results.push(result);
    }
    
    const filesWithErrors = results.filter(r => r.errorCount > 0).length;
    const filesWithWarnings = results.filter(r => r.warningCount > 0).length;
    const totalErrors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warningCount, 0);
    const totalInfo = results.reduce((sum, r) => sum + r.infoCount, 0);
    
    return {
      totalFiles: files.length,
      filesWithErrors,
      filesWithWarnings,
      totalErrors,
      totalWarnings,
      totalInfo,
      results
    };
  }

  /**
   * Get all validators for a file type
   */
  getValidators(fileType: string): Map<string, ValidatorConfig> | undefined {
    return this.validators.get(fileType);
  }

  /**
   * Remove a validator
   */
  removeValidator(fileType: string, validatorId: string): boolean {
    const validators = this.validators.get(fileType);
    if (validators) {
      return validators.delete(validatorId);
    }
    return false;
  }
}

// Export singleton instance
const dakComplianceService = new DAKComplianceService();
export default dakComplianceService;
