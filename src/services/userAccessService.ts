/**
 * User Access Service
 * 
 * Manages user types and access levels throughout the SGEX Workbench.
 * Supports three user types: authenticated, unauthenticated, and demo users.
 * 
 * @module userAccessService
 */

import githubService from './githubService';
import logger from '../utils/logger';

/**
 * User type enumeration
 * @example "authenticated"
 */
export type UserType = 'authenticated' | 'unauthenticated';

/**
 * Access level enumeration
 * @example "write"
 */
export type AccessLevel = 'read' | 'write' | 'none';

/**
 * User types supported by the access framework
 */
export const USER_TYPES: Record<string, UserType> = {
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated'
} as const;

/**
 * Access levels for different operations
 */
export const ACCESS_LEVELS: Record<string, AccessLevel> = {
  READ: 'read',
  WRITE: 'write',
  NONE: 'none'
} as const;

/**
 * GitHub user information
 * @example { "login": "octocat", "id": 1, "avatar_url": "https://avatars.githubusercontent.com/u/1" }
 */
export interface GitHubUser {
  /** GitHub username */
  login: string;
  /** User ID */
  id: number;
  /** Avatar URL */
  avatar_url?: string;
  /** User email */
  email?: string;
  /** Display name */
  name?: string;
}

/**
 * Access badge information for UI display
 * @example { "text": "Write Access", "icon": "✏️", "color": "green", "description": "You can edit and save" }
 */
export interface AccessBadge {
  /** Badge text */
  text: string;
  /** Badge icon */
  icon: string;
  /** Badge color */
  color: string;
  /** Badge description */
  description: string;
}

/**
 * UI behavior configuration based on user type
 * @example { "showEditFeatures": true, "showSaveToGitHub": true, "showSaveLocal": true }
 */
export interface UIBehavior {
  /** Show edit features in UI */
  showEditFeatures: boolean;
  /** Show save to GitHub button */
  showSaveToGitHub: boolean;
  /** Show save local button */
  showSaveLocal: boolean;
  /** Confirm before save */
  confirmBeforeSave: boolean;
  /** Allow creating new items */
  allowCreateNew: boolean;
  /** Show access badges */
  showAccessBadges: boolean;
}

/**
 * Access state snapshot for listeners
 * @example { "userType": "authenticated", "isAuthenticated": true }
 */
export interface AccessState {
  /** Current user type */
  userType: UserType;
  /** Current user information */
  currentUser: GitHubUser | null;
  /** Is user authenticated */
  isAuthenticated: boolean;
  /** UI behavior configuration */
  uiBehavior: UIBehavior;
}

/**
 * Access listener callback function
 */
export type AccessListener = (state: AccessState) => void;

/**
 * Unsubscribe function returned by addListener
 */
export type UnsubscribeFunction = () => void;

/**
 * User Access Service class
 * 
 * Manages user authentication state, permissions, and access control.
 * 
 * @openapi
 * components:
 *   schemas:
 *     UserType:
 *       type: string
 *       enum: [authenticated, unauthenticated]
 *     AccessLevel:
 *       type: string
 *       enum: [read, write, none]
 *     GitHubUser:
 *       type: object
 *       properties:
 *         login:
 *           type: string
 *         id:
 *           type: number
 *         avatar_url:
 *           type: string
 *     AccessState:
 *       type: object
 *       properties:
 *         userType:
 *           $ref: '#/components/schemas/UserType'
 *         currentUser:
 *           $ref: '#/components/schemas/GitHubUser'
 *         isAuthenticated:
 *           type: boolean
 */
class UserAccessService {
  private logger: ReturnType<typeof logger.getLogger>;
  private currentUser: GitHubUser | null;
  private userType: UserType;
  private permissions: Map<string, AccessLevel>;
  private listeners: Set<AccessListener>;

  constructor() {
    this.logger = logger.getLogger('UserAccessService');
    this.currentUser = null;
    this.userType = USER_TYPES.UNAUTHENTICATED;
    this.permissions = new Map();
    this.listeners = new Set();
  }

  /**
   * Initialize user access service
   * 
   * @openapi
   * /api/user-access/initialize:
   *   post:
   *     summary: Initialize user access service
   *     responses:
   *       200:
   *         description: Service initialized
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing user access service');
    await this.detectUserType();
    this.notifyListeners();
  }

  /**
   * Detect current user type based on authentication state
   */
  async detectUserType(): Promise<void> {
    try {
      if (githubService.authenticated) {
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
      this.logger.error('Error detecting user type', { 
        error: error instanceof Error ? error.message : String(error)
      });
      // Fallback to unauthenticated
      this.userType = USER_TYPES.UNAUTHENTICATED;
      this.currentUser = null;
    }
  }

  /**
   * Get current user type
   * 
   * @openapi
   * /api/user-access/type:
   *   get:
   *     summary: Get current user type
   *     responses:
   *       200:
   *         description: User type
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserType'
   */
  getUserType(): UserType {
    return this.userType;
  }

  /**
   * Get current user information
   * 
   * @openapi
   * /api/user-access/current-user:
   *   get:
   *     summary: Get current user information
   *     responses:
   *       200:
   *         description: User information
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GitHubUser'
   */
  getCurrentUser(): GitHubUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.userType === USER_TYPES.AUTHENTICATED;
  }

  /**
   * Check if user is unauthenticated
   */
  isUnauthenticated(): boolean {
    return this.userType === USER_TYPES.UNAUTHENTICATED;
  }

  /**
   * Get access level for a specific repository and operation
   * 
   * @openapi
   * /api/user-access/repository/{owner}/{repo}:
   *   get:
   *     summary: Get repository access level
   *     parameters:
   *       - name: owner
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *       - name: repo
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *       - name: branch
   *         in: query
   *         schema:
   *           type: string
   *           default: main
   *     responses:
   *       200:
   *         description: Access level
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AccessLevel'
   */
  async getRepositoryAccess(owner: string, repo: string, branch: string = 'main'): Promise<AccessLevel> {
    const cacheKey = `${owner}/${repo}/${branch}`;
    
    // Check cache first
    if (this.permissions.has(cacheKey)) {
      return this.permissions.get(cacheKey)!;
    }

    let access: AccessLevel = ACCESS_LEVELS.NONE;

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
        owner, 
        repo, 
        branch, 
        error: error instanceof Error ? error.message : String(error)
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
  private async checkGitHubReadAccess(owner: string, repo: string): Promise<boolean> {
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
  private async checkGitHubWriteAccess(owner: string, repo: string): Promise<boolean> {
    try {
      return await githubService.hasRepositoryWriteAccess(owner, repo);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user can save to GitHub for a specific repository
   */
  async canSaveToGitHub(owner: string, repo: string, branch: string = 'main'): Promise<boolean> {
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
  canSaveLocal(): boolean {
    // All user types can save to local storage
    return true;
  }

  /**
   * Get UI behavior configuration for current user type
   */
  getUIBehavior(): UIBehavior {
    const behavior: UIBehavior = {
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
  async getAccessBadge(owner: string, repo: string, branch: string = 'main'): Promise<AccessBadge> {
    const access = await this.getRepositoryAccess(owner, repo, branch);
    
    const badges: Record<AccessLevel, AccessBadge> = {
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
  clearPermissionsCache(): void {
    this.permissions.clear();
    this.logger.debug('Permissions cache cleared');
  }

  /**
   * Add listener for user access changes
   */
  addListener(callback: AccessListener): UnsubscribeFunction {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    const accessState: AccessState = {
      userType: this.userType,
      currentUser: this.currentUser,
      isAuthenticated: this.isAuthenticated(),
      uiBehavior: this.getUIBehavior()
    };

    this.listeners.forEach(callback => {
      try {
        callback(accessState);
      } catch (error) {
        this.logger.error('Error in access service listener', { 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
  }

  /**
   * Handle authentication state changes
   */
  handleAuthChange(): void {
    this.clearPermissionsCache();
    this.initialize();
  }
}

// Create singleton instance
const userAccessService = new UserAccessService();

export default userAccessService;
