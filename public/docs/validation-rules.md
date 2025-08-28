# DAK Component Validation Rules

This document defines the validation rules for the 8 core WHO SMART Guidelines Digital Adaptation Kit (DAK) components implemented in SGEX Workbench.

## Overview

Validation rules ensure compliance with WHO SMART Guidelines standards and maintain consistency across DAK components. These rules are enforced at both the element level and the component level.

## Common Validation Rules

### Element Identifier (@id) Requirements

All BPMN elements (tasks, userTask, businessRuleTask, lane) must have valid @id attributes that:

- **Format**: Consist only of alphanumeric characters and periods
- **Start**: Must start with a letter (a-z, A-Z)
- **End**: Must not end with a period
- **Length**: Must not exceed 55 characters

**Valid examples:**
- `Task.1`
- `UserTask.Registration`
- `BusinessRule.DecisionTable.BCG`
- `Lane.Healthcare.Provider`

**Invalid examples:**
- `123Task` (starts with number)
- `Task.Registration.` (ends with period)
- `Task-Registration` (contains dash)
- `Very.Long.Task.Name.That.Exceeds.The.Fifty.Five.Character.Limit.For.Task.Identifiers` (>55 characters)

### Element Name (@name) Requirements

All BPMN elements (tasks, userTask, businessRuleTask, lane) must have:

- **Required**: Non-empty @name attribute
- **Format**: Human-readable text describing the element's purpose

## DAK Component-Specific Validation Rules

### 1. Health Interventions and Recommendations

**File Types**: IRIS publication references, guideline documents
**Location**: `input/publications/`

**Validation Rules**:
- Publication references must include valid WHO publication identifiers
- IRIS links must be accessible and properly formatted

### 2. Generic Personas

**File Types**: Actor definition files
**Location**: `input/actors/`

**Validation Rules**:
- Actor definitions must include role specifications
- Persona attributes must be consistent with WHO terminology

### 3. User Scenarios

**File Types**: Scenario narratives, use case documents
**Location**: `input/scenarios/`

**Validation Rules**:
- Scenarios must reference valid personas
- User journeys must have clear start and end points

### 4. Generic Business Processes and Workflows

**File Types**: BPMN diagrams (.bpmn)
**Location**: `input/business-processes/`

**Validation Rules**:
- **BPMN 2.0 Compliance**: All diagrams must conform to OMG BPMN 2.0 specification
- **Required Elements**: Each process must contain at least one start event
- **Element Requirements**: See Common Validation Rules above for @id and @name
- **Custom Properties**: 
  - `Requirements` field: Required free text describing element purpose
  - `FHIR Definition` field: Optional URL linking to FHIR resource definitions

### 5. Core Data Elements

**File Types**: OCL terminology files, PCMT product catalogs, data dictionaries
**Location**: `input/terminology/`, `input/vocabulary/`

**Validation Rules**:
- Terminology references must use valid WHO code systems
- Data element definitions must include validation constraints

### 6. Decision-Support Logic

**File Types**: DMN decision tables (.dmn)
**Location**: `input/dmn/`

**Validation Rules**:
- **DMN 1.3 Compliance**: All decision tables must conform to OMG DMN 1.3 specification
- **Business Rule Tasks**: Must reference valid DMN decision table identifiers
- **Input/Output Mapping**: Decision inputs and outputs must be properly defined

### 7. Program Indicators

**File Types**: Indicator definition files, measurement logic
**Location**: `input/indicators/`

**Validation Rules**:
- Indicator calculations must include measurement formulas
- Target values must be specified for performance indicators

### 8. Functional and Non-Functional Requirements

**File Types**: Requirement specifications, compliance documents
**Location**: `input/requirements/`

**Validation Rules**:
- Requirements must be categorized and traceable
- Non-functional requirements must include measurable criteria

### 9. Test Scenarios

**File Types**: Feature files (.feature), test data
**Location**: `input/tests/`

**Validation Rules**:
- Feature files must follow Gherkin syntax
- Test scenarios must cover core DAK functionality

## Validation Implementation

### Visual Indicators

The BPMN editor provides visual validation feedback:

- **Red Outline**: Element has missing required fields or validation errors
- **Green Outline**: Element passes all validation checks
- **Orange Outline**: Element has warnings but is still valid

### Validation Triggers

Validation occurs:
- **Real-time**: As elements are modified in the editor
- **On Save**: Before committing changes to the repository
- **On Import**: When loading existing BPMN/DMN files

### Error Reporting

Validation errors include:
- **Field Name**: Which field has the validation issue
- **Error Type**: Missing required field, invalid format, etc.
- **Suggested Fix**: Guidance on how to resolve the issue

## Compliance Checking

### DAK Level Validation

- **sushi-config.yaml**: Must contain valid WHO base dependencies
- **Directory Structure**: Must follow WHO SMART Guidelines conventions
- **File Naming**: Must use consistent naming patterns

### Component Level Validation

- **Cross-References**: Elements that reference other components must have valid links
- **Consistency**: Related elements must maintain consistent terminology and identifiers

## Future Enhancements

### Advanced Validation Rules

- **Semantic Validation**: Check logical consistency between related elements
- **Workflow Validation**: Ensure BPMN processes have valid execution paths
- **Terminology Binding**: Validate terminology usage against WHO value sets

### Integration Validation

- **FHIR Compliance**: Validate L3 implementations against FHIR R4 profiles
- **Dependency Checking**: Ensure all component dependencies are satisfied
- **Version Compatibility**: Check compatibility between different DAK component versions

---

*This validation rules document is part of the SGEX Workbench implementation for WHO SMART Guidelines Digital Adaptation Kits. For technical implementation details, see the `dakComplianceService.js` and related validation modules.*