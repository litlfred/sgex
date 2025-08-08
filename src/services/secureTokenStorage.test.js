/**
 * Tests for SecureTokenStorage service
 */

import secureTokenStorage from './secureTokenStorage';

// Mock logger to avoid console output in tests
jest.mock('../utils/logger', () => ({
  getLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })
}));

describe('SecureTokenStorage', () => {
  const validClassicToken = 'ghp_123456789012345678901234567890123456';
  const validFineGrainedToken = 'github_pat_1234567890123456789012_12345678901234567890123456789012345678901234567890123456789';
  const validOAuthToken = 'gho_123456789012345678901234567890123456';
  const validLegacyToken = '1234567890123456789012345678901234567890';
  const invalidToken = 'invalid_token_format';

  beforeEach(() => {
    // Clear all storage before each test
    sessionStorage.clear();
    localStorage.clear();
    
    // Mock canvas for browser fingerprint
    const mockCanvas = {
      getContext: jest.fn(() => ({
        textBaseline: '',
        font: '',
        fillText: jest.fn(),
      })),
      toDataURL: jest.fn(() => 'mock_canvas_data')
    };
    
    document.createElement = jest.fn((tag) => {
      if (tag === 'canvas') {
        return mockCanvas;
      }
      return {};
    });

    // Mock navigator and screen with consistent values
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'MockBrowser/1.0',
        language: 'en-US'
      },
      writable: true,
      configurable: true
    });

    Object.defineProperty(global, 'screen', {
      value: {
        width: 1920,
        height: 1080,
        colorDepth: 24
      },
      writable: true,
      configurable: true
    });

    // Mock Date timezone offset with consistent value
    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
    Date.prototype.getTimezoneOffset = jest.fn(() => -300);
    
    // Store original for cleanup
    global._originalGetTimezoneOffset = originalGetTimezoneOffset;
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    
    // Restore original Date.prototype.getTimezoneOffset
    if (global._originalGetTimezoneOffset) {
      Date.prototype.getTimezoneOffset = global._originalGetTimezoneOffset;
      delete global._originalGetTimezoneOffset;
    }
  });

  describe('Token Format Validation', () => {
    test('validates classic PAT format correctly', () => {
      const result = secureTokenStorage.validateTokenFormat(validClassicToken);
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('classic');
      expect(result.token).toBe(validClassicToken);
    });

    test('validates fine-grained PAT format correctly', () => {
      const result = secureTokenStorage.validateTokenFormat(validFineGrainedToken);
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('fine-grained');
      expect(result.token).toBe(validFineGrainedToken);
    });

    test('validates OAuth token format correctly', () => {
      const result = secureTokenStorage.validateTokenFormat(validOAuthToken);
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('oauth');
      expect(result.token).toBe(validOAuthToken);
    });

    test('validates legacy token format correctly', () => {
      const result = secureTokenStorage.validateTokenFormat(validLegacyToken);
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('legacy');
      expect(result.token).toBe(validLegacyToken);
    });

    test('rejects invalid token formats', () => {
      const result = secureTokenStorage.validateTokenFormat(invalidToken);
      expect(result.isValid).toBe(false);
      expect(result.type).toBe('invalid');
      expect(result.reason).toContain('does not match expected GitHub PAT format');
    });

    test('handles empty or null tokens', () => {
      expect(secureTokenStorage.validateTokenFormat('').isValid).toBe(false);
      expect(secureTokenStorage.validateTokenFormat(null).isValid).toBe(false);
      expect(secureTokenStorage.validateTokenFormat(undefined).isValid).toBe(false);
    });

    test('trims whitespace from tokens', () => {
      const tokenWithSpaces = `  ${validClassicToken}  `;
      const result = secureTokenStorage.validateTokenFormat(tokenWithSpaces);
      expect(result.isValid).toBe(true);
      expect(result.token).toBe(validClassicToken);
    });
  });

  describe('Token Masking', () => {
    test('masks tokens correctly for logging', () => {
      const masked = secureTokenStorage.maskToken(validClassicToken);
      expect(masked).toBe('ghp_********************************3456');
      expect(masked).not.toContain('123456789012345678901234567890');
    });

    test('handles short tokens safely', () => {
      const shortToken = 'abc';
      const masked = secureTokenStorage.maskToken(shortToken);
      expect(masked).toBe('[INVALID_TOKEN]');
    });

    test('handles invalid inputs safely', () => {
      expect(secureTokenStorage.maskToken(null)).toBe('[INVALID_TOKEN]');
      expect(secureTokenStorage.maskToken(undefined)).toBe('[INVALID_TOKEN]');
      expect(secureTokenStorage.maskToken('')).toBe('[INVALID_TOKEN]');
    });
  });

  describe('Browser Fingerprint Generation', () => {
    test('generates consistent fingerprint', () => {
      const fingerprint1 = secureTokenStorage.generateBrowserFingerprint();
      const fingerprint2 = secureTokenStorage.generateBrowserFingerprint();
      expect(fingerprint1).toBe(fingerprint2);
      expect(typeof fingerprint1).toBe('string');
      expect(fingerprint1.length).toBeGreaterThan(0);
    });

    test('generates different fingerprints for different environments', () => {
      const fingerprint1 = secureTokenStorage.generateBrowserFingerprint();
      
      // Change user agent
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'DifferentBrowser/2.0',
          language: 'en-US'
        },
        writable: true
      });
      
      const fingerprint2 = secureTokenStorage.generateBrowserFingerprint();
      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });

  describe('XOR Cipher', () => {
    test('encrypts and decrypts text correctly', () => {
      const originalText = 'test_message_123';
      const key = 'encryption_key';
      
      const encrypted = secureTokenStorage.xorCipher(originalText, key);
      expect(encrypted).not.toBe(originalText);
      
      const decrypted = secureTokenStorage.xorCipher(encrypted, key);
      expect(decrypted).toBe(originalText);
    });

    test('produces different output with different keys', () => {
      const text = 'test_message';
      const key1 = 'key1';
      const key2 = 'key2';
      
      const encrypted1 = secureTokenStorage.xorCipher(text, key1);
      const encrypted2 = secureTokenStorage.xorCipher(text, key2);
      
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('Token Storage and Retrieval', () => {
    test('stores and retrieves valid token successfully', () => {
      const success = secureTokenStorage.storeToken(validClassicToken);
      expect(success).toBe(true);

      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved).not.toBeNull();
      expect(retrieved.token).toBe(validClassicToken);
      expect(retrieved.type).toBe('classic');
      expect(typeof retrieved.created).toBe('number');
      expect(typeof retrieved.expires).toBe('number');
    });

    test('rejects invalid token for storage', () => {
      const success = secureTokenStorage.storeToken(invalidToken);
      expect(success).toBe(false);

      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved).toBeNull();
    });

    test('clears legacy tokens when storing new token', () => {
      // Set legacy tokens
      sessionStorage.setItem('github_token', 'legacy_token');
      localStorage.setItem('github_token', 'legacy_token');

      secureTokenStorage.storeToken(validClassicToken);

      // Check that legacy tokens are cleared
      expect(sessionStorage.getItem('github_token')).toBeNull();
      expect(localStorage.getItem('github_token')).toBeNull();
    });

    test('returns null for non-existent token', () => {
      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved).toBeNull();
    });

    test('handles corrupted storage gracefully', () => {
      // Store corrupted data
      sessionStorage.setItem('sgex_secure_token', 'corrupted_json_data');

      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved).toBeNull();

      // Should clear corrupted data
      expect(sessionStorage.getItem('sgex_secure_token')).toBeNull();
    });
  });

  describe('Token Expiration', () => {
    test('rejects expired tokens', () => {
      const originalNow = Date.now;
      
      // Mock Date.now to simulate past time for storage
      const pastTime = originalNow() - (25 * 60 * 60 * 1000); // 25 hours ago
      Date.now = jest.fn(() => pastTime);

      secureTokenStorage.storeToken(validClassicToken);

      // Restore current time to simulate expiration
      Date.now = originalNow;

      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved).toBeNull();
    });

    test('accepts non-expired tokens', () => {
      const originalNow = Date.now;
      
      secureTokenStorage.storeToken(validClassicToken);

      // Simulate 1 hour later (but still within 24 hour expiration)
      Date.now = jest.fn(() => originalNow() + (1 * 60 * 60 * 1000));

      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved).not.toBeNull();
      expect(retrieved.token).toBe(validClassicToken);

      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('Browser Fingerprint Security', () => {
    test('rejects tokens with mismatched fingerprint', () => {
      secureTokenStorage.storeToken(validClassicToken);

      // Change browser fingerprint by modifying navigator
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'AttackerBrowser/1.0',
          language: 'en-US'
        },
        writable: true
      });

      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved).toBeNull();
    });
  });

  describe('Token Validity Check', () => {
    test('hasValidToken returns true for valid stored token', () => {
      secureTokenStorage.storeToken(validClassicToken);
      expect(secureTokenStorage.hasValidToken()).toBe(true);
    });

    test('hasValidToken returns false when no token stored', () => {
      expect(secureTokenStorage.hasValidToken()).toBe(false);
    });

    test('hasValidToken returns false for expired token', () => {
      const originalNow = Date.now;
      
      // Store token in the past
      Date.now = jest.fn(() => originalNow() - (25 * 60 * 60 * 1000));

      secureTokenStorage.storeToken(validClassicToken);

      // Restore current time
      Date.now = originalNow;

      expect(secureTokenStorage.hasValidToken()).toBe(false);
    });
  });

  describe('Token Information', () => {
    test('getTokenInfo returns correct information', () => {
      secureTokenStorage.storeToken(validClassicToken);

      const info = secureTokenStorage.getTokenInfo();
      expect(info).not.toBeNull();
      expect(info.type).toBe('classic');
      expect(info.created instanceof Date).toBe(true);
      expect(info.expires instanceof Date).toBe(true);
      expect(typeof info.timeRemaining).toBe('number');
      expect(info.isExpired).toBe(false);
      expect(info.isValid).toBe(true);
    });

    test('getTokenInfo returns null when no token stored', () => {
      const info = secureTokenStorage.getTokenInfo();
      expect(info).toBeNull();
    });
  });

  describe('Token Clearing', () => {
    test('clearToken removes all token data', () => {
      secureTokenStorage.storeToken(validClassicToken);
      expect(secureTokenStorage.hasValidToken()).toBe(true);

      secureTokenStorage.clearToken();
      expect(secureTokenStorage.hasValidToken()).toBe(false);
      expect(sessionStorage.getItem('sgex_secure_token')).toBeNull();
    });

    test('clearToken also removes legacy tokens', () => {
      sessionStorage.setItem('github_token', 'legacy_token');
      localStorage.setItem('github_token', 'legacy_token');

      secureTokenStorage.clearToken();

      expect(sessionStorage.getItem('github_token')).toBeNull();
      expect(localStorage.getItem('github_token')).toBeNull();
    });
  });

  describe('Legacy Token Migration', () => {
    test('migrates valid legacy token successfully', () => {
      sessionStorage.setItem('github_token', validClassicToken);

      const migrated = secureTokenStorage.migrateLegacyToken();
      expect(migrated).toBe(true);

      // Check that token is now stored securely
      expect(secureTokenStorage.hasValidToken()).toBe(true);
      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved.token).toBe(validClassicToken);

      // Check that legacy storage is cleared
      expect(sessionStorage.getItem('github_token')).toBeNull();
    });

    test('does not migrate invalid legacy token', () => {
      sessionStorage.setItem('github_token', invalidToken);

      const migrated = secureTokenStorage.migrateLegacyToken();
      expect(migrated).toBe(false);

      expect(secureTokenStorage.hasValidToken()).toBe(false);
    });

    test('returns false when no legacy token exists', () => {
      const migrated = secureTokenStorage.migrateLegacyToken();
      expect(migrated).toBe(false);
    });

    test('prefers sessionStorage over localStorage for migration', () => {
      sessionStorage.setItem('github_token', validClassicToken);
      localStorage.setItem('github_token', validFineGrainedToken);

      const migrated = secureTokenStorage.migrateLegacyToken();
      expect(migrated).toBe(true);

      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved.token).toBe(validClassicToken); // Should use sessionStorage token
      expect(retrieved.type).toBe('classic');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles storage quota exceeded gracefully', () => {
      // Mock sessionStorage to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const success = secureTokenStorage.storeToken(validClassicToken);
      expect(success).toBe(false);

      // Restore original method
      Storage.prototype.setItem = originalSetItem;
    });

    test('handles btoa/atob errors gracefully', () => {
      // Store a valid token first
      const success = secureTokenStorage.storeToken(validClassicToken);
      expect(success).toBe(true);

      // Verify token was stored
      const storedData = sessionStorage.getItem('sgex_secure_token');
      expect(storedData).not.toBeNull();

      // Corrupt the stored data by modifying it directly
      const parsedData = JSON.parse(storedData);
      parsedData.token = 'invalid_base64_data_!!!';
      sessionStorage.setItem('sgex_secure_token', JSON.stringify(parsedData));

      const retrieved = secureTokenStorage.retrieveToken();
      expect(retrieved).toBeNull();
    });
  });
});