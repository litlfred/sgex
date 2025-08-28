# DAK Component Questions - Draft Set

This document outlines draft questions for each of the 9 core DAK components, focusing on their canonical asset representations.

## 1. Health Interventions and Recommendations

**Canonical Assets**: IRIS publication references, clinical guideline documents

### Asset-Level Questions:
- **`publication-references`**: "What WHO publications are referenced in this intervention?"
  - Analyzes intervention files for IRIS URLs and publication IDs
  - Extracts publication metadata from embedded references
  - Validates publication accessibility and status

- **`guideline-sections`**: "What sections are defined in this clinical guideline?"
  - Parses guideline documents for section structure
  - Extracts recommendation hierarchies
  - Identifies evidence levels and recommendation strengths

- **`intervention-scope`**: "What health conditions does this intervention address?"
  - Analyzes intervention definitions for scope and coverage
  - Extracts target populations and health conditions
  - Identifies intervention types and classifications

## 2. Generic Personas

**Canonical Assets**: Actor definition files, role specification documents

### Asset-Level Questions:
- **`actor-roles`**: "What roles and responsibilities are defined for this actor?"
  - Parses actor definition files for role specifications
  - Extracts capabilities, permissions, and responsibilities
  - Identifies system interactions and access patterns

- **`actor-qualifications`**: "What qualifications are required for this actor?"
  - Analyzes qualification requirements and training needs
  - Extracts certification requirements and competency levels
  - Identifies skill prerequisites and experience requirements

- **`actor-workflows`**: "Which workflows does this actor participate in?"
  - Cross-references actor with business process definitions
  - Identifies actor touchpoints in clinical workflows
  - Analyzes actor decision points and data interactions

## 3. User Scenarios

**Canonical Assets**: Scenario narrative files, use case documents

### Asset-Level Questions:
- **`scenario-steps`**: "What are the main steps in this user scenario?"
  - Parses scenario narratives for step-by-step processes
  - Extracts decision points and alternative paths
  - Identifies prerequisites and outcome conditions

- **`scenario-actors`**: "Which actors are involved in this scenario?"
  - Analyzes scenario files for actor references
  - Extracts actor interactions and collaboration patterns
  - Identifies primary and secondary actor roles

- **`scenario-data-flow`**: "What data is exchanged in this scenario?"
  - Analyzes information flow between scenario steps
  - Extracts data inputs, outputs, and transformations
  - Identifies data validation and quality requirements

## 4. Generic Business Processes and Workflows

**Canonical Assets**: BPMN diagram files (.bpmn)

### Asset-Level Questions:
- **`process-participants`**: "Who are the participants in this business process?"
  - Analyzes BPMN files for lane assignments and participant roles
  - Extracts swimlane definitions and responsibility assignments
  - Identifies external system integrations

- **`process-decision-points`**: "What are the decision points in this process?"
  - Parses BPMN for gateway elements and decision logic
  - Extracts branching conditions and routing rules
  - Identifies escalation paths and exception handling

- **`process-duration`**: "What is the expected duration of this process?"
  - Analyzes process elements for timing annotations
  - Extracts service level agreements and timing constraints
  - Calculates critical path and bottleneck identification

## 5. Core Data Elements

**Canonical Assets**: OCL terminology files, PCMT product catalogs, data dictionaries

### Asset-Level Questions:
- **`terminology-coverage`**: "What terminology standards are used in this data element?"
  - Analyzes data element files for coding system references
  - Extracts value set definitions and concept mappings
  - Validates terminology binding strength and coverage

- **`data-constraints`**: "What validation rules apply to this data element?"
  - Parses data element definitions for constraint specifications
  - Extracts cardinality, format, and range validations
  - Identifies business rules and data quality requirements

- **`element-relationships`**: "How does this data element relate to other elements?"
  - Analyzes dependencies and relationships between data elements
  - Extracts hierarchical structures and composition patterns
  - Identifies mandatory groupings and optional components

## 6. Decision-Support Logic

**Canonical Assets**: DMN decision table files (.dmn)

### Asset-Level Questions:
- **`decision-table-inputs`**: "What are the inputs required for this decision table?" ✅ (IMPLEMENTED)
- **`decision-table-rules`**: "How many rules are defined in this decision table?"
  - Analyzes DMN files for rule count and complexity
  - Extracts rule conditions and action specifications
  - Identifies rule conflicts and coverage gaps

- **`decision-dependencies`**: "What other decisions does this decision depend on?"
  - Analyzes DMN decision requirement diagrams
  - Extracts decision dependencies and information flows
  - Identifies circular dependencies and optimization opportunities

## 7. Program Indicators

**Canonical Assets**: Indicator definition files, measurement specifications

### Asset-Level Questions:
- **`indicator-calculations`**: "How is this indicator calculated?"
  - Parses indicator definitions for calculation formulas
  - Extracts numerator and denominator specifications
  - Identifies data sources and aggregation methods

- **`indicator-targets`**: "What are the target values for this indicator?"
  - Analyzes indicator files for performance targets
  - Extracts baseline values and improvement goals
  - Identifies benchmarking standards and thresholds

- **`indicator-reporting`**: "How often should this indicator be reported?"
  - Analyzes reporting frequency and schedule requirements
  - Extracts reporting formats and presentation requirements
  - Identifies stakeholder reporting responsibilities

## 8. Functional and Non-Functional Requirements

**Canonical Assets**: Requirements specification files, constraint definitions

### Asset-Level Questions:
- **`requirement-categories`**: "What categories of requirements are defined?"
  - Parses requirement files for functional/non-functional classifications
  - Extracts requirement hierarchies and groupings
  - Identifies priority levels and implementation phases

- **`requirement-traceability`**: "How do requirements trace to implementation?"
  - Analyzes requirement traceability matrices
  - Extracts forward and backward traceability links
  - Identifies gaps in requirement coverage

- **`requirement-acceptance`**: "What are the acceptance criteria for this requirement?"
  - Parses requirement definitions for acceptance criteria
  - Extracts test scenarios and validation methods
  - Identifies verification and validation approaches

## 9. Test Scenarios

**Canonical Assets**: Feature files, test case specifications, validation scenarios

### Asset-Level Questions:
- **`test-coverage`**: "What functionality is covered by this test scenario?"
  - Analyzes feature files for functional coverage
  - Extracts test scenarios and acceptance criteria
  - Identifies gaps in test coverage

- **`test-data-requirements`**: "What test data is required for this scenario?"
  - Parses test files for data setup requirements
  - Extracts test fixture definitions and dependencies
  - Identifies data privacy and anonymization needs

- **`test-automation`**: "Can this test scenario be automated?"
  - Analyzes test definitions for automation potential
  - Extracts automation hooks and technical requirements
  - Identifies manual testing dependencies

## Implementation Priority

### Phase 1 (High Priority)
1. Decision-Support Logic: `decision-table-rules`, `decision-dependencies`
2. Core Data Elements: `terminology-coverage`, `data-constraints`
3. Program Indicators: `indicator-calculations`, `indicator-targets`

### Phase 2 (Medium Priority)
1. Business Processes: `process-participants`, `process-decision-points`
2. Generic Personas: `actor-roles`, `actor-workflows`
3. Test Scenarios: `test-coverage`, `test-data-requirements`

### Phase 3 (Lower Priority)
1. Health Interventions: `publication-references`, `guideline-sections`
2. User Scenarios: `scenario-steps`, `scenario-actors`
3. Requirements: `requirement-categories`, `requirement-traceability`

## Technical Considerations

### File Type Support
- **Text-based assets**: Markdown, YAML, JSON, XML parsing
- **Binary assets**: PDF parsing (limited), image metadata extraction
- **Structured formats**: DMN, BPMN, FHIR JSON/XML

### Cross-component Questions
Some questions span multiple components:
- "Which decisions reference this data element?"
- "What test scenarios validate this business process?"
- "Which indicators measure this intervention outcome?"

### Internationalization
All questions should support the existing locale framework:
- en_US, fr_FR, es_ES, ar_AR, zh_CN, ru_RU
- Narrative responses in multiple languages
- Error messages and warnings localized

### Caching Strategy
- File-level caching for individual asset analysis
- Component-level caching for cross-file relationships
- Repository-level caching for summary statistics