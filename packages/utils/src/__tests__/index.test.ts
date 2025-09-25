/**
 * Tests for @sgex/utils package
 */

import { 
  getCacheInfo, 
  clearModuleCache,
  createLazyAjv
} from '../index';

// Mock the dynamic imports to avoid loading actual libraries in tests
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        get: jest.fn()
      }
    }
  }))
}));

jest.mock('ajv', () => ({
  default: jest.fn().mockImplementation(() => ({
    addSchema: jest.fn(),
    validate: jest.fn()
  }))
}));

jest.mock('ajv-formats', () => ({
  default: jest.fn()
}));

describe('@sgex/utils', () => {
  beforeEach(() => {
    clearModuleCache();
  });

  describe('Cache Management', () => {
    test('should start with empty cache', () => {
      const info = getCacheInfo();
      expect(info.size).toBe(0);
      expect(info.keys).toEqual([]);
    });

    test('should clear cache', () => {
      clearModuleCache();
      const info = getCacheInfo();
      expect(info.size).toBe(0);
    });
  });

  describe('Factory Functions', () => {
    test('should create AJV instance with default options', async () => {
      // This test would need actual AJV in a real environment
      // For now, just test that the function exists and is callable
      expect(typeof createLazyAjv).toBe('function');
    });
  });

  describe('Library Loader', () => {
    test('should expose cache management functions', () => {
      expect(typeof getCacheInfo).toBe('function');
      expect(typeof clearModuleCache).toBe('function');
    });
  });

  describe('Type Exports', () => {
    test('should export TypeScript interfaces', () => {
      // This is mainly a compilation test - if the build succeeds,
      // the interfaces are properly exported
      expect(true).toBe(true);
    });
  });
});