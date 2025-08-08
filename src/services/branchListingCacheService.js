/**
 * Branch Listing Cache Service
 * Provides caching functionality for branch and pull request data
 */

class BranchListingCacheService {
    constructor() {
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    }

    /**
     * Generate cache key for a repository
     */
    getCacheKey(owner, repo) {
        return `${owner}/${repo}`;
    }

    /**
     * Check if cache is valid for a given key
     */
    isCacheValid(cacheKey) {
        const timestamp = this.cacheTimestamps.get(cacheKey);
        if (!timestamp) return false;
        return Date.now() - timestamp < this.CACHE_DURATION;
    }

    /**
     * Get cached data for a repository
     */
    getCachedData(owner, repo) {
        const cacheKey = this.getCacheKey(owner, repo);
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        return null;
    }

    /**
     * Set cached data for a repository
     */
    setCachedData(owner, repo, branches, pullRequests) {
        const cacheKey = this.getCacheKey(owner, repo);
        const data = {
            branches: branches || [],
            pullRequests: pullRequests || []
        };
        
        this.cache.set(cacheKey, data);
        this.cacheTimestamps.set(cacheKey, Date.now());
    }

    /**
     * Force refresh by clearing cache for a repository
     */
    forceRefresh(owner, repo) {
        const cacheKey = this.getCacheKey(owner, repo);
        this.cache.delete(cacheKey);
        this.cacheTimestamps.delete(cacheKey);
    }

    /**
     * Get cache information for a repository
     */
    getCacheInfo(owner, repo) {
        const cacheKey = this.getCacheKey(owner, repo);
        const timestamp = this.cacheTimestamps.get(cacheKey);
        
        if (!timestamp) {
            return {
                cached: false,
                lastUpdated: null,
                age: 0
            };
        }

        const age = Date.now() - timestamp;
        return {
            cached: true,
            lastUpdated: new Date(timestamp),
            age: age,
            valid: this.isCacheValid(cacheKey)
        };
    }

    /**
     * Clear all cache
     */
    clearAll() {
        this.cache.clear();
        this.cacheTimestamps.clear();
    }
}

// Export singleton instance
const branchListingCacheService = new BranchListingCacheService();
export default branchListingCacheService;