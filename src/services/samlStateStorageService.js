/**
 * SAML State Storage Service
 * 
 * Manages persistent state for SAML authorization workflows across tabs and sessions.
 * Uses sessionStorage for tab-specific state and localStorage for cross-tab coordination.
 */

import logger from '../utils/logger';

class SAMLStateStorageService {
  constructor() {
    this.logger = logger.getLogger('SAMLStateStorageService');
    
    // Storage keys
    this.KEYS = {
      PENDING_REQUESTS: 'saml:pendingRequests',
      COOLDOWNS: 'saml:cooldowns',
      POLLING_STATE: 'saml:pollingState',
      AUTHORIZATION_ATTEMPTS: 'saml:authAttempts',
      ACTIVE_MODALS: 'saml:activeModals',
    };
  }

  /**
   * Get pending SAML requests
   * @returns {Object} Map of organization -> request info
   */
  getPendingRequests() {
    try {
      const data = sessionStorage.getItem(this.KEYS.PENDING_REQUESTS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      this.logger.error('Error reading pending requests', { error: error.message });
      return {};
    }
  }

  /**
   * Add a pending SAML request
   * @param {string} organization - Organization name
   * @param {Object} requestInfo - Request information
   */
  addPendingRequest(organization, requestInfo) {
    try {
      const pending = this.getPendingRequests();
      pending[organization] = {
        ...requestInfo,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.KEYS.PENDING_REQUESTS, JSON.stringify(pending));
      
      this.logger.debug('Added pending SAML request', { organization, requestInfo });
    } catch (error) {
      this.logger.error('Error adding pending request', { 
        organization, 
        error: error.message 
      });
    }
  }

  /**
   * Remove a pending SAML request
   * @param {string} organization - Organization name
   */
  removePendingRequest(organization) {
    try {
      const pending = this.getPendingRequests();
      delete pending[organization];
      sessionStorage.setItem(this.KEYS.PENDING_REQUESTS, JSON.stringify(pending));
      
      this.logger.debug('Removed pending SAML request', { organization });
    } catch (error) {
      this.logger.error('Error removing pending request', { 
        organization, 
        error: error.message 
      });
    }
  }

  /**
   * Get cooldown state for organizations
   * @returns {Object} Map of organization -> cooldown expiry timestamp
   */
  getCooldowns() {
    try {
      const data = localStorage.getItem(this.KEYS.COOLDOWNS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      this.logger.error('Error reading cooldowns', { error: error.message });
      return {};
    }
  }

  /**
   * Set cooldown for an organization
   * @param {string} organization - Organization name
   * @param {number} durationMs - Cooldown duration in milliseconds (default 60000)
   */
  setCooldown(organization, durationMs = 60000) {
    try {
      const cooldowns = this.getCooldowns();
      cooldowns[organization] = Date.now() + durationMs;
      localStorage.setItem(this.KEYS.COOLDOWNS, JSON.stringify(cooldowns));
      
      this.logger.debug('Set SAML cooldown', { organization, durationMs });
    } catch (error) {
      this.logger.error('Error setting cooldown', { 
        organization, 
        error: error.message 
      });
    }
  }

  /**
   * Check if organization is in cooldown
   * @param {string} organization - Organization name
   * @returns {boolean} True if in cooldown
   */
  isInCooldown(organization) {
    try {
      const cooldowns = this.getCooldowns();
      const expiry = cooldowns[organization];
      
      if (!expiry) {
        return false;
      }
      
      const isActive = Date.now() < expiry;
      
      // Clean up expired cooldowns
      if (!isActive) {
        this.clearCooldown(organization);
      }
      
      return isActive;
    } catch (error) {
      this.logger.error('Error checking cooldown', { 
        organization, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Clear cooldown for an organization
   * @param {string} organization - Organization name
   */
  clearCooldown(organization) {
    try {
      const cooldowns = this.getCooldowns();
      delete cooldowns[organization];
      localStorage.setItem(this.KEYS.COOLDOWNS, JSON.stringify(cooldowns));
      
      this.logger.debug('Cleared SAML cooldown', { organization });
    } catch (error) {
      this.logger.error('Error clearing cooldown', { 
        organization, 
        error: error.message 
      });
    }
  }

  /**
   * Get polling state for organizations
   * @returns {Object} Map of organization -> polling state
   */
  getPollingState() {
    try {
      const data = sessionStorage.getItem(this.KEYS.POLLING_STATE);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      this.logger.error('Error reading polling state', { error: error.message });
      return {};
    }
  }

  /**
   * Set polling state for an organization
   * @param {string} organization - Organization name
   * @param {Object} state - Polling state
   */
  setPollingState(organization, state) {
    try {
      const pollingState = this.getPollingState();
      pollingState[organization] = {
        ...state,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.KEYS.POLLING_STATE, JSON.stringify(pollingState));
      
      this.logger.debug('Set polling state', { organization, state });
    } catch (error) {
      this.logger.error('Error setting polling state', { 
        organization, 
        error: error.message 
      });
    }
  }

  /**
   * Clear polling state for an organization
   * @param {string} organization - Organization name
   */
  clearPollingState(organization) {
    try {
      const pollingState = this.getPollingState();
      delete pollingState[organization];
      sessionStorage.setItem(this.KEYS.POLLING_STATE, JSON.stringify(pollingState));
      
      this.logger.debug('Cleared polling state', { organization });
    } catch (error) {
      this.logger.error('Error clearing polling state', { 
        organization, 
        error: error.message 
      });
    }
  }

  /**
   * Track active modals across tabs (using localStorage)
   * @returns {Object} Map of organization -> tab ID
   */
  getActiveModals() {
    try {
      const data = localStorage.getItem(this.KEYS.ACTIVE_MODALS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      this.logger.error('Error reading active modals', { error: error.message });
      return {};
    }
  }

  /**
   * Register that this tab has an active modal for an organization
   * @param {string} organization - Organization name
   * @param {string} tabId - Unique tab identifier
   */
  registerActiveModal(organization, tabId) {
    try {
      const activeModals = this.getActiveModals();
      activeModals[organization] = {
        tabId,
        timestamp: Date.now()
      };
      localStorage.setItem(this.KEYS.ACTIVE_MODALS, JSON.stringify(activeModals));
      
      this.logger.debug('Registered active modal', { organization, tabId });
    } catch (error) {
      this.logger.error('Error registering active modal', { 
        organization, 
        error: error.message 
      });
    }
  }

  /**
   * Unregister active modal for an organization
   * @param {string} organization - Organization name
   */
  unregisterActiveModal(organization) {
    try {
      const activeModals = this.getActiveModals();
      delete activeModals[organization];
      localStorage.setItem(this.KEYS.ACTIVE_MODALS, JSON.stringify(activeModals));
      
      this.logger.debug('Unregistered active modal', { organization });
    } catch (error) {
      this.logger.error('Error unregistering active modal', { 
        organization, 
        error: error.message 
      });
    }
  }

  /**
   * Check if another tab has an active modal for this organization
   * @param {string} organization - Organization name
   * @param {string} currentTabId - Current tab's ID
   * @returns {boolean} True if another tab has the modal
   */
  hasActiveModalInOtherTab(organization, currentTabId) {
    try {
      const activeModals = this.getActiveModals();
      const modalInfo = activeModals[organization];
      
      if (!modalInfo) {
        return false;
      }
      
      // Check if it's a different tab
      if (modalInfo.tabId === currentTabId) {
        return false;
      }
      
      // Check if the modal registration is recent (within 5 minutes)
      const age = Date.now() - modalInfo.timestamp;
      const isRecent = age < 5 * 60 * 1000;
      
      if (!isRecent) {
        // Clean up stale registration
        this.unregisterActiveModal(organization);
        return false;
      }
      
      return true;
    } catch (error) {
      this.logger.error('Error checking active modal', { 
        organization, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Clear all SAML state
   */
  clearAll() {
    try {
      sessionStorage.removeItem(this.KEYS.PENDING_REQUESTS);
      sessionStorage.removeItem(this.KEYS.POLLING_STATE);
      localStorage.removeItem(this.KEYS.COOLDOWNS);
      localStorage.removeItem(this.KEYS.ACTIVE_MODALS);
      localStorage.removeItem(this.KEYS.AUTHORIZATION_ATTEMPTS);
      
      this.logger.debug('Cleared all SAML state');
    } catch (error) {
      this.logger.error('Error clearing all state', { error: error.message });
    }
  }

  /**
   * Clean up expired cooldowns and stale modals
   */
  cleanup() {
    try {
      // Clean up expired cooldowns
      const cooldowns = this.getCooldowns();
      const now = Date.now();
      let cleaned = false;
      
      Object.keys(cooldowns).forEach(org => {
        if (cooldowns[org] < now) {
          delete cooldowns[org];
          cleaned = true;
        }
      });
      
      if (cleaned) {
        localStorage.setItem(this.KEYS.COOLDOWNS, JSON.stringify(cooldowns));
      }
      
      // Clean up stale modal registrations (older than 5 minutes)
      const activeModals = this.getActiveModals();
      const staleThreshold = 5 * 60 * 1000;
      let modalsCleaned = false;
      
      Object.keys(activeModals).forEach(org => {
        const age = now - activeModals[org].timestamp;
        if (age > staleThreshold) {
          delete activeModals[org];
          modalsCleaned = true;
        }
      });
      
      if (modalsCleaned) {
        localStorage.setItem(this.KEYS.ACTIVE_MODALS, JSON.stringify(activeModals));
      }
      
      if (cleaned || modalsCleaned) {
        this.logger.debug('Cleaned up expired SAML state', {
          cooldownsCleaned: cleaned,
          modalsCleaned
        });
      }
    } catch (error) {
      this.logger.error('Error cleaning up state', { error: error.message });
    }
  }
}

// Create singleton instance
const samlStateStorageService = new SAMLStateStorageService();

// Run cleanup on initialization
samlStateStorageService.cleanup();

export default samlStateStorageService;
