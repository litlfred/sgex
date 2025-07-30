# Page Inventory

This document tracks all pages in the SGEX Workbench application with both Page Framework compliance and internationalization status.

## Page Status Legend

### Framework Compliance
- ✅ **Fully Compliant**: Complete Page Framework implementation (5/5)
- ⚠️ **Partially Compliant**: Some framework features implemented
- ❌ **Non-Compliant**: No framework implementation
- 🚫 **N/A**: Component doesn't require framework (utilities, modals, etc.)

### Internationalization Status
- ✅ **Complete**: Full internationalization implemented and tested
- ⚠️ **Partial**: Some internationalization, needs completion
- ❌ **Missing**: No internationalization implemented
- 🚫 **N/A**: Component doesn't need internationalization (utilities, tests, etc.)

## Current Status Summary

**Overall Framework Compliance: 43% (10/23 pages fully compliant)**
**Overall Internationalization: 7% (3/44 components complete)**

## Core Pages

| Component | Framework | I18n | Type | Description | I18n Keys |
|-----------|-----------|------|------|-------------|-----------|
| LandingPage | ✅ | ✅ | Top-Level | Main application landing page | `app.*`, `landing.*` |
| DAKDashboard | ⚠️ (60%) | ✅ | DAK | DAK project dashboard | `dashboard.*`, `common.*` |
| NotFound | ✅ | ❌ | Top-Level | 404 error page | Needs implementation |

## User & Organization Pages

| Component | Framework | I18n | Type | Description | I18n Keys |
|-----------|-----------|------|------|-------------|-----------|
| OrganizationSelection | ✅ | ❌ | User | Select GitHub organization | Needs implementation |
| RepositorySelection | ✅ | ❌ | User | Select repository from user/org | Needs implementation |
| DAKActionSelection | ✅ | ❌ | User | Select action for DAK project | Needs implementation |
| DAKSelection | ⚠️ (40%) | ❌ | User | Select DAK from available options | Needs implementation |

## DAK Project Pages

| Component | Framework | I18n | Type | Description | I18n Keys |
|-----------|-----------|------|------|-------------|-----------|
| DAKConfiguration | ✅ | ❌ | DAK | Configure DAK project settings | Needs implementation |
| BusinessProcessSelection | ⚠️ (40%) | ❌ | DAK | Select business process | Needs implementation |
| CoreDataDictionaryViewer | ⚠️ (40%) | ❌ | DAK | View core data dictionary | Needs implementation |
| DecisionSupportLogicView | ⚠️ (60%) | ❌ | DAK | View decision support logic | Needs implementation |

## Asset Editor Pages

| Component | Framework | I18n | Type | Description | I18n Keys |
|-----------|-----------|------|------|-------------|-----------|
| ComponentEditor | ⚠️ (40%) | ❌ | Asset | Edit DAK components | Needs implementation |
| ActorEditor | ⚠️ (40%) | ❌ | Asset | Edit FHIR actors | Needs implementation |
| BPMNEditor | ⚠️ (40%) | ❌ | Asset | Edit BPMN diagrams | Needs implementation |
| PagesManager | ⚠️ (40%) | ❌ | Asset | Manage documentation pages | Needs implementation |

## Asset Viewer Pages

| Component | Framework | I18n | Type | Description | I18n Keys |
|-----------|-----------|------|------|-------------|-----------|
| BPMNViewer | ⚠️ (40%) | ❌ | Asset | View BPMN diagrams | Needs implementation |
| BPMNSource | ⚠️ (40%) | ❌ | Asset | View BPMN source code | Needs implementation |
| DocumentationViewer | ⚠️ (40%) | ❌ | Asset | View project documentation | Needs implementation |

## Test & Framework Pages

| Component | Framework | I18n | Type | Description | I18n Keys |
|-----------|-----------|------|------|-------------|-----------|
| TestDashboard | ⚠️ (40%) | 🚫 | Test | Development testing page | N/A |
| BPMNViewerTestComponent | ✅ | 🚫 | Test | BPMN viewer testing | N/A |
| LandingPageWithFramework | ✅ | 🚫 | Test | Framework testing page | N/A |
| DAKDashboardWithFramework | ✅ | 🚫 | Test | Framework testing page | N/A |
| TestDocumentationPage | ✅ | 🚫 | Test | Documentation testing | N/A |

## UI Components

| Component | Framework | I18n | Type | Description | I18n Keys |
|-----------|-----------|------|------|-------------|-----------|
| LanguageSelector | 🚫 | ✅ | UI | Language selection dropdown | `language.*` |
| ContextualHelpMascot | 🚫 | ❌ | UI | Help mascot with tooltips | Needs implementation |
| HelpButton | 🚫 | ❌ | UI | Generic help button | Needs implementation |
| BranchSelector | 🚫 | ❌ | UI | Git branch selection | Needs implementation |
| PATLogin | 🚫 | ❌ | UI | GitHub PAT login | Needs implementation |

## Framework Components

| Component | Framework | I18n | Type | Description | I18n Keys |
|-----------|-----------|------|------|-------------|-----------|
| PageLayout | 🚫 | ❌ | Framework | Main page layout wrapper | Needs implementation |
| PageHeader | 🚫 | ❌ | Framework | Page header component | Needs implementation |
| ErrorHandler | 🚫 | ❌ | Framework | Error handling wrapper | Needs implementation |
| PageProvider | 🚫 | 🚫 | Framework | Context provider (no UI) | N/A |

## Page Framework Requirements

All pages **MUST**:
- ✅ Be wrapped with `PageLayout` component
- ✅ Specify a unique `pageName` for help and analytics
- ✅ Follow established URL patterns (Top-Level, User, DAK, Asset)
- ✅ Use framework hooks (`usePageParams`, `useDAKParams`) instead of direct `useParams()`
- ✅ Display consistent header with appropriate components
- ✅ Include contextual help mascot (bottom-right)
- ✅ Let framework handle error boundaries and error reporting
- ✅ Work in both authenticated and demo modes

## URL Patterns

### Top-Level Pages: `/sgex/{page_name}`
### User Pages: `/sgex/{page_name}/{user}`
### DAK Pages: `/sgex/{page_name}/{user}/{repo}[/{branch}]`
### Asset Pages: `/sgex/{page_name}/{user}/{repo}/{branch}/{asset}`

## Priority Implementation Order

### Phase 1: Critical User Flow (High Priority)
1. Complete internationalization for existing framework-compliant pages
2. Framework compliance for high-traffic pages
3. I18n for authentication and error pages

### Phase 2: Core DAK Functionality (Medium Priority)
4. Complete framework compliance for DAK pages
5. Add internationalization to DAK components
6. Framework compliance for asset editors

### Phase 3: UI & Framework Components (Medium Priority)
7. Internationalize UI components
8. Framework component internationalization
9. Help system internationalization

## Implementation Requirements

### For Framework Compliance:
- [ ] Import `PageLayout` from `./framework`
- [ ] Wrap page content with `<PageLayout pageName="unique-name">`
- [ ] Remove custom header implementations
- [ ] Replace `useParams()` with framework hooks
- [ ] Remove manual `ContextualHelpMascot` imports
- [ ] Test in both authenticated and demo modes

### For Internationalization:
- [ ] Add `import { useTranslation } from 'react-i18next';`
- [ ] Initialize hook: `const { t } = useTranslation();`
- [ ] Replace hardcoded text with `t('key')`
- [ ] Add translation entries to all language files
- [ ] Test language switching

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
