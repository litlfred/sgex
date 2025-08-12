# GitHub Pages 404.html Implementation

## Overview

This document describes the 404.html implementation for proper GitHub Pages SPA (Single Page Application) routing in the SGEX Workbench project.

## File Location

- **Source**: `public/404.html`
- **Build Output**: `build/404.html` (automatically copied during `npm run build`)
- **Deployment**: Root of gh-pages branch

## Purpose

The 404.html file enables proper client-side routing for a React SPA deployed on GitHub Pages by:

1. **Handling direct URL access**: When users navigate directly to a route (e.g., `/sgex/dashboard/user/repo`), GitHub Pages serves 404.html instead of the missing file
2. **SPA routing conversion**: The 404.html contains JavaScript that converts the 404 URL into a query parameter format that can be processed by the React app
3. **Preserving navigation state**: Maintains the intended route so the React Router can handle it properly

## Technical Implementation

### Size Requirement
- **Current size**: 4,987 bytes
- **Minimum requirement**: 512 bytes (for Internet Explorer compatibility)
- ✅ **Status**: Meets requirement

### Key Features

#### 1. SPA Routing Script
Based on the [spa-github-pages](https://github.com/rafgraph/spa-github-pages) pattern with SGEX-specific enhancements.

#### 2. Multi-Deployment Support
Handles different deployment scenarios:
- **Landing page**: `/sgex/` (from deploy branch)
- **Main branch**: `/sgex/main/dashboard/...`
- **Feature branches**: `/sgex/branch-name/dashboard/...`
- **Standalone deployment**: `/dashboard/...`

#### 3. Route Configuration Integration
- Uses `routeConfig.js` for intelligent route detection
- Distinguishes between branch names and DAK component names
- Supports dynamic branch deployments

#### 4. URL Processing
Converts URLs like:
```
https://litlfred.github.io/sgex/dashboard/user/repo
```
Into:
```
https://litlfred.github.io/sgex/?/dashboard/user/repo
```

The React app then processes the query parameter `?/dashboard/user/repo` to restore the intended route.

## Deployment Scenarios

### GitHub Pages Deployment
```
Original URL:    /sgex/dashboard/user/repo
404.html serves and redirects to: /sgex/?/dashboard/user/repo
React Router processes: /dashboard/user/repo
```

### Branch Deployment
```
Original URL:    /sgex/main/dashboard/user/repo
404.html serves and redirects to: /sgex/main/?/dashboard/user/repo
React Router processes: /dashboard/user/repo (within main branch context)
```

### Standalone Deployment
```
Original URL:    /dashboard/user/repo
404.html serves and redirects to: /?/dashboard/user/repo
React Router processes: /dashboard/user/repo
```

## Dependencies

### Required Files
1. **routeConfig.js**: Provides configuration for route detection
2. **index.html**: Contains corresponding SPA routing script to process redirected URLs

### Route Configuration
The 404.html relies on `getSGEXRouteConfig()` function from `routeConfig.js` to:
- Identify deployed branches (`isDeployedBranch()`)
- Validate DAK components (`isValidDAKComponent()`)
- Make intelligent routing decisions

## Browser Compatibility

- **Modern browsers**: Full support
- **Internet Explorer**: Requires >512 bytes (✅ Current: 4,987 bytes)
- **All browsers**: Graceful fallback if JavaScript is disabled

## Testing

### Automated Tests
- `src/tests/404-routing.test.js`: Validates file presence, size, and content
- Build process automatically includes 404.html in output

### Manual Testing
1. Build the project: `npm run build`
2. Serve the build directory with a web server
3. Navigate to non-existent routes
4. Verify 404.html is served and redirects properly
5. Check browser console for routing debug messages

### Test Script
Use `/tmp/test-404-functionality.sh` for comprehensive validation:
```bash
chmod +x /tmp/test-404-functionality.sh
/tmp/test-404-functionality.sh
```

## Debug Information

The 404.html includes console logging for development:
```javascript
console.log('GitHub Pages Branch Deployment Routing:', {
  branch: potentialBranch,
  originalPath: l.pathname,
  redirectPath: redirectPath,
  routePath: routePath
});
```

This helps developers understand how URLs are being processed during development.

## Maintenance

### When Adding New Routes
1. Update route configuration in `routes-config.json`
2. No changes needed to 404.html (uses dynamic configuration)

### When Adding New Deployment Types
1. Update logic in 404.html if needed
2. Update `routeConfig.js` configuration
3. Test with new deployment scenario

## Verification Checklist

- ✅ File exists in `public/404.html`
- ✅ File is copied to `build/404.html` during build
- ✅ File size >512 bytes (IE compatibility)
- ✅ Contains SPA routing script
- ✅ Uses getSGEXRouteConfig()
- ✅ Handles GitHub Pages deployment
- ✅ Handles branch deployments
- ✅ Handles standalone deployments
- ✅ Preserves query parameters and hash
- ✅ Includes debug logging
- ✅ Has automated tests

## Security Considerations

The 404.html only processes URL paths and doesn't execute any external code. It:
- Only redirects within the same origin
- Doesn't process external parameters
- Uses browser's native `location.replace()` for redirection
- Follows GitHub Pages security model

## Performance

- Minimal JavaScript execution time
- No external dependencies beyond routeConfig.js
- Efficient path processing
- No network requests beyond the redirect