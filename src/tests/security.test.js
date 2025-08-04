/**
 * Security Tests for SGEX Workbench
 * Tests for security utilities, token handling, and XSS protection
 */

import securityUtils from '../utils/securityUtils';
import secureTokenStorage from '../services/secureTokenStorage';

describe('Security Utils', () => {
  describe('Input Sanitization', () => {
    test('sanitizeHtml should escape HTML entities', () => {
      expect(securityUtils.sanitizeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      
      expect(securityUtils.sanitizeHtml('Normal text')).toBe('Normal text');
      
      expect(securityUtils.sanitizeHtml('<img src="x" onerror="alert(1)">'))
        .toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
    });

    test('sanitizeUrl should remove dangerous schemes', () => {
      expect(securityUtils.sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(securityUtils.sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
      expect(securityUtils.sanitizeUrl('https://github.com/user/repo')).toBe('https://github.com/user/repo');
      expect(securityUtils.sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    test('sanitizeRepositoryName should only allow valid characters', () => {
      expect(securityUtils.sanitizeRepositoryName('valid-repo_name.test')).toBe('valid-repo_name.test');
      expect(securityUtils.sanitizeRepositoryName('invalid<>repo')).toBe('invalidrepo');
      expect(securityUtils.sanitizeRepositoryName('repo with spaces')).toBe('repowithspaces');
    });

    test('sanitizeUsername should only allow valid GitHub username characters', () => {
      expect(securityUtils.sanitizeUsername('valid-user')).toBe('valid-user');
      expect(securityUtils.sanitizeUsername('invalid_user!')).toBe('invalid_user');
      expect(securityUtils.sanitizeUsername('user with spaces')).toBe('userwithspaces');
    });

    test('sanitizeBranchName should allow valid Git branch characters', () => {
      expect(securityUtils.sanitizeBranchName('feature/new-branch')).toBe('feature/new-branch');
      expect(securityUtils.sanitizeBranchName('hotfix-1.2.3')).toBe('hotfix-1.2.3');
      expect(securityUtils.sanitizeBranchName('invalid<>branch')).toBe('invalidbranch');
    });
  });

  describe('Token Validation', () => {
    test('isValidPATFormat should validate GitHub PAT formats', () => {
      // Valid classic PAT
      const validClassicPAT = 'ghp_' + 'a'.repeat(36);
      expect(securityUtils.isValidPATFormat(validClassicPAT)).toBe(true);

      // Valid fine-grained PAT
      const validFineGrainedPAT = 'github_pat_' + 'a'.repeat(22);
      expect(securityUtils.isValidPATFormat(validFineGrainedPAT)).toBe(true);

      // Invalid formats
      expect(securityUtils.isValidPATFormat('invalid')).toBe(false);
      expect(securityUtils.isValidPATFormat('ghp_tooshort')).toBe(false);
      expect(securityUtils.isValidPATFormat('')).toBe(false);
      expect(securityUtils.isValidPATFormat(null)).toBe(false);
    });

    test('maskToken should mask tokens for safe display', () => {
      const token = 'ghp_1234567890abcdefghij1234567890abcdef';
      const masked = securityUtils.maskToken(token);
      expect(masked).toBe('ghp_***cdef');
      expect(masked).not.toContain('1234567890abcdefghij1234567890ab');

      expect(securityUtils.maskToken('short')).toBe('[masked]');
      expect(securityUtils.maskToken('')).toBe('[invalid]');
      expect(securityUtils.maskToken(null)).toBe('[invalid]');
    });
  });

  describe('Path Validation', () => {
    test('isValidFilePath should prevent path traversal', () => {
      expect(securityUtils.isValidFilePath('valid/file/path.txt')).toBe(true);
      expect(securityUtils.isValidFilePath('file.txt')).toBe(true);
      
      // Path traversal attempts
      expect(securityUtils.isValidFilePath('../../../etc/passwd')).toBe(false);
      expect(securityUtils.isValidFilePath('file/../../../secret')).toBe(false);
      expect(securityUtils.isValidFilePath('/absolute/path')).toBe(false);
      expect(securityUtils.isValidFilePath('file//with//double//slashes')).toBe(false);
      
      // Null bytes and invalid characters
      expect(securityUtils.isValidFilePath('file\0.txt')).toBe(false);
      expect(securityUtils.isValidFilePath('file<>|*.txt')).toBe(false);
    });
  });

  describe('Log Data Sanitization', () => {
    test('sanitizeLogData should remove sensitive fields', () => {
      const sensitiveData = {
        token: 'ghp_secrettoken123456',
        password: 'secret123',
        username: 'testuser',
        email: 'test@example.com'
      };

      const sanitized = securityUtils.sanitizeLogData(sensitiveData);
      
      expect(sanitized.token).toBe('ghp_***3456');
      expect(sanitized.password).toBe('[redacted]');
      expect(sanitized.username).toBe('testuser'); // Not in default sensitive fields
      expect(sanitized.email).toBe('test@example.com');
    });

    test('sanitizeLogData should handle custom sensitive fields', () => {
      const data = {
        token: 'secret',
        customSecret: 'sensitive',
        publicData: 'safe'
      };

      const sanitized = securityUtils.sanitizeLogData(data, ['token', 'customSecret']);
      
      expect(sanitized.token).toBe('[redacted]'); // Short token gets redacted
      expect(sanitized.customSecret).toBe('[redacted]');
      expect(sanitized.publicData).toBe('safe');
    });
  });

  describe('URL Parameter Validation', () => {
    test('validateUrlParams should validate and sanitize parameters', () => {
      const params = new URLSearchParams('user=test-user&repo=my-repo&branch=feature/test&malicious=<script>');
      const expectedParams = {
        user: { type: 'username', required: true },
        repo: { type: 'repository', required: true },
        branch: { type: 'branch', required: false },
        malicious: { type: 'string', required: false }
      };

      const validated = securityUtils.validateUrlParams(params, expectedParams);
      
      expect(validated.user).toBe('test-user');
      expect(validated.repo).toBe('my-repo');
      expect(validated.branch).toBe('feature/test');
      expect(validated.malicious).toBe('&lt;script&gt;');
    });

    test('validateUrlParams should throw for missing required parameters', () => {
      const params = new URLSearchParams('repo=my-repo');
      const expectedParams = {
        user: { type: 'username', required: true },
        repo: { type: 'repository', required: true }
      };

      expect(() => {
        securityUtils.validateUrlParams(params, expectedParams);
      }).toThrow("Required parameter 'user' is missing");
    });
  });

  describe('CSP Header Generation', () => {
    test('generateCSPHeader should return valid CSP header', () => {
      const csp = securityUtils.generateCSPHeader();
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).toContain("connect-src 'self' https://api.github.com");
      expect(csp).toContain("frame-ancestors 'none'");
    });
  });
});

describe('Secure Token Storage', () => {
  beforeEach(() => {
    // Clear any existing tokens
    secureTokenStorage.clearToken();
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        store: {},
        getItem: jest.fn((key) => window.sessionStorage.store[key] || null),
        setItem: jest.fn((key, value) => {
          window.sessionStorage.store[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete window.sessionStorage.store[key];
        }),
        clear: jest.fn(() => {
          window.sessionStorage.store = {};
        })
      },
      writable: true
    });
  });

  afterEach(() => {
    secureTokenStorage.clearToken();
  });

  test('should store and retrieve tokens securely', () => {
    const testToken = 'ghp_' + 'a'.repeat(36);
    const metadata = { username: 'testuser' };

    // Store token
    const stored = secureTokenStorage.storeToken(testToken, metadata);
    expect(stored).toBe(true);

    // Retrieve token
    const retrieved = secureTokenStorage.getToken();
    expect(retrieved).toBe(testToken);

    // Check metadata
    const tokenMetadata = secureTokenStorage.getTokenMetadata();
    expect(tokenMetadata.username).toBe('testuser');
    expect(tokenMetadata.tokenType).toBe('classic');
  });

  test('should reject invalid token formats', () => {
    const invalidToken = 'invalid-token';
    
    const stored = secureTokenStorage.storeToken(invalidToken);
    expect(stored).toBe(false);
    
    const retrieved = secureTokenStorage.getToken();
    expect(retrieved).toBe(null);
  });

  test('should handle token expiration', () => {
    const testToken = 'ghp_' + 'a'.repeat(36);
    
    // Store token
    secureTokenStorage.storeToken(testToken);
    
    // Verify it's stored
    expect(secureTokenStorage.hasValidToken()).toBe(true);
    
    // Manually expire token by modifying metadata
    const metadata = JSON.parse(window.sessionStorage.getItem('sgex_token_metadata'));
    metadata.expires = Date.now() - 1000; // Expired 1 second ago
    window.sessionStorage.setItem('sgex_token_metadata', JSON.stringify(metadata));
    
    // Should now be considered expired
    expect(secureTokenStorage.hasValidToken()).toBe(false);
    expect(secureTokenStorage.getToken()).toBe(null);
  });

  test('should clear tokens properly', () => {
    const testToken = 'ghp_' + 'a'.repeat(36);
    
    secureTokenStorage.storeToken(testToken);
    expect(secureTokenStorage.hasValidToken()).toBe(true);
    
    secureTokenStorage.clearToken();
    expect(secureTokenStorage.hasValidToken()).toBe(false);
    expect(secureTokenStorage.getToken()).toBe(null);
  });

  test('should refresh token expiration', () => {
    const testToken = 'ghp_' + 'a'.repeat(36);
    
    secureTokenStorage.storeToken(testToken);
    const originalMetadata = secureTokenStorage.getTokenMetadata();
    
    // Wait a moment then refresh
    setTimeout(() => {
      secureTokenStorage.refreshToken();
      const refreshedMetadata = secureTokenStorage.getTokenMetadata();
      
      expect(refreshedMetadata.expires).toBeGreaterThan(originalMetadata.expires);
    }, 10);
  });

  test('should provide storage information', () => {
    const testToken = 'ghp_' + 'a'.repeat(36);
    
    // No token stored
    let info = secureTokenStorage.getStorageInfo();
    expect(info.hasToken).toBe(false);
    expect(info.totalSize).toBe(0);
    
    // Store token
    secureTokenStorage.storeToken(testToken);
    info = secureTokenStorage.getStorageInfo();
    expect(info.hasToken).toBe(true);
    expect(info.hasMetadata).toBe(true);
    expect(info.totalSize).toBeGreaterThan(0);
  });
});