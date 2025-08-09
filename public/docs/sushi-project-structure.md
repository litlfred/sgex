# SUSHI Project Structure for WHO SMART Guidelines DAKs

This document describes the SUSHI (FHIR Shorthand) project structure and configuration requirements for WHO SMART Guidelines Digital Adaptation Kits (DAKs).

## Overview

SUSHI is the reference implementation for FSH (FHIR Shorthand), a domain-specific language for defining FHIR Implementation Guides. All WHO SMART Guidelines DAKs are built using SUSHI and follow a standardized project structure.

## Project Structure

A standard WHO SMART Guidelines DAK project follows this structure:

```
my-dak-project/
├── sushi-config.yaml          # Main configuration file (REQUIRED)
├── input/                     # SUSHI input directory
│   ├── fsh/                   # FSH source files
│   │   ├── profiles/          # FHIR profiles
│   │   ├── extensions/        # FHIR extensions  
│   │   ├── valuesets/         # Value sets
│   │   ├── codesystems/       # Code systems
│   │   ├── examples/          # Example instances
│   │   ├── rules/             # Mapping rules
│   │   └── aliases.fsh        # Common aliases
│   ├── pagecontent/           # Implementation Guide pages
│   │   ├── index.md           # Home page
│   │   ├── background.md      # Background information
│   │   └── ...                # Additional pages
│   ├── images/                # Images for IG pages
│   ├── includes/              # Include files for templates
│   └── ignoreWarnings.txt     # Warnings to ignore
├── fsh-generated/             # Auto-generated FHIR resources (do not edit)
├── output/                    # Generated Implementation Guide
└── temp/                      # Temporary build files
```

## SUSHI Configuration File

The `sushi-config.yaml` file is the heart of a SUSHI project. It defines metadata, dependencies, and build settings for the Implementation Guide.

### Required Fields for WHO DAKs

```yaml
# Project identification
id: who.fhir.example                    # Unique identifier (lowercase, dots)
name: WHOExampleGuidelines             # PascalCase name (no spaces)
title: WHO Example Guidelines          # Human-readable title
description: Example WHO guidelines    # Brief description
version: 1.0.0                        # Semantic version

# FHIR configuration
fhirVersion: 4.0.1                     # FHIR version to use
canonical: http://smart.who.int/example # Base URL for resources

# Publication metadata
status: draft                          # draft | active | retired
publisher:
  name: World Health Organization (WHO)
  url: https://www.who.int
  email: smart@who.int

# WHO base dependency (REQUIRED for WHO DAKs)
dependencies:
  smart.who.int.base: current          # WHO base IG dependency
```

### Common Optional Fields

```yaml
# Additional metadata
copyrightYear: 2024
releaseLabel: STU1
jurisdiction: http://unstats.un.org/unsd/methods/m49/m49.htm#001

# Build configuration
template: smart.who.int.template        # WHO template for consistent styling
license: CC0-1.0                       # License identifier

# Resource definitions
resources:
  Patient/example-patient:
    name: Example Patient
    description: An example patient resource

# Custom pages
pages:
  index.md:
    title: Home Page
  background.md:
    title: Background
    generation: markdown

# Menu structure
menu:
  Home: index.html
  Background: background.html
  Artifacts Summary: artifacts.html
```

## FSH File Organization

### Recommended Directory Structure

- **profiles/**: FHIR resource profiles that constrain base resources
- **extensions/**: Custom FHIR extensions for additional data elements
- **valuesets/**: Terminology value sets used in profiles
- **codesystems/**: Custom code systems and terminologies  
- **examples/**: Example instances demonstrating profile usage
- **rules/**: Mapping rules and invariants
- **aliases.fsh**: Common aliases and shortcuts used across files

### Naming Conventions

- **Files**: Use kebab-case (e.g., `patient-profile.fsh`)
- **FSH Names**: Use PascalCase (e.g., `WHOPatientProfile`)
- **IDs**: Use lowercase with dots (e.g., `who.patient.profile`)

### Example FSH File Structure

```fsh
// aliases.fsh - Common aliases
Alias: $SCT = http://snomed.info/sct
Alias: $LNC = http://loinc.org

// profiles/patient-profile.fsh
Profile: WHOPatientProfile
Parent: Patient
Id: who.patient.profile
Title: "WHO Patient Profile"
Description: "Patient profile for WHO SMART Guidelines"
* identifier 1..* MS
* name 1..* MS
```

## Implementation Guide Pages

Pages in `input/pagecontent/` are written in Markdown and provide human-readable documentation for the Implementation Guide.

### Required Pages for WHO DAKs

1. **index.md**: Home page introducing the IG
2. **background.md**: Clinical background and use cases
3. **functional-requirements.md**: Functional requirements
4. **data-models.md**: Data model descriptions
5. **decision-support.md**: Decision support logic
6. **indicators.md**: Program indicators and measures

### Page Configuration

Pages are configured in `sushi-config.yaml`:

```yaml
pages:
  index.md:
    title: Home
    generation: markdown
  background.md:
    title: Background
    generation: markdown
  artifacts.html:
    title: Artifacts Summary
    generation: html
```

## Dependencies

WHO SMART Guidelines DAKs must include the WHO base dependency:

```yaml
dependencies:
  smart.who.int.base: current
```

Common additional dependencies:

```yaml
dependencies:
  smart.who.int.base: current
  hl7.fhir.uv.sdc: current              # Structured Data Capture
  hl7.fhir.uv.cpg: current              # Clinical Practice Guidelines
  hl7.terminology: current              # FHIR terminology
```

## Build Process

SUSHI builds the Implementation Guide through these steps:

1. **Parse FSH**: Convert FSH files to FHIR JSON
2. **Validate**: Check resources against FHIR specifications
3. **Generate IG**: Create HTML Implementation Guide using templates
4. **Package**: Create FHIR package for distribution

### Build Commands

```bash
# Install SUSHI globally
npm install -g fsh-sushi

# Build the IG (from project root)
sushi build

# Validate resources
sushi build --validation

# Build with specific template
sushi build --template smart.who.int.template
```

## Validation and Quality Assurance

### Required Validations

1. **FHIR Compliance**: All resources must be valid FHIR
2. **Profile Compliance**: Examples must conform to defined profiles
3. **Terminology Validation**: Value sets and code systems must be valid
4. **WHO Guidelines Compliance**: Must follow WHO standards and patterns

### Common Validation Issues

- Missing required elements in profiles
- Invalid terminology bindings
- Incorrect resource references
- Missing or invalid metadata

## Integration with SGEX Workbench

SGEX Workbench provides integrated support for SUSHI projects:

1. **Configuration Management**: Edit `sushi-config.yaml` through web interface
2. **FSH File Management**: Browse and edit FSH files with syntax highlighting
3. **Build Integration**: Run SUSHI builds directly from the interface
4. **Validation Feedback**: Real-time validation and error reporting
5. **GitHub Integration**: Seamless version control and collaboration

### SGEX SUSHI Features

- **SUSHI Status Dashboard**: Monitor configuration and build status
- **Inline Editing**: Edit configuration fields with validation
- **Source Management**: Handle both GitHub and staging versions
- **Dependency Management**: Add and manage IG dependencies
- **Page Management**: Link to source files in GitHub/staging

## Best Practices

### Project Organization

1. **Logical Structure**: Organize FSH files by logical groupings
2. **Consistent Naming**: Use consistent naming conventions throughout
3. **Documentation**: Include comprehensive page content
4. **Version Control**: Use semantic versioning and proper Git practices

### FSH Development

1. **Modular Design**: Split large profiles into focused, reusable components
2. **Clear Descriptions**: Provide meaningful titles and descriptions
3. **Example Coverage**: Include examples for all major use cases
4. **Validation**: Regularly validate resources during development

### WHO Guidelines Compliance

1. **Base Dependency**: Always include `smart.who.int.base` dependency
2. **Naming Standards**: Follow WHO naming conventions
3. **Metadata Standards**: Use consistent and complete metadata
4. **Template Usage**: Use WHO-approved templates for consistent styling

## Troubleshooting

### Common Issues

- **Build Failures**: Check FSH syntax and FHIR compliance
- **Validation Errors**: Verify profile constraints and example conformance
- **Template Issues**: Ensure correct template configuration
- **Dependency Problems**: Check dependency versions and availability

### Getting Help

- **SUSHI Documentation**: https://fshschool.org/docs/sushi/
- **FSH Language Guide**: https://hl7.org/fhir/uv/shorthand/
- **WHO IG Starter Kit**: https://smart.who.int/ig-starter-kit/
- **SGEX Workbench Support**: Use the built-in help system and contextual guidance

## Resources

- **SUSHI Official Documentation**: https://fshschool.org/docs/sushi/
- **FSH Language Specification**: https://hl7.org/fhir/uv/shorthand/
- **WHO SMART Guidelines**: https://www.who.int/teams/digital-health-and-innovation/smart-guidelines
- **FHIR Implementation Guide Publisher**: https://confluence.hl7.org/display/FHIR/IG+Publisher+Documentation
- **Example WHO DAK**: https://github.com/WorldHealthOrganization/smart-immunizations