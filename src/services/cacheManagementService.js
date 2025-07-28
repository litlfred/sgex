/**
 * Cache Management Service
 * 
 * Centralized service for managing all application cache and local storage
 * including repository cache, branch context, staging ground, and user data
 */

import repositoryCacheService from './repositoryCacheService';
import branchContextService from './branchContextService';
import logger from '../utils/logger';

class CacheManagementService {
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
   */
  clearAllCache() {
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
      this.logger.error('Error during cache clear operation', { error: error.message });
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Clear all staging ground data across repositories and branches
   */
  clearAllStagingGrounds() {
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
      this.logger.error('Error clearing staging grounds', { error: error.message });
      console.warn('Error clearing staging grounds:', error);
      return false;
    }
  }

  /**
   * Clear other SGEX-related data that might be stored
   */
  clearOtherSGEXData() {
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
      this.logger.error('Error clearing other SGEX data', { error: error.message });
      console.warn('Error clearing other SGEX data:', error);
      return false;
    }
  }

  /**
   * Get information about current cache usage
   * Useful for debugging and showing users what will be cleared
   */
  getCacheInfo() {
    try {
      const info = {
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
      this.logger.error('Error getting cache info', { error: error.message });
      return null;
    }
  }

  /**
   * Check if there's any uncommitted work that would be lost
   * Returns information about staging grounds with unsaved changes
   */
  getUncommittedWork() {
    try {
      const uncommittedWork = [];
      const keys = Object.keys(localStorage);
      const stagingKeys = keys.filter(key => key.startsWith('sgex_staging_') && !key.includes('_history_'));
      
      stagingKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.files && data.files.length > 0) {
            // Extract repository and branch from key
            const keyParts = key.replace('sgex_staging_', '').split('_');
            const branch = keyParts.pop();
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
      this.logger.error('Error checking uncommitted work', { error: error.message });
      return [];
    }
  }
}

// Export singleton instance
const cacheManagementService = new CacheManagementService();
export default cacheManagementService;