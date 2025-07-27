# Validation Rules

This document outlines the validation rules for the 8 DAK components in the SGEX Workbench.

## BPMN Components

The following BPMN components have specific validation rules that must be followed:

### Common Field Requirements

All BPMN tasks (`bpmn:Task`, `bpmn:UserTask`, `bpmn:BusinessRuleTask`) and lanes (`bpmn:Lane`) require the following fields:

#### Required Fields
- **@name** - The display name of the element (required)
- **@id** - The unique identifier of the element (required)
- **Requirements** - A free text description of the element's requirements (required)

#### Optional Fields
- **FHIR Definition** - A URL pointing to the FHIR definition (optional, but must be a valid URL if provided)

### ID Validation Rules

The `@id` attribute for all BPMN tasks (`bpmn:Task`, `bpmn:UserTask`, `bpmn:BusinessRuleTask`) and lanes (`bpmn:Lane`) must conform to the following rules:

1. **Character Set**: Must consist of only alphanumeric characters (a-z, A-Z, 0-9) and periods (.)
2. **Start Character**: Must start with a letter (a-z, A-Z)
3. **End Character**: Must not end with a period (.)
4. **Length**: Must be 55 characters or less

#### Valid ID Examples
- `PatientRegistration`
- `vaccination.workflow.step1`
- `UserTask123`
- `BusinessRule.DecisionTable`

#### Invalid ID Examples
- `123Patient` (starts with number)
- `patient-registration` (contains hyphen)
- `workflow.` (ends with period)
- `a_very_long_identifier_that_exceeds_the_fifty_five_character_limit` (too long)

### Name Validation Rules

The `@name` attribute for all BPMN tasks and lanes must:

1. **Required**: Must not be empty or null
2. **Purpose**: Provides a human-readable display name for the element

### Visual Validation Indicators

The BPMN editor provides visual feedback for validation status:

- **Red Outline**: Indicates that required fields are missing or invalid
- **Green Outline**: Indicates that all validation rules are satisfied
- **No Outline**: For elements that don't have validation rules

## DAK Component Validation

The validation rules apply to the following 8 DAK components when they contain BPMN business processes:

1. **Personas** - User roles and responsibilities
2. **User Scenarios** - User interaction scenarios  
3. **Business Processes** - BPMN workflow definitions
4. **Data Dictionary** - Data element definitions
5. **Decision Logic** - Business rule definitions
6. **Indicators** - Measurement and monitoring definitions
7. **Functional Requirements** - System capability definitions
8. **Non-functional Requirements** - System quality definitions

## Error Messages

The system provides specific error messages for validation failures:

### ID Validation Errors
- "ID is required"
- "ID must consist of only alphanumeric characters and periods"
- "ID must start with a letter"
- "ID must not end in a period"
- "ID must be 55 characters or less"

### Name Validation Errors
- "Name is required"

### Custom Field Validation Errors
- "Requirements field is required"
- "Please enter a valid URL" (for FHIR Definition field)

## Implementation Notes

- Validation is performed in real-time as users edit BPMN diagrams
- Visual indicators are updated immediately when validation status changes
- Properties panel shows detailed error messages for invalid fields
- All validation rules must be satisfied before elements can be considered valid
- The Business Decision Task type has the same validation rules as other task types