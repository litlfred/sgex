# SGEX Page Framework and Routing Pattern Analysis

## Executive Summary

This document provides a comprehensive analysis of the SGEX page framework and routing patterns, addressing the complexity of URL patterns that goes beyond the initial `{base}/{component}/{user}/{repo}/{branch}/{asset}*` description.

## Page Framework Architecture

### Framework Components

The SGEX page framework is located in `src/components/framework/` and consists of:

1. **PageProvider.js** - Context provider that determines page types and loads data
2. **PageLayout.js** - Layout wrapper providing framework structure  
3. **usePageParams.js** - Hooks for type-safe URL parameter access
4. **useDAKParams.js** - Specialized hooks for DAK-specific pages
5. **PageBreadcrumbs.js** - Navigation breadcrumb component
6. **PageHeader.js** - Standard header component
7. **ErrorHandler.js** - Framework error boundary

### Page Types

The framework defines four distinct page types:

```javascript
export const PAGE_TYPES = {
  TOP_LEVEL: 'top-level',    // /{component}
  USER: 'user',              // /{component}/{user}  
  DAK: 'dak',                // /{component}/{user}/{repo}[/{branch}]
  ASSET: 'asset'             // /{component}/{user}/{repo}/{branch}/{asset}*
};
```

## Routing Pattern Analysis

### Corrected URL Pattern Structure

The actual routing pattern is more nuanced than initially described:

```
{base}/{component}(/{user}(/{repo}(/{branch}(/{asset}*))))?
```

This represents **optional cascading parameters** where:
- `{component}` is always required
- `{user}` is optional (creates USER page type)
- `{repo}` is optional but requires `{user}` (creates DAK page type)
- `{branch}` is optional but requires `{user}/{repo}`
- `{asset}*` is optional wildcard path for file assets (creates ASSET page type)

### Route Categories

## 1. Framework-Based DAK Components

**Pattern**: `/{component}(/{user}(/{repo}(/{branch}(/{asset}*))))?`

**Components** (from routes-config.json dakComponents):
- `dashboard` → DAKDashboard
- `testing-viewer` → TestingViewer  
- `core-data-dictionary-viewer` → CoreDataDictionaryViewer
- `health-interventions` → ComponentEditor
- `actor-editor` → ActorEditor
- `business-process-selection` → BusinessProcessSelection
- `bpmn-editor` → BPMNEditor
- `bpmn-viewer` → BPMNViewer
- `bpmn-source` → BPMNSource
- `decision-support-logic` → DecisionSupportLogicView
- `questionnaire-editor` → QuestionnaireEditor
- `pages` → PagesManager
- `faq-demo` → DAKFAQDemo

**Generated Routes** (by lazyRouteUtils.js):
```javascript
/{component}                    // TOP_LEVEL - component selection
/{component}/{user}/{repo}      // DAK - repository context  
/{component}/{user}/{repo}/{branch}        // DAK - branch context
/{component}/{user}/{repo}/{branch}/*      // ASSET - file context
```

**Examples**:
- `/dashboard` (component selection)
- `/dashboard/litlfred/smart-ips-pilgrimage` (DAK page)
- `/dashboard/litlfred/smart-ips-pilgrimage/main` (DAK with branch)
- `/bpmn-editor/who/immunizations/feature-branch/workflows/process.bpmn` (asset editing)

## 2. Framework-Based User Selection Components

**Pattern**: `/{component}(/{user})?`

**Components** (using framework):
- `dak-action` → DAKActionSelection
- `dak-selection` → DAKSelection  
- `repositories` → RepositorySelection

**Example Routes**:
- `/dak-action` (user selection)
- `/dak-action/litlfred` (user-specific actions)
- `/repositories/who` (user's repositories)

## 3. Special Documentation Routes

**Pattern**: `/{component}(/{docId})?`

**Components**:
- `docs` → DocumentationViewer

**Example Routes**:
- `/docs` (documentation home)
- `/docs/overview` (specific document)
- `/docs/getting-started` (specific document)

## 4. Fixed Standard Routes (Non-Framework)

**Pattern**: Fixed paths defined in configuration

**Components** (from routes-config.json standardComponents):
- `/` → WelcomePage
- `/select_profile` → SelectProfilePage
- `/organization-selection` → OrganizationSelection
- `/dak-configuration` → DAKConfiguration
- `/dashboard` → DashboardRedirect (redirect only)
- `/test-dashboard` → TestDashboard
- `/test-bpmn-viewer` → BPMNViewerTestComponent
- `/test-framework` → LandingPageWithFramework
- `/test-documentation` → TestDocumentationPage
- `/test-asset-editor` → AssetEditorTest

## 5. Deploy Branch Routes (Minimal)

**Pattern**: Fixed paths for deploy branch

**Components** (from routes-config.deploy.json):
- `/` → BranchListingPage
- `*` → NotFound

## 6. Test Framework Routes

**Pattern**: `/{test-component}/{user}/{repo}(/{branch})?`

**Components**:
- `/test-framework-dashboard/{user}/{repo}` → DAKDashboardWithFramework
- `/test-framework-dashboard/{user}/{repo}/{branch}` → DAKDashboardWithFramework

## Components Framework Usage Analysis

### Components USING Page Framework
(Found by searching for PageLayout, usePage, usePageParams, useDAKParams usage)

**Full Framework Integration**:
- DAKDashboard (PageLayout + framework context)
- DAKActionSelection (PageLayout + usePageParams)
- DAKSelection (PageLayout + usePageParams)
- CoreDataDictionaryViewer (usePageParams)
- DecisionSupportLogicView (usePageParams)
- TestingViewer (usePageParams)
- QuestionnaireEditor (usePageParams)
- BPMNEditor (usePageParams)
- BPMNViewer (usePageParams)
- ActorEditor (usePageParams)
- ComponentEditor (usePageParams)
- DAKDashboardWithFramework (framework testing)

**Partial Framework Integration**:
- RepositorySelection (PageLayout but manual parameter handling)
- DocumentationViewer (PageLayout but special documentation logic)

### Components NOT Using Page Framework

**Standalone Pages**:
- WelcomePage (PageLayout wrapper only, no framework context)
- BranchListingPage (PageLayout wrapper only, no framework context)
- SelectProfilePage (no framework)
- OrganizationSelection (no framework)
- DAKConfiguration (no framework)
- DashboardRedirect (redirect component)
- TestDashboard (no framework)
- BPMNViewerTestComponent (no framework)
- NotFound (no framework)
- LandingPageWithFramework (no framework)
- TestDocumentationPage (no framework)
- AssetEditorTest (no framework)

## Route Generation Analysis

### Dynamic Route Generation (lazyRouteUtils.js)

The `generateDAKRoutes()` function creates comprehensive route patterns:

```javascript
function generateDAKRoutes(routeName, dakComponent) {
  // Special case for documentation
  if (routeName === 'docs') {
    return [
      <Route path={basePath} element={<LazyComponent />} />,
      <Route path={`${basePath}/:docId`} element={<LazyComponent />} />
    ];
  }
  
  // Standard DAK component routes
  return [
    <Route path={basePath} element={<LazyComponent />} />,                    // TOP_LEVEL
    <Route path={`${basePath}/:user/:repo`} element={<LazyComponent />} />,  // DAK
    <Route path={`${basePath}/:user/:repo/:branch`} element={<LazyComponent />} />, // DAK+branch
    <Route path={`${basePath}/:user/:repo/:branch/*`} element={<LazyComponent />} /> // ASSET
  ];
}
```

### Missing Route Patterns

**Currently Missing**:
1. **User-only routes**: `/{component}/{user}` for DAK components (framework supports but not generated)
2. **Asset routes without branch**: `/{component}/{user}/{repo}/*` (would use default branch)
3. **Query parameter preservation**: Routes that maintain `?debug=true`, `?theme=dark`
4. **Fragment preservation**: Routes that maintain `#components`, `#publishing`

## Framework Context Determination Logic

The PageProvider determines page type from URL parameters:

```javascript
const determinePageType = (params) => {
  const { user, repo } = params;
  const asset = params['*']; // Wildcard parameter for asset path
  
  if (asset) return PAGE_TYPES.ASSET;        // /{component}/{user}/{repo}/{branch}/{asset}
  if (user && repo) return PAGE_TYPES.DAK;   // /{component}/{user}/{repo}[/{branch}]  
  if (user) return PAGE_TYPES.USER;          // /{component}/{user}
  return PAGE_TYPES.TOP_LEVEL;               // /{component}
};
```

## Routing Issues and Gaps

### Current Issues

1. **Missing User Routes**: DAK components don't generate `/{component}/{user}` routes
2. **Inconsistent Framework Usage**: Some components manually handle parameters instead of using framework
3. **Route Overlap**: Some standard components might conflict with DAK component routes
4. **Context Loss**: Direct URL entry doesn't preserve fragments and query parameters
5. **Branch Handling**: Default branch vs explicit branch handling inconsistent

### Components That Should Use Framework

**Candidates for Framework Migration**:
- RepositorySelection (already partially using PageLayout)
- DocumentationViewer (could benefit from consistent context handling)

**Components That Should Remain Standalone**:
- WelcomePage (authentication page, no user context needed)
- SelectProfilePage (profile selection, pre-user context)
- OrganizationSelection (organization selection, pre-user context)
- Test components (specialized testing, don't need full framework)

## Recommendations

### 1. Complete Route Pattern Generation

Add missing user-only routes for DAK components:
```javascript
<Route path={`${basePath}/:user`} element={<LazyComponent />} />
```

### 2. Standardize Framework Usage

Migrate RepositorySelection to full framework integration:
- Remove manual parameter handling
- Use usePageParams consistently
- Leverage framework error handling

### 3. Add Query/Fragment Support

Enhance routing to preserve:
- Query parameters (`?debug=true`, `?theme=dark`)
- URL fragments (`#components`, `#publishing`)
- Hash routing for client-side navigation

### 4. Consolidate Route Configuration

Unify route generation logic to eliminate duplication between:
- 404.html route detection
- lazyRouteUtils.js route generation
- routeConfig.js configuration

## Implementation Priority

1. **High Priority**: Add missing `/{component}/{user}` routes for framework consistency
2. **Medium Priority**: Enhance query parameter and fragment preservation  
3. **Medium Priority**: Migrate RepositorySelection to full framework usage
4. **Low Priority**: Optimize route configuration consolidation

## Testing Requirements

### Route Pattern Testing

Test all combinations:
- `/{component}` → TOP_LEVEL page type
- `/{component}/{user}` → USER page type  
- `/{component}/{user}/{repo}` → DAK page type
- `/{component}/{user}/{repo}/{branch}` → DAK page type with branch
- `/{component}/{user}/{repo}/{branch}/{asset}` → ASSET page type

### Framework Integration Testing

- Direct URL entry for all route patterns
- Context preservation during navigation
- Error handling for invalid parameters
- Authentication state management across page types

This analysis reveals that SGEX has a sophisticated but complex routing system that can be significantly improved through the proposed routing solution consolidation.