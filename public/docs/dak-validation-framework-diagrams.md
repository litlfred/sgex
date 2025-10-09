# DAK Validation Framework - Architecture Diagrams

This document provides visual representations of the DAK Validation Framework architecture.

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DAK Author (User)                                │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ Interacts via
                             ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          UI Components                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  • DAK Dashboard (Validation Section)                                   │
│  • ValidationReport Modal                                               │
│  • Component Editors (BPMN, DMN, etc.)                                 │
│  • Staging Ground Component                                             │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ Calls
                             ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                  DAKArtifactValidationService                           │
├─────────────────────────────────────────────────────────────────────────┤
│  • validateArtifact()       - Single file validation                    │
│  • validateStagingGround()  - Staging ground validation                │
│  • validateRepository()     - Repository validation                     │
│  • validateOnSave()         - Editor save validation                   │
└──┬──────────────────────────────────────────────────────────────────┬───┘
   │                                                                  │
   │ Uses                                                            │ Uses
   ↓                                                                  ↓
┌──────────────────────────┐                        ┌─────────────────────┐
│ ValidationRuleRegistry   │                        │ ValidationContext   │
├──────────────────────────┤                        ├─────────────────────┤
│ • register(rule)         │                        │ • getXMLParser()    │
│ • getByComponent()       │                        │ • getJSONParser()   │
│ • getByFileType()        │                        │ • getLineNumber()   │
│ • getAllRules()          │                        │ • getXPath()        │
└──────────┬───────────────┘                        └─────────────────────┘
           │
           │ Manages
           ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        Validation Rules                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  DAK Rules      BPMN Rules     DMN Rules      XML Rules    JSON Rules   │
│  • Dependency   • TaskID       • DecisionID   • WellFormed • Syntax     │
│  • Conventions  • StartEvent   • BPMNLink     • Schema     • FHIR       │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ Validated Against
                             ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         DAK Artifacts                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  • GitHub Repository Files                                              │
│  • Staging Ground Files                                                 │
│  • Component Editor Files                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Validation Flow

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ├─────────────┬─────────────┬─────────────┬──────────────┐
       ↓             ↓             ↓             ↓              ↓
  Click      Save in      Upload to    Staging    Navigate to
  Validate   Editor       Staging      Ground     Dashboard
  Button                  Ground       Save       Validation
       │             │             │             │              │
       └─────────────┴─────────────┴─────────────┴──────────────┘
                                   │
                                   ↓
                    ┌──────────────────────────────┐
                    │ DAKArtifactValidationService │
                    └──────────────┬───────────────┘
                                   │
                                   ↓
                    ┌──────────────────────────────┐
                    │  Determine File Type &       │
                    │  DAK Component               │
                    └──────────────┬───────────────┘
                                   │
                                   ↓
                    ┌──────────────────────────────┐
                    │  Get Applicable Rules from   │
                    │  ValidationRuleRegistry      │
                    └──────────────┬───────────────┘
                                   │
                                   ↓
                    ┌──────────────────────────────┐
                    │  Execute Validation Rules    │
                    │  (parallel for independence) │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │                              │
                    ↓                              ↓
         ┌────────────────────┐        ┌────────────────────┐
         │ Single-File Rules  │        │ Cross-File Rules   │
         │ • XML Well-Formed  │        │ • DMN-BPMN Link    │
         │ • JSON Syntax      │        │ • ID Uniqueness    │
         │ • Task ID          │        │                    │
         └────────┬───────────┘        └──────────┬─────────┘
                  │                               │
                  └───────────┬───────────────────┘
                              │
                              ↓
                   ┌────────────────────┐
                   │  Aggregate Results │
                   └──────────┬─────────┘
                              │
                   ┌──────────┴─────────┐
                   │                    │
                   ↓                    ↓
            Has Errors?           Only Warnings/Info?
                   │                    │
            ┌──────┴───────┐            ↓
            ↓              ↓      ┌──────────────┐
     Block Save      Show Modal  │ Allow Save   │
     Show Errors     with Option │ Show Results │
                                  └──────────────┘
```

## 3. Validation Rule Execution

```
┌───────────────────────────────────────────────────────────┐
│                    Validation Rule                        │
├───────────────────────────────────────────────────────────┤
│  {                                                        │
│    code: 'BPMN-BUSINESS-RULE-TASK-ID-001',               │
│    category: 'bpmn',                                      │
│    level: 'error',                                        │
│    dakComponent: 'business-processes',                    │
│    fileTypes: ['bpmn'],                                   │
│                                                           │
│    validate: async (content, path, context) => {         │
│      // Validation logic here                            │
│    }                                                      │
│  }                                                        │
└─────────────────┬─────────────────────────────────────────┘
                  │
                  │ Receives
                  ↓
┌───────────────────────────────────────────────────────────┐
│                 Validation Context                        │
├───────────────────────────────────────────────────────────┤
│  • filePath: 'input/bpmn/workflow.bpmn'                  │
│  • content: <XML content>                                │
│  • Utilities:                                            │
│    - getXMLParser()                                      │
│    - getLineNumber(node)                                 │
│    - getXPath(node)                                      │
└─────────────────┬─────────────────────────────────────────┘
                  │
                  │ Uses to Parse and Inspect
                  ↓
┌───────────────────────────────────────────────────────────┐
│                    File Content                           │
├───────────────────────────────────────────────────────────┤
│  <bpmn:definitions>                                       │
│    <bpmn:process>                                         │
│      <bpmn:businessRuleTask />  ← Missing ID!            │
│      <bpmn:businessRuleTask id="decision_001" />         │
│    </bpmn:process>                                        │
│  </bpmn:definitions>                                      │
└─────────────────┬─────────────────────────────────────────┘
                  │
                  │ Analyzes
                  ↓
┌───────────────────────────────────────────────────────────┐
│                Validation Result                          │
├───────────────────────────────────────────────────────────┤
│  {                                                        │
│    valid: false,                                          │
│    violations: [{                                         │
│      code: 'BPMN-BUSINESS-RULE-TASK-ID-001',             │
│      level: 'error',                                      │
│      message: 'Business Rule Task ID Required',          │
│      location: {                                          │
│        line: 45,                                          │
│        xpath: '/bpmn:process/bpmn:businessRuleTask[1]'   │
│      },                                                   │
│      suggestion: 'Add id attribute...'                   │
│    }]                                                     │
│  }                                                        │
└───────────────────────────────────────────────────────────┘
```

## 4. Component Integration

```
┌───────────────────────────────────────────────────────────────────┐
│                        DAK Dashboard                              │
├───────────────────────────────────────────────────────────────────┤
│  ┌────────────┬────────────────┬────────────────────┐           │
│  │ Components │  Publications  │        FAQ         │           │
│  └────────────┴────────────────┴────────────────────┘           │
│                     │                                             │
│                     │ Publications Tab Selected                   │
│                     ↓                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │               DAK Validation Section                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  [Validate All]  [History]                                 ││
│  │                                                             ││
│  │  Validate by Component:                                    ││
│  │  ☑ Business Processes    [Validate] ❌ 3 errors           ││
│  │  ☑ Decision Logic         [Validate] ⚠️ 1 warning          ││
│  │  ☑ Data Elements         [Validate] ✅ Valid               ││
│  │                                                             ││
│  │  General Validations:                                      ││
│  │  ☑ sushi-config.yaml     [Validate] ✅ Valid               ││
│  └─────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────┘
                               │
                               │ Click "Validate"
                               ↓
                  ┌────────────────────────────┐
                  │  ValidationButton          │
                  │  • Shows loading state     │
                  │  • Calls validation service│
                  │  • Opens report modal      │
                  └────────────┬───────────────┘
                               │
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                  ValidationReport Modal                          │
├──────────────────────────────────────────────────────────────────┤
│  Validation Report - Business Processes                          │
│  ──────────────────────────────────────────────────────────────  │
│  Summary: 3 errors, 1 warning                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ❌ input/bpmn/anc-workflow.bpmn                           │ │
│  │    BPMN-BUSINESS-RULE-TASK-ID-001                         │ │
│  │    Line 45: businessRuleTask missing @id                  │ │
│  │    Suggestion: Add id matching DMN decision...            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [Export Report] [Validate Again] [Close]                       │
└──────────────────────────────────────────────────────────────────┘
```

## 5. Editor Save Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Component Editor                          │
│                   (BPMN/DMN/etc.)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ User clicks "Save"
                     ↓
         ┌───────────────────────────┐
         │  validateOnSave()         │
         │  (Pre-save validation)    │
         └───────────┬───────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
         ↓                        ↓
  Has Errors?              Only Warnings/Info?
         │                        │
         ↓                        ↓
  ┌─────────────────┐    ┌──────────────────┐
  │ Block Save      │    │ Show Dialog:     │
  │                 │    │ • Warnings list  │
  │ Show Modal:     │    │ • [Save Anyway]  │
  │ • Error list    │    │ • [Cancel]       │
  │ • [Fix Issues]  │    └────────┬─────────┘
  │ • [Cancel]      │             │
  └─────────────────┘             ↓
                           ┌──────────────┐
                           │ User chooses │
                           └──────┬───────┘
                                  │
                    ┌─────────────┴──────────────┐
                    ↓                            ↓
             Save Anyway?                   Cancel?
                    │                            │
                    ↓                            ↓
            ┌──────────────┐            ┌──────────────┐
            │ Proceed with │            │ Return to    │
            │ Save         │            │ Editor       │
            └──────────────┘            └──────────────┘
```

## 6. Cross-File Validation

```
┌─────────────────────────────────────────────────────────────────┐
│            DMN-BPMN Cross-Reference Validation                  │
└─────────────────────────────────────────────────────────────────┘

Step 1: Index BPMN Files
┌──────────────────────────────────────────────────────────────┐
│ input/bpmn/workflow1.bpmn                                    │
│   businessRuleTasks: ['decision_001', 'decision_002']        │
│                                                              │
│ input/bpmn/workflow2.bpmn                                    │
│   businessRuleTasks: ['decision_003']                        │
└──────────────────────────────────────────────────────────────┘
                               │
                               │ Build Index
                               ↓
                  ┌────────────────────────┐
                  │ BPMN Task ID Index     │
                  │ • decision_001         │
                  │ • decision_002         │
                  │ • decision_003         │
                  └────────────────────────┘

Step 2: Validate DMN Files Against Index
┌──────────────────────────────────────────────────────────────┐
│ input/dmn/decisions.dmn                                      │
│   decisions: [                                               │
│     { id: 'decision_001', label: 'Assess Risk' }    ✅      │
│     { id: 'decision_004', label: 'Determine Care' } ❌      │
│   ]                                                          │
└──────────────────────────────────────────────────────────────┘
                               │
                               │ Check Against Index
                               ↓
┌──────────────────────────────────────────────────────────────┐
│ Validation Results:                                          │
│                                                              │
│ ⚠️  decision_004: Not linked to any BPMN businessRuleTask   │
│     Suggestion: Create corresponding businessRuleTask in    │
│     a BPMN diagram with id='decision_004'                   │
└──────────────────────────────────────────────────────────────┘
```

## 7. Service Interaction Diagram

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────┐
│  UI Component   │      │   Validation     │      │   GitHub       │
│  (Dashboard)    │      │   Service        │      │   Service      │
└────────┬────────┘      └────────┬─────────┘      └───────┬────────┘
         │                        │                        │
         │ validateRepository()   │                        │
         │───────────────────────>│                        │
         │                        │                        │
         │                        │ getFiles(owner,repo)   │
         │                        │───────────────────────>│
         │                        │                        │
         │                        │<───────────────────────│
         │                        │   file list            │
         │                        │                        │
         │                        │ getContent(path)       │
         │                        │───────────────────────>│
         │                        │                        │
         │                        │<───────────────────────│
         │                        │   file content         │
         │                        │                        │
         │                        │ (validate content)     │
         │                        │                        │
         │<───────────────────────│                        │
         │   validation results   │                        │
         │                        │                        │
         │ (render report)        │                        │
         │                        │                        │
```

## 8. Rule Registration Flow

```
┌────────────────────────────────────────────────────────┐
│          Application Initialization                    │
└────────────────────────────────────────────────────────┘
                         │
                         ↓
┌────────────────────────────────────────────────────────┐
│    DAKArtifactValidationService Constructor            │
└─────────────────────┬──────────────────────────────────┘
                      │
                      │ loadValidationRules()
                      ↓
┌────────────────────────────────────────────────────────┐
│    Import all rule files from src/validation/rules/   │
└─────────────────────┬──────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        ↓             ↓             ↓             ↓
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ DAK Rules│  │BPMN Rules│  │DMN Rules │  │XML Rules │
  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
       │             │             │             │
       └─────────────┴─────────────┴─────────────┘
                      │
                      │ For each rule
                      ↓
         ┌────────────────────────────┐
         │ registry.register(rule)    │
         └────────────┬───────────────┘
                      │
                      ↓
┌────────────────────────────────────────────────────────┐
│            ValidationRuleRegistry                      │
├────────────────────────────────────────────────────────┤
│  rules: Map<code, rule>                               │
│  rulesByComponent: Map<component, rule[]>             │
│  rulesByFileType: Map<fileType, rule[]>               │
└────────────────────────────────────────────────────────┘
```

## 9. Translation Integration

```
┌────────────────────────────────────────────────────────┐
│              Validation Rule Definition                │
├────────────────────────────────────────────────────────┤
│  {                                                     │
│    labelKey: 'validation.bpmn.businessRuleTaskId.label'│
│    descriptionKey: '...description'                    │
│    suggestionKey: '...suggestion'                      │
│  }                                                     │
└────────────────────┬───────────────────────────────────┘
                     │
                     │ Runtime: t(labelKey)
                     ↓
┌────────────────────────────────────────────────────────┐
│         i18n Translation Service                       │
└────────────────────┬───────────────────────────────────┘
                     │
                     │ Lookup key in locale
                     ↓
┌────────────────────────────────────────────────────────┐
│    public/locales/{locale}/translation.json            │
├────────────────────────────────────────────────────────┤
│  {                                                     │
│    "validation": {                                     │
│      "bpmn": {                                         │
│        "businessRuleTaskId": {                         │
│          "label": "Business Rule Task ID Required",    │
│          "description": "In BPMN diagrams...",         │
│          "suggestion": "Add an 'id' attribute..."      │
│        }                                               │
│      }                                                 │
│    }                                                   │
│  }                                                     │
└────────────────────┬───────────────────────────────────┘
                     │
                     │ Return translated text
                     ↓
┌────────────────────────────────────────────────────────┐
│               Validation Report UI                     │
├────────────────────────────────────────────────────────┤
│  ❌ Business Rule Task ID Required                    │
│     In BPMN diagrams, a bpmn:businessRuleTask         │
│     SHALL have an @id attribute                       │
│     Suggestion: Add an 'id' attribute...              │
└────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-10  
**Related**: [dak-validation-framework.md](dak-validation-framework.md)
