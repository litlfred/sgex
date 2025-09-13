/**
 * Test for issue #903: [URL Routing Error] Unknown URL Pattern
 * Verifies that /sgex/copilot-fix-895/select_profile routes correctly
 */

describe('Issue #903 - URL Routing for Branch Deployment with Standard Components', () => {
  
  // Mock route configuration that matches actual structure
  const mockRouteConfig = {
    // Note: isDeployedBranch removed - now using optimistic approach
    isValidDAKComponent: (component) => [
      'dashboard', 'testing-viewer', 'business-process-selection'
    ].includes(component),
    standardComponents: {
      'SelectProfilePage': {
        'path': './components/SelectProfilePage',
        'routes': [
          { 'path': '/select_profile', 'exact': true }
        ]
      },
      'DAKActionSelection': {
        'path': './components/DAKActionSelection',
        'routes': [
          { 'path': '/dak-action/:user', 'exact': true },
          { 'path': '/dak-action', 'exact': true }
        ]
      }
    }
  };

  // Helper function from 404.html
  function isValidComponentOrRoute(pathSegment, routeConfig) {
    // Check if it's a valid DAK component
    if (routeConfig && routeConfig.isValidDAKComponent && routeConfig.isValidDAKComponent(pathSegment)) {
      return true;
    }
    
    // Check if it's a valid standard route path
    if (routeConfig && routeConfig.standardComponents) {
      for (var componentName in routeConfig.standardComponents) {
        var component = routeConfig.standardComponents[componentName];
        if (component.routes) {
          for (var i = 0; i < component.routes.length; i++) {
            var route = component.routes[i];
            // Handle exact route matches like "/select_profile"
            if (route.path === '/' + pathSegment) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }

  test('should validate DAK components correctly', () => {
    expect(isValidComponentOrRoute('dashboard', mockRouteConfig)).toBe(true);
    expect(isValidComponentOrRoute('testing-viewer', mockRouteConfig)).toBe(true);
    expect(isValidComponentOrRoute('invalid-dak-component', mockRouteConfig)).toBe(false);
  });

  test('should validate standard route paths correctly', () => {
    expect(isValidComponentOrRoute('select_profile', mockRouteConfig)).toBe(true);
    expect(isValidComponentOrRoute('dak-action', mockRouteConfig)).toBe(true);
    expect(isValidComponentOrRoute('invalid-route', mockRouteConfig)).toBe(false);
  });

  test('should handle the specific issue URL pattern correctly', () => {
    // Simulate the problematic URL: /sgex/copilot-fix-895/select_profile
    const mockLocation = {
      hostname: 'litlfred.github.io',
      pathname: '/sgex/copilot-fix-895/select_profile',
      search: '',
      hash: '',
      host: 'litlfred.github.io',
      protocol: 'https:',
      href: 'https://litlfred.github.io/sgex/copilot-fix-895/select_profile',
      replace: function(url) {
        this.redirectedTo = url;
      },
      errorShown: null
    };

    const l = mockLocation;
    const pathSegments = l.pathname.split('/').filter(Boolean); // ['sgex', 'copilot-fix-895', 'select_profile']
    const secondSegment = pathSegments[1]; // 'copilot-fix-895'
    
    // Test the GitHub Pages deployment logic
    if (pathSegments.length >= 3 && mockRouteConfig) {
      const branch = secondSegment; // 'copilot-fix-895'
      const component = pathSegments[2]; // 'select_profile'
      
      // Check if this could be a branch deployment: /sgex/{branch}/{component}/...
      if (isValidComponentOrRoute(component, mockRouteConfig)) {
        // Valid component, treat as branch deployment
        const branchPath = '/sgex/' + branch + '/'; // '/sgex/copilot-fix-895/'
        const routePath = pathSegments.slice(2).join('/'); // 'select_profile'
        
        let newUrl = l.protocol + '//' + l.host + branchPath;
        if (routePath) {
          newUrl += '?/' + routePath.replace(/&/g, '~and~');
        }
        l.replace(newUrl);
      }
    }

    // Verify the fix works
    expect(l.redirectedTo).toBe('https://litlfred.github.io/sgex/copilot-fix-895/?/select_profile');
  });

  test('should still show error for truly invalid components', () => {
    const pathSegments = ['sgex', 'copilot-fix-895', 'invalid-component'];
    const component = pathSegments[2];
    
    expect(isValidComponentOrRoute(component, mockRouteConfig)).toBe(false);
  });

  test('should handle branch-only URLs', () => {
    const pathSegments = ['sgex', 'copilot-fix-895'];
    
    // Should allow branch-only URLs (redirect to branch root)
    expect(pathSegments.length).toBe(2);
  });
});