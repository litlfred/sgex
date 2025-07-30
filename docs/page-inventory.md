# Page Inventory

This document tracks all pages in the SGEX Workbench application and their internationalization status.

## Page Status Legend

- ✅ **Complete**: Full internationalization implemented and tested
- ⚠️ **Partial**: Some internationalization, needs completion
- ❌ **Missing**: No internationalization implemented
- 🚫 **N/A**: Component doesn't need internationalization (utilities, tests, etc.)

## Core Pages

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| LandingPage | ✅ | Top-Level | Main application landing page | `app.*`, `landing.*` |
| DAKDashboard | ✅ | DAK | DAK project dashboard | `dashboard.*`, `common.*` |
| NotFound | ❌ | Top-Level | 404 error page | Needs implementation |

## User & Organization Pages

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| OrganizationSelection | ❌ | User | Select GitHub organization | Needs implementation |
| RepositorySelection | ❌ | User | Select repository from user/org | Needs implementation |
| DAKActionSelection | ❌ | User | Select action for DAK project | Needs implementation |
| DAKSelection | ❌ | User | Select DAK from available options | Needs implementation |

## DAK Project Pages

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| DAKConfiguration | ❌ | DAK | Configure DAK project settings | Needs implementation |
| DAKStatusBox | ❌ | DAK | Display DAK project status | Needs implementation |
| BusinessProcessSelection | ❌ | DAK | Select business process | Needs implementation |
| CoreDataDictionaryViewer | ❌ | DAK | View core data dictionary | Needs implementation |
| DecisionSupportLogicView | ❌ | DAK | View decision support logic | Needs implementation |

## Asset Editor Pages

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| ComponentEditor | ❌ | Asset | Edit DAK components | Needs implementation |
| ActorEditor | ❌ | Asset | Edit FHIR actors | Needs implementation |
| BPMNEditor | ❌ | Asset | Edit BPMN diagrams | Needs implementation |
| PagesManager | ❌ | Asset | Manage documentation pages | Needs implementation |

## Asset Viewer Pages

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| BPMNViewer | ❌ | Asset | View BPMN diagrams | Needs implementation |
| BPMNViewerEnhanced | ❌ | Asset | Enhanced BPMN viewer | Needs implementation |
| BPMNSource | ❌ | Asset | View BPMN source code | Needs implementation |
| DocumentationViewer | ❌ | Asset | View project documentation | Needs implementation |

## Authentication Pages

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| PATLogin | ❌ | Top-Level | GitHub PAT login | Needs implementation |
| PATSetupInstructions | ❌ | Top-Level | PAT setup instructions | Needs implementation |

## Integration Pages

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| GitHubActionsIntegration | ❌ | DAK | GitHub Actions integration | Needs implementation |
| Publications | ❌ | DAK | Manage publications | Needs implementation |
| WHODigitalLibrary | ❌ | DAK | WHO Digital Library integration | Needs implementation |

## Modal & Dialog Components

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| HelpModal | ❌ | Modal | Display help content | Needs implementation |
| SaveDialog | ❌ | Modal | Save confirmation dialog | Needs implementation |
| PageEditModal | ❌ | Modal | Edit page content | Needs implementation |
| PageViewModal | ❌ | Modal | View page content | Needs implementation |

## UI Components

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| LanguageSelector | ✅ | UI | Language selection dropdown | `language.*` |
| ContextualHelpMascot | ❌ | UI | Help mascot with tooltips | Needs implementation |
| HelpButton | ❌ | UI | Generic help button | Needs implementation |
| BranchSelector | ❌ | UI | Git branch selection | Needs implementation |
| CommitsSlider | ❌ | UI | Browse commit history | Needs implementation |

## Framework Components

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| PageLayout | ❌ | Framework | Main page layout wrapper | Needs implementation |
| PageHeader | ❌ | Framework | Page header component | Needs implementation |
| ErrorHandler | ❌ | Framework | Error handling wrapper | Needs implementation |
| PageProvider | 🚫 | Framework | Context provider (no UI) | N/A |

## Test & Development Components

| Component | Status | Type | Description | I18n Keys |
|-----------|--------|------|-------------|-----------|
| TestDashboard | 🚫 | Test | Development testing page | N/A |
| TestDocumentationPage | 🚫 | Test | Documentation testing | N/A |
| BPMNViewerTestComponent | 🚫 | Test | BPMN viewer testing | N/A |
| LandingPageWithFramework | 🚫 | Test | Framework testing page | N/A |
| DAKDashboardWithFramework | 🚫 | Test | Framework testing page | N/A |

## Summary Statistics

- **Total Components**: 44
- **Complete (✅)**: 3 (7%)
- **Missing (❌)**: 35 (80%)
- **Not Applicable (🚫)**: 6 (13%)

## Priority Implementation Order

### Phase 1: Critical User Flow (High Priority)
1. NotFound - Error page
2. PATLogin - Authentication
3. OrganizationSelection - User flow
4. RepositorySelection - User flow
5. DAKActionSelection - User flow

### Phase 2: Core DAK Functionality (Medium Priority)
6. DAKConfiguration - DAK setup
7. DAKStatusBox - Status display
8. BusinessProcessSelection - Process selection
9. CoreDataDictionaryViewer - Data viewing
10. DecisionSupportLogicView - Logic viewing

### Phase 3: Framework & UI Components (Medium Priority)
11. PageLayout - Framework core
12. PageHeader - Framework core
13. ErrorHandler - Framework core
14. ContextualHelpMascot - Help system
15. HelpModal - Help system
16. BranchSelector - Git operations

### Phase 4: Asset Management (Low Priority)
17. ComponentEditor - Asset editing
18. ActorEditor - Asset editing
19. BPMNEditor - Asset editing
20. PagesManager - Content management
21. DocumentationViewer - Content viewing
22. BPMNViewer - Asset viewing

### Phase 5: Advanced Features (Lowest Priority)
23. GitHubActionsIntegration - CI/CD
24. Publications - Publishing
25. WHODigitalLibrary - Integration
26. Various modal components
27. Utility components

## Implementation Requirements

For each component marked as ❌ Missing:

1. **Add useTranslation import**: `import { useTranslation } from 'react-i18next';`
2. **Initialize hook**: `const { t } = useTranslation();`
3. **Replace hardcoded text**: Convert all user-visible strings to `t('key')`
4. **Add translation entries**: Update all language files
5. **Test language switching**: Verify all text translates correctly

## Translation Key Organization

Keys should be organized hierarchically by component:

```json
{
  "componentName": {
    "title": "Component Title",
    "subtitle": "Component Subtitle", 
    "actions": {
      "save": "Save",
      "cancel": "Cancel"
    },
    "messages": {
      "success": "Success message",
      "error": "Error message"
    }
  }
}
```