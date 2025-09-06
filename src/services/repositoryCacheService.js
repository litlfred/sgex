/**
 * Repository Cache Service
 * Manages caching of discovered SMART Guidelines repositories with expiry
 */

import logger from '../utils/logger';

class RepositoryCacheService {
  constructor() {
    this.CACHE_KEY_PREFIX = 'sgex_repo_cache_';
    this.PROFILE_CACHE_KEY_PREFIX = 'sgex_profile_cache_';
    this.CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours
    this.PROFILE_CACHE_EXPIRY_MINUTES = 5; // Profile cache expires after 5 minutes
    this.logger = logger.getLogger('RepositoryCacheService');
    this.logger.debug('RepositoryCacheService initialized', { 
      cacheExpiryHours: this.CACHE_EXPIRY_HOURS,
      profileCacheExpiryMinutes: this.PROFILE_CACHE_EXPIRY_MINUTES
    });
  }

  /**
   * Generate cache key for a user/organization
   */
  getCacheKey(owner, type = 'user', suffix = '') {
    const baseCacheKey = `${this.CACHE_KEY_PREFIX}${type}_${owner}`;
    return suffix ? `${baseCacheKey}_${suffix}` : baseCacheKey;
  }

  /**
   * Check if cached data is stale (older than 24 hours for repos, 5 minutes for profiles)
   */
  isStale(timestamp, isProfile = false) {
    const now = Date.now();
    const cacheAge = now - timestamp;
    const maxAge = isProfile 
      ? this.PROFILE_CACHE_EXPIRY_MINUTES * 60 * 1000  // 5 minutes in milliseconds
      : this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // 24 hours in milliseconds
    return cacheAge > maxAge;
  }

  /**
   * Get cached repositories for a user/organization
   * Returns null if cache doesn't exist or is stale
   */
  getCachedRepositories(owner, type = 'user', suffix = '') {
    try {
      const cacheKey = this.getCacheKey(owner, type, suffix);
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
      const cacheKey = this.getCacheKey(owner, type, suffix);
      this.logger.error('Error reading repository cache', { cacheKey, error: error.message });
      console.warn('Error reading repository cache:', error);
      return null;
    }
  }

  /**
   * Cache repositories for a user/organization
   */
  setCachedRepositories(owner, type = 'user', repositories, suffix = '') {
    try {
      const cacheKey = this.getCacheKey(owner, type, suffix);
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
      const cacheKey = this.getCacheKey(owner, type, suffix);
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
  getCacheInfo(owner, type = 'user', suffix = '') {
    const cached = this.getCachedRepositories(owner, type, suffix);
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

  /**
   * Generate profile cache key based on authentication state
   */
  getProfileCacheKey(isAuthenticated = false) {
    return `${this.PROFILE_CACHE_KEY_PREFIX}${isAuthenticated ? 'auth' : 'unauth'}`;
  }

  /**
   * Get cached profile data (user + organizations)
   * Returns null if cache doesn't exist or is stale
   */
  getCachedProfile(isAuthenticated = false) {
    try {
      const cacheKey = this.getProfileCacheKey(isAuthenticated);
      this.logger.cache('get', cacheKey);
      
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) {
        this.logger.cache('miss', cacheKey, 'No cached profile data found');
        return null;
      }

      const parsed = JSON.parse(cachedData);
      
      // Check if cache is stale (5 minutes for profiles)
      if (this.isStale(parsed.timestamp, true)) {
        // Remove stale cache
        this.logger.cache('expired', cacheKey, { age: Date.now() - parsed.timestamp });
        localStorage.removeItem(cacheKey);
        return null;
      }

      this.logger.cache('hit', cacheKey, { 
        organizationCount: parsed.organizations?.length || 0,
        hasUser: !!parsed.user,
        age: Date.now() - parsed.timestamp
      });

      return {
        user: parsed.user,
        organizations: parsed.organizations,
        timestamp: parsed.timestamp,
        isAuthenticated: parsed.isAuthenticated
      };
    } catch (error) {
      const cacheKey = this.getProfileCacheKey(isAuthenticated);
      this.logger.error('Error reading profile cache', { cacheKey, error: error.message });
      console.warn('Error reading profile cache:', error);
      return null;
    }
  }

  /**
   * Cache profile data (user + organizations)
   */
  setCachedProfile(user, organizations, isAuthenticated = false) {
    try {
      const cacheKey = this.getProfileCacheKey(isAuthenticated);
      const cacheData = {
        user,
        organizations,
        timestamp: Date.now(),
        isAuthenticated
      };

      this.logger.cache('set', cacheKey, { 
        organizationCount: organizations?.length || 0,
        hasUser: !!user,
        isAuthenticated
      });

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      const cacheKey = this.getProfileCacheKey(isAuthenticated);
      this.logger.error('Error caching profile', { cacheKey, error: error.message });
      console.warn('Error caching profile:', error);
      return false;
    }
  }

  /**
   * Clear profile cache for specific authentication state
   */
  clearProfileCache(isAuthenticated = false) {
    try {
      const cacheKey = this.getProfileCacheKey(isAuthenticated);
      this.logger.cache('clear', cacheKey, { isAuthenticated });
      localStorage.removeItem(cacheKey);
      return true;
    } catch (error) {
      const cacheKey = this.getProfileCacheKey(isAuthenticated);
      this.logger.error('Error clearing profile cache', { cacheKey, error: error.message });
      console.warn('Error clearing profile cache:', error);
      return false;
    }
  }

  /**
   * Clear all profile caches (both authenticated and unauthenticated)
   */
  clearAllProfileCaches() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PROFILE_CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.warn('Error clearing all profile caches:', error);
      return false;
    }
  }
}

// Create singleton instance
const repositoryCacheService = new RepositoryCacheService();

export default repositoryCacheService;