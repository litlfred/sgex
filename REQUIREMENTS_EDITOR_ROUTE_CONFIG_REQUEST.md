# Requirements Editor Route Configuration Request

## Summary

The RequirementsEditor component has been successfully implemented and is ready for use, but requires a route configuration entry to be accessible in the application.

## Required Change

The following entry needs to be added to `public/routes-config.json` in the `dakComponents` section:

```json
"functional-requirements": {
  "component": "RequirementsEditor",
  "path": "./components/RequirementsEditor"
}
```

## Why This File Requires Consent

The file `public/routes-config.json` is marked with:
```
"_COPILOT_PROHIBITION_WARNING": "🚨 COPILOT AGENTS ARE STRICTLY PROHIBITED FROM MAKING ANY CHANGES TO THIS FILE WITHOUT EXPLICIT WRITTEN CONSENT FROM @litlfred"
```

This file controls core route configuration and component loading. Unauthorized changes can break the entire application routing system.

## Component Status

### ✅ Completed
- RequirementsEditor component implementation
- RequirementsEditor.css styling
- componentRouteService.js lazy load registration
- Help content in helpContentService.js
- Documentation updates in dak-components.md

### ⚠️ Blocked by Route Configuration
- Component cannot be accessed via URL
- Dashboard link to functional-requirements won't work
- Component cannot be tested in live environment

## Implementation Details

### Component Features
1. **List Requirements**: Displays all FSH files from `input/fsh/requirements/`
2. **Create Functional Requirements**: Template-based creation following WHO FunctionalRequirement model
3. **Create Non-Functional Requirements**: Template-based creation following WHO NonFunctionalRequirement model
4. **Edit Requirements**: FSH content editor with syntax help
5. **Delete Requirements**: Safe deletion with confirmation
6. **Help System**: Comprehensive contextual help integrated

### WHO Smart-Base Compliance
The component is based on the authoritative WHO smart-base logical models:
- FunctionalRequirement: https://worldhealthorganization.github.io/smart-base/StructureDefinition-FunctionalRequirement.html
- NonFunctionalRequirement: https://worldhealthorganization.github.io/smart-base/StructureDefinition-NonFunctionalRequirement.html

### Data Models

#### FunctionalRequirement
```fsh
* id 1..1 id "Requirement ID"
* activity 1..1 string "Activity"
* actor 0..* Reference(SGActor) "Actor"
* capability[x] 0..1 string or Coding "Capability"
* benefit[x] 0..1 string or Coding "Benefit"
* classification 0..* Coding "Classification"
```

#### NonFunctionalRequirement
```fsh
* id 1..1 id "Requirement ID"
* requirement 1..1 string "Requirement"
* category 0..1 Coding "Category"
* classification 0..* Coding "Classification"
```

## Dashboard Integration

The DAK Dashboard already includes the requirements component in its component list:
```javascript
{
  id: 'functional-requirements',
  title: 'Functional and Non-Functional Requirements',
  description: 'System requirements specifications that define capabilities and constraints',
  icon: '⚙️',
  path: 'functional-requirements',
  level: 'Level 2: Core Components',
  color: '#6b69d6'
}
```

Once the route is configured, users will be able to click this card and access the RequirementsEditor.

## Testing Plan

After route configuration is approved and added:

1. **Basic Access Test**
   - Navigate to `/functional-requirements/:user/:repo/:branch`
   - Verify component loads correctly

2. **Create Functional Requirement Test**
   - Click "+ Functional" button
   - Verify template is loaded
   - Edit template with test data
   - Save and verify file is created in repository

3. **Create Non-Functional Requirement Test**
   - Click "+ Non-Functional" button
   - Verify template is loaded
   - Edit template with test data
   - Save and verify file is created in repository

4. **Edit Requirement Test**
   - Select existing requirement from list
   - Modify FSH content
   - Save and verify changes are committed

5. **Delete Requirement Test**
   - Select requirement
   - Click delete button
   - Confirm deletion
   - Verify file is removed from repository

## Request for Approval

@litlfred - Please review and approve the addition of the `functional-requirements` route configuration to `public/routes-config.json` as specified above. This is the final step needed to make the RequirementsEditor component accessible to users.

## Alternative Testing

If immediate route configuration approval is not available, the component can be tested by:
1. Temporarily modifying routes-config.json in a local development environment
2. Accessing the component via direct URL manipulation
3. Using the componentRouteService.createLazyComponent function directly

However, none of these alternatives provide a production-ready solution.
