/**
 * Tests for the centralized logger utility
 */

import logger from '../utils/logger';

// Mock console methods to test logging
const originalConsole = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  log: console.log
};

describe('Logger', () => {
  let mockConsole;
  
  beforeEach(() => {
    // Mock all console methods
    mockConsole = {
      error: jest.fn(),
      warn: jest.fn(), 
      info: jest.fn(),
      log: jest.fn()
    };
    
    console.error = mockConsole.error;
    console.warn = mockConsole.warn;
    console.info = mockConsole.info;
    console.log = mockConsole.log;
    
    // Clear localStorage
    localStorage.clear();
  });
  
  afterEach(() => {
    // Restore original console methods
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.log = originalConsole.log;
  });

  test('creates logger instances with proper prefixes', () => {
    const testLogger = logger.getLogger('TestComponent');
    
    expect(testLogger).toBeDefined();
    expect(typeof testLogger.error).toBe('function');
    expect(typeof testLogger.warn).toBe('function');
    expect(typeof testLogger.info).toBe('function');
    expect(typeof testLogger.debug).toBe('function');
  });

  test('logs messages with correct format and prefix', () => {
    logger.setLevel('DEBUG'); // Ensure debug level is enabled
    const testLogger = logger.getLogger('TestComponent');
    
    testLogger.info('Test message', { key: 'value' });
    
    expect(mockConsole.info).toHaveBeenCalled();
    const logCall = mockConsole.info.mock.calls[0];
    expect(logCall[0]).toMatch(/\[INFO\] \[SGEX:TestComponent\]/);
    expect(logCall[1]).toBe('Test message');
    expect(logCall[2]).toEqual({ key: 'value' });
  });

  test('respects log levels', () => {
    logger.setLevel('WARN');
    const testLogger = logger.getLogger('TestComponent');
    
    // eslint-disable-next-line testing-library/no-debugging-utils
    testLogger.debug('Debug message');
    testLogger.info('Info message');
    testLogger.warn('Warn message');
    testLogger.error('Error message');
    
    expect(mockConsole.log).not.toHaveBeenCalled(); // debug
    expect(mockConsole.info).not.toHaveBeenCalled(); // info
    expect(mockConsole.warn).toHaveBeenCalled(); // warn
    expect(mockConsole.error).toHaveBeenCalled(); // error
  });

  test('provides specialized logging methods', () => {
    logger.setLevel('DEBUG'); // Ensure debug level is enabled
    const testLogger = logger.getLogger('TestService');
    
    testLogger.apiCall('GET', '/test', { param: 'value' });
    testLogger.apiResponse('GET', '/test', 200, 150);
    testLogger.apiError('GET', '/test', new Error('Test error'));
    testLogger.userAction('click', { button: 'submit' });
    testLogger.performance('operation', 250);
    
    // Should have logged multiple messages
    expect(mockConsole.log.mock.calls.length + mockConsole.info.mock.calls.length + mockConsole.error.mock.calls.length).toBeGreaterThan(0);
  });

  test('stores and retrieves log level from localStorage', () => {
    logger.setLevel('INFO');
    expect(localStorage.getItem('sgex-log-level')).toBe('INFO');
    
    // Create new logger instance to test retrieval
    const Logger = require('../utils/logger').default.constructor;
    const newLogger = new Logger();
    expect(newLogger.currentLevel).toBe(newLogger.LEVELS.INFO);
  });

  test('makes logger available globally', () => {
    expect(window.sgexLogger).toBeDefined();
    expect(typeof window.sgexLogger.enableVerbose).toBe('function');
    expect(typeof window.sgexLogger.disableVerbose).toBe('function');
  });
});