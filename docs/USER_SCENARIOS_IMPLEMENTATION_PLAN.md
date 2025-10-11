# User Scenarios Implementation Plan

## Issue Summary
**Issue**: Add user scenario functionality for `/user-scenarios/{user}/{repo}/{branch}` route  
**Goal**: Enable editing and creating user scenario markdown files with variable substitution  
**Status**: Implementation plan proposed, awaiting feedback

---

## Overview

This document provides a detailed implementation plan for adding user scenarios functionality to SGEX Workbench, following WHO SMART Guidelines DAK Component #3: User Scenarios.

### What Are User Scenarios?

From the WHO SMART Guidelines framework:
> **User Scenarios**: Narrative descriptions of how different personas interact with the system in specific healthcare contexts

- **L2 Representation**: Use case narratives and workflows (markdown files)
- **L3 Representation**: FHIR Scenario test bundles
- **Purpose**: Document user journeys, interaction patterns, and system usage scenarios

---

## Architecture Design

### Component Structure

```
UserScenariosManager (Main Component)
├─ URL Pattern: /user-scenarios/{user}/{repo}/{branch}
├─ Lists all scenario files: input/pagecontent/userscenario-*.md
├─ Create new scenario button
├─ Edit existing scenario buttons
└─ Integrates with Staging Ground

UserScenarioEditModal (Editor Component)
├─ Markdown editor with edit/preview toggle
├─ Variable substitution UI for personas
├─ WHO SOP ID validation for new scenarios
└─ Saves to Staging Ground only
```

### Pattern Follows

This implementation follows the **PagesManager pattern**:
- `PagesManager.js` - Lists pages from sushi-config.yaml
- `PageEditModal.js` - Edits markdown content with MDEditor
- Both integrate with `stagingGroundService.js`
- Both use lazy-loaded `@uiw/react-md-editor`

---

## Key Features

### 1. File Pattern Detection

**Location**: `input/pagecontent/userscenario-{id}.md`

**Examples**:
- `input/pagecontent/userscenario-anc-registration-001.md`
- `input/pagecontent/userscenario-hiv-testing-scenario.md`
- `input/pagecontent/userscenario-immunization-workflow.md`

**Detection Logic**:
```javascript
// Scan repository for userscenario-*.md files
const files = await githubService.getDirectoryContents(
  owner, repo, 'input/pagecontent', branch
);
const scenarios = files.filter(f => 
  f.name.match(/^userscenario-[a-z0-9-]+\.md$/)
);
```

### 2. WHO SMART Guidelines SOP ID Requirements

**Pattern**: `userscenario-{identifier}`

**Rules**:
- Lowercase only
- Alphanumeric characters and hyphens
- Must start with letter or number after "userscenario-"
- No consecutive hyphens
- No leading/trailing hyphens in identifier

**Regex**: `^userscenario-[a-z0-9]+(-[a-z0-9]+)*$`

**Validation Examples**:
- ✅ `userscenario-001`
- ✅ `userscenario-anc-registration`
- ✅ `userscenario-hiv-test-scenario-v2`
- ❌ `UserScenario-001` (uppercase)
- ❌ `userscenario--double-dash` (consecutive hyphens)
- ❌ `userscenario-` (no identifier)

### 3. Markdown Editor with Edit/Preview Modes

Using `@uiw/react-md-editor` (v4.0.8 - already installed):

**Edit Mode**:
```jsx
<MDEditor
  value={content}
  onChange={setContent}
  preview="edit"  // Edit-only mode
  height={500}
/>
```

**Preview Mode**:
```jsx
<MDEditor
  value={content}
  onChange={setContent}
  preview="preview"  // Preview-only mode
  height={500}
/>
```

**Toggle Button**:
```jsx
<button onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}>
  {mode === 'edit' ? '👁️ Preview' : '✏️ Edit'}
</button>
```

### 4. Variable Substitution Framework

#### Variable Format

**Syntax**: `{{persona.{id}.{property}}}`

**Examples**:
```markdown
The {{persona.healthcare-worker.title}} reviews the patient record.

{{persona.midwife.description}} will perform the examination.

The system notifies {{persona.community-health-worker.title}}.
```

#### Available Persona Properties

Based on smart-base GenericPersona logical model:

| Property | Description | Example |
|----------|-------------|---------|
| `id` | Unique identifier | `healthcare-worker` |
| `title` | Display name/role | `Healthcare Worker` |
| `description` | Role description | `Provides clinical care` |
| `type` | Persona type | `human` or `system` |
| `code` | Coded role | FHIR coding |

#### Resolution Strategy

1. **Load personas from repository**: Query `input/fsh/` or FHIR resources
2. **Parse variable syntax**: Extract `{{persona.{id}.{property}}}`
3. **Lookup persona data**: Find persona by ID
4. **Substitute value**: Replace variable with property value
5. **Render in preview**: Show substituted markdown

#### UI Helper for Variables

**Insert Variable Dropdown**:
```
[Insert Variable ▼]
├─ Healthcare Worker
│  ├─ Insert title
│  ├─ Insert description
│  └─ Insert id
├─ Midwife
│  ├─ Insert title
│  └─ Insert description
└─ Community Health Worker
   └─ Insert title
```

When selected, inserts: `{{persona.healthcare-worker.title}}`

### 5. Staging Ground Integration

**Following PagesManager Pattern**:

```javascript
// Initialize on component mount
useEffect(() => {
  if (repository && branch) {
    stagingGroundService.initialize(repository, branch);
  }
}, [repository, branch]);

// Save scenario to staging ground
const handleSave = async (scenarioPath, content) => {
  const success = stagingGroundService.updateFile(
    scenarioPath,
    content,
    {
      filename: scenarioPath.split('/').pop(),
      tool: 'UserScenarioEditor',
      contentType: 'markdown'
    }
  );
  
  if (success) {
    // Show success message
    // Close modal
  }
};
```

**Benefits**:
- No direct GitHub commits
- Changes grouped for review
- Validation before commit
- Rollback capability
- Batch commits

---

## Implementation Steps

### Phase 1: Core Component (DO NOT IMPLEMENT YET)

1. **Create UserScenariosManager.js**
   - URL parameter extraction (`user`, `repo`, `branch`)
   - GitHub API integration to list scenarios
   - UI to display scenario list
   - "Create New Scenario" button
   - "Edit" buttons for each scenario

2. **Create UserScenariosManager.css**
   - Blue gradient background (matching DAK dashboard)
   - Card-based layout
   - Responsive design

### Phase 2: Editor Modal (DO NOT IMPLEMENT YET)

3. **Create UserScenarioEditModal.js**
   - Markdown editor with edit/preview toggle
   - Variable substitution in preview mode
   - WHO SOP ID validation for new scenarios
   - Save to staging ground
   - Close/cancel actions

4. **Create UserScenarioEditModal.css**
   - Modal overlay styling
   - Editor container styling
   - Button styling

### Phase 3: Integration (DO NOT IMPLEMENT YET)

5. **Update Route Configuration**
   - Add to `public/routes-config.json`
   - Add lazy loading to `componentRouteService.js`

6. **Add Help Content**
   - Add to `helpContentService.js`
   - Create help slides explaining user scenarios

7. **Update DAK Dashboard**
   - Add User Scenarios card
   - Link to user scenarios manager

### Phase 4: Testing (DO NOT IMPLEMENT YET)

8. **Create Integration Tests**
   - Test scenario listing
   - Test scenario creation
   - Test scenario editing
   - Test staging ground integration
   - Test variable substitution

9. **Manual UI Testing**
   - Test with real DAK repository
   - Take screenshots for documentation
   - Verify all workflows

---

## Technical Dependencies

### Already Installed

✅ `@uiw/react-md-editor@4.0.8` - Markdown editor with preview  
✅ `react-markdown` - Markdown rendering  
✅ `stagingGroundService.js` - Staging ground integration  
✅ `githubService.js` - GitHub API client  
✅ React Router DOM - Routing support

### No New Dependencies Required

All functionality can be implemented with existing dependencies.

---

## Questions for Collaborators

### Critical Questions (Need Answers Before Implementation)

1. **WHO SOP ID Pattern**: 
   - Is `userscenario-[a-z0-9]+(-[a-z0-9]+)*` the correct pattern?
   - Are there other WHO-specific requirements?

2. **Variable Syntax**:
   - Confirm `{{persona.{id}.{property}}}` format
   - Or should we use a different syntax?

3. **Persona Properties**:
   - Which specific properties should be available?
   - Where are personas stored (FHIR resources, FSH definitions)?

4. **File Location**:
   - Confirm `input/pagecontent/userscenario-{id}.md` is correct
   - Any other location patterns needed?

5. **Variable Resolution**:
   - Should substitution happen in real-time preview only?
   - Or also when saving/viewing?
   - Should we cache persona data?

---

## Expected Timeline

**Total Estimated Effort**: 11-16 hours

| Phase | Estimated Time | Description |
|-------|---------------|-------------|
| Core Component | 2-3 hours | UserScenariosManager list view |
| Editor Modal | 2-3 hours | Edit modal with preview |
| ID Validation | 1 hour | WHO SOP ID validation |
| Variables | 2-3 hours | Substitution UI and logic |
| Integration | 1 hour | Staging ground integration |
| Routing & Help | 1 hour | Route config and help |
| Testing | 2-3 hours | Tests and refinement |

---

## Success Criteria

✅ User can navigate to `/user-scenarios/{user}/{repo}/{branch}`  
✅ User can see list of existing scenarios from `input/pagecontent/`  
✅ User can create new scenarios with WHO SOP ID validation  
✅ User can edit existing scenarios with markdown editor  
✅ User can toggle between edit and preview modes  
✅ User can insert persona variables via UI helper  
✅ Variables are substituted in preview mode  
✅ All changes save to staging ground only  
✅ Help content is available via mascot  
✅ Integration tests pass  

---

## Risk Mitigation

### Risk: Variable Resolution Performance
**Mitigation**: Cache persona data, lazy load variables

### Risk: WHO SOP ID Pattern Incorrect
**Mitigation**: Get feedback from collaborators before implementing validation

### Risk: Persona Data Location Unknown
**Mitigation**: Make variable resolution pluggable, support multiple sources

### Risk: Breaking Changes to Existing Code
**Mitigation**: Follow established patterns (PagesManager), minimal changes

---

## Next Steps

1. ✅ **Propose implementation plan** (DONE)
2. ⏳ **Await collaborator feedback** on critical questions
3. ⏳ **Confirm WHO SOP ID pattern** with @litlfred
4. ⏳ **Confirm variable syntax and persona properties**
5. ⏳ **Get approval to proceed with implementation**
6. 🔜 **Begin Phase 1: Core Component**

---

**Status**: 🟡 Awaiting Feedback  
**Last Updated**: 2024  
**Proposed By**: GitHub Copilot Agent  
**Reviewers**: @litlfred (repository owner)
