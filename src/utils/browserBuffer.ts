/**
 * Browser-compatible Buffer polyfill
 * Provides minimal Buffer-like interface for browser environments
 * Maintains API compatibility with Node.js Buffer while using browser-native operations
 * 
 * @module browserBuffer
 */

/**
 * Supported character encodings for browser buffer
 * @example "utf-8"
 */
export type BufferEncoding = 'utf-8' | 'utf8';

/**
 * Interface for Buffer-like objects in browser environments
 * Provides minimal compatibility with Node.js Buffer API
 * @example { content: "Hello", encoding: "utf-8", length: 5 }
 */
export interface IBrowserBuffer {
  /** String content stored in buffer */
  readonly content: string;
  /** Character encoding used for buffer */
  readonly encoding: BufferEncoding;
  /** Length of buffer content in characters */
  readonly length: number;
  /**
   * Convert buffer to string with specified encoding
   * @param encoding - Character encoding (default: utf-8)
   * @returns String content
   */
  toString(encoding?: BufferEncoding): string;
}

/**
 * Simple Buffer-like class for browser environments
 * Wraps string content and provides toString() method for compatibility
 * 
 * @example
 * const buffer = new BrowserBuffer("Hello World");
 * console.log(buffer.toString()); // "Hello World"
 * console.log(buffer.length); // 11
 */
export class BrowserBuffer implements IBrowserBuffer {
  readonly content: string;
  readonly encoding: BufferEncoding;

  /**
   * Create a new BrowserBuffer instance
   * @param content - String content to store
   * @param encoding - Character encoding (default: utf-8)
   * @throws {Error} If content is not a string
   * 
   * @example
   * const buffer = new BrowserBuffer("Hello", "utf-8");
   */
  constructor(content: string, encoding: BufferEncoding = 'utf-8') {
    if (typeof content !== 'string') {
      throw new Error('BrowserBuffer only supports string content');
    }
    this.content = content;
    this.encoding = encoding;
  }

  /**
   * Convert buffer to string with specified encoding
   * @param encoding - Character encoding (default: utf-8)
   * @returns String content
   * 
   * @example
   * const buffer = new BrowserBuffer("Hello");
   * buffer.toString(); // "Hello"
   */
  toString(encoding: BufferEncoding = 'utf-8'): string {
    if (encoding !== 'utf-8' && encoding !== 'utf8') {
      console.warn(`BrowserBuffer: Encoding ${encoding} not fully supported, using utf-8`);
    }
    return this.content;
  }

  /**
   * Get buffer length (character count)
   * @example
   * const buffer = new BrowserBuffer("Hello");
   * buffer.length; // 5
   */
  get length(): number {
    return this.content.length;
  }

  /**
   * Static method to create BrowserBuffer from string
   * @param content - String content
   * @param encoding - Character encoding
   * @returns New BrowserBuffer instance
   * 
   * @example
   * const buffer = BrowserBuffer.from("Hello World", "utf-8");
   */
  static from(content: string, encoding: BufferEncoding = 'utf-8'): BrowserBuffer {
    return new BrowserBuffer(content, encoding);
  }
}

/**
 * Buffer polyfill interface for browser environments
 * Provides Node.js Buffer-like API
 * @example { from: Function, isBuffer: Function }
 */
export interface IBufferPolyfill {
  /**
   * Create Buffer-like object from string content
   * @param content - String content
   * @param encoding - Character encoding
   * @returns Buffer-like object with toString() method
   */
  from(content: string, encoding?: BufferEncoding): BrowserBuffer;
  /**
   * Check if object is a Buffer-like instance
   * @param obj - Object to check
   * @returns True if object is BrowserBuffer instance
   */
  isBuffer(obj: unknown): obj is BrowserBuffer;
}

/**
 * Browser-compatible Buffer polyfill
 * Provides Buffer.from() method that works in browser environments
 * 
 * @example
 * import { BufferPolyfill } from './browserBuffer';
 * const buffer = BufferPolyfill.from("Hello World");
 * console.log(buffer.toString()); // "Hello World"
 */
export const BufferPolyfill: IBufferPolyfill = {
  /**
   * Create Buffer-like object from string content
   * @param content - String content
   * @param encoding - Character encoding
   * @returns Buffer-like object with toString() method
   * 
   * @example
   * const buffer = BufferPolyfill.from("Hello", "utf-8");
   */
  from(content: string, encoding: BufferEncoding = 'utf-8'): BrowserBuffer {
    return BrowserBuffer.from(content, encoding);
  },

  /**
   * Check if Buffer is available (always false in browser)
   * @param obj - Object to check
   * @returns True if object is BrowserBuffer instance
   * 
   * @example
   * const buffer = BufferPolyfill.from("test");
   * BufferPolyfill.isBuffer(buffer); // true
   * BufferPolyfill.isBuffer("test"); // false
   */
  isBuffer(obj: unknown): obj is BrowserBuffer {
    return obj instanceof BrowserBuffer;
  }
};

// Export for use in browser environments
export default BufferPolyfill;
