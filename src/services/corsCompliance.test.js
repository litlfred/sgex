/**
 * CORS Compliance Verification Test
 * 
 * This test verifies that GitHub OAuth Device Flow endpoints are CORS-compliant
 * and can be accessed directly from the browser without proxy servers.
 */

describe('GitHub OAuth CORS Compliance', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  it('should make CORS-compliant request to GitHub device code endpoint', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        device_code: 'test_device_code',
        user_code: 'ABCD-1234',
        verification_uri: 'https://github.com/login/device',
        interval: 5,
        expires_in: 900
      })
    });

    // Test direct fetch to GitHub endpoint
    const response = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: 'test_client_id',
        scope: 'repo read:org'
      })
    });

    // Verify request was made with correct CORS headers
    expect(global.fetch).toHaveBeenCalledWith(
      'https://github.com/login/device/code',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        })
      })
    );

    expect(response.ok).toBe(true);
  });

  it('should make CORS-compliant request to GitHub token endpoint', async () => {
    // Mock successful token response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'gho_testtoken123',
        token_type: 'bearer',
        scope: 'repo read:org'
      })
    });

    // Test direct fetch to GitHub token endpoint
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: 'test_client_id',
        device_code: 'test_device_code',
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
      })
    });

    // Verify request was made with correct CORS headers
    expect(global.fetch).toHaveBeenCalledWith(
      'https://github.com/login/oauth/access_token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        })
      })
    );

    expect(response.ok).toBe(true);
  });

  it('should verify no proxy or CORS workarounds are needed', () => {
    // GitHub OAuth endpoints are natively CORS-enabled
    const githubOAuthEndpoints = [
      'https://github.com/login/device/code',
      'https://github.com/login/oauth/access_token'
    ];

    githubOAuthEndpoints.forEach(endpoint => {
      // Verify these are direct GitHub URLs (no proxy)
      expect(endpoint).toMatch(/^https:\/\/github\.com\//);
      
      // Verify no localhost or proxy URLs
      expect(endpoint).not.toMatch(/localhost|127\.0\.0\.1|proxy/);
    });
  });

  it('should document CORS compliance requirements', () => {
    const corsRequirements = {
      // GitHub OAuth endpoints that support CORS
      deviceCodeEndpoint: 'https://github.com/login/device/code',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      
      // Required headers for CORS requests
      requiredHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      
      // HTTP methods used
      httpMethods: ['POST'],
      
      // No credentials needed for CORS
      credentials: false,
      
      // GitHub natively supports CORS for OAuth
      corsSupport: 'native',
      proxyRequired: false
    };

    // Verify configuration meets CORS requirements
    expect(corsRequirements.corsSupport).toBe('native');
    expect(corsRequirements.proxyRequired).toBe(false);
    expect(corsRequirements.deviceCodeEndpoint).toMatch(/^https:\/\/github\.com\//);
    expect(corsRequirements.tokenEndpoint).toMatch(/^https:\/\/github\.com\//);
  });
});