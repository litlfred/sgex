# DAK Validation Framework

## 1. Overview

The **DAK Validation Framework** provides a comprehensive, extensible system for validating WHO SMART Guidelines Digital Adaptation Kit (DAK) artifacts across multiple storage contexts (GitHub repositories and staging ground) and multiple file types (XML, JSON, Markdown, BPMN, DMN, FHIR resources, etc.).

### 1.1 Purpose

This framework enables:
- **DAK Authors** to validate artifacts during authoring and before publication
- **Automated validation** when files are saved via DAK component editors
- **Batch validation** across entire DAK repositories
- **Component-specific validation** based on DAK component types
- **Multi-level validation** (errors, warnings, info) with translatable messages
- **Extensibility** for future validation rules and file types

### 1.2 Design Principles

1. **Separation of Concerns**: Validation logic is cleanly separated from metadata (codes, labels, descriptions)
2. **Internationalization**: All validation messages are translatable through the existing i18n framework
3. **Framework Integration**: Maximizes use of existing application frameworks (dakComplianceService, runtimeValidationService)
4. **Authoritative Standards**: References WHO SMART Base logical models at https://worldhealthorganization.github.io/smart-base/
5. **Progressive Enhancement**: Works for both staging ground uploads and existing repository artifacts
6. **Composability**: Individual validators can be combined and configured per DAK component
7. **JSON-First Configuration**: Strongly prefers JSON over YAML for configuration files

### 1.2.1 Important Note on Configuration File Formats

**⚠️ YAML Usage Policy for SGeX Application:**
- **YAML configuration files (.yaml, .yml) are strongly discouraged for SGeX application features** without explicit stakeholder consent
- **JSON format (.json) is the preferred configuration format** for new SGeX application features
- **Exception**: `sushi-config.yaml` is REQUIRED as it is an external FSH/SUSHI tooling requirement, not an SGeX feature
- Any new YAML file usage in SGeX application code requires documented justification and approval
- This policy applies to SGeX-specific configuration, not to external DAK tooling requirements

This policy ensures better tooling support, type safety, and consistency across the SGeX application while respecting external tooling requirements.

### 1.3 Key References

- **WHO SMART Base DAK Structure**: https://worldhealthorganization.github.io/smart-base/StructureDefinition-DAK.html
- **WHO SMART Guidelines Authoring Conventions**: https://smart.who.int/ig-starter-kit/authoring_conventions.html
- **WHO Enterprise Architecture**: http://smart.who.int/ra
- **BPMN 2.0 Specification**: https://www.omg.org/spec/BPMN/2.0/
- **DMN 1.3 Specification**: https://www.omg.org/spec/DMN/1.3/
- **DAK Logical Model Implementation**: See `DAK_LOGICAL_MODEL_UPDATE_PLAN.md` and `DAK_IMPLEMENTATION_STATUS.md` in repository root
- **DAK Core Package**: `packages/dak-core/` - TypeScript implementation of DAK Component Objects

## 2. Validation Rule Structure

### 2.1 Validation Rule File Format

Each validation rule SHALL be defined in its own file following this structure:

```javascript
// File: src/validation/rules/bpmn/businessRuleTaskIdRequired.js

export default {
  // Metadata
  code: 'BPMN-BUSINESS-RULE-TASK-ID-001',
  category: 'bpmn',
  level: 'error', // 'error', 'warning', or 'info'
  
  // Translatable labels and descriptions
  labelKey: 'validation.bpmn.businessRuleTaskId.label',
  descriptionKey: 'validation.bpmn.businessRuleTaskId.description',
  suggestionKey: 'validation.bpmn.businessRuleTaskId.suggestion',
  
  // Component association
  dakComponent: 'business-processes', // Which DAK component this applies to
  
  // File type matching
  fileTypes: ['bpmn'], // File extensions this validator applies to
  
  // Validation logic (completely separate from metadata)
  validate: async (fileContent, filePath, context) => {
    // Returns { valid: boolean, violations: [] }
    const parser = await context.getXMLParser();
    const doc = parser.parseFromString(fileContent, 'text/xml');
    
    const businessRuleTasks = doc.querySelectorAll('bpmn\\:businessRuleTask, businessRuleTask');
    const violations = [];
    
    businessRuleTasks.forEach(task => {
      if (!task.getAttribute('id')) {
        violations.push({
          line: context.getLineNumber(task),
          column: context.getColumnNumber(task),
          elementPath: context.getXPath(task),
          details: {
            elementType: 'businessRuleTask',
            missingAttribute: 'id'
          }
        });
      }
    });
    
    return {
      valid: violations.length === 0,
      violations
    };
  }
};
```

### 2.2 Translation File Structure

Corresponding translations in `public/locales/en_US/translation.json`:

```json
{
  "validation": {
    "bpmn": {
      "businessRuleTaskId": {
        "label": "Business Rule Task ID Required",
        "description": "In BPMN diagrams, a bpmn:businessRuleTask SHALL have an @id attribute",
        "suggestion": "Add an 'id' attribute to the businessRuleTask element with a unique identifier that matches a DMN decision table ID"
      }
    },
    "dmn": {
      "decisionIdRequired": {
        "label": "DMN Decision ID Required",
        "description": "DMN tables SHALL have dmn:decision with @label and @id as required",
        "suggestion": "Ensure each dmn:decision element has both 'id' and 'label' attributes defined"
      },
      "decisionLinkedToBpmn": {
        "label": "DMN Decision Linked to BPMN",
        "description": "DMN tables @id is associated to a bpmn:businessRuleTask with the same id in at least one BPMN diagram",
        "suggestion": "Create a corresponding bpmn:businessRuleTask element in a BPMN diagram with the same ID as this DMN decision"
      }
    }
  }
}
```

### 2.3 Validation Rule Registry

A central registry manages all validation rules:

```javascript
// File: src/services/validationRuleRegistry.js

class ValidationRuleRegistry {
  constructor() {
    this.rules = new Map();
    this.rulesByComponent = new Map();
    this.rulesByFileType = new Map();
  }
  
  /**
   * Register a validation rule
   */
  register(rule) {
    this.rules.set(rule.code, rule);
    
    // Index by component
    if (!this.rulesByComponent.has(rule.dakComponent)) {
      this.rulesByComponent.set(rule.dakComponent, []);
    }
    this.rulesByComponent.get(rule.dakComponent).push(rule);
    
    // Index by file type
    rule.fileTypes.forEach(fileType => {
      if (!this.rulesByFileType.has(fileType)) {
        this.rulesByFileType.set(fileType, []);
      }
      this.rulesByFileType.get(fileType).push(rule);
    });
  }
  
  /**
   * Get rules for a specific DAK component
   */
  getByComponent(componentName) {
    return this.rulesByComponent.get(componentName) || [];
  }
  
  /**
   * Get rules for a specific file type
   */
  getByFileType(fileType) {
    return this.rulesByFileType.get(fileType) || [];
  }
  
  /**
   * Get all rules
   */
  getAllRules() {
    return Array.from(this.rules.values());
  }
}
```

## 3. Validation Service Architecture

### 3.1 Core Validation Service

The framework extends the existing `dakComplianceService` with enhanced capabilities:

```javascript
// File: src/services/dakArtifactValidationService.js

class DAKArtifactValidationService {
  constructor() {
    this.ruleRegistry = new ValidationRuleRegistry();
    this.loadValidationRules();
  }
  
  /**
   * Validate a single artifact file
   * @param {string} filePath - Path to the file
   * @param {string|Buffer} content - File content
   * @param {Object} options - Validation options
   * @returns {Promise<ValidationResult>}
   */
  async validateArtifact(filePath, content, options = {}) {
    const {
      dakComponent = null,
      includeWarnings = true,
      includeInfo = true,
      locale = 'en_US'
    } = options;
    
    // Determine file type
    const fileType = this.getFileType(filePath);
    
    // Get applicable rules
    const rules = dakComponent
      ? this.ruleRegistry.getByComponent(dakComponent)
      : this.ruleRegistry.getByFileType(fileType);
    
    // Execute validations
    const results = await this.executeValidations(
      rules, 
      content, 
      filePath,
      locale
    );
    
    return this.formatResults(results, includeWarnings, includeInfo);
  }
  
  /**
   * Validate all artifacts in staging ground
   * @param {Object} stagingGround - Staging ground object
   * @returns {Promise<ValidationReport>}
   */
  async validateStagingGround(stagingGround) {
    const fileValidations = await Promise.all(
      stagingGround.files.map(file => 
        this.validateArtifact(file.path, file.content, {
          dakComponent: this.detectComponent(file.path)
        })
      )
    );
    
    return this.aggregateResults(fileValidations);
  }
  
  /**
   * Validate artifacts in GitHub repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @param {Object} options - Validation options
   * @returns {Promise<ValidationReport>}
   */
  async validateRepository(owner, repo, branch, options = {}) {
    const {
      components = null, // Array of component names, or null for all
      pathPatterns = null // Array of glob patterns to filter files
    } = options;
    
    // Fetch repository structure
    const files = await this.fetchRepositoryFiles(
      owner, 
      repo, 
      branch,
      pathPatterns
    );
    
    // Filter by components if specified
    const filesToValidate = components
      ? files.filter(f => components.includes(this.detectComponent(f.path)))
      : files;
    
    // Validate files
    const fileValidations = await Promise.all(
      filesToValidate.map(async file => {
        const content = await this.fetchFileContent(owner, repo, branch, file.path);
        return this.validateArtifact(file.path, content, {
          dakComponent: this.detectComponent(file.path)
        });
      })
    );
    
    return this.aggregateResults(fileValidations);
  }
  
  /**
   * Validate on save (called by DAK component editors)
   * @param {string} filePath - File being saved
   * @param {string|Buffer} content - File content
   * @param {string} dakComponent - DAK component type
   * @returns {Promise<ValidationResult>}
   */
  async validateOnSave(filePath, content, dakComponent) {
    const result = await this.validateArtifact(filePath, content, {
      dakComponent,
      includeWarnings: true,
      includeInfo: true
    });
    
    // Block save if there are errors
    return {
      canSave: result.errors.length === 0,
      result
    };
  }
}
```

### 3.2 Validation Context

A context object provides utility functions to validators:

```javascript
class ValidationContext {
  constructor(filePath, content) {
    this.filePath = filePath;
    this.content = content;
    this.parsers = new Map();
  }
  
  async getXMLParser() {
    if (!this.parsers.has('xml')) {
      const DOMParser = await import('xmldom').then(m => m.DOMParser);
      this.parsers.set('xml', new DOMParser());
    }
    return this.parsers.get('xml');
  }
  
  async getJSONParser() {
    return JSON; // Native JSON parser
  }
  
  getLineNumber(node) {
    // Implementation to get line number from XML node
  }
  
  getColumnNumber(node) {
    // Implementation to get column number from XML node
  }
  
  getXPath(node) {
    // Implementation to get XPath of XML node
  }
}
```

### 3.3 Integration with Existing Services

The validation framework integrates with existing services:

- **dakComplianceService**: Extends with new validation rules
- **runtimeValidationService**: Uses for schema validation (JSON Schema, XSD)
- **githubService**: Fetches repository files for validation
- **stagingGroundService**: Validates staged files before commit
- **i18n (react-i18next)**: Translates validation messages
- **packages/dak-core**: Integrates with DAK Component Objects and Source resolution
- **DAKObject/DAKFactory**: Validates dak.json structure and component sources

### 3.4 DAK Core Package Integration

The validation framework leverages the new **packages/dak-core** TypeScript implementation:

```javascript
import { DAKFactory, DAKComponentType } from 'dak-core';

// Example: Validate DAK component sources
async function validateDAKSources(owner, repo, branch) {
  // Create DAK object from repository
  const dak = await DAKFactory.createFromRepository(owner, repo, branch);
  
  // Validate each component's sources
  const components = [
    DAKComponentType.HEALTH_INTERVENTIONS,
    DAKComponentType.BUSINESS_PROCESSES,
    DAKComponentType.DATA_ELEMENTS,
    // ... other components
  ];
  
  const validationResults = [];
  for (const componentType of components) {
    const componentObject = dak.getComponent(componentType);
    const sources = await componentObject.getSources();
    
    // Validate each source (canonical, url, instance)
    for (const source of sources) {
      const result = await validateComponentSource(source, componentType);
      validationResults.push(result);
    }
  }
  
  return validationResults;
}
```

## 4. Validation Rules Specification

### 4.1 DAK-Level Validations

#### DAK-DEPENDENCY-001: SMART Base Dependency Required
- **Description**: A DAK IG SHALL have smart.who.int.base as a dependency
- **Level**: error
- **File**: sushi-config.yaml (required by FSH/SUSHI tooling)
- **Implementation**: Check `dependencies` section for `smart.who.int.base` key

#### DAK-JSON-STRUCTURE-001: dak.json Valid Structure
- **Description**: dak.json SHALL conform to WHO SMART Base DAK logical model structure
- **Level**: error
- **Component**: All
- **File**: dak.json
- **Implementation**: Validate against DAK JSON schema from packages/dak-core

#### DAK-COMPONENT-SOURCES-001: Valid Component Sources
- **Description**: All DAK component sources SHALL use valid source types (canonical, url, or instance)
- **Level**: error
- **Component**: All
- **File**: dak.json
- **Implementation**: 
  - Validate each component source has at least one: canonical, url, or instance
  - Canonical URLs must be valid IRI format
  - Relative URLs must be relative to input/ directory
  - Absolute URLs must be valid HTTP/HTTPS URLs

#### DAK-AUTHORING-CONVENTIONS: WHO Authoring Conventions
- **Description**: Follow WHO SMART Guidelines authoring conventions from https://smart.who.int/ig-starter-kit/authoring_conventions.html
- **Level**: warning
- **Component**: All
- **Implementation**: Multiple sub-rules for different convention aspects

### 4.2 BPMN-Specific Validations

#### BPMN-BUSINESS-RULE-TASK-ID-001: Business Rule Task ID Required
- **Description**: In BPMN diagrams, a bpmn:businessRuleTask SHALL have an @id attribute
- **Level**: error
- **Component**: business-processes
- **File Types**: .bpmn
- **Implementation**: XPath query for `//bpmn:businessRuleTask` without `@id`

#### BPMN-START-EVENT-001: Start Event Required
- **Description**: BPMN process should have at least one start event
- **Level**: warning
- **Component**: business-processes
- **File Types**: .bpmn
- **Implementation**: Check for presence of `bpmn:startEvent`

#### BPMN-NAMESPACE-001: BPMN 2.0 Namespace Required
- **Description**: BPMN files must use correct BPMN 2.0 namespace
- **Level**: error
- **Component**: business-processes
- **File Types**: .bpmn
- **Implementation**: Validate namespace URI `http://www.omg.org/spec/BPMN/20100524/MODEL`

### 4.3 DMN-Specific Validations

#### DMN-DECISION-ID-001: Decision ID and Label Required
- **Description**: DMN tables SHALL have dmn:decision with @label and @id as required
- **Level**: error
- **Component**: decision-support-logic
- **File Types**: .dmn
- **Implementation**: XPath query for `//dmn:decision` checking for `@id` and `@label` attributes

#### DMN-BPMN-LINK-001: DMN Decision Linked to BPMN
- **Description**: DMN tables @id is associated to a bpmn:businessRuleTask with the same id in at least one BPMN diagram
- **Level**: warning
- **Component**: decision-support-logic
- **File Types**: .dmn
- **Implementation**: Cross-reference DMN decision IDs with BPMN businessRuleTask IDs across repository

#### DMN-NAMESPACE-001: DMN 1.3 Namespace Required
- **Description**: DMN files must use correct DMN 1.3 namespace
- **Level**: error
- **Component**: decision-support-logic
- **File Types**: .dmn
- **Implementation**: Validate namespace URI `https://www.omg.org/spec/DMN/20191111/MODEL/`

### 4.4 XML-Specific Validations

#### XML-WELL-FORMED-001: XML Well-Formed
- **Description**: XML files must be well-formed
- **Level**: error
- **Component**: All (where XML is used)
- **File Types**: .xml, .bpmn, .dmn, .xsd
- **Implementation**: XML parser validation

#### XML-SCHEMA-VALIDATION: XSD Schema Validation
- **Description**: XML files should validate against provided XSD schemas
- **Level**: warning
- **Component**: All (where XML is used)
- **File Types**: .xml
- **Implementation**: XSD validation service (to be implemented)

### 4.5 JSON-Specific Validations

#### JSON-SYNTAX-001: Valid JSON Syntax
- **Description**: JSON files must have valid JSON syntax
- **Level**: error
- **Component**: All (where JSON is used)
- **File Types**: .json
- **Implementation**: JSON.parse with error handling

#### FHIR-RESOURCE-TYPE-001: Valid FHIR Resource Type
- **Description**: FHIR resources should have valid resourceType
- **Level**: warning
- **Component**: All FHIR components
- **File Types**: .json (in FHIR directories)
- **Implementation**: Check for valid FHIR R4 resourceType values

### 4.6 FHIR-Specific Validations

#### FHIR-PROFILE-001: FHIR Profile Structure
- **Description**: FHIR StructureDefinition profiles should follow WHO SMART Guidelines conventions
- **Level**: warning
- **Component**: data-elements, fhir-profiles
- **File Types**: .json, .fsh
- **Implementation**: Validate StructureDefinition structure

#### FHIR-FSH-SYNTAX-001: FHIR Shorthand Syntax
- **Description**: FSH (FHIR Shorthand) files must have valid syntax
- **Level**: error
- **Component**: data-elements, fhir-profiles, fhir-extensions
- **File Types**: .fsh
- **Implementation**: Parse FSH content and validate syntax against FHIR Shorthand grammar

#### FHIR-FSH-CONVENTIONS-001: FSH Naming Conventions
- **Description**: FSH resource names should follow WHO SMART Guidelines naming conventions
- **Level**: warning
- **Component**: data-elements, fhir-profiles, fhir-extensions
- **File Types**: .fsh
- **Implementation**: Validate resource names, IDs, and paths follow conventions

### 4.7 General File Validations

#### FILE-SIZE-001: File Size Limit
- **Description**: Files should be under 1MB for optimal performance
- **Level**: info
- **Component**: All
- **File Types**: *
- **Implementation**: Check file size

#### FILE-NAMING-001: File Naming Conventions
- **Description**: Files should follow WHO SMART Guidelines naming conventions
- **Level**: info
- **Component**: All
- **File Types**: *
- **Implementation**: Regex validation of file names

## 5. UI Integration

### 5.1 DAK Dashboard Integration

Add a "Validation" section to the DAK Dashboard Publications tab:

```
┌─────────────────────────────────────────────────────────┐
│ DAK Dashboard > Publications                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ DAK Validation                                      │ │
│ │                                                      │ │
│ │ Run validation checks on your DAK artifacts:        │ │
│ │                                                      │ │
│ │ ┌──────────────────┐  ┌──────────────────┐         │ │
│ │ │ Validate All     │  │ Validation       │         │ │
│ │ │ Components       │  │ History          │         │ │
│ │ └──────────────────┘  └──────────────────┘         │ │
│ │                                                      │ │
│ │ Validate by Component:                              │ │
│ │                                                      │ │
│ │ ☑ Business Processes        [Validate] [RED: 3 errors] │ │
│ │ ☑ Decision Support Logic    [Validate] [YELLOW: 1 warn] │ │
│ │ ☑ Data Elements            [Validate] [GREEN: Valid]   │ │
│ │ ☐ Program Indicators       [Validate]              │ │
│ │ ☐ Test Scenarios           [Validate]              │ │
│ │                                                      │ │
│ │ General Validations (not component-specific):       │ │
│ │ ☑ sushi-config.yaml        [Validate] [GREEN: Valid] │ │
│ │ ☑ File naming conventions  [Validate] [BLUE: 2 info]  │ │
│ │                                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Validation Report Modal

When validation is run, display results in a modal:

```
┌─────────────────────────────────────────────────────────┐
│ Validation Report - Business Processes                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Summary:                                                 │
│ • 3 errors                                              │
│ • 1 warning                                             │
│ • 0 info                                                │
│                                                          │
│ ──────────────────────────────────────────────────────  │
│                                                          │
│ [RED] input/bpmn/anc-workflow.bpmn                         │
│    BPMN-BUSINESS-RULE-TASK-ID-001                       │
│    Business Rule Task ID Required                       │
│    Line 45: businessRuleTask missing required @id       │
│    Suggestion: Add an 'id' attribute matching DMN...    │
│                                                          │
│ [RED] input/bpmn/delivery-workflow.bpmn                    │
│    BPMN-NAMESPACE-001                                   │
│    BPMN 2.0 Namespace Required                          │
│    Incorrect namespace URI                              │
│                                                          │
│ [YELLOW] input/bpmn/screening-workflow.bpmn                  │
│    BPMN-START-EVENT-001                                 │
│    Start Event Required                                 │
│    BPMN process should have at least one start event    │
│                                                          │
│ ──────────────────────────────────────────────────────  │
│                                                          │
│ [Export Report] [Validate Again] [Close]                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Component Editor Integration

When saving files from component editors (BPMN Editor, DMN Editor, etc.):

1. Run validation automatically before save
2. If errors: Show dialog with validation results and option to override
3. If warnings only: Show dialog with option to save anyway
4. If info only: Save and show non-blocking notification

```
┌─────────────────────────────────────────────────────────┐
│ [RED] Validation Errors Detected                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ The following errors were found:                        │
│                                                          │
│ [RED] BPMN-BUSINESS-RULE-TASK-ID-001                    │
│    Business Rule Task missing required @id attribute    │
│    Line 45, Column 12                                   │
│                                                          │
│ Options:                                                 │
│ • [Fix Issues] - Return to editor to fix errors         │
│ • [Override & Save] - Save with errors (explanation     │
│   required)                                              │
│ • [Cancel] - Discard changes                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Override Dialog** (when user selects "Override & Save"):

```
┌─────────────────────────────────────────────────────────┐
│ Override Validation Errors                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ You are about to save with 1 validation error(s).       │
│                                                          │
│ Please provide an explanation for overriding:           │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Required explanation text area]                    │ │
│ │                                                      │ │
│ │                                                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ [Save with Override] [Cancel]                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Staging Ground Integration

The Staging Ground component already has validation integration. Extend it:

```javascript
// In StagingGround.js
const validateStagingGround = async (stagingGroundData) => {
  // Use new artifact validation service
  const validationResult = await dakArtifactValidationService.validateStagingGround(
    stagingGroundData
  );
  setValidation(validationResult);
  
  // Update UI to show detailed validation results
  updateValidationUI(validationResult);
};

// Allow save with override option for errors
const handleSave = async () => {
  const validationResult = await validateStagingGround(stagingGround);
  
  if (validationResult.errors.length > 0) {
    // Show override dialog
    setShowOverrideDialog(true);
  } else {
    // Proceed with save
    await commitToRepository();
  }
};

const handleOverrideSave = async (explanation) => {
  if (!explanation || explanation.trim().length < 10) {
    setError('Explanation must be at least 10 characters');
    return;
  }
  
  // Save with override metadata
  await commitToRepository({
    overrideValidation: true,
    overrideExplanation: explanation,
    validationErrors: validationResult.errors
  });
};
```

**Note on Staging Ground Validation:**
- Validation errors do NOT block saving to staging ground
- Users can override validation errors by providing a required explanation
- Override explanations are logged with the commit metadata
- This allows flexibility while maintaining audit trail of validation bypasses

## 6. File Structure

### 6.1 Directory Organization

```
sgex/
├── packages/
│   └── dak-core/                                   (existing - TypeScript DAK implementation)
│       ├── src/
│       │   ├── dakObject.ts                        (DAK instance management)
│       │   ├── dakFactory.ts                       (DAK creation factory)
│       │   ├── dakComponentObject.ts               (Base component class)
│       │   ├── sourceResolution.ts                 (Source type resolution)
│       │   ├── stagingGroundIntegration.ts         (Staging ground bridge)
│       │   ├── components/                         (9 Component Objects)
│       │   │   ├── healthInterventions.ts
│       │   │   ├── personas.ts
│       │   │   ├── userScenarios.ts
│       │   │   ├── businessProcesses.ts
│       │   │   ├── dataElements.ts
│       │   │   ├── decisionLogic.ts
│       │   │   ├── indicators.ts
│       │   │   ├── requirements.ts
│       │   │   └── testScenarios.ts
│       │   └── schemas/                            (JSON schemas)
│       │       ├── dak-component-source.schema.json
│       │       └── core-data-element.schema.json
│       │
├── src/
│   ├── services/
│   │   ├── dakArtifactValidationService.js      (new - main service)
│   │   ├── validationRuleRegistry.js            (new - rule management)
│   │   ├── validationContext.js                 (new - validation helpers)
│   │   ├── xsdValidationService.js              (new - XSD validation)
│   │   ├── dakComplianceService.js              (existing - extend)
│   │   ├── runtimeValidationService.ts          (existing - use)
│   │   ├── ComponentObjectProvider.js           (existing - DAK core integration)
│   │   └── stagingGroundService.js              (existing - staging operations)
│   │
│   ├── validation/
│   │   ├── rules/
│   │   │   ├── dak/                             (DAK-level rules)
│   │   │   │   ├── smartBaseDependency.js
│   │   │   │   ├── dakJsonStructure.js          (new - validate dak.json)
│   │   │   │   ├── componentSources.js          (new - validate sources)
│   │   │   │   └── authoringConventions.js
│   │   │   │
│   │   │   ├── bpmn/                            (BPMN rules)
│   │   │   │   ├── businessRuleTaskIdRequired.js
│   │   │   │   ├── startEventRequired.js
│   │   │   │   └── namespaceRequired.js
│   │   │   │
│   │   │   ├── dmn/                             (DMN rules)
│   │   │   │   ├── decisionIdRequired.js
│   │   │   │   ├── decisionLinkedToBpmn.js
│   │   │   │   └── namespaceRequired.js
│   │   │   │
│   │   │   ├── xml/                             (XML rules)
│   │   │   │   ├── wellFormed.js
│   │   │   │   └── schemaValidation.js
│   │   │   │
│   │   │   ├── json/                            (JSON rules)
│   │   │   │   └── syntaxValid.js
│   │   │   │
│   │   │   ├── fhir/                            (FHIR rules)
│   │   │   │   ├── resourceTypeValid.js
│   │   │   │   └── profileStructure.js
│   │   │   │
│   │   │   └── general/                         (General rules)
│   │   │       ├── fileSize.js
│   │   │       └── namingConventions.js
│   │   │
│   │   └── index.js                             (Rule loader/exporter)
│   │
│   ├── components/
│   │   ├── ValidationReport.js                  (new - validation report modal)
│   │   ├── ValidationButton.js                  (new - trigger validation)
│   │   ├── ValidationSummary.js                 (new - summary display)
│   │   └── DAKDashboard.js                      (existing - add validation section)
│   │
│   └── tests/
│       └── validation/
│           ├── dakArtifactValidationService.test.js
│           ├── validationRuleRegistry.test.js
│           └── rules/
│               ├── bpmn.test.js
│               ├── dmn.test.js
│               └── dak.test.js
│
├── public/
│   ├── locales/
│   │   ├── en_US/
│   │   │   └── translation.json                 (extend with validation messages)
│   │   └── es_ES/
│   │       └── translation.json                 (Spanish translations)
│   │
│   └── docs/
│       └── dak-validation-framework.md          (this document)
│
└── packages/
    └── dak-core/
        └── src/
            └── validation.ts                    (existing - may extend)
```

### 6.2 XSD Schemas

For XML validation against XSD schemas:

```
sgex/
└── public/
    └── schemas/
        ├── bpmn/
        │   └── BPMN20.xsd
        ├── dmn/
        │   └── DMN13.xsd
        └── fhir/
            └── fhir-all.xsd
```

## 7. Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Create ValidationRuleRegistry service
- [ ] Create ValidationContext helper
- [ ] Create DAKArtifactValidationService skeleton
- [ ] Implement rule loading mechanism
- [ ] Set up translation keys structure
- [ ] Integrate with packages/dak-core DAKObject and Component Objects

### Phase 2: Basic Validation Rules (Week 2-3)
- [ ] Implement DAK-level validations (sushi-config.yaml)
- [ ] Implement dak.json structure validation using DAK core schemas
- [ ] Implement component source validation (canonical, url, instance)
- [ ] Implement XML well-formedness validation
- [ ] Implement JSON syntax validation
- [ ] Implement basic BPMN validations (namespace, start event)
- [ ] Implement basic DMN validations (namespace, decision structure)

### Phase 3: Advanced Validation Rules (Week 3-4)
- [ ] Implement BPMN businessRuleTask ID validation
- [ ] Implement DMN decision ID and label validation
- [ ] Implement DMN-BPMN cross-reference validation
- [ ] Implement FHIR resource type validation
- [ ] Implement FSH syntax validation (using FHIR FSH rules)
- [ ] Implement file size and naming validations
- [ ] Add validation for component source URL resolution

### Phase 4: XSD Validation (Week 4-5)
- [ ] Create XSDValidationService
- [ ] Add BPMN 2.0 XSD schema
- [ ] Add DMN 1.3 XSD schema
- [ ] Integrate XSD validation with validation rules
- [ ] Handle validation errors and line numbers

### Phase 5: UI Integration - Dashboard (Week 5-6)
- [ ] Add Validation section to DAK Dashboard Publications tab
- [ ] Implement component selection checkboxes
- [ ] Implement "Validate All" button
- [ ] Create ValidationButton component
- [ ] Create ValidationSummary component
- [ ] Add validation status badges to component cards

### Phase 6: UI Integration - Reports (Week 6-7)
- [ ] Create ValidationReport modal component
- [ ] Implement error/warning/info filtering
- [ ] Add file navigation links
- [ ] Implement export report functionality
- [ ] Add validation history tracking

### Phase 7: Editor Integration (Week 7-8)
- [ ] Integrate validation into BPMN editor save flow
- [ ] Integrate validation into DMN editor save flow
- [ ] Integrate validation into other component editors
- [ ] Implement blocking/non-blocking validation dialogs
- [ ] Add real-time validation indicators

### Phase 8: Testing and Documentation (Week 8-9)
- [ ] Write comprehensive unit tests
- [ ] Write integration tests
- [ ] Write end-to-end tests
- [ ] Update user documentation
- [ ] Create validation rule authoring guide
- [ ] Add examples for each validation rule

### Phase 9: Performance Optimization (Week 9-10)
- [ ] Implement caching for validation results
- [ ] Add incremental validation (only validate changed files)
- [ ] Optimize cross-reference validations
- [ ] Add progress indicators for long validations
- [ ] Implement cancellable validation operations

### Phase 10: Extensibility and Future Features (Week 10+)
- [ ] Create validation rule authoring API
- [ ] Add support for custom validation rules
- [ ] Implement validation plugins system
- [ ] Add CI/CD integration for automated validation
- [ ] Create validation badge for README

## 8. Technical Considerations

### 8.1 DAK Core Package Integration

The validation framework integrates with the **packages/dak-core** TypeScript implementation:

#### Using DAKObject for Validation
```javascript
import { DAKFactory, DAKComponentType } from 'dak-core';

async function validateDAKRepository(owner, repo, branch) {
  // Create DAK object from repository
  const dak = await DAKFactory.createFromRepository(owner, repo, branch);
  
  // Validate dak.json structure
  const dakJsonValid = await validateDAKJsonStructure(dak.toJSON());
  
  // Validate component sources
  const sourceValidations = await validateComponentSources(dak);
  
  // Validate artifacts referenced by sources
  const artifactValidations = await validateComponentArtifacts(dak);
  
  return {
    dakJsonValid,
    sourceValidations,
    artifactValidations
  };
}
```

#### Source Type Validation
The framework validates all three source types:

1. **Canonical (IRI)**: Validate IRI format and accessibility
2. **URL (Absolute/Relative)**: Validate URL format and file existence
3. **Instance (Inline Data)**: Validate against component-specific schemas

```javascript
async function validateSource(source, componentType) {
  if (source.canonical) {
    // Validate canonical IRI format
    if (!isValidIRI(source.canonical)) {
      return { valid: false, error: 'Invalid canonical IRI format' };
    }
  }
  
  if (source.url) {
    // Check if URL is absolute or relative
    if (isAbsoluteURL(source.url)) {
      // Validate absolute URL accessibility
      return await validateAbsoluteURL(source.url);
    } else {
      // Validate relative URL points to existing file in input/
      return await validateRelativeURL(source.url, componentType);
    }
  }
  
  if (source.instance) {
    // Validate inline instance data against component schema
    return await validateInstanceData(source.instance, componentType);
  }
  
  return { valid: false, error: 'Source must have canonical, url, or instance' };
}
```

### 8.2 Performance

- **Lazy Loading**: Validation rules should be loaded on-demand
- **Caching**: Cache validation results with file content hash
- **Incremental Validation**: Only re-validate changed files
- **Web Workers**: Consider using Web Workers for heavy XML/JSON parsing
- **Pagination**: For large repositories, validate in batches
- **DAK Object Caching**: Reuse DAKObject instances when validating multiple components

### 8.3 Cross-File Validation

Some validations require checking multiple files (e.g., DMN-BPMN linking):

```javascript
class CrossFileValidator {
  async validate(files, rule) {
    // Build index of all relevant elements across files
    const index = await this.buildIndex(files, rule.indexStrategy);
    
    // Check each file against the index
    const results = [];
    for (const file of files) {
      const violations = await rule.validate(file, index);
      if (violations.length > 0) {
        results.push({ file, violations });
      }
    }
    
    return results;
  }
}
```

### 8.3 Asynchronous Validation

All validation operations are asynchronous to avoid blocking UI:

```javascript
// Start validation
const validationPromise = dakArtifactValidationService.validateRepository(
  owner, repo, branch
);

// Show progress indicator
showValidationProgress(validationPromise);

// Handle results
validationPromise.then(results => {
  showValidationReport(results);
}).catch(error => {
  showValidationError(error);
});
```

### 8.4 Error Handling

Robust error handling for validation failures:

```javascript
try {
  const result = await validator.validate(content);
  return result;
} catch (error) {
  return {
    valid: false,
    violations: [{
      code: 'VALIDATION_ERROR',
      level: 'error',
      message: `Validation failed: ${error.message}`,
      details: { error: error.stack }
    }]
  };
}
```

## 9. Testing Strategy

### 9.1 Unit Tests

Each validation rule has its own test file:

```javascript
// File: src/tests/validation/rules/bpmn/businessRuleTaskIdRequired.test.js

describe('BPMN Business Rule Task ID Validation', () => {
  test('should pass when all businessRuleTasks have IDs', async () => {
    const bpmnContent = `
      <bpmn:definitions>
        <bpmn:process>
          <bpmn:businessRuleTask id="decision_001" />
        </bpmn:process>
      </bpmn:definitions>
    `;
    
    const result = await rule.validate(bpmnContent, 'test.bpmn', context);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
  
  test('should fail when businessRuleTask is missing ID', async () => {
    const bpmnContent = `
      <bpmn:definitions>
        <bpmn:process>
          <bpmn:businessRuleTask />
        </bpmn:process>
      </bpmn:definitions>
    `;
    
    const result = await rule.validate(bpmnContent, 'test.bpmn', context);
    expect(result.valid).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].details.missingAttribute).toBe('id');
  });
});
```

### 9.2 Integration Tests

Test the complete validation flow:

```javascript
describe('DAKArtifactValidationService Integration', () => {
  test('should validate entire staging ground', async () => {
    const stagingGround = {
      files: [
        { path: 'input/bpmn/workflow.bpmn', content: validBpmnContent },
        { path: 'input/dmn/decision.dmn', content: validDmnContent }
      ]
    };
    
    const report = await service.validateStagingGround(stagingGround);
    expect(report.totalFiles).toBe(2);
    expect(report.totalErrors).toBe(0);
  });
});
```

### 9.3 End-to-End Tests

Test UI interactions:

```javascript
describe('Validation UI', () => {
  test('should show validation report when clicking validate button', async () => {
    // Setup test DAK
    // Click validate button
    // Wait for modal to appear
    // Check modal content
  });
});
```

## 10. Clarifying Questions

### 10.1 Validation Rule Scope

**Q1**: Should the validation framework support custom/user-defined validation rules, or only built-in WHO SMART Guidelines rules?

**Options**:
- A) Only built-in rules maintained by the SGeX team
- B) Support custom rules via configuration files
- C) Support custom rules via plugin system
- D) Support both built-in and custom rules with clear separation

**Recommendation**: Option D - Support both built-in and custom rules with clear separation. This provides maximum flexibility while maintaining quality standards for WHO-endorsed validations.

---

**Q2**: For cross-file validations (e.g., DMN-BPMN linking), should we validate across:
- A) Only files in the staging ground
- B) Only files already committed to the repository
- C) Both staging ground and repository files combined
- D) Configurable by user

**Recommendation**: Option C - Validate across both staging ground and repository files. This ensures validation reflects the complete state after save.

---

**Q3**: Should XSD schema validation be:
- A) Always run (error if schema not available)
- B) Optional (warning if schema not available)
- C) Opt-in (disabled by default, enabled per validation run)
- D) Automatic for known file types, skipped for unknown types

**Recommendation**: Option D - Automatic for known file types (BPMN, DMN, FHIR XML), skipped for others. Provides best balance of validation coverage and flexibility.

### 10.2 UI/UX Design

**Q4**: Where should validation results be displayed?
- A) Only in modal dialogs (current proposal)
- B) Inline in component editors with annotations
- C) Dedicated validation report page
- D) All of the above with different views for different contexts

**Recommendation**: Option D - Multiple views for different contexts. Modal for quick checks, inline for editors, dedicated page for detailed analysis.

---

**Q5**: Should validation be:
- A) Always manual (triggered by user)
- B) Automatic on save (blocking)
- C) Automatic on save (non-blocking background)
- D) Configurable per user preference

**Recommendation**: Option D - Configurable with smart defaults. Errors block save, warnings show but allow save, info runs in background.

---

**Q6**: For the Publications tab validation section, should we:
- A) Group only by DAK component (current proposal)
- B) Group by file type (BPMN, DMN, JSON, etc.)
- C) Group by severity (errors, warnings, info)
- D) Support multiple grouping options with tabs/toggle

**Recommendation**: Option D - Default to component grouping, allow switching to severity or file type grouping.

### 10.3 Performance and Scalability

**Q7**: For large DAK repositories (1000+ files), should validation:
- A) Validate all files on every run (may be slow)
- B) Use incremental validation (only changed files)
- C) Allow user to select specific paths/components
- D) Implement sampling/statistical validation
- E) Combination of B and C

**Recommendation**: Option E - Implement incremental validation with selective validation options. Full validation available but with progress indication.

---

**Q8**: Should validation results be:
- A) Cached in memory only (lost on page refresh)
- B) Persisted in localStorage (available across sessions)
- C) Stored in GitHub (as workflow artifacts or gists)
- D) Combination of B and C

**Recommendation**: Option B initially, with Option C as future enhancement for CI/CD integration.

### 10.4 Internationalization

**Q9**: For validation message translations, should we:
- A) Only support English initially
- B) Support English and Spanish (WHO working languages)
- C) Support full i18n from the start (all SGeX languages)
- D) Support English with i18n infrastructure for future expansion

**Recommendation**: Option D - English with i18n infrastructure. Add Spanish and other languages in subsequent iterations based on user feedback.

### 10.5 Integration Points

**Q10**: Should validation integrate with:
- A) Only SGeX Workbench UI
- B) GitHub Actions (CI/CD validation on push)
- C) Command-line tool for local validation
- D) External validation services (e.g., FHIR validator)
- E) All of the above

**Recommendation**: Option A initially (SGeX UI), with B and D as high-priority future enhancements. Option C as lower priority.

---

**Q11**: For DAK component editors (BPMN, DMN), should validation:
- A) Only run on save (current proposal)
- B) Run in real-time as user edits (live validation)
- C) Run on user request (validate button in editor)
- D) Combination of B and A (live + pre-save)

**Recommendation**: Option D - Real-time validation for syntax errors (non-blocking), comprehensive validation on save (blocking for errors).

### 10.6 Validation History and Reporting

**Q12**: Should we maintain a validation history?
- A) No history - only show latest validation results
- B) Keep history in memory during session
- C) Persist history in localStorage
- D) Store history in GitHub (commit metadata, workflow runs)

**Recommendation**: Option C initially - Store last 10 validation runs in localStorage. Option D as future enhancement.

---

**Q13**: Should validation reports be exportable as:
- A) JSON (machine-readable)
- B) HTML (human-readable with styling)
- C) Markdown (GitHub-compatible)
- D) CSV (for spreadsheet analysis)
- E) All of the above

**Recommendation**: Option C and A - Markdown for GitHub integration, JSON for programmatic use. Others as future enhancements.

### 10.7 Error Recovery

**Q14**: When validation fails due to system errors (not validation violations), should we:
- A) Show error and stop
- B) Skip failed file and continue with others
- C) Retry with exponential backoff
- D) Allow user to choose (skip/retry/abort)

**Recommendation**: Option B with notification - Skip and continue, show summary of any system errors at the end.

### 10.8 Validation Levels

**Q15**: Should we support custom validation level configuration?
- A) Fixed levels (error, warning, info) as specified
- B) Allow users to change severity of individual rules
- C) Allow profile-based severity sets (strict/relaxed)
- D) Fixed levels with option C for advanced users

**Recommendation**: Option A initially - Fixed levels ensure consistency. Option C as future enhancement for different deployment scenarios.

## 11. Success Metrics

To measure the success of the DAK Validation Framework:

1. **Adoption Rate**: % of DAK Authors using validation before publication
2. **Error Detection**: Number of validation errors caught before publication
3. **Publication Quality**: Reduction in issues reported after publication
4. **User Satisfaction**: Survey feedback on validation usefulness
5. **Performance**: Average validation time per file type
6. **Coverage**: % of DAK components with active validation rules

## 12. Future Enhancements

### 12.1 Short-term (Next 6 months)
- GitHub Actions integration for CI/CD
- FHIR Validator integration
- Additional WHO authoring convention rules
- Performance optimizations

### 12.2 Medium-term (6-12 months)
- Command-line validation tool
- Custom rule authoring UI
- Validation badges for README
- Automated fix suggestions

### 12.3 Long-term (12+ months)
- Machine learning for validation pattern detection
- Collaborative validation (team review workflow)
- Validation API for external tools
- Integration with WHO publication pipeline

## 13. References

### 13.1 WHO Standards
- WHO SMART Base: https://worldhealthorganization.github.io/smart-base/
- WHO SMART Guidelines: https://www.who.int/teams/digital-health-and-innovation/smart-guidelines
- WHO IG Starter Kit: https://smart.who.int/ig-starter-kit/
- WHO Authoring Conventions: https://smart.who.int/ig-starter-kit/authoring_conventions.html

### 13.2 Technical Standards
- BPMN 2.0: https://www.omg.org/spec/BPMN/2.0/
- DMN 1.3: https://www.omg.org/spec/DMN/1.3/
- FHIR R4: http://hl7.org/fhir/R4/
- JSON Schema: https://json-schema.org/

### 13.3 SGeX Documentation
- Requirements: public/docs/requirements.md
- DAK Components: public/docs/dak-components.md
- Solution Architecture: public/docs/solution-architecture.md
- Compliance Framework: public/docs/compliance-framework.md

## 14. Appendices

### Appendix A: Example Validation Rule (Complete)

See Section 2.1 for complete example.

### Appendix B: Validation Result Schema

```typescript
interface ValidationResult {
  valid: boolean;
  violations: Violation[];
  metadata: {
    filePath: string;
    fileType: string;
    dakComponent: string | null;
    timestamp: Date;
    validatorVersion: string;
  };
}

interface Violation {
  code: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  location: {
    line?: number;
    column?: number;
    xpath?: string;
    jsonPath?: string;
  };
  details: Record<string, any>;
}

interface ValidationReport {
  summary: {
    totalFiles: number;
    validFiles: number;
    filesWithErrors: number;
    filesWithWarnings: number;
    filesWithInfo: number;
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
  };
  fileResults: ValidationResult[];
  crossFileViolations: Violation[];
  metadata: {
    repository: string;
    branch: string;
    timestamp: Date;
    duration: number;
  };
}
```

### Appendix C: Translation Key Structure

```
validation.
  {category}.
    {ruleName}.
      label        - Short rule title
      description  - Detailed description
      suggestion   - How to fix
```

Example:
```
validation.bpmn.businessRuleTaskId.label
validation.bpmn.businessRuleTaskId.description
validation.bpmn.businessRuleTaskId.suggestion
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-10  
**Author**: SGeX Development Team  
**Status**: Proposed - Awaiting Stakeholder Review
