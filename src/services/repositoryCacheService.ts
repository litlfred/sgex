/**
 * Repository Cache Service - TypeScript Implementation
 * Manages caching of discovered SMART Guidelines repositories with expiry
 */

import type {
  GitHubRepository,
  RepositoryCacheData,
  CacheResult,
  Logger as LoggerType
} from '../types/core';
import logger from '../utils/logger';

export class RepositoryCacheService {
  private readonly CACHE_KEY_PREFIX = 'sgex_repo_cache_';
  private readonly CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours
  private readonly logger: LoggerType;

  constructor() {
    this.logger = logger.getLogger('RepositoryCacheService');
    this.logger.debug('RepositoryCacheService initialized', {
      cacheExpiryHours: this.CACHE_EXPIRY_HOURS
    });
  }

  /**
   * Generate cache key for a user/organization
   */
  private getCacheKey(owner: string, type: 'user' | 'org' = 'user'): string {
    return `${this.CACHE_KEY_PREFIX}${type}_${owner}`;
  }

  /**
   * Check if cached data is stale (older than 24 hours)
   */
  private isStale(timestamp: number): boolean {
    const now = Date.now();
    const cacheAge = now - timestamp;
    const maxAge = this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000; // 24 hours in milliseconds
    return cacheAge > maxAge;
  }

  /**
   * Get cached repositories for a user/organization
   * Returns null if cache doesn't exist or is stale
   */
  getCachedRepositories(owner: string, type: 'user' | 'org' = 'user'): CacheResult<RepositoryCacheData> {
    try {
      const cacheKey = this.getCacheKey(owner, type);
      this.logger.cache('get', cacheKey);

      const cachedData = localStorage.getItem(cacheKey);

      if (!cachedData) {
        this.logger.cache('miss', cacheKey, 'No cached data found');
        return { data: null, isHit: false };
      }

      const parsed: RepositoryCacheData = JSON.parse(cachedData);

      // Check if cache is stale
      if (this.isStale(parsed.timestamp)) {
        // Remove stale cache
        const age = Date.now() - parsed.timestamp;
        this.logger.cache('expired', cacheKey, { age });
        localStorage.removeItem(cacheKey);
        return { data: null, isHit: false, age };
      }

      const age = Date.now() - parsed.timestamp;
      this.logger.cache('hit', cacheKey, {
        repositoryCount: parsed.repositories?.length || 0,
        age
      });

      return {
        data: {
          repositories: parsed.repositories,
          timestamp: parsed.timestamp,
          owner: parsed.owner,
          type: parsed.type
        },
        isHit: true,
        age
      };
    } catch (error) {
      const cacheKey = this.getCacheKey(owner, type);
      this.logger.error('Error reading repository cache', {
        cacheKey,
        error: error instanceof Error ? error.message : String(error)
      });
      console.warn('Error reading repository cache:', error);
      return { data: null, isHit: false };
    }
  }

  /**
   * Cache repositories for a user/organization
   */
  setCachedRepositories(
    owner: string,
    type: 'user' | 'org' = 'user',
    repositories: GitHubRepository[]
  ): boolean {
    try {
      const cacheKey = this.getCacheKey(owner, type);
      const cacheData: RepositoryCacheData = {
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
      this.logger.error('Error caching repositories', {
        cacheKey,
        error: error instanceof Error ? error.message : String(error)
      });
      console.warn('Error caching repositories:', error);
      return false;
    }
  }

  /**
   * Clear cache for a specific user/organization
   */
  clearCacheForOwner(owner: string, type: 'user' | 'org' = 'user'): boolean {
    try {
      const cacheKey = this.getCacheKey(owner, type);
      localStorage.removeItem(cacheKey);
      
      this.logger.cache('clear', cacheKey, { owner, type });
      return true;
    } catch (error) {
      this.logger.error('Error clearing cache', {
        owner,
        type,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Clear all repository caches
   */
  clearAllCaches(): number {
    let clearedCount = 0;
    
    try {
      const keys = Object.keys(localStorage).filter(key =>
        key.startsWith(this.CACHE_KEY_PREFIX)
      );
      
      keys.forEach(key => {
        localStorage.removeItem(key);
        clearedCount++;
      });
      
      this.logger.cache('clearAll', 'all', { clearedCount });
      return clearedCount;
    } catch (error) {
      this.logger.error('Error clearing all caches', {
        error: error instanceof Error ? error.message : String(error)
      });
      return clearedCount;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): { totalCaches: number; totalSize: number; cacheKeys: string[] } {
    try {
      const cacheKeys = Object.keys(localStorage).filter(key =>
        key.startsWith(this.CACHE_KEY_PREFIX)
      );
      
      let totalSize = 0;
      cacheKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      });
      
      return {
        totalCaches: cacheKeys.length,
        totalSize,
        cacheKeys
      };
    } catch (error) {
      this.logger.error('Error getting cache statistics', {
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        totalCaches: 0,
        totalSize: 0,
        cacheKeys: []
      };
    }
  }

  /**
   * Check if a cache entry exists for the owner
   */
  hasCacheFor(owner: string, type: 'user' | 'org' = 'user'): boolean {
    const cacheKey = this.getCacheKey(owner, type);
    return localStorage.getItem(cacheKey) !== null;
  }

  /**
   * Get the age of cached data in milliseconds
   */
  getCacheAge(owner: string, type: 'user' | 'org' = 'user'): number | null {
    try {
      const result = this.getCachedRepositories(owner, type);
      return result.age || null;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance to maintain backward compatibility
const repositoryCacheService = new RepositoryCacheService();
export default repositoryCacheService;