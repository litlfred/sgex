import bookmarkService from '../services/bookmarkService';

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
    get length() { return Object.keys(store).length; },
    store
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console methods to avoid test noise
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
};

describe('BookmarkService', () => {
  const mockRepository = {
    id: 123,
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    description: 'A test repository',
    html_url: 'https://github.com/testuser/test-repo',
    topics: ['test', 'demo'],
    language: 'JavaScript',
    stargazers_count: 10,
    forks_count: 2,
    updated_at: '2024-01-15T10:00:00Z',
    private: false,
    smart_guidelines_compatible: true
  };

  const mockRepository2 = {
    id: 456,
    name: 'another-repo',
    full_name: 'testuser/another-repo',
    description: 'Another test repository',
    html_url: 'https://github.com/testuser/another-repo',
    topics: ['other'],
    language: 'Python',
    stargazers_count: 5,
    forks_count: 1,
    updated_at: '2024-01-10T10:00:00Z',
    private: true,
    smart_guidelines_compatible: false
  };

  beforeEach(() => {
    // Clear the store directly and reset mocks
    localStorageMock.store = {};
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    
    // Clear console mocks
    console.warn.mockClear();
    console.error.mockClear();
  });

  describe('getBookmarkedRepositories', () => {
    it('should return empty array when no bookmarks exist', () => {
      const bookmarks = bookmarkService.getBookmarkedRepositories();
      expect(bookmarks).toEqual([]);
    });

    it('should return bookmarks from localStorage', () => {
      const testBookmarks = [mockRepository];
      localStorageMock.store['sgex-bookmarked-repositories'] = JSON.stringify(testBookmarks);
      
      const bookmarks = bookmarkService.getBookmarkedRepositories();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].id).toBe(123);
      expect(bookmarks[0].name).toBe('test-repo');
    });

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.store['sgex-bookmarked-repositories'] = 'invalid json';
      
      const bookmarks = bookmarkService.getBookmarkedRepositories();
      expect(bookmarks).toEqual([]);
    });

    it('should handle invalid data format gracefully', () => {
      localStorageMock.store['sgex-bookmarked-repositories'] = JSON.stringify('not an array');
      
      const bookmarks = bookmarkService.getBookmarkedRepositories();
      expect(bookmarks).toEqual([]);
    });
  });

  describe('isBookmarked', () => {
    it('should return false for unbookmarked repository', () => {
      const isBookmarked = bookmarkService.isBookmarked(mockRepository);
      expect(isBookmarked).toBe(false);
    });

    it('should return true for bookmarked repository', () => {
      localStorageMock.store['sgex-bookmarked-repositories'] = JSON.stringify([mockRepository]);
      
      const isBookmarked = bookmarkService.isBookmarked(mockRepository);
      expect(isBookmarked).toBe(true);
    });

    it('should return false for invalid repository', () => {
      expect(bookmarkService.isBookmarked(null)).toBe(false);
      expect(bookmarkService.isBookmarked({})).toBe(false);
      expect(bookmarkService.isBookmarked({ name: 'no-id' })).toBe(false);
    });
  });

  describe('addBookmark', () => {
    it('should add a new bookmark', () => {
      const result = bookmarkService.addBookmark(mockRepository);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sgex-bookmarked-repositories',
        expect.stringContaining('"id":123')
      );
    });

    it('should not add duplicate bookmark', () => {
      // Add bookmark first time
      bookmarkService.addBookmark(mockRepository);
      
      // Try to add again
      const result = bookmarkService.addBookmark(mockRepository);
      expect(result).toBe(false);
    });

    it('should handle invalid repository gracefully', () => {
      expect(bookmarkService.addBookmark(null)).toBe(false);
      expect(bookmarkService.addBookmark({})).toBe(false);
    });

    it('should add bookmarked_at timestamp', () => {
      const beforeTime = new Date().toISOString();
      bookmarkService.addBookmark(mockRepository);
      const afterTime = new Date().toISOString();
      
      const bookmarks = bookmarkService.getBookmarkedRepositories();
      expect(bookmarks[0].bookmarked_at).toBeTruthy();
      expect(bookmarks[0].bookmarked_at).toBeGreaterThanOrEqual(beforeTime);
      expect(bookmarks[0].bookmarked_at).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('removeBookmark', () => {
    it('should remove existing bookmark', () => {
      // Add bookmark first
      bookmarkService.addBookmark(mockRepository);
      expect(bookmarkService.isBookmarked(mockRepository)).toBe(true);
      
      // Remove bookmark
      const result = bookmarkService.removeBookmark(mockRepository);
      expect(result).toBe(true);
      expect(bookmarkService.isBookmarked(mockRepository)).toBe(false);
    });

    it('should return false when trying to remove non-existent bookmark', () => {
      const result = bookmarkService.removeBookmark(mockRepository);
      expect(result).toBe(false);
    });

    it('should handle invalid repository gracefully', () => {
      expect(bookmarkService.removeBookmark(null)).toBe(false);
      expect(bookmarkService.removeBookmark({})).toBe(false);
    });
  });

  describe('toggleBookmark', () => {
    it('should add bookmark when not bookmarked', () => {
      const result = bookmarkService.toggleBookmark(mockRepository);
      
      expect(result).toBe(true);
      expect(bookmarkService.isBookmarked(mockRepository)).toBe(true);
    });

    it('should remove bookmark when bookmarked', () => {
      // Add bookmark first
      bookmarkService.addBookmark(mockRepository);
      
      // Toggle (remove)
      const result = bookmarkService.toggleBookmark(mockRepository);
      
      expect(result).toBe(false);
      expect(bookmarkService.isBookmarked(mockRepository)).toBe(false);
    });
  });

  describe('getBookmarkCount', () => {
    it('should return 0 when no bookmarks exist', () => {
      expect(bookmarkService.getBookmarkCount()).toBe(0);
    });

    it('should return correct count of bookmarks', () => {
      bookmarkService.addBookmark(mockRepository);
      bookmarkService.addBookmark(mockRepository2);
      
      expect(bookmarkService.getBookmarkCount()).toBe(2);
    });
  });

  describe('clearAllBookmarks', () => {
    it('should clear all bookmarks', () => {
      bookmarkService.addBookmark(mockRepository);
      bookmarkService.addBookmark(mockRepository2);
      expect(bookmarkService.getBookmarkCount()).toBe(2);
      
      const result = bookmarkService.clearAllBookmarks();
      
      expect(result).toBe(true);
      expect(bookmarkService.getBookmarkCount()).toBe(0);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sgex-bookmarked-repositories');
    });
  });

  describe('getBookmarksForOwner', () => {
    it('should return bookmarks for specific owner', () => {
      const repo1 = { ...mockRepository, full_name: 'testuser/repo1' };
      const repo2 = { ...mockRepository2, id: 789, full_name: 'otheruser/repo2' };
      
      bookmarkService.addBookmark(repo1);
      bookmarkService.addBookmark(repo2);
      
      const testUserBookmarks = bookmarkService.getBookmarksForOwner('testuser');
      expect(testUserBookmarks).toHaveLength(1);
      expect(testUserBookmarks[0].full_name).toBe('testuser/repo1');
      
      const otherUserBookmarks = bookmarkService.getBookmarksForOwner('otheruser');
      expect(otherUserBookmarks).toHaveLength(1);
      expect(otherUserBookmarks[0].full_name).toBe('otheruser/repo2');
    });

    it('should return empty array for non-existent owner', () => {
      bookmarkService.addBookmark(mockRepository);
      
      const bookmarks = bookmarkService.getBookmarksForOwner('nonexistent');
      expect(bookmarks).toEqual([]);
    });

    it('should handle invalid owner gracefully', () => {
      expect(bookmarkService.getBookmarksForOwner(null)).toEqual([]);
      expect(bookmarkService.getBookmarksForOwner('')).toEqual([]);
    });
  });

  describe('exportBookmarks', () => {
    it('should export bookmarks as JSON string', () => {
      bookmarkService.addBookmark(mockRepository);
      
      const exported = bookmarkService.exportBookmarks();
      const parsed = JSON.parse(exported);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(123);
    });
  });

  describe('importBookmarks', () => {
    it('should import bookmarks from JSON string', () => {
      const bookmarksToImport = [mockRepository, mockRepository2];
      const jsonString = JSON.stringify(bookmarksToImport);
      
      const result = bookmarkService.importBookmarks(jsonString, false);
      
      expect(result).toBe(true);
      expect(bookmarkService.getBookmarkCount()).toBe(2);
    });

    it('should merge bookmarks when merge=true', () => {
      // Add existing bookmark
      bookmarkService.addBookmark(mockRepository);
      expect(bookmarkService.getBookmarkCount()).toBe(1);
      
      // Import another bookmark
      const bookmarksToImport = [mockRepository2];
      const jsonString = JSON.stringify(bookmarksToImport);
      
      const result = bookmarkService.importBookmarks(jsonString, true);
      
      expect(result).toBe(true);
      expect(bookmarkService.getBookmarkCount()).toBe(2);
    });

    it('should not import duplicate bookmarks when merging', () => {
      // Add existing bookmark
      bookmarkService.addBookmark(mockRepository);
      expect(bookmarkService.getBookmarkCount()).toBe(1);
      
      // Try to import same bookmark
      const bookmarksToImport = [mockRepository];
      const jsonString = JSON.stringify(bookmarksToImport);
      
      const result = bookmarkService.importBookmarks(jsonString, true);
      
      expect(result).toBe(true);
      expect(bookmarkService.getBookmarkCount()).toBe(1); // Should still be 1
    });

    it('should handle invalid JSON gracefully', () => {
      const result = bookmarkService.importBookmarks('invalid json');
      expect(result).toBe(false);
    });

    it('should handle invalid data format gracefully', () => {
      const result = bookmarkService.importBookmarks('"not an array"');
      expect(result).toBe(false);
    });
  });
});