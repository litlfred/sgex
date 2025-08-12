/**
 * SecureTokenStorage - TypeScript Implementation
 * Secure storage for GitHub Personal Access Tokens with XOR encryption
 */

import type {
  TokenFormatValidation,
  Logger as LoggerType
} from '../types/core';
import logger from '../utils/logger';

export class SecureTokenStorage {
  private readonly logger: LoggerType;
  private readonly storageKey = 'sgex_secure_token';
  private readonly expirationHours = 24;

  constructor() {
    this.logger = logger.getLogger('SecureTokenStorage');
    this.logger.debug('SecureTokenStorage instance created');
  }

  /**
   * Generate a browser fingerprint for encryption key
   */
  private generateBrowserFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
      }

      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        window.screen.width + 'x' + window.screen.height,
        window.screen.colorDepth,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
      ].join('|');

      // Create a simple hash of the fingerprint
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }

      return Math.abs(hash).toString(36);
    } catch (error) {
      // Fallback for testing environments without canvas support
      this.logger.debug('Canvas not available, using fallback fingerprint');
      const fallbackData = [
        typeof navigator !== 'undefined' ? navigator.userAgent : 'test-agent',
        typeof navigator !== 'undefined' ? navigator.language : 'en-US',
        typeof window !== 'undefined' ? window.screen?.width + 'x' + window.screen?.height : '1920x1080',
        typeof window !== 'undefined' ? window.screen?.colorDepth : 24,
        new Date().getTimezoneOffset(),
        'test-canvas-data'
      ].join('|');

      let hash = 0;
      for (let i = 0; i < fallbackData.length; i++) {
        const char = fallbackData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      return Math.abs(hash).toString(36);
    }
  }

  /**
   * XOR encrypt/decrypt text using a key
   */
  private xorCipher(text: string, key: string): string {
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
   */
  validateTokenFormat(token: string): TokenFormatValidation {
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
      reason: 'Token format not recognized. Expected ghp_, github_pat_, gho_, or 40-character hex format'
    };
  }

  /**
   * Store token securely with encryption and expiration
   */
  storeToken(token: string): boolean {
    try {
      const validation = this.validateTokenFormat(token);
      if (!validation.isValid || !validation.token) {
        this.logger.warn('Attempted to store invalid token', { reason: validation.reason });
        return false;
      }

      const fingerprint = this.generateBrowserFingerprint();
      const encryptedToken = this.xorCipher(validation.token, fingerprint);

      const data = {
        token: encryptedToken,
        type: validation.type,
        created: Date.now(),
        expires: Date.now() + (this.expirationHours * 60 * 60 * 1000),
        fingerprint: fingerprint.substring(0, 8) // Store partial fingerprint for validation
      };

      sessionStorage.setItem(this.storageKey, JSON.stringify(data));

      this.logger.debug('Token stored securely', {
        type: validation.type,
        expiresIn: this.expirationHours + ' hours'
      });

      return true;
    } catch (error) {
      this.logger.error('Error storing token', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Retrieve and decrypt stored token
   */
  retrieveToken(): string | null {
    try {
      const storedData = sessionStorage.getItem(this.storageKey);
      if (!storedData) {
        return null;
      }

      const data = JSON.parse(storedData);

      // Check expiration
      if (Date.now() > data.expires) {
        this.logger.debug('Stored token has expired, removing');
        this.clearToken();
        return null;
      }

      const fingerprint = this.generateBrowserFingerprint();
      const decryptedToken = this.xorCipher(data.token, fingerprint);

      // Validate decrypted token format
      const validation = this.validateTokenFormat(decryptedToken);
      if (!validation.isValid) {
        this.logger.warn('Decrypted token failed validation, removing');
        this.clearToken();
        return null;
      }

      return decryptedToken;
    } catch (error) {
      this.logger.error('Error retrieving token', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.clearToken();
      return null;
    }
  }

  /**
   * Check if a valid token exists
   */
  hasValidToken(): boolean {
    return this.retrieveToken() !== null;
  }

  /**
   * Clear stored token
   */
  clearToken(): void {
    try {
      sessionStorage.removeItem(this.storageKey);
      this.logger.debug('Token cleared from storage');
    } catch (error) {
      this.logger.error('Error clearing token', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get token info without retrieving the actual token
   */
  getTokenInfo(): {
    type: string;
    created: Date;
    expires: Date;
    timeRemaining: number;
    isExpired: boolean;
    isValid: boolean;
  } | null {
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
      this.logger.error('Error getting token info', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Mask token for logging and error messages
   */
  maskToken(token: string): string {
    if (!token || token.length < 8) {
      return '[INVALID_TOKEN]';
    }

    // Show first 4 and last 4 characters with mask in between
    const start = token.substring(0, 4);
    const end = token.substring(token.length - 4);
    const maskLength = Math.max(4, token.length - 8);
    const mask = '*'.repeat(maskLength);

    return `${start}${mask}${end}`;
  }

  /**
   * Migrate from legacy token storage
   */
  migrateLegacyToken(): boolean {
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
      this.logger.error('Error during legacy token migration', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}

// Export singleton instance to maintain backward compatibility
const secureTokenStorage = new SecureTokenStorage();
export default secureTokenStorage;