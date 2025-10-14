/**
 * Bookmark Service - Manages user bookmarks in localStorage
 * 
 * Provides functionality to bookmark pages with context-aware titles:
 * - DAK: {user}/{repo} for DAK pages
 * - DAK: {user}/{repo}/{branch} for DAK pages with specific branch  
 * - {asset} in DAK: {user}/{repo}/{branch} for asset pages
 */

/**
 * Bookmark object structure
 * @example { "id": "bookmark-123", "title": "DAK: who/anc-dak", "url": "/dak/who/anc-dak", "timestamp": 1234567890 }
 */
export interface Bookmark {
  /** Unique bookmark identifier */
  id: string;
  /** Bookmark display title */
  title: string;
  /** Bookmark URL */
  url: string;
  /** Creation timestamp */
  timestamp: number;
  /** Optional page name */
  pageName?: string;
  /** Optional context data */
  context?: BookmarkContext;
}

/**
 * Context information for bookmark generation
 * @example { "user": "who", "repository": "anc-dak", "branch": "main", "asset": "process.bpmn" }
 */
export interface BookmarkContext {
  /** GitHub user or organization */
  user?: string;
  /** Repository name */
  repository?: string;
  /** Branch name */
  branch?: string;
  /** Asset name */
  asset?: string;
  /** Page title */
  title?: string;
  /** Document path */
  path?: string;
}

/**
 * Bookmark service for managing user bookmarks
 */
class BookmarkService {
  private readonly storageKey: string = 'sgex-bookmarks';

  /**
   * Get all bookmarks from localStorage
   * @returns Array of bookmark objects
   * @example
   * const bookmarks = bookmarkService.getBookmarks();
   * // Returns: [{ id: "123", title: "DAK: who/anc-dak", url: "/dak/who/anc-dak", timestamp: 1234567890 }]
   */
  getBookmarks(): Bookmark[] {
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
   * @param bookmarks - Array of bookmark objects
   * @throws Error if localStorage write fails
   */
  saveBookmarks(bookmarks: Bookmark[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks to localStorage:', error);
      throw error;
    }
  }

  /**
   * Generate bookmark title based on page context
   * @param pageName - Name of the page
   * @param context - Page context (user, repo, branch, asset)
   * @returns Generated bookmark title
   * @example
   * const title = bookmarkService.generateBookmarkTitle("Business Process", { user: "who", repository: "anc-dak", branch: "main" });
   * // Returns: "Business Process in DAK: who/anc-dak/main"
   */
  generateBookmarkTitle(pageName: string, context: BookmarkContext): string {
    const { user, repository, branch, asset, title, path } = context;

    // Documentation pages: use document title with path if available
    if (pageName === 'Documentation' && title) {
      return path ? `${title} (${path})` : title;
    }

    // Asset pages: include asset name
    if (asset) {
      if (branch) {
        return `${asset} in DAK: ${user}/${repository}/${branch}`;
      }
      return `${asset} in DAK: ${user}/${repository}`;
    }

    // DAK pages with branch
    if (branch && user && repository) {
      return `${pageName} in DAK: ${user}/${repository}/${branch}`;
    }

    // DAK pages without branch
    if (user && repository) {
      return `${pageName} in DAK: ${user}/${repository}`;
    }

    // Generic pages
    return pageName;
  }

  /**
   * Add a new bookmark
   * @param url - Page URL to bookmark
   * @param pageName - Name of the page
   * @param context - Page context for title generation
   * @returns The created bookmark
   * @example
   * const bookmark = bookmarkService.addBookmark("/dak/who/anc-dak", "DAK Dashboard", { user: "who", repository: "anc-dak" });
   */
  addBookmark(url: string, pageName: string, context: BookmarkContext = {}): Bookmark {
    const bookmarks = this.getBookmarks();
    
    // Check if bookmark already exists
    const existingBookmark = bookmarks.find(b => b.url === url);
    if (existingBookmark) {
      return existingBookmark;
    }

    // Create new bookmark
    const title = this.generateBookmarkTitle(pageName, context);
    const bookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      title,
      url,
      timestamp: Date.now(),
      pageName,
      context
    };

    bookmarks.push(bookmark);
    this.saveBookmarks(bookmarks);
    
    return bookmark;
  }

  /**
   * Remove a bookmark by ID
   * @param bookmarkId - ID of the bookmark to remove
   * @returns true if bookmark was removed, false otherwise
   */
  removeBookmark(bookmarkId: string): boolean {
    const bookmarks = this.getBookmarks();
    const initialLength = bookmarks.length;
    const filtered = bookmarks.filter(b => b.id !== bookmarkId);
    
    if (filtered.length < initialLength) {
      this.saveBookmarks(filtered);
      return true;
    }
    
    return false;
  }

  /**
   * Check if a URL is bookmarked
   * @param url - URL to check
   * @returns true if bookmarked, false otherwise
   */
  isBookmarked(url: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.url === url);
  }

  /**
   * Clear all bookmarks
   */
  clearAllBookmarks(): void {
    this.saveBookmarks([]);
  }

  /**
   * Get bookmark by URL
   * @param url - URL to find
   * @returns Bookmark if found, undefined otherwise
   */
  getBookmarkByUrl(url: string): Bookmark | undefined {
    const bookmarks = this.getBookmarks();
    return bookmarks.find(b => b.url === url);
  }
}

// Export singleton instance
const bookmarkService = new BookmarkService();
export default bookmarkService;
