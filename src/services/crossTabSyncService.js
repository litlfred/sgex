/**
 * Cross-Tab Synchronization Service
 * 
 * General-purpose service for synchronizing state across browser tabs using BroadcastChannel API.
 * This service is designed to be used by any application component (PAT auth, SAML auth, etc.)
 * and is NOT built into authorization services for better separation of concerns.
 * 
 * Features:
 * - Event-driven architecture for cross-tab communication
 * - Type-safe event registration and broadcasting
 * - Automatic cleanup of event listeners
 * - Browser compatibility detection
 * - Support for multiple event types (authentication, state sync, etc.)
 * 
 * Usage Example:
 * ```javascript
 * // Register a listener
 * crossTabSyncService.on('PAT_AUTHENTICATED', (data) => {
 *   console.log('PAT authenticated in another tab:', data);
 * });
 * 
 * // Broadcast an event
 * crossTabSyncService.broadcast('PAT_AUTHENTICATED', { token: '...', timestamp: Date.now() });
 * 
 * // Unregister when done
 * crossTabSyncService.off('PAT_AUTHENTICATED', handlerFunction);
 * ```
 */

import logger from '../utils/logger';

class CrossTabSyncService {
  constructor() {
    this.logger = logger.getLogger('CrossTabSyncService');
    this.channelName = 'sgex_cross_tab_sync';
    this.channel = null;
    this.eventHandlers = new Map(); // Map of event types to handler functions
    this.isSupported = this.checkBrowserSupport();
    
    if (this.isSupported) {
      this.initializeChannel();
    } else {
      this.logger.warn('BroadcastChannel not supported in this browser - cross-tab sync disabled');
    }
  }

  /**
   * Check if BroadcastChannel API is supported
   * @returns {boolean} True if supported
   */
  checkBrowserSupport() {
    return typeof BroadcastChannel !== 'undefined';
  }

  /**
   * Initialize the BroadcastChannel
   */
  initializeChannel() {
    try {
      this.channel = new BroadcastChannel(this.channelName);
      
      // Set up message listener
      this.channel.onmessage = (event) => {
        this.handleMessage(event.data);
      };
      
      this.channel.onerror = (error) => {
        this.logger.error('BroadcastChannel error', { error: error.message });
      };
      
      this.logger.debug('CrossTabSyncService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize BroadcastChannel', { error: error.message });
      this.isSupported = false;
    }
  }

  /**
   * Handle incoming messages from other tabs
   * @param {object} message - Message data
   */
  handleMessage(message) {
    if (!message || !message.type) {
      this.logger.warn('Received invalid message', { message });
      return;
    }

    this.logger.debug('Received cross-tab message', { 
      type: message.type,
      timestamp: message.timestamp 
    });

    // Get handlers for this event type
    const handlers = this.eventHandlers.get(message.type);
    if (handlers && handlers.size > 0) {
      // Call each registered handler
      handlers.forEach(handler => {
        try {
          handler(message.data, message);
        } catch (error) {
          this.logger.error('Error in event handler', { 
            type: message.type,
            error: error.message 
          });
        }
      });
    } else {
      this.logger.debug('No handlers registered for event type', { type: message.type });
    }
  }

  /**
   * Register an event handler
   * @param {string} eventType - Type of event to listen for
   * @param {Function} handler - Handler function to call when event is received
   * @returns {Function} Unsubscribe function
   */
  on(eventType, handler) {
    if (!eventType || typeof eventType !== 'string') {
      throw new Error('Event type must be a non-empty string');
    }

    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    // Get or create handler set for this event type
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    const handlers = this.eventHandlers.get(eventType);
    handlers.add(handler);

    this.logger.debug('Event handler registered', { 
      eventType,
      handlerCount: handlers.size 
    });

    // Return unsubscribe function
    return () => this.off(eventType, handler);
  }

  /**
   * Unregister an event handler
   * @param {string} eventType - Type of event
   * @param {Function} handler - Handler function to remove
   * @returns {boolean} True if handler was found and removed
   */
  off(eventType, handler) {
    const handlers = this.eventHandlers.get(eventType);
    if (!handlers) {
      return false;
    }

    const removed = handlers.delete(handler);
    
    if (removed) {
      this.logger.debug('Event handler unregistered', { 
        eventType,
        remainingHandlers: handlers.size 
      });

      // Clean up empty handler sets
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }

    return removed;
  }

  /**
   * Broadcast an event to all other tabs
   * @param {string} eventType - Type of event
   * @param {any} data - Event data to broadcast
   * @returns {boolean} True if broadcast was successful
   */
  broadcast(eventType, data = null) {
    if (!this.isSupported) {
      this.logger.debug('Broadcast skipped - BroadcastChannel not supported', { eventType });
      return false;
    }

    if (!this.channel) {
      this.logger.warn('Broadcast skipped - channel not initialized', { eventType });
      return false;
    }

    try {
      const message = {
        type: eventType,
        data: data,
        timestamp: Date.now(),
        tabId: this.getTabId()
      };

      this.channel.postMessage(message);

      this.logger.debug('Event broadcasted to other tabs', { 
        type: eventType,
        hasData: data !== null 
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to broadcast event', { 
        type: eventType,
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Get a unique identifier for this tab
   * @returns {string} Tab identifier
   */
  getTabId() {
    // Generate a unique tab ID if it doesn't exist
    if (!this.tabId) {
      this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.tabId;
  }

  /**
   * Remove all event handlers
   */
  clearAllHandlers() {
    const eventTypes = Array.from(this.eventHandlers.keys());
    this.eventHandlers.clear();
    
    this.logger.debug('All event handlers cleared', { 
      clearedTypes: eventTypes 
    });
  }

  /**
   * Close the BroadcastChannel and cleanup
   */
  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    this.clearAllHandlers();
    this.logger.debug('CrossTabSyncService destroyed');
  }

  /**
   * Check if cross-tab sync is available
   * @returns {boolean} True if cross-tab sync is supported and initialized
   */
  isAvailable() {
    return this.isSupported && this.channel !== null;
  }

  /**
   * Get statistics about registered handlers
   * @returns {object} Handler statistics
   */
  getStats() {
    const stats = {
      isSupported: this.isSupported,
      isAvailable: this.isAvailable(),
      eventTypes: Array.from(this.eventHandlers.keys()),
      totalHandlers: 0
    };

    this.eventHandlers.forEach((handlers) => {
      stats.totalHandlers += handlers.size;
    });

    return stats;
  }
}

// Create singleton instance
const crossTabSyncService = new CrossTabSyncService();

// Standard event types (can be extended by any application component)
export const CrossTabEventTypes = {
  // Authentication events
  PAT_AUTHENTICATED: 'PAT_AUTHENTICATED',
  SAML_AUTHENTICATED: 'SAML_AUTHENTICATED',
  SAML_POLLING_STARTED: 'SAML_POLLING_STARTED',
  SAML_MODAL_OPENED: 'SAML_MODAL_OPENED',
  SAML_MODAL_CLOSED: 'SAML_MODAL_CLOSED',
  LOGOUT: 'LOGOUT',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  
  // State synchronization events
  STATE_UPDATE: 'STATE_UPDATE',
  PREFERENCES_UPDATE: 'PREFERENCES_UPDATE',
  
  // User action events
  REPOSITORY_SELECTED: 'REPOSITORY_SELECTED',
  BRANCH_CHANGED: 'BRANCH_CHANGED'
};

export default crossTabSyncService;
