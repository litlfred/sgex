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
  // DAK-specific fields
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

export class RepositoryCacheService {
  private readonly CACHE_KEY_PREFIX = 'sgex_repo_cache_';
  private readonly DAK_CACHE_PREFIX = 'sgex_dak_cache_';
  private readonly CACHE_EXPIRY_HOURS = 24;

  /**
   * Generate cache key for a user/organization
   */
  getCacheKey(owner: string, type: string = 'user', suffix: string = ''): string {
    const baseCacheKey = `${this.CACHE_KEY_PREFIX}${type}_${owner}`;
    return suffix ? `${baseCacheKey}_${suffix}` : baseCacheKey;
  }

  /**
   * Generate DAK-specific cache key
   */
  getDAKCacheKey(owner: string, repo: string, branch?: string): string {
    const key = `${this.DAK_CACHE_PREFIX}${owner}_${repo}`;
    return branch ? `${key}_${branch}` : key;
  }

  /**
   * Check if cached data is stale
   */
  isStale(timestamp: number): boolean {
    const now = Date.now();
    const cacheAge = now - timestamp;
    const maxAge = this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000;
    return cacheAge > maxAge;
  }

  /**
   * Get cached repositories for a user/organization
   */
  getCachedRepositories(owner: string, type: string = 'user', suffix: string = ''): CachedRepository[] | null {
    try {
      const cacheKey = this.getCacheKey(owner, type, suffix);
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const data: CacheData = JSON.parse(cachedData);
      
      if (this.isStale(data.timestamp)) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data.repositories;
    } catch (error) {
      console.warn('Error reading repository cache:', error);
      return null;
    }
  }

  /**
   * Cache repositories for a user/organization
   */
  setCachedRepositories(
    owner: string, 
    repositories: CachedRepository[], 
    type: string = 'user', 
    suffix: string = '',
    metadata?: { totalCount?: number; hasMore?: boolean; nextPage?: number }
  ): void {
    try {
      const cacheKey = this.getCacheKey(owner, type, suffix);
      const cacheData: CacheData = {
        timestamp: Date.now(),
        repositories,
        ...metadata
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching repositories:', error);
    }
  }

  /**
   * Cache DAK-specific data
   */
  cacheDAKData(
    owner: string, 
    repo: string, 
    dakData: {
      isDak: boolean;
      validation?: DAKValidationResult;
      metadata?: any;
    },
    branch?: string
  ): void {
    try {
      const cacheKey = this.getDAKCacheKey(owner, repo, branch);
      const cacheData = {
        timestamp: Date.now(),
        ...dakData
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching DAK data:', error);
    }
  }

  /**
   * Get cached DAK data
   */
  getCachedDAKData(owner: string, repo: string, branch?: string): any | null {
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
    } catch (error) {
      console.warn('Error reading DAK cache:', error);
      return null;
    }
  }

  /**
   * Clear cache for specific owner
   */
  clearCacheForOwner(owner: string): boolean {
    try {
      const keys = Object.keys(localStorage);
      const ownerKeys = keys.filter(key => 
        key.includes(`_${owner}_`) || key.includes(`_${owner}`) && 
        (key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.DAK_CACHE_PREFIX))
      );
      
      ownerKeys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing cache for owner:', owner, error);
      return false;
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): boolean {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.DAK_CACHE_PREFIX)
      );
      
      cacheKeys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing all caches:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): CacheStatistics {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => 
      key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.DAK_CACHE_PREFIX)
    );
    
    let totalRepositories = 0;
    let dakRepositories = 0;
    let cacheSize = 0;
    let oldestTimestamp: number | null = null;
    let newestTimestamp: number | null = null;

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
            dakRepositories += parsed.repositories.filter((r: CachedRepository) => r.isDak).length;
          } else if (parsed.isDak !== undefined) {
            // DAK-specific cache entry
            if (parsed.isDak) {
              dakRepositories++;
            }
          }
        }
      } catch (error) {
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
  hasCacheFor(owner: string, type: string = 'user'): boolean {
    const cacheKey = this.getCacheKey(owner, type);
    return localStorage.getItem(cacheKey) !== null;
  }

  /**
   * Get cache age in milliseconds
   */
  getCacheAge(owner: string, type: string = 'user'): number | null {
    try {
      const cacheKey = this.getCacheKey(owner, type);
      const cachedData = localStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const data: CacheData = JSON.parse(cachedData);
      return Date.now() - data.timestamp;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all cached owners
   */
  getCachedOwners(): string[] {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
    const owners = new Set<string>();
    
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
  refreshExpiredCaches(): number {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => 
      key.startsWith(this.CACHE_KEY_PREFIX) || key.startsWith(this.DAK_CACHE_PREFIX)
    );
    
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
      } catch (error) {
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
  toDAKRepository(repo: CachedRepository, branch?: string): DAKRepository {
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
  updateRepositoryDAKInfo(
    owner: string, 
    repoName: string, 
    dakInfo: { isDak: boolean; validation?: DAKValidationResult; metadata?: any }
  ): void {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
    
    cacheKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const cacheData: CacheData = JSON.parse(data);
          const repo = cacheData.repositories.find(r => 
            r.owner.login === owner && r.name === repoName
          );
          
          if (repo) {
            repo.isDak = dakInfo.isDak;
            repo.dakValidation = dakInfo.validation;
            repo.dakMetadata = dakInfo.metadata;
            localStorage.setItem(key, JSON.stringify(cacheData));
          }
        }
      } catch (error) {
        console.warn('Error updating repository DAK info:', error);
      }
    });
  }
}

// Export singleton instance
export const repositoryCacheService = new RepositoryCacheService();