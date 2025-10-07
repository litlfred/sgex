/**
 * Repository Cache Service
 * Manages caching of discovered SMART Guidelines repositories with expiry and DAK validation
 *
 * Migrated from src/services/repositoryCacheService.js with DAK integration
 */
import { DAKRepository, DAKValidationResult } from './types';
export interface CachedRepository {
    id: number;
    name: string;
    full_name: string;
    owner: {
        login: string;
        type: string;
    };
    private: boolean;
    html_url: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    clone_url: string;
    default_branch: string;
    isDak?: boolean;
    dakValidation?: DAKValidationResult;
    dakMetadata?: any;
}
export interface CacheData {
    timestamp: number;
    repositories: CachedRepository[];
    totalCount?: number;
    hasMore?: boolean;
    nextPage?: number;
}
export interface CacheStatistics {
    totalCaches: number;
    totalRepositories: number;
    dakRepositories: number;
    cacheSize: number;
    oldestCache: Date | null;
    newestCache: Date | null;
}
export declare class RepositoryCacheService {
    private readonly CACHE_KEY_PREFIX;
    private readonly DAK_CACHE_PREFIX;
    private readonly CACHE_EXPIRY_HOURS;
    /**
     * Generate cache key for a user/organization
     */
    getCacheKey(owner: string, type?: string, suffix?: string): string;
    /**
     * Generate DAK-specific cache key
     */
    getDAKCacheKey(owner: string, repo: string, branch?: string): string;
    /**
     * Check if cached data is stale
     */
    isStale(timestamp: number): boolean;
    /**
     * Get cached repositories for a user/organization
     */
    getCachedRepositories(owner: string, type?: string, suffix?: string): CachedRepository[] | null;
    /**
     * Cache repositories for a user/organization
     */
    setCachedRepositories(owner: string, repositories: CachedRepository[], type?: string, suffix?: string, metadata?: {
        totalCount?: number;
        hasMore?: boolean;
        nextPage?: number;
    }): void;
    /**
     * Cache DAK-specific data
     */
    cacheDAKData(owner: string, repo: string, dakData: {
        isDak: boolean;
        validation?: DAKValidationResult;
        metadata?: any;
    }, branch?: string): void;
    /**
     * Get cached DAK data
     */
    getCachedDAKData(owner: string, repo: string, branch?: string): any | null;
    /**
     * Clear cache for specific owner
     */
    clearCacheForOwner(owner: string): boolean;
    /**
     * Clear all caches
     */
    clearAllCaches(): boolean;
    /**
     * Get cache statistics
     */
    getCacheStatistics(): CacheStatistics;
    /**
     * Check if cache exists for owner
     */
    hasCacheFor(owner: string, type?: string): boolean;
    /**
     * Get cache age in milliseconds
     */
    getCacheAge(owner: string, type?: string): number | null;
    /**
     * Get all cached owners
     */
    getCachedOwners(): string[];
    /**
     * Refresh expired caches (remove stale entries)
     */
    refreshExpiredCaches(): number;
    /**
     * Convert repository to DAK repository format
     */
    toDAKRepository(repo: CachedRepository, branch?: string): DAKRepository;
    /**
     * Update repository with DAK information
     */
    updateRepositoryDAKInfo(owner: string, repoName: string, dakInfo: {
        isDak: boolean;
        validation?: DAKValidationResult;
        metadata?: any;
    }): void;
}
export declare const repositoryCacheService: RepositoryCacheService;
//# sourceMappingURL=repository-cache.d.ts.map