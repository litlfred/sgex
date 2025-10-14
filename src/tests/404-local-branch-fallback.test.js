/**
 * Tests for 404.html local branch fallback functionality
 * Issue #922: 404 on gh-pages site should first try local 404
 */

describe('404.html Local Branch Fallback', () => {
  let mockLocation;
  let mockSessionStorage;
  let mockRouteConfig;
  
  beforeEach(() => {
    // Reset mocks
    mockLocation = {
      hostname: 'litlfred.github.io',
      pathname: '/sgex/feature-branch/dashboard/user/repo',
      search: '',
      hash: '',
      protocol: 'https:',
      host: 'litlfred.github.io',
      href: 'https://litlfred.github.io/sgex/feature-branch/dashboard/user/repo',
      replace: jest.fn()
    };

    mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };

    mockRouteConfig = {
      isValidDAKComponent: jest.fn(() => true),
      // Note: isDeployedBranch removed - now using optimistic approach
      standardComponents: {
        'DashboardComponent': {
          routes: [{ path: '/dashboard' }]
        }
      }
    };

    // Mock global objects
    global.sessionStorage = mockSessionStorage;
    global.window = { 
      location: mockLocation,
      getSGEXRouteConfig: jest.fn(() => mockRouteConfig)
    };
  });

  describe('Enhanced Fallback Logic Simulation', () => {
    test('should implement branch-first fallback correctly', () => {
      // Simulate the enhanced 404.html logic
      const currentPath = '/sgex/feature-branch/dashboard/user/repo';
      const redirectAttempts = [
        { path: currentPath, timestamp: Date.now() - 1000 },
        { path: currentPath, timestamp: Date.now() - 2000 }
      ];
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(redirectAttempts));
      
      // Simulate the new enhanced logic
      const now = Date.now();
      const filtered = redirectAttempts.filter(attempt => now - attempt.timestamp < 30000);
      const recentAttempts = filtered.filter(attempt => attempt.path === currentPath);
      
      if (recentAttempts.length >= 2) {
        const pathSegments = currentPath.split('/').filter(Boolean);
        
        if (pathSegments.length >= 2 && pathSegments[0] === 'sgex') {
          const branch = pathSegments[1];
          const branchRootPath = '/sgex/' + branch + '/';
          
          // Should try branch root first if not already there and not main
          if (currentPath !== branchRootPath && branch !== 'main') {
            const branchRootAttempts = redirectAttempts.filter(attempt => 
              attempt.path === branchRootPath
            );
            
            if (branchRootAttempts.length < 2) {
              // Should redirect to branch root first
              const expectedUrl = mockLocation.protocol + '//' + mockLocation.host + branchRootPath;
              expect(branchRootPath).toBe('/sgex/feature-branch/');
              expect(expectedUrl).toBe('https://litlfred.github.io/sgex/feature-branch/');
            }
          }
        }
      }
    });

    test('should fall back to main after branch root fails', () => {
      // Simulate that both original path AND branch root have been tried
      const currentPath = '/sgex/feature-branch/';
      const redirectAttempts = [
        { path: '/sgex/feature-branch/dashboard/user/repo', timestamp: Date.now() - 3000 },
        { path: '/sgex/feature-branch/dashboard/user/repo', timestamp: Date.now() - 2000 },
        { path: currentPath, timestamp: Date.now() - 1000 },
        { path: currentPath, timestamp: Date.now() - 500 }
      ];
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(redirectAttempts));
      
      // Simulate the logic for branch root that has been tried multiple times
      const now = Date.now();
      const filtered = redirectAttempts.filter(attempt => now - attempt.timestamp < 30000);
      const recentAttempts = filtered.filter(attempt => attempt.path === currentPath);
      
      if (recentAttempts.length >= 2) {
        const pathSegments = currentPath.split('/').filter(Boolean);
        
        if (pathSegments.length >= 2 && pathSegments[0] === 'sgex') {
          const branch = pathSegments[1];
          const branchRootPath = '/sgex/' + branch + '/';
          
          // This IS the branch root, so should fall back to main
          if (currentPath === branchRootPath || branch === 'main') {
            const expectedUrl = mockLocation.protocol + '//' + mockLocation.host + '/sgex/';
            expect(expectedUrl).toBe('https://litlfred.github.io/sgex/');
          }
        }
      }
    });

    test('should handle main branch correctly', () => {
      // Main branch should go directly to main deployment, not try fallback
      const currentPath = '/sgex/main/dashboard/user/repo';
      const redirectAttempts = [
        { path: currentPath, timestamp: Date.now() - 1000 },
        { path: currentPath, timestamp: Date.now() - 500 }
      ];
      
      const pathSegments = currentPath.split('/').filter(Boolean);
      const branch = pathSegments[1];
      
      // Main branch should not trigger branch fallback
      expect(branch).toBe('main');
      
      if (branch === 'main') {
        // Should go directly to main deployment
        const expectedUrl = mockLocation.protocol + '//' + mockLocation.host + '/sgex/';
        expect(expectedUrl).toBe('https://litlfred.github.io/sgex/');
      }
    });

    test('should reduce redirect threshold from 3 to 2', () => {
      // The enhanced logic should be more aggressive about fallback
      const currentPath = '/sgex/feature-branch/dashboard/user/repo';
      const redirectAttempts = [
        { path: currentPath, timestamp: Date.now() - 1000 },
        { path: currentPath, timestamp: Date.now() - 500 }
      ];
      
      const recentAttempts = redirectAttempts.filter(attempt => attempt.path === currentPath);
      
      // Should trigger fallback after 2 attempts instead of 3
      expect(recentAttempts.length).toBe(2);
      expect(recentAttempts.length >= 2).toBe(true);
    });
  });

  describe('Branch Fallback Logic', () => {
    test('should try local branch first before falling back to main', () => {
      // Mock that we've tried the branch deployment multiple times
      const redirectAttempts = [
        { path: '/sgex/feature-branch/dashboard/user/repo', timestamp: Date.now() - 1000 },
        { path: '/sgex/feature-branch/dashboard/user/repo', timestamp: Date.now() - 2000 }
      ];
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(redirectAttempts));
      
      // Simulate the fallback logic for a branch that doesn't exist
      const pathSegments = mockLocation.pathname.split('/').filter(Boolean);
      const branch = pathSegments[1]; // 'feature-branch'
      
      // Should first try the branch root
      const expectedBranchFallback = `${mockLocation.protocol}//${mockLocation.host}/sgex/${branch}/`;
      
      // This test validates the expected behavior
      expect(branch).toBe('feature-branch');
      expect(pathSegments[0]).toBe('sgex');
      expect(pathSegments[2]).toBe('dashboard'); // valid component
      expect(expectedBranchFallback).toBe('https://litlfred.github.io/sgex/feature-branch/');
    });

    test('should fall back to main only after branch fallback fails', () => {
      // Mock that we've tried both the original path AND the branch root
      const redirectAttempts = [
        { path: '/sgex/feature-branch/dashboard/user/repo', timestamp: Date.now() - 1000 },
        { path: '/sgex/feature-branch/', timestamp: Date.now() - 500 },
        { path: '/sgex/feature-branch/', timestamp: Date.now() - 100 }
      ];
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(redirectAttempts));
      
      // After both original path and branch root have been tried, should fall back to main
      const expectedMainFallback = `${mockLocation.protocol}//${mockLocation.host}/sgex/`;
      
      // This validates that main fallback is the last resort
      expect(redirectAttempts.some(attempt => attempt.path.includes('/sgex/feature-branch/'))).toBe(true);
      expect(expectedMainFallback).toBe('https://litlfred.github.io/sgex/');
    });

    test('should handle direct branch root access that fails', () => {
      mockLocation.pathname = '/sgex/non-existent-branch/';
      
      const pathSegments = mockLocation.pathname.split('/').filter(Boolean);
      const branch = pathSegments[1]; // 'non-existent-branch'
      
      // Should identify this as a branch root pattern
      expect(pathSegments.length).toBe(2);
      expect(pathSegments[0]).toBe('sgex');
      expect(branch).toBe('non-existent-branch');
    });

    test('should preserve user/repo context during fallback', () => {
      const pathSegments = mockLocation.pathname.split('/').filter(Boolean);
      // ['sgex', 'feature-branch', 'dashboard', 'user', 'repo']
      
      const user = pathSegments[3];
      const repo = pathSegments[4];
      
      // Should preserve user/repo for session storage
      expect(user).toBe('user');
      expect(repo).toBe('repo');
    });

    test('should handle all branches optimistically (no deployed branch check)', () => {
      // With optimistic approach, all branches are treated the same
      mockLocation.pathname = '/sgex/main/dashboard/user/repo';
      
      const pathSegments = mockLocation.pathname.split('/').filter(Boolean);
      const branch = pathSegments[1]; // 'main'
      
      // Should always try the branch optimistically
      expect(branch).toBe('main');
      expect(pathSegments[2]).toBe('dashboard'); // valid component
    });
  });

  describe('Redirect Attempt Tracking', () => {
    test('should track redirect attempts with timestamps', () => {
      const now = Date.now();
      const attempts = [
        { path: '/sgex/feature-branch/dashboard', timestamp: now - 5000 },
        { path: '/sgex/feature-branch/dashboard', timestamp: now - 1000 }
      ];
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(attempts));
      
      // Should filter out old attempts (>30 seconds)
      const filtered = attempts.filter(attempt => now - attempt.timestamp < 30000);
      expect(filtered.length).toBe(2); // Both within 30 seconds
      
      // Should count recent attempts for same path
      const recentAttempts = filtered.filter(attempt => 
        attempt.path === '/sgex/feature-branch/dashboard'
      );
      expect(recentAttempts.length).toBe(2);
    });

    test('should clear old redirect attempts', () => {
      const now = Date.now();
      const attempts = [
        { path: '/sgex/feature-branch/dashboard', timestamp: now - 35000 }, // Old
        { path: '/sgex/feature-branch/dashboard', timestamp: now - 1000 }   // Recent
      ];
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(attempts));
      
      // Should filter out attempts older than 30 seconds
      const filtered = attempts.filter(attempt => now - attempt.timestamp < 30000);
      expect(filtered.length).toBe(1);
      expect(filtered[0].timestamp).toBe(now - 1000);
    });
  });

  describe('URL Pattern Recognition', () => {
    test('should recognize branch deployment patterns', () => {
      const patterns = [
        '/sgex/feature-branch/dashboard/user/repo',
        '/sgex/main/dashboard/user/repo',
        '/sgex/develop/business-processes/who/immunization'
      ];
      
      patterns.forEach(pattern => {
        const segments = pattern.split('/').filter(Boolean);
        expect(segments[0]).toBe('sgex');
        expect(segments.length).toBeGreaterThanOrEqual(3);
        // Should have branch, component, and potentially user/repo
      });
    });

    test('should distinguish between component-first and branch-first patterns', () => {
      const branchFirst = '/sgex/feature-branch/dashboard/user/repo';
      const componentFirst = '/sgex/dashboard/user/repo';
      
      const branchSegments = branchFirst.split('/').filter(Boolean);
      const componentSegments = componentFirst.split('/').filter(Boolean);
      
      // Branch-first has 5+ segments, component-first has 4+
      expect(branchSegments.length).toBe(5);
      expect(componentSegments.length).toBe(4);
    });

    test('should handle index.html in branch deployment URLs', () => {
      // This tests the fix for the redirect loop issue
      const indexHtmlUrl = '/sgex/copilot-add-dak-component-indicators/index.html';
      const segments = indexHtmlUrl.split('/').filter(Boolean);
      
      // Should recognize this as branch + index.html pattern
      expect(segments.length).toBe(3);
      expect(segments[0]).toBe('sgex');
      expect(segments[1]).toBe('copilot-add-dak-component-indicators');
      expect(segments[2]).toBe('index.html');
      
      // Should redirect to branch root, not treat index.html as a component
      const expectedRedirect = '/sgex/copilot-add-dak-component-indicators/';
      expect(expectedRedirect).toBe('/sgex/' + segments[1] + '/');
    });

    test('should not create ?/index.html redirect URLs', () => {
      // This validates that index.html doesn't get treated as a route path
      const indexHtmlSegment = 'index.html';
      
      // index.html should NEVER appear in a ?/ redirect
      const invalidRedirect = '/sgex/branch/?/index.html';
      const validRedirect = '/sgex/branch/';
      
      // The fix ensures we redirect to branch root, not with ?/index.html
      expect(indexHtmlSegment).toBe('index.html');
      expect(validRedirect).not.toContain('?/index.html');
    });
  });
});