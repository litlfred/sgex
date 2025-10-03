"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookmarkService = exports.BookmarkService = void 0;
const types_1 = require("./types");
class BookmarkService {
    constructor() {
        this.storageKey = 'sgex-bookmarks';
    }
    /**
     * Get all bookmarks from localStorage
     */
    getBookmarks() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        }
        catch (error) {
            console.warn('Error reading bookmarks from localStorage:', error);
            return [];
        }
    }
    /**
     * Save bookmarks to localStorage
     */
    saveBookmarks(bookmarks) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
        }
        catch (error) {
            console.error('Error saving bookmarks to localStorage:', error);
            throw error;
        }
    }
    /**
     * Generate bookmark title based on page context with DAK awareness
     */
    generateBookmarkTitle(pageName, context) {
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
    addBookmark(url, pageName, context = {}) {
        const bookmarks = this.getBookmarks();
        const title = this.generateBookmarkTitle(pageName, context);
        const id = this.generateBookmarkId(url, context);
        // Check if bookmark already exists
        const existingIndex = bookmarks.findIndex(b => b.id === id);
        const bookmark = {
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
        }
        else {
            // Add new bookmark
            bookmarks.unshift(bookmark);
        }
        this.saveBookmarks(bookmarks);
        return bookmark;
    }
    /**
     * Remove a bookmark
     */
    removeBookmark(id) {
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
    isBookmarked(url, context = {}) {
        const bookmarks = this.getBookmarks();
        const id = this.generateBookmarkId(url, context);
        return bookmarks.some(b => b.id === id);
    }
    /**
     * Get bookmark by URL and context
     */
    getBookmarkByUrl(url, context = {}) {
        const bookmarks = this.getBookmarks();
        const id = this.generateBookmarkId(url, context);
        return bookmarks.find(b => b.id === id) || null;
    }
    /**
     * Get bookmarks grouped by page type
     */
    getBookmarksGroupedByPage() {
        const bookmarks = this.getBookmarks();
        const groups = {};
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
    searchBookmarks(query) {
        const bookmarks = this.getBookmarks();
        const lowerQuery = query.toLowerCase();
        return bookmarks.filter(bookmark => bookmark.title.toLowerCase().includes(lowerQuery) ||
            bookmark.url.toLowerCase().includes(lowerQuery) ||
            bookmark.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)));
    }
    /**
     * Get bookmarks for a specific DAK repository
     */
    getDAKBookmarks(dakRepository) {
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
    clearAllBookmarks() {
        localStorage.removeItem(this.storageKey);
    }
    /**
     * Export bookmarks as JSON
     */
    exportBookmarks() {
        const bookmarks = this.getBookmarks();
        return JSON.stringify(bookmarks, null, 2);
    }
    /**
     * Import bookmarks from JSON
     */
    importBookmarks(jsonData, merge = false) {
        try {
            const importedBookmarks = JSON.parse(jsonData);
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
        }
        catch (error) {
            throw new Error(`Failed to import bookmarks: ${error}`);
        }
    }
    /**
     * Private helper methods
     */
    generateBookmarkId(url, context) {
        const { user, repository, branch, asset, dakRepository } = context;
        if (dakRepository) {
            const parts = [dakRepository.owner, dakRepository.repo];
            if (branch)
                parts.push(branch);
            if (asset)
                parts.push(asset);
            return `dak_${parts.join('_')}`;
        }
        // Legacy format
        if (user && repository) {
            const parts = [user, repository];
            if (branch)
                parts.push(branch);
            if (asset)
                parts.push(asset);
            return `legacy_${parts.join('_')}`;
        }
        // Fallback to URL-based ID
        return `url_${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
    }
    generateTags(context) {
        const tags = [];
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
    getBookmarkGroupKey(bookmark) {
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
    getComponentDisplayName(componentType) {
        const displayNames = {
            [types_1.DAKComponentType.HEALTH_INTERVENTIONS]: 'Health Interventions',
            [types_1.DAKComponentType.PERSONAS]: 'Personas',
            [types_1.DAKComponentType.USER_SCENARIOS]: 'User Scenarios',
            [types_1.DAKComponentType.BUSINESS_PROCESSES]: 'Business Processes',
            [types_1.DAKComponentType.DATA_ELEMENTS]: 'Data Elements',
            [types_1.DAKComponentType.DECISION_LOGIC]: 'Decision Logic',
            [types_1.DAKComponentType.INDICATORS]: 'Indicators',
            [types_1.DAKComponentType.REQUIREMENTS]: 'Requirements',
            [types_1.DAKComponentType.TEST_SCENARIOS]: 'Test Scenarios'
        };
        return displayNames[componentType] || componentType;
    }
}
exports.BookmarkService = BookmarkService;
// Export singleton instance
exports.bookmarkService = new BookmarkService();
//# sourceMappingURL=bookmark-service.js.map