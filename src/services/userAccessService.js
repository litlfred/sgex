/**
 * User Access Service
 * 
 * Manages user types and access levels throughout the SGEX Workbench.
 * Supports three user types: authenticated, unauthenticated, and demo users.
 */

import githubService from './githubService';
import logger from '../utils/logger';

/**
 * User types supported by the access framework
 */
export const USER_TYPES = {
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated'
};

/**
 * Access levels for different operations
 */
export const ACCESS_LEVELS = {
  READ: 'read',
  WRITE: 'write',
  NONE: 'none'
};

class UserAccessService {
  constructor() {
    this.logger = logger.getLogger('UserAccessService');
    this.currentUser = null;
    this.userType = USER_TYPES.UNAUTHENTICATED;
    this.permissions = new Map();
    this.listeners = new Set();
  }

  /**
   * Initialize user access service
   */
  async initialize() {
    this.logger.info('Initializing user access service');
    await this.detectUserType();
    this.notifyListeners();
  }

  /**
   * Detect current user type based on authentication state
   */
  async detectUserType() {
    try {
      if (githubService.isAuth()) {
        this.userType = USER_TYPES.AUTHENTICATED;
        this.currentUser = await githubService.getCurrentUser();
      } else {
        this.userType = USER_TYPES.UNAUTHENTICATED;
        this.currentUser = null;
      }

      this.logger.info('User type detected', { 
        userType: this.userType, 
        hasUser: !!this.currentUser 
      });
    } catch (error) {
      this.logger.error('Error detecting user type', { error: error.message });
      // Fallback to unauthenticated
      this.userType = USER_TYPES.UNAUTHENTICATED;
      this.currentUser = null;
    }
  }



  /**
   * Get current user type
   */
  getUserType() {
    return this.userType;
  }

  /**
   * Get current user information
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.userType === USER_TYPES.AUTHENTICATED;
  }

  /**
   * Check if user is unauthenticated
   */
  isUnauthenticated() {
    return this.userType === USER_TYPES.UNAUTHENTICATED;
  }

  /**
   * Get access level for a specific repository and operation
   */
  async getRepositoryAccess(owner, repo, branch = 'main') {
    const cacheKey = `${owner}/${repo}/${branch}`;
    
    // Check cache first
    if (this.permissions.has(cacheKey)) {
      return this.permissions.get(cacheKey);
    }

    let access = ACCESS_LEVELS.NONE;

    try {
      if (this.userType === USER_TYPES.UNAUTHENTICATED) {
        // Unauthenticated users only get read access to public repos
        access = ACCESS_LEVELS.READ;
      } else if (this.userType === USER_TYPES.AUTHENTICATED) {
        // Authenticated users get access based on GitHub permissions
        const hasReadAccess = await this.checkGitHubReadAccess(owner, repo);
        const hasWriteAccess = await this.checkGitHubWriteAccess(owner, repo);
        
        if (hasWriteAccess) {
          access = ACCESS_LEVELS.WRITE;
        } else if (hasReadAccess) {
          access = ACCESS_LEVELS.READ;
        }
      }
    } catch (error) {
      this.logger.error('Error checking repository access', { 
        owner, repo, branch, error: error.message 
      });
      // Default to read access on error for better UX
      access = ACCESS_LEVELS.READ;
    }

    // Cache the result
    this.permissions.set(cacheKey, access);
    
    this.logger.debug('Repository access determined', { 
      owner, repo, branch, access, userType: this.userType 
    });

    return access;
  }



  /**
   * Check GitHub read access for authenticated users
   */
  async checkGitHubReadAccess(owner, repo) {
    try {
      await githubService.getRepository(owner, repo);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check GitHub write access for authenticated users
   */
  async checkGitHubWriteAccess(owner, repo) {
    try {
      return await githubService.hasRepositoryWriteAccess(owner, repo);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user can save to GitHub for a specific repository
   */
  async canSaveToGitHub(owner, repo, branch = 'main') {
    // Only authenticated users can have GitHub write access
    if (this.userType !== USER_TYPES.AUTHENTICATED) {
      return false;
    }

    const access = await this.getRepositoryAccess(owner, repo, branch);
    return access === ACCESS_LEVELS.WRITE;
  }

  /**
   * Check if user can save to local storage (staging ground)
   */
  canSaveLocal() {
    // All user types can save to local storage
    return true;
  }

  /**
   * Get UI behavior configuration for current user type
   */
  getUIBehavior() {
    const behavior = {
      showEditFeatures: true,
      showSaveToGitHub: true,
      showSaveLocal: true,
      confirmBeforeSave: true,
      allowCreateNew: true,
      showAccessBadges: true
    };

    switch (this.userType) {
      case USER_TYPES.UNAUTHENTICATED:
        return {
          ...behavior,
          showEditFeatures: false,
          showSaveToGitHub: false,
          allowCreateNew: false
        };
      
      case USER_TYPES.AUTHENTICATED:
        return behavior;
      
      default:
        return {
          ...behavior,
          showEditFeatures: false,
          showSaveToGitHub: false,
          allowCreateNew: false
        };
    }
  }

  /**
   * Get access badge information for a repository
   */
  async getAccessBadge(owner, repo, branch = 'main') {
    const access = await this.getRepositoryAccess(owner, repo, branch);
    
    const badges = {
      [ACCESS_LEVELS.WRITE]: {
        text: 'Write Access',
        icon: '✏️',
        color: 'green',
        description: 'You can edit and save changes to this repository'
      },
      [ACCESS_LEVELS.READ]: {
        text: 'Read Only',
        icon: '👁️',
        color: 'blue', 
        description: 'You can view this repository but cannot save changes'
      },
      [ACCESS_LEVELS.NONE]: {
        text: 'No Access',
        icon: '🚫',
        color: 'red',
        description: 'You do not have access to this repository'
      }
    };

    return badges[access] || badges[ACCESS_LEVELS.NONE];
  }



  /**
   * Clear cached permissions
   */
  clearPermissionsCache() {
    this.permissions.clear();
    this.logger.debug('Permissions cache cleared');
  }

  /**
   * Add listener for user access changes
   */
  addListener(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    const accessState = {
      userType: this.userType,
      currentUser: this.currentUser,
      isAuthenticated: this.isAuthenticated(),
      uiBehavior: this.getUIBehavior()
    };

    this.listeners.forEach(callback => {
      try {
        callback(accessState);
      } catch (error) {
        this.logger.error('Error in access service listener', { error: error.message });
      }
    });
  }

  /**
   * Handle authentication state changes
   */
  handleAuthChange() {
    this.clearPermissionsCache();
    this.initialize();
  }
}

// Create singleton instance
const userAccessService = new UserAccessService();

export default userAccessService;