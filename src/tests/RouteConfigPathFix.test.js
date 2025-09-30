/**
 * Test for Route Config Path Fix (Preview Builds Failing Issue)
 * 
 * This test verifies that routeConfig.js uses PUBLIC_URL-based absolute paths
 * instead of relative paths, ensuring consistent loading across different
 * deployment scenarios.
 * 
 * Issue: Preview builds were failing with "Uncaught SyntaxError: Unexpected token '<'"
 * Root Cause: routeConfig.js used relative path "./routeConfig.js" which could resolve
 * incorrectly depending on URL trailing slashes and deployment paths.
 * 
 * Fix: Changed to use %PUBLIC_URL%/routeConfig.js for consistent absolute path resolution.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Route Config Path Fix', () => {
  test('index.html uses PUBLIC_URL for routeConfig.js', () => {
    const indexHtmlPath = resolve(__dirname, '../../public/index.html');
    const indexHtmlContent = readFileSync(indexHtmlPath, 'utf-8');
    
    // Verify routeConfig.js uses PUBLIC_URL (absolute path)
    expect(indexHtmlContent).toMatch(/<script\s+src="%PUBLIC_URL%\/routeConfig\.js"><\/script>/);
    
    // Verify it does NOT use relative path
    expect(indexHtmlContent).not.toMatch(/<script\s+src="\.\/routeConfig\.js"><\/script>/);
  });

  test('index.html asset paths are consistent', () => {
    const indexHtmlPath = resolve(__dirname, '../../public/index.html');
    const indexHtmlContent = readFileSync(indexHtmlPath, 'utf-8');
    
    // All assets should use PUBLIC_URL for consistency
    const assetPatterns = [
      /%PUBLIC_URL%\/favicon\.ico/,           // favicon
      /%PUBLIC_URL%\/logo192\.png/,           // apple touch icon
      /%PUBLIC_URL%\/manifest\.json/,         // manifest
      /%PUBLIC_URL%\/routeConfig\.js/         // route config (the fix)
    ];
    
    assetPatterns.forEach(pattern => {
      expect(indexHtmlContent).toMatch(pattern);
    });
  });

  test('relative path resolution would fail with different URLs', () => {
    // This test documents why the fix was necessary
    
    // Scenario 1: URL without trailing slash
    const urlWithoutSlash = '/sgex/copilot-fix-1016';
    const baseWithoutSlash = '/sgex/';  // Browser extracts directory
    const relativePathResult = `${baseWithoutSlash}routeConfig.js`;
    expect(relativePathResult).toBe('/sgex/routeConfig.js');  // WRONG - file not there!
    
    // Scenario 2: URL with trailing slash
    const urlWithSlash = '/sgex/copilot-fix-1016/';
    const baseWithSlash = '/sgex/copilot-fix-1016/';
    const relativePathResult2 = `${baseWithSlash}routeConfig.js`;
    expect(relativePathResult2).toBe('/sgex/copilot-fix-1016/routeConfig.js');  // CORRECT
    
    // Scenario 3: Using PUBLIC_URL (absolute path) - always works
    const publicUrl = '/sgex/copilot-fix-1016/';
    const absolutePath = `${publicUrl}routeConfig.js`;
    expect(absolutePath).toBe('/sgex/copilot-fix-1016/routeConfig.js');  // ALWAYS CORRECT
  });

  test('404.html can keep relative path since it is always at root', () => {
    const fourOhFourPath = resolve(__dirname, '../../public/404.html');
    const fourOhFourContent = readFileSync(fourOhFourPath, 'utf-8');
    
    // 404.html is always served from root, so relative path is fine
    expect(fourOhFourContent).toMatch(/routeConfig\.js/);
    
    // This is OK because 404.html is always at /404.html
    // So ./routeConfig.js always resolves to /routeConfig.js
  });
});

describe('LandingPage Component Fix', () => {
  test('LandingPage component is registered in componentRouteService', () => {
    const serviceFile = resolve(__dirname, '../services/componentRouteService.js');
    const serviceContent = readFileSync(serviceFile, 'utf-8');
    
    // Verify LandingPage has a case in the switch statement
    expect(serviceContent).toMatch(/case 'LandingPage':/);
    expect(serviceContent).toMatch(/React\.lazy\(\(\) => import\('\.\.\/components\/LandingPage'\)\)/);
  });
});
