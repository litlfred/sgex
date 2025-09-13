# SGEX Routing Implementation Guide

## Overview

This document provides detailed technical specifications for implementing the SGEX routing solution proposed in `ROUTING_SOLUTION_PROPOSAL.md`. It includes specific code examples, file changes, and implementation steps.

## File-by-File Implementation Plan

### 1. Enhanced 404.html

**Location**: `public/404.html`

**Purpose**: Simplified, reliable GitHub Pages SPA routing

**Key Changes**:
- Remove complex configuration loading
- Implement simple pattern matching
- Add comprehensive error handling
- Prevent redirect loops

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SGEX Workbench</title>
</head>
<body>
  <div id="error-container" style="display: none;">
    <h1>Page Not Found</h1>
    <p id="error-message"></p>
    <p><a href="/sgex/">Return to SGEX Home</a></p>
  </div>

  <script>
    (function() {
      'use strict';
      
      var l = window.location;
      
      // Prevent infinite redirect loops
      if (l.search && l.search.indexOf('?/') === 0) {
        showErrorPage('Redirect Loop Detected', 
          'This URL has already been processed but resulted in a 404.');
        return;
      }
      
      // Check for recent redirect attempts (stored in sessionStorage)
      var currentPath = l.pathname;
      var attempts = getRedirectAttempts();
      
      if (attempts.filter(a => a.path === currentPath).length >= 2) {
        showErrorPage('Too Many Redirects', 
          'Multiple redirect attempts for this URL. Possible configuration issue.');
        return;
      }
      
      // Record this attempt
      recordRedirectAttempt(currentPath);
      
      // Parse URL components
      var pathSegments = l.pathname.split('/').filter(Boolean);
      var basePath, routePath;
      
      // Determine deployment scenario and extract route
      if (l.hostname.endsWith('.github.io')) {
        var result = handleGitHubPagesUrl(pathSegments);
        basePath = result.basePath;
        routePath = result.routePath;
      } else {
        var result = handleStandaloneUrl(pathSegments);
        basePath = result.basePath;
        routePath = result.routePath;
      }
      
      // Store URL context for React app
      storeUrlContext(pathSegments, l.search, l.hash, basePath);
      
      // Perform SPA redirect
      redirectToSPA(basePath, routePath, l.search, l.hash);
      
      // Helper functions
      function handleGitHubPagesUrl(segments) {
        if (segments.length === 0 || segments[0] !== 'sgex') {
          showErrorPage('Invalid URL', 'GitHub Pages URLs must start with /sgex/');
          return null;
        }
        
        if (segments.length === 1) {
          // /sgex/ -> landing page
          return { basePath: '/sgex/', routePath: '' };
        }
        
        // /sgex/{branch}/{route...} or /sgex/{component}/{user}/{repo}...
        var secondSegment = segments[1];
        
        // Detect if this is a branch deployment or direct component access
        if (isKnownComponent(secondSegment)) {
          // Direct component access: /sgex/dashboard/user/repo
          return { 
            basePath: '/sgex/', 
            routePath: segments.slice(1).join('/') 
          };
        } else {
          // Branch deployment: /sgex/main/dashboard/user/repo
          return { 
            basePath: '/sgex/' + secondSegment + '/', 
            routePath: segments.slice(2).join('/') 
          };
        }
      }
      
      function handleStandaloneUrl(segments) {
        // Standalone deployment: all paths are routes
        return { 
          basePath: '/', 
          routePath: segments.join('/') 
        };
      }
      
      function isKnownComponent(name) {
        var knownComponents = [
          'dashboard', 'docs', 'testing-viewer', 'core-data-dictionary-viewer',
          'health-interventions', 'actor-editor', 'business-process-selection',
          'bpmn-editor', 'bpmn-viewer', 'bpmn-source', 'decision-support-logic',
          'questionnaire-editor', 'pages', 'faq-demo'
        ];
        return knownComponents.indexOf(name) !== -1;
      }
      
      function storeUrlContext(segments, search, hash, basePath) {
        try {
          var context = extractUrlContext(segments, search, hash, basePath);
          sessionStorage.setItem('sgex:routing:context', JSON.stringify(context));
          
          // Backward compatibility
          if (context.user) sessionStorage.setItem('sgex_selected_user', context.user);
          if (context.repo) sessionStorage.setItem('sgex_selected_repo', context.repo);
          if (context.branch) sessionStorage.setItem('sgex_selected_branch', context.branch);
        } catch (error) {
          console.warn('Could not store URL context:', error);
        }
      }
      
      function extractUrlContext(segments, search, hash, basePath) {
        var context = {
          originalUrl: l.href,
          basePath: basePath,
          searchParams: search,
          hash: hash,
          timestamp: Date.now()
        };
        
        // Extract DAK component pattern: {component}/{user}/{repo}/{branch?}/{asset...}
        var routeSegments = segments.slice(basePath.split('/').filter(Boolean).length);
        
        if (routeSegments.length >= 3 && isKnownComponent(routeSegments[0])) {
          context.component = routeSegments[0];
          context.user = routeSegments[1];
          context.repo = routeSegments[2];
          context.branch = routeSegments[3] || null;
          context.asset = routeSegments.slice(4).join('/') || null;
        }
        
        return context;
      }
      
      function redirectToSPA(basePath, routePath, search, hash) {
        var newUrl = l.protocol + '//' + l.host + basePath;
        
        // Encode route path in query parameter
        if (routePath) {
          newUrl += '?/' + routePath.replace(/&/g, '~and~');
          
          // Preserve existing query parameters
          if (search && search !== '?/') {
            var params = search.startsWith('?') ? search.substring(1) : search;
            newUrl += '&' + params.replace(/&/g, '~and~');
          }
        } else if (search && search !== '?/') {
          newUrl += search;
        }
        
        // Preserve hash
        newUrl += hash;
        
        console.log('SPA Redirect:', { from: l.href, to: newUrl });
        l.replace(newUrl);
      }
      
      function getRedirectAttempts() {
        try {
          var stored = sessionStorage.getItem('sgex:redirect:attempts');
          var attempts = stored ? JSON.parse(stored) : [];
          
          // Clean old attempts (older than 30 seconds)
          var now = Date.now();
          return attempts.filter(function(attempt) {
            return now - attempt.timestamp < 30000;
          });
        } catch (error) {
          return [];
        }
      }
      
      function recordRedirectAttempt(path) {
        try {
          var attempts = getRedirectAttempts();
          attempts.push({
            path: path,
            timestamp: Date.now()
          });
          sessionStorage.setItem('sgex:redirect:attempts', JSON.stringify(attempts));
        } catch (error) {
          console.warn('Could not record redirect attempt:', error);
        }
      }
      
      function showErrorPage(title, message) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-container').style.display = 'block';
        document.title = title + ' - SGEX Workbench';
      }
    })();
  </script>
</body>
</html>
```

### 2. Enhanced routeConfig.js

**Location**: `public/routeConfig.js`

**Purpose**: Dynamic configuration with deployment detection

```javascript
/**
 * SGEX Enhanced Route Configuration Service
 * 
 * Provides dynamic route configuration with:
 * - Automatic deployment type detection
 * - Dynamic component discovery
 * - Context-aware routing
 */

(function() {
  'use strict';
  
  // Global configuration object
  window.SGEX_ROUTES_CONFIG = {
    version: '2.0.0',
    
    // Dynamic deployment type detection
    detectDeploymentType: function() {
      var path = window.location.pathname;
      var hostname = window.location.hostname;
      
      if (hostname.endsWith('.github.io')) {
        if (path === '/sgex/' || path === '/sgex/index.html') {
          return 'landing';
        }
        
        var segments = path.split('/').filter(Boolean);
        if (segments.length >= 2 && segments[0] === 'sgex') {
          return segments[1]; // Return actual branch name
        }
        
        return 'main';
      }
      
      return 'standalone';
    },
    
    // Get base path for current deployment
    getBasePath: function() {
      var deployType = this.detectDeploymentType();
      
      if (window.location.hostname.endsWith('.github.io')) {
        if (deployType === 'landing') {
          return '/sgex/';
        } else {
          return '/sgex/' + deployType + '/';
        }
      }
      
      return '/';
    },
    
    // DAK component definitions
    dakComponents: {
      'dashboard': 'DAKDashboard',
      'testing-viewer': 'TestingViewer',
      'core-data-dictionary-viewer': 'CoreDataDictionaryViewer',
      'health-interventions': 'ComponentEditor',
      'actor-editor': 'ActorEditor',
      'business-process-selection': 'BusinessProcessSelection',
      'bpmn-editor': 'BPMNEditor',
      'bpmn-viewer': 'BPMNViewer',
      'bpmn-source': 'BPMNSource',
      'decision-support-logic': 'DecisionSupportLogicView',
      'questionnaire-editor': 'QuestionnaireEditor',
      'docs': 'DocumentationViewer',
      'pages': 'PagesManager',
      'faq-demo': 'DAKFAQDemo'
    },
    
    // Standard component routes
    standardComponents: {
      'WelcomePage': ['/'],
      'SelectProfilePage': ['/select_profile'],
      'DAKActionSelection': ['/dak-action/:user?'],
      'DAKSelection': ['/dak-selection/:user?'],
      'OrganizationSelection': ['/organization-selection'],
      'DAKConfiguration': ['/dak-configuration'],
      'RepositorySelection': ['/repositories/:user?'],
      'DashboardRedirect': ['/dashboard'],
      'TestDashboard': ['/test-dashboard'],
      'BPMNViewerTestComponent': ['/test-bpmn-viewer'],
      'LandingPageWithFramework': ['/test-framework'],
      'TestDocumentationPage': ['/test-documentation'],
      'AssetEditorTest': ['/test-asset-editor'],
      'BranchListingPage': ['/'],
      'NotFound': ['*']
    },
    
    // Check if component is valid DAK component
    isValidDAKComponent: function(name) {
      return this.dakComponents.hasOwnProperty(name);
    },
    
    // Check if component is valid (DAK or standard)
    isValidComponent: function(name) {
      return this.isValidDAKComponent(name) || this.isValidStandardComponent(name);
    },
    
    // Check if component is valid standard component
    isValidStandardComponent: function(name) {
      // Check against standard component route patterns
      for (var component in this.standardComponents) {
        var routes = this.standardComponents[component];
        for (var i = 0; i < routes.length; i++) {
          if (routes[i].includes(name) || component.toLowerCase().includes(name)) {
            return true;
          }
        }
      }
      return false;
    },
    
    // Get all DAK component names
    getDAKComponentNames: function() {
      return Object.keys(this.dakComponents);
    },
    
    // Generate DAK component routes
    generateDAKRoutes: function() {
      var routes = [];
      var components = this.dakComponents;
      
      for (var routeName in components) {
        routes.push({
          path: '/' + routeName,
          component: components[routeName],
          patterns: [
            '/' + routeName,
            '/' + routeName + '/:user/:repo',
            '/' + routeName + '/:user/:repo/:branch',
            '/' + routeName + '/:user/:repo/:branch/*'
          ]
        });
      }
      
      return routes;
    },
    
    // Get deployed branches (dynamic detection)
    getDeployedBranches: function() {
      // Try to detect from current deployment or configuration
      var deployType = this.detectDeploymentType();
      
      if (deployType === 'landing' || deployType === 'standalone') {
        return ['main'];
      }
      
      // Return current branch + known branches
      return [deployType, 'main'].filter(function(branch, index, array) {
        return array.indexOf(branch) === index; // Remove duplicates
      });
    },
    
    // Check if branch is deployed
    isBranchDeployed: function(branchName) {
      return this.getDeployedBranches().indexOf(branchName) !== -1;
    },
    
    // Restore URL context from session storage
    restoreUrlContext: function() {
      try {
        var stored = sessionStorage.getItem('sgex:routing:context');
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.warn('Could not restore URL context:', error);
        return null;
      }
    },
    
    // Clear stored context
    clearUrlContext: function() {
      try {
        sessionStorage.removeItem('sgex:routing:context');
        sessionStorage.removeItem('sgex:redirect:attempts');
      } catch (error) {
        console.warn('Could not clear URL context:', error);
      }
    }
  };
  
  // Initialize configuration
  window.SGEX_ROUTES_CONFIG.deploymentType = window.SGEX_ROUTES_CONFIG.detectDeploymentType();
  window.SGEX_ROUTES_CONFIG.basePath = window.SGEX_ROUTES_CONFIG.getBasePath();
  
  console.log('SGEX Routes Config v2.0 initialized:', {
    deploymentType: window.SGEX_ROUTES_CONFIG.deploymentType,
    basePath: window.SGEX_ROUTES_CONFIG.basePath,
    components: Object.keys(window.SGEX_ROUTES_CONFIG.dakComponents).length
  });
})();
```

### 3. Enhanced useDAKUrlParams Hook

**Location**: `src/hooks/useDAKUrlParams.js`

**Purpose**: Support context restoration from direct URL entry

```javascript
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import githubService from '../services/githubService';
import dakValidationService from '../services/dakValidationService';

/**
 * Enhanced DAK URL Parameters Hook
 * 
 * Supports:
 * - Context restoration from direct URL entry
 * - Session storage integration
 * - Fallback mechanisms
 * - Error handling
 */
const useDAKUrlParams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, repo, branch } = useParams();
  
  // State management
  const [profile, setProfile] = useState(null);
  const [repository, setRepository] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contextRestored, setContextRestored] = useState(false);

  // Restore context from routing system
  useEffect(() => {
    const restoreContext = () => {
      try {
        // Try to restore from session storage first
        const storedContext = window.SGEX_ROUTES_CONFIG?.restoreUrlContext();
        
        if (storedContext && !contextRestored) {
          console.log('Restoring URL context:', storedContext);
          
          // Restore URL fragments and query parameters
          if (storedContext.hash && !window.location.hash) {
            window.history.replaceState(null, null, window.location.pathname + window.location.search + storedContext.hash);
          }
          
          // Set restored flag
          setContextRestored(true);
          
          // Use context data if available
          if (storedContext.user && storedContext.repo) {
            // Context provides the parameters we need
            fetchDataWithContext(storedContext);
            return;
          }
        }
        
        // Fallback to URL parameters
        if (user && repo) {
          fetchDataFromUrlParams();
        } else {
          // Try location.state as final fallback
          if (location.state?.profile && location.state?.repository) {
            setProfile(location.state.profile);
            setRepository(location.state.repository);
            setSelectedBranch(location.state.selectedBranch || location.state.repository.default_branch);
            setLoading(false);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error restoring context:', error);
        setError('Failed to restore page context');
        setLoading(false);
      }
    };
    
    restoreContext();
  }, [user, repo, branch, location, contextRestored]);

  const fetchDataWithContext = async (context) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use context data to fetch full profile and repository data
      if (githubService.isAuth()) {
        const [userProfile, repoData] = await Promise.all([
          githubService.getUser(context.user),
          githubService.getRepository(context.user, context.repo)
        ]);
        
        setProfile(userProfile);
        setRepository(repoData);
        setSelectedBranch(context.branch || repoData.default_branch);
      } else {
        // Create public profile for unauthenticated access
        const publicProfile = {
          login: context.user,
          name: context.user.charAt(0).toUpperCase() + context.user.slice(1),
          avatar_url: `https://github.com/${context.user}.png`,
          type: 'User'
        };

        const publicRepository = {
          name: context.repo,
          full_name: `${context.user}/${context.repo}`,
          owner: { login: context.user },
          default_branch: context.branch || 'main',
          html_url: `https://github.com/${context.user}/${context.repo}`
        };

        setProfile(publicProfile);
        setRepository(publicRepository);
        setSelectedBranch(context.branch || 'main');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data with context:', error);
      setError('Failed to load DAK data from context');
      setLoading(false);
    }
  };

  const fetchDataFromUrlParams = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!githubService.isAuth()) {
        // Public access
        const publicProfile = {
          login: user,
          name: user.charAt(0).toUpperCase() + user.slice(1),
          avatar_url: `https://github.com/${user}.png`,
          type: 'User'
        };

        const publicRepository = {
          name: repo,
          full_name: `${user}/${repo}`,
          owner: { login: user },
          default_branch: branch || 'main',
          html_url: `https://github.com/${user}/${repo}`
        };

        setProfile(publicProfile);
        setRepository(publicRepository);
        setSelectedBranch(branch || 'main');
        setLoading(false);
        return;
      }

      // Authenticated access
      const [userProfile, repoData] = await Promise.all([
        githubService.getUser(user),
        githubService.getRepository(user, repo)
      ]);

      // Validate DAK repository
      const isValidDAK = await dakValidationService.validateDAKRepository(
        user, 
        repo, 
        branch || repoData.default_branch
      );
      
      if (!isValidDAK) {
        navigate('/', { 
          state: { 
            warningMessage: `Repository '${user}/${repo}' is not a valid DAK repository.` 
          } 
        });
        return;
      }

      // Validate branch
      let validBranch = branch;
      if (branch) {
        try {
          await githubService.getBranch(user, repo, branch);
        } catch (err) {
          console.warn(`Branch '${branch}' not found, using default branch`);
          validBranch = repoData.default_branch;
        }
      } else {
        validBranch = repoData.default_branch;
      }

      setProfile(userProfile);
      setRepository(repoData);
      setSelectedBranch(validBranch);
      setLoading(false);

    } catch (error) {
      console.error('Error fetching data from URL params:', error);
      
      if (error.status === 404) {
        navigate('/', { 
          state: { 
            warningMessage: `Could not access '${user}/${repo}'. Repository may not exist or may be private.` 
          } 
        });
      } else {
        setError('Failed to load DAK data. Please check the URL or try again.');
      }
      
      setLoading(false);
    }
  };

  return {
    profile,
    repository,
    selectedBranch,
    loading,
    error,
    user: user || profile?.login,
    repo: repo || repository?.name,
    branch: branch || selectedBranch,
    navigate,
    contextRestored
  };
};

export default useDAKUrlParams;
```

### 4. Enhanced App.js

**Location**: `src/App.js`

**Purpose**: Support context restoration and enhanced routing

```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import './i18n';
import { generateLazyRoutes } from './utils/lazyRouteUtils';
import { initializeTheme } from './utils/themeManager';
import logger from './utils/logger';

function App() {
  const appLogger = logger.getLogger('App');
  const [routingContext, setRoutingContext] = useState(null);
  const [basePath, setBasePath] = useState('/sgex');
  
  useEffect(() => {
    appLogger.componentMount();
    
    // Initialize routing context
    const initializeRouting = () => {
      try {
        // Determine base path from deployment
        const configBasePath = window.SGEX_ROUTES_CONFIG?.getBasePath() || '/sgex/';
        const envBasePath = process.env.PUBLIC_URL || configBasePath.slice(0, -1); // Remove trailing slash
        
        setBasePath(envBasePath);
        
        // Restore any routing context
        const context = window.SGEX_ROUTES_CONFIG?.restoreUrlContext();
        if (context) {
          setRoutingContext(context);
          appLogger.info('Routing context restored', context);
        }
        
        appLogger.info('SGEX application initialized', {
          environment: process.env.NODE_ENV,
          basePath: envBasePath,
          deploymentType: window.SGEX_ROUTES_CONFIG?.deploymentType,
          hasContext: !!context
        });
        
      } catch (error) {
        appLogger.error('Error initializing routing:', error);
        // Fallback to default values
        setBasePath(process.env.PUBLIC_URL || '/sgex');
      }
    };
    
    // Initialize theme
    const appliedTheme = initializeTheme();
    appLogger.info('Theme initialized', { theme: appliedTheme });
    
    // Initialize routing (wait for DOM to be ready)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeRouting);
    } else {
      initializeRouting();
    }
    
    return () => {
      appLogger.componentUnmount();
      document.removeEventListener('DOMContentLoaded', initializeRouting);
    };
  }, [appLogger]);

  // Generate routes with context awareness
  const routes = generateLazyRoutes(routingContext);

  return (
    <Router basename={basePath}>
      <div className="App">
        <Routes>
          {routes}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## Testing Implementation

### 1. Unit Tests for Routing Functions

**Location**: `src/tests/routing/routingUtils.test.js`

```javascript
import { extractUrlContext, isValidDeploymentUrl, generateRoutePatterns } from '../../utils/routingUtils';

describe('Enhanced Routing Utils', () => {
  describe('extractUrlContext', () => {
    test('extracts DAK component context correctly', () => {
      const segments = ['sgex', 'main', 'dashboard', 'litlfred', 'smart-ips'];
      const context = extractUrlContext(segments, '?debug=true', '#components', '/sgex/main/');
      
      expect(context).toEqual({
        basePath: '/sgex/main/',
        component: 'dashboard',
        user: 'litlfred',
        repo: 'smart-ips',
        branch: null,
        searchParams: '?debug=true',
        hash: '#components'
      });
    });
    
    test('handles branch in URL correctly', () => {
      const segments = ['sgex', 'main', 'dashboard', 'litlfred', 'smart-ips', 'feature-branch'];
      const context = extractUrlContext(segments, '', '', '/sgex/main/');
      
      expect(context.branch).toBe('feature-branch');
    });
    
    test('handles standalone deployment', () => {
      const segments = ['dashboard', 'litlfred', 'smart-ips'];
      const context = extractUrlContext(segments, '', '', '/');
      
      expect(context.basePath).toBe('/');
      expect(context.component).toBe('dashboard');
    });
  });
  
  describe('isValidDeploymentUrl', () => {
    test('validates GitHub Pages URLs', () => {
      expect(isValidDeploymentUrl('/sgex/', 'litlfred.github.io')).toBe(true);
      expect(isValidDeploymentUrl('/sgex/main/', 'litlfred.github.io')).toBe(true);
      expect(isValidDeploymentUrl('/invalid/', 'litlfred.github.io')).toBe(false);
    });
    
    test('validates standalone URLs', () => {
      expect(isValidDeploymentUrl('/', 'localhost')).toBe(true);
      expect(isValidDeploymentUrl('/dashboard/', 'localhost')).toBe(true);
    });
  });
});
```

### 2. Integration Tests

**Location**: `src/tests/routing/routingIntegration.test.js`

```javascript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

// Mock the routing configuration
beforeEach(() => {
  window.SGEX_ROUTES_CONFIG = {
    detectDeploymentType: () => 'main',
    getBasePath: () => '/sgex/main/',
    restoreUrlContext: () => null,
    isValidDAKComponent: (name) => ['dashboard', 'docs'].includes(name)
  };
});

describe('Routing Integration', () => {
  test('handles direct URL entry to dashboard', () => {
    // Simulate direct navigation to dashboard URL
    render(
      <MemoryRouter initialEntries={['/dashboard/litlfred/smart-ips/main']}>
        <App />
      </MemoryRouter>
    );
    
    // Should eventually render the dashboard component
    // (This would need to be adjusted based on actual component behavior)
  });
  
  test('preserves URL fragments during routing', () => {
    const mockContext = {
      component: 'dashboard',
      user: 'litlfred',
      repo: 'smart-ips',
      hash: '#components'
    };
    
    window.SGEX_ROUTES_CONFIG.restoreUrlContext = () => mockContext;
    
    render(
      <MemoryRouter initialEntries={['/dashboard/litlfred/smart-ips']}>
        <App />
      </MemoryRouter>
    );
    
    // Verify that hash fragment is restored
    // This would need component-specific verification
  });
});
```

## Deployment Checklist

### Pre-Deployment Verification

1. **Configuration Testing**
   - [ ] Test routeConfig.js deployment detection
   - [ ] Test component discovery
   - [ ] Test context restoration

2. **404.html Testing**  
   - [ ] Test redirect loop prevention
   - [ ] Test URL pattern recognition
   - [ ] Test context extraction

3. **React App Testing**
   - [ ] Test direct URL entry
   - [ ] Test navigation preservation
   - [ ] Test fallback mechanisms

### Deployment Steps

1. **Update Configuration Files**
   - Deploy enhanced routeConfig.js
   - Deploy new 404.html
   - Update any hardcoded configurations

2. **Deploy React Application**
   - Deploy enhanced App.js
   - Deploy enhanced useDAKUrlParams hook
   - Deploy updated components

3. **Verify Deployment**
   - Test all URL patterns
   - Test all deployment scenarios
   - Monitor error rates

### Post-Deployment Monitoring

1. **Error Monitoring**
   - Monitor 404 errors
   - Monitor redirect loops
   - Monitor context restoration failures

2. **Performance Monitoring**
   - Monitor routing resolution time
   - Monitor page load times
   - Monitor redirect chain length

3. **User Experience Monitoring**
   - Monitor direct URL entry success rate
   - Monitor navigation flow completion
   - Monitor bookmark functionality

## Migration Notes

### Backward Compatibility

- Old URL patterns will continue to work through redirect mechanisms
- Existing session storage keys are preserved during transition
- Gradual migration approach minimizes user impact

### Breaking Changes

- None - all changes are backward compatible
- Enhanced functionality is additive
- Fallback mechanisms preserve existing behavior

### Rollback Plan

- Keep previous 404.html as 404-legacy.html
- Feature flags can disable new routing logic
- Database/storage changes are minimal and reversible

This implementation guide provides the detailed technical specifications needed to implement the proposed routing solution while maintaining reliability and backward compatibility.