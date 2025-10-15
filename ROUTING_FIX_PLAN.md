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

### Phase 5: Ensure Local Deployment Support

**Goal**: All changes must work correctly for localhost development

**Key Changes**:
1. **Detect Local vs GitHub Pages**: Check hostname to determine deployment type
2. **Different Base Paths**: Use `/` for local, `/sgex/` or `/sgex/{branch}/` for GitHub Pages
3. **Simplified Routing**: Local deployments don't need complex branch detection
4. **Testing**: Verify `npm start` works correctly after changes

**Implementation Details**:
```javascript
// Detection logic
function isLocalDeployment() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
}

function getBasePath() {
  if (isLocalDeployment()) {
    return '/sgex'; // PUBLIC_URL in development
  }
  
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments[0] === 'sgex') {
    if (segments.length === 1) return '/sgex/';
    if (isKnownComponent(segments[1])) return '/sgex/';
    return '/sgex/' + segments[1] + '/';
  }
  
  return '/';
}

// In App.js - use detected base path
const basename = isLocalDeployment() 
  ? process.env.PUBLIC_URL || '/sgex'
  : getBasePath().slice(0, -1); // Remove trailing slash
```

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
   - Enter: URL that triggers two 404s
   - Expected: Error page shown after second attempt
   - Verify: No infinite loop, helpful error message

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

### Step 1: Update 404.html
- Add URL context extraction and storage
- Implement cyclic redirect prevention
- Preserve hash and query parameters in redirects
- Test: Direct URL entry to various paths

### Step 2: Update routeConfig.js
- Add context restoration function
- Make component detection dynamic
- Remove hardcoded branch names
- Test: Configuration loads correctly in all deployments

### Step 3: Update routingContextService.js
- Read and restore stored context
- Clean routing query parameters
- Restore URL fragments
- Test: Context available to React components

### Step 4: Update useDAKUrlParams Hook
- Add fallback to session storage
- Handle unauthenticated access
- Support all context sources
- Test: Components receive correct context

### Step 5: Test Local Development
- Verify localhost:3000 works
- Check all npm scripts
- Ensure no GitHub Pages logic breaks local dev
- Test: Full development workflow

### Step 6: Integration Testing
- Test all URL patterns
- Verify hash/query preservation
- Check cyclic redirect prevention
- Test: All deployment scenarios

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
- Test local deployment at each step
- Separate logic paths for local vs GitHub Pages
- Verify npm start/build work correctly
- Document any new local setup requirements

### Cyclic Redirect Risk
**Risk**: New logic could introduce infinite loops
**Mitigation**:
- Implement strict redirect attempt tracking
- Add timeout/limit on redirect attempts
- Show clear error page on loop detection
- Log redirect paths for debugging

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
✅ No cyclic redirects under any scenario
✅ Local development (localhost) works correctly
✅ All deployment types supported (landing, main, feature branches)
✅ No hardcoded branch or component names
✅ Backward compatible with existing URLs
✅ Clear error messages when routing fails

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
