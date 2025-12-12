# SGEX Routing Solution Proposal

## Executive Summary

This document proposes a comprehensive solution to fix the routing issues in SGEX Workbench across all deployment scenarios. The current routing system suffers from multiple issues including unreliable direct URL entry, inconsistent deployment handling, hardcoded values, and potential cyclic redirects.

## Current State Analysis

### Deployment Scenarios
SGEX supports multiple deployment scenarios that each need reliable routing:

1. **Landing Page Deployment** (`/sgex/`)
   - From deploy branch on GitHub Pages
   - Minimal functionality for branch selection
   - Should handle redirects to main deployments

2. **Main Branch Deployment** (`/sgex/main/`)
   - Full application functionality
   - All DAK components available
   - Should be the primary working environment

3. **Feature Branch Deployments** (`/sgex/feature-branch/`)
   - Preview deployments for feature branches
   - Same functionality as main but isolated
   - Should fallback gracefully if not deployed

4. **Standalone Deployment** (`/` on custom servers)
   - Non-GitHub Pages deployment
   - Root-level routing without `/sgex/` prefix
   - For local development and custom hosting

### Current Issues Identified

#### 1. Direct URL Entry Problems
- **Fragment Loss**: Hash fragments (`#components`) are lost during routing
- **Query Parameter Loss**: Query parameters (`?debug=true`) are not preserved
- **Session Storage**: URL parameters not extracted to session storage variables
- **Context Loss**: User/repo/branch context not preserved across redirects

#### 2. Inconsistent Deployment Handling
- **Complex 404.html**: Overly complex routing logic with multiple failure points
- **Deployment Detection**: Unreliable detection of deployment type in routeConfig.js
- **Branch Detection**: Hardcoded branch lists instead of dynamic detection
- **Fallback Logic**: Inconsistent fallback between deployment types

#### 3. Cyclic Redirect Issues
- **Redirect Loops**: 404.html can cause infinite redirects under certain conditions
- **Session Storage Conflicts**: Multiple systems writing to same storage keys
- **Timing Issues**: Race conditions between route config loading and routing

#### 4. Hardcoded Values
- **Branch Names**: Hardcoded in configuration files instead of dynamic detection
- **Component Lists**: Fixed lists requiring manual maintenance
- **Base Paths**: Hardcoded paths for different deployment scenarios

## Proposed Solution Architecture

### 1. Unified URL Pattern Standard

Establish consistent URL patterns across all deployment scenarios:

```
Base Patterns:
- Landing: https://litlfred.github.io/sgex/
- Main: https://litlfred.github.io/sgex/main/
- Feature: https://litlfred.github.io/sgex/{branch-name}/
- Standalone: http://localhost:3000/

Component Patterns:
- DAK Component: {base}/{component}/{user}/{repo}/{branch}/{asset}*
- Standard Route: {base}/{route-path}
- Documentation: {base}/docs/{doc-id}?
- Assets: {base}/assets/{asset-path}*

Examples:
- https://litlfred.github.io/sgex/main/dashboard/litlfred/smart-ips-pilgrimage/main
- https://litlfred.github.io/sgex/feature-branch/docs/overview
- https://litlfred.github.io/sgex/docs
- http://localhost:3000/dashboard/demo-user/test-dak
```

### 2. Simplified 404.html Strategy

Replace the complex 404.html with a simple, reliable approach:

```html
<!-- Simplified 404.html -->
<script>
(function() {
  var l = window.location;
  var pathSegments = l.pathname.split('/').filter(Boolean);
  
  // Prevent infinite loops
  if (l.search && l.search.indexOf('?/') === 0) {
    showErrorPage('Routing Loop Detected');
    return;
  }
  
  // Determine base path and route
  var basePath, routePath;
  
  if (l.hostname.endsWith('.github.io')) {
    // GitHub Pages deployment
    if (pathSegments[0] !== 'sgex') {
      redirectToError('Invalid GitHub Pages URL');
      return;
    }
    
    if (pathSegments.length === 1) {
      // /sgex/ -> landing page
      basePath = '/sgex/';
      routePath = '';
    } else {
      // /sgex/branch/... or /sgex/component/...
      basePath = '/sgex/' + pathSegments[1] + '/';
      routePath = pathSegments.slice(2).join('/');
    }
  } else {
    // Standalone deployment
    basePath = '/';
    routePath = pathSegments.join('/');
  }
  
  // Store context for React app
  storeUrlContext(pathSegments, basePath);
  
  // Redirect to SPA with encoded route
  var newUrl = l.protocol + '//' + l.host + basePath;
  if (routePath) {
    newUrl += '?/' + encodeRoutePath(routePath) + preserveUrlParams(l);
  }
  newUrl += l.hash;
  
  l.replace(newUrl);
})();
</script>
```

### 3. Dynamic Configuration System

Replace hardcoded configurations with dynamic detection:

```javascript
// Enhanced routeConfig.js
window.SGEX_ROUTES_CONFIG = {
  // Dynamically detect deployment scenario
  detectDeploymentType() {
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    
    if (hostname.endsWith('.github.io')) {
      if (path === '/sgex/' || path === '/sgex/index.html') {
        return 'landing';
      }
      // Extract branch from /sgex/{branch}/...
      const segments = path.split('/').filter(Boolean);
      if (segments.length >= 2 && segments[0] === 'sgex') {
        return segments[1]; // Return actual branch name
      }
      return 'main';
    }
    return 'standalone';
  },
  
  // Dynamically determine available components
  getAvailableComponents() {
    // Query actual deployment for available routes
    // Fallback to known components if query fails
    return this.queryDeployedComponents() || this.getDefaultComponents();
  },
  
  // Dynamic branch detection
  getDeployedBranches() {
    // Use GitHub API or deployment manifest to get actual branches
    return this.queryGitHubAPI() || ['main'];
  }
};
```

### 4. Context Preservation System

Implement reliable URL context extraction and preservation:

```javascript
// Enhanced context preservation
function extractAndStoreUrlContext(pathSegments, searchParams, hash) {
  const context = {
    // Extract from URL pattern
    user: null,
    repo: null, 
    branch: null,
    component: null,
    asset: null,
    
    // Preserve all URL parts
    searchParams: searchParams,
    hash: hash,
    
    // Store deployment context
    deploymentType: SGEX_ROUTES_CONFIG.detectDeploymentType(),
    basePath: determineBasePath()
  };
  
  // Pattern matching for different URL structures
  if (isDAKComponentPattern(pathSegments)) {
    context.component = pathSegments[getComponentIndex()];
    context.user = pathSegments[getUserIndex()];
    context.repo = pathSegments[getRepoIndex()];
    context.branch = pathSegments[getBranchIndex()];
    context.asset = pathSegments.slice(getAssetIndex()).join('/');
  }
  
  // Store in session storage with namespace
  try {
    sessionStorage.setItem('sgex:routing:context', JSON.stringify(context));
    
    // Backward compatibility
    if (context.user) sessionStorage.setItem('sgex_selected_user', context.user);
    if (context.repo) sessionStorage.setItem('sgex_selected_repo', context.repo);
    if (context.branch) sessionStorage.setItem('sgex_selected_branch', context.branch);
  } catch (error) {
    console.warn('Could not store routing context:', error);
  }
  
  return context;
}
```

### 5. React Router Integration

Enhance the React application to handle restored context:

```javascript
// Enhanced App.js
function App() {
  const [routingContext, setRoutingContext] = useState(null);
  
  useEffect(() => {
    // Restore routing context from session storage
    const restored = restoreRoutingContext();
    setRoutingContext(restored);
    
    // Apply any URL restoration needed
    if (restored && restored.shouldRestore) {
      restoreUrlState(restored);
    }
  }, []);
  
  // Generate routes with context awareness
  const routes = generateContextAwareRoutes(routingContext);
  
  return (
    <Router basename={getBasePath()}>
      <Routes>{routes}</Routes>
    </Router>
  );
}

// Context-aware route generation
function generateContextAwareRoutes(context) {
  const routes = [];
  
  // Add standard routes
  routes.push(...generateStandardRoutes());
  
  // Add DAK component routes with proper parameter extraction
  routes.push(...generateDAKRoutes(context));
  
  // Add fallback route that preserves context
  routes.push(
    <Route path="*" element={<NotFoundWithContext context={context} />} />
  );
  
  return routes;
}
```

### 6. Fallback and Error Handling

Implement robust fallback mechanisms:

```javascript
// Graceful degradation strategy
const FallbackStrategy = {
  // Branch deployment fallback
  handleBranchNotFound(branchName, originalUrl) {
    const fallbackSequence = [
      () => this.tryBranchRoot(branchName),
      () => this.tryMainDeployment(originalUrl),
      () => this.tryLandingPage(originalUrl)
    ];
    
    return this.executeSequential(fallbackSequence);
  },
  
  // Component not found fallback  
  handleComponentNotFound(component, context) {
    // Try alternative spellings/routes
    const alternatives = this.findSimilarComponents(component);
    if (alternatives.length > 0) {
      return this.redirectToAlternative(alternatives[0], context);
    }
    
    // Fallback to dashboard
    return this.redirectToDashboard(context);
  },
  
  // Preserve context during fallbacks
  preserveContext(originalContext, fallbackUrl) {
    const preserved = {
      ...originalContext,
      originalUrl: originalContext.originalUrl || window.location.href,
      fallbackReason: 'component-not-found',
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('sgex:fallback:context', JSON.stringify(preserved));
    return fallbackUrl;
  }
};
```

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. **Simplify 404.html**
   - Replace complex logic with simple, reliable routing
   - Add comprehensive error handling and logging
   - Implement redirect loop prevention

2. **Enhance routeConfig.js**
   - Add dynamic deployment type detection
   - Implement component discovery mechanisms
   - Add configuration validation

3. **Create context preservation system**
   - Implement URL context extraction
   - Add session storage management
   - Create restoration mechanisms

### Phase 2: React Integration (Week 2)
1. **Update App.js routing**
   - Integrate context restoration
   - Enhance route generation
   - Add error boundaries

2. **Enhance useDAKUrlParams hook**
   - Support context restoration
   - Add fallback mechanisms
   - Improve error handling

3. **Update components**
   - Support direct URL entry
   - Handle restored context
   - Preserve navigation state

### Phase 3: Testing & Validation (Week 3)
1. **Comprehensive testing**
   - Test all deployment scenarios
   - Validate direct URL entry
   - Test fallback mechanisms

2. **Performance optimization**
   - Minimize redirect chains
   - Optimize context storage
   - Reduce loading times

3. **Documentation**
   - Update deployment guides
   - Create troubleshooting guides
   - Document URL patterns

## Migration Strategy

### Existing Deployments
1. **Backward Compatibility**
   - Support existing URL patterns during transition
   - Provide migration warnings for deprecated patterns
   - Gradual transition over multiple releases

2. **Data Migration**
   - Migrate session storage keys to new format
   - Preserve user preferences and state
   - Clean up deprecated storage entries

3. **Deployment Updates**
   - Update GitHub Actions workflows
   - Update deployment documentation
   - Test migration on staging environments

### URL Migration
1. **Old Pattern Support**
   - Continue supporting existing URL patterns
   - Add automatic redirects to new patterns
   - Provide migration notices in logs

2. **Search Engine Compatibility**
   - Ensure search engines can index new patterns
   - Add canonical URLs for SEO
   - Implement proper redirects for crawlers

## Testing Strategy

### Automated Testing
1. **Unit Tests**
   - Test URL parsing functions
   - Test context extraction
   - Test fallback mechanisms

2. **Integration Tests** 
   - Test full routing workflows
   - Test deployment scenarios
   - Test error conditions

3. **End-to-End Tests**
   - Test user journeys
   - Test direct URL entry
   - Test navigation flows

### Manual Testing
1. **Deployment Scenarios**
   - Test each deployment type
   - Test branch switching
   - Test fallback scenarios

2. **URL Patterns**
   - Test all supported URL patterns
   - Test edge cases and error conditions
   - Test browser compatibility

3. **User Experience**
   - Test bookmark functionality
   - Test share links
   - Test navigation consistency

## Risk Mitigation

### Technical Risks
1. **Breaking Changes**
   - Implement feature flags for gradual rollout
   - Maintain backward compatibility layers
   - Create rollback procedures

2. **Performance Impact**
   - Monitor redirect performance
   - Optimize critical path loading
   - Cache configuration data

3. **Browser Compatibility**
   - Test across browser versions
   - Provide fallbacks for older browsers
   - Use progressive enhancement

### Operational Risks
1. **Deployment Issues**
   - Test on staging environments first
   - Create deployment verification tests
   - Plan rollback procedures

2. **User Impact**
   - Communicate changes to users
   - Provide migration guides
   - Monitor error rates

## Success Metrics

### Functional Metrics
- ✅ Direct URL entry works 100% of the time
- ✅ URL fragments and query parameters preserved
- ✅ Session storage correctly populated from URLs
- ✅ Zero cyclic redirects
- ✅ All deployment scenarios supported
- ✅ Dynamic branch/component detection working

### Performance Metrics
- ⏱️ Routing resolution time < 200ms
- ⏱️ Page load time not increased
- ⏱️ Minimal redirect chains (max 2 redirects)

### Quality Metrics
- 🐛 Zero hardcoded branch/component names
- 🔄 Graceful fallback in all error scenarios
- 📊 Comprehensive error logging and monitoring
- 🧪 100% test coverage for routing logic

## Conclusion

This proposal addresses all the routing issues identified in the problem statement through a systematic, unified approach. The solution emphasizes:

1. **Reliability**: Simple, robust routing logic that works consistently
2. **Flexibility**: Dynamic configuration that adapts to deployment scenarios
3. **Preservation**: Complete URL context preservation including fragments and query parameters
4. **Maintainability**: No hardcoded values, dynamic component/branch detection
5. **User Experience**: Seamless navigation and direct URL entry support

The implementation plan provides a phased approach with comprehensive testing and migration strategies to ensure smooth deployment with minimal user impact.

## Next Steps

1. **Stakeholder Review**: Review this proposal with the development team
2. **Technical Validation**: Validate technical approaches with prototypes
3. **Implementation Planning**: Create detailed implementation tasks
4. **Testing Strategy**: Develop comprehensive test plans
5. **Deployment Strategy**: Plan phased rollout approach

This solution will provide a solid foundation for reliable routing across all SGEX deployment scenarios while maintaining the flexibility needed for future enhancements.