# SUSHI Configuration and Project Structure for WHO SMART Guidelines DAKs

This document provides comprehensive information about the structure of `sushi-config.yaml` files and SUSHI project organization as they apply to WHO SMART Guidelines Digital Adaptation Kits (DAKs).

## What is SUSHI?

SUSHI (SMART Guidelines Utility for Structural Health Implementation) is a tool for creating FHIR Implementation Guides (IGs) from FSH (FHIR Shorthand) source code. All WHO SMART Guidelines DAKs are built using SUSHI projects, which provide a standardized structure for authoring and publishing healthcare implementation guidelines.

## DAK Project Structure

Every WHO SMART Guidelines DAK follows the standard SUSHI project structure:

```
my-dak-repo/
├── sushi-config.yaml           # Main configuration file
├── input/
│   ├── fsh/                   # FSH source files
│   │   ├── profiles/          # FHIR profiles
│   │   ├── extensions/        # FHIR extensions
│   │   ├── valuesets/         # Value sets and code systems
│   │   └── examples/          # Example resources
│   ├── pagecontent/           # Markdown content for IG pages
│   │   ├── index.md           # Home page
│   │   ├── actors.md          # Actor definitions
│   │   └── workflows.md       # Business process documentation
│   ├── images/                # Images and diagrams
│   └── resources/             # Additional FHIR resources
├── _gencont.bat              # Windows build script
├── _genonce.bat              # Windows single build script
├── _gencont.sh               # Unix build script
├── _genonce.sh               # Unix single build script
└── README.md                 # Project documentation
```

## sushi-config.yaml Structure

The `sushi-config.yaml` file is the central configuration file that defines how the FHIR Implementation Guide is built and published. Here's a comprehensive breakdown of its structure:

### Core Identification Fields

```yaml
# Unique identifier for the implementation guide
id: who.fhir.immunization

# FHIR version being used (typically R4 for WHO SMART Guidelines)
fhirVersion: 4.0.1

# Technical name used in code generation (PascalCase, no spaces)
name: WHOImmunizationIG

# Version following semantic versioning
version: 1.0.0

# Human-readable title
title: "WHO SMART Guidelines - Immunization"

# Detailed description of the implementation guide
description: >
  This implementation guide provides FHIR profiles and guidance for 
  implementing WHO immunization guidelines in digital health systems.

# Publication status: draft, active, retired, unknown
status: draft

# Whether this is experimental content
experimental: true
```

### Publisher Information

The publisher field is a complex object containing organization details:

```yaml
publisher:
  name: World Health Organization (WHO)
  url: https://www.who.int
  email: smart@who.int
```

### Dependencies

Dependencies define other implementation guides that this DAK builds upon:

```yaml
dependencies:
  # Required base dependency for all WHO SMART Guidelines DAKs
  smart.who.int.base:
    version: 1.0.0
    uri: http://smart.who.int/base
  
  # Optional additional dependencies
  hl7.fhir.uv.cpg:
    version: 2.0.0
    uri: http://hl7.org/fhir/uv/cpg
```

**Note**: The presence of `smart.who.int.base` dependency is what identifies a repository as a WHO SMART Guidelines DAK in SGEX Workbench.

### Pages Configuration

The pages section defines the structure and content of the generated implementation guide:

```yaml
pages:
  index.md:
    title: Home
    generation: markdown
  
  actors.md:
    title: Generic Personas
    generation: markdown
  
  workflows.md:
    title: Business Processes
    generation: markdown
  
  profiles.md:
    title: FHIR Profiles
    generation: markdown
  
  extensions.md:
    title: FHIR Extensions
    generation: markdown
```

### Menu Structure

Defines the navigation menu for the generated implementation guide:

```yaml
menu:
  Home: index.html
  Business Requirements:
    Actors: actors.html
    Workflows: workflows.html
  Technical Specifications:
    Profiles: profiles.html
    Extensions: extensions.html
  Artifacts: artifacts.html
```

### Complete Example

Here's a complete example of a `sushi-config.yaml` file for a WHO SMART Guidelines DAK:

```yaml
# Core identification
id: who.fhir.anc
fhirVersion: 4.0.1
name: WHOANCGuidelines
version: 1.2.0
title: "WHO SMART Guidelines - Antenatal Care"
description: >
  This implementation guide provides FHIR profiles, value sets, and guidance 
  for implementing WHO antenatal care guidelines in digital health systems.
status: active
experimental: false

# Publication information
publisher:
  name: World Health Organization (WHO)
  url: https://www.who.int
  email: smart@who.int

# Contact information
contact:
  - name: WHO SMART Guidelines Team
    telecom:
      - system: email
        value: smart@who.int
      - system: url
        value: https://www.who.int/teams/digital-health-and-innovation/smart-guidelines

# Copyright and licensing
copyright: "Copyright © 2024 World Health Organization (WHO)"
license: CC0-1.0

# Dependencies
dependencies:
  smart.who.int.base:
    version: 1.0.0
    uri: http://smart.who.int/base
  hl7.fhir.uv.cpg:
    version: 2.0.0
    uri: http://hl7.org/fhir/uv/cpg

# Global settings
global:
  - code: apply-jurisdiction
    value: http://unstats.un.org/unsd/methods/m49/m49.htm#001

# Page structure
pages:
  index.md:
    title: Home
    generation: markdown
  business-requirements.md:
    title: Business Requirements
    generation: markdown
  actors.md:
    title: Generic Personas
    generation: markdown
  user-scenarios.md:
    title: User Scenarios
    generation: markdown
  business-processes.md:
    title: Business Processes
    generation: markdown
  concepts.md:
    title: Core Data Dictionary
    generation: markdown
  decision-logic.md:
    title: Decision Support Logic
    generation: markdown
  indicators.md:
    title: Indicators and Measures
    generation: markdown
  functional-requirements.md:
    title: Functional Requirements
    generation: markdown
  profiles.md:
    title: FHIR Profiles
    generation: markdown
  extensions.md:
    title: FHIR Extensions
    generation: markdown

# Navigation menu
menu:
  Home: index.html
  Business Requirements:
    Overview: business-requirements.html
    Actors: actors.html
    User Scenarios: user-scenarios.html
    Business Processes: business-processes.html
    Core Data Dictionary: concepts.html
    Decision Support Logic: decision-logic.html
    Indicators and Measures: indicators.html
    Functional Requirements: functional-requirements.html
  Technical Specifications:
    Profiles: profiles.html
    Extensions: extensions.html
    Terminology: terminology.html
  Artifacts: artifacts.html
  Downloads: downloads.html

# Build parameters
parameters:
  apply-contact: true
  apply-context: true
  apply-copyright: true
  apply-jurisdiction: true
  apply-license: true
  apply-publisher: true
  apply-version: true
```

## Validation Requirements

When editing `sushi-config.yaml` files in SGEX Workbench, the following validation rules apply:

### Required Fields
- `id`: Must be present and follow reverse domain naming (e.g., `who.fhir.guideline-name`)
- `fhirVersion`: Must be a valid FHIR version (typically `4.0.1` for R4)
- `name`: Must be PascalCase with no spaces
- `version`: Must follow semantic versioning (x.y.z)
- `title`: Human-readable title
- `description`: Meaningful description of the implementation guide

### Data Type Validation
- `id`: Lowercase with dots and hyphens only
- `name`: PascalCase (starts with capital, no spaces)
- `version`: Semantic versioning format
- `status`: Must be one of: draft, active, retired, unknown
- `experimental`: Boolean value
- `fhirVersion`: Valid FHIR version string

### WHO SMART Guidelines Specific Requirements
- Must include `smart.who.int.base` dependency
- Publisher should reference WHO or authorized organization
- Should follow WHO terminology and branding guidelines

## Integration with SGEX Workbench

SGEX Workbench provides comprehensive `sushi-config.yaml` management through:

1. **Summary Dashboard**: Quick view and editing of key fields
2. **Dependencies Management**: Add and manage implementation guide dependencies
3. **Pages Integration**: View and manage page structure with links to source files
4. **Validation**: Real-time validation with clear error messages
5. **Source Access**: Direct links to GitHub source and staging versions
6. **Save Operations**: Commit changes directly to GitHub repository

## Related Resources

- [SUSHI Documentation](https://fshschool.org/docs/sushi/)
- [FSH School](https://fshschool.org/)
- [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines)
- [FHIR Implementation Guide Publisher](https://confluence.hl7.org/display/FHIR/IG+Publisher+Documentation)