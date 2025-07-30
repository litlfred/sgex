/**
 * BookmarkService - Manages repository bookmarks in localStorage
 * 
 * This service provides functionality to bookmark repositories for quick access.
 * Bookmarks are stored in localStorage and persist across browser sessions.
 */

class BookmarkService {
  constructor() {
    this.STORAGE_KEY = 'sgex-bookmarked-repositories';
  }

  /**
   * Get all bookmarked repositories
   * @returns {Array} Array of bookmarked repository objects
   */
  getBookmarkedRepositories() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      
      const bookmarks = JSON.parse(stored);
      
      // Validate that it's an array
      if (!Array.isArray(bookmarks)) {
        console.warn('Invalid bookmark data format, resetting bookmarks');
        this.clearAllBookmarks();
        return [];
      }
      
      return bookmarks;
    } catch (error) {
      console.error('Error reading bookmarks from localStorage:', error);
      return [];
    }
  }

  /**
   * Check if a repository is bookmarked
   * @param {Object} repository - Repository object with id property
   * @returns {boolean} True if repository is bookmarked
   */
  isBookmarked(repository) {
    if (!repository || !repository.id) {
      return false;
    }
    
    const bookmarks = this.getBookmarkedRepositories();
    return bookmarks.some(bookmark => bookmark.id === repository.id);
  }

  /**
   * Add a repository to bookmarks
   * @param {Object} repository - Repository object to bookmark
   * @returns {boolean} True if successfully added, false if already bookmarked
   */
  addBookmark(repository) {
    if (!repository || !repository.id) {
      console.warn('Invalid repository object for bookmarking');
      return false;
    }

    const bookmarks = this.getBookmarkedRepositories();
    
    // Check if already bookmarked
    if (this.isBookmarked(repository)) {
      return false;
    }

    // Create a clean bookmark object with essential repository data
    const bookmark = {
      id: repository.id,
      name: repository.name,
      full_name: repository.full_name,
      description: repository.description,
      html_url: repository.html_url,
      topics: repository.topics || [],
      language: repository.language,
      stargazers_count: repository.stargazers_count || 0,
      forks_count: repository.forks_count || 0,
      updated_at: repository.updated_at,
      private: repository.private,
      smart_guidelines_compatible: repository.smart_guidelines_compatible,
      is_template: repository.is_template,
      template_config: repository.template_config,
      bookmarked_at: new Date().toISOString()
    };

    bookmarks.push(bookmark);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookmarks));
      return true;
    } catch (error) {
      console.error('Error saving bookmark to localStorage:', error);
      return false;
    }
  }

  /**
   * Remove a repository from bookmarks
   * @param {Object} repository - Repository object to remove from bookmarks
   * @returns {boolean} True if successfully removed, false if not bookmarked
   */
  removeBookmark(repository) {
    if (!repository || !repository.id) {
      console.warn('Invalid repository object for removing bookmark');
      return false;
    }

    const bookmarks = this.getBookmarkedRepositories();
    const initialLength = bookmarks.length;
    
    const filteredBookmarks = bookmarks.filter(bookmark => bookmark.id !== repository.id);
    
    // If no change, repository wasn't bookmarked
    if (filteredBookmarks.length === initialLength) {
      return false;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredBookmarks));
      return true;
    } catch (error) {
      console.error('Error removing bookmark from localStorage:', error);
      return false;
    }
  }

  /**
   * Toggle bookmark status for a repository
   * @param {Object} repository - Repository object to toggle
   * @returns {boolean} True if now bookmarked, false if now unbookmarked
   */
  toggleBookmark(repository) {
    if (this.isBookmarked(repository)) {
      this.removeBookmark(repository);
      return false;
    } else {
      this.addBookmark(repository);
      return true;
    }
  }

  /**
   * Get count of bookmarked repositories
   * @returns {number} Number of bookmarked repositories
   */
  getBookmarkCount() {
    return this.getBookmarkedRepositories().length;
  }

  /**
   * Clear all bookmarks
   * @returns {boolean} True if successfully cleared
   */
  clearAllBookmarks() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing bookmarks from localStorage:', error);
      return false;
    }
  }

  /**
   * Get bookmarks for a specific user/organization
   * @param {string} owner - User or organization name
   * @returns {Array} Array of bookmarked repositories for the owner
   */
  getBookmarksForOwner(owner) {
    if (!owner) {
      return [];
    }
    
    const bookmarks = this.getBookmarkedRepositories();
    return bookmarks.filter(bookmark => {
      const fullName = bookmark.full_name || '';
      return fullName.toLowerCase().startsWith(owner.toLowerCase() + '/');
    });
  }

  /**
   * Export bookmarks as JSON (for backup/sharing)
   * @returns {string} JSON string of bookmarks
   */
  exportBookmarks() {
    const bookmarks = this.getBookmarkedRepositories();
    return JSON.stringify(bookmarks, null, 2);
  }

  /**
   * Import bookmarks from JSON (for restore/sharing)
   * @param {string} jsonString - JSON string of bookmarks
   * @param {boolean} merge - If true, merge with existing bookmarks; if false, replace
   * @returns {boolean} True if successfully imported
   */
  importBookmarks(jsonString, merge = true) {
    try {
      const importedBookmarks = JSON.parse(jsonString);
      
      if (!Array.isArray(importedBookmarks)) {
        console.error('Invalid bookmark data format for import');
        return false;
      }

      let finalBookmarks;
      if (merge) {
        const existingBookmarks = this.getBookmarkedRepositories();
        const existingIds = new Set(existingBookmarks.map(b => b.id));
        
        // Only add bookmarks that don't already exist
        const newBookmarks = importedBookmarks.filter(b => !existingIds.has(b.id));
        finalBookmarks = [...existingBookmarks, ...newBookmarks];
      } else {
        finalBookmarks = importedBookmarks;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalBookmarks));
      return true;
    } catch (error) {
      console.error('Error importing bookmarks:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const bookmarkService = new BookmarkService();
export default bookmarkService;