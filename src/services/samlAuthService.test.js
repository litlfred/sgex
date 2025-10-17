/**
 * SAML Authorization Service Tests
 */

import samlAuthService from './samlAuthService';

describe('SAMLAuthService', () => {
  beforeEach(() => {
    // Reset service state before each test
    samlAuthService.reset();
    samlAuthService.registerModalCallback(null);
  });

  describe('detectSAMLError', () => {
    it('should detect SAML enforcement errors', () => {
      const error = {
        status: 403,
        message: 'Resource protected by organization SAML enforcement. You must grant your Personal Access token access to this organization.'
      };

      const result = samlAuthService.detectSAMLError(error);
      
      expect(result).not.toBeNull();
      expect(result.organization).toBeDefined();
      expect(result.message).toBe(error.message);
    });

    it('should return null for non-SAML 403 errors', () => {
      const error = {
        status: 403,
        message: 'Forbidden: insufficient permissions'
      };

      const result = samlAuthService.detectSAMLError(error);
      expect(result).toBeNull();
    });

    it('should return null for non-403 errors', () => {
      const error = {
        status: 404,
        message: 'Not found'
      };

      const result = samlAuthService.detectSAMLError(error);
      expect(result).toBeNull();
    });

    it('should extract organization name from error message', () => {
      const error = {
        status: 403,
        message: 'Resource protected by organization WorldHealthOrganization SAML enforcement.'
      };

      const result = samlAuthService.detectSAMLError(error);
      
      expect(result).not.toBeNull();
      expect(result.organization).toBe('WorldHealthOrganization');
    });
  });

  describe('handleSAMLError', () => {
    it('should handle SAML errors and call modal callback', () => {
      const mockCallback = jest.fn();
      samlAuthService.registerModalCallback(mockCallback);

      const error = {
        status: 403,
        message: 'Resource protected by organization SAML enforcement.'
      };

      const handled = samlAuthService.handleSAMLError(error, 'WorldHealthOrganization', 'smart-trust');

      expect(handled).toBe(true);
      expect(mockCallback).toHaveBeenCalledWith({
        organization: 'WorldHealthOrganization',
        repository: 'smart-trust',
        authorizationUrl: 'https://github.com/orgs/WorldHealthOrganization/sso',
        message: error.message,
        originalRequest: null
      });
    });

    it('should not handle non-SAML errors', () => {
      const mockCallback = jest.fn();
      samlAuthService.registerModalCallback(mockCallback);

      const error = {
        status: 404,
        message: 'Not found'
      };

      const handled = samlAuthService.handleSAMLError(error, 'someorg', 'somerepo');

      expect(handled).toBe(false);
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should respect cooldown period for same organization', () => {
      const mockCallback = jest.fn();
      samlAuthService.registerModalCallback(mockCallback);

      const error = {
        status: 403,
        message: 'Resource protected by organization SAML enforcement.'
      };

      // First call should work
      const handled1 = samlAuthService.handleSAMLError(error, 'TestOrg', 'repo1');
      expect(handled1).toBe(true);
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Second call within cooldown should still return true but not trigger modal
      const handled2 = samlAuthService.handleSAMLError(error, 'TestOrg', 'repo2');
      expect(handled2).toBe(true);
      expect(mockCallback).toHaveBeenCalledTimes(1); // Still only 1
    });

    it('should add request to pending requests', () => {
      const error = {
        status: 403,
        message: 'Resource protected by organization SAML enforcement.'
      };

      samlAuthService.handleSAMLError(error, 'TestOrg', 'test-repo');

      const pending = samlAuthService.getPendingRequests();
      expect(pending.has('TestOrg/test-repo')).toBe(true);
    });
  });

  describe('getSAMLAuthorizationUrl', () => {
    it('should generate correct GitHub SSO URL', () => {
      const url = samlAuthService.getSAMLAuthorizationUrl('WorldHealthOrganization');
      expect(url).toBe('https://github.com/orgs/WorldHealthOrganization/sso');
    });
  });

  describe('cooldown management', () => {
    it('should clear cooldown for organization', () => {
      const mockCallback = jest.fn();
      samlAuthService.registerModalCallback(mockCallback);

      const error = {
        status: 403,
        message: 'Resource protected by organization SAML enforcement.'
      };

      // First call
      samlAuthService.handleSAMLError(error, 'TestOrg', 'repo1');
      expect(mockCallback).toHaveBeenCalledTimes(1);

      // Clear cooldown and mark modal as closed
      samlAuthService.clearCooldown('TestOrg');
      samlAuthService.markModalClosed('TestOrg');

      // Second call should now work
      samlAuthService.handleSAMLError(error, 'TestOrg', 'repo2');
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it('should resolve pending request and clear cooldown', () => {
      const error = {
        status: 403,
        message: 'Resource protected by organization SAML enforcement.'
      };

      samlAuthService.handleSAMLError(error, 'TestOrg', 'test-repo');
      expect(samlAuthService.getPendingRequests().has('TestOrg/test-repo')).toBe(true);

      samlAuthService.resolvePendingRequest('TestOrg', 'test-repo');
      
      expect(samlAuthService.getPendingRequests().has('TestOrg/test-repo')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should clear all pending requests and cooldowns', () => {
      const error = {
        status: 403,
        message: 'Resource protected by organization SAML enforcement.'
      };

      // Add some pending requests
      samlAuthService.handleSAMLError(error, 'Org1', 'repo1');
      samlAuthService.handleSAMLError(error, 'Org2', 'repo2');

      expect(samlAuthService.getPendingRequests().size).toBeGreaterThan(0);

      // Reset
      samlAuthService.reset();

      expect(samlAuthService.getPendingRequests().size).toBe(0);
    });
  });
});
