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
export declare class BookmarkService {
    private readonly storageKey;
    /**
     * Get all bookmarks from localStorage
     */
    getBookmarks(): Bookmark[];
    /**
     * Save bookmarks to localStorage
     */
    saveBookmarks(bookmarks: Bookmark[]): void;
    /**
     * Generate bookmark title based on page context with DAK awareness
     */
    generateBookmarkTitle(pageName: string, context: BookmarkContext): string;
    /**
     * Add a bookmark
     */
    addBookmark(url: string, pageName: string, context?: BookmarkContext): Bookmark;
    /**
     * Remove a bookmark
     */
    removeBookmark(id: string): boolean;
    /**
     * Check if a URL is bookmarked
     */
    isBookmarked(url: string, context?: BookmarkContext): boolean;
    /**
     * Get bookmark by URL and context
     */
    getBookmarkByUrl(url: string, context?: BookmarkContext): Bookmark | null;
    /**
     * Get bookmarks grouped by page type
     */
    getBookmarksGroupedByPage(): BookmarkGroup[];
    /**
     * Search bookmarks by query
     */
    searchBookmarks(query: string): Bookmark[];
    /**
     * Get bookmarks for a specific DAK repository
     */
    getDAKBookmarks(dakRepository: DAKRepository): Bookmark[];
    /**
     * Clear all bookmarks
     */
    clearAllBookmarks(): void;
    /**
     * Export bookmarks as JSON
     */
    exportBookmarks(): string;
    /**
     * Import bookmarks from JSON
     */
    importBookmarks(jsonData: string, merge?: boolean): void;
    /**
     * Private helper methods
     */
    private generateBookmarkId;
    private generateTags;
    private getBookmarkGroupKey;
    private getComponentDisplayName;
}
export declare const bookmarkService: BookmarkService;
//# sourceMappingURL=bookmark-service.d.ts.map