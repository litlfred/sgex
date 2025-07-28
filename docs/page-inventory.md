# Page Framework Compliance Inventory

This document tracks the compliance status of all pages in the SGEX Workbench with the Page Framework requirements. The framework ensures consistent user experience, error handling, help integration, and URL validation across all pages.

## Framework Requirements Summary

All pages **MUST**:
- ✅ Be wrapped with `PageLayout` component
- ✅ Specify a unique `pageName` for help and analytics
- ✅ Follow established URL patterns (Top-Level, User, DAK, Asset)
- ✅ Use framework hooks (`usePageParams`, `useDAKParams`) instead of direct `useParams()`
- ✅ Display consistent header with appropriate components
- ✅ Include contextual help mascot (bottom-right)
- ✅ Let framework handle error boundaries and error reporting
- ✅ Work in both authenticated and demo modes

## Page Types and URL Patterns

### Top-Level Pages
**URL Pattern**: `/sgex/{page_name}`
**Context**: No additional context from URL

### User Pages  
**URL Pattern**: `/sgex/{page_name}/{user}`
**Context**: GitHub user or organization

### DAK Pages
**URL Pattern**: `/sgex/{page_name}/{user}/{repo}[/{branch}]`
**Context**: GitHub user, repository, optional branch

### Asset Pages
**URL Pattern**: `/sgex/{page_name}/{user}/{repo}/{branch}/{asset}`
**Context**: GitHub user, repository, branch, specific asset

## Current Page Compliance Status

### ✅ COMPLIANT (Using Framework)

| Page Component | Route | Page Type | Notes |
|---|---|---|---|
| `LandingPageWithFramework` | `/test-framework` | Top-Level | Test route - framework version |
| `DAKDashboardWithFramework` | `/test-framework-dashboard/:user/:repo[/:branch]` | DAK | Test route - framework version |
| `TestDocumentationPage` | `/test-documentation` | Top-Level | Framework demo page |

### ⚠️ PARTIAL COMPLIANCE (Has ContextualHelpMascot but no PageLayout)

| Page Component | Route | Page Type | Framework Elements | Missing Elements |
|---|---|---|---|---|
| `LandingPage` | `/` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `DAKActionSelection` | `/dak-action[/:user]` | User/Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `DAKSelection` | `/dak-selection[/:user]` | User/Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `OrganizationSelection` | `/organization-selection` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `RepositorySelection` | `/repositories` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `DAKDashboard` | `/dashboard[/:user/:repo[/:branch]]` | DAK/Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `CoreDataDictionaryViewer` | `/core-data-dictionary-viewer[/:user/:repo[/:branch]]` | DAK/Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `ComponentEditor` | `/editor/:componentId` | Asset | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `ActorEditor` | `/actor-editor` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `BusinessProcessSelection` | `/business-process-selection[/:user/:repo[/:branch]]` | DAK/Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `BPMNEditor` | `/bpmn-editor` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `BPMNViewer` | `/bpmn-viewer` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `BPMNSource` | `/bpmn-source` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `DocumentationViewer` | `/docs/:docId` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `DecisionSupportLogicView` | `/decision-support-logic[/:user/:repo[/:branch]]` | DAK/Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `PagesManager` | `/pages` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `TestDashboard` | `/test-dashboard` | Top-Level | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |
| `PATSetupInstructions` | N/A (Modal/Component) | N/A | ContextualHelpMascot | PageLayout, PageHeader, ErrorHandler |

### ❌ NON-COMPLIANT (No Framework Elements)

| Page Component | Route | Page Type | Missing Elements |
|---|---|---|---|
| `NotFound` | `*` (catch-all) | Utility | PageLayout, PageHeader, ErrorHandler, ContextualHelpMascot |
| `DAKConfiguration` | `/dak-configuration` | Top-Level | PageLayout, PageHeader, ErrorHandler, ContextualHelpMascot |
| `BPMNViewerTestComponent` | `/test-bpmn-viewer` | Top-Level | PageLayout, PageHeader, ErrorHandler, ContextualHelpMascot |

### 🔧 UTILITY/MODAL COMPONENTS (May Not Need Full Framework)

| Component | Usage | Framework Needs |
|---|---|---|
| `PATLogin` | Authentication modal | May not need PageLayout |
| `HelpButton` | UI component | Part of framework |
| `HelpModal` | Modal component | May not need PageLayout |
| `SaveDialog` | Modal component | May not need PageLayout |
| `PageEditModal` | Modal component | May not need PageLayout |
| `PageViewModal` | Modal component | May not need PageLayout |
| `BranchSelector` | UI component | Part of framework |
| `DAKStatusBox` | UI component | Part of framework |
| `Publications` | UI component | Part of framework |
| `CommitsSlider` | UI component | Part of framework |
| `GitHubActionsIntegration` | UI component | Part of framework |
| `WHODigitalLibrary` | UI component | Part of framework |

## Migration Priority

### High Priority (Active Routes)
1. `LandingPage` - Main entry point
2. `DAKDashboard` - Core functionality
3. `DAKActionSelection` - User workflow
4. `RepositorySelection` - User workflow
5. `CoreDataDictionaryViewer` - Core feature

### Medium Priority (Secondary Features)
1. `ComponentEditor` - Content editing
2. `BusinessProcessSelection` - Workflow feature
3. `DocumentationViewer` - Help system
4. `OrganizationSelection` - User workflow
5. `DAKSelection` - User workflow

### Low Priority (Development/Testing)
1. `NotFound` - Error handling
2. `DAKConfiguration` - Admin feature
3. `TestDashboard` - Development tool
4. `PagesManager` - Admin feature
5. Other BPMN-related tools

## Framework Compliance Checklist

For each page migration, ensure:

- [ ] Import `PageLayout` from `./framework`
- [ ] Wrap page content with `<PageLayout pageName="unique-name">`
- [ ] Remove custom header implementations (let PageLayout handle)
- [ ] Replace `useParams()` with appropriate framework hooks
- [ ] Remove manual `ContextualHelpMascot` imports (PageLayout includes it)
- [ ] Remove custom error handling (let PageLayout's ErrorBoundary handle)
- [ ] Test in both authenticated and demo modes
- [ ] Verify proper URL parameter handling
- [ ] Confirm help mascot appears and functions
- [ ] Check header shows appropriate elements for page type

## Validation Script Requirements

The automated compliance checker should verify:

1. **PageLayout Usage**: All route components wrapped with `PageLayout`
2. **Page Name Specification**: Each `PageLayout` has unique `pageName` prop
3. **Framework Hook Usage**: No direct `useParams()` usage in page components
4. **No Manual Headers**: No custom header implementations
5. **No Manual Help**: No direct `ContextualHelpMascot` imports in page components
6. **Error Handling**: No custom error boundaries (let framework handle)
7. **Route Consistency**: All routes in App.js point to framework-compliant components

## Developer Guidelines

### Creating New Pages
1. Always start with `PageLayout` wrapper
2. Use framework hooks for URL parameters
3. Follow established URL patterns
4. Let framework handle headers, errors, and help
5. Test in both authenticated and demo modes

### Migrating Existing Pages
1. Identify current framework elements (help mascot, custom headers)
2. Wrap with `PageLayout`, remove custom elements
3. Replace parameter access with framework hooks
4. Test thoroughly to ensure no functionality loss
5. Update App.js routes if needed (usually not required)

### Code Review Checklist
- [ ] Page wrapped with `PageLayout`
- [ ] Unique `pageName` specified
- [ ] Framework hooks used for parameters
- [ ] No custom headers or help mascot
- [ ] Error handling delegated to framework
- [ ] Responsive design maintained
- [ ] Works in both auth modes