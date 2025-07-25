/**
 * Repository Cache Service
 * Manages caching of discovered SMART Guidelines repositories with expiry
 */

class RepositoryCacheService {
  constructor() {
    this.CACHE_KEY_PREFIX = 'sgex_repo_cache_';
    this.CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours
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
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const parsed = JSON.parse(cachedData);
      
      // Check if cache is stale
      if (this.isStale(parsed.timestamp)) {
        // Remove stale cache
        localStorage.removeItem(cacheKey);
        return null;
      }

      return {
        repositories: parsed.repositories,
        timestamp: parsed.timestamp,
        owner: parsed.owner,
        type: parsed.type
      };
    } catch (error) {
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

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return true;
    } catch (error) {
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
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
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