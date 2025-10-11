# Issue: Update BusinessProcessSelection Component to Follow Standard Page Framework Pattern

## Overview

The BusinessProcessSelection component currently uses a custom `useDAKUrlParams` hook instead of the standard page framework pattern. This issue tracks the work to migrate it to use the standard `usePage()` hook and follow the wrapper + content component pattern for consistency and maintainability.

## Current State

### Implementation
The component currently:
- Uses custom `useDAKUrlParams` hook for accessing page context
- Does not follow the wrapper + content pattern
- Calls hooks before PageLayout wrapping
- Works correctly but differs from the standard pattern used by other DAK components

### Code Location
- **File**: `src/components/BusinessProcessSelection.js`
- **Pattern**: Custom hook usage with direct PageLayout wrapping

### Current Code Structure
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

## Problem Statement

### Issues with Current Implementation

1. **Pattern Inconsistency**: Does not follow the standard wrapper + content pattern used by other DAK components (DAKDashboard, ActorEditor, CoreDataDictionaryViewer, etc.)

2. **Framework Integration**: Uses custom `useDAKUrlParams` hook instead of the page framework's standard `usePage()` hook

3. **Maintainability Risk**: Custom patterns make the codebase harder to maintain and understand for new developers

4. **Future Compatibility**: May be affected by future changes to the page framework if it doesn't follow standard patterns

5. **Documentation Compliance**: Does not comply with REQ-ARCH-001, REQ-ARCH-002, REQ-ARCH-003 requirements established for component architecture

### Context

This issue was identified during an audit of all DAK components following the fix for ActorEditor page load failure (Issue #1076). The audit revealed that all other DAK components follow the standard pattern except BusinessProcessSelection.

## Requirements

### Functional Requirements

**REQ-BPS-001**: Component MUST follow the wrapper + content pattern
- Split BusinessProcessSelection into wrapper and content components
- Wrapper component only wraps PageLayout
- Content component contains all logic and state

**REQ-BPS-002**: Component MUST use standard page framework hooks
- Replace `useDAKUrlParams` with `usePage()` hook
- Access page context through standard framework interface
- Remove dependency on custom hook

**REQ-BPS-003**: Component MUST maintain existing functionality
- All current features must continue to work as before
- No regression in user experience
- No breaking changes to external interfaces

**REQ-BPS-004**: Component MUST handle loading and error states
- Properly handle loading state from page context
- Display appropriate error messages when context is unavailable
- Gracefully degrade when required data is missing

### Non-Functional Requirements

**REQ-BPS-NF-001**: Code quality and consistency
- Follow the same pattern as DAKDashboard reference implementation
- Maintain or improve code readability
- Add appropriate comments where needed

**REQ-BPS-NF-002**: Documentation compliance
- Update component to comply with REQ-ARCH-001, REQ-ARCH-002, REQ-ARCH-003
- Ensure component matches patterns documented in page-framework.md
- Update component-architecture-audit.md to reflect changes

**REQ-BPS-NF-003**: Testing requirements
- Verify component loads correctly via URL navigation
- Test loading and error states
- Verify BPMN file listing and preview functionality
- Test branch switching if applicable

## Proposed Solution

### Target Architecture

```javascript
// Wrapper component - exports this
const BusinessProcessSelection = () => {
  return (
    <PageLayout pageName="business-process-selection">
      <BusinessProcessSelectionContent />
    </PageLayout>
  );
};

// Content component - contains all logic and hooks
const BusinessProcessSelectionContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, repository, branch, loading, error } = usePage();
  
  // Handle loading state
  if (loading) {
    return (
      <div className="loading-state">
        <h2>Loading...</h2>
        <p>Initializing business process selection...</p>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="error-state">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }
  
  // Component state and logic
  const [bpmnFiles, setBpmnFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... rest of component logic
  
  return (
    <div className="business-process-selection">
      {/* Component UI */}
    </div>
  );
};

export default BusinessProcessSelection;
```

### Migration Steps

1. **Create Content Component**
   - Extract all logic from BusinessProcessSelection into BusinessProcessSelectionContent
   - Move all state, effects, and handlers to content component

2. **Update Hook Usage**
   - Replace `useDAKUrlParams()` with `usePage()`
   - Map `selectedBranch` to `branch` from page context
   - Ensure all page context properties are correctly accessed

3. **Add Error Handling**
   - Add loading state handling
   - Add error state handling
   - Handle missing profile/repository gracefully

4. **Update Wrapper Component**
   - Simplify wrapper to only wrap PageLayout
   - Remove all hooks from wrapper
   - Export wrapper as default

5. **Test Thoroughly**
   - Test URL navigation to component
   - Verify BPMN file listing works
   - Test preview functionality
   - Verify no console errors

6. **Update Documentation**
   - Update component-architecture-audit.md
   - Mark BusinessProcessSelection as compliant
   - Remove from "needs review" section

## Testing Criteria

### Acceptance Criteria

✅ Component follows wrapper + content pattern
✅ Uses `usePage()` hook instead of `useDAKUrlParams`
✅ Handles loading state appropriately
✅ Handles error state appropriately
✅ All existing functionality works as before
✅ No console errors when navigating to component
✅ BPMN file listing displays correctly
✅ Preview functionality works
✅ Component-architecture-audit.md updated

### Test Scenarios

1. **URL Navigation Test**
   - Navigate to: `/business-process-selection/{user}/{repo}/{branch}`
   - Verify: Component loads without errors
   - Check: No "PageContext is null" errors in console

2. **Loading State Test**
   - Navigate to component with valid DAK
   - Verify: Loading state displays while data loads
   - Check: Loading completes and files are displayed

3. **Error State Test**
   - Navigate to component with invalid repo
   - Verify: Error state displays with appropriate message
   - Check: No JavaScript errors in console

4. **BPMN Listing Test**
   - Navigate to component with DAK containing BPMN files
   - Verify: BPMN files are listed correctly
   - Check: File names and metadata display properly

5. **Preview Test**
   - Click on a BPMN file in the list
   - Verify: Preview opens and displays diagram
   - Check: Preview functionality works as before

6. **Branch Context Test**
   - Navigate to component with specific branch
   - Verify: Correct branch is used for file listing
   - Check: Branch context is maintained

## Priority and Effort

### Priority
**Low** - The component currently works correctly. This is a technical debt/consistency improvement rather than a bug fix.

### Effort Estimate
**Small** (2-4 hours)
- Code changes: 1-2 hours
- Testing: 1 hour
- Documentation updates: 0.5 hours
- Code review: 0.5 hours

### Dependencies
None - This is an isolated change to a single component

## References

### Related Documentation
- **Page Framework Documentation**: `public/docs/page-framework.md` (Component Architecture Patterns section)
- **Requirements**: `public/docs/requirements.md` (REQ-ARCH-001, REQ-ARCH-002, REQ-ARCH-003)
- **Component Audit**: `public/docs/component-architecture-audit.md`

### Related Issues
- Issue #1076: ActorEditor page load failure (demonstrates the issue this pattern prevents)

### Reference Implementations
- `src/components/DAKDashboard.js` - Reference implementation
- `src/components/ActorEditor.js` - Recently updated to follow pattern
- `src/components/CoreDataDictionaryViewer.js` - Compliant implementation
- `src/components/PersonaViewer.js` - Compliant implementation

## Implementation Notes

### Custom Hook Migration

The `useDAKUrlParams` hook may be used elsewhere in the codebase. Before removing it:
1. Search for all usages: `grep -r "useDAKUrlParams" src/`
2. If other components use it, migrate them first or keep the hook
3. If only BusinessProcessSelection uses it, the hook can be deprecated

### Backward Compatibility

Since this is an internal refactoring:
- No API changes
- No prop changes
- No external interface changes
- Component can be safely updated without affecting consumers

### Code Review Checklist

- [ ] Wrapper component only wraps PageLayout
- [ ] Content component uses `usePage()` hook
- [ ] Loading state is handled
- [ ] Error state is handled
- [ ] All hooks are in content component
- [ ] Component exports wrapper (not content)
- [ ] Existing functionality works
- [ ] No console errors
- [ ] Documentation updated

## Success Criteria

The issue will be considered complete when:

1. ✅ BusinessProcessSelection follows wrapper + content pattern
2. ✅ Component uses `usePage()` hook
3. ✅ All tests pass
4. ✅ No regression in functionality
5. ✅ Documentation updated
6. ✅ Code review approved
7. ✅ Component-architecture-audit.md marks component as compliant

## Notes

- This is a **refactoring task**, not a bug fix
- **Priority is low** - can be completed as part of routine maintenance
- Changes are **isolated** to single component
- **No breaking changes** - internal refactoring only
- **Low risk** - existing tests will catch any regressions
