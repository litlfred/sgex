# DAK Component Questions Implementation Summary

This document summarizes the draft question sets created for each of the 9 DAK components, with implementation status and examples.

## Implementation Status

### ✅ Implemented Questions

#### DAK Level (2 questions)
- **`dak-name`**: "What is the name of this DAK?" - Extracts DAK name from sushi-config.yaml
- **`dak-version`**: "What is the version of this DAK?" - Extracts version metadata from sushi-config.yaml

#### Component Level (1 question)
- **`business-process-workflows`**: "What business process workflows are defined?" - Scans BPMN files for workflow definitions

#### Asset Level (4 questions)
- **`decision-table-inputs`**: "What are the inputs required for this decision table?" - Analyzes DMN files for input requirements *(original implementation)*
- **`decision-table-rules`**: "How many rules are defined in this decision table?" - Counts and analyzes rules in DMN decision tables *(NEW)*
- **`terminology-coverage`**: "What terminology standards are used in this data element?" - Analyzes files for terminology references *(NEW)*
- **`indicator-calculations`**: "How is this indicator calculated?" - Extracts calculation formulas and methods from indicator files *(NEW)*

### 📋 Draft Questions Defined (Not Yet Implemented)

## By DAK Component

### 1. Health Interventions and Recommendations
**Canonical Assets**: IRIS publication references, clinical guideline documents

**Proposed Questions**:
- `publication-references`: "What WHO publications are referenced in this intervention?"
- `guideline-sections`: "What sections are defined in this clinical guideline?"
- `intervention-scope`: "What health conditions does this intervention address?"

### 2. Generic Personas
**Canonical Assets**: Actor definition files, role specification documents

**Proposed Questions**:
- `actor-roles`: "What roles and responsibilities are defined for this actor?"
- `actor-qualifications`: "What qualifications are required for this actor?"
- `actor-workflows`: "Which workflows does this actor participate in?"

### 3. User Scenarios
**Canonical Assets**: Scenario narrative files, use case documents

**Proposed Questions**:
- `scenario-steps`: "What are the main steps in this user scenario?"
- `scenario-actors`: "Which actors are involved in this scenario?"
- `scenario-data-flow`: "What data is exchanged in this scenario?"

### 4. Generic Business Processes and Workflows ✅
**Canonical Assets**: BPMN diagram files (.bpmn)

**Implemented Questions**:
- `business-process-workflows`: Analysis of BPMN workflow definitions ✅

**Proposed Additional Questions**:
- `process-participants`: "Who are the participants in this business process?"
- `process-decision-points`: "What are the decision points in this process?"
- `process-duration`: "What is the expected duration of this process?"

### 5. Core Data Elements ✅ (Partial)
**Canonical Assets**: OCL terminology files, PCMT product catalogs, data dictionaries

**Implemented Questions**:
- `terminology-coverage`: Analysis of terminology standards usage ✅

**Proposed Additional Questions**:
- `data-constraints`: "What validation rules apply to this data element?"
- `element-relationships`: "How does this data element relate to other elements?"

### 6. Decision-Support Logic ✅
**Canonical Assets**: DMN decision table files (.dmn)

**Implemented Questions**:
- `decision-table-inputs`: Input requirements analysis ✅
- `decision-table-rules`: Rule counting and analysis ✅

**Proposed Additional Questions**:
- `decision-dependencies`: "What other decisions does this decision depend on?"

### 7. Program Indicators ✅ (Partial)
**Canonical Assets**: Indicator definition files, measurement specifications

**Implemented Questions**:
- `indicator-calculations`: Calculation formula analysis ✅

**Proposed Additional Questions**:
- `indicator-targets`: "What are the target values for this indicator?"
- `indicator-reporting`: "How often should this indicator be reported?"

### 8. Functional and Non-Functional Requirements
**Canonical Assets**: Requirements specification files, constraint definitions

**Proposed Questions**:
- `requirement-categories`: "What categories of requirements are defined?"
- `requirement-traceability`: "How do requirements trace to implementation?"
- `requirement-acceptance`: "What are the acceptance criteria for this requirement?"

### 9. Test Scenarios
**Canonical Assets**: Feature files, test case specifications, validation scenarios

**Proposed Questions**:
- `test-coverage`: "What functionality is covered by this test scenario?"
- `test-data-requirements`: "What test data is required for this scenario?"
- `test-automation`: "Can this test scenario be automated?"

## Implementation Details

### Technical Features Implemented

#### Multi-language Support
All implemented questions support:
- English (en_US)
- French (fr_FR) 
- Spanish (es_ES)
- Arabic (ar_AR) - partial
- Chinese (zh_CN) - partial
- Russian (ru_RU) - partial

#### File Type Support
- **JSON**: Full parsing and analysis
- **YAML**: Basic key-value parsing
- **XML**: Pattern-based extraction
- **DMN**: Full XML parsing with namespace support
- **BPMN**: XML parsing for process elements

#### Caching Strategy
- File-level caching (30 minutes for successful analysis)
- Short-term caching for errors (1 minute)
- Dependency tracking for cache invalidation

#### Error Handling
- Localized error messages
- Graceful degradation for parsing failures
- Warnings for incomplete data

### Parameter Registry Updates
Added new parameter definitions for:
- DMN file analysis (`dmn.assetFile`, `dmn.includeRuleDetails`)
- Data element analysis (`dataElement.assetFile`, `dataElement.checkTerminologyBinding`)
- Indicator analysis (`indicator.assetFile`, `indicator.includeFormula`, `indicator.analyzeComplexity`)

## Next Implementation Priority

### Phase 1 (High Priority)
1. **Decision-Support Logic**: `decision-dependencies` - DMN dependency analysis
2. **Core Data Elements**: `data-constraints` - Validation rule extraction
3. **Program Indicators**: `indicator-targets` - Target value analysis

### Phase 2 (Medium Priority)
1. **Business Processes**: `process-participants` - BPMN participant analysis
2. **Generic Personas**: `actor-roles` - Actor definition parsing
3. **Test Scenarios**: `test-coverage` - Feature file analysis

### Phase 3 (Lower Priority)
1. **Health Interventions**: `publication-references` - IRIS reference extraction
2. **User Scenarios**: `scenario-steps` - Narrative step parsing
3. **Requirements**: `requirement-categories` - Requirement classification

## Files Created/Modified

### New Question Components
- `/src/dak/faq/questions/asset/decisionSupportLogic/DecisionTableRulesQuestion.js`
- `/src/dak/faq/questions/asset/coreDataElements/TerminologyCoverageQuestion.js`
- `/src/dak/faq/questions/asset/programIndicators/IndicatorCalculationsQuestion.js`

### Documentation
- `/docs/dak/faq/component-questions-draft.md` - Complete draft question catalog
- `/docs/dak/faq/parameters/registry.yaml` - Updated parameter definitions

### Infrastructure
- Created directory structure for organizing questions by component type
- Established patterns for asset-level question implementation

## Usage Examples

### React Component Usage
```jsx
// DMN rule analysis
<FAQAnswer 
  questionId="decision-table-rules" 
  parameters={{repository: "owner/repo", assetFile: "input/cql/IMMZ.D2.DT.BCG.dmn"}} 
/>

// Terminology analysis
<FAQAnswer 
  questionId="terminology-coverage" 
  parameters={{repository: "owner/repo", assetFile: "input/profiles/patient-profile.json"}} 
/>

// Indicator calculation analysis
<FAQAnswer 
  questionId="indicator-calculations" 
  parameters={{repository: "owner/repo", assetFile: "input/measures/vaccination-coverage.json"}} 
/>
```

### MCP Server API Usage
```bash
curl -X POST http://127.0.0.1:3001/faq/questions/execute \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "questionId": "decision-table-rules",
        "parameters": {
          "repository": "owner/repo",
          "assetFile": "input/cql/example.dmn"
        }
      }
    ]
  }'
```

## Key Architectural Decisions

1. **Component-Based Organization**: Questions organized by DAK component type in directory structure
2. **Template Pattern**: Asset-level questions use template pattern for bulk analysis
3. **Multi-format Support**: Parsing strategies for JSON, YAML, XML, and specialized formats
4. **Internationalization**: Built-in i18n support from the start
5. **Extensible Parameters**: YAML-based parameter registry for easy extension

This implementation provides a solid foundation for dynamic DAK analysis with particular strength in decision support logic, terminology standards, and indicator calculations.