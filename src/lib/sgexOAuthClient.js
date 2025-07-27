/**
 * SGEX OAuth Client Library
 * 
 * A client-side library for managing GitHub OAuth access tokens and permissions
 * for WHO SMART Guidelines DAK (Digital Adaptation Kit) components.
 * 
 * This library provides a simple interface for:
 * - Managing OAuth tokens with granular permissions
 * - Checking access levels for specific repositories and components
 * - Making authenticated GitHub API requests
 * - Handling permission upgrades when needed
 */

import oauthService from '../services/oauthService';
import tokenManagerService, { ACCESS_LEVELS, DAK_COMPONENTS } from '../services/tokenManagerService';

/**
 * Main SGEX OAuth client class
 */
class SGEXOAuthClient {
  constructor() {
    this.oauthService = oauthService;
    this.tokenManager = tokenManagerService;
  }

  /**
   * Initialize the OAuth client by loading stored tokens
   */
  async initialize() {
    await this.oauthService.loadTokensFromStorage();
  }

  /**
   * Check if user has access to a specific DAK component in a repository
   * @param {string} componentId - DAK component ID
   * @param {string} repoOwner - Repository owner
   * @param {string} repoName - Repository name
   * @param {string} operation - 'read' or 'write'
   * @returns {Promise<Object>} Access check result
   */
  async checkComponentAccess(componentId, repoOwner, repoName, operation = 'read') {
    if (operation === 'read') {
      return this.tokenManager.checkComponentReadAccess(componentId, repoOwner, repoName);
    } else {
      return this.tokenManager.checkComponentWriteAccess(componentId, repoOwner, repoName);
    }
  }

  /**
   * Request authorization for a specific DAK component and repository
   * @param {string} componentId - DAK component ID
   * @param {string} repoOwner - Repository owner
   * @param {string} repoName - Repository name
   * @param {string} operation - 'read' or 'write'
   * @returns {Promise<Object>} OAuth flow information
   */
  async requestComponentAuthorization(componentId, repoOwner, repoName, operation = 'read') {
    return this.tokenManager.requestComponentAuthorization(componentId, repoOwner, repoName, operation);
  }

  /**
   * Get an authenticated Octokit instance for a specific component operation
   * @param {string} componentId - DAK component ID
   * @param {string} repoOwner - Repository owner
   * @param {string} repoName - Repository name
   * @param {string} operation - 'read' or 'write'
   * @returns {Octokit} Authenticated Octokit instance
   */
  getOctokitForComponent(componentId, repoOwner, repoName, operation = 'read') {
    return this.tokenManager.getOctokitForComponent(componentId, repoOwner, repoName, operation);
  }

  /**
   * Get repository access summary showing all available access levels and components
   * @param {string} repoOwner - Repository owner
   * @param {string} repoName - Repository name
   * @returns {Promise<Object>} Access summary
   */
  async getRepositoryAccessSummary(repoOwner, repoName) {
    return this.tokenManager.getRepositoryAccessSummary(repoOwner, repoName);
  }

  /**
   * Get all available DAK components
   * @returns {Array} Array of DAK component definitions
   */
  getAvailableComponents() {
    return this.tokenManager.getAvailableComponents();
  }

  /**
   * Get all access levels
   * @returns {Array} Array of access level definitions
   */
  getAccessLevels() {
    return this.tokenManager.getAccessLevels();
  }

  /**
   * Get component ID from a file path
   * @param {string} filePath - File path to analyze
   * @returns {string|null} Component ID or null if not recognized
   */
  getComponentFromFilePath(filePath) {
    return this.tokenManager.getComponentFromFilePath(filePath);
  }

  /**
   * Validate if a file path belongs to a specific component
   * @param {string} componentId - DAK component ID
   * @param {string} filePath - File path to validate
   * @returns {boolean} True if file belongs to component
   */
  validateComponentFilePath(componentId, filePath) {
    return this.tokenManager.validateComponentFilePath(componentId, filePath);
  }

  /**
   * Generate authorization help content for a component
   * @param {string} componentId - DAK component ID
   * @param {string} operation - 'read' or 'write'
   * @returns {Object|null} Help content or null if invalid component
   */
  generateAuthorizationHelp(componentId, operation = 'read') {
    return this.tokenManager.generateAuthorizationHelp(componentId, operation);
  }

  /**
   * Get all stored OAuth tokens (tokens are masked for security)
   * @returns {Array} Array of token information
   */
  getAllTokens() {
    return this.oauthService.getAllTokens();
  }

  /**
   * Remove a specific OAuth token
   * @param {string} tokenKey - Token key to remove
   * @returns {Promise<void>}
   */
  async removeToken(tokenKey) {
    return this.oauthService.removeToken(tokenKey);
  }

  /**
   * Clear all OAuth tokens
   * @returns {Promise<void>}
   */
  async clearAllTokens() {
    return this.oauthService.clearAllTokens();
  }

  /**
   * Start OAuth device flow for specific access level
   * @param {string} accessLevel - 'READ_ONLY' or 'WRITE_ACCESS'
   * @param {string} repoOwner - Optional repository owner
   * @param {string} repoName - Optional repository name
   * @returns {Promise<Object>} Device flow information
   */
  async startOAuthFlow(accessLevel = 'READ_ONLY', repoOwner = null, repoName = null) {
    return this.oauthService.startDeviceFlow(accessLevel, repoOwner, repoName);
  }

  /**
   * Poll for OAuth device flow completion
   * @param {string} deviceCode - Device code from startOAuthFlow
   * @param {number} interval - Polling interval in seconds
   * @returns {Promise<Object>} Token data when authorization completes
   */
  async pollOAuthFlow(deviceCode, interval = 5) {
    return this.oauthService.pollDeviceFlow(deviceCode, interval);
  }

  /**
   * Store OAuth token after successful authorization
   * @param {Object} tokenData - Token data from OAuth flow
   * @param {string} accessLevel - Access level granted
   * @param {string} repoOwner - Optional repository owner
   * @param {string} repoName - Optional repository name
   * @returns {Promise<Object>} Stored token information
   */
  async storeToken(tokenData, accessLevel, repoOwner = null, repoName = null) {
    return this.oauthService.storeToken(tokenData, accessLevel, repoOwner, repoName);
  }

  /**
   * Get current authenticated user information
   * @returns {Promise<Object>} User data from GitHub
   */
  async getCurrentUser() {
    return this.oauthService.getCurrentUser();
  }

  /**
   * Check repository permissions for the authenticated user
   * @param {string} repoOwner - Repository owner
   * @param {string} repoName - Repository name
   * @returns {Promise<Object>} Permission information
   */
  async checkRepositoryPermissions(repoOwner, repoName) {
    return this.oauthService.checkRepositoryPermissions(repoOwner, repoName);
  }
}

// Create and export singleton instance
const sgexOAuthClient = new SGEXOAuthClient();

// Export both the class and singleton for different use cases
export { SGEXOAuthClient, ACCESS_LEVELS, DAK_COMPONENTS };
export default sgexOAuthClient;

/**
 * Example usage:
 * 
 * ```javascript
 * import sgexOAuthClient from './sgexOAuthClient';
 * 
 * // Initialize the client
 * await sgexOAuthClient.initialize();
 * 
 * // Check if user can read business processes in a repo
 * const readAccess = await sgexOAuthClient.checkComponentAccess(
 *   'business-processes', 
 *   'WorldHealthOrganization', 
 *   'smart-anc', 
 *   'read'
 * );
 * 
 * if (!readAccess.hasAccess) {
 *   // Request authorization
 *   const authFlow = await sgexOAuthClient.requestComponentAuthorization(
 *     'business-processes',
 *     'WorldHealthOrganization',
 *     'smart-anc',
 *     'read'
 *   );
 *   
 *   // Handle OAuth flow...
 * }
 * 
 * // Make authenticated API request
 * const octokit = sgexOAuthClient.getOctokitForComponent(
 *   'business-processes',
 *   'WorldHealthOrganization',
 *   'smart-anc',
 *   'read'
 * );
 * 
 * const { data } = await octokit.rest.repos.getContent({
 *   owner: 'WorldHealthOrganization',
 *   repo: 'smart-anc',
 *   path: 'input/bpmn'
 * });
 * ```
 */