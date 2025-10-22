/**
 * Tests for CrossTabSyncService
 */

import crossTabSyncService, { CrossTabEventTypes } from './crossTabSyncService';

describe('CrossTabSyncService', () => {
  beforeEach(() => {
    // Clear all handlers before each test
    crossTabSyncService.clearAllHandlers();
  });

  afterEach(() => {
    // Cleanup after each test
    crossTabSyncService.clearAllHandlers();
  });

  describe('Browser Support Detection', () => {
    it('should detect browser support for BroadcastChannel', () => {
      const isSupported = crossTabSyncService.checkBrowserSupport();
      expect(typeof isSupported).toBe('boolean');
    });

    it('should report availability status', () => {
      const stats = crossTabSyncService.getStats();
      expect(stats).toHaveProperty('isSupported');
      expect(stats).toHaveProperty('isAvailable');
    });
  });

  describe('Event Handler Registration', () => {
    it('should register an event handler', () => {
      const handler = jest.fn();
      const unsubscribe = crossTabSyncService.on('TEST_EVENT', handler);

      expect(typeof unsubscribe).toBe('function');
      
      const stats = crossTabSyncService.getStats();
      expect(stats.eventTypes).toContain('TEST_EVENT');
      expect(stats.totalHandlers).toBe(1);
    });

    it('should register multiple handlers for the same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      crossTabSyncService.on('TEST_EVENT', handler1);
      crossTabSyncService.on('TEST_EVENT', handler2);

      const stats = crossTabSyncService.getStats();
      expect(stats.totalHandlers).toBe(2);
    });

    it('should throw error for invalid event type', () => {
      expect(() => {
        crossTabSyncService.on('', jest.fn());
      }).toThrow();

      expect(() => {
        crossTabSyncService.on(null, jest.fn());
      }).toThrow();
    });

    it('should throw error for invalid handler', () => {
      expect(() => {
        crossTabSyncService.on('TEST_EVENT', 'not a function');
      }).toThrow();

      expect(() => {
        crossTabSyncService.on('TEST_EVENT', null);
      }).toThrow();
    });
  });

  describe('Event Handler Unregistration', () => {
    it('should unregister an event handler', () => {
      const handler = jest.fn();
      crossTabSyncService.on('TEST_EVENT', handler);

      const removed = crossTabSyncService.off('TEST_EVENT', handler);
      expect(removed).toBe(true);

      const stats = crossTabSyncService.getStats();
      expect(stats.totalHandlers).toBe(0);
    });

    it('should return unsubscribe function from on()', () => {
      const handler = jest.fn();
      const unsubscribe = crossTabSyncService.on('TEST_EVENT', handler);

      unsubscribe();

      const stats = crossTabSyncService.getStats();
      expect(stats.totalHandlers).toBe(0);
    });

    it('should return false when removing non-existent handler', () => {
      const handler = jest.fn();
      const removed = crossTabSyncService.off('TEST_EVENT', handler);
      expect(removed).toBe(false);
    });

    it('should clean up empty handler sets', () => {
      const handler = jest.fn();
      crossTabSyncService.on('TEST_EVENT', handler);
      crossTabSyncService.off('TEST_EVENT', handler);

      const stats = crossTabSyncService.getStats();
      expect(stats.eventTypes).not.toContain('TEST_EVENT');
    });
  });

  describe('Event Broadcasting', () => {
    it('should return false when BroadcastChannel is not supported', () => {
      // If BroadcastChannel is supported in test environment, skip
      if (crossTabSyncService.isAvailable()) {
        // Mock as unavailable
        const originalIsSupported = crossTabSyncService.isSupported;
        crossTabSyncService.isSupported = false;

        const result = crossTabSyncService.broadcast('TEST_EVENT', { test: 'data' });
        expect(result).toBe(false);

        // Restore
        crossTabSyncService.isSupported = originalIsSupported;
      } else {
        const result = crossTabSyncService.broadcast('TEST_EVENT', { test: 'data' });
        expect(result).toBe(false);
      }
    });
  });

  describe('Message Handling', () => {
    it('should call registered handlers when message is received', () => {
      const handler = jest.fn();
      crossTabSyncService.on('TEST_EVENT', handler);

      // Simulate incoming message
      const message = {
        type: 'TEST_EVENT',
        data: { test: 'data' },
        timestamp: Date.now(),
        tabId: 'test_tab'
      };

      crossTabSyncService.handleMessage(message);

      expect(handler).toHaveBeenCalledWith(
        { test: 'data' },
        expect.objectContaining({
          type: 'TEST_EVENT',
          data: { test: 'data' }
        })
      );
    });

    it('should handle invalid messages gracefully', () => {
      const handler = jest.fn();
      crossTabSyncService.on('TEST_EVENT', handler);

      // Invalid message without type
      crossTabSyncService.handleMessage({ data: 'test' });
      expect(handler).not.toHaveBeenCalled();

      // Null message
      crossTabSyncService.handleMessage(null);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should call multiple handlers for the same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      crossTabSyncService.on('TEST_EVENT', handler1);
      crossTabSyncService.on('TEST_EVENT', handler2);

      const message = {
        type: 'TEST_EVENT',
        data: { test: 'data' },
        timestamp: Date.now()
      };

      crossTabSyncService.handleMessage(message);

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should handle handler errors gracefully', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const goodHandler = jest.fn();

      crossTabSyncService.on('TEST_EVENT', errorHandler);
      crossTabSyncService.on('TEST_EVENT', goodHandler);

      const message = {
        type: 'TEST_EVENT',
        data: { test: 'data' },
        timestamp: Date.now()
      };

      // Should not throw
      expect(() => {
        crossTabSyncService.handleMessage(message);
      }).not.toThrow();

      expect(errorHandler).toHaveBeenCalled();
      expect(goodHandler).toHaveBeenCalled();
    });
  });

  describe('Standard Event Types', () => {
    it('should export standard event types', () => {
      expect(CrossTabEventTypes).toHaveProperty('PAT_AUTHENTICATED');
      expect(CrossTabEventTypes).toHaveProperty('SAML_AUTHENTICATED');
      expect(CrossTabEventTypes).toHaveProperty('LOGOUT');
      expect(CrossTabEventTypes).toHaveProperty('TOKEN_REFRESH');
      expect(CrossTabEventTypes).toHaveProperty('STATE_UPDATE');
    });

    it('should use standard event types for registration', () => {
      const handler = jest.fn();
      crossTabSyncService.on(CrossTabEventTypes.PAT_AUTHENTICATED, handler);

      const stats = crossTabSyncService.getStats();
      expect(stats.eventTypes).toContain(CrossTabEventTypes.PAT_AUTHENTICATED);
    });
  });

  describe('Statistics', () => {
    it('should return accurate statistics', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      crossTabSyncService.on('EVENT_A', handler1);
      crossTabSyncService.on('EVENT_A', handler2);
      crossTabSyncService.on('EVENT_B', handler3);

      const stats = crossTabSyncService.getStats();

      expect(stats.totalHandlers).toBe(3);
      expect(stats.eventTypes).toHaveLength(2);
      expect(stats.eventTypes).toContain('EVENT_A');
      expect(stats.eventTypes).toContain('EVENT_B');
    });

    it('should include availability in statistics', () => {
      const stats = crossTabSyncService.getStats();

      expect(stats).toHaveProperty('isSupported');
      expect(stats).toHaveProperty('isAvailable');
      expect(typeof stats.isSupported).toBe('boolean');
      expect(typeof stats.isAvailable).toBe('boolean');
    });
  });

  describe('Clear All Handlers', () => {
    it('should clear all registered handlers', () => {
      crossTabSyncService.on('EVENT_A', jest.fn());
      crossTabSyncService.on('EVENT_B', jest.fn());
      crossTabSyncService.on('EVENT_C', jest.fn());

      let stats = crossTabSyncService.getStats();
      expect(stats.totalHandlers).toBe(3);

      crossTabSyncService.clearAllHandlers();

      stats = crossTabSyncService.getStats();
      expect(stats.totalHandlers).toBe(0);
      expect(stats.eventTypes).toHaveLength(0);
    });
  });

  describe('Tab ID Generation', () => {
    it('should generate a unique tab ID', () => {
      const tabId1 = crossTabSyncService.getTabId();
      expect(typeof tabId1).toBe('string');
      expect(tabId1).toMatch(/^tab_/);
    });

    it('should return same tab ID on subsequent calls', () => {
      const tabId1 = crossTabSyncService.getTabId();
      const tabId2 = crossTabSyncService.getTabId();
      expect(tabId1).toBe(tabId2);
    });
  });
});
