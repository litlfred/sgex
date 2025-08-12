import { OAuthDeviceFlowService } from './oauthDeviceFlowService';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('OAuthDeviceFlowService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set a test client ID
    process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID = 'test_client_id_12345';
    
    // Create a new service instance for each test
    service = new OAuthDeviceFlowService();
  });

  afterEach(() => {
    delete process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID;
    if (service) {
      service.reset();
    }
  });

  describe('checkConfiguration', () => {
    it('should return configured status when client ID is set', () => {
      const config = service.checkConfiguration();
      
      expect(config.isConfigured).toBe(true);
      expect(config.hasClientId).toBe(true);
      expect(config.clientId).toBe('test_cli...');
    });

    it('should return not configured when client ID is missing', () => {
      delete process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID;
      
      // Create new instance to pick up env change
      const newService = new OAuthDeviceFlowService();
      const config = newService.checkConfiguration();
      
      expect(config.isConfigured).toBe(false);
      expect(config.hasClientId).toBe(false);
      expect(config.clientId).toBe(null);
    });
  });

  describe('requestDeviceCode', () => {
    it('should successfully request device code', async () => {
      const mockResponse = {
        device_code: 'test_device_code_123',
        user_code: 'ABCD-1234',
        verification_uri: 'https://github.com/login/device',
        interval: 5,
        expires_in: 900
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await service.requestDeviceCode();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://github.com/login/device/code',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        })
      );
      
      // Check the body was properly formatted
      const callArgs = mockFetch.mock.calls[0];
      const bodyString = callArgs[1].body.toString();
      expect(bodyString).toBe('client_id=test_client_id_12345&scope=repo+read%3Aorg');

      expect(result).toEqual({
        userCode: 'ABCD-1234',
        verificationUrl: 'https://github.com/login/device',
        verificationUrlComplete: 'https://github.com/login/device?code=ABCD-1234',
        interval: 5,
        expiresIn: 900
      });
    });

    it('should throw error when client ID is not configured', async () => {
      delete process.env.REACT_APP_GITHUB_OAUTH_CLIENT_ID;
      
      // Create new instance to pick up env change
      const newService = new OAuthDeviceFlowService();
      
      await expect(newService.requestDeviceCode()).rejects.toThrow(
        'OAuth client ID not configured'
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid client_id')
      });

      await expect(service.requestDeviceCode()).rejects.toThrow(
        'Device code request failed: 400 Bad Request - Invalid client_id'
      );
    });
  });

  describe('isSupported', () => {
    it('should return true when browser supports required features', () => {
      expect(OAuthDeviceFlowService.isSupported()).toBe(true);
    });

    it('should return false when fetch is not available', () => {
      const originalFetch = global.fetch;
      delete global.fetch;
      
      expect(OAuthDeviceFlowService.isSupported()).toBe(false);
      
      global.fetch = originalFetch;
    });
  });

  describe('getPollingStatus', () => {
    it('should return correct initial status', () => {
      const status = service.getPollingStatus();
      
      expect(status).toEqual({
        isPolling: false,
        hasDeviceCode: false,
        userCode: null,
        verificationUrl: null,
        interval: 5
      });
    });

    it('should return correct status after device code request', async () => {
      const mockResponse = {
        device_code: 'test_device_code_123',
        user_code: 'ABCD-1234',
        verification_uri: 'https://github.com/login/device',
        interval: 10,
        expires_in: 900
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await service.requestDeviceCode();
      const status = service.getPollingStatus();
      
      expect(status).toEqual({
        isPolling: false,
        hasDeviceCode: true,
        userCode: 'ABCD-1234',
        verificationUrl: 'https://github.com/login/device',
        interval: 10
      });
    });
  });

  describe('reset', () => {
    it('should clear all device flow state', async () => {
      // First set up some state
      const mockResponse = {
        device_code: 'test_device_code_123',
        user_code: 'ABCD-1234',
        verification_uri: 'https://github.com/login/device',
        interval: 5,
        expires_in: 900
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await service.requestDeviceCode();
      
      // Verify state is set
      expect(service.getPollingStatus().hasDeviceCode).toBe(true);
      
      // Reset and verify state is cleared
      service.reset();
      
      const status = service.getPollingStatus();
      expect(status).toEqual({
        isPolling: false,
        hasDeviceCode: false,
        userCode: null,
        verificationUrl: null,
        interval: 5
      });
    });
  });
});