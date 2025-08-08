# SGEX Route Configuration

## Overview

The SGEX route configuration system provides a single source of truth for DAK (Digital Adaptation Kit) component routes that is shared between the React application and the GitHub Pages SPA routing system.

## Configuration File

The configuration is defined in `public/routes-config.js` which:

- Defines the list of valid DAK components 
- Specifies deployed branches for GitHub Pages routing
- Provides helper functions for component and branch validation
- Is available globally as `window.SGEX_ROUTES_CONFIG`

## Usage

### Adding New DAK Components

When adding a new DAK component:

1. **Add the component name to `public/routes-config.js`:**
   ```javascript
   dakComponents: [
     'dashboard',
     'testing-viewer',
     // ... existing components
     'new-component-name'  // <- Add here
   ]
   ```

2. **Add corresponding routes to `src/App.js`:**
   ```javascript
   <Route path="/new-component-name" element={<NewComponent />} />
   <Route path="/new-component-name/:user/:repo" element={<NewComponent />} />
   <Route path="/new-component-name/:user/:repo/:branch" element={<NewComponent />} />
   <Route path="/new-component-name/:user/:repo/:branch/*" element={<NewComponent />} />
   ```

That's it! The 404.html and routing utilities will automatically recognize the new component.

### Adding Deployed Branches

To add a new deployed branch for GitHub Pages:

```javascript
deployedBranches: [
  'main',
  'deploy',
  'new-branch-name'  // <- Add here
]
```

## Architecture

### Shared Configuration
- `public/routes-config.js` - Single source of truth
- Loaded by both `public/index.html` and `public/404.html`
- Available globally as `window.SGEX_ROUTES_CONFIG`

### React Application
- `src/utils/routeUtils.js` - Uses the global configuration
- Falls back to hardcoded list if configuration not available (for tests)
- `src/App.js` - Defines the actual React Router routes

### GitHub Pages SPA Routing
- `public/404.html` - Uses the global configuration for route validation
- Handles multiple deployment scenarios (deploy branch, main branch, standalone)
- Validates DAK components and deployed branches using the shared config

## Benefits

1. **Single Source of Truth**: No need to maintain component lists in multiple places
2. **Automatic Updates**: Adding a component to the config makes it available everywhere
3. **Consistency**: Both React app and 404.html use the same validation logic
4. **Maintainability**: Easy to add new components without hunting down hardcoded lists

## Deployment Scenarios

The system supports:

- **GitHub Pages Deploy Branch**: `/sgex/deploy/dashboard/...`
- **GitHub Pages Main Branch**: `/sgex/main/dashboard/...` 
- **Direct Component Routes**: `/sgex/dashboard/...`
- **Standalone Deployment**: `/dashboard/...` (non-GitHub Pages)

All scenarios use the same configuration for component validation.