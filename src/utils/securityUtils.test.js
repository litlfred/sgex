import securityUtils, {
  escapeHtml,
  sanitizeHtml,
  validateRepositoryName,
  validateUsername,
  validateBranchName,
  isValidUrlScheme,
  preventPathTraversal,
  sanitizeUserInput,
  validateGitHubUrl,
  createSafeInlineStyle
} from './securityUtils';

describe('SecurityUtils', () => {
  describe('escapeHtml', () => {
    it('should escape basic HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(escapeHtml('Hello & "World"')).toBe('Hello &amp; &quot;World&quot;');
      expect(escapeHtml("It's a 'test' & more")).toBe('It&#x27;s a &#x27;test&#x27; &amp; more');
    });

    it('should handle non-string inputs', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(123)).toBe('');
      expect(escapeHtml({})).toBe('');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags completely', () => {
      const maliciousHtml = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Hello</p>');
      expect(result).toContain('<p>World</p>');
    });

    it('should remove style tags completely', () => {
      const htmlWithStyle = '<p>Hello</p><style>body { background: red; }</style><p>World</p>';
      const result = sanitizeHtml(htmlWithStyle);
      expect(result).not.toContain('style');
      expect(result).not.toContain('background');
      expect(result).toContain('<p>Hello</p>');
      expect(result).toContain('<p>World</p>');
    });

    it('should remove event handlers', () => {
      const htmlWithEvents = '<p onclick="alert(\'xss\')">Click me</p>';
      const result = sanitizeHtml(htmlWithEvents);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Click me</p>');
    });

    it('should remove dangerous protocols in href attributes', () => {
      const htmlWithBadHref = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = sanitizeHtml(htmlWithBadHref);
      expect(result).not.toContain('javascript:');
      expect(result).toContain('Link');
    });

    it('should preserve safe HTML content', () => {
      const safeHtml = '<h1>Title</h1><p>Safe <strong>content</strong> with <a href="https://example.com">link</a></p>';
      const result = sanitizeHtml(safeHtml);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<strong>content</strong>');
      expect(result).toContain('https://example.com');
    });

    it('should remove disallowed tags', () => {
      const htmlWithBadTags = '<p>Safe content</p><iframe src="evil.com"></iframe><object data="evil.swf"></object>';
      const result = sanitizeHtml(htmlWithBadTags);
      expect(result).not.toContain('iframe');
      expect(result).not.toContain('object');
      expect(result).toContain('<p>Safe content</p>');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
      expect(sanitizeHtml(123)).toBe('');
    });
  });

  describe('validateRepositoryName', () => {
    it('should accept valid repository names', () => {
      expect(validateRepositoryName('valid-repo')).toBe(true);
      expect(validateRepositoryName('my_repo_123')).toBe(true);
      expect(validateRepositoryName('repo.name')).toBe(true);
      expect(validateRepositoryName('a')).toBe(true);
      expect(validateRepositoryName('123')).toBe(true);
    });

    it('should reject invalid repository names', () => {
      expect(validateRepositoryName('')).toBe(false);
      expect(validateRepositoryName('-invalid')).toBe(false);
      expect(validateRepositoryName('invalid-')).toBe(false);
      expect(validateRepositoryName('.invalid')).toBe(false);
      expect(validateRepositoryName('invalid.')).toBe(false);
      expect(validateRepositoryName('...')).toBe(false);
      expect(validateRepositoryName('a'.repeat(101))).toBe(false);
      expect(validateRepositoryName('invalid@repo')).toBe(false);
      expect(validateRepositoryName('invalid repo')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(validateRepositoryName(null)).toBe(false);
      expect(validateRepositoryName(undefined)).toBe(false);
      expect(validateRepositoryName(123)).toBe(false);
      expect(validateRepositoryName({})).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('validuser')).toBe(true);
      expect(validateUsername('user-123')).toBe(true);
      expect(validateUsername('a')).toBe(true);
      expect(validateUsername('test-user')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(validateUsername('')).toBe(false);
      expect(validateUsername('-invalid')).toBe(false);
      expect(validateUsername('invalid-')).toBe(false);
      expect(validateUsername('user--name')).toBe(false);
      expect(validateUsername('a'.repeat(40))).toBe(false);
      expect(validateUsername('user@name')).toBe(false);
      expect(validateUsername('user name')).toBe(false);
      expect(validateUsername('user.name')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(validateUsername(null)).toBe(false);
      expect(validateUsername(undefined)).toBe(false);
      expect(validateUsername(123)).toBe(false);
    });
  });

  describe('validateBranchName', () => {
    it('should accept valid branch names', () => {
      expect(validateBranchName('main')).toBe(true);
      expect(validateBranchName('feature/new-feature')).toBe(true);
      expect(validateBranchName('bug-fix-123')).toBe(true);
      expect(validateBranchName('develop')).toBe(true);
    });

    it('should reject invalid branch names', () => {
      expect(validateBranchName('')).toBe(false);
      expect(validateBranchName('/invalid')).toBe(false);
      expect(validateBranchName('invalid/')).toBe(false);
      expect(validateBranchName('feat..ure')).toBe(false);
      expect(validateBranchName('feature.lock')).toBe(false);
      expect(validateBranchName(' spaced ')).toBe(false);
      expect(validateBranchName('.dotstart')).toBe(false);
      expect(validateBranchName('a'.repeat(251))).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(validateBranchName(null)).toBe(false);
      expect(validateBranchName(undefined)).toBe(false);
      expect(validateBranchName(123)).toBe(false);
    });
  });

  describe('isValidUrlScheme', () => {
    it('should accept safe URL schemes', () => {
      expect(isValidUrlScheme('https://example.com')).toBe(true);
      expect(isValidUrlScheme('http://example.com')).toBe(true);
      expect(isValidUrlScheme('mailto:test@example.com')).toBe(true);
      expect(isValidUrlScheme('tel:+1234567890')).toBe(true);
      expect(isValidUrlScheme('ftp://files.example.com')).toBe(true);
      expect(isValidUrlScheme('/relative/path')).toBe(true);
      expect(isValidUrlScheme('relative/path')).toBe(true);
    });

    it('should reject dangerous URL schemes', () => {
      expect(isValidUrlScheme('javascript:alert("xss")')).toBe(false);
      expect(isValidUrlScheme('data:text/html,<script>alert("xss")</script>')).toBe(false);
      expect(isValidUrlScheme('vbscript:msgbox("xss")')).toBe(false);
      expect(isValidUrlScheme('file:///etc/passwd')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(isValidUrlScheme(null)).toBe(false);
      expect(isValidUrlScheme(undefined)).toBe(false);
      expect(isValidUrlScheme(123)).toBe(false);
    });
  });

  describe('preventPathTraversal', () => {
    it('should remove path traversal sequences', () => {
      expect(preventPathTraversal('../../../etc/passwd')).toBe('etc/passwd');
      expect(preventPathTraversal('docs/../config.yml')).toBe('docs/config.yml');
      expect(preventPathTraversal('safe/path/file.txt')).toBe('safe/path/file.txt');
    });

    it('should normalize multiple slashes', () => {
      expect(preventPathTraversal('path//to///file.txt')).toBe('path/to/file.txt');
    });

    it('should remove leading and trailing slashes', () => {
      expect(preventPathTraversal('/path/to/file.txt/')).toBe('path/to/file.txt');
    });

    it('should remove dangerous characters', () => {
      expect(preventPathTraversal('path<>to|file')).toBe('pathtofile');
      expect(preventPathTraversal('path"to\'file')).toBe('pathtofile');
    });

    it('should handle non-string inputs', () => {
      expect(preventPathTraversal(null)).toBe('');
      expect(preventPathTraversal(undefined)).toBe('');
      expect(preventPathTraversal(123)).toBe('');
    });
  });

  describe('sanitizeUserInput', () => {
    it('should escape HTML and limit length', () => {
      const longInput = 'a'.repeat(1500);
      const result = sanitizeUserInput(longInput);
      expect(result.length).toBeLessThanOrEqual(1003); // 1000 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should escape HTML entities', () => {
      const htmlInput = '<script>alert("xss")</script>';
      const result = sanitizeUserInput(htmlInput);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeUserInput(null)).toBe('');
      expect(sanitizeUserInput(undefined)).toBe('');
      expect(sanitizeUserInput(123)).toBe('');
    });
  });

  describe('validateGitHubUrl', () => {
    it('should accept valid GitHub URLs', () => {
      expect(validateGitHubUrl('https://github.com/user/repo')).toEqual({
        isValid: true,
        sanitizedUrl: 'https://github.com/user/repo'
      });
      expect(validateGitHubUrl('https://api.github.com/repos/user/repo')).toEqual({
        isValid: true,
        sanitizedUrl: 'https://api.github.com/repos/user/repo'
      });
    });

    it('should reject non-GitHub URLs', () => {
      expect(validateGitHubUrl('https://evil.com/malicious')).toEqual({
        isValid: false,
        sanitizedUrl: ''
      });
    });

    it('should reject non-HTTPS URLs', () => {
      expect(validateGitHubUrl('http://github.com/user/repo')).toEqual({
        isValid: false,
        sanitizedUrl: ''
      });
    });

    it('should handle invalid URLs', () => {
      expect(validateGitHubUrl('not-a-url')).toEqual({
        isValid: false,
        sanitizedUrl: ''
      });
    });

    it('should handle non-string inputs', () => {
      expect(validateGitHubUrl(null)).toEqual({
        isValid: false,
        sanitizedUrl: ''
      });
    });
  });

  describe('createSafeInlineStyle', () => {
    it('should create safe CSS strings from style objects', () => {
      const styles = {
        color: 'red',
        fontSize: '14px',
        margin: '10px'
      };
      const result = createSafeInlineStyle(styles);
      expect(result).toContain('color: red');
      expect(result).toContain('font-size: 14px');
      expect(result).toContain('margin: 10px');
    });

    it('should filter out dangerous CSS properties', () => {
      const styles = {
        color: 'red',
        background: 'url(javascript:alert("xss"))',
        expression: 'alert("xss")',
        fontSize: '14px'
      };
      const result = createSafeInlineStyle(styles);
      expect(result).toContain('color: red');
      expect(result).toContain('font-size: 14px');
      expect(result).not.toContain('background');
      expect(result).not.toContain('expression');
    });

    it('should sanitize CSS values', () => {
      const styles = {
        color: 'red"onload="alert(\'xss\')"'
      };
      const result = createSafeInlineStyle(styles);
      expect(result).not.toContain('"');
      expect(result).toContain('color: red');
    });

    it('should handle non-object inputs', () => {
      expect(createSafeInlineStyle(null)).toBe('');
      expect(createSafeInlineStyle(undefined)).toBe('');
      expect(createSafeInlineStyle('not an object')).toBe('');
    });
  });

  describe('default export', () => {
    it('should export all functions', () => {
      expect(typeof securityUtils.escapeHtml).toBe('function');
      expect(typeof securityUtils.sanitizeHtml).toBe('function');
      expect(typeof securityUtils.validateRepositoryName).toBe('function');
      expect(typeof securityUtils.validateUsername).toBe('function');
      expect(typeof securityUtils.validateBranchName).toBe('function');
      expect(typeof securityUtils.isValidUrlScheme).toBe('function');
      expect(typeof securityUtils.preventPathTraversal).toBe('function');
      expect(typeof securityUtils.sanitizeUserInput).toBe('function');
      expect(typeof securityUtils.validateGitHubUrl).toBe('function');
      expect(typeof securityUtils.createSafeInlineStyle).toBe('function');
    });
  });
});