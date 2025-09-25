/**
 * Browser-compatible Buffer polyfill
 * Provides minimal Buffer-like interface for browser environments
 * Maintains API compatibility with Node.js Buffer while using browser-native operations
 */

/**
 * Simple Buffer-like class for browser environments
 * Wraps string content and provides toString() method for compatibility
 */
class BrowserBuffer {
  constructor(content, encoding = 'utf-8') {
    if (typeof content === 'string') {
      this.content = content;
      this.encoding = encoding;
    } else {
      throw new Error('BrowserBuffer only supports string content');
    }
  }

  /**
   * Convert buffer to string with specified encoding
   * @param {string} encoding - Character encoding (default: utf-8)
   * @returns {string} - String content
   */
  toString(encoding = 'utf-8') {
    if (encoding !== 'utf-8' && encoding !== 'utf8') {
      console.warn(`BrowserBuffer: Encoding ${encoding} not fully supported, using utf-8`);
    }
    return this.content;
  }

  /**
   * Get buffer length (character count)
   */
  get length() {
    return this.content.length;
  }

  /**
   * Static method to create BrowserBuffer from string
   * @param {string} content - String content
   * @param {string} encoding - Character encoding
   * @returns {BrowserBuffer} - New BrowserBuffer instance
   */
  static from(content, encoding = 'utf-8') {
    return new BrowserBuffer(content, encoding);
  }
}

/**
 * Browser-compatible Buffer polyfill
 * Provides Buffer.from() method that works in browser environments
 */
const BufferPolyfill = {
  /**
   * Create Buffer-like object from string content
   * @param {string} content - String content
   * @param {string} encoding - Character encoding
   * @returns {BrowserBuffer} - Buffer-like object with toString() method
   */
  from(content, encoding = 'utf-8') {
    return BrowserBuffer.from(content, encoding);
  },

  /**
   * Check if Buffer is available (always false in browser)
   */
  isBuffer(obj) {
    return obj instanceof BrowserBuffer;
  }
};

// Export for use in browser environments
export { BrowserBuffer, BufferPolyfill };
export default BufferPolyfill;