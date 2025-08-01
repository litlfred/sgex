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
  UNAUTHENTICATED: 'unauthenticated', 
  DEMO: 'demo'
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
        // Check if this is a demo user (has demo DAKs configured)
        const isDemoUser = this.checkIfDemoUser();
        
        if (isDemoUser) {
          this.userType = USER_TYPES.DEMO;
          this.currentUser = await this.createDemoUser();
        } else {
          this.userType = USER_TYPES.AUTHENTICATED;
          this.currentUser = await githubService.getCurrentUser();
        }
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
   * Check if current authenticated user should be treated as demo user
   */
  checkIfDemoUser() {
    // Demo users are determined by having access to demo DAKs
    // This can be configured via localStorage or environment variables
    const demoMode = localStorage.getItem('sgex_demo_mode');
    const envDemoMode = process.env.REACT_APP_DEMO_MODE;
    
    return demoMode === 'true' || envDemoMode === 'true';
  }

  /**
   * Create demo user object with demo data
   */
  async createDemoUser() {
    try {
      const realUser = await githubService.getCurrentUser();
      return {
        ...realUser,
        isDemo: true,
        demoData: this.getDemoData()
      };
    } catch (error) {
      // If we can't get real user, create a synthetic demo user
      return {
        login: 'demo-user',
        name: 'Demo User',
        avatar_url: '/sgex-mascot-tabby.svg',
        type: 'User',
        isDemo: true,
        demoData: this.getDemoData()
      };
    }
  }

  /**
   * Get demo data and DAKs
   */
  getDemoData() {
    return {
      daks: [
        {
          owner: 'WHO',
          repo: 'smart-anc',
          name: 'Smart Antenatal Care',
          description: 'Demo DAK for antenatal care guidelines'
        },
        {
          owner: 'WHO', 
          repo: 'smart-tb',
          name: 'Smart Tuberculosis',
          description: 'Demo DAK for tuberculosis care guidelines'
        }
      ],
      sampleAssets: {
        'input/vocabulary/ValueSet-anc-care-codes.json': {
          type: 'ValueSet',
          description: 'Demo value set for antenatal care'
        }
      }
    };
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
   * Check if user is authenticated (includes demo users)
   */
  isAuthenticated() {
    return this.userType === USER_TYPES.AUTHENTICATED || this.userType === USER_TYPES.DEMO;
  }

  /**
   * Check if user is in demo mode
   */
  isDemoUser() {
    return this.userType === USER_TYPES.DEMO;
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
      } else if (this.userType === USER_TYPES.DEMO) {
        // Demo users get read access to demo DAKs, but no write access
        const isDemoDAK = this.isDemoDAK(owner, repo);
        access = isDemoDAK ? ACCESS_LEVELS.READ : ACCESS_LEVELS.NONE;
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
   * Check if a repository is a demo DAK
   */
  isDemoDAK(owner, repo) {
    if (!this.currentUser?.demoData?.daks) {
      return false;
    }
    
    return this.currentUser.demoData.daks.some(dak => 
      dak.owner === owner && dak.repo === repo
    );
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
    // Demo users and unauthenticated users never have GitHub write access
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
      
      case USER_TYPES.DEMO:
        return {
          ...behavior,
          showSaveToGitHub: false, // Demo users see the UI but get blocked at save
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
   * Enable demo mode for current user
   */
  enableDemoMode() {
    localStorage.setItem('sgex_demo_mode', 'true');
    this.initialize(); // Re-initialize to update user type
  }

  /**
   * Disable demo mode
   */
  disableDemoMode() {
    localStorage.removeItem('sgex_demo_mode');
    this.initialize(); // Re-initialize to update user type
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
      isDemoUser: this.isDemoUser(),
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