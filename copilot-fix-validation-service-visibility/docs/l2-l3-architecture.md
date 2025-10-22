# WHO SMART Guidelines L2/L3 Architecture Implementation

## Overview

This document provides a comprehensive guide to the L2 (Operational) and L3 (Executable) layer architecture as implemented in the SGEX Workbench, following the WHO SMART Guidelines methodology.

## WHO SMART Guidelines Methodology Context

The WHO SMART Guidelines framework defines a three-layer approach to digital health guideline implementation:

- **L1 (Narrative)**: Human-readable narrative guidelines and recommendations
- **L2 (Operational)**: Structured operational content that captures business logic independent of technical implementation
- **L3 (Executable)**: Machine-executable FHIR R4 implementations following WHO enterprise architecture

Reference: [WHO SMART IG Starter Kit - L2 DAK Authoring](https://smart.who.int/ig-starter-kit/l2_dak_authoring.html)

## L2 (Operational Layer) Implementation

### Definition and Scope

**L2 Layer** represents data model agnostic representations that capture business logic and clinical processes independent of specific technical implementations. This layer focuses on **what** needs to be done rather than **how** it should be implemented technically.

### Characteristics of L2 Representations

1. **Technology Agnostic**: Independent of specific FHIR profiles or technical implementations
2. **Business-Focused**: Captures clinical workflows, business rules, and operational requirements
3. **Human-Readable**: Maintains readability for clinical domain experts
4. **Standards-Based**: Uses industry standards like BPMN, DMN, and established terminology systems

### L2 Implementation by Component

| Component | L2 Representation | Standards Used | Purpose |
|-----------|-------------------|----------------|---------|
| Health Interventions | References to IRIS Publications | WHO IRIS DSpace | Clinical guideline references |
| Personas | Actor definitions and roles | Structured descriptions | User role definitions |
| User Scenarios | Use case narratives | Textual workflows | User journey documentation |
| Business Processes | BPMN diagrams | OMG BPMN 2.0 | Clinical workflow modeling |
| Core Data Elements | OCL concept definitions, PCMT product data | Open Concept Lab, PCMT | Terminology and product standardization |
| Decision Logic | DMN decision tables | OMG DMN 1.3 | Clinical decision rules |
| Program Indicators | Logical indicator models | Structured definitions | Performance measurement |
| Requirements | Requirement specifications | WHO smart-base | System capabilities |

### L2 External System Integration

- **IRIS (https://iris.who.int/)**: WHO publication repository with DSpace-based search
- **Open Concept Lab (https://openconceptlab.org/)**: Terminology management with GitHub integration
- **PCMT (https://productcatalog.io/)**: Product Catalogue Management Tool

## L3 (Executable Layer) Implementation

### Definition and Scope

**L3 Layer** represents FHIR R4-specific implementations following WHO enterprise architecture specifications. This layer focuses on **how** the business logic should be technically implemented.

### Characteristics of L3 Representations

1. **FHIR R4 Compliant**: All implementations follow FHIR R4 specification
2. **WHO Enterprise Architecture**: Adheres to http://smart.who.int/ra specifications
3. **Machine-Executable**: Can be directly processed by FHIR-compliant systems
4. **Interoperable**: Enables data exchange between different health systems

### L3 Implementation by Component

| Component | L3 Representation | FHIR Resources | Implementation Notes |
|-----------|-------------------|----------------|---------------------|
| Health Interventions | Clinical Practice Guidelines | Library, PlanDefinition | Evidence-based care protocols |
| Personas | Person/Practitioner profiles | Person, Practitioner | User profile definitions |
| User Scenarios | Scenario test bundles | Bundle, TestScript | Executable test scenarios |
| Business Processes | ActivityDefinition/PlanDefinition | ActivityDefinition, PlanDefinition | Executable workflows |
| Core Data Elements | StructureDefinition profiles, PCMT CodeSystems | StructureDefinition, CodeSystem, ValueSet | Data model constraints and product catalogs |
| Decision Logic | PlanDefinition with logic | PlanDefinition, Library | Executable decision rules |
| Program Indicators | Measure resources | Measure, Library | Computable quality measures |
| Requirements | ImplementationGuide rules | ImplementationGuide | Technical conformance |

### L3 WHO Enterprise Architecture Compliance

All L3 implementations must comply with:
- **WHO enterprise architecture**: http://smart.who.int/ra
- **FHIR R4 specification**: Base interoperability standard
- **WHO smart-base**: Foundation StructureDefinitions and profiles

## L2 to L3 Transformation Process

### Transformation Methodology

The SGEX Workbench supports a structured transformation process from L2 operational content to L3 executable implementations:

1. **Analysis**: Review L2 business logic and requirements
2. **Mapping**: Identify appropriate FHIR resources and profiles
3. **Implementation**: Create FHIR-compliant L3 representations
4. **Validation**: Ensure conformance to WHO enterprise architecture
5. **Testing**: Validate against L2 requirements and use cases

### Bidirectional Traceability

The SGEX Workbench maintains traceability links between L2 and L3 representations:

- **Forward Traceability**: L2 → L3 implementation tracking
- **Backward Traceability**: L3 → L2 requirement validation
- **Change Impact**: Automated detection of L2 changes affecting L3 implementations

### Transformation Tools and Editors

Each component type has specialized editing capabilities that support both L2 and L3 development:

- **BPMN Editor**: Graphical workflow design with L3 PlanDefinition generation
- **DMN Editor**: Decision table modeling with L3 Library resource output
- **Data Element Editor**: OCL integration with StructureDefinition generation
- **Requirements Editor**: Structured templates with ImplementationGuide conformance

## Architecture Patterns

### 1. Component Isolation Pattern

Each DAK component maintains clear separation between L2 and L3 concerns:

```
Component/
├── L2/               # Business logic layer
│   ├── workflows/    # BPMN diagrams
│   ├── decisions/    # DMN tables
│   └── data/         # OCL concepts
└── L3/               # Technical implementation layer
    ├── profiles/     # FHIR StructureDefinitions
    ├── examples/     # Sample data
    └── tests/        # Validation scenarios
```

### 2. External System Integration Pattern

L2 layer integrates with external authoritative sources:
- L2 maintains authoritative business definitions
- L3 implements technical representations
- Integration bridges maintain synchronization

### 3. Progressive Elaboration Pattern

Development can proceed incrementally:
1. Start with L2 business requirements
2. Elaborate technical L3 implementations
3. Validate against real-world scenarios
4. Iterate based on implementation feedback

## Implementation Guidelines

### For DAK Authors

1. **Start with L2**: Define business requirements and workflows first
2. **Use Standards**: Leverage BPMN, DMN, and established terminology
3. **Maintain Separation**: Keep business logic independent of technical implementation
4. **Document Rationale**: Capture decisions and assumptions for future reference

### For Technical Implementers

1. **Follow WHO Architecture**: Adhere to smart.who.int/ra specifications
2. **Maintain Traceability**: Link L3 implementations to L2 requirements
3. **Validate Compliance**: Use FHIR validation tools and conformance checking
4. **Test Thoroughly**: Validate against L2 scenarios and use cases

### For System Integrators

1. **Understand Dependencies**: Map external system integration points
2. **Plan Data Flow**: Design synchronization between L2 and L3 layers
3. **Consider Versioning**: Plan for evolution of both business and technical requirements
4. **Monitor Compliance**: Establish ongoing validation and quality assurance

## Quality Assurance

### L2 Layer Validation

- **Business Logic Review**: Clinical domain expert validation
- **Standards Compliance**: BPMN/DMN specification conformance
- **Terminology Validation**: OCL and standard vocabulary alignment
- **Workflow Testing**: User scenario validation and testing

### L3 Layer Validation

- **FHIR Validation**: Resource and profile conformance checking
- **WHO Architecture**: Compliance with enterprise architecture standards
- **Interoperability Testing**: Cross-system data exchange validation
- **Performance Testing**: Scalability and performance assessment

### Cross-Layer Validation

- **Traceability Verification**: Ensure L3 implementations satisfy L2 requirements
- **Consistency Checking**: Validate alignment between business and technical layers
- **Change Impact Analysis**: Assess effects of modifications across layers
- **End-to-End Testing**: Complete workflow validation from L2 to L3

## Best Practices

### Documentation Standards

1. **Clear Layer Identification**: Always specify L2 vs L3 content
2. **Consistent Terminology**: Use WHO-approved terminology and definitions
3. **External References**: Maintain current links to authoritative sources
4. **Version Control**: Track changes and maintain compatibility

### Development Workflow

1. **Collaborative Development**: Engage clinical and technical stakeholders
2. **Iterative Refinement**: Regular review and improvement cycles
3. **Continuous Validation**: Ongoing quality assurance and testing
4. **Community Engagement**: Leverage WHO SMART Guidelines community resources

### Tool Integration

1. **Editor Consistency**: Use standardized editing interfaces for each layer
2. **Validation Integration**: Embed quality checking in development workflow
3. **External System Sync**: Maintain synchronization with authoritative sources
4. **Deployment Automation**: Streamline publication and distribution processes

## Future Considerations

### Emerging Standards

- Monitor evolution of FHIR specifications
- Track WHO enterprise architecture updates
- Assess new BPMN/DMN capabilities
- Evaluate emerging terminology standards

### Technology Evolution

- Plan for new FHIR resource types
- Consider cloud-native deployment patterns
- Assess AI/ML integration opportunities
- Evaluate mobile and offline capabilities

### Community Development

- Participate in WHO SMART Guidelines community
- Contribute to standards development
- Share implementation experiences
- Collaborate on common challenges

---

*This architecture guide aligns with the WHO SMART Guidelines framework and will be updated as standards and methodologies evolve.*