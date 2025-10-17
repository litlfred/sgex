# User Scenarios Quick Reference Guide

This is a quick reference for understanding the user scenarios implementation plan. For full details, see the comprehensive documents.

## 📋 Three Documents to Review

| Document | Purpose | Size | Priority |
|----------|---------|------|----------|
| [FEEDBACK_NEEDED.md](./USER_SCENARIOS_FEEDBACK_NEEDED.md) | Start here - summarizes everything and lists critical questions | 8.7 KB | **READ FIRST** ⭐ |
| [IMPLEMENTATION_PLAN.md](./USER_SCENARIOS_IMPLEMENTATION_PLAN.md) | Complete implementation plan with phases and timeline | 10.4 KB | **READ SECOND** 📋 |
| [ARCHITECTURE.md](./USER_SCENARIOS_ARCHITECTURE.md) | Detailed architecture diagrams and technical design | 16.2 KB | Reference 🔧 |

## 🎯 What This Adds

### User-Facing Features

**For Content Authors**:
1. Navigate to `/user-scenarios/{user}/{repo}/{branch}`
2. See list of all user scenario files
3. Click "Create New Scenario" to add new scenario
4. Click "Edit" to modify existing scenario
5. Use markdown editor with edit/preview toggle
6. Insert persona variables via dropdown helper
7. Save changes to staging ground (not direct commit)
8. Review and commit changes later via Staging Ground component

**For Developers**:
- New DAK component following established patterns
- Reuses existing services (GitHub, staging ground, help)
- No new npm dependencies required
- WHO SMART Guidelines compliant
- Fully tested and documented

## 🔧 Technical Design Summary

### Component Architecture

```
UserScenariosManager
├─ Lists scenarios from input/pagecontent/userscenario-*.md
├─ "Create New Scenario" button → opens modal with ID validation
├─ "Edit Scenario" buttons → opens modal with existing content
└─ Staging Ground integration

UserScenarioEditModal
├─ Markdown editor (edit mode)
├─ Preview with variable substitution (preview mode)
├─ Persona variable dropdown helper
├─ WHO SOP ID validation (for new scenarios)
└─ Save to staging ground only
```

### Key Files to Create

```
src/components/
  UserScenariosManager.js       (Main component - ~300 lines)
  UserScenariosManager.css      (Styling - ~150 lines)
  UserScenarioEditModal.js      (Editor modal - ~400 lines)
  UserScenarioEditModal.css     (Modal styling - ~100 lines)

src/services/componentRouteService.js  (Add 3 lines for lazy loading)
src/services/helpContentService.js     (Add ~50 lines for help topics)

public/routes-config.json              (Add 4 lines for routing)
```

### Key Files to Reference

**Follow these patterns**:
- `src/components/PagesManager.js` - List and edit pages pattern
- `src/components/PageEditModal.js` - Markdown editor modal pattern
- `src/services/stagingGroundService.js` - Staging ground integration
- `src/components/DAKDashboard.js` - DAK component card styling

## ⚠️ Critical Questions (Need Answers)

### 1. WHO SOP ID Pattern
**Proposed**: `^userscenario-[a-z0-9]+(-[a-z0-9]+)*$`
- Example: `userscenario-anc-registration-001`
- Lowercase only, hyphens allowed, no consecutive hyphens

**Question**: Is this correct? Point to WHO SOP documentation if available.

### 2. Variable Syntax
**Proposed**: `{{persona.healthcare-worker.title}}`
- Double curly braces
- Format: `{{persona.{id}.{property}}}`

**Question**: Is this the right syntax? What does PR #997 use?

### 3. Persona Properties
**Proposed**: id, title, description, type, code
- Based on smart-base GenericPersona logical model

**Question**: Complete list of properties to support?

### 4. Persona Data Source
**Proposed**: `input/fsh/personas.fsh` or FHIR resources
- Need to know where to load persona data

**Question**: Exact file path pattern for persona definitions?

### 5. File Location
**Proposed**: `input/pagecontent/userscenario-{id}.md`
- Consistent with other pagecontent files

**Question**: Is this the correct location and pattern?

## 📊 Implementation Phases

### Phase 1: Core Component (4-6 hours)
- [ ] Create UserScenariosManager.js
- [ ] List scenarios from repository
- [ ] GitHub API integration
- [ ] "Create" and "Edit" buttons
- [ ] Staging ground initialization

### Phase 2: Editor Modal (2-3 hours)
- [ ] Create UserScenarioEditModal.js
- [ ] Markdown editor with edit/preview toggle
- [ ] WHO SOP ID validation for new scenarios
- [ ] Variable substitution UI helper

### Phase 3: Integration (2 hours)
- [ ] Variable substitution logic
- [ ] Save to staging ground
- [ ] Route configuration
- [ ] Help content

### Phase 4: Testing (2-3 hours)
- [ ] Integration tests
- [ ] Manual UI testing
- [ ] Screenshots for documentation
- [ ] Edge case validation

**Total**: 11-16 hours

## 🚀 Success Criteria

Implementation is complete when:

✅ User can navigate to `/user-scenarios/{user}/{repo}/{branch}`
✅ User sees list of existing scenarios from `input/pagecontent/`
✅ User can create new scenarios with validated WHO SOP IDs
✅ User can edit existing scenarios
✅ User can toggle between edit and preview modes
✅ User can insert persona variables via UI helper
✅ Variables are substituted in preview mode
✅ All changes save to staging ground (no direct commits)
✅ Help content available via mascot
✅ Integration tests pass
✅ UI screenshots captured

## 🎨 Visual Design

### Page Layout
```
┌─────────────────────────────────────────────┐
│ Header (WHO Blue #040b76)                   │
│   User Scenarios - {repo} on {branch}       │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ DAK Status Box                               │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ [+ Create New Scenario]                      │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Scenario List                                │
│ ┌─────────────────────────────────────────┐ │
│ │ userscenario-001.md            [Edit]   │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ userscenario-anc-reg.md        [Edit]   │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Staging Ground                               │
│ (shows staged changes)                       │
└─────────────────────────────────────────────┘
```

### Color Scheme
- **Header**: `#040b76` (WHO Deep Blue)
- **Background**: Linear gradient `#0078d4` to `#005a9e`
- **Cards**: White with shadow
- **Buttons**: Primary `#0078d4`, Secondary gray

## 📦 Dependencies

### Already Installed ✅
- `@uiw/react-md-editor@4.0.8` - Markdown editor
- `react-markdown` - Markdown rendering
- `react-router-dom` - Routing
- `@octokit/rest` - GitHub API

### Already Implemented ✅
- `stagingGroundService.js` - Local change management
- `githubService.js` - GitHub API wrapper
- `helpContentService.js` - Contextual help

### No New Dependencies Needed 🎉

## 🔗 Related Issues/PRs

- **This Issue**: Add user scenario functionality
- **PR #997**: Variable substitution framework (referenced in issue)
- **WHO SMART Guidelines**: https://smart.who.int/ig-starter-kit/l2_dak_authoring.html
- **Smart-base Repo**: https://github.com/WorldHealthOrganization/smart-base

## 📝 Next Steps for Collaborators

1. **Read**: [USER_SCENARIOS_FEEDBACK_NEEDED.md](./USER_SCENARIOS_FEEDBACK_NEEDED.md)
2. **Review**: Implementation plan and architecture if needed
3. **Answer**: The 5 critical questions in a PR comment
4. **Approve**: Give go-ahead to start implementation

Once approved, I will:
1. Begin Phase 1 implementation
2. Commit incremental progress frequently
3. Share screenshots of UI changes
4. Keep PR description updated with checklist
5. Request review at each phase milestone

## 💡 Key Insights

### Why This Approach Works

**Follows Existing Patterns**: Uses proven PagesManager/PageEditModal patterns
**Minimal Changes**: Reuses existing services and components
**No New Dependencies**: Leverages already-installed packages
**WHO Compliant**: Follows SMART Guidelines DAK Component #3
**Staging Ground**: All changes go through review before commit
**Incremental**: Frequent progress updates with screenshots

### Benefits for Users

**Content Authors**: Easy-to-use markdown editor with persona variables
**Reviewers**: Changes staged for review before commit
**Administrators**: WHO SOP ID compliance built-in
**Developers**: Clear architecture and tests for maintenance

---

**Status**: 🟡 Planning Complete - Awaiting Feedback  
**Owner**: GitHub Copilot Agent  
**Reviewer**: @litlfred  
**Timeline**: 11-16 hours after approval  

**Questions?** See [USER_SCENARIOS_FEEDBACK_NEEDED.md](./USER_SCENARIOS_FEEDBACK_NEEDED.md) or comment on PR.
