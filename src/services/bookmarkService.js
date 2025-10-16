/**
 * Bookmark Service - Manages user bookmarks in localStorage
 * 
 * Provides functionality to bookmark pages with context-aware titles:
 * - DAK: {user}/{repo} for DAK pages
 * - DAK: {user}/{repo}/{branch} for DAK pages with specific branch  
 * - {asset} in DAK: {user}/{repo}/{branch} for asset pages
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
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error reading bookmarks from localStorage:', error);
      return [];
    }
  }

  /**
   * Save bookmarks to localStorage
   * @param {Array} bookmarks - Array of bookmark objects
   */
  saveBookmarks(bookmarks) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks to localStorage:', error);
      throw error;
    }
  }

  /**
   * Generate bookmark title based on page context
   * @param {string} pageName - Name of the page
   * @param {Object} context - Page context (user, repo, branch, asset)
   * @returns {string} Generated bookmark title
   */
  generateBookmarkTitle(pageName, context) {
    const { user, repository, branch, asset, title, path } = context;

    // Documentation pages: use document title with path if available
    if (pageName === 'documentation' && title) {
      if (path) {
        return `${title} (${path})`;
      }
      return title;
    }

    // Asset pages: {asset} in DAK: {user}/{repo}/{branch}
    if (asset && user && repository) {
      const repoName = repository.name || repository;
      const branchName = branch || 'main';
      return `${asset} in DAK: ${user}/${repoName}/${branchName}`;
    }

    // DAK pages with branch: DAK: {user}/{repo}/{branch}
    if (user && repository && branch) {
      const repoName = repository.name || repository;
      return `DAK: ${user}/${repoName}/${branch}`;
    }

    // DAK pages without specific branch: DAK: {user}/{repo}
    if (user && repository) {
      const repoName = repository.name || repository;
      return `DAK: ${user}/${repoName}`;
    }

    // User pages: {pageName}: {user}
    if (user) {
      return `${pageName}: ${user}`;
    }

    // Top-level pages: just use page name
    return pageName;
  }

  /**
   * Add a bookmark
   * @param {string} pageName - Name of the page
   * @param {string} url - URL of the page
   * @param {Object} context - Page context for generating title
   * @returns {Object} The created bookmark
   */
  addBookmark(pageName, url, context = {}) {
    const bookmarks = this.getBookmarks();
    
    // Check if bookmark already exists
    const existingIndex = bookmarks.findIndex(b => b.url === url);
    if (existingIndex !== -1) {
      // Update existing bookmark
      bookmarks[existingIndex] = {
        ...bookmarks[existingIndex],
        title: this.generateBookmarkTitle(pageName, context),
        pageName,
        context,
        lastUpdated: new Date().toISOString()
      };
    } else {
      // Create new bookmark
      const bookmark = {
        id: Date.now().toString(),
        title: this.generateBookmarkTitle(pageName, context),
        url,
        pageName,
        context,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      bookmarks.push(bookmark);
    }

    this.saveBookmarks(bookmarks);
    return bookmarks[existingIndex] || bookmarks[bookmarks.length - 1];
  }

  /**
   * Remove a bookmark by ID
   * @param {string} bookmarkId - ID of the bookmark to remove
   * @returns {boolean} Success status
   */
  removeBookmark(bookmarkId) {
    try {
      const bookmarks = this.getBookmarks();
      const filteredBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
      
      if (filteredBookmarks.length !== bookmarks.length) {
        this.saveBookmarks(filteredBookmarks);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }

  /**
   * Check if current page is bookmarked
   * @param {string} url - URL to check
   * @returns {boolean} Whether the page is bookmarked
   */
  isBookmarked(url) {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.url === url);
  }

  /**
   * Get bookmark for a specific URL
   * @param {string} url - URL to find
   * @returns {Object|null} Bookmark object or null if not found
   */
  getBookmarkByUrl(url) {
    const bookmarks = this.getBookmarks();
    return bookmarks.find(b => b.url === url) || null;
  }

  /**
   * Get bookmarks organized by page name (alphabetically)
   * @returns {Object} Bookmarks grouped by page name
   */
  getBookmarksGroupedByPage() {
    const bookmarks = this.getBookmarks();
    const grouped = {};

    bookmarks.forEach(bookmark => {
      const pageName = bookmark.pageName || 'Other';
      if (!grouped[pageName]) {
        grouped[pageName] = [];
      }
      grouped[pageName].push(bookmark);
    });

    // Sort each group by title
    Object.keys(grouped).forEach(pageName => {
      grouped[pageName].sort((a, b) => a.title.localeCompare(b.title));
    });

    // Return as sorted array of objects
    const sortedPages = Object.keys(grouped).sort();
    return sortedPages.map(pageName => ({
      pageName,
      bookmarks: grouped[pageName]
    }));
  }

  /**
   * Clear all bookmarks
   */
  clearBookmarks() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
    }
  }

  /**
   * Export bookmarks as JSON
   * @returns {string} JSON string of bookmarks
   */
  exportBookmarks() {
    const bookmarks = this.getBookmarks();
    return JSON.stringify(bookmarks, null, 2);
  }

  /**
   * Import bookmarks from JSON
   * @param {string} jsonString - JSON string of bookmarks
   * @param {boolean} merge - Whether to merge with existing bookmarks
   * @returns {boolean} Success status
   */
  importBookmarks(jsonString, merge = false) {
    try {
      const importedBookmarks = JSON.parse(jsonString);
      
      if (!Array.isArray(importedBookmarks)) {
        throw new Error('Invalid bookmark format');
      }

      if (merge) {
        const existingBookmarks = this.getBookmarks();
        const mergedBookmarks = [...existingBookmarks];
        
        importedBookmarks.forEach(imported => {
          const existingIndex = mergedBookmarks.findIndex(b => b.url === imported.url);
          if (existingIndex !== -1) {
            mergedBookmarks[existingIndex] = imported;
          } else {
            mergedBookmarks.push(imported);
          }
        });
        
        this.saveBookmarks(mergedBookmarks);
      } else {
        this.saveBookmarks(importedBookmarks);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const bookmarkService = new BookmarkService();
export default bookmarkService;