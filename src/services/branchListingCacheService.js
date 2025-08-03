/**
 * Branch Listing Cache Service
 * Manages caching of branch and PR preview data with 5-minute expiry
 */

import logger from '../utils/logger';

class BranchListingCacheService {
  constructor() {
    this.CACHE_KEY_PREFIX = 'sgex_branch_listing_cache_';
    this.CACHE_EXPIRY_MINUTES = 5; // Cache expires after 5 minutes as per requirements
    this.logger = logger.getLogger('BranchListingCacheService');
    this.logger.debug('BranchListingCacheService initialized', { 
      cacheExpiryMinutes: this.CACHE_EXPIRY_MINUTES 
    });
  }

  /**
   * Generate cache key for branch listing data
   */
  getCacheKey(owner, repo) {
    return `${this.CACHE_KEY_PREFIX}${owner}_${repo}`;
  }

  /**
   * Check if cached data is stale (older than 5 minutes)
   */
  isStale(timestamp) {
    const now = Date.now();
    const cacheAge = now - timestamp;
    const maxAge = this.CACHE_EXPIRY_MINUTES * 60 * 1000; // 5 minutes in milliseconds
    return cacheAge > maxAge;
  }

  /**
   * Get cached branch listing data (branches and PRs)
   * Returns null if cache doesn't exist or is stale
   */
  getCachedData(owner, repo) {
    try {
      const cacheKey = this.getCacheKey(owner, repo);
      this.logger.cache('get', cacheKey);
      
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) {
        this.logger.cache('miss', cacheKey, 'No cached data found');
        return null;
      }

      const parsed = JSON.parse(cachedData);
      
      // Check if cache is stale
      if (this.isStale(parsed.timestamp)) {
        // Remove stale cache
        this.logger.cache('expired', cacheKey, { age: Date.now() - parsed.timestamp });
        localStorage.removeItem(cacheKey);
        return null;
      }

      this.logger.cache('hit', cacheKey, { 
        branchCount: parsed.branches?.length || 0,
        prCount: parsed.pullRequests?.length || 0,
        age: Date.now() - parsed.timestamp
      });

      return {
        branches: parsed.branches,
        pullRequests: parsed.pullRequests,
        timestamp: parsed.timestamp,
        owner: parsed.owner,
        repo: parsed.repo
      };
    } catch (error) {
      const cacheKey = this.getCacheKey(owner, repo);
      this.logger.error('Error reading branch listing cache', { cacheKey, error: error.message });
      console.warn('Error reading branch listing cache:', error);
      return null;
    }
  }

  /**
   * Cache branch listing data (branches and PRs)
   */
  setCachedData(owner, repo, branches, pullRequests) {
    try {
      const cacheKey = this.getCacheKey(owner, repo);
      const cacheData = {
        branches,
        pullRequests,
        timestamp: Date.now(),
        owner,
        repo
      };

      this.logger.cache('set', cacheKey, { 
        branchCount: branches?.length || 0,
        prCount: pullRequests?.length || 0,
        owner, 
        repo 
      });

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      const cacheKey = this.getCacheKey(owner, repo);
      this.logger.error('Error caching branch listing data', { cacheKey, error: error.message });
      console.warn('Error caching branch listing data:', error);
      return false;
    }
  }

  /**
   * Clear cache for a specific repository
   */
  clearCache(owner, repo) {
    try {
      const cacheKey = this.getCacheKey(owner, repo);
      this.logger.cache('clear', cacheKey, { owner, repo });
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      const cacheKey = this.getCacheKey(owner, repo);
      this.logger.error('Error clearing branch listing cache', { cacheKey, error: error.message });
      console.warn('Error clearing branch listing cache:', error);
      return false;
    }
  }

  /**
   * Clear all branch listing caches
   */
  clearAllCaches() {
    try {
      const keys = Object.keys(localStorage);
      let clearedCount = 0;
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      });
      this.logger.debug('Cleared all branch listing caches', { clearedCount });
      return true;
    } catch (error) {
      this.logger.error('Error clearing all branch listing caches', { error: error.message });
      console.warn('Error clearing all branch listing caches:', error);
      return false;
    }
  }

  /**
   * Get cache info for debugging
   */
  getCacheInfo(owner, repo) {
    const cached = this.getCachedData(owner, repo);
    if (!cached) {
      return { exists: false, stale: true };
    }

    const age = Date.now() - cached.timestamp;
    const ageMinutes = Math.round(age / (60 * 1000));
    
    return {
      exists: true,
      stale: this.isStale(cached.timestamp),
      age: age,
      ageMinutes: ageMinutes,
      branchCount: cached.branches?.length || 0,
      prCount: cached.pullRequests?.length || 0,
      timestamp: new Date(cached.timestamp).toISOString()
    };
  }

  /**
   * Force refresh cache - clear existing cache to force fresh data fetch
   */
  forceRefresh(owner, repo) {
    this.logger.info('Force refresh requested', { owner, repo });
    return this.clearCache(owner, repo);
  }
}

// Create singleton instance
const branchListingCacheService = new BranchListingCacheService();

export default branchListingCacheService;