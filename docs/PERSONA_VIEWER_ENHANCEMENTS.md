# PersonaViewer Future Enhancements

## Overview
This document outlines planned enhancements for the PersonaViewer component to support creating, editing, and managing Generic Personas (ActorDefinitions) following WHO SMART Guidelines data models.

## Current Status (Issue #996 - COMPLETED)
✅ PersonaViewer component created and functional
✅ Scans FSH files under `input/fsh/actors` for ActorDefinitions
✅ Scans JSON files under `inputs/resources` for ActorDefinition resources
✅ Displays found personas with links to source files
✅ Proper routing configuration (`/persona-viewer/:user/:repo/:branch`)
✅ Framework compliance and deployment robustness

## Planned Enhancements

### 1. Create New Generic Personas
**Objective**: Allow users to create new Generic Personas via ActorDefinition FSH files

**Data Model**: Follow authoritative WHO smart-base model
- Reference: https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/GenericPersona.fsh

**Fields to Support**:
- Profile metadata (id, title, description)
- Actor type (person, organization, system)
- Roles and responsibilities
- Qualifications and certifications
- Specialties
- Location constraints
- Access levels
- Interactions with other actors
- Associated processes

**Implementation Approach**:
- Leverage existing ActorEditor FSH editing capabilities
- Add "Create New Persona" button to PersonaViewer
- FSH template generation based on GenericPersona.fsh model
- Form-based editor with preview of generated FSH

### 2. Edit Existing Personas
**Objective**: Enable in-place editing of ActorDefinition FSH files

**Features**:
- Click-to-edit from PersonaViewer list
- Syntax highlighting for FSH content
- Validation against GenericPersona profile
- Save changes to staging ground
- Commit to repository workflow

**Integration**:
- Use ActorEditor component for editing logic
- Share FSH generation/parsing utilities
- Maintain consistency with existing actor definition service

### 3. Requirements Modeling Support
**Objective**: Follow WHO smart-base data models for functional/non-functional requirements

**Data Models**: 
- Reference: https://github.com/WorldHealthOrganization/smart-base/tree/main/input/fsh/models
- GenericPersona.fsh
- FunctionalRequirement.fsh
- NonFunctionalRequirement.fsh
- Other relevant models

**Features**:
- Validate personas against requirements models
- Link personas to functional requirements
- Support requirement traceability
- Generate requirement documentation

### 4. Enhanced Viewing Features
**Objective**: Improve persona visualization and navigation

**Features**:
- Detailed persona profile viewer
- Relationship graph showing persona interactions
- Role hierarchy visualization
- Search and filter capabilities
- Export to various formats (JSON, FSH, documentation)

### 5. Collaboration Features
**Objective**: Support team collaboration on persona definitions

**Features**:
- Version history for persona changes
- Comments and annotations
- Review and approval workflow
- Merge conflict resolution for concurrent edits

## Technical Considerations

### React Hooks Compliance
- All hooks (useState, useCallback, useEffect) must be called at top level
- No conditional hook calls
- Proper dependency arrays for effects

### Framework Integration
- Use `usePage()` hook for page context (matching CoreDataDictionaryViewer pattern)
- Integrate with `githubService` for repository operations
- Follow PageLayout and component architecture standards
- Proper error handling and loading states

### FSH File Management
- Use existing `actorDefinitionService` patterns
- Leverage staging ground for uncommitted changes
- Follow FSH syntax and validation rules
- Support FSH templates and snippets

### WHO Standards Compliance
- Follow WHO SMART Guidelines terminology
- Use official data models from smart-base repository
- Maintain FHIR R4 compatibility
- Support both L2 and L3 representations

## Implementation Priority

### Phase 1 (High Priority)
1. Fix React hooks compliance issues in PersonaViewer
2. Add "Create New Persona" functionality
3. Basic FSH editing integration

### Phase 2 (Medium Priority)
1. Enhanced persona viewer with detailed profiles
2. Requirements modeling integration
3. Validation against smart-base models

### Phase 3 (Lower Priority)
1. Collaboration features
2. Advanced visualization
3. Export and documentation generation

## References

- **WHO SMART Guidelines**: https://www.who.int/teams/digital-health-and-innovation/smart-guidelines
- **smart-base Repository**: https://github.com/WorldHealthOrganization/smart-base
- **GenericPersona Model**: https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/GenericPersona.fsh
- **FSH Models**: https://github.com/WorldHealthOrganization/smart-base/tree/main/input/fsh/models
- **FHIR ActorDefinition**: http://hl7.org/fhir/actordefinition.html

## Related Components

- **ActorEditor**: Existing component for editing ActorDefinitions
- **actorDefinitionService**: Service layer for actor operations
- **stagingGroundService**: Manages uncommitted changes
- **githubService**: GitHub API integration

## Notes

- PersonaViewer and ActorEditor work with the same underlying concept (Generic Personas = ActorDefinition)
- PersonaViewer is for read-only scanning and viewing
- ActorEditor is for creating and editing
- Both should share common utilities and data models
- Terminology: "Persona" (DAK term) = "ActorDefinition" (FHIR resource)

---

**Created**: 2025-01-14
**Last Updated**: 2025-01-14
**Status**: Planning Document
**Related Issue**: #996
