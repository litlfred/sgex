import { Octokit } from "@octokit/rest";
import { createOAuthDeviceAuth } from "@octokit/auth-oauth-device";
import { OAUTH_CONFIG } from "../config/oauth";

export class DeviceFlowAuthService {
  constructor() {
    this.auth = null;
    this.octokit = null;
  }

  /**
   * Start the GitHub Device Flow authentication process
   * @param {Array<string>} scopes - Required OAuth scopes
   * @param {Function} onVerification - Callback function called with verification details
   * @returns {Promise<{token: string, octokit: Octokit}>} Authentication result
   */
  async startDeviceFlow(scopes = OAUTH_CONFIG.scopes, onVerification = null) {
    try {
      // Create OAuth device auth instance
      this.auth = createOAuthDeviceAuth({
        clientType: "oauth-app",
        clientId: OAUTH_CONFIG.clientId,
        scopes,
        onVerification: (verification) => {
          // Call the provided callback with verification details
          if (onVerification) {
            onVerification({
              device_code: verification.device_code,
              user_code: verification.user_code,
              verification_uri: verification.verification_uri,
              verification_uri_complete: verification.verification_uri_complete,
              expires_in: verification.expires_in,
              interval: verification.interval
            });
          }
        },
      });

      // Start the authentication process - this will call onVerification and then poll
      const tokenAuth = await this.auth({ type: "oauth" });
      
      // Create Octokit instance with the obtained token
      this.octokit = new Octokit({ auth: tokenAuth.token });
      
      return {
        token: tokenAuth.token,
        octokit: this.octokit
      };
    } catch (error) {
      console.error('Device Flow authentication failed:', error);
      throw error;
    }
  }

  /**
   * Create an Octokit instance with the provided token
   * @param {string} token - GitHub OAuth token
   * @returns {Octokit} Configured Octokit instance
   */
  createOctokitWithToken(token) {
    return new Octokit({ auth: token });
  }

  /**
   * Clear authentication state
   */
  logout() {
    this.auth = null;
    this.octokit = null;
  }
}

// Create a singleton instance
const deviceFlowAuthService = new DeviceFlowAuthService();

export default deviceFlowAuthService;