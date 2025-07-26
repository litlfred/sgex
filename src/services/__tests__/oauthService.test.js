import oauthService from '../oauthService';

// Mock fetch globally
global.fetch = jest.fn();

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn().mockImplementation(() => ({
    result: {
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue({ onsuccess: null }),
          put: jest.fn().mockReturnValue({ onsuccess: null })
        })
      }),
      createObjectStore: jest.fn()
    },
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null
  }))
};

global.indexedDB = mockIndexedDB;

describe('OAuthService', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Clear tokens between tests
    oauthService.tokens.clear();
  });

  describe('startDeviceFlow', () => {
    test('initiates device flow successfully', async () => {
      const mockResponse = {
        device_code: 'test-device-code',
        user_code: 'A1B2-C3D4',
        verification_uri: 'https://github.com/login/device',
        verification_uri_complete: 'https://github.com/login/device?user_code=A1B2-C3D4',
        expires_in: 900,
        interval: 5
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await oauthService.startDeviceFlow('READ_ONLY', 'owner', 'repo');

      expect(fetch).toHaveBeenCalledWith('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: 'sgex-workbench-dev',
          scope: 'read:user public_repo',
        }),
      });

      expect(result).toEqual({
        ...mockResponse,
        accessLevel: 'READ_ONLY',
        repoOwner: 'owner',
        repoName: 'repo',
      });
    });

    test('handles device flow initiation failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(oauthService.startDeviceFlow('READ_ONLY')).rejects.toThrow('Device flow initiation failed: 400');
    });
  });

  describe('pollDeviceFlow', () => {
    test('resolves when access token is received', async () => {
      const mockTokenResponse = {
        access_token: 'test-access-token',
        scope: 'read:user public_repo',
        token_type: 'bearer'
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockTokenResponse
      });

      const result = await oauthService.pollDeviceFlow('test-device-code', 1);

      expect(fetch).toHaveBeenCalledWith('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: 'sgex-workbench-dev',
          device_code: 'test-device-code',
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });

      expect(result).toEqual(mockTokenResponse);
    });

    test('continues polling when authorization is pending', async () => {
      let callCount = 0;
      fetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            json: async () => ({ error: 'authorization_pending' })
          });
        } else {
          return Promise.resolve({
            json: async () => ({
              access_token: 'test-access-token',
              scope: 'read:user public_repo',
              token_type: 'bearer'
            })
          });
        }
      });

      const result = await oauthService.pollDeviceFlow('test-device-code', 0.1);

      expect(result).toHaveProperty('access_token', 'test-access-token');
      expect(callCount).toBe(2);
    });

    test('rejects on access denied', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ 
          error: 'access_denied',
          error_description: 'User denied access'
        })
      });

      await expect(oauthService.pollDeviceFlow('test-device-code', 1))
        .rejects.toThrow('User denied access');
    });
  });

  describe('token management', () => {
    test('stores token correctly', async () => {
      const tokenData = {
        access_token: 'test-token',
        scope: 'read:user public_repo',
        token_type: 'bearer',
        expires_in: 3600
      };

      const result = await oauthService.storeToken(tokenData, 'READ_ONLY', 'owner', 'repo');

      expect(result).toMatchObject({
        token: 'test-token',
        accessLevel: 'READ_ONLY',
        repoOwner: 'owner',
        repoName: 'repo',
        scope: 'read:user public_repo',
        tokenType: 'bearer'
      });

      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('expiresAt');
    });

    test('generates correct token keys', () => {
      expect(oauthService.generateTokenKey('READ_ONLY', 'owner', 'repo'))
        .toBe('READ_ONLY:owner/repo');
      
      expect(oauthService.generateTokenKey('WRITE_ACCESS', 'owner'))
        .toBe('WRITE_ACCESS:owner/*');
      
      expect(oauthService.generateTokenKey('READ_ONLY'))
        .toBe('READ_ONLY:global');
    });

    test('retrieves appropriate token', async () => {
      // Store tokens with different scopes
      await oauthService.storeToken(
        { access_token: 'global-token', token_type: 'bearer' },
        'READ_ONLY'
      );
      
      await oauthService.storeToken(
        { access_token: 'owner-token', token_type: 'bearer' },
        'READ_ONLY',
        'owner'
      );
      
      await oauthService.storeToken(
        { access_token: 'repo-token', token_type: 'bearer' },
        'READ_ONLY',
        'owner',
        'repo'
      );

      // Should prefer most specific token
      const repoToken = oauthService.getToken('READ_ONLY', 'owner', 'repo');
      expect(repoToken.token).toBe('repo-token');

      // Should fall back to owner token for different repo
      const ownerToken = oauthService.getToken('READ_ONLY', 'owner', 'other-repo');
      expect(ownerToken.token).toBe('owner-token');

      // Should fall back to global token for different owner
      const globalToken = oauthService.getToken('READ_ONLY', 'other-owner', 'repo');
      expect(globalToken.token).toBe('global-token');
    });

    test('checks token validity', () => {
      const validToken = {
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      };

      const expiredToken = {
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      };

      const noExpiryToken = {
        token: 'no-expiry-token'
      };

      expect(oauthService.isTokenValid(validToken)).toBe(true);
      expect(oauthService.isTokenValid(expiredToken)).toBe(false);
      expect(oauthService.isTokenValid(noExpiryToken)).toBe(true);
    });

    test('checks access correctly', async () => {
      await oauthService.storeToken(
        { access_token: 'read-token', token_type: 'bearer' },
        'READ_ONLY',
        'owner',
        'repo'
      );

      expect(oauthService.hasAccess('READ_ONLY', 'owner', 'repo')).toBe(true);
      expect(oauthService.hasAccess('WRITE_ACCESS', 'owner', 'repo')).toBe(false);
      expect(oauthService.hasAccess('READ_ONLY', 'other-owner', 'repo')).toBe(false);
    });

    test('removes token correctly', async () => {
      await oauthService.storeToken(
        { access_token: 'test-token', token_type: 'bearer' },
        'READ_ONLY',
        'owner',
        'repo'
      );

      const tokenKey = 'READ_ONLY:owner/repo';
      expect(oauthService.hasAccess('READ_ONLY', 'owner', 'repo')).toBe(true);

      await oauthService.removeToken(tokenKey);
      expect(oauthService.hasAccess('READ_ONLY', 'owner', 'repo')).toBe(false);
    });

    test('clears all tokens', async () => {
      await oauthService.storeToken(
        { access_token: 'token1', token_type: 'bearer' },
        'READ_ONLY'
      );
      
      await oauthService.storeToken(
        { access_token: 'token2', token_type: 'bearer' },
        'WRITE_ACCESS',
        'owner'
      );

      expect(oauthService.getAllTokens()).toHaveLength(2);

      await oauthService.clearAllTokens();

      expect(oauthService.getAllTokens()).toHaveLength(0);
    });
  });

  describe('Octokit creation', () => {
    test('creates authenticated Octokit when token exists', async () => {
      await oauthService.storeToken(
        { access_token: 'test-token', token_type: 'bearer' },
        'READ_ONLY',
        'owner',
        'repo'
      );

      const octokit = oauthService.createOctokit('READ_ONLY', 'owner', 'repo');
      
      // Check that Octokit was created (can't easily test auth without making real requests)
      expect(octokit).toBeDefined();
      expect(octokit.rest).toBeDefined();
    });

    test('creates unauthenticated Octokit when no token exists', () => {
      const octokit = oauthService.createOctokit('READ_ONLY', 'owner', 'repo');
      
      expect(octokit).toBeDefined();
      expect(octokit.rest).toBeDefined();
    });
  });
});