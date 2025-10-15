/**
 * Cache Management Service
 * 
 * Centralized service for managing all application cache and local storage
 * including repository cache, branch context, staging ground, and user data.
 * 
 * @module cacheManagementService
 */

import repositoryCacheService from './repositoryCacheService';
import branchContextService from './branchContextService';
import logger from '../utils/logger';

/**
 * Repository cache information
 * @example { "count": 5, "keys": ["sgex_repo_cache_user_repo"] }
 */
export interface RepositoryCacheInfo {
  /** Number of cached repositories */
  count: number;
  /** Cache key identifiers */
  keys: string[];
}

/**
 * Branch context information
 * @example { "hasData": true, "repositoryCount": 3 }
 */
export interface BranchContextInfo {
  /** Whether branch context data exists */
  hasData: boolean;
  /** Number of repositories with branch context */
  repositoryCount: number;
}

/**
 * Staging ground cache information
 * @example { "count": 2, "keys": ["sgex_staging_user_repo_main"] }
 */
export interface StagingGroundInfo {
  /** Number of staging grounds */
  count: number;
  /** Staging ground key identifiers */
  keys: string[];
}

/**
 * Other SGEX cache information
 * @example { "count": 1, "keys": ["sgex_user_preferences"] }
 */
export interface OtherCacheInfo {
  /** Number of other cache items */
  count: number;
  /** Other cache key identifiers */
  keys: string[];
}

/**
 * Complete cache information
 * @example { "repositoryCache": { "count": 5 }, "stagingGround": { "count": 2 } }
 */
export interface CacheInfo {
  /** Repository cache info */
  repositoryCache: RepositoryCacheInfo;
  /** Branch context info */
  branchContext: BranchContextInfo;
  /** Staging ground info */
  stagingGround: StagingGroundInfo;
  /** Other cache info */
  other: OtherCacheInfo;
}

/**
 * Uncommitted work information
 * @example { "repository": "user/repo", "branch": "main", "fileCount": 3, "lastModified": "2025-10-15T10:00:00Z" }
 */
export interface UncommittedWork {
  /** Repository identifier (owner/repo format) */
  repository: string;
  /** Branch name */
  branch: string;
  /** Number of files with uncommitted changes */
  fileCount: number;
  /** Last modification timestamp */
  lastModified: Date | null;
  /** Commit message if any */
  message: string;
}

/**
 * Cache Management Service class
 * 
 * Provides centralized cache management for the application.
 * 
 * @openapi
 * components:
 *   schemas:
 *     CacheInfo:
 *       type: object
 *       properties:
 *         repositoryCache:
 *           type: object
 *           properties:
 *             count:
 *               type: number
 *             keys:
 *               type: array
 *               items:
 *                 type: string
 *     UncommittedWork:
 *       type: object
 *       properties:
 *         repository:
 *           type: string
 *         branch:
 *           type: string
 *         fileCount:
 *           type: number
 *         lastModified:
 *           type: string
 *           format: date-time
 */
class CacheManagementService {
  private logger: ReturnType<typeof logger.getLogger>;

  constructor() {
    this.logger = logger.getLogger('CacheManagementService');
  }

  /**
   * Clear all application cache and local context
   * This includes:
   * - Repository cache (localStorage)
   * - Branch context (sessionStorage) 
   * - Staging ground data (localStorage)
   * - Any other SGEX-related local storage
   * 
   * @openapi
   * /api/cache/clear-all:
   *   post:
   *     summary: Clear all application cache
   *     responses:
   *       200:
   *         description: Cache cleared successfully
   *         content:
   *           application/json:
 *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   */
  clearAllCache(): boolean {
    try {
      this.logger.info('Starting complete cache clear operation');
      
      // Clear repository cache
      const repoCacheCleared = repositoryCacheService.clearAllCaches();
      this.logger.debug('Repository cache cleared', { success: repoCacheCleared });

      // Clear branch context
      branchContextService.clearAllBranchContext();
      this.logger.debug('Branch context cleared');

      // Clear staging ground data
      this.clearAllStagingGrounds();
      this.logger.debug('Staging ground data cleared');

      // Clear any other SGEX-related localStorage items
      this.clearOtherSGEXData();
      this.logger.debug('Other SGEX data cleared');

      this.logger.info('Complete cache clear operation completed successfully');
      return true;
    } catch (error) {
      this.logger.error('Error during cache clear operation', { 
        error: error instanceof Error ? error.message : String(error)
      });
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Clear all staging ground data across repositories and branches
   */
  clearAllStagingGrounds(): boolean {
    try {
      // Find all staging ground keys in localStorage
      const keys = Object.keys(localStorage);
      const stagingKeys = keys.filter(key => key.startsWith('sgex_staging_'));
      
      stagingKeys.forEach(key => {
        localStorage.removeItem(key);
        this.logger.debug('Removed staging ground', { key });
      });

      // Also clear staging ground history
      const historyKeys = keys.filter(key => key.startsWith('sgex_staging_history_'));
      historyKeys.forEach(key => {
        localStorage.removeItem(key);
        this.logger.debug('Removed staging ground history', { key });
      });

      return true;
    } catch (error) {
      this.logger.error('Error clearing staging grounds', { 
        error: error instanceof Error ? error.message : String(error)
      });
      console.warn('Error clearing staging grounds:', error);
      return false;
    }
  }

  /**
   * Clear other SGEX-related data that might be stored
   */
  clearOtherSGEXData(): boolean {
    try {
      const keys = Object.keys(localStorage);
      const sgexKeys = keys.filter(key => 
        key.startsWith('sgex_') && 
        !key.startsWith('sgex_repo_cache_') && 
        !key.startsWith('sgex_staging_')
      );
      
      sgexKeys.forEach(key => {
        localStorage.removeItem(key);
        this.logger.debug('Removed other SGEX data', { key });
      });

      // Also check sessionStorage for SGEX data (excluding branch context which is handled separately)
      const sessionKeys = Object.keys(sessionStorage);
      const sgexSessionKeys = sessionKeys.filter(key => 
        key.startsWith('sgex_') && key !== 'sgex_branch_context'
      );
      
      sgexSessionKeys.forEach(key => {
        sessionStorage.removeItem(key);
        this.logger.debug('Removed SGEX session data', { key });
      });

      return true;
    } catch (error) {
      this.logger.error('Error clearing other SGEX data', { 
        error: error instanceof Error ? error.message : String(error)
      });
      console.warn('Error clearing other SGEX data:', error);
      return false;
    }
  }

  /**
   * Get information about current cache usage
   * Useful for debugging and showing users what will be cleared
   * 
   * @openapi
   * /api/cache/info:
   *   get:
   *     summary: Get cache information
   *     responses:
   *       200:
   *         description: Cache information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CacheInfo'
   */
  getCacheInfo(): CacheInfo | null {
    try {
      const info: CacheInfo = {
        repositoryCache: {
          count: 0,
          keys: []
        },
        branchContext: {
          hasData: false,
          repositoryCount: 0
        },
        stagingGround: {
          count: 0,
          keys: []
        },
        other: {
          count: 0,
          keys: []
        }
      };

      // Check localStorage
      const localKeys = Object.keys(localStorage);
      
      // Repository cache
      info.repositoryCache.keys = localKeys.filter(key => key.startsWith('sgex_repo_cache_'));
      info.repositoryCache.count = info.repositoryCache.keys.length;

      // Staging ground
      info.stagingGround.keys = localKeys.filter(key => 
        key.startsWith('sgex_staging_') || key.startsWith('sgex_staging_history_')
      );
      info.stagingGround.count = info.stagingGround.keys.length;

      // Other SGEX data
      info.other.keys = localKeys.filter(key => 
        key.startsWith('sgex_') && 
        !key.startsWith('sgex_repo_cache_') && 
        !key.startsWith('sgex_staging_')
      );
      info.other.count = info.other.keys.length;

      // Check sessionStorage for branch context
      try {
        const branchContext = sessionStorage.getItem('sgex_branch_context');
        if (branchContext) {
          const parsed = JSON.parse(branchContext);
          info.branchContext.hasData = true;
          info.branchContext.repositoryCount = Object.keys(parsed).length;
        }
      } catch (e) {
        // Ignore parsing errors
      }

      return info;
    } catch (error) {
      this.logger.error('Error getting cache info', { 
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Check if there's any uncommitted work that would be lost
   * Returns information about staging grounds with unsaved changes
   * 
   * @openapi
   * /api/cache/uncommitted-work:
   *   get:
   *     summary: Get uncommitted work information
   *     responses:
   *       200:
   *         description: Uncommitted work list
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/UncommittedWork'
   */
  getUncommittedWork(): UncommittedWork[] {
    try {
      const uncommittedWork: UncommittedWork[] = [];
      const keys = Object.keys(localStorage);
      const stagingKeys = keys.filter(key => key.startsWith('sgex_staging_') && !key.includes('_history_'));
      
      stagingKeys.forEach(key => {
        try {
          const dataStr = localStorage.getItem(key);
          if (!dataStr) return;
          
          const data = JSON.parse(dataStr);
          if (data && data.files && data.files.length > 0) {
            // Extract repository and branch from key
            const keyParts = key.replace('sgex_staging_', '').split('_');
            const branch = keyParts.pop() || '';
            const repository = keyParts.join('_');
            
            uncommittedWork.push({
              repository,
              branch,
              fileCount: data.files.length,
              lastModified: data.timestamp ? new Date(data.timestamp) : null,
              message: data.message || ''
            });
          }
        } catch (e) {
          // Skip invalid entries
        }
      });

      return uncommittedWork;
    } catch (error) {
      this.logger.error('Error checking uncommitted work', { 
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }
}

// Export singleton instance
const cacheManagementService = new CacheManagementService();
export default cacheManagementService;
