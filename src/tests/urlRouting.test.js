/**
 * URL Routing Test for 404.html Branch Validation Fix
 * Tests the fix for issue #815: treating unknown branch names as valid
 */

describe('URL Routing - Branch Validation', () => {
  // Mock the routing logic from 404.html for testing
  function mockRouteLogic(pathname, routeConfig) {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // Simulate the GitHub Pages routing logic
    if (pathSegments.length === 0 || pathSegments[0] !== 'sgex') {
      return { error: 'invalid-base-path' };
    }

    if (pathSegments.length === 1) {
      return { redirect: '/sgex/', type: 'root-redirect' };
    }

    const secondSegment = pathSegments[1];
    
    // NEW OPTIMISTIC LOGIC: Always try branch deployment first, no hardcoded list check
    if (pathSegments.length >= 3 && 
        routeConfig && 
        routeConfig.isValidComponent && 
        routeConfig.isValidComponent(pathSegments[2])) {
      // Optimistically assume this is a branch deployment
      return { type: 'branch-deployment', branch: secondSegment, component: pathSegments[2] };
    } else if (routeConfig && routeConfig.isValidComponent && routeConfig.isValidComponent(secondSegment)) {
      return { type: 'component-first' };
    } else if (pathSegments.length === 3 && pathSegments[2] === 'index.html') {
      return { type: 'branch-index-redirect' };
    } else if (pathSegments.length === 2) {
      // Just /sgex/:branch/ - assume branch exists and try to route to it
      return { type: 'branch-root-redirect', branch: secondSegment, redirect: `/sgex/${secondSegment}/` };
    } else {
      return { error: 'unknown-pattern' };
    }
  }

  // Fixed routing logic (now this is the main logic since we implemented optimistic routing)
  function fixedRouteLogic(pathname, routeConfig) {
    // This is now the same as mockRouteLogic since we implemented the optimistic approach
    return mockRouteLogic(pathname, routeConfig);
  }

  const mockRouteConfig = {
    // Note: isDeployedBranch function removed - we now use optimistic approach
    isValidComponent: (component) => ['dashboard', 'testing-viewer', 'business-process-selection'].includes(component)
  };

  describe('Current optimistic behavior (implemented)', () => {
    test('should handle known branch correctly', () => {
      const result = mockRouteLogic('/sgex/main/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.type).toBe('branch-deployment');
      expect(result.branch).toBe('main');
      expect(result.component).toBe('dashboard');
    });

    test('should handle component-first pattern correctly', () => {
      const result = mockRouteLogic('/sgex/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.type).toBe('component-first');
    });

    test('should optimistically handle unknown branch (the fix)', () => {
      const result = mockRouteLogic('/sgex/copilot-fix-809/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.type).toBe('branch-deployment');
      expect(result.branch).toBe('copilot-fix-809');
      expect(result.component).toBe('dashboard');
    });

    test('should handle branch-only URLs optimistically', () => {
      const result = mockRouteLogic('/sgex/copilot-fix-915/', mockRouteConfig);
      expect(result.type).toBe('branch-root-redirect');
      expect(result.branch).toBe('copilot-fix-915');
    });
  });

  describe('Fixed behavior (now implemented)', () => {
    test('should handle any branch correctly (optimistic)', () => {
      const result = fixedRouteLogic('/sgex/main/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.type).toBe('branch-deployment');
      expect(result.branch).toBe('main');
      expect(result.component).toBe('dashboard');
    });

    test('should handle component-first pattern correctly', () => {
      const result = fixedRouteLogic('/sgex/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.type).toBe('component-first');
    });

    test('should treat unknown branch as valid if followed by valid component (the fix)', () => {
      const result = fixedRouteLogic('/sgex/copilot-fix-809/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.type).toBe('branch-deployment');
      expect(result.branch).toBe('copilot-fix-809');
      expect(result.component).toBe('dashboard');
    });

    test('should handle other unknown branch names correctly', () => {
      const result = fixedRouteLogic('/sgex/feature-branch/testing-viewer/user/repo', mockRouteConfig);
      expect(result.type).toBe('branch-deployment');
      expect(result.branch).toBe('feature-branch');
      expect(result.component).toBe('testing-viewer');
    });

    test('should still show error for truly invalid patterns', () => {
      const result = fixedRouteLogic('/sgex/invalid-branch/invalid-component/user/repo', mockRouteConfig);
      expect(result.error).toBe('unknown-pattern');
    });

    test('should handle 2-segment unknown branch URL by trying to route to branch (updated for fix)', () => {
      const result = fixedRouteLogic('/sgex/unknown-branch', mockRouteConfig);
      expect(result.type).toBe('branch-root-redirect');
      expect(result.branch).toBe('unknown-branch');
      expect(result.redirect).toBe('/sgex/unknown-branch/');
    });

    test('should handle unknown branch-only URL by trying to route to branch first (issue #877)', () => {
      const result = fixedRouteLogic('/sgex/copilot-fix-839/', mockRouteConfig);
      expect(result.type).toBe('branch-root-redirect');
      expect(result.branch).toBe('copilot-fix-839');
      expect(result.redirect).toBe('/sgex/copilot-fix-839/');
    });
  });
});