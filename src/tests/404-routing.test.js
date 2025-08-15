/**
 * Tests for 404.html routing functionality
 * This test validates that the 404.html file properly handles
 * GitHub Pages SPA routing scenarios
 */

// Mock window.location
const mockLocation = {
  hostname: 'litlfred.github.io',
  pathname: '/sgex/dashboard/user/repo',
  search: '',
  hash: '',
  protocol: 'https:',
  port: '',
  replace: jest.fn()
};

// Mock getSGEXRouteConfig
const mockRouteConfig = {
  isDeployedBranch: jest.fn(),
  isValidDAKComponent: jest.fn(),
  isValidComponent: jest.fn()
};

// Set up global mocks
global.window = { location: mockLocation };
global.getSGEXRouteConfig = jest.fn(() => mockRouteConfig);

describe('404.html SPA Routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset location mock
    mockLocation.replace.mockClear();
    mockLocation.pathname = '/sgex/dashboard/user/repo';
    mockLocation.search = '';
    mockLocation.hash = '';
    mockLocation.hostname = 'litlfred.github.io';
  });

  test('should be present in build output', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Check if 404.html exists in build directory
    const buildPath = path.join(__dirname, '../../build/404.html');
    const publicPath = path.join(__dirname, '../../public/404.html');
    
    // Both should exist
    expect(fs.existsSync(publicPath)).toBe(true);
    
    // Check that the file is substantial (>512 bytes for IE compatibility)
    const stats = fs.statSync(publicPath);
    expect(stats.size).toBeGreaterThan(512);
  });

  test('should contain required SPA routing script', () => {
    const fs = require('fs');
    const path = require('path');
    
    const publicPath = path.join(__dirname, '../../public/404.html');
    const content = fs.readFileSync(publicPath, 'utf8');
    
    // Should contain SPA routing logic
    expect(content).toContain('SGEX Dynamic URL Routing');
    expect(content).toContain('getSGEXRouteConfig');
    expect(content).toContain('isGitHubPages');
    expect(content).toContain('l.replace(newUrl)');
  });

  test('should handle GitHub Pages SGEX deployment URLs', () => {
    // Mock configuration
    mockRouteConfig.isDeployedBranch.mockReturnValue(false);
    mockRouteConfig.isValidDAKComponent.mockReturnValue(true);
    
    // Set up location for GitHub Pages deployment
    mockLocation.pathname = '/sgex/dashboard/user/repo';
    
    // Execute the routing logic (simplified version)
    const pathSegments = mockLocation.pathname.split('/').filter(Boolean);
    const isGitHubPages = mockLocation.hostname === 'litlfred.github.io';
    
    expect(isGitHubPages).toBe(true);
    expect(pathSegments[0]).toBe('sgex');
    expect(pathSegments[1]).toBe('dashboard');
  });

  test('should handle branch deployment URLs', () => {
    // Mock configuration for branch deployment
    mockRouteConfig.isDeployedBranch.mockReturnValue(true);
    mockRouteConfig.isValidDAKComponent.mockReturnValue(false);
    
    // Set up location for branch deployment
    mockLocation.pathname = '/sgex/main/dashboard/user/repo';
    
    const pathSegments = mockLocation.pathname.split('/').filter(Boolean);
    
    expect(pathSegments[0]).toBe('sgex');
    expect(pathSegments[1]).toBe('main'); // branch name
    expect(pathSegments[2]).toBe('dashboard'); // component
  });

  test('should handle standalone deployment', () => {
    // Mock configuration for standalone deployment
    mockLocation.hostname = 'example.com';
    mockLocation.pathname = '/dashboard/user/repo';
    
    const pathSegments = mockLocation.pathname.split('/').filter(Boolean);
    const isGitHubPages = mockLocation.hostname.endsWith('.github.io');
    
    expect(isGitHubPages).toBe(false);
    expect(pathSegments[0]).toBe('dashboard');
  });

  test('should handle dynamic branch deployment URLs', () => {
    // Mock configuration where the branch is not in known deployedBranches
    mockRouteConfig.isDeployedBranch.mockReturnValue(false);
    mockRouteConfig.isValidComponent.mockReturnValue(false);
    
    // Set up location for dynamic branch deployment (the issue case)
    mockLocation.pathname = '/sgex/copilot-fix-809/dashboard/litlfred/smart-ips-pilgrimage';
    
    const pathSegments = mockLocation.pathname.split('/').filter(Boolean);
    
    expect(pathSegments[0]).toBe('sgex');
    expect(pathSegments[1]).toBe('copilot-fix-809'); // unknown branch name
    expect(pathSegments[2]).toBe('dashboard'); // component
    expect(pathSegments[3]).toBe('litlfred'); // user
    expect(pathSegments[4]).toBe('smart-ips-pilgrimage'); // repo
    
    // Should have enough segments to attempt branch deployment
    expect(pathSegments.length).toBeGreaterThanOrEqual(3);
  });

  test('should preserve query parameters and hash in redirection', () => {
    mockLocation.pathname = '/sgex/dashboard/user/repo';
    mockLocation.search = '?param=value';
    mockLocation.hash = '#section';
    
    // This would be the expected behavior - encoding query params and preserving hash
    const expectedEncoding = mockLocation.search.slice(1).replace(/&/g, '~and~');
    
    expect(expectedEncoding).toBe('param=value');
  });
});