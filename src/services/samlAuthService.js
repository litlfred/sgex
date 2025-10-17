/**
 * SAML Authorization Service
 * 
 * Centralized service for handling GitHub SAML SSO authorization requests.
 * Prevents console spam by tracking SAML errors and providing a single
 * modal interface for users to authorize their Personal Access Tokens.
 * 
 * Features:
 * - Cross-tab coordination for modal display
 * - Polling for authorization completion
 * - Automatic retry of failed requests
 * - Session state persistence
 */

import logger from '../utils/logger';
import crossTabSyncService from './crossTabSyncService';
import samlStateStorageService from './samlStateStorageService';

class SAMLAuthService {
  constructor() {
    this.logger = logger.getLogger('SAMLAuthService');
    this.pendingSAMLRequests = new Set();
    this.modalCallback = null;
    this.recentSAMLErrors = new Map(); // Track recent errors to prevent spam
    this.errorCooldownMs = 60000; // 1 minute cooldown per org
    
    // Polling configuration
    this.pollingIntervalMs = 3000; // 3 seconds
    this.pollingTimeoutMs = 5 * 60 * 1000; // 5 minutes
    this.pollingIntervals = new Map(); // Active polling intervals
    this.pollingRequests = new Map(); // Original requests to retry
    
    // Cross-tab synchronization
    this.tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.setupCrossTabSync();
    
    this.logger.debug('SAMLAuthService initialized', { tabId: this.tabId });
  }

  /**
   * Setup cross-tab synchronization
   */
  setupCrossTabSync() {
    // Register handlers for SAML events from other tabs
    crossTabSyncService.on('SAML_AUTHORIZATION_COMPLETE', (data) => {
      this.logger.debug('Received SAML authorization complete event', { data });
      this.handleAuthorizationComplete(data.organization);
    });
    
    crossTabSyncService.on('SAML_MODAL_OPENED', (data) => {
      this.logger.debug('Received SAML modal opened event', { data });
      this.handleModalOpenedInOtherTab(data.organization, data.tabId);
    });
    
    crossTabSyncService.on('SAML_MODAL_CLOSED', (data) => {
      this.logger.debug('Received SAML modal closed event', { data });
      this.handleModalClosedInOtherTab(data.organization, data.tabId);
    });
    
    crossTabSyncService.on('SAML_POLLING_STARTED', (data) => {
      this.logger.debug('Received SAML polling started event', { data });
      this.handlePollingStartedInOtherTab(data.organization, data.tabId);
    });
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
   * Handle a SAML enforcement error
   * @param {Error} error - GitHub API error
   * @param {string} owner - Repository owner (organization)
   * @param {string} repo - Repository name (optional)
   * @param {Function} retryCallback - Optional callback to retry the original request
   * @returns {boolean} True if SAML error was handled
   */
  handleSAMLError(error, owner, repo = null, retryCallback = null) {
    const samlError = this.detectSAMLError(error);
    
    if (!samlError) {
      return false;
    }

    const organization = owner; // Use owner as the organization
    
    this.logger.info('SAML error detected', {
      type: 'saml-error-detected',
      organization,
      repository: repo,
      hasRetryCallback: !!retryCallback
    });
    
    // Check if we should handle this error (cooldown check)
    const inCooldown = samlStateStorageService.isInCooldown(organization);
    if (inCooldown) {
      this.logger.debug('Skipping SAML error due to cooldown', { 
        type: 'cooldown-active',
        organization 
      });
      return true; // Still return true as it was a SAML error
    }

    // Mark this organization as having a recent error
    this.recentSAMLErrors.set(organization, Date.now());

    // Log the SAML error without spamming
    this.logger.warn('SAML SSO authorization required', {
      type: 'saml-authorization-required',
      organization,
      repository: repo,
      message: samlError.message
    });

    // Add to pending requests with retry callback
    const requestKey = repo ? `${organization}/${repo}` : organization;
    this.pendingSAMLRequests.add(requestKey);
    
    if (retryCallback) {
      this.pollingRequests.set(organization, {
        callback: retryCallback,
        repository: repo,
        requestKey
      });
    }
    
    // Store in session storage
    samlStateStorageService.addPendingRequest(organization, {
      repository: repo,
      message: samlError.message,
      hasRetryCallback: !!retryCallback
    });

    // Check if another tab already has a modal open for this org
    if (samlStateStorageService.hasActiveModalInOtherTab(organization, this.tabId)) {
      this.logger.debug('Modal already active in another tab', {
        type: 'modal-exists-other-tab',
        organization
      });
      return true;
    }

    // Show modal if callback is registered
    if (this.modalCallback) {
      // Register that this tab has the modal
      samlStateStorageService.registerActiveModal(organization, this.tabId);
      
      // Broadcast modal opened event
      crossTabSyncService.broadcast('SAML_MODAL_OPENED', {
        organization,
        tabId: this.tabId,
        timestamp: Date.now()
      });
      
      this.modalCallback({
        organization,
        repository: repo,
        authorizationUrl: this.getSAMLAuthorizationUrl(organization),
        message: samlError.message
      });
      
      this.logger.info('SAML modal opened', {
        type: 'modal-opened',
        organization,
        repository: repo
      });
    } else {
      this.logger.warn('No modal callback registered for SAML authorization', {
        type: 'no-modal-callback',
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
   * Start polling for SAML authorization completion
   * @param {string} organization - Organization name
   * @param {Window} ssoWindow - Reference to SSO window (optional)
   */
  startPolling(organization, ssoWindow = null) {
    // Stop any existing polling for this org
    this.stopPolling(organization);
    
    const startTime = Date.now();
    const requestInfo = this.pollingRequests.get(organization);
    
    if (!requestInfo) {
      this.logger.warn('No retry callback available for polling', { 
        type: 'polling-no-retry-callback',
        organization 
      });
    }
    
    this.logger.info('Starting SAML authorization polling', {
      type: 'polling-started',
      organization,
      hasSSOWindow: !!ssoWindow,
      hasRetryCallback: !!requestInfo
    });
    
    // Store polling state
    samlStateStorageService.setPollingState(organization, {
      active: true,
      startTime,
      tabId: this.tabId
    });
    
    // Broadcast polling started
    crossTabSyncService.broadcast('SAML_POLLING_STARTED', {
      organization,
      tabId: this.tabId,
      timestamp: Date.now()
    });
    
    let pollCount = 0;
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      const elapsed = Date.now() - startTime;
      
      this.logger.debug('Polling tick', {
        type: 'polling-tick',
        organization,
        pollCount,
        elapsed
      });
      
      // Check timeout
      if (elapsed > this.pollingTimeoutMs) {
        this.logger.warn('Polling timeout reached', {
          type: 'polling-timeout',
          organization,
          elapsed,
          pollCount
        });
        this.stopPolling(organization);
        return;
      }
      
      // Check if SSO window was closed
      if (ssoWindow && ssoWindow.closed) {
        this.logger.info('SSO window closed', {
          type: 'sso-window-closed',
          organization,
          pollCount
        });
        // Continue polling even if window closed
      }
      
      // Attempt to retry the original request
      if (requestInfo && requestInfo.callback) {
        try {
          const result = await requestInfo.callback();
          
          // If successful, authorization is complete
          this.logger.info('SAML authorization detected', {
            type: 'authorization-detected',
            organization,
            pollCount,
            elapsed
          });
          
          this.handleAuthorizationSuccess(organization, result);
          this.stopPolling(organization);
          
        } catch (error) {
          // Check if still a SAML error
          const stillSAMLError = this.detectSAMLError(error);
          
          if (!stillSAMLError) {
            // Different error - might indicate authorization succeeded but request failed
            this.logger.warn('Request failed with non-SAML error during polling', {
              type: 'polling-non-saml-error',
              organization,
              error: error.message,
              pollCount
            });
            
            // Stop polling and let the error propagate
            this.stopPolling(organization);
          }
          
          // Continue polling if still SAML error
        }
      }
    }, this.pollingIntervalMs);
    
    this.pollingIntervals.set(organization, pollInterval);
  }

  /**
   * Stop polling for an organization
   * @param {string} organization - Organization name
   */
  stopPolling(organization) {
    const interval = this.pollingIntervals.get(organization);
    
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(organization);
      
      samlStateStorageService.clearPollingState(organization);
      
      this.logger.info('Stopped SAML polling', {
        type: 'polling-stopped',
        organization
      });
    }
  }

  /**
   * Handle successful authorization
   * @param {string} organization - Organization name
   * @param {*} result - Result from retry callback
   */
  handleAuthorizationSuccess(organization, result) {
    this.logger.info('SAML authorization successful', {
      type: 'authorization-successful',
      organization
    });
    
    // Clear all state for this organization
    this.clearCooldown(organization);
    samlStateStorageService.removePendingRequest(organization);
    samlStateStorageService.clearCooldown(organization);
    samlStateStorageService.unregisterActiveModal(organization);
    
    // Remove from pending requests
    const requestInfo = this.pollingRequests.get(organization);
    if (requestInfo) {
      this.pendingSAMLRequests.delete(requestInfo.requestKey);
      this.pollingRequests.delete(organization);
    }
    
    // Broadcast to other tabs
    crossTabSyncService.broadcast('SAML_AUTHORIZATION_COMPLETE', {
      organization,
      tabId: this.tabId,
      timestamp: Date.now()
    });
  }

  /**
   * Handle authorization complete event from another tab
   * @param {string} organization - Organization name
   */
  handleAuthorizationComplete(organization) {
    this.logger.info('Authorization completed in another tab', {
      type: 'authorization-complete-other-tab',
      organization
    });
    
    // Stop polling if active
    this.stopPolling(organization);
    
    // Clear local state
    this.clearCooldown(organization);
    samlStateStorageService.removePendingRequest(organization);
    samlStateStorageService.clearCooldown(organization);
    
    // Close modal if open (via callback - would need to be implemented in modal)
    // The modal component should subscribe to cross-tab events
  }

  /**
   * Handle modal opened in another tab
   * @param {string} organization - Organization name
   * @param {string} tabId - Tab ID that opened the modal
   */
  handleModalOpenedInOtherTab(organization, tabId) {
    if (tabId === this.tabId) {
      return; // Ignore our own events
    }
    
    this.logger.debug('Modal opened in another tab', {
      type: 'modal-opened-other-tab',
      organization,
      otherTabId: tabId
    });
    
    // Update active modal tracking
    samlStateStorageService.registerActiveModal(organization, tabId);
  }

  /**
   * Handle modal closed in another tab
   * @param {string} organization - Organization name
   * @param {string} tabId - Tab ID that closed the modal
   */
  handleModalClosedInOtherTab(organization, tabId) {
    if (tabId === this.tabId) {
      return; // Ignore our own events
    }
    
    this.logger.debug('Modal closed in another tab', {
      type: 'modal-closed-other-tab',
      organization,
      otherTabId: tabId
    });
  }

  /**
   * Handle polling started in another tab
   * @param {string} organization - Organization name
   * @param {string} tabId - Tab ID that started polling
   */
  handlePollingStartedInOtherTab(organization, tabId) {
    if (tabId === this.tabId) {
      return; // Ignore our own events
    }
    
    this.logger.debug('Polling started in another tab', {
      type: 'polling-started-other-tab',
      organization,
      otherTabId: tabId
    });
    
    // Stop polling in this tab to avoid duplicate polling
    this.stopPolling(organization);
  }

  /**
   * Notify that modal was closed (called by modal component)
   * @param {string} organization - Organization name
   * @param {boolean} laterClicked - True if "Later" button was clicked
   */
  notifyModalClosed(organization, laterClicked = false) {
    this.logger.info('Modal closed', {
      type: 'modal-closed',
      organization,
      laterClicked
    });
    
    // Unregister modal
    samlStateStorageService.unregisterActiveModal(organization);
    
    // Set cooldown if "Later" was clicked
    if (laterClicked) {
      samlStateStorageService.setCooldown(organization, this.errorCooldownMs);
      
      this.logger.info('Cooldown set after Later clicked', {
        type: 'cooldown-set',
        organization,
        durationMs: this.errorCooldownMs
      });
    }
    
    // Broadcast modal closed
    crossTabSyncService.broadcast('SAML_MODAL_CLOSED', {
      organization,
      tabId: this.tabId,
      laterClicked,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cooldown for an organization (called after successful authorization)
   * @param {string} organization - Organization name
   */
  clearCooldown(organization) {
    this.recentSAMLErrors.delete(organization);
    samlStateStorageService.clearCooldown(organization);
    
    this.logger.debug('SAML error cooldown cleared', { 
      type: 'cooldown-cleared',
      organization 
    });
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
    samlStateStorageService.removePendingRequest(organization);
  }

  /**
   * Get all pending SAML requests
   * @returns {Set} Set of pending request keys
   */
  getPendingRequests() {
    return new Set(this.pendingSAMLRequests);
  }

  /**
   * Check SAML status for an organization (for UI display)
   * @param {string} organization - Organization name
   * @param {Function} testCallback - Callback to test authorization
   * @returns {Promise<Object>} Status object
   */
  async checkSAMLStatus(organization, testCallback) {
    this.logger.debug('Checking SAML status', {
      type: 'saml-status-check',
      organization
    });
    
    try {
      await testCallback();
      
      return {
        organization,
        authorized: true,
        timestamp: Date.now()
      };
    } catch (error) {
      const isSAMLError = this.detectSAMLError(error);
      
      return {
        organization,
        authorized: false,
        requiresSAML: !!isSAMLError,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Clear all pending requests and cooldowns
   */
  reset() {
    this.pendingSAMLRequests.clear();
    this.recentSAMLErrors.clear();
    this.pollingRequests.clear();
    
    // Stop all polling
    this.pollingIntervals.forEach((interval, org) => {
      clearInterval(interval);
    });
    this.pollingIntervals.clear();
    
    samlStateStorageService.clearAll();
    
    this.logger.debug('SAML auth service reset', { type: 'service-reset' });
  }

  /**
   * Cleanup on service destruction
   */
  destroy() {
    this.reset();
    
    // Note: crossTabSyncService manages its own cleanup
    // No need to manually unregister handlers
    
    this.logger.debug('SAML auth service destroyed');
  }
}

// Create singleton instance
const samlAuthService = new SAMLAuthService();

export default samlAuthService;
