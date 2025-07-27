/**
 * Repository Cache Service
 * Manages caching of discovered SMART Guidelines repositories with expiry
 */

import logger from '../utils/logger';

class RepositoryCacheService {
  constructor() {
    this.CACHE_KEY_PREFIX = 'sgex_repo_cache_';
    this.CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours
    this.logger = logger.getLogger('RepositoryCacheService');
    this.logger.debug('RepositoryCacheService initialized', { 
      cacheExpiryHours: this.CACHE_EXPIRY_HOURS 
    });
  }

  /**
   * Generate cache key for a user/organization
   */
  getCacheKey(owner, type = 'user') {
    return `${this.CACHE_KEY_PREFIX}${type}_${owner}`;
  }

  /**
   * Check if cached data is stale (older than 24 hours)
   */
  isStale(timestamp) {
    const now = Date.now();
    const cacheAge = now - timestamp;
    const maxAge = this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // 24 hours in milliseconds
    return cacheAge > maxAge;
  }

  /**
   * Get cached repositories for a user/organization
   * Returns null if cache doesn't exist or is stale
   */
  getCachedRepositories(owner, type = 'user') {
    try {
      const cacheKey = this.getCacheKey(owner, type);
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
        repositoryCount: parsed.repositories?.length || 0,
        age: Date.now() - parsed.timestamp
      });

      return {
        repositories: parsed.repositories,
        timestamp: parsed.timestamp,
        owner: parsed.owner,
        type: parsed.type
      };
    } catch (error) {
      const cacheKey = this.getCacheKey(owner, type);
      this.logger.error('Error reading repository cache', { cacheKey, error: error.message });
      console.warn('Error reading repository cache:', error);
      return null;
    }
  }

  /**
   * Cache repositories for a user/organization
   */
  setCachedRepositories(owner, type = 'user', repositories) {
    try {
      const cacheKey = this.getCacheKey(owner, type);
      const cacheData = {
        repositories,
        timestamp: Date.now(),
        owner,
        type
      };

      this.logger.cache('set', cacheKey, { 
        repositoryCount: repositories?.length || 0,
        owner, 
        type 
      });

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      const cacheKey = this.getCacheKey(owner, type);
      this.logger.error('Error caching repositories', { cacheKey, error: error.message });
      console.warn('Error caching repositories:', error);
      return false;
    }
  }

  /**
   * Clear cache for a specific user/organization
   */
  clearCache(owner, type = 'user') {
    try {
      const cacheKey = this.getCacheKey(owner, type);
      this.logger.cache('clear', cacheKey, { owner, type });
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      const cacheKey = this.getCacheKey(owner, type);
      this.logger.error('Error clearing repository cache', { cacheKey, error: error.message });
      console.warn('Error clearing repository cache:', error);
      return false;
    }
  }

  /**
   * Clear all repository caches
   */
  clearAllCaches() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.warn('Error clearing all repository caches:', error);
      return false;
    }
  }

  /**
   * Get cache info for debugging
   */
  getCacheInfo(owner, type = 'user') {
    const cached = this.getCachedRepositories(owner, type);
    if (!cached) {
      return { exists: false, stale: true };
    }

    const age = Date.now() - cached.timestamp;
    const ageHours = Math.round(age / (60 * 60 * 1000));
    
    return {
      exists: true,
      stale: this.isStale(cached.timestamp),
      age: age,
      ageHours: ageHours,
      repositoryCount: cached.repositories.length,
      timestamp: new Date(cached.timestamp).toISOString()
    };
  }
}

// Create singleton instance
const repositoryCacheService = new RepositoryCacheService();

export default repositoryCacheService;