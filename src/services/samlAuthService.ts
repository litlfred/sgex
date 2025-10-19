/**
 * SAML Authorization Service
 * 
 * Centralized service for handling GitHub SAML SSO authorization requests.
 * Prevents console spam by tracking SAML errors and providing a single
 * modal interface for users to authorize their Personal Access Tokens.
 * 
 * Supports cross-tab synchronization for SAML authentication state.
 */

import logger from '../utils/logger';
import crossTabSyncService, { CrossTabEventTypes } from './crossTabSyncService';

/**
 * SAML error details
 * @example { "organization": "who", "message": "SAML enforcement enabled" }
 */
export interface SAMLErrorDetails {
  /** Organization name */
  organization: string;
  /** Error message */
  message: string;
  /** Original error object */
  originalError: any;
}

/**
 * SAML modal information
 * @example { "organization": "who", "authorizationUrl": "https://github.com/orgs/who/sso" }
 */
export interface SAMLModalInfo {
  /** Organization name */
  organization: string;
  /** Repository name (optional) */
  repository: string | null;
  /** SAML authorization URL */
  authorizationUrl: string;
  /** Error message */
  message: string;
}

/**
 * SAML modal callback function
 */
export type SAMLModalCallback = (info: SAMLModalInfo) => void;

/**
 * SAML Authorization Service class
 * 
 * Manages SAML SSO authorization for GitHub organizations.
 * 
 * @openapi
 * components:
 *   schemas:
 *     SAMLErrorDetails:
 *       type: object
 *       properties:
 *         organization:
 *           type: string
 *         message:
 *           type: string
 */
class SAMLAuthService {
  private logger: any;
  private pendingSAMLRequests: Set<string>;
  private modalCallback: SAMLModalCallback | null;
  private recentSAMLErrors: Map<string, number>;
  private errorCooldownMs: number;

  constructor() {
    this.logger = logger.getLogger('SAMLAuthService');
    this.pendingSAMLRequests = new Set();
    this.modalCallback = null;
    this.recentSAMLErrors = new Map(); // Track recent errors to prevent spam
    this.errorCooldownMs = 60000; // 1 minute cooldown per org
    
    // Set up cross-tab synchronization
    this.setupCrossTabSync();
  }

  /**
   * Set up cross-tab synchronization for SAML authentication
   */
  setupCrossTabSync() {
    if (!crossTabSyncService.isAvailable()) {
      this.logger.warn('Cross-tab sync not available - SAML state will not sync across tabs');
      return;
    }

    // Listen for SAML authentication events from other tabs
    crossTabSyncService.on(CrossTabEventTypes.SAML_AUTHENTICATED, (data) => {
      this.logger.debug('SAML authentication event received from another tab', { 
        organization: data.organization 
      });
      
      // Clear cooldown for this organization since auth was successful
      if (data.organization) {
        this.clearCooldown(data.organization);
        this.resolvePendingRequest(data.organization, data.repository);
      }
    });

    this.logger.debug('Cross-tab sync configured for SAML authentication');
  }

  /**
   * Register a callback to show the SAML authorization modal
   */
  registerModalCallback(callback: SAMLModalCallback): void {
    this.modalCallback = callback;
    this.logger.debug('SAML modal callback registered');
  }

  /**
   * Detect if an error is a SAML enforcement error
   */
  detectSAMLError(error: any): SAMLErrorDetails | null {
    if (error.status === 403 && error.message) {
      const message = error.message.toLowerCase();
      if (message.includes('saml') && message.includes('enforcement')) {
        // Extract organization name from error message if possible
        const orgMatch = error.message.match(/organization[:\s]+(\w+)/i);
        const organization = orgMatch ? orgMatch[1] : 'unknown';
        
        return {
          organization,
          message: error.message,
          originalError: error
        };
      }
    }
    return null;
  }

  /**
   * Check if we should handle this SAML error or if it's too recent
   */
  shouldHandleSAMLError(organization: string): boolean {
    const lastError = this.recentSAMLErrors.get(organization);
    if (lastError) {
      const timeSinceError = Date.now() - lastError;
      if (timeSinceError < this.errorCooldownMs) {
        this.logger.debug('SAML error cooldown active', { 
          organization, 
          timeSinceError,
          cooldownMs: this.errorCooldownMs 
        });
        return false;
      }
    }
    return true;
  }

  /**
   * Handle a SAML enforcement error
   * 
   * @openapi
   * /api/saml/handle-error:
   *   post:
   *     summary: Handle SAML authorization error
   *     parameters:
   *       - name: owner
   *         in: query
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: SAML error handled
   */
  handleSAMLError(error: any, owner: string, repo: string | null = null): boolean {
    const samlError = this.detectSAMLError(error);
    
    if (!samlError) {
      return false;
    }

    const organization = owner; // Use owner as the organization
    
    // Check if we should handle this error (cooldown check)
    if (!this.shouldHandleSAMLError(organization)) {
      this.logger.debug('Skipping SAML error due to cooldown', { organization });
      return true; // Still return true as it was a SAML error
    }

    // Mark this organization as having a recent error
    this.recentSAMLErrors.set(organization, Date.now());

    // Log the SAML error without spamming
    this.logger.warn('SAML SSO authorization required', {
      organization,
      repository: repo,
      message: samlError.message
    });

    // Add to pending requests
    const requestKey = repo ? `${organization}/${repo}` : organization;
    this.pendingSAMLRequests.add(requestKey);

    // Show modal if callback is registered
    if (this.modalCallback) {
      this.modalCallback({
        organization,
        repository: repo,
        authorizationUrl: this.getSAMLAuthorizationUrl(organization),
        message: samlError.message
      });
    } else {
      this.logger.warn('No modal callback registered for SAML authorization', {
        organization,
        repository: repo
      });
    }

    return true;
  }

  /**
   * Get the GitHub URL for SAML SSO authorization
   */
  getSAMLAuthorizationUrl(organization: string): string {
    return `https://github.com/orgs/${organization}/sso`;
  }

  /**
   * Clear cooldown for an organization (called after successful authorization)
   */
  clearCooldown(organization: string): void {
    this.recentSAMLErrors.delete(organization);
    this.logger.debug('SAML error cooldown cleared', { organization });
  }

  /**
   * Mark SAML authorization as successful and broadcast to other tabs
   * @param {string} organization - Organization name
   * @param {string} repo - Repository name (optional)
   */
  markSAMLAuthorized(organization, repo = null) {
    this.clearCooldown(organization);
    this.resolvePendingRequest(organization, repo);
    
    // Broadcast SAML authentication event to other tabs
    if (crossTabSyncService.isAvailable()) {
      crossTabSyncService.broadcast(CrossTabEventTypes.SAML_AUTHENTICATED, {
        organization: organization,
        repository: repo,
        timestamp: Date.now()
      });
      this.logger.debug('SAML authentication broadcasted to other tabs', { organization });
    }
  }

  /**
   * Remove a pending SAML request
   */
  resolvePendingRequest(organization: string, repo: string | null = null): void {
    const requestKey = repo ? `${organization}/${repo}` : organization;
    this.pendingSAMLRequests.delete(requestKey);
    this.clearCooldown(organization);
  }

  /**
   * Get all pending SAML requests
   */
  getPendingRequests(): Set<string> {
    return new Set(this.pendingSAMLRequests);
  }

  /**
   * Clear all pending requests and cooldowns
   */
  reset(): void {
    this.pendingSAMLRequests.clear();
    this.recentSAMLErrors.clear();
    this.logger.debug('SAML auth service reset');
  }
}

// Create singleton instance
const samlAuthService = new SAMLAuthService();

export default samlAuthService;
