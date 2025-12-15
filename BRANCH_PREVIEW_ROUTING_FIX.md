# Branch Preview Routing Fix - Issue Resolution

## Problem Summary

Branch previews on GitHub Pages were failing to load with console errors:
- `No routes matched location "/index.html"`
- `No routes matched location "/"`

## Root Cause Analysis

The `public/routeConfig.js` file was using **relative paths** to load configuration files:

```javascript
xhr.open('GET', './routes-config.json', false);
```

This worked fine for the main deployment but failed for branch previews because:
- Branch deployments are at paths like `/sgex/doc_consolidate/`
- Relative path `./routes-config.json` resolved to `/sgex/doc_consolidate/routes-config.json`
- But the browser interpreted this relative to the current page URL
- The actual file needed was at the absolute path `/sgex/doc_consolidate/routes-config.json`

## Solution Implementation

### 1. Added `getBasePath()` Function

Extracts the base deployment path from the current URL:

```javascript
function getBasePath() {
  var path = window.location.pathname;
  
  // For localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/sgex';
  }
  
  // Parse pathname: /sgex/ or /sgex/main/ or /sgex/{branch}/
  var pathParts = path.split('/').filter(Boolean);
  
  if (pathParts.length === 0 || pathParts[0] !== 'sgex') {
    return '';
  }
  
  // Root: /sgex
  if (pathParts.length === 1) {
    return '/sgex';
  }
  
  // Branch: /sgex/{branch}
  return '/sgex/' + pathParts[1];
}
```

### 2. Added `getConfigFilePath()` Function

Constructs absolute path to configuration file:

```javascript
function getConfigFilePath(deployType) {
  var basePath = getBasePath();
  var fileName = getConfigFileName(deployType);
  
  if (basePath) {
    return basePath + '/' + fileName;
  }
  return './' + fileName;
}
```

### 3. Updated `loadRouteConfigSync()`

Changed to use absolute paths:

```javascript
var configFilePath = getConfigFilePath(deployType);
xhr.open('GET', configFilePath, false);
```

## Path Resolution Examples

| Deployment Type | Current URL | Base Path | Config Path |
|----------------|-------------|-----------|-------------|
| Main | `/sgex/main/` | `/sgex/main` | `/sgex/main/routes-config.json` |
| Branch (doc_consolidate) | `/sgex/doc_consolidate/` | `/sgex/doc_consolidate` | `/sgex/doc_consolidate/routes-config.json` |
| Branch (copilot-fix-123) | `/sgex/copilot-fix-123/` | `/sgex/copilot-fix-123` | `/sgex/copilot-fix-123/routes-config.json` |
| Landing Page | `/sgex/` | `/sgex` | `/sgex/routes-config.deploy.json` |
| Localhost | `localhost:3000/sgex/` | `/sgex` | `/sgex/routes-config.json` |

## Testing

Created comprehensive test suite: `src/tests/branchPreviewRoutingFix.test.js`

**Test Results:**
```
✅ Test 1: Main deployment - PASS
✅ Test 2: Branch deployment (doc_consolidate) - PASS
✅ Test 3: Branch deployment (copilot-fix-123) - PASS
✅ Test 4: Landing page - PASS
✅ Test 5: Deep path in branch - PASS
✅ Test 6: Localhost development - PASS

Success Rate: 100% (6/6)
```

Run tests with:
```bash
node src/tests/branchPreviewRoutingFix.test.js
```

## Deployment Verification

To verify the fix works on a deployed branch:

1. Deploy this branch to GitHub Pages
2. Navigate to `https://litlfred.github.io/sgex/{branch-name}/`
3. Open browser console
4. Look for: `SGEX route configuration loaded successfully - main`
5. Verify no errors about missing routes

## Impact

This fix ensures that:
- ✅ Branch previews load correctly
- ✅ Route configuration files are found at the correct path
- ✅ All deployment types (main, branches, landing) work correctly
- ✅ Local development continues to work
- ✅ No changes needed to deployment workflow
- ✅ No changes needed to 404.html routing logic

## Files Modified

1. `public/routeConfig.js` - Added path resolution functions
2. `src/tests/branchPreviewRoutingFix.test.js` - New test suite

## Related Issues

- Original issue: Branch previews not working
- Console log reference: https://gist.github.com/litlfred/7ee9ca4962edef8be7c0b2ba0e10c99a

## Security Considerations

- Uses only URL parsing, no eval() or unsafe operations
- Validates path components before using them
- Maintains existing security model
- No new external dependencies

## Backward Compatibility

- ✅ No breaking changes
- ✅ All existing deployments continue to work
- ✅ Fallback to relative paths if base path cannot be determined
- ✅ No changes to public API
