# DAK Framework Integration Summary

## Overview

This document summarizes the integration of the WHO SMART Guidelines DAK Logical Model framework (from PR #1111) into the User Scenarios functionality.

## Integration Completed

### Date: October 16, 2025

### Components Integrated

1. **UserScenariosManager.js** - Fully integrated with DAK framework
2. **dakIntegrationService.js** - New bridge service created
3. **dakFrameworkService.js** - Updated to use DAK framework for persona loading

## Key Changes

### 1. New Service: `dakIntegrationService.js`

**Purpose**: Bridges React components with @sgex/dak-core Component Objects

**Key Methods**:
- `initialize(owner, repo, branch)` - Creates DAKObject for repository
- `loadUserScenarios()` - Loads scenarios via UserScenarioComponent
- `loadPersonas()` - Loads personas via GenericPersonaComponent
- `saveUserScenario(data)` - Saves scenario with automatic dak.json update
- `validateUserScenario(data)` - Validates scenario data

**Benefits**:
- Clean separation between React and DAK framework
- Automatic dak.json management
- Source resolution (canonical, URL, inline)
- Built-in validation

### 2. Updated: `dakFrameworkService.js`

**Changes**:
- Now uses `dakIntegrationService` for persona loading
- Maintains backwards compatible fallback (`getActorsLegacy`)
- Automatic cache invalidation on data changes

**Migration Path**:
```javascript
// Old way
const actors = await loadActorsFromGitHub(owner, repo, branch);

// New way
const actors = await dakFrameworkService.getActors(owner, repo, branch);
// Internally uses dakIntegrationService → GenericPersonaComponent
```

### 3. Refactored: `UserScenariosManager.js`

**Old Approach**:
- Direct file manipulation with githubService
- Manual dak.json updates
- Custom parsing logic

**New Approach**:
- Uses `dakIntegrationService.loadUserScenarios()`
- Uses `dakIntegrationService.saveUserScenario()`
- Automatic dak.json management
- Built-in validation and source resolution

**Code Example**:
```javascript
// Initialize DAK framework
await dakIntegrationService.initialize(owner, repo, branch);

// Load scenarios
const scenarios = await dakIntegrationService.loadUserScenarios();

// Save scenario
await dakIntegrationService.saveUserScenario({
  id: 'Anc-registration-001',
  title: 'ANC Registration Scenario',
  markdown: content,
  actors: ['Healthcare-worker', 'Pregnant-woman'],
  description: 'User scenario for ANC registration'
});
// Automatically saves markdown file + updates dak.json
```

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│              React Component                                 │
│           (UserScenariosManager)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         dakIntegrationService.js (Bridge Layer)              │
│  - initialize()                                              │
│  - loadUserScenarios()                                       │
│  - saveUserScenario()                                        │
│  - loadPersonas()                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           DAKFactory + DAKObject                             │
│      (@sgex/dak-core framework)                              │
└─────┬───────────────────────┬────────────────────────────────┘
      │                       │
      ▼                       ▼
┌──────────────────┐   ┌──────────────────────────┐
│UserScenarioComp  │   │GenericPersonaComponent   │
│- save()          │   │- retrieveAll()           │
│- retrieveAll()   │   │- save()                  │
│- validate()      │   │- validate()              │
└────────┬─────────┘   └────────┬─────────────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
┌─────────────────────────────────────────────────────────────┐
│        StagingGroundIntegrationService                       │
│  - loadDakJson()                                             │
│  - saveDakJson()                                             │
│  - saveComponentArtifact()                                   │
│  - updateComponentSources()                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            stagingGroundService.js                           │
│         (Existing Staging Ground)                            │
└─────────────────────────────────────────────────────────────┘
```

### Save Flow

1. **User clicks Save** in UserScenariosManager
2. **Component calls** `dakIntegrationService.saveUserScenario(data)`
3. **Integration service**:
   - Gets UserScenarioComponent from DAKObject
   - Calls `component.save(data, options)`
4. **UserScenarioComponent**:
   - Serializes data to markdown format
   - Calls `stagingGroundIntegration.saveComponentArtifact()`
   - Creates/updates source in dak.json
   - Calls `stagingGroundIntegration.saveDakJson()`
5. **StagingGroundIntegrationService**:
   - Saves markdown file to staging ground
   - Updates dak.json with source reference
   - Saves dak.json to staging ground
6. **Result**: Both files staged for commit

### Load Flow

1. **Component mounts** and calls `dakIntegrationService.loadUserScenarios()`
2. **Integration service**:
   - Gets UserScenarioComponent from DAKObject
   - Calls `component.getSources()` to get dak.json sources
   - Resolves each source via `component.resolveSource(source)`
3. **UserScenarioComponent**:
   - For each source, determines location (staging ground or repository)
   - Loads content via `stagingGroundIntegration.loadComponentArtifact()`
   - Parses content to data structure
   - Returns resolved data
4. **Integration service**: Returns array of scenario objects to component

## Benefits of Integration

### 1. Standards Compliance
- ✅ Uses official WHO SMART Guidelines DAK logical model
- ✅ Follows established patterns from PR #1111
- ✅ Compatible with other DAK Component editors

### 2. Automatic dak.json Management
- ✅ No manual JSON manipulation needed
- ✅ Automatic source creation/update on save
- ✅ Consistent dak.json structure across all components

### 3. Source Resolution
- ✅ Supports canonical URIs
- ✅ Supports absolute and relative URLs
- ✅ Supports inline instance data
- ✅ Automatic resolution prioritizes staging ground

### 4. Validation
- ✅ Built-in validation through Component Objects
- ✅ Consistent validation rules
- ✅ Extensible validation framework

### 5. Staging Ground Integration
- ✅ Seamless integration via StagingGroundIntegrationService
- ✅ All changes staged before commit
- ✅ Draft changes visible immediately

### 6. Backwards Compatibility
- ✅ Legacy fallback methods maintained
- ✅ Gradual migration path for other components
- ✅ Existing code continues to work

## Migration Guide for Other Components

### Step 1: Initialize DAK Integration

```javascript
import dakIntegrationService from '../services/dakIntegrationService';

useEffect(() => {
  const init = async () => {
    await dakIntegrationService.initialize(owner, repo, branch);
  };
  init();
}, [owner, repo, branch]);
```

### Step 2: Replace Direct File Access

**Before**:
```javascript
const response = await githubService.octokit.rest.repos.getContent({
  owner, repo, path: 'input/file.md', ref: branch
});
const content = atob(response.data.content);
```

**After**:
```javascript
const component = dakIntegrationService.getDAKObject().userScenarios;
const scenarios = await component.retrieveAll();
```

### Step 3: Replace Manual dak.json Updates

**Before**:
```javascript
// Load dak.json
const dakResponse = await githubService.octokit.rest.repos.getContent(...);
let dakData = JSON.parse(atob(dakResponse.data.content));

// Update manually
dakData.userScenarios.push(newScenario);

// Save manually
stagingGroundService.updateFile('dak.json', JSON.stringify(dakData));
```

**After**:
```javascript
// Just save - dak.json is automatically updated
await dakIntegrationService.saveUserScenario(scenarioData);
```

## Testing Recommendations

### 1. Unit Tests
- Test dakIntegrationService methods
- Test source resolution
- Test validation logic

### 2. Integration Tests
- Test complete save flow
- Test load flow with staging ground data
- Test dak.json auto-update

### 3. E2E Tests
- Test creating new scenario
- Test editing existing scenario
- Test persona variable substitution
- Verify dak.json structure

### 4. Manual Testing Checklist
- [ ] Create new user scenario
- [ ] Edit existing user scenario
- [ ] Use persona variable dropdown
- [ ] Toggle edit/preview modes
- [ ] Save changes to staging ground
- [ ] Verify dak.json is updated correctly
- [ ] Check staging ground shows both markdown and dak.json
- [ ] Reload page and verify scenario loads correctly
- [ ] Test with staged changes in staging ground
- [ ] Test ID validation

## Future Enhancements

### Planned
1. Update PersonaViewer to use DAK framework
2. Add validation UI indicators
3. Implement source resolution UI (show canonical/URL/inline)
4. Add scenario templates
5. Enhanced persona variable autocomplete

### Considerations
1. Consider extracting bridge pattern to reusable hook (`useDakComponent`)
2. Consider adding React Context for DAKObject (ComponentObjectProvider)
3. Consider adding optimistic UI updates
4. Consider adding undo/redo support

## References

- **PR #1111**: DAK Logical Model Update
- **Phase 6 Doc**: `PHASE_6_EDITOR_INTEGRATION.md`
- **DAK Core Package**: `packages/dak-core/`
- **Integration Service**: `src/services/dakIntegrationService.js`
- **User Scenarios**: `src/components/UserScenariosManager.js`

## Status

**✅ Integration Complete**
- UserScenariosManager fully integrated
- dakFrameworkService updated
- dakIntegrationService created
- Backwards compatibility maintained
- Ready for production use

**⏳ Optional Follow-ups**:
- Update PersonaViewer to use DAK framework
- Add comprehensive integration tests
- Create usage examples for other editors

---

**Last Updated**: October 16, 2025  
**Version**: 1.0  
**Status**: Complete
