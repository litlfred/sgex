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
   * @param {Object} bookmark - Bookmark object with title, url, pageType, and optional data
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
        pageType: bookmark.pageType || 'Other',
        url: bookmark.url,
        timestamp: new Date().toISOString(),
        data: bookmark.data || {} // Store additional data separately
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
   * Generate a bookmark object from the page framework context
   * @param {Object} frameworkContext - Framework context from usePage hook
   * @returns {Object} Bookmark object
   */
  createBookmarkFromFramework(frameworkContext) {
    const { type, pageName, profile, repository, branch, location } = frameworkContext;
    const { pathname, search } = location;
    
    // Use framework context to generate title and page type
    let title = 'SGEX Page';
    let pageType = 'Other';
    
    // Map framework page types to bookmark page types
    if (type === 'dak' || type === 'asset') {
      // For DAK and Asset pages, determine specific page type from pageName
      switch (pageName) {
        case 'dashboard':
          pageType = 'Dashboard';
          break;
        case 'core-data-dictionary-viewer':
          pageType = 'Core Data Dictionary';
          break;
        case 'business-process-selection':
          pageType = 'Business Process Selection';
          break;
        case 'decision-support-logic':
          pageType = 'Decision Support Logic';
          break;
        case 'component-editor':
        case 'editor':
          pageType = 'Component Editor';
          break;
        case 'bpmn-editor':
          pageType = 'BPMN Editor';
          break;
        case 'bpmn-viewer':
          pageType = 'BPMN Viewer';
          break;
        case 'pages':
          pageType = 'Pages Manager';
          break;
        default:
          pageType = 'DAK Component';
      }
      
      // Generate title based on repository and branch
      if (repository && profile) {
        const fullName = repository.full_name || `${profile.login}/${repository.name}`;
        
        if (type === 'asset') {
          // For asset pages, try to extract asset name from pathname
          const pathParts = pathname.split('/').filter(Boolean);
          const assetName = pathParts[pathParts.length - 1] || 'Asset';
          
          if (branch && branch !== 'main') {
            title = `${assetName} in DAK: ${fullName}/${branch}`;
          } else {
            title = `${assetName} in DAK: ${fullName}`;
          }
        } else {
          // For DAK pages
          if (branch && branch !== 'main') {
            title = `DAK: ${fullName}/${branch}`;
          } else {
            title = `DAK: ${fullName}`;
          }
        }
      }
    } else if (type === 'user') {
      pageType = 'User Profile';
      if (profile) {
        title = `User: ${profile.login}`;
      }
    } else if (type === 'top-level') {
      switch (pageName) {
        case 'documentation':
          pageType = 'Documentation';
          const docId = pathname.split('/docs/')[1] || 'Overview';
          title = `Documentation - ${docId}`;
          break;
        case 'landing':
          pageType = 'Landing Page';
          title = 'SGEX Workbench';
          break;
        default:
          pageType = 'Other';
          title = `SGEX - ${pageName}`;
      }
    }

    return {
      title,
      pageType,
      url: pathname + (search || ''),
      data: {
        profile: profile ? { login: profile.login, avatar_url: profile.avatar_url } : null,
        repository: repository ? { 
          name: repository.name, 
          full_name: repository.full_name || `${profile?.login}/${repository.name}` 
        } : null,
        selectedBranch: branch,
        user: profile?.login,
        repo: repository?.name,
        branch: branch,
        type: type,
        pageName: pageName
      }
    };
  }

  /**
   * Generate a bookmark object for the current page (legacy method)
   * @param {Object} params - Page parameters
   * @returns {Object} Bookmark object
   */
  createBookmark(params) {
    const { pathname, search, state } = params.location || {};
    const { profile, repository, selectedBranch } = state || {};
    
    // Extract user/repo info from URL params if not in state
    const urlParts = pathname.split('/').filter(Boolean);
    let user, repo, branch;
    
    // Try to extract from URL patterns like /dashboard/user/repo/branch
    if (urlParts.length >= 3 && ['dashboard', 'core-data-dictionary-viewer', 'business-process-selection', 'decision-support-logic'].includes(urlParts[0])) {
      user = urlParts[1];
      repo = urlParts[2];
      branch = urlParts[3];
    }
    
    // Use state data if available, otherwise fall back to URL params
    const contextUser = repository?.owner?.login || repository?.full_name?.split('/')[0] || user;
    const contextRepo = repository?.name || repo;
    const contextBranch = selectedBranch || branch || 'main';
    const fullName = repository?.full_name || (contextUser && contextRepo ? `${contextUser}/${contextRepo}` : null);
    
    // Generate title and page type based on current route and context
    let title = 'SGEX Page';
    let pageType = 'Other';
    
    if (pathname) {
      if (pathname.includes('/dashboard')) {
        pageType = 'Dashboard';
        if (fullName) {
          if (contextBranch && contextBranch !== 'main') {
            title = `DAK: ${fullName}/${contextBranch}`;
          } else {
            title = `DAK: ${fullName}`;
          }
        } else {
          title = 'DAK Dashboard';
        }
      } else if (pathname.includes('/core-data-dictionary-viewer')) {
        pageType = 'Core Data Dictionary';
        if (fullName) {
          if (contextBranch && contextBranch !== 'main') {
            title = `DAK: ${fullName}/${contextBranch}`;
          } else {
            title = `DAK: ${fullName}`;
          }
        } else {
          title = 'Core Data Dictionary';
        }
      } else if (pathname.includes('/business-process-selection')) {
        pageType = 'Business Process Selection';
        if (fullName) {
          if (contextBranch && contextBranch !== 'main') {
            title = `DAK: ${fullName}/${contextBranch}`;
          } else {
            title = `DAK: ${fullName}`;
          }
        } else {
          title = 'Business Process Selection';
        }
      } else if (pathname.includes('/decision-support-logic')) {
        pageType = 'Decision Support Logic';
        if (fullName) {
          if (contextBranch && contextBranch !== 'main') {
            title = `DAK: ${fullName}/${contextBranch}`;
          } else {
            title = `DAK: ${fullName}`;
          }
        } else {
          title = 'Decision Support Logic';
        }
      } else if (pathname.includes('/editor/')) {
        pageType = 'Component Editor';
        const componentId = pathname.split('/editor/')[1];
        if (fullName && componentId) {
          if (contextBranch && contextBranch !== 'main') {
            title = `${componentId} in DAK: ${fullName}/${contextBranch}`;
          } else {
            title = `${componentId} in DAK: ${fullName}`;
          }
        } else {
          title = `Editor - ${componentId || 'component'}`;
        }
      } else if (pathname.includes('/bpmn-editor')) {
        pageType = 'BPMN Editor';
        // Try to extract BPMN file name from search params or other context
        const searchParams = new URLSearchParams(search || '');
        const bpmnFile = searchParams.get('file') || searchParams.get('asset') || 'BPMN Diagram';
        if (fullName) {
          if (contextBranch && contextBranch !== 'main') {
            title = `${bpmnFile} in DAK: ${fullName}/${contextBranch}`;
          } else {
            title = `${bpmnFile} in DAK: ${fullName}`;
          }
        } else {
          title = 'BPMN Editor';
        }
      } else if (pathname.includes('/bpmn-viewer')) {
        pageType = 'BPMN Viewer';
        const searchParams = new URLSearchParams(search || '');
        const bpmnFile = searchParams.get('file') || searchParams.get('asset') || 'BPMN Diagram';
        if (fullName) {
          if (contextBranch && contextBranch !== 'main') {
            title = `${bpmnFile} in DAK: ${fullName}/${contextBranch}`;
          } else {
            title = `${bpmnFile} in DAK: ${fullName}`;
          }
        } else {
          title = 'BPMN Viewer';
        }
      } else if (pathname.includes('/docs/')) {
        pageType = 'Documentation';
        const docId = pathname.split('/docs/')[1];
        title = `Documentation - ${docId}`;
      } else if (pathname.includes('/pages')) {
        pageType = 'Pages Manager';
        if (fullName) {
          if (contextBranch && contextBranch !== 'main') {
            title = `DAK: ${fullName}/${contextBranch}`;
          } else {
            title = `DAK: ${fullName}`;
          }
        } else {
          title = 'Pages Manager';
        }
      }
    }

    return {
      title,
      pageType,
      url: pathname + (search || ''),
      data: {
        profile: profile ? { login: profile.login, avatar_url: profile.avatar_url } : null,
        repository: repository ? { name: repository.name, full_name: repository.full_name } : null,
        selectedBranch: contextBranch,
        user: contextUser,
        repo: contextRepo,
        branch: contextBranch
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