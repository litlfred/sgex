import bookmarkService from '../services/bookmarkService';

// Mock localStorage
let store = {};

const localStorageMock = {
  getItem: jest.fn((key) => {
    const value = store[key] || null;
    return value;
  }),
  setItem: jest.fn((key, value) => {
    store[key] = value.toString();
  }),
  removeItem: jest.fn((key) => {
    delete store[key];
  }),
  clear: jest.fn(() => {
    Object.keys(store).forEach(key => delete store[key]);
  })
};

// Set up the global localStorage mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('BookmarkService', () => {
  beforeEach(() => {
    // Reset localStorage store by recreating it
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  test('should get empty bookmarks initially', () => {
    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toEqual([]);
  });

  test('should add a bookmark', () => {
    const bookmark = {
      title: 'Test Page',
      pageType: 'Dashboard',
      url: '/dashboard/user/repo',
      data: { user: 'testuser', repo: 'testrepo' }
    };

    const result = bookmarkService.addBookmark(bookmark);
    expect(result).toBe(true);

    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].title).toBe('Test Page');
    expect(bookmarks[0].pageType).toBe('Dashboard');
    expect(bookmarks[0].url).toBe('/dashboard/user/repo');
    expect(bookmarks[0].id).toBeDefined();
    expect(bookmarks[0].timestamp).toBeDefined();
  });

  test('should update existing bookmark with same URL', () => {
    const bookmark1 = {
      title: 'Test Page',
      pageType: 'Dashboard',
      url: '/dashboard/user/repo',
      data: { user: 'testuser' }
    };

    const bookmark2 = {
      title: 'Updated Test Page',
      pageType: 'Dashboard',
      url: '/dashboard/user/repo',
      data: { user: 'testuser', repo: 'testrepo' }
    };

    bookmarkService.addBookmark(bookmark1);
    bookmarkService.addBookmark(bookmark2);

    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0].title).toBe('Updated Test Page');
    expect(bookmarks[0].pageType).toBe('Dashboard');
    expect(bookmarks[0].data.repo).toBe('testrepo');
  });

  test('should remove a bookmark', () => {
    const bookmark = {
      title: 'Test Page',
      pageType: 'Dashboard',
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
      pageType: 'Dashboard',
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
    
    expect(bookmark.title).toBe('DAK: user/testrepo');
    expect(bookmark.pageType).toBe('Dashboard');
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
        pageType: 'Other',
        url: `/page${i}`
      });
    }

    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toHaveLength(20);
    // Most recent should be first
    expect(bookmarks[0].title).toBe('Test Page 24');
  });

  test('should clear all bookmarks', () => {
    bookmarkService.addBookmark({ title: 'Test Page', pageType: 'Other', url: '/test' });
    expect(bookmarkService.getBookmarks()).toHaveLength(1);

    const result = bookmarkService.clearAllBookmarks();
    expect(result).toBe(true);
    expect(bookmarkService.getBookmarks()).toHaveLength(0);
  });

  test('should create bookmark from framework context', () => {
    const mockFrameworkContext = {
      type: 'dak',
      pageName: 'dashboard',
      profile: { login: 'testuser', avatar_url: 'https://example.com/avatar.jpg' },
      repository: { name: 'testrepo', full_name: 'testuser/testrepo' },
      branch: 'main',
      location: { pathname: '/dashboard/testuser/testrepo/main', search: '' }
    };

    const bookmark = bookmarkService.createBookmarkFromFramework(mockFrameworkContext);
    
    expect(bookmark.title).toBe('DAK: testuser/testrepo');
    expect(bookmark.pageType).toBe('Dashboard');
    expect(bookmark.url).toBe('/dashboard/testuser/testrepo/main');
    expect(bookmark.data.profile.login).toBe('testuser');
    expect(bookmark.data.repository.name).toBe('testrepo');
    expect(bookmark.data.branch).toBe('main');
    expect(bookmark.data.type).toBe('dak');
    expect(bookmark.data.pageName).toBe('dashboard');
  });

  test('should create bookmark from framework context with non-main branch', () => {
    const mockFrameworkContext = {
      type: 'dak',
      pageName: 'core-data-dictionary-viewer',
      profile: { login: 'testuser', avatar_url: 'https://example.com/avatar.jpg' },
      repository: { name: 'testrepo', full_name: 'testuser/testrepo' },
      branch: 'feature-branch',
      location: { pathname: '/core-data-dictionary-viewer/testuser/testrepo/feature-branch', search: '' }
    };

    const bookmark = bookmarkService.createBookmarkFromFramework(mockFrameworkContext);
    
    expect(bookmark.title).toBe('DAK: testuser/testrepo/feature-branch');
    expect(bookmark.pageType).toBe('Core Data Dictionary');
    expect(bookmark.url).toBe('/core-data-dictionary-viewer/testuser/testrepo/feature-branch');
  });

  test('should create bookmark for asset page from framework context', () => {
    const mockFrameworkContext = {
      type: 'asset',
      pageName: 'bpmn-editor',
      profile: { login: 'testuser', avatar_url: 'https://example.com/avatar.jpg' },
      repository: { name: 'testrepo', full_name: 'testuser/testrepo' },
      branch: 'main',
      location: { pathname: '/bpmn-editor/testuser/testrepo/main/workflow.bpmn', search: '' }
    };

    const bookmark = bookmarkService.createBookmarkFromFramework(mockFrameworkContext);
    
    expect(bookmark.title).toBe('workflow.bpmn in DAK: testuser/testrepo');
    expect(bookmark.pageType).toBe('BPMN Editor');
    expect(bookmark.url).toBe('/bpmn-editor/testuser/testrepo/main/workflow.bpmn');
  });

  test('should create bookmark for top-level page from framework context', () => {
    const mockFrameworkContext = {
      type: 'top-level',
      pageName: 'documentation',
      profile: null,
      repository: null,
      branch: null,
      location: { pathname: '/docs/overview', search: '' }
    };

    const bookmark = bookmarkService.createBookmarkFromFramework(mockFrameworkContext);
    
    expect(bookmark.title).toBe('Documentation - overview');
    expect(bookmark.pageType).toBe('Documentation');
    expect(bookmark.url).toBe('/docs/overview');
  });
    // Mock localStorage to throw error
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const bookmarks = bookmarkService.getBookmarks();
    expect(bookmarks).toEqual([]);
  });
});