import {
  sanitizeHtml,
  validateUrlScheme,
  validateRepositoryIdentifier,
  validateAndSanitizePath,
  sanitizeInput,
  createSafeHtml,
  validateGitHubApiParams
} from './securityUtils';

describe('securityUtils', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML entities', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitizeHtml('&<>"\'`=/')).toBe('&amp;&lt;&gt;&quot;&#x27;&#x60;&#x3D;&#x2F;');
    });

    it('should handle non-string inputs', () => {
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
      expect(sanitizeHtml(123)).toBe('');
      expect(sanitizeHtml({})).toBe('');
    });

    it('should preserve safe text', () => {
      expect(sanitizeHtml('Hello World')).toBe('Hello World');
      expect(sanitizeHtml('123 abc')).toBe('123 abc');
    });

    it('should handle empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });
  });

  describe('validateUrlScheme', () => {
    it('should allow safe URL schemes', () => {
      expect(validateUrlScheme('https://example.com')).toBe(true);
      expect(validateUrlScheme('http://example.com')).toBe(true);
      expect(validateUrlScheme('mailto:test@example.com')).toBe(true);
    });

    it('should allow relative URLs', () => {
      expect(validateUrlScheme('/path/to/resource')).toBe(true);
      expect(validateUrlScheme('#anchor')).toBe(true);
      expect(validateUrlScheme('?query=param')).toBe(true);
      expect(validateUrlScheme('')).toBe(true);
    });

    it('should reject dangerous schemes', () => {
      expect(validateUrlScheme('javascript:alert("xss")')).toBe(false);
      expect(validateUrlScheme('data:text/html,<script>alert("xss")</script>')).toBe(false);
      expect(validateUrlScheme('file:///etc/passwd')).toBe(false);
      expect(validateUrlScheme('ftp://example.com')).toBe(false);
    });

    it('should handle malformed URLs', () => {
      expect(validateUrlScheme('not a url')).toBe(true); // treated as relative
      expect(validateUrlScheme('http:// invalid')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(validateUrlScheme(null)).toBe(false);
      expect(validateUrlScheme(undefined)).toBe(false);
      expect(validateUrlScheme(123)).toBe(false);
    });
  });

  describe('validateRepositoryIdentifier', () => {
    describe('user validation', () => {
      it('should allow valid usernames', () => {
        expect(validateRepositoryIdentifier('john', 'user')).toBe(true);
        expect(validateRepositoryIdentifier('john-doe', 'user')).toBe(true);
        expect(validateRepositoryIdentifier('user123', 'user')).toBe(true);
        expect(validateRepositoryIdentifier('a', 'user')).toBe(true);
      });

      it('should reject invalid usernames', () => {
        expect(validateRepositoryIdentifier('', 'user')).toBe(false);
        expect(validateRepositoryIdentifier('-john', 'user')).toBe(false);
        expect(validateRepositoryIdentifier('john-', 'user')).toBe(false);
        expect(validateRepositoryIdentifier('john--doe', 'user')).toBe(false);
        expect(validateRepositoryIdentifier('john_doe', 'user')).toBe(false);
        expect(validateRepositoryIdentifier('john.doe', 'user')).toBe(false);
      });
    });

    describe('repo validation', () => {
      it('should allow valid repository names', () => {
        expect(validateRepositoryIdentifier('my-repo', 'repo')).toBe(true);
        expect(validateRepositoryIdentifier('my_repo', 'repo')).toBe(true);
        expect(validateRepositoryIdentifier('my.repo', 'repo')).toBe(true);
        expect(validateRepositoryIdentifier('repo123', 'repo')).toBe(true);
      });

      it('should reject invalid repository names', () => {
        expect(validateRepositoryIdentifier('', 'repo')).toBe(false);
        expect(validateRepositoryIdentifier('.gitignore', 'repo')).toBe(false);
        expect(validateRepositoryIdentifier('repo.', 'repo')).toBe(false);
        expect(validateRepositoryIdentifier('-repo', 'repo')).toBe(false);
        expect(validateRepositoryIdentifier('repo-', 'repo')).toBe(false);
        expect(validateRepositoryIdentifier('my repo', 'repo')).toBe(false);
      });
    });

    describe('branch validation', () => {
      it('should allow valid branch names', () => {
        expect(validateRepositoryIdentifier('main', 'branch')).toBe(true);
        expect(validateRepositoryIdentifier('feature/new-ui', 'branch')).toBe(true);
        expect(validateRepositoryIdentifier('hotfix-123', 'branch')).toBe(true);
        expect(validateRepositoryIdentifier('release/v1.0', 'branch')).toBe(true);
      });

      it('should reject invalid branch names', () => {
        expect(validateRepositoryIdentifier('', 'branch')).toBe(false);
        expect(validateRepositoryIdentifier('HEAD', 'branch')).toBe(false);
        expect(validateRepositoryIdentifier('.hidden', 'branch')).toBe(false);
        expect(validateRepositoryIdentifier('branch.', 'branch')).toBe(false);
        expect(validateRepositoryIdentifier('branch..name', 'branch')).toBe(false);
        expect(validateRepositoryIdentifier('feature//bug', 'branch')).toBe(false);
        expect(validateRepositoryIdentifier('branch@{', 'branch')).toBe(false);
        expect(validateRepositoryIdentifier('branch with spaces', 'branch')).toBe(false);
      });
    });

    it('should handle path traversal attempts', () => {
      expect(validateRepositoryIdentifier('../etc/passwd', 'repo')).toBe(false);
      expect(validateRepositoryIdentifier('../../etc', 'user')).toBe(false);
      expect(validateRepositoryIdentifier('branch../malicious', 'branch')).toBe(false);
    });

    it('should handle long names', () => {
      const longName = 'a'.repeat(101);
      expect(validateRepositoryIdentifier(longName, 'user')).toBe(false);
      expect(validateRepositoryIdentifier(longName, 'repo')).toBe(false);
      expect(validateRepositoryIdentifier(longName, 'branch')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(validateRepositoryIdentifier(null, 'user')).toBe(false);
      expect(validateRepositoryIdentifier(undefined, 'repo')).toBe(false);
      expect(validateRepositoryIdentifier(123, 'branch')).toBe(false);
    });
  });

  describe('validateAndSanitizePath', () => {
    it('should allow safe paths', () => {
      expect(validateAndSanitizePath('docs/readme.md')).toBe('docs/readme.md');
      expect(validateAndSanitizePath('src/components/App.js')).toBe('src/components/App.js');
      expect(validateAndSanitizePath('config.json')).toBe('config.json');
    });

    it('should reject path traversal attempts', () => {
      expect(validateAndSanitizePath('../etc/passwd')).toBe(null);
      expect(validateAndSanitizePath('../../secret')).toBe(null);
      expect(validateAndSanitizePath('/etc/passwd')).toBe(null);
      expect(validateAndSanitizePath('docs/../../../etc')).toBe(null);
    });

    it('should reject dangerous files', () => {
      expect(validateAndSanitizePath('malware.exe')).toBe(null);
      expect(validateAndSanitizePath('script.bat')).toBe(null);
      expect(validateAndSanitizePath('hack.php')).toBe(null);
      expect(validateAndSanitizePath('.htaccess')).toBe(null);
      expect(validateAndSanitizePath('CON')).toBe(null);
      expect(validateAndSanitizePath('PRN.txt')).toBe(null);
    });

    it('should validate allowed extensions', () => {
      expect(validateAndSanitizePath('doc.md', ['.md', '.txt'])).toBe('doc.md');
      expect(validateAndSanitizePath('file.txt', ['.md', '.txt'])).toBe('file.txt');
      expect(validateAndSanitizePath('script.js', ['.md', '.txt'])).toBe(null);
    });

    it('should handle null bytes and control characters', () => {
      expect(validateAndSanitizePath('file\0.txt')).toBe(null);
      expect(validateAndSanitizePath('file\x00.txt')).toBe(null);
      expect(validateAndSanitizePath('file\x1f.txt')).toBe(null);
    });

    it('should handle non-string inputs', () => {
      expect(validateAndSanitizePath(null)).toBe(null);
      expect(validateAndSanitizePath(undefined)).toBe(null);
      expect(validateAndSanitizePath(123)).toBe(null);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize based on type', () => {
      expect(sanitizeInput('<script>alert("xss")</script>', 'html')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitizeInput('javascript:alert("xss")', 'url')).toBe(null);
      expect(sanitizeInput('https://example.com', 'url')).toBe('https://example.com');
      expect(sanitizeInput('valid-user', 'user')).toBe('valid-user');
      expect(sanitizeInput('invalid user', 'user')).toBe(null);
    });

    it('should default to HTML sanitization for unknown types', () => {
      expect(sanitizeInput('<script>', 'unknown')).toBe('&lt;script&gt;');
    });

    it('should handle null/undefined inputs', () => {
      expect(sanitizeInput(null, 'html')).toBe(null);
      expect(sanitizeInput(undefined, 'html')).toBe(null);
    });
  });

  describe('createSafeHtml', () => {
    it('should create safe HTML elements', () => {
      expect(createSafeHtml('div', 'Hello World')).toBe('<div>Hello World</div>');
      expect(createSafeHtml('p', 'Safe content', { class: 'test' })).toBe('<p class="test">Safe content</p>');
    });

    it('should sanitize content', () => {
      expect(createSafeHtml('div', '<script>alert("xss")</script>')).toBe('<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;</div>');
    });

    it('should restrict to safe tags', () => {
      expect(createSafeHtml('script', 'content')).toBe('<div>content</div>');
      expect(createSafeHtml('iframe', 'content')).toBe('<div>content</div>');
    });

    it('should sanitize attributes', () => {
      expect(createSafeHtml('div', 'content', { onclick: 'alert()' })).toBe('<div>content</div>');
      expect(createSafeHtml('div', 'content', { 'data-test': '<script>' })).toBe('<div data-test="&lt;script&gt;">content</div>');
    });

    it('should handle invalid inputs', () => {
      expect(createSafeHtml(null, 'content')).toBe('');
      expect(createSafeHtml('div', null)).toBe('');
    });
  });

  describe('validateGitHubApiParams', () => {
    it('should validate GitHub API parameters', () => {
      const params = {
        owner: 'valid-user',
        repo: 'valid-repo',
        branch: 'main',
        path: 'docs/readme.md'
      };
      
      const result = validateGitHubApiParams(params);
      expect(result).toEqual(params);
    });

    it('should reject invalid parameters', () => {
      const params = {
        owner: 'invalid user',
        repo: 'valid-repo'
      };
      
      expect(validateGitHubApiParams(params)).toBe(null);
    });

    it('should handle path traversal in path parameter', () => {
      const params = {
        owner: 'valid-user',
        repo: 'valid-repo',
        path: '../../../etc/passwd'
      };
      
      expect(validateGitHubApiParams(params)).toBe(null);
    });

    it('should sanitize other string parameters', () => {
      const params = {
        owner: 'valid-user',
        repo: 'valid-repo',
        message: '<script>alert("xss")</script>'
      };
      
      const result = validateGitHubApiParams(params);
      expect(result.message).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle non-object inputs', () => {
      expect(validateGitHubApiParams(null)).toBe(null);
      expect(validateGitHubApiParams(undefined)).toBe(null);
      expect(validateGitHubApiParams('string')).toBe(null);
    });

    it('should preserve non-string parameters', () => {
      const params = {
        owner: 'valid-user',
        repo: 'valid-repo',
        count: 10,
        enabled: true
      };
      
      const result = validateGitHubApiParams(params);
      expect(result.count).toBe(10);
      expect(result.enabled).toBe(true);
    });
  });
});