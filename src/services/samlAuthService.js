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

class SAMLAuthService {
  constructor() {
    this.logger = logger.getLogger('SAMLAuthService');
    this.pendingSAMLRequests = new Set();
    this.modalCallback = null;
    this.recentSAMLErrors = new Map(); // Track recent errors to prevent spam
    this.errorCooldownMs = 60000; // 1 minute cooldown per org
    this.sessionStorageKey = 'sgex_saml_state';
    this.activeModals = new Map(); // Track active modals per org
    
    // Load state from session storage
    this.loadStateFromStorage();
    
    // Set up cross-tab synchronization
    this.setupCrossTabSync();
  }

  /**
   * Load state from session storage
   */
  loadStateFromStorage() {
    try {
      const stored = sessionStorage.getItem(this.sessionStorageKey);
      if (stored) {
        const state = JSON.parse(stored);
        
        // Restore pending requests
        if (state.pendingRequests) {
          this.pendingSAMLRequests = new Set(state.pendingRequests);
        }
        
        // Restore cooldowns (with timestamp check)
        if (state.cooldowns) {
          const now = Date.now();
          Object.entries(state.cooldowns).forEach(([org, timestamp]) => {
            if (now - timestamp < this.errorCooldownMs) {
              this.recentSAMLErrors.set(org, timestamp);
            }
          });
        }
        
        this.logger.debug('SAML state loaded from session storage', {
          pendingRequests: this.pendingSAMLRequests.size,
          cooldowns: this.recentSAMLErrors.size
        });
      }
    } catch (error) {
      this.logger.warn('Failed to load SAML state from session storage', {
        error: error.message
      });
    }
  }

  /**
   * Save state to session storage
   */
  saveStateToStorage() {
    try {
      const state = {
        pendingRequests: Array.from(this.pendingSAMLRequests),
        cooldowns: Object.fromEntries(this.recentSAMLErrors),
        timestamp: Date.now()
      };
      
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(state));
      
      this.logger.debug('SAML state saved to session storage', {
        pendingRequests: this.pendingSAMLRequests.size,
        cooldowns: this.recentSAMLErrors.size
      });
    } catch (error) {
      this.logger.warn('Failed to save SAML state to session storage', {
        error: error.message
      });
    }
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

    // Listen for modal open events to coordinate single modal per org
    crossTabSyncService.on(CrossTabEventTypes.SAML_MODAL_OPENED, (data) => {
      if (data.organization) {
        this.logger.debug('SAML modal opened in another tab', {
          organization: data.organization,
          tabId: data.tabId
        });
        
        // Track that another tab has modal open for this org
        this.activeModals.set(data.organization, {
          tabId: data.tabId,
          timestamp: data.timestamp
        });
      }
    });

    // Listen for modal close events
    crossTabSyncService.on(CrossTabEventTypes.SAML_MODAL_CLOSED, (data) => {
      if (data.organization) {
        this.logger.debug('SAML modal closed in another tab', {
          organization: data.organization
        });
        
        // Remove from active modals
        this.activeModals.delete(data.organization);
      }
    });

    this.logger.debug('Cross-tab sync configured for SAML authentication');
  }

  /**
   * Register a callback to show the SAML authorization modal
   * @param {Function} callback - Function to display modal with organization info
   */
  registerModalCallback(callback) {
    this.modalCallback = callback;
    this.logger.debug('SAML modal callback registered');
  }

  /**
   * Detect if an error is a SAML enforcement error
   * @param {Error} error - Error object from GitHub API
   * @returns {Object|null} SAML error details or null if not a SAML error
   */
  detectSAMLError(error) {
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
   * @param {string} organization - Organization name
   * @returns {boolean} True if we should handle this error
   */
  shouldHandleSAMLError(organization) {
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
   * Check if modal is already open for this organization in any tab
   * @param {string} organization - Organization name
   * @returns {boolean} True if modal is open
   */
  isModalOpenForOrg(organization) {
    const modalInfo = this.activeModals.get(organization);
    if (!modalInfo) return false;
    
    // Check if modal timestamp is recent (within 5 minutes)
    const age = Date.now() - modalInfo.timestamp;
    if (age > 300000) {
      // Stale entry, remove it
      this.activeModals.delete(organization);
      return false;
    }
    
    return true;
  }

  /**
   * Mark modal as opened for an organization
   * @param {string} organization - Organization name
   */
  markModalOpened(organization) {
    const tabId = crossTabSyncService.getTabId();
    this.activeModals.set(organization, {
      tabId,
      timestamp: Date.now()
    });
    
    // Broadcast modal open event
    if (crossTabSyncService.isAvailable()) {
      crossTabSyncService.broadcast(CrossTabEventTypes.SAML_MODAL_OPENED, {
        organization,
        tabId,
        timestamp: Date.now()
      });
    }
    
    this.logger.debug('Modal opened for organization', { organization, tabId });
  }

  /**
   * Mark modal as closed for an organization
   * @param {string} organization - Organization name
   */
  markModalClosed(organization) {
    this.activeModals.delete(organization);
    
    // Broadcast modal close event
    if (crossTabSyncService.isAvailable()) {
      crossTabSyncService.broadcast(CrossTabEventTypes.SAML_MODAL_CLOSED, {
        organization,
        timestamp: Date.now()
      });
    }
    
    this.logger.debug('Modal closed for organization', { organization });
  }

  /**
   * Handle a SAML enforcement error
   * @param {Error} error - GitHub API error
   * @param {string} owner - Repository owner (organization)
   * @param {string} repo - Repository name (optional)
   * @param {Function} originalRequest - Original request function for retry (optional)
   * @returns {boolean} True if SAML error was handled
   */
  handleSAMLError(error, owner, repo = null, originalRequest = null) {
    const samlError = this.detectSAMLError(error);
    
    if (!samlError) {
      return false;
    }

    const organization = owner; // Use owner as the organization
    
    // Check if modal is already open for this org in any tab
    if (this.isModalOpenForOrg(organization)) {
      this.logger.debug('SAML modal already open for this organization in another tab', {
        organization
      });
      return true;
    }
    
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
    
    // Save state to session storage
    this.saveStateToStorage();

    // Mark modal as opened
    this.markModalOpened(organization);

    // Show modal if callback is registered
    if (this.modalCallback) {
      this.modalCallback({
        organization,
        repository: repo,
        authorizationUrl: this.getSAMLAuthorizationUrl(organization),
        message: samlError.message,
        originalRequest
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
   * @param {string} organization - Organization name
   * @returns {string} Authorization URL
   */
  getSAMLAuthorizationUrl(organization) {
    return `https://github.com/orgs/${organization}/sso`;
  }

  /**
   * Clear cooldown for an organization (called after successful authorization)
   * @param {string} organization - Organization name
   */
  clearCooldown(organization) {
    this.recentSAMLErrors.delete(organization);
    this.saveStateToStorage();
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
   * @param {string} organization - Organization name
   * @param {string} repo - Repository name (optional)
   */
  resolvePendingRequest(organization, repo = null) {
    const requestKey = repo ? `${organization}/${repo}` : organization;
    this.pendingSAMLRequests.delete(requestKey);
    this.clearCooldown(organization);
    this.markModalClosed(organization);
    this.saveStateToStorage();
  }

  /**
   * Get all pending SAML requests
   * @returns {Set} Set of pending request keys
   */
  getPendingRequests() {
    return new Set(this.pendingSAMLRequests);
  }

  /**
   * Check SAML authorization status for an organization
   * @param {string} organization - Organization name
   * @param {Function} testRequest - A function that makes a minimal SAML-protected API call
   * @returns {Promise<boolean>} True if authorized
   */
  async checkAuthorizationStatus(organization, testRequest) {
    try {
      this.logger.debug('Checking SAML authorization status', { organization });
      
      if (testRequest) {
        await testRequest();
        this.logger.info('SAML authorization check successful', { organization });
        return true;
      }
      
      return false;
    } catch (error) {
      // If still getting SAML error, not authorized yet
      const isSAMLError = this.detectSAMLError(error);
      if (isSAMLError) {
        this.logger.debug('SAML authorization not yet complete', { organization });
        return false;
      }
      
      // If different error, assume authorization is complete
      this.logger.debug('Non-SAML error, assuming authorization complete', {
        organization,
        error: error.message
      });
      return true;
    }
  }

  /**
   * Get list of organizations with pending SAML requests
   * @returns {Array<string>} Array of organization names
   */
  getPendingOrganizations() {
    const orgs = new Set();
    this.pendingSAMLRequests.forEach(key => {
      const org = key.split('/')[0];
      orgs.add(org);
    });
    return Array.from(orgs);
  }

  /**
   * Clear all pending requests and cooldowns
   */
  reset() {
    this.pendingSAMLRequests.clear();
    this.recentSAMLErrors.clear();
    this.activeModals.clear();
    try {
      sessionStorage.removeItem(this.sessionStorageKey);
    } catch (error) {
      this.logger.warn('Failed to clear session storage', { error: error.message });
    }
    this.logger.debug('SAML auth service reset');
  }
}

// Create singleton instance
const samlAuthService = new SAMLAuthService();

export default samlAuthService;
