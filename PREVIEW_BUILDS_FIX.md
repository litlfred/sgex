# Preview Builds Failing - Fix Summary

## Issue
Preview builds for branch deployments were failing with the error:
```
routeConfig.js:1 Uncaught SyntaxError: Unexpected token '<' (at routeConfig.js:1:1)
```

And the message:
```
Branch Deployment Not Found
The branch "copilot-fix-1016" does not appear to be deployed.
```

Even though the branch was deployed to GitHub Pages at:
```
https://github.com/litlfred/sgex/blob/gh-pages/copilot-fix-1016/index.html
```

## Root Cause

The error occurred because `routeConfig.js` was returning HTML (containing `<` character) instead of JavaScript. This happened due to inconsistent path resolution.

### The Problem

In `public/index.html`, the route configuration script was loaded using a **relative path**:
```html
<script src="./routeConfig.js"></script>
```

While all other assets used **absolute paths** with `PUBLIC_URL`:
```html
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
<link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
```

### Why This Caused Failures

When a branch deployment is built with `PUBLIC_URL="/sgex/copilot-fix-1016/"`, the relative path `./routeConfig.js` could resolve differently depending on the URL format:

**Scenario 1: URL without trailing slash**
- URL: `https://litlfred.github.io/sgex/copilot-fix-1016`
- Browser extracts base: `/sgex/`
- Relative path resolves to: `/sgex/routeConfig.js` ❌ (file doesn't exist at this path!)
- Result: 404 HTML page returned instead of JavaScript

**Scenario 2: URL with trailing slash**
- URL: `https://litlfred.github.io/sgex/copilot-fix-1016/`
- Browser extracts base: `/sgex/copilot-fix-1016/`
- Relative path resolves to: `/sgex/copilot-fix-1016/routeConfig.js` ✅
- Result: Correct file loaded

**Scenario 3: Using PUBLIC_URL (the fix)**
- Built path: `/sgex/copilot-fix-1016/routeConfig.js` (absolute)
- Always resolves correctly regardless of URL format ✅

## The Fix

### Primary Fix: Consistent Asset Paths

Changed `public/index.html` line 53:
```html
<!-- Before -->
<script src="./routeConfig.js"></script>

<!-- After -->
<script src="%PUBLIC_URL%/routeConfig.js"></script>
```

This makes `routeConfig.js` consistent with all other assets, using an absolute path that always resolves correctly.

### Secondary Fix: Missing Component Registration

Added missing `LandingPage` component case to `src/services/componentRouteService.js`:
```javascript
case 'LandingPage':
  LazyComponent = React.lazy(() => import('../components/LandingPage'));
  break;
```

This fixes the console warning: `Unknown component LandingPage, using fallback`

## Verification

### Build Verification

After the fix, building with `PUBLIC_URL="/sgex/test-branch/"` produces:
```html
<script src="/sgex/test-branch/routeConfig.js"></script>
```

All assets now use consistent absolute paths:
- `href="/sgex/test-branch/favicon.ico"`
- `href="/sgex/test-branch/logo192.png"`
- `src="/sgex/test-branch/routeConfig.js"` ← **Now fixed!**
- `src="/sgex/test-branch/static/js/main.xxxxx.js"`

### Test Coverage

Created comprehensive tests in `src/tests/RouteConfigPathFix.test.js`:
- ✅ Verifies `index.html` uses `PUBLIC_URL` for routeConfig.js
- ✅ Verifies all asset paths use `PUBLIC_URL` consistently
- ✅ Documents why relative paths fail with different URL formats
- ✅ Verifies `LandingPage` component is properly registered
- ✅ All 26 related tests pass

## Impact

- **Branch deployments** will now load correctly regardless of URL format
- **Preview builds** will work consistently for all branches
- **Route configuration** will load properly on first page load
- **No breaking changes** to existing functionality

## Why 404.html Wasn't Changed

The `public/404.html` file also has `<script src="./routeConfig.js"></script>` with a relative path, but this is **correct** because:

1. 404.html is always served from the root (`/404.html`)
2. The relative path `./routeConfig.js` always resolves to `/routeConfig.js`
3. The root `routeConfig.js` is deployed by the landing page deployment

So no change was needed for 404.html.

## Files Modified

| File | Lines Changed | Description |
|------|--------------|-------------|
| `public/index.html` | 1 line | Changed routeConfig.js to use PUBLIC_URL |
| `src/services/componentRouteService.js` | 3 lines | Added LandingPage component case |
| `src/tests/RouteConfigPathFix.test.js` | 94 lines (new) | Comprehensive test coverage |

## Related Issues

This fix resolves the preview builds failing issue and ensures that branch deployments work correctly for:
- Feature branches
- Fix branches  
- All copilot-generated branches
- Manual branch deployments

The fix is minimal, surgical, and follows the existing pattern used by all other assets in the application.
