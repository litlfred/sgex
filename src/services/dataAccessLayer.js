/**
 * Data Access Layer
 * 
 * Comprehensive service that integrates user access, staging ground, and GitHub
 * for a unified asset management experience across all user types.
 */

import userAccessService from './userAccessService';
import stagingGroundService from './stagingGroundService';
import githubService from './githubService';
import logger from '../utils/logger';

/**
 * Save targets for asset operations
 */
export const SAVE_TARGETS = {
  LOCAL: 'local',
  GITHUB: 'github'
};

/**
 * Asset operation results
 */
export const OPERATION_RESULTS = {
  SUCCESS: 'success',
  ERROR: 'error',
  PERMISSION_DENIED: 'permission_denied'
};

class DataAccessLayer {
  constructor() {
    this.logger = logger.getLogger('DataAccessLayer');
    this.pendingOperations = new Map();
    this.assetCache = new Map();
  }

  /**
   * Initialize data access layer
   */
  async initialize(repository, branch) {
    this.logger.info('Initializing data access layer', { 
      repository: repository?.full_name, 
      branch 
    });
    
    // Initialize staging ground for the repository
    stagingGroundService.initialize(repository, branch);
    
    // Initialize user access service if not already done
    await userAccessService.initialize();
  }

  /**
   * Get asset content from GitHub or local storage
   */
  async getAsset(owner, repo, branch, assetPath) {
    const cacheKey = `${owner}/${repo}/${branch}/${assetPath}`;
    
    try {
      // Check if user has read access
      const access = await userAccessService.getRepositoryAccess(owner, repo, branch);
      if (access === 'none') {
        throw new Error('No access to this repository');
      }

      // First, check if there's a local version in staging ground
      const stagingGround = stagingGroundService.getStagingGround();
      const localFile = stagingGround.files.find(f => f.path === assetPath);
      
      if (localFile) {
        this.logger.debug('Asset loaded from staging ground', { assetPath });
        return {
          content: localFile.content,
          source: 'local',
          metadata: localFile.metadata,
          hasLocalChanges: true
        };
      }

      // If no local version, get from GitHub
      const content = await githubService.getFileContent(owner, repo, assetPath, branch);

      // Cache the content
      this.assetCache.set(cacheKey, content);

      this.logger.debug('Asset loaded from GitHub', { assetPath, source: 'github' });
      return {
        content,
        source: 'github',
        hasLocalChanges: false
      };

    } catch (error) {
      this.logger.error('Error getting asset', { 
        owner, repo, branch, assetPath, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Save asset to local storage (staging ground)
   */
  async saveAssetLocal(assetPath, content, metadata = {}) {
    try {
      const userType = userAccessService.getUserType();
      
      // All user types can save to local storage
      const success = stagingGroundService.updateFile(assetPath, content, {
        ...metadata,
        savedBy: userType,
        saveTarget: SAVE_TARGETS.LOCAL
      });

      if (success) {
        this.logger.info('Asset saved to local storage', { assetPath, userType });
        return {
          result: OPERATION_RESULTS.SUCCESS,
          message: 'Changes saved to local staging area',
          target: SAVE_TARGETS.LOCAL
        };
      } else {
        throw new Error('Failed to save to local storage');
      }

    } catch (error) {
      this.logger.error('Error saving asset locally', { assetPath, error: error.message });
      return {
        result: OPERATION_RESULTS.ERROR,
        message: `Failed to save locally: ${error.message}`,
        target: SAVE_TARGETS.LOCAL
      };
    }
  }

  /**
   * Save asset to GitHub
   */
  async saveAssetGitHub(owner, repo, branch, assetPath, content, commitMessage, metadata = {}) {
    try {
      const userType = userAccessService.getUserType();
      
      // Check if user can save to GitHub
      const canSave = await userAccessService.canSaveToGitHub(owner, repo, branch);
      
      if (!canSave) {
        if (userType === 'unauthenticated') {
          return {
            result: OPERATION_RESULTS.PERMISSION_DENIED,
            message: 'Please authenticate to save changes to GitHub.',
            target: SAVE_TARGETS.GITHUB
          };
        } else {
          return {
            result: OPERATION_RESULTS.PERMISSION_DENIED,
            message: 'You do not have write access to this repository.',
            target: SAVE_TARGETS.GITHUB
          };
        }
      }

      // For authenticated users with write access, save to GitHub
      const result = await githubService.updateFileContent(
        owner, 
        repo, 
        assetPath, 
        content, 
        commitMessage, 
        branch
      );

      if (result.success) {
        // Remove from staging ground since it's now committed
        stagingGroundService.removeFile(assetPath);
        
        // Clear cache
        const cacheKey = `${owner}/${repo}/${branch}/${assetPath}`;
        this.assetCache.delete(cacheKey);

        this.logger.info('Asset saved to GitHub', { 
          owner, repo, branch, assetPath, commit: result.data?.commit?.sha 
        });

        return {
          result: OPERATION_RESULTS.SUCCESS,
          message: 'Changes successfully committed to GitHub',
          target: SAVE_TARGETS.GITHUB,
          commitSha: result.data?.commit?.sha,
          commitUrl: result.data?.commit?.html_url
        };
      } else {
        throw new Error(result.error || 'GitHub commit failed');
      }

    } catch (error) {
      this.logger.error('Error saving asset to GitHub', { 
        owner, repo, branch, assetPath, error: error.message 
      });
      
      return {
        result: OPERATION_RESULTS.ERROR,
        message: `Failed to save to GitHub: ${error.message}`,
        target: SAVE_TARGETS.GITHUB
      };
    }
  }



  /**
   * Get save options for current user and asset
   */
  async getSaveOptions(owner, repo, branch) {
    const userType = userAccessService.getUserType();
    const canSaveGitHub = await userAccessService.canSaveToGitHub(owner, repo, branch);
    const canSaveLocal = userAccessService.canSaveLocal();
    const uiBehavior = userAccessService.getUIBehavior();

    return {
      canSaveLocal,
      canSaveGitHub,
      showSaveLocal: uiBehavior.showSaveLocal,
      showSaveGitHub: uiBehavior.showSaveToGitHub,
      confirmBeforeSave: uiBehavior.confirmBeforeSave,
      userType,
      restrictions: this.getSaveRestrictions(userType, canSaveGitHub)
    };
  }

  /**
   * Get save restrictions and messaging for user type
   */
  getSaveRestrictions(userType, canSaveGitHub) {
    switch (userType) {
      case 'unauthenticated':
        return {
          localMessage: 'Changes will be saved to your browser only',
          githubMessage: 'Please authenticate to save to GitHub',
          githubDisabled: true
        };
      
      case 'demo':
        return {
          localMessage: 'Changes will be saved to your browser only',
          githubMessage: 'Demo users cannot save to GitHub',
          githubDisabled: true
        };
      
      case 'authenticated':
        if (canSaveGitHub) {
          return {
            localMessage: 'Save changes to staging area',
            githubMessage: 'Commit changes to GitHub repository',
            githubDisabled: false
          };
        } else {
          return {
            localMessage: 'Changes will be saved to your browser only',
            githubMessage: 'You do not have write access to this repository',
            githubDisabled: true
          };
        }
      
      default:
        return {
          localMessage: 'Local saves only',
          githubMessage: 'GitHub saves not available',
          githubDisabled: true
        };
    }
  }

  /**
   * Get staging ground status
   */
  getStagingGroundStatus() {
    return stagingGroundService.getStatus();
  }

  /**
   * Clear staging ground
   */
  clearStagingGround() {
    return stagingGroundService.clearStagingGround();
  }

  /**
   * Get changed files in staging ground
   */
  getChangedFiles() {
    const stagingGround = stagingGroundService.getStagingGround();
    return stagingGround.files;
  }

  /**
   * Check if asset has local changes
   */
  hasLocalChanges(assetPath) {
    const stagingGround = stagingGroundService.getStagingGround();
    return stagingGround.files.some(f => f.path === assetPath);
  }

  /**
   * Create new asset (when supported by user type)
   */
  async createAsset(owner, repo, branch, assetPath, initialContent = '', metadata = {}) {
    const uiBehavior = userAccessService.getUIBehavior();
    
    if (!uiBehavior.allowCreateNew) {
      throw new Error('Current user type cannot create new assets');
    }

    // Save as local first
    return this.saveAssetLocal(assetPath, initialContent, {
      ...metadata,
      isNew: true,
      createdAt: Date.now()
    });
  }

  /**
   * Batch operations for multiple assets
   */
  async batchSaveLocal(assets) {
    const results = [];
    
    for (const asset of assets) {
      const result = await this.saveAssetLocal(
        asset.path, 
        asset.content, 
        asset.metadata
      );
      results.push({ ...result, path: asset.path });
    }

    return {
      success: results.every(r => r.result === OPERATION_RESULTS.SUCCESS),
      results
    };
  }

  /**
   * Get access information for current context
   */
  async getAccessInfo(owner, repo, branch) {
    const [access, badge, saveOptions] = await Promise.all([
      userAccessService.getRepositoryAccess(owner, repo, branch),
      userAccessService.getAccessBadge(owner, repo, branch),
      this.getSaveOptions(owner, repo, branch)
    ]);

    return {
      access,
      badge,
      saveOptions,
      userType: userAccessService.getUserType()
    };
  }
}

// Create singleton instance
const dataAccessLayer = new DataAccessLayer();

export default dataAccessLayer;