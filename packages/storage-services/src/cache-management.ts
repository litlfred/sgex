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

export class CacheManagementService {
  private readonly DAK_CACHE_PREFIXES = [
    'sgex_repo_cache_',
    'sgex-bookmarks',
    'sgex_branch_context',
    'sgex_staging_ground_',
    'sgex_profile_subscriptions',
    'sgex_local_changes_',
    'sgex_dak_cache_'
  ];

  /**
   * Clear all application caches
   */
  clearAllCache(): void {
    this.clearLocalStorageCache();
    this.clearSessionStorageCache();
    this.clearMemoryCaches();
  }

  /**
   * Clear all staging grounds (uncommitted work)
   */
  clearAllStagingGrounds(): void {
    const keys = Object.keys(localStorage);
    const stagingKeys = keys.filter(key => key.startsWith('sgex_staging_ground_'));
    
    stagingKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Clear other SGEX data (bookmarks, subscriptions, etc.)
   */
  clearOtherSGEXData(): void {
    const otherKeys = [
      'sgex-bookmarks',
      'sgex_profile_subscriptions',
      'sgex_branch_context'
    ];
    
    otherKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  /**
   * Get comprehensive cache information
   */
  getCacheInfo(): CacheInfo {
    return {
      localStorage: this.getStorageInfo(localStorage),
      sessionStorage: this.getStorageInfo(sessionStorage),
      memoryCaches: this.getMemoryCacheInfo()
    };
  }

  /**
   * Get information about uncommitted work
   */
  getUncommittedWork(): UncommittedWork {
    const keys = Object.keys(localStorage);
    const stagingKeys = keys.filter(key => key.startsWith('sgex_staging_ground_'));
    const localChangeKeys = keys.filter(key => key.startsWith('sgex_local_changes_'));
    
    const repositories: string[] = [];
    const details: UncommittedWork['details'] = {};
    
    // Check staging grounds
    stagingKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const stagingGround = JSON.parse(data);
          const repoKey = key.replace('sgex_staging_ground_', '');
          repositories.push(repoKey);
          
          details[repoKey] = {
            files: Object.keys(stagingGround.files || {}).length,
            lastModified: new Date(stagingGround.lastModified || Date.now())
          };
        }
      } catch (error) {
        console.warn('Failed to parse staging ground data:', key, error);
      }
    });

    // Check local changes
    localChangeKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const changes = JSON.parse(data);
          const repoKey = key.replace('sgex_local_changes_', '');
          
          if (!repositories.includes(repoKey)) {
            repositories.push(repoKey);
          }
          
          if (!details[repoKey]) {
            details[repoKey] = {
              files: 0,
              lastModified: new Date()
            };
          }
          
          details[repoKey].files += Object.keys(changes).length;
        }
      } catch (error) {
        console.warn('Failed to parse local changes data:', key, error);
      }
    });

    return {
      repositories,
      count: repositories.length,
      details
    };
  }

  /**
   * Clear cache for a specific DAK repository
   */
  clearDAKRepositoryCache(dakRepository: DAKRepository): void {
    const repoKey = `${dakRepository.owner}/${dakRepository.repo}`;
    const branch = dakRepository.branch || 'main';
    
    // Clear repository cache
    const repoCacheKeys = [
      `sgex_repo_cache_user_${dakRepository.owner}`,
      `sgex_repo_cache_org_${dakRepository.owner}`,
      `sgex_dak_cache_${repoKey}`,
      `sgex_dak_cache_${repoKey}_${branch}`
    ];
    
    repoCacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear staging ground for this repository
    localStorage.removeItem(`sgex_staging_ground_${repoKey}_${branch}`);
    
    // Clear local changes
    localStorage.removeItem(`sgex_local_changes_${repoKey}_${branch}`);
    
    // Clear branch context
    try {
      const branchContext = JSON.parse(localStorage.getItem('sgex_branch_context') || '{}');
      delete branchContext[repoKey];
      localStorage.setItem('sgex_branch_context', JSON.stringify(branchContext));
    } catch (error) {
      console.warn('Failed to clear branch context:', error);
    }
  }

  /**
   * Get cache size estimation in bytes
   */
  getCacheSizeEstimate(): { localStorage: number; sessionStorage: number; total: number } {
    const localStorageSize = this.estimateStorageSize(localStorage);
    const sessionStorageSize = this.estimateStorageSize(sessionStorage);
    
    return {
      localStorage: localStorageSize,
      sessionStorage: sessionStorageSize,
      total: localStorageSize + sessionStorageSize
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('sgex_repo_cache_')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const cacheData = JSON.parse(data);
            if (cacheData.timestamp) {
              const age = now - cacheData.timestamp;
              const maxAge = 24 * 60 * 60 * 1000; // 24 hours
              
              if (age > maxAge) {
                localStorage.removeItem(key);
              }
            }
          }
        } catch (error) {
          // Remove corrupted cache entries
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Get DAK-specific cache statistics
   */
  getDAKCacheStats(): {
    repositories: number;
    stagingGrounds: number;
    localChanges: number;
    branches: number;
    bookmarks: number;
  } {
    const keys = Object.keys(localStorage);
    
    const repoKeys = new Set<string>();
    const stagingGrounds = keys.filter(key => key.startsWith('sgex_staging_ground_')).length;
    const localChanges = keys.filter(key => key.startsWith('sgex_local_changes_')).length;
    
    // Count unique repositories
    keys.forEach(key => {
      if (key.startsWith('sgex_repo_cache_') || 
          key.startsWith('sgex_staging_ground_') || 
          key.startsWith('sgex_local_changes_')) {
        const match = key.match(/([^_]+\/[^_]+)/);
        if (match) {
          repoKeys.add(match[1]);
        }
      }
    });

    // Count branches
    let branchCount = 0;
    try {
      const branchContext = JSON.parse(localStorage.getItem('sgex_branch_context') || '{}');
      branchCount = Object.keys(branchContext).length;
    } catch (error) {
      // Ignore parsing errors
    }

    // Count bookmarks
    let bookmarkCount = 0;
    try {
      const bookmarks = JSON.parse(localStorage.getItem('sgex-bookmarks') || '[]');
      bookmarkCount = Array.isArray(bookmarks) ? bookmarks.length : 0;
    } catch (error) {
      // Ignore parsing errors
    }

    return {
      repositories: repoKeys.size,
      stagingGrounds,
      localChanges,
      branches: branchCount,
      bookmarks: bookmarkCount
    };
  }

  /**
   * Private helper methods
   */

  private clearLocalStorageCache(): void {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => 
      this.DAK_CACHE_PREFIXES.some(prefix => key.startsWith(prefix))
    );
    
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  private clearSessionStorageCache(): void {
    const keys = Object.keys(sessionStorage);
    const cacheKeys = keys.filter(key => 
      this.DAK_CACHE_PREFIXES.some(prefix => key.startsWith(prefix))
    );
    
    cacheKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });
  }

  private clearMemoryCaches(): void {
    // Clear any in-memory caches that might be registered
    // This would need to be extended if we add memory cache registration
    if (typeof window !== 'undefined' && (window as any).sgexMemoryCaches) {
      (window as any).sgexMemoryCaches = {};
    }
  }

  private getStorageInfo(storage: Storage): CacheInfo['localStorage'] {
    const keys = Object.keys(storage);
    const dakKeys = keys.filter(key => 
      this.DAK_CACHE_PREFIXES.some(prefix => key.startsWith(prefix))
    );
    
    const used = this.estimateStorageSize(storage);
    const available = this.getStorageQuota() - used;
    
    return {
      used,
      available: Math.max(0, available),
      keys,
      dakKeys
    };
  }

  private getMemoryCacheInfo(): CacheInfo['memoryCaches'] {
    // This would be extended to include actual memory cache info
    // For now, return empty object
    return {};
  }

  private estimateStorageSize(storage: Storage): number {
    let size = 0;
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        const value = storage.getItem(key);
        if (value) {
          // Estimate: 2 bytes per character (UTF-16)
          size += (key.length + value.length) * 2;
        }
      }
    }
    
    return size;
  }

  private getStorageQuota(): number {
    // Most browsers allow ~5-10MB for localStorage
    // Return conservative estimate
    return 5 * 1024 * 1024; // 5MB
  }
}

// Export singleton instance
export const cacheManagementService = new CacheManagementService();