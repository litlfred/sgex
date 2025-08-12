/**
 * GitHub OAuth Device Flow Service
 * 
 * Implements GitHub's Device Flow (RFC 8628) for frontend-only OAuth authentication.
 * This service handles the complete Device Flow process:
 * 1. Request device and user codes from GitHub
 * 2. Display verification URL and user code to user
 * 3. Poll GitHub for access token after user authorization
 * 4. Store and validate OAuth tokens
 * 
 * Features:
 * - 100% frontend implementation (no backend required)
 * - CORS compliant - all requests go directly to GitHub
 * - Uses only public OAuth client_id (no secrets)
 * - Secure token storage integration
 * - Rate limit handling and exponential backoff
 */

import logger from '../utils/logger';
import secureTokenStorage from './secureTokenStorage';

class OAuthDeviceFlowService {
  constructor() {
    this.logger = logger.getLogger('OAuthDeviceFlowService');
    
    // GitHub OAuth Device Flow endpoints (CORS enabled)
    this.deviceCodeEndpoint = 'https://github.com/login/device/code';
    this.tokenEndpoint = 'https://github.com/login/oauth/access_token';
    this.verificationUri = 'https://github.com/login/device';
    
    // OAuth client configuration
    this.clientId = process.env.REACT_APP_SGEX_GITHUB_OAUTH_CLIENT_ID || '';
    
    // Device flow state
    this.deviceCode = null;
    this.userCode = null;
    this.verificationUrl = null;
    this.interval = 5; // Default polling interval in seconds
    this.expiresIn = 900; // Default expiration time in seconds
    this.pollingActive = false;
    this.pollingTimeoutId = null;
    
    this.logger.debug('OAuthDeviceFlowService instance created', {
      hasClientId: !!this.clientId,
      clientIdMask: this.clientId ? `${this.clientId.substring(0, 8)}...` : 'none'
    });
  }

  /**
   * Check if OAuth Device Flow is properly configured
   * @returns {object} Configuration status
   */
  checkConfiguration() {
    const isConfigured = !!this.clientId;
    
    if (!isConfigured) {
      this.logger.warn('OAuth Device Flow not configured - missing client ID');
    }
    
    return {
      isConfigured,
      clientId: this.clientId ? `${this.clientId.substring(0, 8)}...` : null,
      hasClientId: !!this.clientId
    };
  }

  /**
   * Step 1: Request device and user codes from GitHub
   * @returns {object} Device authorization response
   */
  async requestDeviceCode() {
    this.logger.debug('Requesting device code from GitHub');
    
    if (!this.clientId) {
      throw new Error('OAuth client ID not configured. Please set REACT_APP_SGEX_GITHUB_OAUTH_CLIENT_ID environment variable.');
    }

    const requestBody = new URLSearchParams({
      client_id: this.clientId,
      scope: 'repo read:org' // Standard scopes for SGEX functionality
    });

    try {
      const response = await fetch(this.deviceCodeEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Device code request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      // Store device flow data
      this.deviceCode = data.device_code;
      this.userCode = data.user_code;
      this.verificationUrl = data.verification_uri || this.verificationUri;
      this.interval = data.interval || 5;
      this.expiresIn = data.expires_in || 900;

      this.logger.debug('Device code received successfully', {
        userCode: this.userCode,
        verificationUrl: this.verificationUrl,
        interval: this.interval,
        expiresIn: this.expiresIn
      });

      return {
        userCode: this.userCode,
        verificationUrl: this.verificationUrl,
        verificationUrlComplete: `${this.verificationUrl}?code=${this.userCode}`,
        interval: this.interval,
        expiresIn: this.expiresIn
      };
    } catch (error) {
      this.logger.error('Failed to request device code', { error: error.message });
      throw error;
    }
  }

  /**
   * Step 2: Poll GitHub for access token after user authorization
   * @param {function} onUpdate - Callback for polling status updates
   * @returns {Promise<object>} Token response or null if expired/cancelled
   */
  async pollForToken(onUpdate = () => {}) {
    this.logger.debug('Starting token polling');
    
    if (!this.deviceCode) {
      throw new Error('No device code available. Call requestDeviceCode() first.');
    }

    this.pollingActive = true;
    const startTime = Date.now();
    const expirationTime = startTime + (this.expiresIn * 1000);
    let attempt = 0;
    let currentInterval = this.interval;

    const poll = async () => {
      if (!this.pollingActive) {
        this.logger.debug('Polling cancelled by user');
        return null;
      }

      if (Date.now() > expirationTime) {
        this.logger.warn('Device code expired during polling');
        this.pollingActive = false;
        onUpdate({ status: 'expired', message: 'Authorization code expired. Please start over.' });
        return null;
      }

      attempt++;
      this.logger.debug(`Polling attempt ${attempt}`, { interval: currentInterval });
      
      onUpdate({ 
        status: 'polling', 
        message: 'Waiting for authorization...', 
        attempt,
        timeRemaining: Math.ceil((expirationTime - Date.now()) / 1000)
      });

      try {
        const requestBody = new URLSearchParams({
          client_id: this.clientId,
          device_code: this.deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        });

        const response = await fetch(this.tokenEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: requestBody
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
          // Success! We have an access token
          this.pollingActive = false;
          
          const tokenData = {
            access_token: data.access_token,
            token_type: data.token_type || 'bearer',
            scope: data.scope || 'repo read:org'
          };

          this.logger.debug('Access token received successfully', {
            tokenType: tokenData.token_type,
            scope: tokenData.scope,
            tokenMask: secureTokenStorage.maskToken(tokenData.access_token)
          });

          onUpdate({ status: 'success', message: 'Authorization successful!' });
          return tokenData;
        }

        // Handle specific error cases
        if (data.error) {
          switch (data.error) {
            case 'authorization_pending':
              // User hasn't authorized yet, continue polling
              this.logger.debug('Authorization pending, continuing to poll');
              break;
              
            case 'slow_down':
              // GitHub is asking us to slow down
              currentInterval = Math.min(currentInterval * 2, 60); // Exponential backoff, max 60s
              this.logger.debug('Rate limited, slowing down polling', { newInterval: currentInterval });
              onUpdate({ 
                status: 'slow_down', 
                message: 'Rate limited, slowing down polling...', 
                interval: currentInterval 
              });
              break;
              
            case 'expired_token':
              this.logger.warn('Device code expired');
              this.pollingActive = false;
              onUpdate({ status: 'expired', message: 'Authorization code expired. Please start over.' });
              return null;
              
            case 'access_denied':
              this.logger.warn('User denied authorization');
              this.pollingActive = false;
              onUpdate({ status: 'denied', message: 'Authorization was denied by user.' });
              return null;
              
            default:
              this.logger.error('Unknown error during token polling', { error: data.error, description: data.error_description });
              this.pollingActive = false;
              onUpdate({ status: 'error', message: `Authorization error: ${data.error_description || data.error}` });
              return null;
          }
        }

        // Continue polling
        if (this.pollingActive) {
          this.pollingTimeoutId = setTimeout(poll, currentInterval * 1000);
        }

      } catch (error) {
        this.logger.error('Error during token polling', { error: error.message, attempt });
        
        // On network errors, continue polling with exponential backoff
        currentInterval = Math.min(currentInterval * 1.5, 30);
        onUpdate({ 
          status: 'error', 
          message: `Network error, retrying in ${currentInterval}s...`, 
          interval: currentInterval 
        });
        
        if (this.pollingActive) {
          this.pollingTimeoutId = setTimeout(poll, currentInterval * 1000);
        }
      }
    };

    // Start polling
    return poll();
  }

  /**
   * Cancel active polling
   */
  cancelPolling() {
    this.logger.debug('Cancelling OAuth polling');
    this.pollingActive = false;
    
    if (this.pollingTimeoutId) {
      clearTimeout(this.pollingTimeoutId);
      this.pollingTimeoutId = null;
    }
  }

  /**
   * Complete OAuth Device Flow process
   * @param {function} onUpdate - Callback for status updates
   * @returns {Promise<object>} Complete authentication result
   */
  async authenticateWithDeviceFlow(onUpdate = () => {}) {
    this.logger.debug('Starting complete OAuth Device Flow authentication');
    
    try {
      // Step 1: Get device code
      onUpdate({ status: 'requesting_code', message: 'Requesting authorization code...' });
      const deviceAuth = await this.requestDeviceCode();
      
      // Step 2: Show user the verification URL and code
      onUpdate({ 
        status: 'awaiting_authorization', 
        message: 'Please authorize the application in your browser',
        deviceAuth 
      });
      
      // Step 3: Poll for token
      const tokenData = await this.pollForToken(onUpdate);
      
      if (!tokenData) {
        return { success: false, error: 'Authorization was not completed' };
      }
      
      // Step 4: Store token securely
      const stored = secureTokenStorage.storeToken(tokenData.access_token);
      if (!stored) {
        this.logger.error('Failed to store OAuth token securely');
        return { success: false, error: 'Failed to store authentication token' };
      }
      
      this.logger.debug('OAuth Device Flow authentication completed successfully');
      
      return {
        success: true,
        token: tokenData.access_token,
        tokenType: 'oauth',
        scope: tokenData.scope
      };
      
    } catch (error) {
      this.logger.error('OAuth Device Flow authentication failed', { error: error.message });
      this.cancelPolling();
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if OAuth Device Flow is supported by the browser
   * @returns {boolean} True if supported
   */
  static isSupported() {
    return !!(window.fetch && window.URLSearchParams && window.Promise);
  }

  /**
   * Get current polling status
   * @returns {object} Polling status information
   */
  getPollingStatus() {
    return {
      isPolling: this.pollingActive,
      hasDeviceCode: !!this.deviceCode,
      userCode: this.userCode,
      verificationUrl: this.verificationUrl,
      interval: this.interval
    };
  }

  /**
   * Clear device flow state
   */
  reset() {
    this.logger.debug('Resetting OAuth Device Flow state');
    this.cancelPolling();
    this.deviceCode = null;
    this.userCode = null;
    this.verificationUrl = null;
    this.interval = 5;
    this.expiresIn = 900;
  }
}

// Create singleton instance
const oauthDeviceFlowService = new OAuthDeviceFlowService();

// Export both the class and the singleton
export { OAuthDeviceFlowService };
export default oauthDeviceFlowService;