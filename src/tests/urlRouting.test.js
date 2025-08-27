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
    
    // Original logic (before fix)
    if (routeConfig && routeConfig.isDeployedBranch && routeConfig.isDeployedBranch(secondSegment)) {
      return { type: 'branch-deployment', branch: secondSegment };
    } else if (routeConfig && routeConfig.isValidComponent && routeConfig.isValidComponent(secondSegment)) {
      return { type: 'component-first' };
    } else if (pathSegments.length === 3 && pathSegments[2] === 'index.html') {
      return { type: 'branch-index-redirect' };
    } else {
      // This is where the error occurs in the original code
      return { error: 'unknown-pattern' };
    }
  }

  // Fixed routing logic
  function fixedRouteLogic(pathname, routeConfig) {
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // Simulate the GitHub Pages routing logic
    if (pathSegments.length === 0 || pathSegments[0] !== 'sgex') {
      return { error: 'invalid-base-path' };
    }

    if (pathSegments.length === 1) {
      return { redirect: '/sgex/', type: 'root-redirect' };
    }

    const secondSegment = pathSegments[1];
    
    // Check if second segment is a deployed branch
    if (routeConfig && routeConfig.isDeployedBranch && routeConfig.isDeployedBranch(secondSegment)) {
      return { type: 'branch-deployment', branch: secondSegment };
    } else if (routeConfig && routeConfig.isValidComponent && routeConfig.isValidComponent(secondSegment)) {
      return { type: 'component-first' };
    } else if (pathSegments.length === 3 && pathSegments[2] === 'index.html') {
      return { type: 'branch-index-redirect' };
    } else {
      // FIX: Handle unknown branch-only URLs by redirecting to branch root
      if (pathSegments.length === 2) {
        // Just /sgex/:unknown-branch/ - redirect to branch root
        return { type: 'branch-root-redirect', branch: secondSegment, redirect: `/sgex/${secondSegment}/` };
      }
      
      // FIX: Before showing error, check if this could be a branch-first pattern
      // If we have at least 3 segments and the third segment is a valid component,
      // treat the second segment as a branch name regardless of deployed status
      if (pathSegments.length >= 3 && 
          routeConfig && 
          routeConfig.isValidComponent && 
          routeConfig.isValidComponent(pathSegments[2])) {
        return { type: 'branch-deployment', branch: secondSegment, component: pathSegments[2] };
      }
      
      // Only show error for truly unrecognized patterns
      return { error: 'unknown-pattern' };
    }
  }

  const mockRouteConfig = {
    isDeployedBranch: (branch) => branch === 'main',
    isValidComponent: (component) => ['dashboard', 'testing-viewer', 'business-process-selection'].includes(component)
  };

  describe('Original behavior (before fix)', () => {
    test('should handle known deployed branch correctly', () => {
      const result = mockRouteLogic('/sgex/main/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.type).toBe('branch-deployment');
      expect(result.branch).toBe('main');
    });

    test('should handle component-first pattern correctly', () => {
      const result = mockRouteLogic('/sgex/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.type).toBe('component-first');
    });

    test('should show error for unknown branch (the bug)', () => {
      const result = mockRouteLogic('/sgex/copilot-fix-809/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.error).toBe('unknown-pattern');
    });
  });

  describe('Fixed behavior (after fix)', () => {
    test('should handle known deployed branch correctly', () => {
      const result = fixedRouteLogic('/sgex/main/dashboard/litlfred/smart-ips-pilgrimage', mockRouteConfig);
      expect(result.type).toBe('branch-deployment');
      expect(result.branch).toBe('main');
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

    test('should handle 2-segment unknown branch URL with redirect (updated for fix)', () => {
      const result = fixedRouteLogic('/sgex/unknown-branch', mockRouteConfig);
      expect(result.type).toBe('branch-root-redirect');
      expect(result.branch).toBe('unknown-branch');
    });

    test('should handle unknown branch-only URL by redirecting to branch root (issue #846)', () => {
      const result = fixedRouteLogic('/sgex/copilot-fix-839/', mockRouteConfig);
      expect(result.type).toBe('branch-root-redirect');
      expect(result.branch).toBe('copilot-fix-839');
      expect(result.redirect).toBe('/sgex/copilot-fix-839/');
    });
  });
});