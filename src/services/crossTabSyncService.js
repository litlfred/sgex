/**
 * Cross-Tab Synchronization Service
 * 
 * Provides cross-tab communication using BroadcastChannel API with localStorage fallback.
 * Used for coordinating SAML authorization workflows across multiple browser tabs.
 */

import logger from '../utils/logger';

class CrossTabSyncService {
  constructor() {
    this.logger = logger.getLogger('CrossTabSyncService');
    this.channels = new Map();
    this.listeners = new Map();
    this.storageListeners = new Map();
    
    // Check if BroadcastChannel is supported
    this.supportsBroadcastChannel = typeof BroadcastChannel !== 'undefined';
    
    if (!this.supportsBroadcastChannel) {
      this.logger.warn('BroadcastChannel not supported, using localStorage fallback');
      this._setupStorageFallback();
    }
    
    this.logger.debug('CrossTabSyncService initialized', {
      supportsBroadcastChannel: this.supportsBroadcastChannel
    });
  }

  /**
   * Setup localStorage-based fallback for browsers without BroadcastChannel
   */
  _setupStorageFallback() {
    this.storageEventHandler = (event) => {
      if (event.key && event.key.startsWith('crosstab:') && event.newValue) {
        try {
          const channelName = event.key.substring(9); // Remove 'crosstab:' prefix
          const data = JSON.parse(event.newValue);
          
          const listeners = this.storageListeners.get(channelName);
          if (listeners) {
            listeners.forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                this.logger.error('Error in storage listener callback', {
                  channelName,
                  error: error.message
                });
              }
            });
          }
        } catch (error) {
          this.logger.error('Error processing storage event', {
            error: error.message
          });
        }
      }
    };
    
    window.addEventListener('storage', this.storageEventHandler);
  }

  /**
   * Subscribe to messages on a channel
   * @param {string} channelName - Name of the channel
   * @param {Function} callback - Callback function to handle messages
   * @returns {Function} Unsubscribe function
   */
  subscribe(channelName, callback) {
    if (!channelName || typeof callback !== 'function') {
      throw new Error('Invalid channel name or callback');
    }

    if (this.supportsBroadcastChannel) {
      // Use BroadcastChannel
      if (!this.channels.has(channelName)) {
        const channel = new BroadcastChannel(channelName);
        this.channels.set(channelName, channel);
        this.listeners.set(channelName, new Set());
      }

      const channel = this.channels.get(channelName);
      const listeners = this.listeners.get(channelName);
      
      const wrappedCallback = (event) => {
        try {
          callback(event.data);
        } catch (error) {
          this.logger.error('Error in channel listener callback', {
            channelName,
            error: error.message
          });
        }
      };
      
      listeners.add(wrappedCallback);
      channel.addEventListener('message', wrappedCallback);

      this.logger.debug('Subscribed to channel', { channelName });

      // Return unsubscribe function
      return () => {
        channel.removeEventListener('message', wrappedCallback);
        listeners.delete(wrappedCallback);
        
        if (listeners.size === 0) {
          channel.close();
          this.channels.delete(channelName);
          this.listeners.delete(channelName);
        }
        
        this.logger.debug('Unsubscribed from channel', { channelName });
      };
    } else {
      // Use localStorage fallback
      if (!this.storageListeners.has(channelName)) {
        this.storageListeners.set(channelName, new Set());
      }
      
      const listeners = this.storageListeners.get(channelName);
      listeners.add(callback);
      
      this.logger.debug('Subscribed to storage channel', { channelName });
      
      // Return unsubscribe function
      return () => {
        listeners.delete(callback);
        
        if (listeners.size === 0) {
          this.storageListeners.delete(channelName);
        }
        
        this.logger.debug('Unsubscribed from storage channel', { channelName });
      };
    }
  }

  /**
   * Publish a message to a channel
   * @param {string} channelName - Name of the channel
   * @param {Object} data - Data to send
   */
  publish(channelName, data) {
    if (!channelName) {
      throw new Error('Invalid channel name');
    }

    if (this.supportsBroadcastChannel) {
      // Use BroadcastChannel
      if (!this.channels.has(channelName)) {
        const channel = new BroadcastChannel(channelName);
        this.channels.set(channelName, channel);
        this.listeners.set(channelName, new Set());
      }

      const channel = this.channels.get(channelName);
      channel.postMessage(data);
      
      this.logger.debug('Published to channel', { 
        channelName, 
        data 
      });
    } else {
      // Use localStorage fallback
      try {
        const key = `crosstab:${channelName}`;
        const value = JSON.stringify({
          ...data,
          timestamp: Date.now()
        });
        localStorage.setItem(key, value);
        
        // Clean up immediately to avoid cluttering localStorage
        setTimeout(() => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            // Ignore cleanup errors
          }
        }, 100);
        
        this.logger.debug('Published to storage channel', { 
          channelName, 
          data 
        });
      } catch (error) {
        this.logger.error('Error publishing to storage channel', {
          channelName,
          error: error.message
        });
      }
    }
  }

  /**
   * Cleanup all channels and listeners
   */
  destroy() {
    // Close all BroadcastChannels
    this.channels.forEach((channel, name) => {
      channel.close();
      this.logger.debug('Closed channel', { channelName: name });
    });
    
    this.channels.clear();
    this.listeners.clear();
    this.storageListeners.clear();
    
    // Remove storage event listener
    if (this.storageEventHandler) {
      window.removeEventListener('storage', this.storageEventHandler);
    }
    
    this.logger.debug('CrossTabSyncService destroyed');
  }
}

// Create singleton instance
const crossTabSyncService = new CrossTabSyncService();

export default crossTabSyncService;
