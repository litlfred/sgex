/**
 * BookmarkService - Manages user bookmarks in localStorage
 */
class BookmarkService {
  constructor() {
    this.storageKey = 'sgex-bookmarks';
  }

  /**
   * Get all bookmarks from localStorage
   * @returns {Array} Array of bookmark objects
   */
  getBookmarks() {
    try {
      const bookmarks = localStorage.getItem(this.storageKey);
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return [];
    }
  }

  /**
   * Save a new bookmark
   * @param {Object} bookmark - Bookmark object with title, url, and optional data
   * @returns {boolean} Success status
   */
  addBookmark(bookmark) {
    try {
      const bookmarks = this.getBookmarks();
      
      // Check if bookmark already exists (by URL)
      const existingIndex = bookmarks.findIndex(b => b.url === bookmark.url);
      
      const newBookmark = {
        id: bookmark.id || Date.now().toString(),
        title: bookmark.title,
        url: bookmark.url,
        timestamp: new Date().toISOString(),
        ...bookmark.data // Additional data like user, repo, branch
      };

      if (existingIndex >= 0) {
        // Update existing bookmark
        bookmarks[existingIndex] = newBookmark;
      } else {
        // Add new bookmark at the beginning
        bookmarks.unshift(newBookmark);
      }

      // Limit to 20 bookmarks to prevent storage bloat
      if (bookmarks.length > 20) {
        bookmarks.splice(20);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
      return true;
    } catch (error) {
      console.error('Error saving bookmark:', error);
      return false;
    }
  }

  /**
   * Remove bookmark by ID
   * @param {string} bookmarkId - ID of bookmark to remove
   * @returns {boolean} Success status
   */
  removeBookmark(bookmarkId) {
    try {
      const bookmarks = this.getBookmarks();
      const filteredBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredBookmarks));
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }

  /**
   * Check if current URL is bookmarked
   * @param {string} url - URL to check
   * @returns {boolean} Whether URL is bookmarked
   */
  isBookmarked(url) {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.url === url);
  }

  /**
   * Generate a bookmark object for the current page
   * @param {Object} params - Page parameters
   * @returns {Object} Bookmark object
   */
  createBookmark(params) {
    const { pathname, search, state } = params.location || {};
    const { profile, repository, selectedBranch } = state || {};
    
    // Generate title based on current route and context
    let title = 'SGEX Page';
    
    if (pathname) {
      if (pathname.includes('/dashboard')) {
        title = repository ? `Dashboard - ${repository.full_name}` : 'DAK Dashboard';
      } else if (pathname.includes('/core-data-dictionary-viewer')) {
        title = repository ? `Data Dictionary - ${repository.full_name}` : 'Core Data Dictionary';
      } else if (pathname.includes('/business-process-selection')) {
        title = repository ? `Business Processes - ${repository.full_name}` : 'Business Process Selection';
      } else if (pathname.includes('/decision-support-logic')) {
        title = repository ? `Decision Logic - ${repository.full_name}` : 'Decision Support Logic';
      } else if (pathname.includes('/docs/')) {
        const docId = pathname.split('/docs/')[1];
        title = `Documentation - ${docId}`;
      } else if (pathname.includes('/editor/')) {
        const componentId = pathname.split('/editor/')[1];
        title = `Editor - ${componentId}`;
      } else if (pathname.includes('/bpmn-editor')) {
        title = 'BPMN Editor';
      } else if (pathname.includes('/bpmn-viewer')) {
        title = 'BPMN Viewer';
      } else if (pathname.includes('/pages')) {
        title = 'Pages Manager';
      }
    }

    // Add branch info if available
    if (selectedBranch && selectedBranch !== 'main') {
      title += ` (${selectedBranch})`;
    }

    return {
      title,
      url: pathname + (search || ''),
      data: {
        profile: profile ? { login: profile.login, avatar_url: profile.avatar_url } : null,
        repository: repository ? { name: repository.name, full_name: repository.full_name } : null,
        selectedBranch
      }
    };
  }

  /**
   * Clear all bookmarks
   * @returns {boolean} Success status
   */
  clearAllBookmarks() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      return false;
    }
  }
}

// Create singleton instance
const bookmarkService = new BookmarkService();

export default bookmarkService;