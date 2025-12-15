# WHO SMART Guidelines DAK Components

This document provides detailed information about the 9 core Digital Adaptation Kit (DAK) components supported by the SGEX Workbench, as defined by the WHO SMART Guidelines framework.

For technical requirements and specifications, see [Requirements Documentation](requirements.md#23-dak-component-management).  
For comprehensive L2/L3 architecture details, see [L2/L3 Architecture Guide](l2-l3-architecture.md).  
For asset lifecycle management, see [Asset Management Documentation](asset-management.md).  
For programmatic access to DAK component information, see [DAK FAQ MCP API Documentation](dak-faq-mcp-api.md).

## WHO SMART Guidelines Context

This work aligns with the WHO SMART IG Starter Kit methodology where:
- **L1** = Narrative guidelines (human-readable clinical guidelines)
- **L2** = DAK components (structured operational content independent of technical implementation)
- **L3** = FHIR resources (machine-executable technical implementations)

Reference: [WHO SMART IG Starter Kit - L2 DAK Authoring](https://smart.who.int/ig-starter-kit/l2_dak_authoring.html)

## Overview

Digital Adaptation Kits (DAKs) are structured packages of clinical logic and implementation guidance that support the digitization of WHO health guidelines. The SGEX Workbench provides collaborative editing capabilities for all 9 core DAK components, organized into two implementation levels:

- **L2 (Level 2)**: Data model agnostic representations that capture business logic and clinical processes independent of specific technical implementations
- **L3 (Level 3)**: FHIR R4-specific implementations following WHO enterprise architecture specifications at http://smart.who.int/ra

## The 9 Core DAK Components

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

- **Description**: Essential data structures and terminology needed for clinical data capture and exchange, including specialized component services for terminology management and product data
- **L2 Representation**: Open Concept Lab (OCL) at https://openconceptlab.org/ for terminology services and Product Catalogue Management Tool (PCMT) for product master data
- **L3 Representation**: FHIR StructureDefinition profiles
- **Purpose**: Standardize clinical concepts, codes, and data models across systems
- **Editor**: Data element editor with OCL integration for terminology and PCMT integration for product data
- **Note**: Terminology Services (OCL) and Product Master Data (PCMT) are specialized component services within Core Data Elements

### 6. Decision-Support Logic

- **Description**: DMN decision tables and clinical decision support rules that encode clinical logic
- **L2 Representation**: DMN decision tables conforming to [OMG DMN 1.3 specification](https://www.omg.org/spec/DMN/1.3/)
- **L3 Representation**: FHIR PlanDefinition with decision logic
- **Purpose**: Define automated decision-making rules, clinical algorithms, and care recommendations
- **Editor**: DMN decision table editor with validation
- **Note**: Scheduling tables are a special case of decision tables and are included within this component

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

### 9. Test Scenarios

- **Description**: Feature files and test scenarios for validating the DAK implementation
- **L2 Representation**: Test scenario definitions and validation criteria
- **L3 Representation**: FHIR Test bundles and test cases
- **Purpose**: Define validation scenarios, test cases, and acceptance criteria for DAK implementation
- **Editor**: Testing viewer with feature file browser

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