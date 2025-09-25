/**
 * Tests for @sgex/storage-services package
 */

import { BookmarkService, CacheManagementService, RepositoryCacheService } from '../index';

// Mock localStorage and sessionStorage
const mockStorage = {
  data: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockStorage.data[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage.data[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage.data[key];
  }),
  clear: jest.fn(() => {
    mockStorage.data = {};
  }),
  key: jest.fn((index: number) => Object.keys(mockStorage.data)[index] || null),
  get length() {
    return Object.keys(mockStorage.data).length;
  }
};

Object.defineProperty(window, 'localStorage', { value: mockStorage });
Object.defineProperty(window, 'sessionStorage', { value: mockStorage });

describe('@sgex/storage-services', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
  });

  describe('BookmarkService', () => {
    let bookmarkService: BookmarkService;

    beforeEach(() => {
      bookmarkService = new BookmarkService();
    });

    test('should manage bookmarks', () => {
      const bookmarks = bookmarkService.getBookmarks();
      expect(bookmarks).toEqual([]);
      expect(mockStorage.getItem).toHaveBeenCalledWith('sgex-bookmarks');
    });

    test('should add basic bookmark', () => {
      const bookmark = bookmarkService.addBookmark(
        '/test',
        'Test Page',
        { user: 'testuser', repository: 'testrepo' }
      );

      expect(bookmark.title).toContain('testuser/testrepo');
      expect(bookmark.url).toBe('/test');
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    test('should generate context-aware titles', () => {
      const context = {
        user: 'WHO',
        repository: 'smart-base'
      };

      const title = bookmarkService.generateBookmarkTitle('Test Page', context);
      expect(title).toBe('DAK: WHO/smart-base');
    });

    test('should search bookmarks', () => {
      bookmarkService.addBookmark('/test1', 'Test Page 1', {});
      bookmarkService.addBookmark('/test2', 'WHO Guidelines', { user: 'WHO', repository: 'smart-base' });

      const results = bookmarkService.searchBookmarks('WHO');
      expect(results.length).toBe(1);
      expect(results[0].title).toContain('WHO');
    });

    test('should remove bookmarks', () => {
      const bookmark = bookmarkService.addBookmark('/test', 'Test', {});
      const removed = bookmarkService.removeBookmark(bookmark.id);
      
      expect(removed).toBe(true);
      expect(bookmarkService.getBookmarks()).toHaveLength(0);
    });

    test('should check if bookmarked', () => {
      const context = { user: 'test', repository: 'repo' };
      
      expect(bookmarkService.isBookmarked('/test', context)).toBe(false);
      
      bookmarkService.addBookmark('/test', 'Test', context);
      
      expect(bookmarkService.isBookmarked('/test', context)).toBe(true);
    });
  });

  describe('CacheManagementService', () => {
    let cacheService: CacheManagementService;

    beforeEach(() => {
      cacheService = new CacheManagementService();
    });

    test('should get cache info', () => {
      mockStorage.setItem('sgex_repo_cache_test', 'test data');
      mockStorage.setItem('sgex-bookmarks', '[]');
      
      const info = cacheService.getCacheInfo();
      
      expect(info.localStorage.keys.length).toBeGreaterThan(0);
      expect(info.localStorage.dakKeys.length).toBeGreaterThan(0);
    });

    test('should clear all cache', () => {
      mockStorage.setItem('sgex_repo_cache_test', 'test data');
      mockStorage.setItem('sgex-bookmarks', '[]');
      mockStorage.setItem('other_data', 'should remain');
      
      cacheService.clearAllCache();
      
      expect(mockStorage.removeItem).toHaveBeenCalledWith('sgex_repo_cache_test');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('sgex-bookmarks');
      expect(mockStorage.data['other_data']).toBe('should remain');
    });

    test('should get DAK cache stats', () => {
      mockStorage.setItem('sgex_staging_ground_WHO_smart-base_main', '{"files":{}}');
      mockStorage.setItem('sgex-bookmarks', '[{"id":"test","url":"/test","title":"Test"}]');
      
      const stats = cacheService.getDAKCacheStats();
      
      expect(stats.stagingGrounds).toBe(1);
      expect(stats.bookmarks).toBe(1);
    });

    test('should clear expired cache', () => {
      // Add expired cache entry
      const expiredData = {
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours old
        repositories: []
      };
      mockStorage.setItem('sgex_repo_cache_expired', JSON.stringify(expiredData));
      
      cacheService.clearExpiredCache();
      
      expect(mockStorage.removeItem).toHaveBeenCalledWith('sgex_repo_cache_expired');
    });
  });

  describe('RepositoryCacheService', () => {
    let repoCache: RepositoryCacheService;

    beforeEach(() => {
      repoCache = new RepositoryCacheService();
    });

    test('should cache and retrieve repositories', () => {
      const repos = [
        {
          id: 1,
          name: 'smart-base',
          full_name: 'WHO/smart-base',
          owner: { login: 'WHO', type: 'Organization' },
          private: false,
          html_url: 'https://github.com/WHO/smart-base',
          description: 'WHO SMART Guidelines Base',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          pushed_at: '2023-01-01T00:00:00Z',
          clone_url: 'https://github.com/WHO/smart-base.git',
          default_branch: 'main',
          isDak: true
        }
      ];

      repoCache.setCachedRepositories('WHO', repos, 'org');
      const cached = repoCache.getCachedRepositories('WHO', 'org');
      
      expect(cached).toEqual(repos);
      expect(cached![0].isDak).toBe(true);
    });

    test('should handle cache expiry', () => {
      const repos = [{} as any];
      
      // Cache with old timestamp
      const cacheKey = repoCache.getCacheKey('WHO', 'org');
      const oldData = {
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours old
        repositories: repos
      };
      mockStorage.setItem(cacheKey, JSON.stringify(oldData));
      
      const cached = repoCache.getCachedRepositories('WHO', 'org');
      expect(cached).toBeNull();
      expect(mockStorage.removeItem).toHaveBeenCalledWith(cacheKey);
    });

    test('should get cache statistics', () => {
      repoCache.setCachedRepositories('WHO', [{ isDak: true } as any], 'org');
      repoCache.setCachedRepositories('user1', [{ isDak: false } as any], 'user');
      
      const stats = repoCache.getCacheStatistics();
      
      expect(stats.totalCaches).toBeGreaterThan(0);
      expect(stats.dakRepositories).toBe(1);
    });

    test('should clear cache for owner', () => {
      repoCache.setCachedRepositories('WHO', [{ isDak: true } as any], 'org');
      repoCache.setCachedRepositories('user1', [{ isDak: false } as any], 'user');
      
      const cleared = repoCache.clearCacheForOwner('WHO');
      expect(cleared).toBe(true);
      
      // WHO cache should be cleared
      expect(repoCache.getCachedRepositories('WHO', 'org')).toBeNull();
      // user1 cache should remain
      expect(repoCache.getCachedRepositories('user1', 'user')).not.toBeNull();
    });

    test('should generate correct cache keys', () => {
      const userKey = repoCache.getCacheKey('testuser', 'user');
      const orgKey = repoCache.getCacheKey('testorg', 'org', 'suffix');
      
      expect(userKey).toBe('sgex_repo_cache_user_testuser');
      expect(orgKey).toBe('sgex_repo_cache_org_testorg_suffix');
    });

    test('should check cache existence', () => {
      expect(repoCache.hasCacheFor('nonexistent')).toBe(false);
      
      repoCache.setCachedRepositories('testuser', []);
      
      expect(repoCache.hasCacheFor('testuser')).toBe(true);
    });
  });
});