/**
 * Cache Management Service
 * Centralized service for managing all application cache and local storage
 * including repository cache, branch context, staging ground, and user data
 *
 * Migrated from src/services/cacheManagementService.js with DAK integration
 */
import { DAKRepository } from './types';
export interface CacheInfo {
    localStorage: {
        used: number;
        available: number;
        keys: string[];
        dakKeys: string[];
    };
    sessionStorage: {
        used: number;
        available: number;
        keys: string[];
        dakKeys: string[];
    };
    memoryCaches: {
        [key: string]: {
            size: number;
            keys: string[];
        };
    };
}
export interface UncommittedWork {
    repositories: string[];
    count: number;
    details: {
        [repoKey: string]: {
            files: number;
            lastModified: Date;
        };
    };
}
export declare class CacheManagementService {
    private readonly DAK_CACHE_PREFIXES;
    /**
     * Clear all application caches
     */
    clearAllCache(): void;
    /**
     * Clear all staging grounds (uncommitted work)
     */
    clearAllStagingGrounds(): void;
    /**
     * Clear other SGEX data (bookmarks, subscriptions, etc.)
     */
    clearOtherSGEXData(): void;
    /**
     * Get comprehensive cache information
     */
    getCacheInfo(): CacheInfo;
    /**
     * Get information about uncommitted work
     */
    getUncommittedWork(): UncommittedWork;
    /**
     * Clear cache for a specific DAK repository
     */
    clearDAKRepositoryCache(dakRepository: DAKRepository): void;
    /**
     * Get cache size estimation in bytes
     */
    getCacheSizeEstimate(): {
        localStorage: number;
        sessionStorage: number;
        total: number;
    };
    /**
     * Clear expired cache entries
     */
    clearExpiredCache(): void;
    /**
     * Get DAK-specific cache statistics
     */
    getDAKCacheStats(): {
        repositories: number;
        stagingGrounds: number;
        localChanges: number;
        branches: number;
        bookmarks: number;
    };
    /**
     * Private helper methods
     */
    private clearLocalStorageCache;
    private clearSessionStorageCache;
    private clearMemoryCaches;
    private getStorageInfo;
    private getMemoryCacheInfo;
    private estimateStorageSize;
    private getStorageQuota;
}
export declare const cacheManagementService: CacheManagementService;
//# sourceMappingURL=cache-management.d.ts.map