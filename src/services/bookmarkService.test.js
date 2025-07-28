import bookmarkService from '../services/bookmarkService';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => {
    localStorageMock.store[key] = value.toString();
  }),
  removeItem: jest.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  })
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('BookmarkService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  test('should get empty bookmarks initially', () => {
    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toEqual([]);
  });

  test('should add a bookmark', () => {
    const bookmark = {
      title: 'Test Page',
      url: '/dashboard/user/repo',
      data: { user: 'testuser', repo: 'testrepo' }
    };

    const result = bookmarkService.addBookmark(bookmark);
    expect(result).toBe(true);

    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].title).toBe('Test Page');
    expect(bookmarks[0].url).toBe('/dashboard/user/repo');
    expect(bookmarks[0].id).toBeDefined();
    expect(bookmarks[0].timestamp).toBeDefined();
  });

  test('should update existing bookmark with same URL', () => {
    const bookmark1 = {
      title: 'Test Page',
      url: '/dashboard/user/repo',
      data: { user: 'testuser' }
    };

    const bookmark2 = {
      title: 'Updated Test Page',
      url: '/dashboard/user/repo',
      data: { user: 'testuser', repo: 'testrepo' }
    };

    bookmarkService.addBookmark(bookmark1);
    bookmarkService.addBookmark(bookmark2);

    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].title).toBe('Updated Test Page');
    expect(bookmarks[0].data.repo).toBe('testrepo');
  });

  test('should remove a bookmark', () => {
    const bookmark = {
      title: 'Test Page',
      url: '/dashboard/user/repo'
    };

    bookmarkService.addBookmark(bookmark);
    const bookmarks = bookmarkService.getBookmarks();
    const bookmarkId = bookmarks[0].id;

    const result = bookmarkService.removeBookmark(bookmarkId);
    expect(result).toBe(true);

    const remainingBookmarks = bookmarkService.getBookmarks();
    expect(remainingBookmarks).toHaveLength(0);
  });

  test('should check if URL is bookmarked', () => {
    const bookmark = {
      title: 'Test Page',
      url: '/dashboard/user/repo'
    };

    expect(bookmarkService.isBookmarked('/dashboard/user/repo')).toBe(false);

    bookmarkService.addBookmark(bookmark);
    expect(bookmarkService.isBookmarked('/dashboard/user/repo')).toBe(true);
    expect(bookmarkService.isBookmarked('/other/page')).toBe(false);
  });

  test('should create bookmark from location', () => {
    const mockLocation = {
      pathname: '/dashboard/user/repo',
      search: '?branch=main',
      state: {
        profile: { login: 'testuser', avatar_url: 'avatar.jpg' },
        repository: { name: 'testrepo', full_name: 'user/testrepo' },
        selectedBranch: 'main'
      }
    };

    const bookmark = bookmarkService.createBookmark({ location: mockLocation });
    
    expect(bookmark.title).toBe('Dashboard - user/testrepo (main)');
    expect(bookmark.url).toBe('/dashboard/user/repo?branch=main');
    expect(bookmark.data.profile.login).toBe('testuser');
    expect(bookmark.data.repository.name).toBe('testrepo');
    expect(bookmark.data.selectedBranch).toBe('main');
  });

  test('should limit bookmarks to 20', () => {
    // Add 25 bookmarks
    for (let i = 0; i < 25; i++) {
      bookmarkService.addBookmark({
        title: `Test Page ${i}`,
        url: `/page${i}`
      });
    }

    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toHaveLength(20);
    // Most recent should be first
    expect(bookmarks[0].title).toBe('Test Page 24');
  });

  test('should clear all bookmarks', () => {
    bookmarkService.addBookmark({ title: 'Test Page', url: '/test' });
    expect(bookmarkService.getBookmarks()).toHaveLength(1);

    const result = bookmarkService.clearAllBookmarks();
    expect(result).toBe(true);
    expect(bookmarkService.getBookmarks()).toHaveLength(0);
  });

  test('should handle localStorage errors gracefully', () => {
    // Mock localStorage to throw error
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toEqual([]);
  });
});