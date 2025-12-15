# PersonaViewer Future Enhancements

## Overview
This document outlines planned enhancements to the PersonaViewer component for creating, editing, and managing Generic Personas (ActorDefinitions) in DAK repositories.

## Current Status
The PersonaViewer component currently provides:
- ✅ Scanning and viewing ActorDefinitions from FSH files (`input/fsh/actors`)
- ✅ Scanning and viewing ActorDefinitions from JSON files (`inputs/resources`)
- ✅ Display of found actors with links to source files
- ✅ Read-only viewing functionality

## Planned Enhancements

### 1. Create New Generic Persona
**Objective**: Allow users to create new Generic Personas via ActorDefinition FSH files

**Requirements**:
- Follow the authoritative data model: https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/GenericPersona.fsh
- Support all fields defined in GenericPersona.fsh:
  - identifier (required)
  - name/title
  - description
  - type (e.g., practitioner, patient, relatedperson)
  - qualification
  - communication
  - telecom
  - address

**Implementation Approach**:
- Leverage existing ActorEditor component patterns for FSH file editing
- Integrate with actorDefinitionService for FSH generation
- Use staging ground for temporary storage before commit

### 2. Edit Existing Generic Personas
**Objective**: Enable in-place editing of ActorDefinition FSH files

**Requirements**:
- Load existing FSH file content
- Parse FSH to editable form fields
- Generate updated FSH on save
- Preserve FSH formatting and comments

**Implementation Approach**:
- Extend actorDefinitionService.parseFSH() for comprehensive parsing
- Enhance actorDefinitionService.generateFSH() for all GenericPersona fields
- Add form validation based on FHIR ActorDefinition constraints

### 3. Support for Requirements Models
**Objective**: Extend support to all WHO smart-base data models

**Data Models to Support**:
- GenericPersona.fsh (priority 1)
- FunctionalRequirement.fsh
- NonFunctionalRequirement.fsh
- UserScenario.fsh
- Other models in https://github.com/WorldHealthOrganization/smart-base/tree/main/input/fsh/models

**Requirements**:
- View/Edit/Create functionality for each model type
- Model-specific validation
- Consistent UI patterns across all model types

### 4. Integration with ActorEditor
**Objective**: Consolidate persona management into unified workflow

**Approach**:
- PersonaViewer: Read-only scanning and discovery
- ActorEditor: Full CRUD operations on ActorDefinitions
- Seamless navigation between viewer and editor modes
- Consistent data model and FSH handling

## Technical Considerations

### FSH File Handling
- Use actorDefinitionService for FSH parsing and generation
- Maintain compatibility with SUSHI FSH compiler
- Support FSH syntax highlighting and validation

### GitHub Integration
- Use githubService for file operations
- Support branch-based workflows
- Implement proper commit messages and PR creation

### Data Validation
- Validate against FHIR ActorDefinition specification
- Enforce WHO smart-base data model constraints
- Provide helpful error messages and guidance

### User Experience
- Clear distinction between view and edit modes
- Intuitive form layouts matching FSH structure
- Real-time FSH preview
- Template selection for common persona types

## Implementation Phases

### Phase 1: Fix Current Build Issues
- ✅ Resolve React hooks violations in PersonaViewer
- ✅ Ensure build passes without errors
- ✅ Complete current PR for issue #996

### Phase 2: Basic Create Functionality
- Add "Create New Persona" button to PersonaViewer
- Implement basic form for GenericPersona fields
- Generate FSH file and save to staging ground
- Enable commit to repository

### Phase 3: Edit Functionality
- Add "Edit" action to each displayed persona
- Load FSH file content into editable form
- Support save and update operations
- Handle FSH parsing edge cases

### Phase 4: Advanced Features
- Template library for common persona types
- Bulk operations (import/export multiple personas)
- Version comparison and merge support
- Integration with other DAK components

## Related Resources

### Authoritative Data Models
- GenericPersona: https://github.com/WorldHealthOrganization/smart-base/blob/main/input/fsh/models/GenericPersona.fsh
- All models: https://github.com/WorldHealthOrganization/smart-base/tree/main/input/fsh/models

### Existing Code to Leverage
- `src/components/ActorEditor.js` - FSH editing patterns
- `src/services/actorDefinitionService.js` - FSH parsing and generation
- `src/services/githubService.js` - Repository operations
- `src/services/stagingGroundService.js` - Temporary file storage

### Documentation
- `docs/FRAMEWORK_HOOKS_USAGE_GUIDE.md` - Framework hook usage patterns
- `public/docs/dak-components.md` - DAK component specifications
- `public/docs/solution-architecture.md` - Overall architecture

## Success Criteria
- Users can create new Generic Personas without writing FSH code
- Existing personas can be edited with visual forms
- Generated FSH files comply with WHO smart-base standards
- Changes integrate smoothly with GitHub workflow
- UI follows SGEX component architecture patterns

## Next Steps
1. Create new GitHub issue for PersonaViewer enhancements
2. Design detailed UI mockups for create/edit forms
3. Implement Phase 2 (Basic Create Functionality)
4. Iterate based on user feedback
