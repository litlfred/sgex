# WHO SMART Guidelines DAK Components

This document provides detailed information about the 8 core Digital Adaptation Kit (DAK) components supported by the SGEX Workbench, as defined by the WHO SMART Guidelines framework.

For technical requirements and specifications, see [Requirements Documentation](requirements.md#23-dak-component-management).

## Overview

Digital Adaptation Kits (DAKs) are structured packages of clinical logic and implementation guidance that support the digitization of WHO health guidelines. The SGEX Workbench provides collaborative editing capabilities for all 8 core DAK components, organized into two implementation levels:

- **L2 (Level 2)**: Data model agnostic representations that capture business logic and clinical processes independent of specific technical implementations
- **L3 (Level 3)**: FHIR R4-specific implementations following WHO enterprise architecture specifications at http://smart.who.int/ra

## The 8 Core DAK Components

### 1. Health Interventions and Recommendations

- **Description**: Clinical guidelines and health intervention specifications that define evidence-based care recommendations
- **L2 Representation**: References to Publications on IRIS at https://iris.who.int/
- **L3 Representation**: FHIR Clinical Practice Guidelines
- **Purpose**: Capture and reference official WHO publications and clinical guidelines
- **Editor**: Publication reference manager with IRIS integration
- **Note**: IRIS uses DSpace with structured search capabilities for WHO publication management

### 2. Generic Personas

- **Description**: Standardized user roles and actor definitions that represent different types of healthcare workers and patients
- **L2 Representation**: Actor definitions and role descriptions
- **L3 Representation**: FHIR Person/Practitioner profiles
- **Purpose**: Define user types, their capabilities, responsibilities, and access patterns
- **Editor**: Persona definition editor with role-based access specifications

### 3. User Scenarios

- **Description**: Narrative descriptions of how different personas interact with the system in specific healthcare contexts
- **L2 Representation**: Use case narratives and workflows
- **L3 Representation**: FHIR Scenario test bundles
- **Purpose**: Document user journeys, interaction patterns, and system usage scenarios
- **Editor**: Scenario editor with workflow visualization

### 4. Generic Business Processes and Workflows

- **Description**: BPMN workflows and business process definitions that model clinical workflows and care pathways
- **L2 Representation**: BPMN diagrams (.bpmn) conforming to [OMG BPMN 2.0 specification](https://www.omg.org/spec/BPMN/2.0/)
- **L3 Representation**: FHIR ActivityDefinition/PlanDefinition
- **Purpose**: Define step-by-step clinical processes, decision points, and workflow sequences
- **Editor**: Graphical BPMN editor with SVG visualization

### 5. Core Data Elements

- **Description**: Essential data structures and terminology needed for clinical data capture and exchange
- **L2 Representation**: Open Concept Lab (OCL) at https://openconceptlab.org/
- **L3 Representation**: FHIR StructureDefinition profiles
- **Purpose**: Standardize clinical concepts, codes, and data models across systems
- **Editor**: Data element editor with OCL integration

#### 5.1 Product Master Data

- **Description**: Specialized data management for pharmaceutical and medical product information
- **L2 Representation**: FHIR CodeSystems and Logical Models
- **L3 Representation**: Product Catalogue Management Tool (PCMT) at https://worldhealthorganization.github.io/smart-pcmt/ and https://productcatalog.io/
- **Purpose**: Manage product catalogs, formularies, and pharmaceutical data
- **Editor**: Product data editor with PCMT integration

### 6. Decision-Support Logic

- **Description**: DMN decision tables and clinical decision support rules that encode clinical logic
- **L2 Representation**: DMN decision tables conforming to [OMG DMN 1.3 specification](https://www.omg.org/spec/DMN/1.3/)
- **L3 Representation**: FHIR PlanDefinition with decision logic
- **Purpose**: Define automated decision-making rules, clinical algorithms, and care recommendations
- **Editor**: DMN decision table editor with validation and real-time collaboration features
- **Note**: Scheduling tables are a special case of decision tables and are included within this component

#### Decision Logic Table Types

The decision table editor supports multiple types of clinical decision logic:

1. **Decision Logic Tables**: General clinical decision support rules and algorithms for care recommendations
2. **Scheduling Tables**: Immunization and appointment scheduling logic with temporal constraints
3. **Contraindications Tables**: Medical contraindication checking and safety rules for treatment eligibility
4. **Eligibility Tables**: Patient eligibility and qualification assessments for programs and interventions

#### Editor Features

**Table Management**:
- Create new tables with configurable inputs, outputs, and metadata
- Import and edit existing DMN files from repository
- Real-time validation of decision logic and completeness checking
- Export to DMN XML, HTML documentation, and structured markdown

**Rule Editing**:
- Visual rule builder with drag-and-drop interface for constructing decision rules
- Syntax-highlighted editor for CQL and DMN expressions with autocomplete
- Built-in testing framework with sample data validation
- Automatic detection of overlapping or conflicting rules

**Collaboration Features**:
- Full Git integration with branch-based collaboration workflows
- Visual diff showing rule modifications and additions
- Inline commenting system for collaborative review processes
- Structured approval workflow for clinical decision logic changes

**Integration Capabilities**:
- Direct integration with Clinical Quality Language (CQL) libraries
- Automatic mapping to FHIR PlanDefinition resources
- Built-in validation against WHO SMART Guidelines standards
- Support for terminology services and clinical databases

#### Technical Implementation

The decision table editor follows modern web development practices:
- **React Component Architecture**: Modular design with reusable components
- **Real-time State Management**: Centralized state with immediate validation feedback  
- **GitHub API Integration**: Direct file editing with version control
- **Standards Compliance**: Full DMN 1.3 and WHO SMART Guidelines compliance

### 7. Program Indicators

- **Description**: Performance indicators and measurement definitions for monitoring and evaluation
- **L2 Representation**: Logical indicator models
- **L3 Representation**: FHIR Measure resources
- **Purpose**: Define key performance indicators, quality measures, and outcome metrics
- **Editor**: Indicator definition editor with measurement logic

### 8. Functional and Non-Functional Requirements

- **Description**: System requirements specifications that define capabilities and constraints
- **L2 Representation**: Requirements specifications at https://worldhealthorganization.github.io/smart-base/StructureDefinition-FunctionalRequirement.html and https://worldhealthorganization.github.io/smart-base/StructureDefinition-NonFunctionalRequirement.html
- **L3 Representation**: FHIR ImplementationGuide conformance rules
- **Purpose**: Document system capabilities, performance requirements, and technical constraints
- **Editor**: Requirements editor with structured templates

## Additional Structured Knowledge Representations

The SGEX Workbench also supports additional knowledge types that complement the core DAK components:

| Knowledge Type | L2 Representation | L3 Representation |
|----------------|-------------------|-------------------|
| Terminology | Concept definitions and mappings | FHIR CodeSystem/ValueSet |
| FHIR Profiles | Data model specifications | FHIR StructureDefinition |
| FHIR Extensions | Extension specifications | FHIR StructureDefinition (extension) |
| FHIR Questionnaires | FHIR Questionnaires | FHIR Questionnaires coupled with FHIR Structure Map |
| Test Data & Examples | Test scenarios and sample data | FHIR Examples/test bundles |

## Component Organization

### Visual Representation
The SGEX Workbench presents these components in a dashboard format with:
- Distinctive WHO-provided icons and color coding for each component
- Clear level badges (L2 vs L3) with visual distinction
- Component-specific navigation and editing capabilities
- Integration with external systems (IRIS, OCL, PCMT)
- WHO SMART Guidelines branding and visual identity

### Navigation Structure
```
Landing Page → Repository Selection → DAK Components Dashboard → Component Editor
```

Each component provides:
- Direct access to specialized editors based on L2/L3 distinction
- Context-aware editing capabilities  
- Integration with GitHub collaboration tools
- Validation and error checking
- Traceability links between L2 and L3 representations

### External System Integration

The SGEX Workbench integrates with several external systems for DAK component management:

- **IRIS (https://iris.who.int/)**: WHO publication repository with DSpace-based search API for health intervention references
- **Open Concept Lab (https://openconceptlab.org/)**: Terminology management system with GitHub authentication support
- **PCMT (https://productcatalog.io/)**: Product Catalogue Management Tool with GitHub authentication support
- **WHO Enterprise Architecture (http://smart.who.int/ra)**: Reference architecture for FHIR R4 implementations

## Standards Compliance

All DAK components must comply with relevant industry standards:

- **Business processes**: [OMG BPMN 2.0 specification](https://www.omg.org/spec/BPMN/2.0/)
- **Decision support logic**: [OMG DMN 1.3 specification](https://www.omg.org/spec/DMN/1.3/)
- **L3 implementations**: WHO enterprise architecture at http://smart.who.int/ra
- **FHIR resources**: FHIR R4 specification compliance
- **Functional/Non-functional requirements**: WHO smart-base StructureDefinitions

## References

- [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines)
- [WHO SMART Guidelines IG Starter Kit - DAK Authoring](https://smart.who.int/ig-starter-kit/l2_dak_authoring.html)
- [FHIR Implementation Guide Structure](https://hl7.org/fhir/implementationguide.html)
- [Requirements Documentation](requirements.md#23-dak-component-management)

---

*This documentation is based on the WHO SMART Guidelines framework and will be updated as the specifications evolve.*