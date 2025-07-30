import bookmarkService from '../services/bookmarkService';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: jest.fn((key) => { delete localStorageMock.store[key]; }),
  clear: jest.fn(() => { localStorageMock.store = {}; })
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('BookmarkService', () => {
  beforeEach(() => {
    localStorageMock.store = {};
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('getBookmarks', () => {
    it('should return empty array when no bookmarks exist', () => {
      const bookmarks = bookmarkService.getBookmarks();
      expect(bookmarks).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('sgex-bookmarks');
    });

    it('should return stored bookmarks', () => {
      const testBookmarks = [
        {
          id: '1',
          title: 'Test Bookmark',
          url: '/test',
          pageName: 'test',
          context: {},
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];
      localStorageMock.store['sgex-bookmarks'] = JSON.stringify(testBookmarks);

      const bookmarks = bookmarkService.getBookmarks();
      expect(bookmarks).toEqual(testBookmarks);
    });

    it('should return empty array on localStorage error', () => {
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });

      const bookmarks = bookmarkService.getBookmarks();
      expect(bookmarks).toEqual([]);
    });
  });

  describe('generateBookmarkTitle', () => {
    it('should generate title for asset pages', () => {
      const context = {
        user: 'testuser',
        repository: { name: 'testrepo' },
        branch: 'main',
        asset: 'test.json'
      };
      const title = bookmarkService.generateBookmarkTitle('editor', context);
      expect(title).toBe('test.json in DAK: testuser/testrepo/main');
    });

    it('should generate title for DAK pages with branch', () => {
      const context = {
        user: 'testuser',
        repository: { name: 'testrepo' },
        branch: 'develop'
      };
      const title = bookmarkService.generateBookmarkTitle('dashboard', context);
      expect(title).toBe('DAK: testuser/testrepo/develop');
    });

    it('should generate title for DAK pages without branch', () => {
      const context = {
        user: 'testuser',
        repository: { name: 'testrepo' }
      };
      const title = bookmarkService.generateBookmarkTitle('dashboard', context);
      expect(title).toBe('DAK: testuser/testrepo');
    });

    it('should generate title for user pages', () => {
      const context = {
        user: 'testuser'
      };
      const title = bookmarkService.generateBookmarkTitle('repositories', context);
      expect(title).toBe('repositories: testuser');
    });

    it('should generate title for top-level pages', () => {
      const context = {};
      const title = bookmarkService.generateBookmarkTitle('documentation', context);
      expect(title).toBe('documentation');
    });
  });

  describe('addBookmark', () => {
    it('should add a new bookmark', () => {
      const context = {
        user: 'testuser',
        repository: { name: 'testrepo' },
        branch: 'main'
      };

      const bookmark = bookmarkService.addBookmark('dashboard', '/dashboard/testuser/testrepo/main', context);

      expect(bookmark).toMatchObject({
        title: 'DAK: testuser/testrepo/main',
        url: '/dashboard/testuser/testrepo/main',
        pageName: 'dashboard',
        context
      });
      expect(bookmark.id).toBeDefined();
      expect(bookmark.createdAt).toBeDefined();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should update existing bookmark with same URL', () => {
      const existingBookmark = {
        id: '1',
        title: 'Old Title',
        url: '/test',
        pageName: 'test',
        context: {},
        createdAt: '2024-01-01T00:00:00.000Z'
      };
      localStorageMock.store['sgex-bookmarks'] = JSON.stringify([existingBookmark]);

      const context = { user: 'testuser' };
      bookmarkService.addBookmark('newpage', '/test', context);

      const bookmarks = bookmarkService.getBookmarks();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].title).toBe('newpage: testuser');
      expect(bookmarks[0].id).toBe('1'); // Same ID
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark by ID', () => {
      const testBookmarks = [
        { id: '1', title: 'Bookmark 1', url: '/test1' },
        { id: '2', title: 'Bookmark 2', url: '/test2' }
      ];
      localStorageMock.store['sgex-bookmarks'] = JSON.stringify(testBookmarks);

      const result = bookmarkService.removeBookmark('1');
      expect(result).toBe(true);

      const bookmarks = bookmarkService.getBookmarks();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].id).toBe('2');
    });

    it('should return false for non-existent bookmark', () => {
      const result = bookmarkService.removeBookmark('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('isBookmarked', () => {
    it('should return true for bookmarked URL', () => {
      const testBookmarks = [
        { id: '1', title: 'Test', url: '/test' }
      ];
      localStorageMock.store['sgex-bookmarks'] = JSON.stringify(testBookmarks);

      expect(bookmarkService.isBookmarked('/test')).toBe(true);
      expect(bookmarkService.isBookmarked('/other')).toBe(false);
    });
  });

  describe('getBookmarksGroupedByPage', () => {
    it('should group bookmarks by page name alphabetically', () => {
      const testBookmarks = [
        { id: '1', title: 'Dashboard B', url: '/dashboard/b', pageName: 'dashboard' },
        { id: '2', title: 'Editor A', url: '/editor/a', pageName: 'editor' },
        { id: '3', title: 'Dashboard A', url: '/dashboard/a', pageName: 'dashboard' }
      ];
      localStorageMock.store['sgex-bookmarks'] = JSON.stringify(testBookmarks);

      const grouped = bookmarkService.getBookmarksGroupedByPage();
      
      expect(grouped).toHaveLength(2);
      expect(grouped[0].pageName).toBe('dashboard');
      expect(grouped[0].bookmarks).toHaveLength(2);
      expect(grouped[0].bookmarks[0].title).toBe('Dashboard A'); // Sorted alphabetically
      expect(grouped[1].pageName).toBe('editor');
    });
  });

  describe('clearBookmarks', () => {
    it('should clear all bookmarks', () => {
      localStorageMock.store['sgex-bookmarks'] = JSON.stringify([{ id: '1' }]);
      
      bookmarkService.clearBookmarks();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('sgex-bookmarks');
    });
  });

  describe('exportBookmarks', () => {
    it('should export bookmarks as JSON string', () => {
      const testBookmarks = [{ id: '1', title: 'Test' }];
      localStorageMock.store['sgex-bookmarks'] = JSON.stringify(testBookmarks);

      const exported = bookmarkService.exportBookmarks();
      expect(JSON.parse(exported)).toEqual(testBookmarks);
    });
  });

  describe('importBookmarks', () => {
    it('should import bookmarks from JSON string', () => {
      const importData = [{ id: '1', title: 'Imported' }];
      const jsonString = JSON.stringify(importData);

      const result = bookmarkService.importBookmarks(jsonString);
      expect(result).toBe(true);

      const bookmarks = bookmarkService.getBookmarks();
      expect(bookmarks).toEqual(importData);
    });

    it('should merge bookmarks when merge is true', () => {
      const existing = [{ id: '1', title: 'Existing', url: '/existing' }];
      localStorageMock.store['sgex-bookmarks'] = JSON.stringify(existing);

      const importData = [
        { id: '1', title: 'Updated', url: '/existing' }, // Should update
        { id: '2', title: 'New', url: '/new' } // Should add
      ];

      const result = bookmarkService.importBookmarks(JSON.stringify(importData), true);
      expect(result).toBe(true);

      const bookmarks = bookmarkService.getBookmarks();
      expect(bookmarks).toHaveLength(2);
      expect(bookmarks.find(b => b.id === '1').title).toBe('Updated');
      expect(bookmarks.find(b => b.id === '2')).toBeDefined();
    });

    it('should return false on invalid JSON', () => {
      const result = bookmarkService.importBookmarks('invalid json');
      expect(result).toBe(false);
    });
  });
});