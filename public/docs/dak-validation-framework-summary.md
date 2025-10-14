# DAK Validation Framework - Executive Summary

## Overview

The **DAK Validation Framework** provides comprehensive validation of WHO SMART Guidelines Digital Adaptation Kit (DAK) artifacts. This document provides a high-level summary of the proposed implementation.

**Full Documentation**: See [dak-validation-framework.md](dak-validation-framework.md) for complete technical specification.

## Key Features

### 1. Multi-Context Validation
- **Staging Ground**: Validate uploaded artifacts before commit
- **GitHub Repository**: Validate existing artifacts in repository
- **Component Editors**: Real-time validation on save
- **Batch Validation**: Validate entire DAK or specific components

### 2. Comprehensive Rule Coverage

| Category | Example Rules | File Types |
|----------|---------------|------------|
| **DAK-Level** | SMART Base dependency required | sushi-config.json |
| **BPMN** | businessRuleTask ID required, Start events | .bpmn |
| **DMN** | Decision ID/label required, Links to BPMN | .dmn |
| **XML** | Well-formed, XSD schema validation | .xml, .bpmn, .dmn |
| **JSON** | Valid syntax, FHIR resource types | .json |
| **FHIR** | Profile structure, Resource validation, FSH syntax | .json, .fsh |
| **General** | File size, Naming conventions | All files |

### 3. Validation Levels

Validation results use colored button indicators following GitHub Pages deployment workflow styling:

- **Error** `[RED]`: Must be fixed before save/publication (can be overridden with explanation)
- **Warning** `[YELLOW]`: Should be addressed but allows save
- **Info** `[BLUE]`: Suggestions for best practices
- **Success** `[GREEN]`: Validation passed

### 4. Internationalization

All validation messages use translatable keys through the existing i18n framework:

```
validation.{category}.{ruleName}.{label|description|suggestion}
```

## Architecture

### Core Services

```
DAKArtifactValidationService
  ├── ValidationRuleRegistry (manages rules)
  ├── ValidationContext (provides utilities)
  └── XSDValidationService (schema validation)
```

### Integration Points

- **dakComplianceService** (existing) - Extended with new rules
- **runtimeValidationService** (existing) - Used for schema validation
- **githubService** (existing) - Fetches repository files
- **stagingGroundService** (existing) - Validates staged files
- **Component Editors** (existing) - Validates on save

## Validation Rule Structure

Each rule is defined in a separate file with metadata and logic separated:

```javascript
{
  code: 'BPMN-BUSINESS-RULE-TASK-ID-001',
  category: 'bpmn',
  level: 'error',
  dakComponent: 'business-processes',
  fileTypes: ['bpmn'],
  
  // Translatable keys
  labelKey: 'validation.bpmn.businessRuleTaskId.label',
  descriptionKey: 'validation.bpmn.businessRuleTaskId.description',
  
  // Validation function
  validate: async (content, path, context) => {
    // Returns { valid: boolean, violations: [] }
  }
}
```

## UI Integration

### DAK Dashboard - Publications Tab

```
┌─────────────────────────────────────┐
│ DAK Validation                      │
│                                     │
│ [Validate All Components]           │
│                                     │
│ Validate by Component:              │
│ ☑ Business Processes    [Validate]  │
│ ☑ Decision Logic        [Validate]  │
│ ☑ Data Elements        [Validate]  │
│                                     │
│ General Validations:                │
│ ☑ sushi-config.yaml    [Validate]  │
└─────────────────────────────────────┘
```

### Validation Report Modal

Shows detailed results with:
- Summary counts (errors/warnings/info)
- File-by-file breakdown
- Line numbers and specific violations
- Fix suggestions
- Export options

### Component Editors

- **Automatic validation** before save
- **Blocking dialog** for errors
- **Warning dialog** with save option
- **Info notifications** (non-blocking)

## Example Validation Rules

### 1. SMART Base Dependency (DAK-Level)
**Code**: `DAK-DEPENDENCY-001`  
**Level**: Error  
**Description**: A DAK IG SHALL have smart.who.int.base as a dependency  
**File**: sushi-config.yaml

### 2. Business Rule Task ID (BPMN)
**Code**: `BPMN-BUSINESS-RULE-TASK-ID-001`  
**Level**: Error  
**Description**: bpmn:businessRuleTask SHALL have an @id attribute  
**File**: .bpmn files

### 3. DMN Decision Structure (DMN)
**Code**: `DMN-DECISION-ID-001`  
**Level**: Error  
**Description**: dmn:decision SHALL have @label and @id attributes  
**File**: .dmn files

### 4. DMN-BPMN Linking (Cross-file)
**Code**: `DMN-BPMN-LINK-001`  
**Level**: Warning  
**Description**: DMN decision @id should link to bpmn:businessRuleTask in at least one BPMN diagram  
**Files**: .dmn and .bpmn files

## Implementation Phases

| Phase | Focus | Duration |
|-------|-------|----------|
| 1 | Core Infrastructure | 1-2 weeks |
| 2 | Basic Validation Rules | 2-3 weeks |
| 3 | Advanced Rules | 3-4 weeks |
| 4 | XSD Validation | 4-5 weeks |
| 5 | Dashboard UI | 5-6 weeks |
| 6 | Report UI | 6-7 weeks |
| 7 | Editor Integration | 7-8 weeks |
| 8 | Testing & Docs | 8-9 weeks |
| 9 | Performance | 9-10 weeks |
| 10 | Extensibility | 10+ weeks |

**Total Estimated Time**: 10 weeks for full implementation

## File Structure

```
src/
├── services/
│   ├── dakArtifactValidationService.js  (new)
│   ├── validationRuleRegistry.js        (new)
│   └── xsdValidationService.js          (new)
│
├── validation/
│   └── rules/
│       ├── dak/
│       ├── bpmn/
│       ├── dmn/
│       ├── xml/
│       ├── json/
│       └── fhir/
│
└── components/
    ├── ValidationReport.js              (new)
    ├── ValidationButton.js              (new)
    └── ValidationSummary.js             (new)
```

## Key Design Decisions

### ✅ What We're Doing

1. **Separation of Logic and Metadata** - Clean architecture for maintainability
2. **I18n from Start** - All messages translatable
3. **Existing Framework Integration** - Maximize use of current services
4. **Progressive Enhancement** - Works for staging and repository artifacts
5. **Component-Based Rules** - Rules organized by DAK component
6. **Multi-Level Validation** - Error/Warning/Info severity levels

### ⚠️ Clarifying Questions Needed

See full documentation for 15 detailed questions covering:
- Rule scope (built-in vs custom)
- UI/UX preferences
- Performance strategies
- I18n language priorities
- Integration points (CI/CD, CLI)
- Validation history
- Error recovery
- Configuration options

## Success Metrics

1. **Adoption Rate**: % of DAK Authors using validation
2. **Error Detection**: Validation errors caught before publication
3. **Publication Quality**: Reduction in post-publication issues
4. **User Satisfaction**: Survey feedback
5. **Performance**: Average validation time
6. **Coverage**: % of components with validation rules

## Standards Compliance

- **WHO SMART Base**: https://worldhealthorganization.github.io/smart-base/StructureDefinition-DAK.html
- **WHO Authoring Conventions**: https://smart.who.int/ig-starter-kit/authoring_conventions.html
- **BPMN 2.0**: https://www.omg.org/spec/BPMN/2.0/
- **DMN 1.3**: https://www.omg.org/spec/DMN/1.3/
- **FHIR R4**: http://hl7.org/fhir/R4/

## Next Steps

1. **Review Documentation**: Stakeholders review full specification
2. **Answer Questions**: Address 15 clarifying questions
3. **Approve Plan**: Get implementation approval
4. **Phase 1 Start**: Begin core infrastructure development

---

**Full Documentation**: [dak-validation-framework.md](dak-validation-framework.md)  
**Status**: Proposed - Awaiting Review  
**Version**: 1.0  
**Date**: 2025-01-10
