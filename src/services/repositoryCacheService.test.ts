/**
 * Test for Repository Cache Service
 */

import repositoryCacheService from './repositoryCacheService';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    // For debugging
    keys: jest.fn(() => Object.keys(store))
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Also set it on window for compatibility
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
}

describe('RepositoryCacheService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('caching functionality', () => {
    it('should cache and retrieve repositories', () => {
      const testRepos = [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'user/test-repo',
          smart_guidelines_compatible: true
        }
      ];

      // Cache repositories
      const success = repositoryCacheService.setCachedRepositories('testuser', 'user', testRepos);
      expect(success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Debug: Check what was actually stored
      const cacheKey = repositoryCacheService.getCacheKey('testuser', 'user');
      const storedValue = localStorage.getItem(cacheKey);
      console.log('Stored value:', storedValue);

      // Retrieve cached repositories
      const cached = repositoryCacheService.getCachedRepositories('testuser', 'user');
      expect(cached).not.toBeNull();
      expect(cached.repositories).toEqual(testRepos);
      expect(cached.owner).toBe('testuser');
      expect(cached.type).toBe('user');
    });

    it('should return null for non-existent cache', () => {
      const cached = repositoryCacheService.getCachedRepositories('nonexistent', 'user');
      expect(cached).toBeNull();
    });

    it('should handle different cache keys for users and orgs', () => {
      const userRepos = [{ id: 1, name: 'user-repo' }];
      const orgRepos = [{ id: 2, name: 'org-repo' }];

      repositoryCacheService.setCachedRepositories('testuser', 'user', userRepos);
      repositoryCacheService.setCachedRepositories('testuser', 'org', orgRepos);

      const userCached = repositoryCacheService.getCachedRepositories('testuser', 'user');
      const orgCached = repositoryCacheService.getCachedRepositories('testuser', 'org');

      expect(userCached.repositories).toEqual(userRepos);
      expect(orgCached.repositories).toEqual(orgRepos);
    });
  });

  describe('cache expiry', () => {
    it('should detect stale cache (older than 24 hours)', () => {
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      const recentTimestamp = Date.now() - (1 * 60 * 60 * 1000); // 1 hour ago

      expect(repositoryCacheService.isStale(oldTimestamp)).toBe(true);
      expect(repositoryCacheService.isStale(recentTimestamp)).toBe(false);
    });

    it('should return null and remove stale cache', () => {
      const testRepos = [{ id: 1, name: 'test-repo' }];
      const staleTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago

      // Manually set stale cache
      const cacheKey = repositoryCacheService.getCacheKey('testuser', 'user');
      const staleData = {
        repositories: testRepos,
        timestamp: staleTimestamp,
        owner: 'testuser',
        type: 'user'
      };
      localStorage.setItem(cacheKey, JSON.stringify(staleData));

      // Try to retrieve - should return null and remove stale cache
      const result = repositoryCacheService.getCachedRepositories('testuser', 'user');
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith(cacheKey);
    });
  });

  describe('cache management', () => {
    it('should clear specific cache', () => {
      const testRepos = [{ id: 1, name: 'test-repo' }];
      repositoryCacheService.setCachedRepositories('testuser', 'user', testRepos);

      const success = repositoryCacheService.clearCache('testuser', 'user');
      expect(success).toBe(true);

      const cached = repositoryCacheService.getCachedRepositories('testuser', 'user');
      expect(cached).toBeNull();
    });

    it('should clear all caches', () => {
      repositoryCacheService.setCachedRepositories('user1', 'user', []);
      repositoryCacheService.setCachedRepositories('user2', 'user', []);
      repositoryCacheService.setCachedRepositories('org1', 'org', []);

      const success = repositoryCacheService.clearAllCaches();
      expect(success).toBe(true);

      // All caches should be cleared
      expect(repositoryCacheService.getCachedRepositories('user1', 'user')).toBeNull();
      expect(repositoryCacheService.getCachedRepositories('user2', 'user')).toBeNull();
      expect(repositoryCacheService.getCachedRepositories('org1', 'org')).toBeNull();
    });

    it('should provide cache info for debugging', () => {
      const testRepos = [{ id: 1 }, { id: 2 }];
      repositoryCacheService.setCachedRepositories('testuser', 'user', testRepos);

      const info = repositoryCacheService.getCacheInfo('testuser', 'user');
      expect(info.exists).toBe(true);
      expect(info.stale).toBe(false);
      expect(info.repositoryCount).toBe(2);
      expect(info.ageHours).toBe(0); // Just created
    });

    it('should provide cache info for non-existent cache', () => {
      const info = repositoryCacheService.getCacheInfo('nonexistent', 'user');
      expect(info.exists).toBe(false);
      expect(info.stale).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully when reading', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock localStorage.getItem to throw an error
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      const result = repositoryCacheService.getCachedRepositories('testuser', 'user');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error reading repository cache:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully when writing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock localStorage.setItem to throw an error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      const result = repositoryCacheService.setCachedRepositories('testuser', 'user', []);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error caching repositories:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle malformed JSON in cache', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Set malformed JSON in localStorage
      const cacheKey = repositoryCacheService.getCacheKey('testuser', 'user');
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      const result = repositoryCacheService.getCachedRepositories('testuser', 'user');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});