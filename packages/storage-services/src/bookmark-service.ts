/**
 * Bookmark Service - Manages user bookmarks with DAK-aware functionality
 * 
 * Provides functionality to bookmark pages with context-aware titles:
 * - DAK: {user}/{repo} for DAK pages
 * - DAK: {user}/{repo}/{branch} for DAK pages with specific branch  
 * - {asset} in DAK: {user}/{repo}/{branch} for asset pages
 * 
 * Migrated from src/services/bookmarkService.js with DAK integration
 */

import { DAKRepository, DAKComponentType } from './types';

export interface BookmarkContext {
  user?: string;
  repository?: string;
  branch?: string;
  asset?: string;
  title?: string;
  path?: string;
  dakRepository?: DAKRepository;
  componentType?: DAKComponentType;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  context?: BookmarkContext;
  tags?: string[];
}

export interface BookmarkGroup {
  title: string;
  bookmarks: Bookmark[];
}

export class BookmarkService {
  private readonly storageKey = 'sgex-bookmarks';

  /**
   * Get all bookmarks from localStorage
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
   * Generate bookmark title based on page context with DAK awareness
   */
  generateBookmarkTitle(pageName: string, context: BookmarkContext): string {
    const { user, repository, branch, asset, title, path, dakRepository, componentType } = context;

    // Documentation pages: use document title with path if available
    if (pageName === 'Documentation' && title) {
      if (path && path !== '/') {
        return `${title} (${path})`;
      }
      return title;
    }

    // DAK-specific bookmarks
    if (dakRepository) {
      const dakInfo = `DAK: ${dakRepository.owner}/${dakRepository.repo}`;
      
      if (componentType) {
        const componentName = this.getComponentDisplayName(componentType);
        if (branch && branch !== 'main') {
          return `${componentName} in ${dakInfo}/${branch}`;
        }
        return `${componentName} in ${dakInfo}`;
      }
      
      if (asset) {
        if (branch && branch !== 'main') {
          return `${asset} in ${dakInfo}/${branch}`;
        }
        return `${asset} in ${dakInfo}`;
      }
      
      if (branch && branch !== 'main') {
        return `${dakInfo}/${branch}`;
      }
      return dakInfo;
    }

    // Legacy repository bookmarks (fallback)
    if (user && repository) {
      if (asset) {
        if (branch && branch !== 'main') {
          return `${asset} in DAK: ${user}/${repository}/${branch}`;
        }
        return `${asset} in DAK: ${user}/${repository}`;
      }
      
      if (branch && branch !== 'main') {
        return `DAK: ${user}/${repository}/${branch}`;
      }
      return `DAK: ${user}/${repository}`;
    }

    // Generic page title
    return title || pageName || 'Bookmarked Page';
  }

  /**
   * Add a bookmark
   */
  addBookmark(url: string, pageName: string, context: BookmarkContext = {}): Bookmark {
    const bookmarks = this.getBookmarks();
    const title = this.generateBookmarkTitle(pageName, context);
    const id = this.generateBookmarkId(url, context);
    
    // Check if bookmark already exists
    const existingIndex = bookmarks.findIndex(b => b.id === id);
    
    const bookmark: Bookmark = {
      id,
      url,
      title,
      timestamp: Date.now(),
      context,
      tags: this.generateTags(context)
    };
    
    if (existingIndex >= 0) {
      // Update existing bookmark
      bookmarks[existingIndex] = bookmark;
    } else {
      // Add new bookmark
      bookmarks.unshift(bookmark);
    }
    
    this.saveBookmarks(bookmarks);
    return bookmark;
  }

  /**
   * Remove a bookmark
   */
  removeBookmark(id: string): boolean {
    const bookmarks = this.getBookmarks();
    const initialLength = bookmarks.length;
    const filtered = bookmarks.filter(b => b.id !== id);
    
    if (filtered.length !== initialLength) {
      this.saveBookmarks(filtered);
      return true;
    }
    return false;
  }

  /**
   * Check if a URL is bookmarked
   */
  isBookmarked(url: string, context: BookmarkContext = {}): boolean {
    const bookmarks = this.getBookmarks();
    const id = this.generateBookmarkId(url, context);
    return bookmarks.some(b => b.id === id);
  }

  /**
   * Get bookmark by URL and context
   */
  getBookmarkByUrl(url: string, context: BookmarkContext = {}): Bookmark | null {
    const bookmarks = this.getBookmarks();
    const id = this.generateBookmarkId(url, context);
    return bookmarks.find(b => b.id === id) || null;
  }

  /**
   * Get bookmarks grouped by page type
   */
  getBookmarksGroupedByPage(): BookmarkGroup[] {
    const bookmarks = this.getBookmarks();
    const groups: Record<string, Bookmark[]> = {};
    
    for (const bookmark of bookmarks) {
      const groupKey = this.getBookmarkGroupKey(bookmark);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(bookmark);
    }
    
    // Convert to array and sort
    return Object.entries(groups)
      .map(([title, bookmarks]) => ({ title, bookmarks }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Search bookmarks by query
   */
  searchBookmarks(query: string): Bookmark[] {
    const bookmarks = this.getBookmarks();
    const lowerQuery = query.toLowerCase();
    
    return bookmarks.filter(bookmark => 
      bookmark.title.toLowerCase().includes(lowerQuery) ||
      bookmark.url.toLowerCase().includes(lowerQuery) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get bookmarks for a specific DAK repository
   */
  getDAKBookmarks(dakRepository: DAKRepository): Bookmark[] {
    const bookmarks = this.getBookmarks();
    return bookmarks.filter(bookmark => {
      const ctx = bookmark.context;
      return ctx?.dakRepository?.owner === dakRepository.owner &&
             ctx?.dakRepository?.repo === dakRepository.repo;
    });
  }

  /**
   * Clear all bookmarks
   */
  clearAllBookmarks(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Export bookmarks as JSON
   */
  exportBookmarks(): string {
    const bookmarks = this.getBookmarks();
    return JSON.stringify(bookmarks, null, 2);
  }

  /**
   * Import bookmarks from JSON
   */
  importBookmarks(jsonData: string, merge: boolean = false): void {
    try {
      const importedBookmarks: Bookmark[] = JSON.parse(jsonData);
      if (!Array.isArray(importedBookmarks)) {
        throw new Error('Invalid bookmark data format');
      }
      
      let bookmarks = merge ? this.getBookmarks() : [];
      
      for (const imported of importedBookmarks) {
        // Validate bookmark structure
        if (!imported.id || !imported.url || !imported.title) {
          console.warn('Skipping invalid bookmark:', imported);
          continue;
        }
        
        // Avoid duplicates when merging
        if (merge && bookmarks.some(b => b.id === imported.id)) {
          continue;
        }
        
        bookmarks.push(imported);
      }
      
      this.saveBookmarks(bookmarks);
    } catch (error) {
      throw new Error(`Failed to import bookmarks: ${error}`);
    }
  }

  /**
   * Private helper methods
   */

  private generateBookmarkId(url: string, context: BookmarkContext): string {
    const { user, repository, branch, asset, dakRepository } = context;
    
    if (dakRepository) {
      const parts = [dakRepository.owner, dakRepository.repo];
      if (branch) parts.push(branch);
      if (asset) parts.push(asset);
      return `dak_${parts.join('_')}`;
    }
    
    // Legacy format
    if (user && repository) {
      const parts = [user, repository];
      if (branch) parts.push(branch);
      if (asset) parts.push(asset);
      return `legacy_${parts.join('_')}`;
    }
    
    // Fallback to URL-based ID
    return `url_${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  private generateTags(context: BookmarkContext): string[] {
    const tags: string[] = [];
    
    if (context.dakRepository) {
      tags.push('dak');
      tags.push(context.dakRepository.owner);
    }
    
    if (context.componentType) {
      tags.push('component');
      tags.push(context.componentType);
    }
    
    if (context.asset) {
      tags.push('asset');
    }
    
    return tags;
  }

  private getBookmarkGroupKey(bookmark: Bookmark): string {
    const ctx = bookmark.context;
    
    if (ctx?.dakRepository) {
      if (ctx.componentType) {
        return `DAK Components (${ctx.dakRepository.owner}/${ctx.dakRepository.repo})`;
      }
      return `DAK Repository (${ctx.dakRepository.owner}/${ctx.dakRepository.repo})`;
    }
    
    if (ctx?.user && ctx?.repository) {
      return `Legacy DAK (${ctx.user}/${ctx.repository})`;
    }
    
    return 'Other Pages';
  }

  private getComponentDisplayName(componentType: DAKComponentType): string {
    const displayNames: Record<DAKComponentType, string> = {
      [DAKComponentType.HEALTH_INTERVENTIONS]: 'Health Interventions',
      [DAKComponentType.PERSONAS]: 'Personas',
      [DAKComponentType.USER_SCENARIOS]: 'User Scenarios',
      [DAKComponentType.BUSINESS_PROCESSES]: 'Business Processes',
      [DAKComponentType.DATA_ELEMENTS]: 'Data Elements',
      [DAKComponentType.DECISION_LOGIC]: 'Decision Logic',
      [DAKComponentType.INDICATORS]: 'Indicators',
      [DAKComponentType.REQUIREMENTS]: 'Requirements',
      [DAKComponentType.TEST_SCENARIOS]: 'Test Scenarios'
    };
    
    return displayNames[componentType] || componentType;
  }
}

// Export singleton instance
export const bookmarkService = new BookmarkService();