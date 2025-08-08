/**
 * Tests for security utilities
 */

import {
  escapeHtml,
  sanitizeTextContent,
  validateUrl,
  validateGitHubUsername,
  validateGitHubRepository,
  validateGitHubBranch,
  validateFilePath,
  sanitizeMarkdown,
  validateGitHubParams,
  sanitizeInput
} from './securityUtils';

describe('securityUtils', () => {
  
  describe('escapeHtml', () => {
    test('escapes basic HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(escapeHtml('Hello & welcome')).toBe('Hello &amp; welcome');
      expect(escapeHtml('Quote "test" here')).toBe('Quote &quot;test&quot; here');
      expect(escapeHtml("It's a test")).toBe('It&#x27;s a test');
    });

    test('handles non-string input', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(123)).toBe('');
      expect(escapeHtml({})).toBe('');
    });

    test('handles empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    test('escapes all dangerous characters', () => {
      expect(escapeHtml('<>&"\'`=/')).toBe('&lt;&gt;&amp;&quot;&#x27;&#96;&#x3D;&#x2F;');
    });
  });

  describe('sanitizeTextContent', () => {
    test('sanitizes and limits length', () => {
      const longText = 'a'.repeat(15000);
      const result = sanitizeTextContent(longText, 100);
      expect(result.length).toBe(100);
    });

    test('trims whitespace', () => {
      expect(sanitizeTextContent('  hello world  ')).toBe('hello world');
    });

    test('escapes HTML in content', () => {
      expect(sanitizeTextContent('<script>alert("test")</script>'))
        .toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;&#x2F;script&gt;');
    });

    test('handles non-string input', () => {
      expect(sanitizeTextContent(null)).toBe('');
      expect(sanitizeTextContent(undefined)).toBe('');
      expect(sanitizeTextContent(123)).toBe('');
    });
  });

  describe('validateUrl', () => {
    test('validates HTTPS URLs', () => {
      const result = validateUrl('https://example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('https://example.com/');
    });

    test('validates HTTP URLs', () => {
      const result = validateUrl('http://example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('http://example.com/');
    });

    test('validates mailto URLs', () => {
      const result = validateUrl('mailto:test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('mailto:test@example.com');
    });

    test('rejects javascript URLs', () => {
      const result = validateUrl('javascript:alert("xss")');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('JavaScript and data URLs are not allowed');
    });

    test('rejects data URLs', () => {
      const result = validateUrl('data:text/html,<script>alert("xss")</script>');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('JavaScript and data URLs are not allowed');
    });

    test('rejects unsupported schemes', () => {
      const result = validateUrl('ftp://example.com');
      expect(result.isValid).toBe(true); // FTP is in allowed list
      
      const result2 = validateUrl('file:///etc/passwd');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toContain('is not allowed');
    });

    test('validates relative URLs when allowed', () => {
      const result = validateUrl('/path/to/page', true);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUrl).toBe('/path/to/page');
    });

    test('rejects path traversal in relative URLs', () => {
      const result = validateUrl('../../../etc/passwd', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid relative URL path');
    });

    test('handles non-string input', () => {
      const result = validateUrl(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL must be a string');
    });

    test('handles empty URL', () => {
      const result = validateUrl('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL cannot be empty');
    });
  });

  describe('validateGitHubUsername', () => {
    test('validates valid usernames', () => {
      const validUsernames = ['user', 'user-name', 'user123', 'a', 'octocat'];
      validUsernames.forEach(username => {
        const result = validateGitHubUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedUsername).toBe(username);
      });
    });

    test('rejects invalid usernames', () => {
      const invalidUsernames = [
        '', // empty
        'user-', // ends with hyphen
        '-user', // starts with hyphen
        'user name', // contains space
        'a'.repeat(40), // too long
        'user@name', // invalid character
      ];
      
      invalidUsernames.forEach(username => {
        const result = validateGitHubUsername(username);
        expect(result.isValid).toBe(false);
      });
    });

    test('handles non-string input', () => {
      const result = validateGitHubUsername(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must be a string');
    });

    test('trims whitespace', () => {
      const result = validateGitHubUsername('  validuser  ');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedUsername).toBe('validuser');
    });
  });

  describe('validateGitHubRepository', () => {
    test('validates valid repository names', () => {
      const validRepos = ['repo', 'my-repo', 'repo_name', 'repo.name', 'test123'];
      validRepos.forEach(repo => {
        const result = validateGitHubRepository(repo);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedRepository).toBe(repo);
      });
    });

    test('rejects invalid repository names', () => {
      const invalidRepos = [
        '', // empty
        'repo name', // contains space
        'a'.repeat(101), // too long
        'repo@name', // invalid character
      ];
      
      invalidRepos.forEach(repo => {
        const result = validateGitHubRepository(repo);
        expect(result.isValid).toBe(false);
      });
    });

    test('handles non-string input', () => {
      const result = validateGitHubRepository(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Repository name must be a string');
    });
  });

  describe('validateGitHubBranch', () => {
    test('validates valid branch names', () => {
      const validBranches = ['main', 'feature-branch', 'hotfix/urgent', 'dev_2024'];
      validBranches.forEach(branch => {
        const result = validateGitHubBranch(branch);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedBranch).toBe(branch);
      });
    });

    test('rejects invalid branch names', () => {
      const invalidBranches = [
        '', // empty
        'branch name', // contains space
        'branch\x00name', // control character
        'a'.repeat(251), // too long
      ];
      
      invalidBranches.forEach(branch => {
        const result = validateGitHubBranch(branch);
        expect(result.isValid).toBe(false);
      });
    });

    test('handles non-string input', () => {
      const result = validateGitHubBranch(undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Branch name must be a string');
    });
  });

  describe('validateFilePath', () => {
    test('validates safe file paths', () => {
      const validPaths = ['file.txt', 'folder/file.txt', 'deep/folder/structure/file.txt'];
      validPaths.forEach(path => {
        const result = validateFilePath(path);
        expect(result.isValid).toBe(true);
      });
    });

    test('rejects path traversal attempts', () => {
      const dangerousPaths = [
        '../../../etc/passwd',
        'folder/../../../secret.txt',
        'file//double//slash.txt',
      ];
      
      dangerousPaths.forEach(path => {
        const result = validateFilePath(path);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Path traversal patterns not allowed');
      });
    });

    test('normalizes path separators', () => {
      const result = validateFilePath('folder\\file.txt');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedPath).toBe('folder/file.txt');
    });

    test('removes leading slashes', () => {
      const result = validateFilePath('/folder/file.txt');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedPath).toBe('folder/file.txt');
    });

    test('handles non-string input', () => {
      const result = validateFilePath(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File path must be a string');
    });
  });

  describe('sanitizeMarkdown', () => {
    test('converts basic markdown safely', () => {
      const markdown = '# Header\n\n**Bold** and *italic* text.';
      const result = sanitizeMarkdown(markdown);
      expect(result).toContain('<h1>Header</h1>');
      expect(result).toContain('<strong>Bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    test('escapes HTML in markdown', () => {
      const markdown = '# <script>alert("xss")</script>';
      const result = sanitizeMarkdown(markdown);
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>');
    });

    test('validates links in markdown', () => {
      const markdown = '[Good link](https://example.com) [Bad link](javascript:alert("xss"))';
      const result = sanitizeMarkdown(markdown);
      expect(result).toContain('href="https://example.com/"');
      expect(result).not.toContain('javascript:');
    });

    test('validates images in markdown', () => {
      const markdown = '![Good image](https://example.com/img.jpg) ![Bad image](javascript:alert("xss"))';
      const result = sanitizeMarkdown(markdown);
      expect(result).toContain('src="https://example.com/img.jpg"');
      expect(result).not.toContain('javascript:');
    });

    test('handles tables safely', () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | <script>alert("xss")</script> |`;
      const result = sanitizeMarkdown(markdown);
      expect(result).toContain('<table');
      expect(result).toContain('&lt;script&gt;');
    });

    test('limits content length', () => {
      const longMarkdown = '# ' + 'a'.repeat(100000);
      const result = sanitizeMarkdown(longMarkdown, { maxLength: 1000 });
      expect(result.length).toBeLessThan(2000); // Account for HTML tags
    });

    test('handles non-string input', () => {
      expect(sanitizeMarkdown(null)).toBe('');
      expect(sanitizeMarkdown(undefined)).toBe('');
      expect(sanitizeMarkdown(123)).toBe('');
    });

    test('respects allowLinks option', () => {
      const markdown = '[Link](https://example.com)';
      const result = sanitizeMarkdown(markdown, { allowLinks: false });
      expect(result).not.toContain('<a');
      expect(result).toContain('Link');
    });

    test('respects allowImages option', () => {
      const markdown = '![Image](https://example.com/img.jpg)';
      const result = sanitizeMarkdown(markdown, { allowImages: false });
      expect(result).not.toContain('<img');
      expect(result).toContain('[Image: Image]');
    });
  });

  describe('validateGitHubParams', () => {
    test('validates all parameters when valid', () => {
      const params = {
        username: 'testuser',
        repository: 'test-repo',
        branch: 'main',
        filePath: 'folder/file.txt'
      };
      
      const result = validateGitHubParams(params);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.sanitized).toEqual(params);
    });

    test('returns errors for invalid parameters', () => {
      const params = {
        username: 'invalid-user-',
        repository: 'invalid repo name',
        branch: 'invalid branch name',
        filePath: '../../../etc/passwd'
      };
      
      const result = validateGitHubParams(params);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('handles partial parameter validation', () => {
      const params = {
        username: 'validuser',
        repository: 'invalid repo name'
      };
      
      const result = validateGitHubParams(params);
      expect(result.isValid).toBe(false);
      expect(result.sanitized.username).toBe('validuser');
      expect(result.errors).toContain('Repository: Invalid GitHub repository name format');
    });

    test('handles undefined parameters', () => {
      const result = validateGitHubParams({});
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('sanitizeInput', () => {
    test('sanitizes string input', () => {
      const input = '<script>alert("test")</script>';
      const result = sanitizeInput(input, { type: 'string' });
      expect(result).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;&#x2F;script&gt;');
    });

    test('sanitizes string input with HTML allowed', () => {
      const input = '<strong>Bold</strong>';
      const result = sanitizeInput(input, { type: 'string', allowHtml: true });
      expect(result).toBe('<strong>Bold</strong>');
    });

    test('limits string length', () => {
      const input = 'a'.repeat(2000);
      const result = sanitizeInput(input, { type: 'string', maxLength: 100 });
      expect(result.length).toBe(100);
    });

    test('sanitizes number input', () => {
      expect(sanitizeInput('123', { type: 'number' })).toBe(123);
      expect(sanitizeInput('abc', { type: 'number' })).toBe(null);
    });

    test('sanitizes boolean input', () => {
      expect(sanitizeInput('true', { type: 'boolean' })).toBe(true);
      expect(sanitizeInput('false', { type: 'boolean' })).toBe(true); // truthy string
      expect(sanitizeInput('', { type: 'boolean' })).toBe(false);
    });

    test('sanitizes array input', () => {
      const input = ['<script>', 'safe text', null];
      const result = sanitizeInput(input, { type: 'array' });
      expect(result).toEqual(['&lt;script&gt;', 'safe text', '']);
    });

    test('handles null/undefined input', () => {
      expect(sanitizeInput(null, { allowEmpty: true })).toBe('');
      expect(sanitizeInput(null, { allowEmpty: false })).toBe(null);
      expect(sanitizeInput(undefined, { allowEmpty: true })).toBe('');
    });
  });
});