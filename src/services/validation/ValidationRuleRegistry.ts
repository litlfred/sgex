/**
 * Validation Rule Registry
 * 
 * Central registry for managing and indexing DAK validation rules.
 * Rules can be looked up by component, file type, or rule code.
 * 
 * @module validation/ValidationRuleRegistry
 */

import {
  ValidationRule,
  ValidationRuleMetadata,
  ValidationRuleRegistryConfig
} from './types';

/**
 * Validation Rule Registry Service
 * 
 * @openapi
 * components:
 *   schemas:
 *     ValidationRuleMetadata:
 *       type: object
 *       required:
 *         - code
 *         - level
 *         - component
 *         - title
 *         - description
 *         - fileTypes
 *       properties:
 *         code:
 *           type: string
 *           example: "BPMN-BUSINESS-RULE-TASK-ID-001"
 *         level:
 *           type: string
 *           enum: [error, warning, info]
 *         component:
 *           type: string
 *           example: "business-processes"
 */
export class ValidationRuleRegistry {
  private rules: Map<string, ValidationRule>;
  private rulesByComponent: Map<string, Set<string>>;
  private rulesByFileType: Map<string, Set<string>>;
  private config: ValidationRuleRegistryConfig;

  constructor(config: ValidationRuleRegistryConfig = {}) {
    this.rules = new Map();
    this.rulesByComponent = new Map();
    this.rulesByFileType = new Map();
    this.config = {
      enableCache: true,
      maxCacheSize: 1000,
      throwOnDuplicate: false,
      ...config
    };
  }

  /**
   * Register a new validation rule
   * 
   * @param rule - Validation rule to register
   * @throws Error if duplicate rule code and throwOnDuplicate is true
   * 
   * @openapi
   * /api/validation/rules:
   *   post:
   *     summary: Register validation rule
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ValidationRuleMetadata'
   */
  register(rule: ValidationRule): void {
    const { code } = rule.metadata;

    // Check for duplicate
    if (this.rules.has(code)) {
      if (this.config.throwOnDuplicate) {
        throw new Error(`Validation rule with code '${code}' is already registered`);
      }
      console.warn(`Overwriting existing validation rule: ${code}`);
    }

    // Register the rule
    this.rules.set(code, rule);

    // Index by component
    const { component } = rule.metadata;
    if (!this.rulesByComponent.has(component)) {
      this.rulesByComponent.set(component, new Set());
    }
    this.rulesByComponent.get(component)!.add(code);

    // Index by file types
    for (const fileType of rule.metadata.fileTypes) {
      if (!this.rulesByFileType.has(fileType)) {
        this.rulesByFileType.set(fileType, new Set());
      }
      this.rulesByFileType.get(fileType)!.add(code);
    }
  }

  /**
   * Get validation rule by code
   * 
   * @param code - Rule code
   * @returns Validation rule or undefined
   * 
   * @openapi
   * /api/validation/rules/{code}:
   *   get:
   *     summary: Get validation rule by code
   *     parameters:
   *       - name: code
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   */
  getRule(code: string): ValidationRule | undefined {
    return this.rules.get(code);
  }

  /**
   * Get all validation rules for a component
   * 
   * @param component - DAK component type
   * @returns Array of validation rules
   * 
   * @openapi
   * /api/validation/rules/component/{component}:
   *   get:
   *     summary: Get rules by component
   *     parameters:
   *       - name: component
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   */
  getRulesByComponent(component: string): ValidationRule[] {
    const ruleCodes = this.rulesByComponent.get(component);
    if (!ruleCodes) {
      return [];
    }

    return Array.from(ruleCodes)
      .map(code => this.rules.get(code))
      .filter((rule): rule is ValidationRule => rule !== undefined);
  }

  /**
   * Get all validation rules for a file type
   * 
   * @param fileType - File extension (e.g., 'bpmn', 'dmn', 'json')
   * @returns Array of validation rules
   * 
   * @openapi
   * /api/validation/rules/filetype/{fileType}:
   *   get:
   *     summary: Get rules by file type
   *     parameters:
   *       - name: fileType
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   */
  getRulesByFileType(fileType: string): ValidationRule[] {
    const ruleCodes = this.rulesByFileType.get(fileType);
    if (!ruleCodes) {
      return [];
    }

    return Array.from(ruleCodes)
      .map(code => this.rules.get(code))
      .filter((rule): rule is ValidationRule => rule !== undefined);
  }

  /**
   * Get all registered validation rules
   * 
   * @returns Array of all validation rules
   * 
   * @openapi
   * /api/validation/rules:
   *   get:
   *     summary: List all validation rules
   *     responses:
   *       200:
   *         description: Array of validation rules
   */
  getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get all registered components
   * 
   * @returns Array of component names
   */
  getComponents(): string[] {
    return Array.from(this.rulesByComponent.keys());
  }

  /**
   * Get all registered file types
   * 
   * @returns Array of file types
   */
  getFileTypes(): string[] {
    return Array.from(this.rulesByFileType.keys());
  }

  /**
   * Unregister a validation rule
   * 
   * @param code - Rule code to unregister
   * @returns True if rule was removed, false if not found
   */
  unregister(code: string): boolean {
    const rule = this.rules.get(code);
    if (!rule) {
      return false;
    }

    // Remove from main registry
    this.rules.delete(code);

    // Remove from component index
    const componentSet = this.rulesByComponent.get(rule.metadata.component);
    if (componentSet) {
      componentSet.delete(code);
      if (componentSet.size === 0) {
        this.rulesByComponent.delete(rule.metadata.component);
      }
    }

    // Remove from file type indexes
    for (const fileType of rule.metadata.fileTypes) {
      const fileTypeSet = this.rulesByFileType.get(fileType);
      if (fileTypeSet) {
        fileTypeSet.delete(code);
        if (fileTypeSet.size === 0) {
          this.rulesByFileType.delete(fileType);
        }
      }
    }

    return true;
  }

  /**
   * Clear all registered rules
   */
  clear(): void {
    this.rules.clear();
    this.rulesByComponent.clear();
    this.rulesByFileType.clear();
  }

  /**
   * Get registry statistics
   * 
   * @returns Registry statistics
   */
  getStatistics(): {
    totalRules: number;
    components: number;
    fileTypes: number;
    rulesByLevel: Record<string, number>;
  } {
    const rulesByLevel: Record<string, number> = {
      error: 0,
      warning: 0,
      info: 0
    };

    Array.from(this.rules.values()).forEach(rule => {
      rulesByLevel[rule.metadata.level]++;
    });

    return {
      totalRules: this.rules.size,
      components: this.rulesByComponent.size,
      fileTypes: this.rulesByFileType.size,
      rulesByLevel
    };
  }
}

// Export singleton instance
export const validationRuleRegistry = new ValidationRuleRegistry();
