# DAK Validation Framework

The DAK Validation Framework provides comprehensive validation capabilities for WHO SMART Guidelines Digital Adaptation Kit (DAK) artifacts. This framework ensures that DAK components meet quality standards, follow authoring conventions, and maintain consistency across the ecosystem.

## Overview

The DAK Validation Framework is designed to:

- **Validate DAK artifacts** at multiple levels (DAK-level, component-level, file-level)
- **Support multiple file types** including XML, JSON, BPMN, DMN, YAML, and Markdown
- **Provide translatable validation messages** using the existing i18n framework
- **Enable real-time validation** during editing and batch validation for entire DAKs
- **Group validations by DAK components** for organized reporting and execution
- **Support extensibility** through modular validation definitions

## Architecture

### Core Components

1. **Validation Definitions** (`src/services/validations/`) - Individual validation rules in separate files
2. **Validation Registry** (`src/services/dakValidationRegistry.js`) - Central registry for all validations
3. **Enhanced Validation Service** (`src/services/enhancedDakValidationService.js`) - Main validation orchestrator
4. **Dashboard Integration** - UI components for running and displaying validation results
5. **Editor Integration** - Real-time validation during file editing

### Validation Levels

#### DAK Level Validations
- Repository structure compliance
- `sushi-config.yaml` validation against WHO SMART Guidelines requirements
- Dependency verification (smart.who.int.base)
- Authoring conventions compliance

#### Component Level Validations
- **Business Processes**: BPMN diagram validation, business rule task requirements
- **Decision Support Logic**: DMN table validation, decision element requirements
- **Core Data Elements**: Terminology validation, concept mapping
- **Test Scenarios**: Feature file validation, test case completeness
- **Publications**: IRIS reference validation
- **Requirements**: Functional/non-functional requirement structure
- **Indicators**: Measure definition validation

#### File Level Validations
- XML well-formedness and XSD validation
- JSON schema validation
- FHIR resource validation
- File naming conventions
- File size limits

## Validation Definition Structure

Each validation is defined in a separate file following this structure:

```javascript
// src/services/validations/bpmn-business-rule-task-id.js
export default {
  // Unique identifier for this validation
  id: 'bpmn-business-rule-task-id',
  
  // Component category this validation belongs to
  component: 'business-processes',
  
  // Validation level (error, warning, info)
  level: 'error',
  
  // File types this validation applies to
  fileTypes: ['bpmn', 'xml'],
  
  // Translatable description key
  descriptionKey: 'validation.bpmn.businessRuleTaskId.description',
  
  // Default English description (fallback)
  description: 'BPMN business rule tasks SHALL have an @id attribute',
  
  // Validation function
  async validate(filePath, content, context) {
    // Validation logic here
    // Returns null if valid, or validation result object if invalid
  },
  
  // Optional: Additional metadata
  metadata: {
    standard: 'BPMN 2.0',
    reference: 'https://smart.who.int/ig-starter-kit/authoring_conventions.html',
    severity: 'critical'
  }
};
```

## Validation Categories

### 1. DAK Compliance Validations

**DAK-SUSHI-BASE** - DAK IG SHAL have smart.who.int.base dependency
```yaml
# sushi-config.yaml
dependencies:
  smart.who.int.base: current
```

**DAK-AUTHORING-CONVENTIONS** - Follows WHO SMART Guidelines authoring conventions
- Reference: [WHO SMART Guidelines Authoring Conventions](https://smart.who.int/ig-starter-kit/authoring_conventions.html)

### 2. Business Process Validations

**BPMN-BUSINESS-RULE-TASK-ID** - Business rule tasks must have @id attribute
```xml
<!-- Valid -->
<bpmn:businessRuleTask id="determine-anc-contact-schedule" />

<!-- Invalid -->
<bpmn:businessRuleTask />
```

**BPMN-WELL-FORMED** - BPMN files must be well-formed XML

**BPMN-NAMESPACE** - BPMN files must use correct BPMN 2.0 namespace

### 3. Decision Support Logic Validations

**DMN-DECISION-LABEL-ID** - DMN decisions SHALL have @label and @id attributes
```xml
<!-- Valid -->
<dmn:decision id="determine-anc-contact-schedule" label="Determine ANC contact schedule">

<!-- Invalid -->
<dmn:decision>
```

**DMN-BPMN-CROSS-REFERENCE** - DMN @id should reference BPMN businessRuleTask
- Validates that DMN decision IDs are referenced by BPMN business rule tasks
- Ensures consistency between business processes and decision logic

**DMN-WELL-FORMED** - DMN files must be well-formed XML

**DMN-NAMESPACE** - DMN files must use correct DMN 1.3 namespace

### 4. File Structure Validations

**XML-WELL-FORMED** - XML files must be syntactically correct

**JSON-VALID** - JSON files must be valid JSON

**FILE-SIZE-LIMIT** - Files should be under reasonable size limits

**FILENAME-CONVENTIONS** - Files should follow naming conventions

### 5. FHIR Resource Validations

**FHIR-RESOURCE-TYPE** - FHIR resources should have valid resourceType

**FHIR-PROFILE-COMPLIANCE** - Resources should comply with WHO SMART Guidelines profiles

## Translation Support

Validation descriptions and messages support internationalization:

```javascript
// src/i18n/en/validations.json
{
  "validation": {
    "bpmn": {
      "businessRuleTaskId": {
        "description": "BPMN business rule tasks SHALL have an @id attribute",
        "message": "Business rule task at line {line} is missing required @id attribute",
        "suggestion": "Add an @id attribute to the businessRuleTask element"
      }
    }
  }
}
```

## Usage

### Programmatic Usage

```javascript
import enhancedDakValidationService from '../services/enhancedDakValidationService';

// Validate entire DAK
const dakResults = await enhancedDakValidationService.validateDAK(owner, repo, branch);

// Validate specific component
const componentResults = await enhancedDakValidationService.validateComponent(
  'business-processes', files
);

// Validate single file
const fileResults = await enhancedDakValidationService.validateFile(
  'workflow.bpmn', content
);
```

### Dashboard Integration

The DAK Dashboard includes a validation panel that:

1. **Groups validations by DAK component**
2. **Allows running individual or batch validations**
3. **Displays results with clear error/warning/info indicators**
4. **Provides actionable suggestions for fixing issues**
5. **Supports filtering and searching validation results**

### Editor Integration

Component editors automatically run relevant validations:

1. **Real-time validation** as users edit files
2. **Save-time validation** before allowing file saves
3. **Visual indicators** for validation status
4. **Inline error/warning display** with suggestions

## Extensibility

### Adding New Validations

1. Create validation definition file in `src/services/validations/`
2. Register validation in `dakValidationRegistry.js`
3. Add translation keys to language files
4. Add tests for the validation logic

### Custom Validation Logic

Validations can access rich context information:

```javascript
async validate(filePath, content, context) {
  // context.dakFiles - All files in the DAK
  // context.component - Current component being validated
  // context.githubService - Access to GitHub API
  // context.terminology - Access to terminology services
  
  // Custom validation logic
}
```

## Error Handling

The framework provides robust error handling:

- **Graceful degradation** when individual validations fail
- **Detailed error reporting** for debugging
- **Fallback to basic validations** when advanced features are unavailable
- **Rate limiting awareness** for external service calls

## Performance Considerations

- **Incremental validation** - Only validate changed files
- **Caching** - Cache validation results to avoid duplicate work
- **Parallel execution** - Run independent validations concurrently
- **Lazy loading** - Load validation definitions on demand

## Integration with External Services

The framework integrates with:

- **Open Concept Lab (OCL)** for terminology validation
- **IRIS Publications** for reference validation
- **GitHub API** for repository structure validation
- **WHO SMART Guidelines** for compliance checking

## Testing Strategy

Comprehensive testing includes:

- **Unit tests** for individual validations
- **Integration tests** for service interactions
- **End-to-end tests** for complete validation workflows
- **Performance tests** for large DAK validation
- **Accessibility tests** for UI components

## Integration with Component Editors

The DAK Validation Framework integrates seamlessly with component editors to provide real-time validation feedback during content creation and editing.

### Editor Integration Points

#### Save-Time Validation
Before any file is saved through a component editor, the framework automatically runs relevant validations:

```javascript
// Example integration in component editor
import enhancedDAKValidationService from '../services/enhancedDAKValidationService';

const saveFile = async (filePath, content) => {
  // Run validation before save
  const canSave = await enhancedDAKValidationService.canSaveFiles([{path: filePath, content}]);
  
  if (!canSave) {
    // Show validation errors to user
    const results = await enhancedDAKValidationService.validateFile(filePath, content);
    showValidationErrors(results);
    return false;
  }
  
  // Proceed with save
  return await actualSaveFunction(filePath, content);
};
```

#### Real-Time Validation
Editors can provide instant feedback as users type:

```javascript
// Debounced validation for real-time feedback
const validateAsUserTypes = useMemo(
  () => debounce(async (content) => {
    const results = await enhancedDAKValidationService.getEditorValidation(
      currentFilePath, 
      content, 
      currentComponent
    );
    setValidationResults(results);
  }, 500),
  [currentFilePath, currentComponent]
);
```

#### Component-Specific Validation
Each component editor automatically receives relevant validations:

- **BPMN Editor**: Business rule task validation, XML well-formedness
- **DMN Editor**: Decision table validation, cross-reference checking  
- **Questionnaire Editor**: FHIR resource validation, JSON syntax
- **Actor Editor**: Persona definition structure
- **Publications**: IRIS reference validation
- **Requirements Editor**: Functional/non-functional requirement structure

### Validation UI Integration

#### Inline Error Display
```jsx
// Example validation result display
{validationResults.map(result => (
  <div key={result.validationId} className={`validation-message ${result.level}`}>
    <span className="validation-icon">{getLevelIcon(result.level)}</span>
    <span className="validation-text">{result.message}</span>
    {result.suggestion && (
      <div className="validation-suggestion">{result.suggestion}</div>
    )}
  </div>
))}
```

#### Save Button State
```jsx
// Disable save when validation errors exist
<button 
  disabled={!canSave || validationResults.some(r => r.level === 'error')}
  onClick={handleSave}
>
  {canSave ? 'Save' : 'Fix Errors to Save'}
</button>
```

## Future Enhancements

Planned enhancements include:

- **IDE integration** through Language Server Protocol
- **CI/CD integration** for automated validation
- **Validation rule customization** per organization
- **Machine learning** for intelligent validation suggestions
- **Performance optimization** for large-scale validation

## References

- [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines)
- [Authoring Conventions](https://smart.who.int/ig-starter-kit/authoring_conventions.html)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
- [DMN 1.3 Specification](https://www.omg.org/spec/DMN/1.3/)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)