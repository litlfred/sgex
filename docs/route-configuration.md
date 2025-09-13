# SGEX Route Configuration

## Overview

The SGEX route configuration system provides a single source of truth for DAK (Digital Adaptation Kit) component routes that is shared between the React application and the GitHub Pages SPA routing system.

## Configuration File

The configuration is defined in `public/routes-config.js` which:

- Defines the list of valid DAK components 
- Uses optimistic routing for all branch deployments (no hardcoded branch lists)
- Provides helper functions for component validation
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

### Branch Deployment Handling

SGEX now uses **optimistic routing** for branch deployments:

- **No hardcoded branch lists** - all branches are handled optimistically  
- 404.html tries branch deployment first, falls back to main with preserved context
- Branch deployments are detected dynamically at runtime
- No configuration changes needed when deploying new branches

## Architecture

### Shared Configuration
- `public/routes-config.js` - Single source of truth
- Loaded by both `public/index.html` and `public/404.html`
- Available globally as `window.SGEX_ROUTES_CONFIG`

### React Application
- `src/utils/routeUtils.js` - **DEPRECATED**: Legacy compatibility layer
- Uses global configuration with fallback for tests
- `src/App.js` - Defines React Router routes using `lazyRouteUtils.js`

### GitHub Pages SPA Routing
- `public/404.html` - Uses optimistic routing (no hardcoded branch lists)
- Handles multiple deployment scenarios with graceful fallback
- Validates DAK components using shared config

## Benefits

1. **Single Source of Truth**: No need to maintain component lists in multiple places
2. **Automatic Updates**: Adding a component to the config makes it available everywhere
3. **Consistency**: Both React app and 404.html use the same validation logic
4. **Optimistic Routing**: No hardcoded branch lists - automatic branch deployment handling
5. **Maintainability**: Easy to add new components without hunting down hardcoded lists

## Deployment Scenarios

The system supports:

- **Optimistic Branch Routing**: `/sgex/{any-branch}/dashboard/...` - tries branch deployment first
- **Graceful Fallback**: Non-deployed branches redirect to main with preserved context
- **Direct Component Routes**: `/sgex/dashboard/...` (main deployment)
- **Standalone Deployment**: `/dashboard/...` (non-GitHub Pages)

All scenarios use optimistic routing with the same configuration for component validation.