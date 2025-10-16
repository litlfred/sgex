/**
 * Cross-Tab Synchronization Service Tests
 */

import crossTabSyncService from './crossTabSyncService';

describe('CrossTabSyncService', () => {
  let unsubscribeFunctions = [];

  beforeEach(() => {
    // Clean up any existing subscriptions
    unsubscribeFunctions = [];
  });

  afterEach(() => {
    // Unsubscribe from all channels
    unsubscribeFunctions.forEach(unsub => unsub());
    unsubscribeFunctions = [];
  });

  describe('subscribe and publish', () => {
    it('should allow subscribing to a channel', () => {
      const channelName = 'test-channel';
      const callback = jest.fn();

      const unsubscribe = crossTabSyncService.subscribe(channelName, callback);
      unsubscribeFunctions.push(unsubscribe);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow publishing to a channel', () => {
      const channelName = 'publish-test-channel';
      const testData = { message: 'Hello, World!', timestamp: Date.now() };

      // Should not throw
      expect(() => {
        crossTabSyncService.publish(channelName, testData);
      }).not.toThrow();
    });

    it('should allow unsubscribing from a channel', () => {
      const channelName = 'unsubscribe-test';
      const callback = jest.fn();

      const unsubscribe = crossTabSyncService.subscribe(channelName, callback);

      // Should not throw
      expect(() => {
        unsubscribe();
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid channel name in subscribe', () => {
      expect(() => {
        crossTabSyncService.subscribe('', () => {});
      }).toThrow('Invalid channel name or callback');
    });

    it('should throw error for invalid callback in subscribe', () => {
      expect(() => {
        crossTabSyncService.subscribe('test', null);
      }).toThrow('Invalid channel name or callback');
    });

    it('should throw error for invalid channel name in publish', () => {
      expect(() => {
        crossTabSyncService.publish('', {});
      }).toThrow('Invalid channel name');
    });

    it('should handle errors in publish gracefully', () => {
      const channelName = 'error-callback-channel';
      
      // Should not throw
      expect(() => {
        crossTabSyncService.publish(channelName, { test: true });
      }).not.toThrow();
    });
  });

  describe('multiple channels', () => {
    it('should handle multiple independent channels', () => {
      const channel1 = 'channel-1';
      const channel2 = 'channel-2';
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const unsubscribe1 = crossTabSyncService.subscribe(channel1, callback1);
      const unsubscribe2 = crossTabSyncService.subscribe(channel2, callback2);

      unsubscribeFunctions.push(unsubscribe1, unsubscribe2);

      // Should not throw
      expect(() => {
        crossTabSyncService.publish(channel1, { channel: 1 });
        crossTabSyncService.publish(channel2, { channel: 2 });
      }).not.toThrow();
    });
  });
});
