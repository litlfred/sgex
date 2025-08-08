/**
 * Tests for Content Security Policy (CSP) configuration
 * Verifies that CSP allows scripts from branch deployment subpaths
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Content Security Policy Configuration', () => {
  let htmlContent;

  beforeAll(() => {
    // Read the HTML template file
    const htmlPath = join(__dirname, '../../public/index.html');
    htmlContent = readFileSync(htmlPath, 'utf8');
  });

  test('CSP allows scripts from main domain for branch deployments', () => {
    // Extract CSP content
    const cspMatch = htmlContent.match(/Content-Security-Policy[^>]*content="([^"]*)/);
    expect(cspMatch).toBeTruthy();
    
    const cspContent = cspMatch[1];
    
    // Verify script-src allows the main domain (not just specific path)
    expect(cspContent).toContain('script-src');
    expect(cspContent).toContain('https://litlfred.github.io');
    
    // Should NOT contain the restrictive /sgex path anymore
    expect(cspContent).not.toContain('https://litlfred.github.io/sgex');
  });

  test('CSP maintains security while supporting branch deployments', () => {
    const cspMatch = htmlContent.match(/Content-Security-Policy[^>]*content="([^"]*)/);
    const cspContent = cspMatch[1];
    
    // Verify essential security directives are present
    expect(cspContent).toContain("default-src 'self'");
    expect(cspContent).toContain("object-src 'none'");
    expect(cspContent).toContain("frame-src 'none'");
    expect(cspContent).toContain("child-src 'none'");
    
    // Verify required external domains
    expect(cspContent).toContain('https://unpkg.com');
    expect(cspContent).toContain('https://api.github.com');
  });

  test('X-Frame-Options meta tag is removed', () => {
    // X-Frame-Options should not be present in meta tags
    expect(htmlContent).not.toMatch(/<meta[^>]*X-Frame-Options[^>]*>/i);
    expect(htmlContent).not.toContain('X-Frame-Options');
  });

  test('Other security headers remain intact', () => {
    // Verify other security meta tags are still present
    expect(htmlContent).toContain('X-Content-Type-Options');
    expect(htmlContent).toContain('Permissions-Policy');
    expect(htmlContent).toContain('referrer');
  });
});