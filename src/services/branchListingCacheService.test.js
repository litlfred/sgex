/**
 * Branch Listing Cache Service Tests
 */

import branchListingCacheService from './branchListingCacheService';

// Mock localStorage
let mockLocalStorage = {};

const localStorageMock = {
  getItem: jest.fn((key) => mockLocalStorage[key] || null),
  setItem: jest.fn((key, value) => {
    mockLocalStorage[key] = value.toString();
  }),
  removeItem: jest.fn((key) => {
    delete mockLocalStorage[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorage = {};
  }),
  get length() {
    return Object.keys(mockLocalStorage).length;
  },
  key: jest.fn((index) => Object.keys(mockLocalStorage)[index] || null)
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

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
    mockLocalStorage = {};
    jest.clearAllMocks();
  });

  describe('Cache Key Generation', () => {
    test('should generate correct cache key', () => {
      const key = branchListingCacheService.getCacheKey(testOwner, testRepo);
      expect(key).toBe('sgex_branch_listing_cache_litlfred_sgex');
    });
  });

  describe('Cache Expiry', () => {
    test('should detect stale cache (older than 5 minutes)', () => {
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      const sixMinutesAgo = now - (6 * 60 * 1000);

      expect(branchListingCacheService.isStale(fiveMinutesAgo)).toBe(false);
      expect(branchListingCacheService.isStale(sixMinutesAgo)).toBe(true);
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

      // Retrieve cached data
      const cached = branchListingCacheService.getCachedData(testOwner, testRepo);
      expect(cached).not.toBeNull();
      expect(cached.branches).toEqual(testBranches);
      expect(cached.pullRequests).toEqual(testPRs);
      expect(cached.owner).toBe(testOwner);
      expect(cached.repo).toBe(testRepo);
      expect(cached.timestamp).toBeCloseTo(Date.now(), -2); // Within 100ms
    });

    test('should return null for non-existent cache', () => {
      const cached = branchListingCacheService.getCachedData('nonexistent', 'repo');
      expect(cached).toBeNull();
    });

    test('should return null and remove stale cache', () => {
      // Mock old timestamp (6 minutes ago)
      const oldTimestamp = Date.now() - (6 * 60 * 1000);
      const staleData = {
        branches: testBranches,
        pullRequests: testPRs,
        timestamp: oldTimestamp,
        owner: testOwner,
        repo: testRepo
      };
      
      const cacheKey = branchListingCacheService.getCacheKey(testOwner, testRepo);
      mockLocalStorage[cacheKey] = JSON.stringify(staleData);

      // Should return null and remove stale cache
      const cached = branchListingCacheService.getCachedData(testOwner, testRepo);
      expect(cached).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(cacheKey);
    });

    test('should clear specific cache', () => {
      // Set cache
      branchListingCacheService.setCachedData(testOwner, testRepo, testBranches, testPRs);
      
      // Clear cache
      const result = branchListingCacheService.clearCache(testOwner, testRepo);
      expect(result).toBe(true);
      
      // Verify cache is gone
      const cached = branchListingCacheService.getCachedData(testOwner, testRepo);
      expect(cached).toBeNull();
    });

    test('should clear all caches', () => {
      // Set multiple caches
      branchListingCacheService.setCachedData('owner1', 'repo1', testBranches, testPRs);
      branchListingCacheService.setCachedData('owner2', 'repo2', testBranches, testPRs);
      
      // Clear all caches
      const result = branchListingCacheService.clearAllCaches();
      expect(result).toBe(true);
      
      // Verify all caches are gone
      expect(branchListingCacheService.getCachedData('owner1', 'repo1')).toBeNull();
      expect(branchListingCacheService.getCachedData('owner2', 'repo2')).toBeNull();
    });
  });

  describe('Cache Info', () => {
    test('should provide correct cache info for existing cache', () => {
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
      // Mock localStorage to throw error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = branchListingCacheService.setCachedData(
        testOwner, 
        testRepo, 
        testBranches, 
        testPRs
      );
      expect(result).toBe(false);
    });

    test('should handle JSON parsing errors gracefully', () => {
      // Set invalid JSON in cache
      const cacheKey = branchListingCacheService.getCacheKey(testOwner, testRepo);
      mockLocalStorage[cacheKey] = 'invalid json';

      const cached = branchListingCacheService.getCachedData(testOwner, testRepo);
      expect(cached).toBeNull();
    });
  });
});