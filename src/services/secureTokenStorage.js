/**
 * Secure Token Storage Service
 * Provides secure token storage and management with encryption and expiration
 */

import { maskToken, isValidPATFormat } from '../utils/securityUtils';
import logger from '../utils/logger';

class SecureTokenStorage {
  constructor() {
    this.logger = logger.getLogger('SecureTokenStorage');
    this.tokenKey = 'sgex_secure_token';
    this.metadataKey = 'sgex_token_metadata';
    this.maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Simple XOR encryption for token storage
   * Note: This is basic obfuscation, not cryptographic security
   * @param {string} text - Text to encrypt/decrypt
   * @param {string} key - Encryption key
   * @returns {string} - Encrypted/decrypted text
   */
  xorEncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode the result
  }

  /**
   * Decrypt XOR encrypted text
   * @param {string} encryptedText - Encrypted text to decrypt
   * @param {string} key - Decryption key
   * @returns {string} - Decrypted text
   */
  xorDecrypt(encryptedText, key) {
    try {
      const decoded = atob(encryptedText);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch (error) {
      this.logger.error('Failed to decrypt token', { error: error.message });
      return null;
    }
  }

  /**
   * Generate a simple encryption key based on browser fingerprint
   * @returns {string} - Encryption key
   */
  generateEncryptionKey() {
    // Create a simple browser fingerprint for encryption key
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      window.screen.width + 'x' + window.screen.height,
      new Date().getTimezoneOffset(),
      'sgex-workbench-salt'
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Store a token securely with encryption and metadata
   * @param {string} token - GitHub PAT to store
   * @param {object} metadata - Additional metadata (username, etc.)
   * @returns {boolean} - True if storage was successful
   */
  storeToken(token, metadata = {}) {
    try {
      // Validate token format
      if (!isValidPATFormat(token)) {
        this.logger.warn('Invalid token format provided for storage');
        return false;
      }

      const encryptionKey = this.generateEncryptionKey();
      const encryptedToken = this.xorEncrypt(token, encryptionKey);
      
      const tokenMetadata = {
        stored: Date.now(),
        expires: Date.now() + this.maxAge,
        username: metadata.username || null,
        tokenType: token.startsWith('github_pat_') ? 'fine-grained' : 'classic',
        masked: maskToken(token)
      };

      sessionStorage.setItem(this.tokenKey, encryptedToken);
      sessionStorage.setItem(this.metadataKey, JSON.stringify(tokenMetadata));

      this.logger.auth('Token stored securely', {
        tokenType: tokenMetadata.tokenType,
        username: metadata.username,
        expires: new Date(tokenMetadata.expires).toISOString()
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to store token securely', { 
        error: error.message,
        masked: token ? maskToken(token) : 'null'
      });
      return false;
    }
  }

  /**
   * Retrieve and decrypt a stored token
   * @returns {string|null} - Decrypted token or null if not found/expired
   */
  getToken() {
    try {
      const encryptedToken = sessionStorage.getItem(this.tokenKey);
      const metadataStr = sessionStorage.getItem(this.metadataKey);

      if (!encryptedToken || !metadataStr) {
        this.logger.debug('No stored token found');
        return null;
      }

      const metadata = JSON.parse(metadataStr);
      
      // Check if token is expired
      if (Date.now() > metadata.expires) {
        this.logger.warn('Stored token has expired', {
          expired: new Date(metadata.expires).toISOString()
        });
        this.clearToken();
        return null;
      }

      const encryptionKey = this.generateEncryptionKey();
      const decryptedToken = this.xorDecrypt(encryptedToken, encryptionKey);

      if (!decryptedToken || !isValidPATFormat(decryptedToken)) {
        this.logger.error('Failed to decrypt token or invalid format');
        this.clearToken();
        return null;
      }

      this.logger.debug('Token retrieved successfully', {
        tokenType: metadata.tokenType,
        username: metadata.username,
        timeRemaining: Math.round((metadata.expires - Date.now()) / 1000 / 60) + ' minutes'
      });

      return decryptedToken;
    } catch (error) {
      this.logger.error('Failed to retrieve stored token', { error: error.message });
      this.clearToken();
      return null;
    }
  }

  /**
   * Get token metadata without exposing the token itself
   * @returns {object|null} - Token metadata or null
   */
  getTokenMetadata() {
    try {
      const metadataStr = sessionStorage.getItem(this.metadataKey);
      if (!metadataStr) {
        return null;
      }

      const metadata = JSON.parse(metadataStr);
      
      // Don't return expired metadata
      if (Date.now() > metadata.expires) {
        this.clearToken();
        return null;
      }

      return {
        ...metadata,
        isExpired: Date.now() > metadata.expires,
        timeRemaining: Math.max(0, metadata.expires - Date.now())
      };
    } catch (error) {
      this.logger.error('Failed to get token metadata', { error: error.message });
      return null;
    }
  }

  /**
   * Check if a valid token is stored
   * @returns {boolean} - True if valid token exists
   */
  hasValidToken() {
    const metadata = this.getTokenMetadata();
    return metadata !== null && !metadata.isExpired;
  }

  /**
   * Clear stored token and metadata
   */
  clearToken() {
    try {
      sessionStorage.removeItem(this.tokenKey);
      sessionStorage.removeItem(this.metadataKey);
      this.logger.auth('Token cleared from secure storage');
    } catch (error) {
      this.logger.error('Failed to clear token', { error: error.message });
    }
  }

  /**
   * Refresh token expiration (extend the token lifetime)
   * @returns {boolean} - True if refresh was successful
   */
  refreshToken() {
    try {
      const metadataStr = sessionStorage.getItem(this.metadataKey);
      if (!metadataStr) {
        return false;
      }

      const metadata = JSON.parse(metadataStr);
      metadata.expires = Date.now() + this.maxAge;
      
      sessionStorage.setItem(this.metadataKey, JSON.stringify(metadata));
      
      this.logger.debug('Token expiration refreshed', {
        newExpires: new Date(metadata.expires).toISOString()
      });
      
      return true;
    } catch (error) {
      this.logger.error('Failed to refresh token', { error: error.message });
      return false;
    }
  }

  /**
   * Get storage statistics
   * @returns {object} - Storage usage information
   */
  getStorageInfo() {
    try {
      const encryptedToken = sessionStorage.getItem(this.tokenKey);
      const metadataStr = sessionStorage.getItem(this.metadataKey);
      
      return {
        hasToken: !!encryptedToken,
        hasMetadata: !!metadataStr,
        tokenSize: encryptedToken ? encryptedToken.length : 0,
        metadataSize: metadataStr ? metadataStr.length : 0,
        totalSize: (encryptedToken?.length || 0) + (metadataStr?.length || 0)
      };
    } catch (error) {
      this.logger.error('Failed to get storage info', { error: error.message });
      return { hasToken: false, hasMetadata: false, tokenSize: 0, metadataSize: 0, totalSize: 0 };
    }
  }
}

// Create and export singleton instance
const secureTokenStorage = new SecureTokenStorage();
export default secureTokenStorage;