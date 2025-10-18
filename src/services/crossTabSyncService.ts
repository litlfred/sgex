/**
 * Cross-Tab Synchronization Service
 * 
 * @fileoverview General-purpose service for synchronizing state across browser tabs using BroadcastChannel API.
 * This service is designed to be used by any application component (PAT auth, SAML auth, etc.)
 * and is NOT built into authorization services for better separation of concerns.
 * 
 * @module services/crossTabSyncService
 * 
 * @example
 * ```typescript
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

/**
 * Cross-tab event message structure
 * 
 * @interface CrossTabMessage
 * @example
 * {
 *   "type": "PAT_AUTHENTICATED",
 *   "data": { "token": "ghp_...", "user": "username" },
 *   "timestamp": 1234567890,
 *   "tabId": "tab_123_abc"
 * }
 */
export interface CrossTabMessage<T = any> {
  /** Event type identifier */
  type: string;
  /** Event payload data */
  data: T | null;
  /** Unix timestamp when event was created */
  timestamp: number;
  /** Unique identifier for the originating tab */
  tabId: string;
}

/**
 * Event handler function type
 * 
 * @callback CrossTabEventHandler
 * @template T - Type of event data
 * @param {T} data - Event data
 * @param {CrossTabMessage<T>} message - Full message object
 */
export type CrossTabEventHandler<T = any> = (data: T | null, message: CrossTabMessage<T>) => void;

/**
 * Handler statistics
 * 
 * @interface CrossTabStats
 * @example
 * {
 *   "isSupported": true,
 *   "isAvailable": true,
 *   "eventTypes": ["PAT_AUTHENTICATED", "LOGOUT"],
 *   "totalHandlers": 3
 * }
 */
export interface CrossTabStats {
  /** Whether BroadcastChannel is supported in browser */
  isSupported: boolean;
  /** Whether cross-tab sync is available and initialized */
  isAvailable: boolean;
  /** List of registered event types */
  eventTypes: string[];
  /** Total number of registered handlers across all event types */
  totalHandlers: number;
}

/**
 * Standard cross-tab event types
 * 
 * @enum {string}
 * @example
 * crossTabSyncService.broadcast(CrossTabEventTypes.PAT_AUTHENTICATED, { token: 'ghp_...' });
 */
export const CrossTabEventTypes = {
  /** PAT authentication completed */
  PAT_AUTHENTICATED: 'PAT_AUTHENTICATED',
  /** SAML authentication completed */
  SAML_AUTHENTICATED: 'SAML_AUTHENTICATED',
  /** User logged out */
  LOGOUT: 'LOGOUT',
  /** Authentication token refreshed */
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  /** Application state updated */
  STATE_UPDATE: 'STATE_UPDATE',
  /** User preferences updated */
  PREFERENCES_UPDATE: 'PREFERENCES_UPDATE',
  /** Repository selected */
  REPOSITORY_SELECTED: 'REPOSITORY_SELECTED',
  /** Git branch changed */
  BRANCH_CHANGED: 'BRANCH_CHANGED'
} as const;

/**
 * Cross-Tab Synchronization Service
 * 
 * @class CrossTabSyncService
 * @description Provides event-driven cross-tab communication using BroadcastChannel API
 * 
 * Features:
 * - Event-driven architecture for cross-tab communication
 * - Type-safe event registration and broadcasting
 * - Automatic cleanup of event listeners
 * - Browser compatibility detection
 * - Support for multiple event types (authentication, state sync, etc.)
 */
class CrossTabSyncService {
  private logger: any;
  private channelName: string;
  private channel: BroadcastChannel | null;
  private eventHandlers: Map<string, Set<CrossTabEventHandler>>;
  private isSupported: boolean;
  private tabId?: string;

  constructor() {
    this.logger = logger.getLogger('CrossTabSyncService');
    this.channelName = 'sgex_cross_tab_sync';
    this.channel = null;
    this.eventHandlers = new Map();
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
  private checkBrowserSupport(): boolean {
    return typeof BroadcastChannel !== 'undefined';
  }

  /**
   * Initialize the BroadcastChannel
   */
  private initializeChannel(): void {
    try {
      this.channel = new BroadcastChannel(this.channelName);
      
      // Set up message listener
      this.channel.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data);
      };
      
      this.channel.onerror = (error: Event) => {
        this.logger.error('BroadcastChannel error', { error: (error as any).message });
      };
      
      this.logger.debug('CrossTabSyncService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize BroadcastChannel', { error: (error as Error).message });
      this.isSupported = false;
    }
  }

  /**
   * Handle incoming messages from other tabs
   * @param {CrossTabMessage} message - Message data
   */
  private handleMessage(message: CrossTabMessage): void {
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
            error: (error as Error).message 
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
   * @param {CrossTabEventHandler} handler - Handler function to call when event is received
   * @returns {Function} Unsubscribe function
   */
  public on<T = any>(eventType: string, handler: CrossTabEventHandler<T>): () => boolean {
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

    const handlers = this.eventHandlers.get(eventType)!;
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
   * @param {CrossTabEventHandler} handler - Handler function to remove
   * @returns {boolean} True if handler was found and removed
   */
  public off(eventType: string, handler: CrossTabEventHandler): boolean {
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
   * @param {T} data - Event data to broadcast
   * @returns {boolean} True if broadcast was successful
   */
  public broadcast<T = any>(eventType: string, data: T | null = null): boolean {
    if (!this.isSupported) {
      this.logger.debug('Broadcast skipped - BroadcastChannel not supported', { eventType });
      return false;
    }

    if (!this.channel) {
      this.logger.warn('Broadcast skipped - channel not initialized', { eventType });
      return false;
    }

    try {
      const message: CrossTabMessage<T> = {
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
        error: (error as Error).message 
      });
      return false;
    }
  }

  /**
   * Get a unique identifier for this tab
   * @returns {string} Tab identifier
   */
  private getTabId(): string {
    // Generate a unique tab ID if it doesn't exist
    if (!this.tabId) {
      this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.tabId;
  }

  /**
   * Remove all event handlers
   */
  public clearAllHandlers(): void {
    const eventTypes = Array.from(this.eventHandlers.keys());
    this.eventHandlers.clear();
    
    this.logger.debug('All event handlers cleared', { 
      clearedTypes: eventTypes 
    });
  }

  /**
   * Close the BroadcastChannel and cleanup
   */
  public destroy(): void {
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
  public isAvailable(): boolean {
    return this.isSupported && this.channel !== null;
  }

  /**
   * Get statistics about registered handlers
   * @returns {CrossTabStats} Handler statistics
   */
  public getStats(): CrossTabStats {
    const stats: CrossTabStats = {
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

export default crossTabSyncService;
