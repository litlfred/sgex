"use strict";
/**
 * Repository Cache Service
 * Manages caching of discovered SMART Guidelines repositories with expiry and DAK validation
 *
 * Migrated from src/services/repositoryCacheService.js with DAK integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoryCacheService = exports.RepositoryCacheService = void 0;
class RepositoryCacheService {
    constructor() {
        this.CACHE_KEY_PREFIX = 'sgex_repo_cache_';
        this.DAK_CACHE_PREFIX = 'sgex_dak_cache_';
        this.CACHE_EXPIRY_HOURS = 24;
    }
    /**
     * Generate cache key for a user/organization
     */
    getCacheKey(owner, type = 'user', suffix = '') {
        const baseCacheKey = `${this.CACHE_KEY_PREFIX}${type}_${owner}`;
        return suffix ? `${baseCacheKey}_${suffix}` : baseCacheKey;
    }
    /**
     * Generate DAK-specific cache key
     */
    getDAKCacheKey(owner, repo, branch) {
        const key = `${this.DAK_CACHE_PREFIX}${owner}_${repo}`;
        return branch ? `${key}_${branch}` : key;
    }
    /**
     * Check if cached data is stale
     */
    isStale(timestamp) {
        const now = Date.now();
        const cacheAge = now - timestamp;
        const maxAge = this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
        return cacheAge > maxAge;
    }
    /**
     * Get cached repositories for a user/organization
     */
    getCachedRepositories(owner, type = 'user', suffix = '') {
        try {
            const cacheKey = this.getCacheKey(owner, type, suffix);
            const cachedData = localStorage.getItem(cacheKey);
            if (!cachedData) {
                return null;
            }
            const data = JSON.parse(cachedData);
            if (this.isStale(data.timestamp)) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            return data.repositories;
        }
        catch (error) {
            console.warn('Error reading repository cache:', error);
            return null;
        }
    }
    /**
     * Cache repositories for a user/organization
     */
    setCachedRepositories(owner, repositories, type = 'user', suffix = '', metadata) {
        try {
            const cacheKey = this.getCacheKey(owner, type, suffix);
            const cacheData = {
                timestamp: Date.now(),
                repositories,
                ...metadata
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        }
        catch (error) {
            console.error('Error caching repositories:', error);
        }
    }
    /**
     * Cache DAK-specific data
     */
    cacheDAKData(owner, repo, dakData, branch) {
        try {
            const cacheKey = this.getDAKCacheKey(owner, repo, branch);
            const cacheData = {
                timestamp: Date.now(),
                ...dakData
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        }
        catch (error) {
            console.error('Error caching DAK data:', error);
        }
    }
    /**
     * Get cached DAK data
     */
    getCachedDAKData(owner, repo, branch) {
        try {
            const cacheKey = this.getDAKCacheKey(owner, repo, branch);
            const cachedData = localStorage.getItem(cacheKey);
            if (!cachedData) {
                return null;
            }
            const data = JSON.parse(cachedData);
            if (this.isStale(data.timestamp)) {
                localStorage.removeItem(cacheKey);
                return null;
            }
            return data;
        }
        catch (error) {
            console.warn('Error reading DAK cache:', error);
            return null;
        }
    }
    /**
     * Clear cache for specific owner
     */
    clearCacheForOwner(owner) {
        try {
            const keys = Object.keys(localStorage);
            const ownerKeys = keys.filter(key => key.includes(`_${owner}_`) || key.includes(`_${owner}`) &&
                (key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.DAK_CACHE_PREFIX)));
            ownerKeys.forEach(key => localStorage.removeItem(key));
            return true;
        }
        catch (error) {
            console.error('Error clearing cache for owner:', owner, error);
            return false;
        }
    }
    /**
     * Clear all caches
     */
    clearAllCaches() {
        try {
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.DAK_CACHE_PREFIX));
            cacheKeys.forEach(key => localStorage.removeItem(key));
            return true;
        }
        catch (error) {
            console.error('Error clearing all caches:', error);
            return false;
        }
    }
    /**
     * Get cache statistics
     */
    getCacheStatistics() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.DAK_CACHE_PREFIX));
        let totalRepositories = 0;
        let dakRepositories = 0;
        let cacheSize = 0;
        let oldestTimestamp = null;
        let newestTimestamp = null;
        cacheKeys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    cacheSize += data.length * 2; // Rough size estimate
                    const parsed = JSON.parse(data);
                    if (parsed.timestamp) {
                        if (!oldestTimestamp || parsed.timestamp < oldestTimestamp) {
                            oldestTimestamp = parsed.timestamp;
                        }
                        if (!newestTimestamp || parsed.timestamp > newestTimestamp) {
                            newestTimestamp = parsed.timestamp;
                        }
                    }
                    if (parsed.repositories && Array.isArray(parsed.repositories)) {
                        totalRepositories += parsed.repositories.length;
                        dakRepositories += parsed.repositories.filter((r) => r.isDak).length;
                    }
                    else if (parsed.isDak !== undefined) {
                        // DAK-specific cache entry
                        if (parsed.isDak) {
                            dakRepositories++;
                        }
                    }
                }
            }
            catch (error) {
                // Ignore parsing errors for statistics
            }
        });
        return {
            totalCaches: cacheKeys.length,
            totalRepositories,
            dakRepositories,
            cacheSize,
            oldestCache: oldestTimestamp ? new Date(oldestTimestamp) : null,
            newestCache: newestTimestamp ? new Date(newestTimestamp) : null
        };
    }
    /**
     * Check if cache exists for owner
     */
    hasCacheFor(owner, type = 'user') {
        const cacheKey = this.getCacheKey(owner, type);
        return localStorage.getItem(cacheKey) !== null;
    }
    /**
     * Get cache age in milliseconds
     */
    getCacheAge(owner, type = 'user') {
        try {
            const cacheKey = this.getCacheKey(owner, type);
            const cachedData = localStorage.getItem(cacheKey);
            if (!cachedData) {
                return null;
            }
            const data = JSON.parse(cachedData);
            return Date.now() - data.timestamp;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Get all cached owners
     */
    getCachedOwners() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
        const owners = new Set();
        cacheKeys.forEach(key => {
            const match = key.match(/_([^_]+)$/);
            if (match) {
                owners.add(match[1]);
            }
        });
        return Array.from(owners);
    }
    /**
     * Refresh expired caches (remove stale entries)
     */
    refreshExpiredCaches() {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.DAK_CACHE_PREFIX));
        let removedCount = 0;
        cacheKeys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (parsed.timestamp && this.isStale(parsed.timestamp)) {
                        localStorage.removeItem(key);
                        removedCount++;
                    }
                }
            }
            catch (error) {
                // Remove corrupted entries
                localStorage.removeItem(key);
                removedCount++;
            }
        });
        return removedCount;
    }
    /**
     * Convert repository to DAK repository format
     */
    toDAKRepository(repo, branch) {
        return {
            owner: repo.owner.login,
            repo: repo.name,
            branch: branch || repo.default_branch || 'main',
            dakMetadata: repo.dakMetadata,
            isValidDAK: repo.isDak,
            lastValidated: repo.dakValidation?.timestamp
        };
    }
    /**
     * Update repository with DAK information
     */
    updateRepositoryDAKInfo(owner, repoName, dakInfo) {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
        cacheKeys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const cacheData = JSON.parse(data);
                    const repo = cacheData.repositories.find(r => r.owner.login === owner && r.name === repoName);
                    if (repo) {
                        repo.isDak = dakInfo.isDak;
                        repo.dakValidation = dakInfo.validation;
                        repo.dakMetadata = dakInfo.metadata;
                        localStorage.setItem(key, JSON.stringify(cacheData));
                    }
                }
            }
            catch (error) {
                console.warn('Error updating repository DAK info:', error);
            }
        });
    }
}
exports.RepositoryCacheService = RepositoryCacheService;
// Export singleton instance
exports.repositoryCacheService = new RepositoryCacheService();
//# sourceMappingURL=repository-cache.js.map