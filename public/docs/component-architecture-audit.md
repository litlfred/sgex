# Component Architecture Audit

## Overview

This document identifies SGEX Workbench components and their compliance with the wrapper + content architecture pattern required for proper PageProvider context initialization.

**Last Updated**: 2025-10-10

## Architecture Pattern Requirement

All DAK components that use `PageLayout` MUST follow the wrapper + content pattern:

```javascript
// ✅ CORRECT PATTERN
const MyComponent = () => {
  return (
    <PageLayout pageName="my-component">
      <MyComponentContent />
    </PageLayout>
  );
};

const MyComponentContent = () => {
  const { profile, repository, branch } = usePage();
  // Component logic here
};

export default MyComponent;
```

**Why**: This ensures `PageProvider` context exists before any hooks try to access it, preventing "PageContext is null" errors.

## Component Status

### ✅ Compliant Components

These components correctly implement the wrapper + content pattern:

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| ActorEditor | `src/components/ActorEditor.js` | ✅ Fixed | Recently fixed in PR #1076 |
| CoreDataDictionaryViewer | `src/components/CoreDataDictionaryViewer.js` | ✅ Compliant | Proper wrapper + content pattern |
| ComponentEditor | `src/components/ComponentEditor.js` | ✅ Compliant | Proper wrapper + content pattern |
| PersonaViewer | `src/components/PersonaViewer.js` | ✅ Compliant | Proper wrapper + content pattern |
| DAKDashboard | `src/components/DAKDashboard.js` | ✅ Compliant | Reference implementation |
| QuestionnaireEditor | `src/components/QuestionnaireEditor.js` | ✅ Compliant | Proper wrapper + content pattern |
| DecisionSupportLogicView | `src/components/DecisionSupportLogicView.js` | ✅ Compliant | Proper wrapper + content pattern |

### ⚠️ Components Needing Review

These components may need updates or review:

| Component | File | Issue | Recommendation |
|-----------|------|-------|----------------|
| BusinessProcessSelection | `src/components/BusinessProcessSelection.js` | Uses `useDAKUrlParams` instead of page framework hooks | Consider migrating to `usePage()` hook for consistency |

### ℹ️ Components Using Alternative Patterns

These components use different patterns that don't require wrapper + content:

| Component | File | Pattern | Notes |
|-----------|------|---------|-------|
| BPMNEditor | `src/components/BPMNEditor.js` | AssetEditorLayout | Uses `AssetEditorLayout` which handles context internally |
| BPMNSource | `src/components/BPMNSource.js` | AssetEditorLayout | Uses `AssetEditorLayout` which handles context internally |
| BPMNViewer | `src/components/BPMNViewer.js` | AssetEditorLayout | Uses `AssetEditorLayout` which handles context internally |

**Note**: `AssetEditorLayout` provides PageProvider internally, so components using it can call `usePage()` directly without the wrapper pattern.

### 📋 Non-DAK Components

These components don't use DAK page context and don't require the pattern:

- WelcomePage
- SelectProfilePage
- DAKActionSelection
- DAKSelection
- DAKConfiguration
- OrganizationSelection
- RepositorySelection
- DashboardRedirect
- LandingPage
- DocumentationViewer
- BranchListingPage
- BranchDeploymentSelector
- DAKFAQDemo

## Detailed Review: BusinessProcessSelection

### Current Implementation

```javascript
const BusinessProcessSelection = () => {
  const { profile, repository, selectedBranch } = useDAKUrlParams();
  // Component logic...
  
  return (
    <PageLayout pageName="business-process-selection">
      {/* Content */}
    </PageLayout>
  );
};
```

### Issues

1. Uses custom `useDAKUrlParams` hook instead of framework's `usePage()` hook
2. Calls hook before PageLayout (potential for future issues if useDAKUrlParams changes)
3. Not following the standard pattern used by other DAK components

### Recommendation

Consider refactoring to use the standard pattern:

```javascript
const BusinessProcessSelection = () => {
  return (
    <PageLayout pageName="business-process-selection">
      <BusinessProcessSelectionContent />
    </PageLayout>
  );
};

const BusinessProcessSelectionContent = () => {
  const { profile, repository, branch } = usePage();
  // Component logic...
};
```

**Priority**: Low (current implementation works, but standardization would improve maintainability)

## Guidelines for New Components

When creating a new DAK component:

1. ✅ **Always use wrapper + content pattern** for components with PageLayout
2. ✅ **Call page hooks in content component** (after PageProvider exists)
3. ✅ **Handle loading and error states** in content component
4. ✅ **Export the wrapper component** (not the content component)
5. ✅ **Use `usePage()` hook** for accessing page context (preferred over `useDAKParams()`)
6. ✅ **Test with URL navigation** to ensure context is properly initialized

## Testing Checklist

For any new or modified component:

- [ ] Navigate to component via URL: `/{component}/{user}/{repo}/{branch}`
- [ ] Check browser console for "PageContext is null" errors
- [ ] Verify component handles loading state gracefully
- [ ] Verify component handles error state (missing repo, etc.)
- [ ] Test branch switching functionality
- [ ] Verify all page hooks are called in content component

## References

- **Page Framework Documentation**: `public/docs/page-framework.md` (Component Architecture Patterns section)
- **Requirements Documentation**: `public/docs/requirements.md` (REQ-ARCH-001, REQ-ARCH-002, REQ-ARCH-003)
- **Issue Fix**: PR #1076 - ActorEditor page load failure fix
- **Reference Implementations**: DAKDashboard, ActorEditor, CoreDataDictionaryViewer

## Migration Strategy

For components that need updates:

1. **Low Risk**: Components already working (like BusinessProcessSelection)
   - Can be updated opportunistically during other maintenance
   - Update documentation to note non-standard pattern

2. **High Priority**: Any new components being developed
   - Must follow wrapper + content pattern from the start
   - Code review should verify pattern compliance

3. **Code Review Checklist**: Add architecture pattern verification to PR reviews
   - Verify wrapper + content pattern for PageLayout components
   - Check that hooks are called after PageProvider
   - Ensure proper loading/error handling

## Future Considerations

1. **Linter Rule**: Consider adding ESLint rule to detect page hooks called before PageLayout
2. **Component Generator**: Create a code generator/template for new DAK components
3. **Automated Testing**: Add integration tests that verify proper context initialization
4. **Documentation**: Keep this audit updated as components are added/modified
