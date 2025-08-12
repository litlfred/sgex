/**
 * TypeScript/JavaScript Integration Test
 * 
 * This test demonstrates that TypeScript code can be imported and used
 * from JavaScript, showing the integration between the two during migration.
 */

import logger from './logger.ts';

describe('TypeScript/JavaScript Integration', () => {
  test('TypeScript logger can be imported and used in JavaScript', () => {
    // Test that the TypeScript logger exports work correctly
    expect(logger).toBeDefined();
    expect(typeof logger.setLevel).toBe('function');
    expect(typeof logger.getLevel).toBe('function');
    expect(typeof logger.getLogger).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('TypeScript logger provides component loggers', () => {
    const componentLogger = logger.getLogger('IntegrationTest');
    
    expect(componentLogger).toBeDefined();
    expect(typeof componentLogger.apiCall).toBe('function');
    expect(typeof componentLogger.apiResponse).toBe('function');
    expect(typeof componentLogger.apiError).toBe('function');
    expect(typeof componentLogger.componentMount).toBe('function');
    expect(typeof componentLogger.performance).toBe('function');
  });

  test('TypeScript logger constants are accessible', () => {
    expect(logger.LEVELS).toEqual({
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    });
  });

  test('TypeScript logger level management works', () => {
    const originalLevel = logger.getLevel();
    
    logger.setLevel('WARN');
    expect(logger.getLevel()).toBe('WARN');
    expect(logger.isLevelEnabled('ERROR')).toBe(true);
    expect(logger.isLevelEnabled('WARN')).toBe(true);
    expect(logger.isLevelEnabled('INFO')).toBe(false);
    expect(logger.isLevelEnabled('DEBUG')).toBe(false);
    
    // Restore original level
    logger.setLevel(originalLevel);
  });

  test('Timer functionality works', () => {
    const timer = logger.timer('test_timer');
    expect(timer).toBeDefined();
    expect(typeof timer.end).toBe('function');
    
    // Should not throw when calling end
    expect(() => timer.end()).not.toThrow();
  });

  test('Custom prefix logging works', () => {
    const customLogger = logger.withPrefix('[TEST-PREFIX]');
    expect(customLogger).toBeDefined();
    expect(typeof customLogger.error).toBe('function');
    expect(typeof customLogger.warn).toBe('function');
    expect(typeof customLogger.info).toBe('function');
    expect(typeof customLogger.debug).toBe('function');
  });
});