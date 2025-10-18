# Comprehensive Routing Fix Plan for SGEX

## Executive Summary

This plan addresses the routing issues in SGEX's GitHub Pages deployment, focusing on:
1. Direct URL entry support with proper session storage population
2. Preservation of URL fragments (#) and query parameters (?)
3. Dynamic detection of branches/pages without hardcoding
4. Prevention of cyclic redirects
5. Support for all deployment scenarios (landing page, main, feature branches, local)
6. Ensuring local deployments remain functional

## Current State Analysis

### Deployment Scenarios
1. **Landing Page**: `https://litlfred.github.io/sgex/` (deploy branch)
2. **Main Branch**: `https://litlfred.github.io/sgex/main/`
3. **Feature Branches**: `https://litlfred.github.io/sgex/{branch-name}/`
4. **Local Development**: `http://localhost:3000/`

### Current Problems Identified

1. **Direct URL Entry Fails**: Users cannot open shared links or edit URLs in the browser
2. **Session Storage Not Populated**: URL parameters (user, repo, branch) not extracted to session storage
3. **Fragment/Query Loss**: Hash fragments (#) and query params (?) are lost during routing
4. **Welcome Page Redirect**: Direct URLs incorrectly redirect to welcome page instead of intended component
5. **Cyclic Redirect Risk**: Potential for infinite redirect loops in certain scenarios

### Critical Files Analysis

Three files control routing behavior:
- `public/404.html` - GitHub Pages SPA routing handler (currently ~250 lines)
- `public/routeConfig.js` - Route configuration loader (~317 lines)
- `src/services/routingContextService.js` - React-side context management (~303 lines)

All three have prohibition warnings but are the exact files that need fixes for routing to work.

## Proposed Solution

### Phase 1: Fix 404.html Routing Logic

**Goal**: Reliable URL processing that preserves all URL components and sets session storage

**Key Changes**:
1. **Preserve URL Components**: Ensure hash (#) and query (?) parameters are maintained through redirects
2. **Store Context Before Redirect**: Extract and store user/repo/branch in session storage BEFORE redirecting
3. **Cyclic Redirect Prevention**: Track redirect attempts in session storage with timestamps
4. **Optimistic Branch Detection**: Assume branches exist, try deployment first, fallback to main only on second 404

**Implementation Details**:
```javascript
// In 404.html, BEFORE redirect:
function storeUrlContext(pathname, search, hash) {
  const segments = pathname.split('/').filter(Boolean);
  
  // Detect pattern: /sgex/{branch}/{component}/{user}/{repo}/{branch?}
  // or: /sgex/{component}/{user}/{repo}/{branch?} (landing page)
  
  let context = {
    timestamp: Date.now(),
    originalUrl: window.location.href,
    search: search,
    hash: hash
  };
  
  // Extract based on pattern
  if (segments[0] === 'sgex') {
    if (isKnownComponent(segments[1])) {
      // Landing page pattern: /sgex/dashboard/user/repo
      context.component = segments[1];
      context.user = segments[2];
      context.repo = segments[3];
      context.branch = segments[4];
      context.deploymentBranch = 'deploy';
    } else {
      // Branch deployment: /sgex/main/dashboard/user/repo
      context.deploymentBranch = segments[1];
      context.component = segments[2];
      context.user = segments[3];
      context.repo = segments[4];
      context.branch = segments[5];
    }
  }
  
  // Store in session storage
  sessionStorage.setItem('sgex_url_context', JSON.stringify(context));
  
  // Store individual items for backward compatibility
  if (context.user) sessionStorage.setItem('sgex_selected_user', context.user);
  if (context.repo) sessionStorage.setItem('sgex_selected_repo', context.repo);
  if (context.branch) sessionStorage.setItem('sgex_selected_branch', context.branch);
  if (context.component) sessionStorage.setItem('sgex_current_component', context.component);
}

// Cyclic redirect prevention
function checkRedirectLoop(pathname) {
  const attempts = JSON.parse(sessionStorage.getItem('sgex_redirect_attempts') || '[]');
  const now = Date.now();
  
  // Clean old attempts (>30 seconds)
  const recent = attempts.filter(a => now - a.time < 30000);
  
  // Check if this path attempted recently
  const thisPathAttempts = recent.filter(a => a.path === pathname);
  
  if (thisPathAttempts.length >= 2) {
    return true; // Loop detected
  }
  
  // Record this attempt
  recent.push({ path: pathname, time: now });
  sessionStorage.setItem('sgex_redirect_attempts', JSON.stringify(recent));
  
  return false;
}

// Redirect with full URL preservation
function redirectToSPA(basePath, routePath, search, hash) {
  let url = basePath;
  
  if (routePath) {
    url += '?/' + routePath;
  }
  
  // Preserve query params (excluding our routing param)
  if (search && !search.startsWith('?/')) {
    const separator = url.includes('?') ? '&' : '?';
    url += separator + search.substring(1);
  }
  
  // Always preserve hash
  if (hash) {
    url += hash;
  }
  
  window.location.replace(url);
}
```

### Phase 2: Enhance routeConfig.js for Dynamic Detection

**Goal**: Eliminate hardcoded component/branch names, support dynamic detection

**Key Changes**:
1. **Component Discovery**: Read from routes-config.json instead of hardcoding
2. **Branch Detection**: Optimistically assume any non-component path segment is a branch
3. **Deployment Type Detection**: Determine context dynamically from URL
4. **Context Restoration**: Provide function to restore stored context

**Implementation Details**:
```javascript
// Dynamic component detection
function isKnownComponent(name) {
  // Load from config instead of hardcoding
  if (window.SGEX_ROUTES_CONFIG) {
    return window.SGEX_ROUTES_CONFIG.isValidComponent(name);
  }
  
  // Fallback list only if config unavailable
  const fallbackComponents = [
    'dashboard', 'testing-viewer', 'core-data-dictionary-viewer',
    'business-process-selection', 'bpmn-editor', 'docs'
  ];
  
  return fallbackComponents.includes(name);
}

// Context restoration function
window.SGEX_restoreUrlContext = function() {
  try {
    const stored = sessionStorage.getItem('sgex_url_context');
    if (stored) {
      const context = JSON.parse(stored);
      
      // Validate not stale (< 5 minutes old)
      if (Date.now() - context.timestamp < 300000) {
        return context;
      }
    }
  } catch (e) {
    console.warn('Failed to restore URL context:', e);
  }
  
  return null;
};
```

### Phase 3: Update routingContextService.js

**Goal**: React app reads and uses stored context from 404.html

**Key Changes**:
1. **Read Stored Context**: On app initialization, read context from session storage
2. **Restore URL State**: Apply hash and query params to browser URL
3. **Provide to Components**: Make context available to all components via hook
4. **Clean URL**: Remove routing query parameter (?/) after processing

**Implementation Details**:
```javascript
// In routingContextService.js
export function initializeRoutingContext() {
  try {
    // Get context stored by 404.html
    const stored = sessionStorage.getItem('sgex_url_context');
    if (!stored) {
      return null;
    }
    
    const context = JSON.parse(stored);
    
    // Restore URL fragments and query params if not already present
    const currentUrl = window.location.href;
    const currentHash = window.location.hash;
    const currentSearch = window.location.search;
    
    // Restore hash if it was stored but not in current URL
    if (context.hash && !currentHash) {
      window.history.replaceState(null, '', 
        window.location.pathname + currentSearch + context.hash);
    }
    
    // Clean routing query parameter
    cleanRoutingParam();
    
    return context;
  } catch (error) {
    console.error('Failed to initialize routing context:', error);
    return null;
  }
}

function cleanRoutingParam() {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  
  // Remove the ?/ routing parameter
  if (params.has('/')) {
    params.delete('/');
    
    // Reconstruct clean URL
    const cleanUrl = url.pathname + 
      (params.toString() ? '?' + params.toString() : '') +
      url.hash;
    
    window.history.replaceState(null, '', cleanUrl);
  }
}
```

### Phase 4: Update useDAKUrlParams Hook

**Goal**: Components receive context from stored session data as fallback

**Key Changes**:
1. **Try URL Params First**: Use React Router params if available
2. **Fallback to Session Storage**: If URL params missing, check session storage
3. **Fetch Data**: Load GitHub data using stored context
4. **Handle Unauthenticated**: Create public profile objects when not authenticated

**Implementation Details**:
```javascript
// In useDAKUrlParams.js
const useDAKUrlParams = () => {
  const { user, repo, branch } = useParams();
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Priority 1: React Router params
    if (user && repo) {
      fetchFromParams(user, repo, branch);
      return;
    }
    
    // Priority 2: Stored URL context
    const stored = sessionStorage.getItem('sgex_url_context');
    if (stored) {
      try {
        const ctx = JSON.parse(stored);
        if (ctx.user && ctx.repo) {
          fetchFromContext(ctx);
          return;
        }
      } catch (e) {
        console.warn('Failed to parse stored context:', e);
      }
    }
    
    // Priority 3: Individual session storage items (backward compat)
    const storageUser = sessionStorage.getItem('sgex_selected_user');
    const storageRepo = sessionStorage.getItem('sgex_selected_repo');
    if (storageUser && storageRepo) {
      const storageBranch = sessionStorage.getItem('sgex_selected_branch');
      fetchFromParams(storageUser, storageRepo, storageBranch);
      return;
    }
    
    setLoading(false);
  }, [user, repo, branch]);
  
  return { context, loading };
};
```

### Phase 5: Unified Local/Production Deployment

**Goal**: Same routing structure for local and production - simplified maintenance

**Unified Approach** (Based on user feedback):
1. **Same URL Structure**: Use `/sgex/` structure for both local and production
2. **Local Branch Listing**: `localhost:3000/sgex/` shows remote GitHub PR preview branches
3. **Local Development**: `localhost:3000/sgex/main/` is the actual development environment
4. **No Special Cases**: Eliminate conditional logic for local vs production

**Benefits**:
- Same base path logic everywhere
- Less conditional code
- Easier testing and debugging
- Consistent user experience
- Simplified build configuration

**Implementation Details**:
```javascript
// SIMPLIFIED - No special local detection needed
function getBasePath() {
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  
  // Universal logic for both local and production
  if (segments[0] === 'sgex') {
    if (segments.length === 1) return '/sgex/';
    return '/sgex/' + segments[1] + '/';
  }
  
  // Fallback to /sgex/ if not matched
  return '/sgex/';
}

// In App.js - always use /sgex
const basename = process.env.PUBLIC_URL || '/sgex';

// In package.json - set PUBLIC_URL for development
// "start": "PUBLIC_URL=/sgex react-scripts start"
```

**Local Development Setup**:
```json
// package.json scripts
{
  "start": "PUBLIC_URL=/sgex craco start",
  "build": "PUBLIC_URL=/sgex craco build",
  "build:deploy": "PUBLIC_URL=/sgex craco build && node scripts/prepare-deploy.js"
}
```

**Development Workflow**:
1. Run `npm start` → opens `localhost:3000/sgex/`
2. Branch listing page shows remote GitHub PR previews
3. Click "Main" card → navigates to `localhost:3000/sgex/main/`
4. Work in `/sgex/main/` exactly like production `/sgex/main/`

### Phase 6: Add Comprehensive Logging and Analytics

**Goal**: Track all routing operations to help diagnose and resolve issues

**Logging Requirements** (from user feedback):
- Log all route access attempts
- Track complete redirect chains
- Capture errors and failures
- Include timestamps and context
- Help resolve other issues from logs

**Implementation Details**:
```javascript
// Create routing logger service in routingContextService.js
class RoutingLogger {
  constructor() {
    this.sessionId = `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.routeChain = [];
    this.startTime = Date.now();
  }
  
  logAccess(url, context = {}) {
    const entry = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'access',
      url: url,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      referrer: document.referrer,
      ...context
    };
    
    this.routeChain.push(entry);
    console.log('[ROUTING]', entry);
    this.persistLog();
    return entry;
  }
  
  logRedirect(from, to, reason, attempt) {
    const entry = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'redirect',
      from: from,
      to: to,
      reason: reason,
      attempt: attempt,
      chainLength: this.routeChain.filter(e => e.type === 'redirect').length + 1
    };
    
    this.routeChain.push(entry);
    console.log('[ROUTING]', entry);
    this.persistLog();
    
    // Check redirect limit (7 attempts per user feedback)
    if (entry.chainLength >= 7) {
      this.logError('Redirect limit exceeded (7 attempts)', {
        chain: this.routeChain,
        finalUrl: to
      });
      return false; // Prevent redirect
    }
    
    return entry;
  }
  
  logError(message, context = {}) {
    const entry = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'error',
      message: message,
      url: window.location.href,
      chain: this.routeChain,
      ...context
    };
    
    this.routeChain.push(entry);
    console.error('[ROUTING ERROR]', entry);
    this.persistLog();
    return entry;
  }
  
  logComponentLoad(component, context = {}) {
    const entry = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - this.startTime,
      type: 'component-load',
      component: component,
      url: window.location.href,
      ...context
    };
    
    this.routeChain.push(entry);
    console.log('[ROUTING]', entry);
    this.persistLog();
    return entry;
  }
  
  logSessionStorageUpdate(key, value) {
    const entry = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      type: 'session-storage',
      key: key,
      value: typeof value === 'object' ? JSON.stringify(value) : value
    };
    
    this.routeChain.push(entry);
    console.log('[ROUTING]', entry);
    this.persistLog();
  }
  
  persistLog() {
    try {
      sessionStorage.setItem('sgex_routing_log', JSON.stringify({
        sessionId: this.sessionId,
        startTime: this.startTime,
        chain: this.routeChain
      }));
    } catch (e) {
      console.warn('Failed to persist routing log:', e);
    }
  }
  
  generateReport() {
    return {
      sessionId: this.sessionId,
      totalDuration: Date.now() - this.startTime,
      totalEvents: this.routeChain.length,
      redirectCount: this.routeChain.filter(e => e.type === 'redirect').length,
      errorCount: this.routeChain.filter(e => e.type === 'error').length,
      componentLoads: this.routeChain.filter(e => e.type === 'component-load').length,
      timeline: this.routeChain
    };
  }
}

// Create global instance available to 404.html and React app
window.SGEX_ROUTING_LOGGER = new RoutingLogger();

// Usage in 404.html
function performRouting() {
  window.SGEX_ROUTING_LOGGER.logAccess(window.location.href, {
    handler: '404.html'
  });
  // ... routing logic ...
}

function optimisticBranchRedirect(branch, routePath) {
  const from = window.location.href;
  const to = buildRedirectUrl(branch, routePath);
  
  const canRedirect = window.SGEX_ROUTING_LOGGER.logRedirect(
    from, to, 'optimistic-branch', getRedirectAttemptCount()
  );
  
  if (!canRedirect) {
    showErrorPage('Too Many Redirects', 
      'Exceeded maximum redirect attempts (7).');
    return;
  }
  
  window.location.replace(to);
}
```

**Log Storage**:
- Session storage: Current session routing history
- Console: All events for real-time debugging
- Accessible via: `window.SGEX_ROUTING_LOGGER.generateReport()`

## Testing Strategy

### Test Scenarios

1. **Direct URL Entry Tests**:
   - Enter: `https://litlfred.github.io/sgex/main/dashboard/litlfred/smart-ips-pilgrimage`
   - Expected: Dashboard loads with correct repo context
   - Verify: Session storage populated correctly

2. **Hash Fragment Preservation**:
   - Enter: `https://litlfred.github.io/sgex/main/docs#overview`
   - Expected: Docs page loads and scrolls to #overview section
   - Verify: Hash is in final URL after routing

3. **Query Parameter Preservation**:
   - Enter: `https://litlfred.github.io/sgex/main/dashboard/user/repo?debug=true`
   - Expected: Dashboard loads with ?debug=true preserved
   - Verify: Query param accessible in component

4. **Feature Branch Deployment**:
   - Enter: `https://litlfred.github.io/sgex/feature-branch/dashboard/user/repo`
   - Expected: If branch exists, load from that deployment; otherwise fallback to main
   - Verify: No cyclic redirects

5. **Landing Page Routing**:
   - Enter: `https://litlfred.github.io/sgex/docs`
   - Expected: Redirect to landing page docs view
   - Verify: Minimal components load (deploy branch)

6. **Local Development**:
   - Run: `npm start`
   - Navigate: `http://localhost:3000/dashboard/user/repo`
   - Expected: Works identically to production
   - Verify: No 404 redirects needed

7. **Cyclic Redirect Prevention**:
   - Enter: URL that triggers multiple 404s
   - Expected: Error page shown after **7th attempt** (per user feedback)
   - Verify: No infinite loop, helpful error message with routing log

8. **Logging Verification**:
   - Enter: Any URL
   - Expected: Console shows detailed routing log entries
   - Verify: Can access report via `window.SGEX_ROUTING_LOGGER.generateReport()`
   - Check: Session storage contains routing history

### Manual Testing Checklist

- [ ] Landing page loads: `https://litlfred.github.io/sgex/`
- [ ] Landing page docs: `https://litlfred.github.io/sgex/docs`
- [ ] Main deployment root: `https://litlfred.github.io/sgex/main/`
- [ ] Main dashboard with repo: `https://litlfred.github.io/sgex/main/dashboard/litlfred/smart-ips-pilgrimage`
- [ ] Main dashboard with branch: `https://litlfred.github.io/sgex/main/dashboard/litlfred/smart-ips-pilgrimage/main`
- [ ] Feature branch deployment: `https://litlfred.github.io/sgex/feature-x/dashboard/user/repo`
- [ ] URLs with hash: `https://litlfred.github.io/sgex/main/docs#section`
- [ ] URLs with query: `https://litlfred.github.io/sgex/main/dashboard/user/repo?param=value`
- [ ] URLs with both: `https://litlfred.github.io/sgex/main/docs?view=compact#section`
- [ ] Local development: `http://localhost:3000/dashboard/user/repo`
- [ ] Bookmark and share links work correctly
- [ ] Browser back/forward buttons work
- [ ] Editing URL in address bar works

## Implementation Order

### Step 1: Create Routing Logger
- Implement RoutingLogger class
- Add to routingContextService.js
- Make available globally
- Test: Logging works in console and session storage

### Step 2: Update 404.html
- Add comprehensive logging calls
- Implement 7-redirect limit check
- Remove component detection logic
- Add optimistic branch routing
- Preserve hash and query parameters
- Test: Direct URL entry with logging

### Step 3: Update routeConfig.js
- Simplify deployment detection
- Remove local/production conditionals
- Single source of truth for components
- Test: Config loads correctly for all deployments

### Step 4: Update routingContextService.js
- Add logger integration
- Read and restore stored context
- Clean routing query parameters
- Log session storage updates
- Test: Context restoration with logging

### Step 5: Update useDAKUrlParams Hook
- Add logging for context resolution
- Fallback to session storage with logging
- Handle unauthenticated access
- Test: Components receive correct context

### Step 6: Unify Local Development
- Update package.json scripts for `/sgex` base path
- Test localhost:3000/sgex/ shows branch listing
- Test localhost:3000/sgex/main/ works for development
- Verify: Same routing logic as production

### Step 7: Integration Testing
- Test all URL patterns with logging
- Verify 7-redirect limit enforcement
- Check hash/query preservation
- Test all deployment scenarios
- Review routing logs for issues

## Risk Mitigation

### Breaking Changes Risk
**Risk**: Changes could break existing functionality
**Mitigation**: 
- Test extensively before merging
- Keep backward compatibility for session storage keys
- Maintain existing URL patterns
- Feature flag for gradual rollout if needed

### Local Development Risk
**Risk**: Changes could break localhost development  
**Mitigation**:
- **UNIFIED APPROACH**: Use same `/sgex` structure for local and production (per user feedback)
- `localhost:3000/sgex/` - Branch listing (remote GitHub PR previews)
- `localhost:3000/sgex/main/` - Local development environment
- Eliminates conditional logic for local vs production
- Test local deployment at each step
- Verify npm start/build work correctly

### Cyclic Redirect Risk
**Risk**: New logic could introduce infinite loops  
**Mitigation**:
- Implement strict redirect attempt tracking with logging
- **7-redirect limit** enforced (per user feedback)
- Show clear error page with routing log on loop detection
- Log all redirect chains for debugging
- Test redirect scenarios extensively

### Performance Risk
**Risk**: Additional logic could slow page load
**Mitigation**:
- Keep 404.html logic minimal and fast
- Use session storage efficiently
- Avoid unnecessary parsing/processing
- Test load times before/after changes

## Success Criteria

✅ Direct URL entry works for all patterns  
✅ Hash fragments (#) preserved through routing  
✅ Query parameters (?) preserved through routing  
✅ Session storage populated from URLs  
✅ No cyclic redirects (7-attempt limit enforced)  
✅ **Unified local/production deployment** (same `/sgex` structure)  
✅ All deployment types supported (landing, main, feature branches, local)  
✅ No hardcoded branch or component names  
✅ Backward compatible with existing URLs  
✅ Clear error messages when routing fails  
✅ **Comprehensive logging** of all routing operations  
✅ Routing logs help diagnose issues  
✅ Console shows detailed routing timeline  
✅ Session storage contains routing history

## Rollback Plan

If issues arise after deployment:
1. Revert to previous commit using git
2. Redeploy previous version
3. Analyze failure logs
4. Fix issues in new branch
5. Retest before redeployment

## Migration Notes

### For Existing URLs
- All existing URL patterns continue to work
- No user action required
- Bookmarks remain valid

### For Developers
- No changes to development workflow
- npm start/build work as before
- Test against localhost before pushing

### For Deployments
- No changes to GitHub Actions workflows
- Same build process
- Same deployment structure

## Next Steps

1. **Review this plan** with repository owner (@litlfred)
2. **Get explicit consent** for modifying prohibited files (404.html, routeConfig.js, routingContextService.js)
3. **Confirm local deployment requirement** - ensure nothing breaks localhost
4. **Implement in phases** following the order above
5. **Test each phase** before moving to next
6. **Deploy to feature branch** for testing before main
7. **Monitor and adjust** based on real-world usage

## Questions for Review

1. Should we prioritize any specific URL pattern over others?
2. Are there any additional deployment scenarios to consider?
3. What is the acceptable redirect chain length before showing error?
4. Should we add analytics/logging for routing issues?
5. Are there any specific local development requirements to preserve?

---

**Document Status**: Ready for Review
**Author**: @copilot
**Date**: 2025-10-15
**Related Issues**: #954, #1112
**Related PRs**: #955, #1087, #1113
