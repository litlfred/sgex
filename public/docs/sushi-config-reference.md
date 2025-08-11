# SUSHI Configuration File Reference

This document provides a comprehensive reference for the `sushi-config.yaml` file used in WHO SMART Guidelines Digital Adaptation Kits (DAKs).

## Overview

The `sushi-config.yaml` file is the central configuration file for SUSHI projects. It defines the metadata, dependencies, build settings, and content structure for FHIR Implementation Guides.

## File Location

The configuration file must be located in the root directory of your project:

```
my-dak-project/
├── sushi-config.yaml    ← Configuration file location
├── input/
├── fsh-generated/
└── output/
```

## Basic Structure

```yaml
# Project Identification
id: string                    # Required: Unique identifier
canonical: url                # Required: Base canonical URL  
name: string                  # Required: Project name
title: string                 # Optional: Human-readable title
description: string           # Optional: Project description
version: string               # Required: Project version

# FHIR Configuration
fhirVersion: string           # Required: FHIR version
status: string                # Required: Publication status

# Publication Information
publisher: object             # Required: Publisher details
copyrightYear: number         # Optional: Copyright year
releaseLabel: string          # Optional: Release label
license: string               # Optional: License identifier

# Dependencies
dependencies: object          # Optional: External IG dependencies

# Content Configuration
pages: object                 # Optional: Custom page definitions
menu: object                  # Optional: Navigation menu structure
resources: object             # Optional: Resource metadata
groups: object                # Optional: Resource groupings

# Build Configuration
template: string              # Optional: Custom template
parameters: object            # Optional: Build parameters
```

## Required Fields

### Project Identification

#### id
**Type**: string  
**Required**: Yes  
**Pattern**: `^[a-z0-9]+(\.[a-z0-9]+)*$`

Unique identifier for the Implementation Guide. Must be lowercase alphanumeric with dots.

```yaml
id: who.fhir.anc              # ✓ Valid
id: WHO.FHIR.ANC              # ✗ Invalid (uppercase)
id: who-fhir-anc              # ✗ Invalid (hyphens)
```

#### canonical
**Type**: URL  
**Required**: Yes

Base canonical URL for all resources in this IG.

```yaml
canonical: http://smart.who.int/anc
```

#### name
**Type**: string  
**Required**: Yes  
**Pattern**: No spaces recommended (use PascalCase)

Internal name for the project. Used in code generation.

```yaml
name: WHOANCGuidelines        # ✓ Recommended
name: WHO ANC Guidelines      # ✗ Avoid spaces
```

#### version
**Type**: string  
**Required**: Yes  
**Pattern**: Semantic versioning recommended

Version of this Implementation Guide.

```yaml
version: 1.0.0                # ✓ Semantic versioning
version: 1.0.0-ballot         # ✓ Pre-release
version: current              # ✓ Development version
```

#### fhirVersion
**Type**: string  
**Required**: Yes  
**Values**: `4.0.1`, `4.3.0`, `5.0.0`

FHIR version this IG is based on.

```yaml
fhirVersion: 4.0.1            # Most common for WHO DAKs
```

#### status
**Type**: string  
**Required**: Yes  
**Values**: `draft`, `active`, `retired`, `unknown`

Publication status of the Implementation Guide.

```yaml
status: draft                 # During development
status: active                # Published and stable
```

### Publisher Information

#### publisher
**Type**: object  
**Required**: Yes

Information about the organization publishing this IG.

```yaml
publisher:
  name: World Health Organization (WHO)
  url: https://www.who.int
  email: smart@who.int
```

For WHO DAKs, use the standard WHO publisher information.

## Optional Fields

### Content Metadata

#### title
**Type**: string  
**Optional**: Yes (defaults to `name`)

Human-readable title for the Implementation Guide.

```yaml
title: WHO Antenatal Care Guidelines
```

#### description
**Type**: string  
**Optional**: Yes

Brief description of the Implementation Guide purpose and scope.

```yaml
description: >
  This Implementation Guide provides FHIR-based data models and decision 
  support logic for WHO recommendations on antenatal care for a positive 
  pregnancy experience.
```

#### copyrightYear
**Type**: number  
**Optional**: Yes

Year for copyright notice.

```yaml
copyrightYear: 2024
```

#### releaseLabel
**Type**: string  
**Optional**: Yes

Label for this release (e.g., STU1, R4).

```yaml
releaseLabel: STU1
```

#### license
**Type**: string  
**Optional**: Yes

SPDX license identifier.

```yaml
license: CC0-1.0              # Creative Commons
license: Apache-2.0           # Apache License
```

### Dependencies

#### dependencies
**Type**: object  
**Optional**: Yes (but recommended for WHO DAKs)

External Implementation Guides this IG depends on.

```yaml
dependencies:
  smart.who.int.base: current          # WHO base (required for WHO DAKs)
  hl7.fhir.uv.sdc: current            # Structured Data Capture
  hl7.fhir.uv.cpg: current            # Clinical Practice Guidelines
  hl7.terminology: current            # FHIR terminology
```

### Page Configuration

#### pages
**Type**: object  
**Optional**: Yes

Custom page definitions for the Implementation Guide.

```yaml
pages:
  index.md:
    title: Home Page
    generation: markdown
  background.md:
    title: Background
    generation: markdown
  artifacts.html:
    title: Artifacts Summary
    generation: html
```

#### menu
**Type**: object  
**Optional**: Yes

Navigation menu structure.

```yaml
menu:
  Home: index.html
  Background: background.html
  Functional Requirements: functional-requirements.html
  Data Models: data-models.html
  Decision Support: decision-support.html
  Indicators: indicators.html
  Artifacts Summary: artifacts.html
```

### Resource Configuration

#### resources
**Type**: object  
**Optional**: Yes

Metadata for specific resources.

```yaml
resources:
  Patient/anc-patient-example:
    name: ANC Patient Example
    description: Example patient for antenatal care
    exampleCanonical: http://smart.who.int/anc/StructureDefinition/anc-patient
```

#### groups
**Type**: object  
**Optional**: Yes

Logical groupings of resources for the IG.

```yaml
groups:
  profiles:
    name: Profiles
    description: FHIR profiles for ANC data models
    resources:
      - StructureDefinition/anc-patient
      - StructureDefinition/anc-encounter
  examples:
    name: Examples
    description: Example instances
    resources:
      - Patient/anc-patient-example
```

### Build Configuration

#### template
**Type**: string  
**Optional**: Yes

Custom template for IG generation.

```yaml
template: smart.who.int.template       # WHO standard template
```

#### parameters
**Type**: object  
**Optional**: Yes

Build parameters for IG Publisher.

```yaml
parameters:
  show-inherited-invariants: false
  usage-stats-opt-out: true
  excludexml: true
  excludejson: false
  excludettl: true
```

## WHO DAK-Specific Requirements

### Required Dependencies

All WHO SMART Guidelines DAKs must include:

```yaml
dependencies:
  smart.who.int.base: current
```

### Recommended Publisher Information

```yaml
publisher:
  name: World Health Organization (WHO)
  url: https://www.who.int
  email: smart@who.int
```

### Naming Conventions

- **id**: Use `who.fhir.{domain}` pattern (e.g., `who.fhir.anc`)
- **name**: Use WHO{Domain}Guidelines pattern (e.g., `WHOANCGuidelines`)
- **canonical**: Use `http://smart.who.int/{domain}` pattern

### Standard Pages

WHO DAKs should include these standard pages:

```yaml
pages:
  index.md:
    title: Home
  background.md:
    title: Background  
  functional-requirements.md:
    title: Functional Requirements
  data-models.md:
    title: Data Models
  decision-support.md:
    title: Decision Support
  indicators.md:
    title: Indicators and Measures
  artifacts.html:
    title: Artifacts Summary
```

## Validation Rules

### Format Validation

- **YAML Syntax**: Must be valid YAML
- **Required Fields**: All required fields must be present
- **Data Types**: Fields must match expected data types
- **Patterns**: String fields must match specified patterns

### WHO-Specific Validation

- **Base Dependency**: Must include `smart.who.int.base`
- **Naming Conventions**: Must follow WHO naming standards
- **Publisher Information**: Should use WHO publisher details
- **License**: Should use appropriate open license

### Common Validation Errors

```yaml
# ✗ Invalid ID format
id: WHO-ANC-Guidelines

# ✓ Correct ID format  
id: who.fhir.anc

# ✗ Invalid name with spaces
name: WHO ANC Guidelines

# ✓ Correct PascalCase name
name: WHOANCGuidelines

# ✗ Invalid version format
version: v1.0

# ✓ Correct semantic version
version: 1.0.0

# ✗ Missing WHO base dependency
dependencies:
  hl7.fhir.uv.sdc: current

# ✓ Includes WHO base dependency
dependencies:
  smart.who.int.base: current
  hl7.fhir.uv.sdc: current
```

## Complete Example

```yaml
# WHO Antenatal Care Guidelines Implementation Guide
id: who.fhir.anc
canonical: http://smart.who.int/anc
name: WHOANCGuidelines
title: WHO Antenatal Care Guidelines
description: >
  Implementation Guide for WHO recommendations on antenatal care 
  for a positive pregnancy experience.
version: 1.0.0
fhirVersion: 4.0.1
status: active

publisher:
  name: World Health Organization (WHO)
  url: https://www.who.int
  email: smart@who.int

copyrightYear: 2024
releaseLabel: STU1
license: CC0-1.0

dependencies:
  smart.who.int.base: current
  hl7.fhir.uv.sdc: current
  hl7.fhir.uv.cpg: current

template: smart.who.int.template

pages:
  index.md:
    title: Home
    generation: markdown
  background.md:
    title: Background
    generation: markdown
  functional-requirements.md:
    title: Functional Requirements
    generation: markdown
  data-models.md:
    title: Data Models  
    generation: markdown
  decision-support.md:
    title: Decision Support
    generation: markdown
  indicators.md:
    title: Indicators and Measures
    generation: markdown

menu:
  Home: index.html
  Background: background.html
  Functional Requirements: functional-requirements.html
  Data Models: data-models.html
  Decision Support: decision-support.html
  Indicators: indicators.html
  Artifacts Summary: artifacts.html

parameters:
  show-inherited-invariants: false
  usage-stats-opt-out: true
  excludexml: true
  excludettl: true
```

## SGEX Integration

The SUSHI Status dashboard in SGEX Workbench provides:

1. **Visual Editing**: Inline editing of key configuration fields
2. **Validation Feedback**: Real-time validation with clear error messages
3. **Source Management**: Handle both GitHub and staging versions
4. **Publisher Management**: Structured editing of publisher information
5. **Dependency Management**: Add/remove dependencies with validation
6. **Page Management**: Links to source files in GitHub/staging

### Supported Editing Features

- **Summary Fields**: id, name, version, title, description, fhirVersion
- **Publisher Object**: name, url, email with validation
- **Dependencies**: Add/remove with version management
- **Source Views**: Raw YAML viewing and GitHub links
- **Validation**: Real-time validation with explanations

## Resources

- **SUSHI Configuration Documentation**: https://fshschool.org/docs/sushi/configuration/
- **FHIR IG Publisher Guide**: https://confluence.hl7.org/display/FHIR/IG+Publisher+Documentation
- **WHO IG Starter Kit**: https://smart.who.int/ig-starter-kit/
- **SGEX Workbench**: Integrated SUSHI configuration management