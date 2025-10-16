/**
 * SecureTokenStorage - Secure storage for GitHub Personal Access Tokens
 * 
 * Features:
 * - XOR encryption using browser fingerprint-based keys
 * - Token format validation (classic and fine-grained PATs)
 * - Automatic token expiration (24 hours)
 * - Secure token masking for logs and error messages
 */

import logger from '../utils/logger';
import crossTabSyncService, { CrossTabEventTypes } from './crossTabSyncService';

class SecureTokenStorage {
  constructor() {
    this.logger = logger.getLogger('SecureTokenStorage');
    this.storageKey = 'sgex_secure_token';
    this.expirationHours = 24;
    this.logger.debug('SecureTokenStorage instance created');
    
    // Set up cross-tab synchronization
    this.setupCrossTabSync();
  }

  /**
   * Set up cross-tab synchronization for token storage
   */
  setupCrossTabSync() {
    if (!crossTabSyncService.isAvailable()) {
      this.logger.warn('Cross-tab sync not available - tabs will not share authentication state');
      return;
    }

    // Listen for PAT authentication events from other tabs
    crossTabSyncService.on(CrossTabEventTypes.PAT_AUTHENTICATED, (data) => {
      this.logger.debug('PAT authentication event received from another tab');
      
      // Store the token in this tab's sessionStorage
      if (data && data.encryptedData) {
        try {
          sessionStorage.setItem(this.storageKey, data.encryptedData);
          this.logger.debug('Token synced from another tab');
        } catch (error) {
          this.logger.error('Failed to sync token from another tab', { error: error.message });
        }
      }
    });

    // Listen for logout events from other tabs
    crossTabSyncService.on(CrossTabEventTypes.LOGOUT, () => {
      this.logger.debug('Logout event received from another tab');
      this.clearToken();
    });

    this.logger.debug('Cross-tab sync configured for PAT authentication');
  }

  /**
   * Generate a STABLE browser fingerprint for encryption key
   * 
   * Uses only STABLE components that do not change during normal usage:
   * - navigator.userAgent (browser/version - stable)
   * - navigator.hardwareConcurrency (CPU cores - stable)
   * - navigator.platform (operating system - stable)
   * - navigator.maxTouchPoints (touch capability - stable)
   * - navigator.deviceMemory (RAM - stable, if available)
   * 
   * REMOVED volatile components that caused false positive logouts:
   * - navigator.language (users may switch locales)
   * - window.screen dimensions (changes on window resize)
   * - canvas fingerprint (changes with zoom, rendering)
   * - timezone offset (changes with travel/DST)
   * - color depth (changes with monitor)
   * 
   * @returns {string} Browser fingerprint
   */
  generateBrowserFingerprint() {
    const components = [
      navigator.userAgent || 'unknown',
      (navigator.hardwareConcurrency || 'unknown').toString(),
      navigator.platform || 'unknown',
      (navigator.maxTouchPoints || 0).toString(),
      (navigator.deviceMemory || 'unknown').toString()
    ];
    
    const fingerprint = components.join('|');
    
    // Create a simple hash of the fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * XOR encrypt/decrypt text using a key
   * @param {string} text - Text to encrypt/decrypt
   * @param {string} key - Encryption key
   * @returns {string} Encrypted/decrypted text
   */
  xorCipher(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  /**
   * Validate GitHub Personal Access Token format
   * @param {string} token - Token to validate
   * @returns {object} Validation result with type and validity
   */
  validateTokenFormat(token) {
    if (!token || typeof token !== 'string') {
      return { isValid: false, type: 'invalid', reason: 'Token is empty or not a string' };
    }

    // Remove any whitespace
    const cleanToken = token.trim();

    // Classic Personal Access Token format: ghp_[36 characters A-Za-z0-9]
    if (cleanToken.match(/^ghp_[A-Za-z0-9]{36}$/)) {
      return { isValid: true, type: 'classic', token: cleanToken };
    }

    // Fine-grained Personal Access Token format: github_pat_[22 characters]_[59 characters]
    if (cleanToken.match(/^github_pat_[A-Za-z0-9]{22}_[A-Za-z0-9]{59}$/)) {
      return { isValid: true, type: 'fine-grained', token: cleanToken };
    }

    // OAuth token format: gho_[36 characters] (for completeness)
    if (cleanToken.match(/^gho_[A-Za-z0-9]{36}$/)) {
      return { isValid: true, type: 'oauth', token: cleanToken };
    }

    // Check for old-style tokens (40 hex characters) - deprecated but might still work
    if (cleanToken.match(/^[a-fA-F0-9]{40}$/)) {
      return { isValid: true, type: 'legacy', token: cleanToken };
    }

    return { 
      isValid: false, 
      type: 'invalid', 
      reason: 'Token does not match expected GitHub PAT format'
    };
  }

  /**
   * Mask token for safe logging
   * @param {string} token - Token to mask
   * @returns {string} Masked token
   */
  maskToken(token) {
    if (!token || typeof token !== 'string') {
      return '[INVALID_TOKEN]';
    }

    const cleanToken = token.trim();
    if (cleanToken.length < 8) {
      return '[INVALID_TOKEN]';
    }

    // Show first 4 and last 4 characters for debugging purposes
    return `${cleanToken.substring(0, 4)}${'*'.repeat(cleanToken.length - 8)}${cleanToken.substring(cleanToken.length - 4)}`;
  }

  /**
   * Store token securely with encryption and expiration
   * @param {string} token - GitHub Personal Access Token
   * @returns {boolean} Success status
   */
  storeToken(token) {
    try {
      this.logger.debug('Starting secure token storage');

      // Validate token format
      const validation = this.validateTokenFormat(token);
      if (!validation.isValid) {
        this.logger.warn('Token validation failed', { 
          reason: validation.reason,
          tokenMask: this.maskToken(token)
        });
        return false;
      }

      this.logger.debug('Token validation successful', { 
        type: validation.type,
        tokenMask: this.maskToken(token)
      });

      // Generate encryption key
      const fingerprint = this.generateBrowserFingerprint();
      const encryptionKey = `sgex_${fingerprint}_${Date.now().toString(36)}`;

      // Encrypt token
      const encryptedToken = this.xorCipher(validation.token, encryptionKey);
      
      // Create storage object with metadata
      const storageData = {
        token: btoa(encryptedToken), // Base64 encode for safe storage
        key: btoa(encryptionKey), // Base64 encode the key
        type: validation.type,
        created: Date.now(),
        expires: Date.now() + (this.expirationHours * 60 * 60 * 1000),
        fingerprint: fingerprint
      };

      const encryptedData = JSON.stringify(storageData);

      // Store in sessionStorage (more secure than localStorage for tokens)
      sessionStorage.setItem(this.storageKey, encryptedData);
      
      // Clear any old tokens from localStorage
      localStorage.removeItem('github_token');
      sessionStorage.removeItem('github_token');

      this.logger.debug('Token stored securely', { 
        type: validation.type,
        expires: new Date(storageData.expires).toISOString(),
        tokenMask: this.maskToken(token)
      });

      // Broadcast authentication event to other tabs
      if (crossTabSyncService.isAvailable()) {
        crossTabSyncService.broadcast(CrossTabEventTypes.PAT_AUTHENTICATED, {
          encryptedData: encryptedData,
          type: validation.type,
          timestamp: Date.now()
        });
        this.logger.debug('PAT authentication broadcasted to other tabs');
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to store token securely', { 
        error: error.message,
        tokenMask: this.maskToken(token)
      });
      return false;
    }
  }

  /**
   * Retrieve and decrypt stored token
   * @returns {object|null} Token data or null if not found/expired
   */
  retrieveToken() {
    try {
      this.logger.debug('Attempting to retrieve secure token');

      const storedData = sessionStorage.getItem(this.storageKey);
      if (!storedData) {
        this.logger.debug('No secure token found in storage');
        return null;
      }

      const data = JSON.parse(storedData);
      
      // Check expiration
      if (Date.now() > data.expires) {
        this.logger.warn('Stored token has expired');
        this.clearToken();
        return null;
      }

      // Verify browser fingerprint
      const currentFingerprint = this.generateBrowserFingerprint();
      if (data.fingerprint !== currentFingerprint) {
        this.logger.warn('Browser fingerprint mismatch - possible security issue');
        this.clearToken();
        return null;
      }

      // Decrypt token
      const encryptionKey = atob(data.key);
      const encryptedToken = atob(data.token);
      const decryptedToken = this.xorCipher(encryptedToken, encryptionKey);

      // Validate decrypted token
      const validation = this.validateTokenFormat(decryptedToken);
      if (!validation.isValid) {
        this.logger.error('Decrypted token failed validation');
        this.clearToken();
        return null;
      }

      this.logger.debug('Token retrieved and decrypted successfully', { 
        type: data.type,
        expires: new Date(data.expires).toISOString(),
        tokenMask: this.maskToken(decryptedToken)
      });

      return {
        token: validation.token,
        type: data.type,
        created: data.created,
        expires: data.expires
      };
    } catch (error) {
      this.logger.error('Failed to retrieve secure token', { error: error.message });
      this.clearToken();
      return null;
    }
  }

  /**
   * Check if a valid token exists without retrieving it
   * @returns {boolean} True if valid token exists
   */
  hasValidToken() {
    try {
      const storedData = sessionStorage.getItem(this.storageKey);
      if (!storedData) {
        return false;
      }

      const data = JSON.parse(storedData);
      
      // Check expiration
      if (Date.now() > data.expires) {
        this.clearToken();
        return false;
      }

      // Verify browser fingerprint
      const currentFingerprint = this.generateBrowserFingerprint();
      if (data.fingerprint !== currentFingerprint) {
        this.clearToken();
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error checking token validity', { error: error.message });
      this.clearToken();
      return false;
    }
  }

  /**
   * Clear stored token and cleanup
   */
  clearToken() {
    this.logger.debug('Clearing secure token storage');
    
    sessionStorage.removeItem(this.storageKey);
    
    // Also clear legacy token storage
    sessionStorage.removeItem('github_token');
    localStorage.removeItem('github_token');
    
    // Broadcast logout event to other tabs
    if (crossTabSyncService.isAvailable()) {
      crossTabSyncService.broadcast(CrossTabEventTypes.LOGOUT, {
        timestamp: Date.now()
      });
      this.logger.debug('Logout event broadcasted to other tabs');
    }
  }

  /**
   * Get token expiration info
   * @returns {object|null} Expiration info or null if no token
   */
  getTokenInfo() {
    try {
      const storedData = sessionStorage.getItem(this.storageKey);
      if (!storedData) {
        return null;
      }

      const data = JSON.parse(storedData);
      const timeRemaining = data.expires - Date.now();
      
      return {
        type: data.type,
        created: new Date(data.created),
        expires: new Date(data.expires),
        timeRemaining: Math.max(0, timeRemaining),
        isExpired: timeRemaining <= 0,
        isValid: this.hasValidToken()
      };
    } catch (error) {
      this.logger.error('Error getting token info', { error: error.message });
      return null;
    }
  }

  /**
   * Migrate from legacy token storage
   * @returns {boolean} True if migration was successful
   */
  migrateLegacyToken() {
    try {
      // Check for tokens in legacy storage
      const legacyToken = sessionStorage.getItem('github_token') || localStorage.getItem('github_token');
      
      if (!legacyToken) {
        this.logger.debug('No legacy token found for migration');
        return false;
      }

      this.logger.debug('Migrating legacy token to secure storage');

      // Store using new secure method
      const success = this.storeToken(legacyToken);
      
      if (success) {
        // Clear legacy storage
        sessionStorage.removeItem('github_token');
        localStorage.removeItem('github_token');
        this.logger.debug('Legacy token migration completed successfully');
        return true;
      } else {
        this.logger.error('Failed to migrate legacy token');
        return false;
      }
    } catch (error) {
      this.logger.error('Error during legacy token migration', { error: error.message });
      return false;
    }
  }
}

// Create singleton instance
const secureTokenStorage = new SecureTokenStorage();

export default secureTokenStorage;