# WHO SMART Guidelines DAK Components

This document provides detailed information about the 8 core Digital Adaptation Kit (DAK) components supported by the SGEX Workbench, as defined by the WHO SMART Guidelines framework.

## Overview

Digital Adaptation Kits (DAKs) are structured packages of clinical logic and implementation guidance that support the digitization of WHO health guidelines. The SGEX Workbench provides collaborative editing capabilities for all 8 core DAK components, organized into two implementation levels.

## Component Structure

### Level 2: Business Logic & Processes

Level 2 components define the clinical logic and business processes that implement the health guidelines.

#### 1. Business Processes
- **Description**: BPMN workflows and business process definitions that model clinical workflows and care pathways
- **File Types**: BPMN, XML
- **Purpose**: Define step-by-step clinical processes, decision points, and workflow sequences
- **Editor**: Graphical BPMN editor with SVG visualization

#### 2. Decision Support Logic  
- **Description**: DMN decision tables and clinical decision support rules that encode clinical logic
- **File Types**: DMN, XML
- **Purpose**: Define automated decision-making rules, clinical algorithms, and care recommendations
- **Editor**: DMN decision table editor with validation
- **Note**: Scheduling tables are a special case of decision tables and are included within this component

#### 3. Indicators & Measures
- **Description**: Performance indicators and measurement definitions for monitoring and evaluation
- **File Types**: JSON, XML  
- **Purpose**: Define key performance indicators, quality measures, and outcome metrics
- **Editor**: Form-based metadata editor with JSON Forms

#### 4. Data Entry Forms
- **Description**: Structured data collection forms and questionnaires for clinical data capture
- **File Types**: JSON, XML
- **Purpose**: Define user interfaces for data collection, patient registration, and clinical assessments
- **Editor**: Form designer with preview capabilities

### Level 3: Technical Implementation

Level 3 components provide the technical specifications and data structures needed for system implementation.

#### 5. Terminology
- **Description**: Code systems, value sets, and concept maps that define clinical terminology
- **File Types**: JSON, XML
- **Purpose**: Standardize clinical concepts, codes, and mappings across systems
- **Editor**: Terminology management interface with validation

#### 6. FHIR Profiles
- **Description**: FHIR resource profiles and structure definitions that constrain FHIR resources
- **File Types**: JSON, XML
- **Purpose**: Define specific data requirements and constraints for FHIR-based implementations
- **Editor**: Profile editor with FHIR validation

#### 7. FHIR Extensions
- **Description**: Custom FHIR extensions and data elements that extend standard FHIR resources
- **File Types**: JSON, XML
- **Purpose**: Add custom fields and data elements not covered by standard FHIR resources
- **Editor**: Extension designer with FHIR compliance checking

#### 8. Test Data & Examples
- **Description**: Sample data and test cases for validation and testing purposes
- **File Types**: JSON, XML
- **Purpose**: Provide concrete examples and test scenarios for implementation validation
- **Editor**: Example data editor with format validation

## Component Organization

### Visual Representation
The SGEX Workbench presents these components in a dashboard format with:
- Distinctive icons and color coding for each component
- Clear level badges (Level 2 vs Level 3)
- File type indicators (BPMN, DMN, JSON, XML)
- File count displays
- WHO SMART Guidelines branding

### Navigation Structure
```
Landing Page → Repository Selection → DAK Components Dashboard → Component Editor
```

Each component provides:
- Direct access to specialized editors
- Context-aware editing capabilities  
- Integration with GitHub collaboration tools
- Validation and error checking

## References

- [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines)
- [WHO SMART Guidelines IG Starter Kit - DAK Authoring](https://smart.who.int/ig-starter-kit/l2_dak_authoring.html)
- [FHIR Implementation Guide Structure](https://hl7.org/fhir/implementationguide.html)

---

*This documentation is based on the WHO SMART Guidelines framework and will be updated as the specifications evolve.*