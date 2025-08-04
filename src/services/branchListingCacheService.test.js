/**
 * Branch Listing Cache Service Tests
 */

// Mock logger to avoid localStorage conflicts
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    getLogger: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(), 
      warn: jest.fn(),
      error: jest.fn(),
      cache: jest.fn()
    }))
  }
}));

import branchListingCacheService from './branchListingCacheService';

// Create a working localStorage mock
let mockStore = {};

const localStorageMock = {
  getItem: jest.fn((key) => {
    return mockStore[key] || null;
  }),
  setItem: jest.fn((key, value) => {
    if (mockStore._simulateQuotaExceeded) {
      delete mockStore._simulateQuotaExceeded;
      throw new Error('Storage quota exceeded');
    }
    mockStore[key] = value.toString();
  }),
  removeItem: jest.fn((key) => {
    delete mockStore[key];
  }),
  clear: jest.fn(() => {
    mockStore = {};
  }),
  get length() {
    return Object.keys(mockStore).length;
  },
  key: jest.fn((index) => Object.keys(mockStore)[index] || null),
  // Test helpers
  _reset() { 
    mockStore = {}; 
    this.getItem.mockClear();
    this.setItem.mockClear();
    this.removeItem.mockClear();
    this.clear.mockClear();
  }
};

// Replace global localStorage
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Also mock window.localStorage if it exists
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
}

describe('BranchListingCacheService', () => {
  const testOwner = 'litlfred';
  const testRepo = 'sgex';
  const testBranches = [
    { name: 'main', commit: { sha: 'abc123' } },
    { name: 'feature-branch', commit: { sha: 'def456' } }
  ];
  const testPRs = [
    { id: 1, number: 123, title: 'Test PR', state: 'open' },
    { id: 2, number: 124, title: 'Another PR', state: 'closed' }
  ];

  beforeEach(() => {
    localStorageMock._reset();
  });

  describe('Cache Key Generation', () => {
    test('should generate correct cache key', () => {
      const key = branchListingCacheService.getCacheKey(testOwner, testRepo);
      expect(key).toBe('sgex_branch_listing_cache_litlfred_sgex');
    });
  });

  describe('Cache Expiry', () => {
    test('should detect stale cache (older than 5 minutes)', () => {
      const oldTimestamp = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      const recentTimestamp = Date.now() - (3 * 60 * 1000); // 3 minutes ago
      
      expect(branchListingCacheService.isStale(oldTimestamp)).toBe(true);
      expect(branchListingCacheService.isStale(recentTimestamp)).toBe(false);
    });
  });

  describe('Cache Operations', () => {
    test('should cache and retrieve data successfully', () => {
      // Cache data
      const result = branchListingCacheService.setCachedData(
        testOwner, 
        testRepo, 
        testBranches, 
        testPRs
      );
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);

      // Retrieve cached data
      const cached = branchListingCacheService.getCachedData(testOwner, testRepo);
      expect(cached).not.toBeNull();
      expect(cached.branches).toEqual(testBranches);
      expect(cached.pullRequests).toEqual(testPRs);
      expect(cached.owner).toBe(testOwner);
      expect(cached.repo).toBe(testRepo);
      expect(cached.timestamp).toBeCloseTo(Date.now(), -2);
    });

    test('should return null for non-existent cache', () => {
      const cached = branchListingCacheService.getCachedData('nonexistent', 'repo');
      expect(cached).toBeNull();
    });

    test('should return null and remove stale cache', () => {
      const cacheKey = branchListingCacheService.getCacheKey(testOwner, testRepo);
      
      // Set stale data directly in localStorage
      const staleData = {
        branches: testBranches,
        pullRequests: testPRs,
        timestamp: Date.now() - (6 * 60 * 1000), // 6 minutes ago
        owner: testOwner,
        repo: testRepo
      };
      mockStore[cacheKey] = JSON.stringify(staleData);
      
      const cached = branchListingCacheService.getCachedData(testOwner, testRepo);
      expect(cached).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(cacheKey);
    });

    test('should clear specific cache', () => {
      // Set cache first
      branchListingCacheService.setCachedData(testOwner, testRepo, testBranches, testPRs);
      expect(branchListingCacheService.getCachedData(testOwner, testRepo)).not.toBeNull();
      
      // Clear cache
      const result = branchListingCacheService.clearCache(testOwner, testRepo);
      expect(result).toBe(true);
      expect(branchListingCacheService.getCachedData(testOwner, testRepo)).toBeNull();
    });

    test('should clear all caches', () => {
      // Set multiple caches
      branchListingCacheService.setCachedData(testOwner, testRepo, testBranches, testPRs);
      branchListingCacheService.setCachedData('other', 'repo', [], []);
      
      const result = branchListingCacheService.clearAllCaches();
      expect(result).toBe(true);
      expect(branchListingCacheService.getCachedData(testOwner, testRepo)).toBeNull();
      expect(branchListingCacheService.getCachedData('other', 'repo')).toBeNull();
    });
  });

  describe('Cache Info', () => {
    test('should provide correct cache info for existing cache', () => {
      // Set cache
      branchListingCacheService.setCachedData(testOwner, testRepo, testBranches, testPRs);
      
      const info = branchListingCacheService.getCacheInfo(testOwner, testRepo);
      expect(info.exists).toBe(true);
      expect(info.stale).toBe(false);
      expect(info.branchCount).toBe(2);
      expect(info.prCount).toBe(2);
      expect(info.ageMinutes).toBe(0);
    });

    test('should provide correct cache info for non-existent cache', () => {
      const info = branchListingCacheService.getCacheInfo('nonexistent', 'repo');
      expect(info.exists).toBe(false);
      expect(info.stale).toBe(true);
    });
  });

  describe('Force Refresh', () => {
    test('should clear cache when force refresh is called', () => {
      // Set cache
      branchListingCacheService.setCachedData(testOwner, testRepo, testBranches, testPRs);
      expect(branchListingCacheService.getCachedData(testOwner, testRepo)).not.toBeNull();
      
      // Force refresh
      const result = branchListingCacheService.forceRefresh(testOwner, testRepo);
      expect(result).toBe(true);
      
      // Verify cache is cleared
      expect(branchListingCacheService.getCachedData(testOwner, testRepo)).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      // Trigger storage quota exceeded error 
      mockStore._simulateQuotaExceeded = true;

      const result = branchListingCacheService.setCachedData(
        testOwner, 
        testRepo, 
        testBranches, 
        testPRs
      );
      expect(result).toBe(false);
    });

    test('should handle JSON parsing errors gracefully', () => {
      const cacheKey = branchListingCacheService.getCacheKey(testOwner, testRepo);
      
      // Set invalid JSON data
      mockStore[cacheKey] = 'invalid json{';
      
      const cached = branchListingCacheService.getCachedData(testOwner, testRepo);
      expect(cached).toBeNull();
    });
  });
});