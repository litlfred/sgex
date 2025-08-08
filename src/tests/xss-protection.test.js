/**
 * Test to verify XSS protection is working in components
 */

import { sanitizeMarkdown } from '../utils/securityUtils';

describe('XSS Protection Integration', () => {
  test('sanitizeMarkdown prevents XSS in markdown content', () => {
    const maliciousMarkdown = `
# Title
<script>alert('xss')</script>
[Click me](javascript:alert('xss'))
![Image](javascript:alert('xss'))
`;

    const result = sanitizeMarkdown(maliciousMarkdown);
    
    // Should not contain script tags
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('javascript:');
    
    // Should escape the HTML
    expect(result).toContain('&lt;script&gt;');
    
    // Should have safe content
    expect(result).toContain('<h1>Title</h1>');
    expect(result).toContain('Click me'); // Link text should be preserved
    expect(result).toContain('[Image: Image]'); // Invalid image should be safe text
  });

  test('sanitizeMarkdown allows safe content', () => {
    const safeMarkdown = `
# Safe Title
**Bold text** and *italic text*
[Safe link](https://example.com)
![Safe image](https://example.com/image.jpg)
`;

    const result = sanitizeMarkdown(safeMarkdown);
    
    expect(result).toContain('<h1>Safe Title</h1>');
    expect(result).toContain('<strong>Bold text</strong>');
    expect(result).toContain('<em>italic text</em>');
    expect(result).toContain('href="https://example.com/"');
    expect(result).toContain('src="https://example.com/image.jpg"');
  });

  test('prevents path traversal in file paths', () => {
    // This would be called in githubService.getFileContent
    const { validateFilePath } = require('../utils/securityUtils');
    
    const maliciousPath = '../../../etc/passwd';
    const result = validateFilePath(maliciousPath);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Path traversal patterns not allowed');
  });

  test('validates GitHub parameters', () => {
    const { validateGitHubParams } = require('../utils/securityUtils');
    
    const maliciousParams = {
      username: 'user@malicious.com',
      repository: 'repo with spaces',
      branch: 'branch\x00name'
    };
    
    const result = validateGitHubParams(maliciousParams);
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});