# Redirect Loop Fix - index.html in Branch Deployments

## Issue
URL: `https://litlfred.github.io/sgex/copilot-add-dak-component-indicators/?/index.html`
Error: Redirect Loop Detected (routing-loop)

## Root Cause
When accessing a branch deployment URL with `/index.html` suffix (e.g., `/sgex/branch/index.html`), the 404.html routing logic was treating `index.html` as a component name and creating a redirect URL with `?/index.html`, which triggered the redirect loop detection.

### URL Processing Flow (Before Fix)
1. User accesses: `/sgex/copilot-add-dak-component-indicators/index.html`
2. GitHub Pages doesn't find file, serves 404.html
3. 404.html parses URL: `pathSegments = ['sgex', 'copilot-add-dak-component-indicators', 'index.html']`
4. Treats `index.html` as component, redirects to: `/sgex/copilot-add-dak-component-indicators/?/index.html`
5. This URL has `?/` prefix, triggers redirect loop detection
6. Error shown to user

## Fix
Added special handling in 404.html to detect when the last path segment is `index.html` and redirect to the branch root instead.

### Code Changes
**File: `public/404.html`** (lines 119-126)

```javascript
// Special handling for index.html - redirect to branch root
if (pathSegments.length === 3 && pathSegments[2] === 'index.html') {
  // /sgex/{branch}/index.html -> /sgex/{branch}/
  var branchRootUrl = '/sgex/' + branch + '/';
  console.log('SGEX 404.html: index.html detected, redirecting to branch root:', branchRootUrl);
  redirectToSPA(branchRootUrl, '');
  return;
}
```

### URL Processing Flow (After Fix)
1. User accesses: `/sgex/copilot-add-dak-component-indicators/index.html`
2. GitHub Pages doesn't find file, serves 404.html
3. 404.html parses URL: `pathSegments = ['sgex', 'copilot-add-dak-component-indicators', 'index.html']`
4. Detects `index.html` as last segment
5. Redirects to branch root: `/sgex/copilot-add-dak-component-indicators/`
6. Branch deployment's actual index.html loads successfully

## Test Coverage
Added test cases in `src/tests/404-local-branch-fallback.test.js`:

1. **Test: should handle index.html in branch deployment URLs**
   - Validates pattern recognition for `/sgex/branch/index.html` URLs
   - Confirms redirect target is branch root

2. **Test: should not create ?/index.html redirect URLs**
   - Ensures `index.html` never appears in a `?/` redirect
   - Validates proper redirect format

## Verification
- ✅ All existing tests pass
- ✅ New test cases added and passing
- ✅ No new lint errors introduced
- ✅ Minimal code change (7 lines added)

## Impact
- **Positive**: Fixes redirect loop for branch deployment index.html URLs
- **Positive**: Improves user experience when accessing branch deployments
- **No breaking changes**: Existing routing behavior unchanged
- **No performance impact**: Single conditional check added

## Related Files
- `public/404.html` - Core fix implementation
- `src/tests/404-local-branch-fallback.test.js` - Test coverage
- `public/test-branch-routing.html` - Manual testing (already had expected behavior at lines 268-274)

## Issue Reference
Fixes redirect loop error reported at:
`https://litlfred.github.io/sgex/copilot-add-dak-component-indicators/?/index.html`
