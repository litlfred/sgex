# DAK Validation Framework - Implementation Quick Start Guide

This guide helps developers quickly get started implementing the DAK Validation Framework after stakeholder approval.

## Prerequisites

Before starting implementation:

1. [GREEN] Stakeholder review completed
2. [GREEN] Clarifying questions answered (see Section 10 of main documentation)
3. [GREEN] Implementation approved
4. [GREEN] Team assigned to project
5. [GREEN] Timeline agreed upon

## Document Index

### Primary Documents
- **[Main Documentation](dak-validation-framework.md)** - Complete technical specification (40KB, read first)
- **[Executive Summary](dak-validation-framework-summary.md)** - Quick overview (7KB)
- **[Architecture Diagrams](dak-validation-framework-diagrams.md)** - Visual guides (23KB)
- **[This Guide](dak-validation-framework-quickstart.md)** - Implementation steps

## Phase 1: Core Infrastructure (Week 1-2)

### Step 1.1: Create Validation Rule Registry

```bash
# Create the service file
touch src/services/validationRuleRegistry.js
```

**File**: `src/services/validationRuleRegistry.js`

```javascript
/**
 * Validation Rule Registry
 * Central registry for managing all DAK validation rules
 */
class ValidationRuleRegistry {
  constructor() {
    this.rules = new Map();
    this.rulesByComponent = new Map();
    this.rulesByFileType = new Map();
  }
  
  register(rule) {
    // Validate rule structure
    if (!rule.code || !rule.validate) {
      throw new Error('Invalid rule: missing required fields');
    }
    
    // Store in main registry
    this.rules.set(rule.code, rule);
    
    // Index by component
    if (rule.dakComponent) {
      if (!this.rulesByComponent.has(rule.dakComponent)) {
        this.rulesByComponent.set(rule.dakComponent, []);
      }
      this.rulesByComponent.get(rule.dakComponent).push(rule);
    }
    
    // Index by file types
    if (rule.fileTypes) {
      rule.fileTypes.forEach(fileType => {
        if (!this.rulesByFileType.has(fileType)) {
          this.rulesByFileType.set(fileType, []);
        }
        this.rulesByFileType.get(fileType).push(rule);
      });
    }
  }
  
  getByComponent(componentName) {
    return this.rulesByComponent.get(componentName) || [];
  }
  
  getByFileType(fileType) {
    return this.rulesByFileType.get(fileType) || [];
  }
  
  getByCode(code) {
    return this.rules.get(code);
  }
  
  getAllRules() {
    return Array.from(this.rules.values());
  }
}

const validationRuleRegistry = new ValidationRuleRegistry();
export default validationRuleRegistry;
```

### Step 1.2: Create Validation Context

```bash
# Create the helper file
touch src/services/validationContext.js
```

**File**: `src/services/validationContext.js`

```javascript
/**
 * Validation Context
 * Provides utility functions to validation rules
 */
class ValidationContext {
  constructor(filePath, content) {
    this.filePath = filePath;
    this.content = content;
    this.parsers = new Map();
  }
  
  async getXMLParser() {
    if (!this.parsers.has('xml')) {
      const { DOMParser } = await import('xmldom');
      this.parsers.set('xml', new DOMParser());
    }
    return this.parsers.get('xml');
  }
  
  async getJSONParser() {
    return JSON; // Use native JSON parser
  }
  
  getLineNumber(node) {
    // XML parsers typically store line numbers
    return node.lineNumber || node.getAttribute?.('lineNumber') || null;
  }
  
  getColumnNumber(node) {
    return node.columnNumber || node.getAttribute?.('columnNumber') || null;
  }
  
  getXPath(node) {
    const parts = [];
    let current = node;
    
    while (current && current.nodeType !== 9) { // Not document node
      let index = 1;
      let sibling = current.previousSibling;
      
      while (sibling) {
        if (sibling.nodeType === 1 && sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      
      const tagName = current.nodeName;
      parts.unshift(`${tagName}[${index}]`);
      current = current.parentNode;
    }
    
    return '/' + parts.join('/');
  }
}

export default ValidationContext;
```

### Step 1.3: Create Main Validation Service Skeleton

```bash
# Create the main service file
touch src/services/dakArtifactValidationService.js
```

**File**: `src/services/dakArtifactValidationService.js`

```javascript
import validationRuleRegistry from './validationRuleRegistry';
import ValidationContext from './validationContext';
import githubService from './githubService';

/**
 * DAK Artifact Validation Service
 * Main service for validating DAK artifacts
 */
class DAKArtifactValidationService {
  constructor() {
    this.ruleRegistry = validationRuleRegistry;
    this.loadValidationRules();
  }
  
  async loadValidationRules() {
    // Phase 1: Just log - actual rules loaded in Phase 2
    console.log('Validation rules will be loaded here');
  }
  
  getFileType(filePath) {
    const extension = filePath.split('.').pop().toLowerCase();
    return extension;
  }
  
  detectComponent(filePath) {
    // Simple component detection based on path
    if (filePath.includes('/bpmn/')) return 'business-processes';
    if (filePath.includes('/dmn/') || filePath.includes('/decision')) return 'decision-support-logic';
    if (filePath.includes('/profiles/') || filePath.includes('/structuredefinition/')) return 'data-elements';
    // Add more mappings as needed
    return null;
  }
  
  async validateArtifact(filePath, content, options = {}) {
    const {
      dakComponent = null,
      includeWarnings = true,
      includeInfo = true,
      locale = 'en_US'
    } = options;
    
    // Phase 1: Return stub result
    return {
      valid: true,
      violations: [],
      metadata: {
        filePath,
        fileType: this.getFileType(filePath),
        dakComponent: dakComponent || this.detectComponent(filePath),
        timestamp: new Date()
      }
    };
  }
  
  async validateStagingGround(stagingGround) {
    // Phase 1: Return stub result
    return {
      summary: {
        totalFiles: stagingGround.files.length,
        validFiles: stagingGround.files.length,
        filesWithErrors: 0,
        filesWithWarnings: 0,
        filesWithInfo: 0,
        totalErrors: 0,
        totalWarnings: 0,
        totalInfo: 0
      },
      fileResults: [],
      metadata: {
        timestamp: new Date()
      }
    };
  }
  
  async validateRepository(owner, repo, branch, options = {}) {
    // Phase 1: Return stub result
    return {
      summary: {
        totalFiles: 0,
        validFiles: 0,
        filesWithErrors: 0,
        filesWithWarnings: 0,
        filesWithInfo: 0,
        totalErrors: 0,
        totalWarnings: 0,
        totalInfo: 0
      },
      fileResults: [],
      metadata: {
        repository: `${owner}/${repo}`,
        branch,
        timestamp: new Date()
      }
    };
  }
  
  async validateOnSave(filePath, content, dakComponent) {
    const result = await this.validateArtifact(filePath, content, {
      dakComponent,
      includeWarnings: true,
      includeInfo: true
    });
    
    return {
      canSave: result.violations.filter(v => v.level === 'error').length === 0,
      result
    };
  }
}

const dakArtifactValidationService = new DAKArtifactValidationService();
export default dakArtifactValidationService;
```

### Step 1.4: Create Directory Structure

```bash
# Create validation rules directory structure
mkdir -p src/validation/rules/dak
mkdir -p src/validation/rules/bpmn
mkdir -p src/validation/rules/dmn
mkdir -p src/validation/rules/xml
mkdir -p src/validation/rules/json
mkdir -p src/validation/rules/fhir
mkdir -p src/validation/rules/general

# Create index file
touch src/validation/index.js
```

### Step 1.5: Set Up Translation Keys

Add to `public/locales/en_US/translation.json`:

```json
{
  "validation": {
    "common": {
      "errors": "Errors",
      "warnings": "Warnings",
      "info": "Information",
      "cannotSave": "Cannot save due to validation errors",
      "savingAllowed": "Warnings present but saving is allowed"
    }
  }
}
```

### Step 1.6: Write Tests

```bash
# Create test directory
mkdir -p src/tests/validation

# Create test files
touch src/tests/validation/validationRuleRegistry.test.js
touch src/tests/validation/validationContext.test.js
touch src/tests/validation/dakArtifactValidationService.test.js
```

## Phase 2: Basic Validation Rules (Week 2-3)

### Step 2.1: Create First Validation Rule (DAK Dependency)

**Note:** This example uses JSON format (preferred) instead of YAML. YAML usage requires explicit consent.

**File**: `src/validation/rules/dak/smartBaseDependency.js`

```javascript
export default {
  code: 'DAK-DEPENDENCY-001',
  category: 'dak',
  level: 'error',
  dakComponent: null, // DAK-level, not component-specific
  fileTypes: ['json'], // JSON preferred; add 'yaml', 'yml' only with explicit consent
  
  labelKey: 'validation.dak.smartBaseDependency.label',
  descriptionKey: 'validation.dak.smartBaseDependency.description',
  suggestionKey: 'validation.dak.smartBaseDependency.suggestion',
  
  validate: async (fileContent, filePath, context) => {
    // Only validate if this is sushi-config.json (or .yaml with consent)
    if (!filePath.endsWith('sushi-config.json') && !filePath.endsWith('sushi-config.yaml')) {
      return { valid: true, violations: [] };
    }
    
    // Warn if YAML format is used
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      console.warn('YAML configuration file detected. JSON format is preferred.');
    }
    
    try {
      // Parse JSON or YAML
      let config;
      if (filePath.endsWith('.json')) {
        config = JSON.parse(fileContent);
      } else {
        const yaml = await import('yaml');
        config = yaml.parse(fileContent);
      }
      
      // Check for dependencies
      if (!config.dependencies) {
        return {
          valid: false,
          violations: [{
            line: 1,
            message: 'Missing dependencies section'
          }]
        };
      }
      
      // Check for smart.who.int.base
      if (!config.dependencies['smart.who.int.base']) {
        return {
          valid: false,
          violations: [{
            line: Object.keys(config).indexOf('dependencies') + 1,
            message: 'Missing smart.who.int.base dependency'
          }]
        };
      }
      
      return { valid: true, violations: [] };
      
    } catch (error) {
      return {
        valid: false,
        violations: [{
          line: 1,
          message: `YAML parsing error: ${error.message}`
        }]
      };
    }
  }
};
```

### Step 2.2: Add Translation Keys

Update `public/locales/en_US/translation.json`:

```json
{
  "validation": {
    "dak": {
      "smartBaseDependency": {
        "label": "SMART Base Dependency Required",
        "description": "A DAK IG SHALL have smart.who.int.base as a dependency",
        "suggestion": "Add 'smart.who.int.base: current' to the dependencies section of sushi-config.json (Note: JSON format preferred over YAML)"
      }
    }
  }
}
```

### Step 2.3: Register Rule

Update `src/validation/index.js`:

```javascript
import validationRuleRegistry from '../services/validationRuleRegistry';
import smartBaseDependency from './rules/dak/smartBaseDependency';

// Register all rules
validationRuleRegistry.register(smartBaseDependency);

export default validationRuleRegistry;
```

### Step 2.4: Update Service to Load Rules

Update `src/services/dakArtifactValidationService.js`:

```javascript
import validationRuleRegistry from '../validation/index'; // Import from index to trigger registration

class DAKArtifactValidationService {
  constructor() {
    this.ruleRegistry = validationRuleRegistry;
  }
  
  // Remove loadValidationRules() - rules auto-load from index
  // ... rest of implementation
}
```

### Step 2.5: Implement Actual Validation

Update `validateArtifact()` in `dakArtifactValidationService.js`:

```javascript
async validateArtifact(filePath, content, options = {}) {
  const {
    dakComponent = null,
    includeWarnings = true,
    includeInfo = true,
    locale = 'en_US'
  } = options;
  
  const fileType = this.getFileType(filePath);
  const component = dakComponent || this.detectComponent(filePath);
  
  // Get applicable rules
  const rules = component
    ? this.ruleRegistry.getByComponent(component)
    : this.ruleRegistry.getByFileType(fileType);
  
  // Also get file-type specific rules
  const fileTypeRules = this.ruleRegistry.getByFileType(fileType);
  
  // Combine and deduplicate
  const allRules = [...new Set([...rules, ...fileTypeRules])];
  
  // Create validation context
  const context = new ValidationContext(filePath, content);
  
  // Execute validations
  const violations = [];
  
  for (const rule of allRules) {
    try {
      const result = await rule.validate(content, filePath, context);
      
      if (!result.valid && result.violations) {
        result.violations.forEach(violation => {
          violations.push({
            code: rule.code,
            level: rule.level,
            labelKey: rule.labelKey,
            descriptionKey: rule.descriptionKey,
            suggestionKey: rule.suggestionKey,
            ...violation
          });
        });
      }
    } catch (error) {
      violations.push({
        code: rule.code,
        level: 'error',
        message: `Validation execution failed: ${error.message}`,
        line: 1
      });
    }
  }
  
  // Filter by level
  const filtered = violations.filter(v => {
    if (v.level === 'error') return true;
    if (v.level === 'warning' && includeWarnings) return true;
    if (v.level === 'info' && includeInfo) return true;
    return false;
  });
  
  return {
    valid: filtered.filter(v => v.level === 'error').length === 0,
    violations: filtered,
    metadata: {
      filePath,
      fileType,
      dakComponent: component,
      timestamp: new Date()
    }
  };
}
```

## Testing Strategy

### Unit Test Example

**File**: `src/tests/validation/rules/dak/smartBaseDependency.test.js`

```javascript
import smartBaseDependency from '../../../../validation/rules/dak/smartBaseDependency';
import ValidationContext from '../../../../services/validationContext';

describe('DAK SMART Base Dependency Rule', () => {
  test('should pass when smart.who.int.base dependency exists (JSON)', async () => {
    const jsonContent = JSON.stringify({
      dependencies: {
        'smart.who.int.base': 'current',
        'hl7.fhir.core': '4.0.1'
      }
    });
    
    const context = new ValidationContext('sushi-config.json', jsonContent);
    const result = await smartBaseDependency.validate(jsonContent, 'sushi-config.json', context);
    
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
  
  test('should fail when smart.who.int.base dependency is missing (JSON)', async () => {
    const jsonContent = JSON.stringify({
      dependencies: {
        'hl7.fhir.core': '4.0.1'
      }
    });
    
    const context = new ValidationContext('sushi-config.json', jsonContent);
    const result = await smartBaseDependency.validate(jsonContent, 'sushi-config.json', context);
    
    expect(result.valid).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].message).toContain('smart.who.int.base');
  });
  
  test('should skip validation for non-sushi-config files', async () => {
    const jsonContent = '{"other": "content"}';
    const context = new ValidationContext('other.json', jsonContent);
    const result = await smartBaseDependency.validate(jsonContent, 'other.json', context);
    
    expect(result.valid).toBe(true);
  });
});
```

Run tests:

```bash
npm test -- --testPathPattern=smartBaseDependency
```

## Integration Checklist

For each new validation rule:

- [ ] Create rule file in appropriate directory
- [ ] Add translation keys (en_US at minimum)
- [ ] Register rule in `src/validation/index.js`
- [ ] Write unit tests
- [ ] Test with real DAK files
- [ ] Document in main specification
- [ ] Add to CHANGELOG

## Debugging Tips

### Enable Validation Logging

```javascript
// In dakArtifactValidationService.js
const DEBUG = true; // Set to true for detailed logs

async validateArtifact(filePath, content, options = {}) {
  if (DEBUG) {
    console.log('Validating:', filePath);
    console.log('File type:', this.getFileType(filePath));
    console.log('Component:', this.detectComponent(filePath));
    console.log('Applicable rules:', rules.map(r => r.code));
  }
  // ... rest of implementation
}
```

### Test with Sample Files

Create test fixtures:

```bash
mkdir -p src/tests/fixtures/validation
```

Add sample files:
- `src/tests/fixtures/validation/valid-sushi-config.json`
- `src/tests/fixtures/validation/invalid-sushi-config.json`
- `src/tests/fixtures/validation/valid-bpmn.bpmn`
- `src/tests/fixtures/validation/invalid-bpmn.bpmn`

**Note:** Use JSON format for configuration files; YAML requires explicit consent.

### Use Console Commands

Test from browser console:

```javascript
import dakArtifactValidationService from './services/dakArtifactValidationService';

// Test with file content
const result = await dakArtifactValidationService.validateArtifact(
  'sushi-config.json',
  '{"dependencies": {"hl7.fhir.core": "4.0.1"}}'
);

console.log(result);
```

## Common Issues and Solutions

### Issue: Rules Not Loading

**Solution**: Check that rules are imported in `src/validation/index.js` and that the import statement is before the service instantiation.

### Issue: Translation Keys Not Found

**Solution**: Verify translation keys match exactly (case-sensitive) and that the locale file is properly loaded.

### Issue: Validation Too Slow

**Solution**: 
1. Add caching for parsed content
2. Use Web Workers for heavy parsing
3. Implement incremental validation

### Issue: Cross-File Validation Not Working

**Solution**: Ensure you're building an index of all relevant files before validation. See Phase 3 for cross-file validation implementation.

## Next Steps

After Phase 1 and 2:

1. Continue with Phase 3: Advanced Validation Rules
2. Implement BPMN and DMN specific rules
3. Add cross-file validation
4. Move to Phase 4: XSD Validation
5. Then Phase 5+: UI Integration

## Resources

- **WHO SMART Base**: https://worldhealthorganization.github.io/smart-base/
- **BPMN Spec**: https://www.omg.org/spec/BPMN/2.0/
- **DMN Spec**: https://www.omg.org/spec/DMN/1.3/
- **Main Documentation**: [dak-validation-framework.md](dak-validation-framework.md)

## Support

For questions during implementation:
1. Review the main documentation
2. Check architecture diagrams
3. Consult existing validation services (dakComplianceService, runtimeValidationService)
4. Review WHO standards and examples

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-10  
**Status**: Implementation Guide (Post-Approval)
