import { lazyLoadOctokit } from '@sgex/utils';

export interface GitHubAuthResult {
  success: boolean;
  tokenType?: 'classic' | 'fine-grained' | 'oauth';
  user?: any;
  error?: string;
}

export interface TokenPermissions {
  type: string;
  user: any;
}

export interface SecureTokenStorage {
  storeToken: (token: string) => boolean;
  retrieveToken: () => { token: string; type: string; expires: number } | null;
  hasValidToken: () => boolean;
  getTokenInfo: () => any;
  clearToken: () => void;
  migrateLegacyToken: () => boolean;
  validateTokenFormat: (token: string) => { isValid: boolean; token?: string; type?: string; reason?: string };
  maskToken: (token: string) => string;
}

/**
 * GitHub Authentication Service
 * 
 * Handles GitHub token authentication, permissions, and session management.
 * Supports both Personal Access Tokens (classic/fine-grained) and OAuth tokens.
 */
export class GitHubAuthenticationService {
  private octokit: any = null;
  private isAuthenticated: boolean = false;
  private permissions: TokenPermissions | null = null;
  private tokenType: string | null = null;
  private secureTokenStorage: SecureTokenStorage;

  constructor(secureTokenStorage: SecureTokenStorage) {
    this.secureTokenStorage = secureTokenStorage;
  }

  /**
   * Create Octokit instance with lazy loading
   */
  async createOctokitInstance(auth: string | null = null): Promise<any> {
    const Octokit = await lazyLoadOctokit();
    return new Octokit(auth ? { auth } : {});
  }

  /**
   * Authenticate with GitHub token
   */
  async authenticate(token: string): Promise<GitHubAuthResult> {
    const startTime = Date.now();
    
    try {
      // Validate token format
      const validation = this.secureTokenStorage.validateTokenFormat(token);
      if (!validation.isValid) {
        this.isAuthenticated = false;
        return {
          success: false,
          error: validation.reason || 'Invalid token format'
        };
      }

      // Create Octokit instance
      this.octokit = await this.createOctokitInstance(validation.token);
      this.isAuthenticated = true;
      this.tokenType = validation.type || null;
      
      // Store token securely
      const stored = this.secureTokenStorage.storeToken(validation.token!);
      if (!stored) {
        console.warn('Failed to store token securely, authentication will not persist');
      }
      
      return {
        success: true,
        tokenType: this.tokenType as any
      };
    } catch (error) {
      this.isAuthenticated = false;
      this.secureTokenStorage.clearToken();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Authenticate with existing Octokit instance (OAuth)
   */
  authenticateWithOctokit(octokitInstance: any): GitHubAuthResult {
    try {
      this.octokit = octokitInstance;
      this.isAuthenticated = true;
      this.tokenType = 'oauth';
      
      return {
        success: true,
        tokenType: 'oauth'
      };
    } catch (error) {
      this.isAuthenticated = false;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth authentication failed'
      };
    }
  }

  /**
   * Initialize from stored token
   */
  async initializeFromStoredToken(): Promise<boolean> {
    try {
      // Migrate legacy tokens if needed
      const migrated = this.secureTokenStorage.migrateLegacyToken();
      
      // Retrieve token from secure storage
      const tokenData = this.secureTokenStorage.retrieveToken();
      if (!tokenData) {
        return false;
      }

      // Initialize Octokit
      this.octokit = await this.createOctokitInstance(tokenData.token);
      this.isAuthenticated = true;
      this.tokenType = tokenData.type;
      
      return true;
    } catch (error) {
      this.isAuthenticated = false;
      this.secureTokenStorage.clearToken();
      return false;
    }
  }

  /**
   * Check if authenticated
   */
  isAuth(): boolean {
    return this.isAuthenticated && this.octokit !== null;
  }

  /**
   * Get Octokit instance
   */
  getOctokit(): any {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }
    return this.octokit;
  }

  /**
   * Check token permissions
   */
  async checkTokenPermissions(): Promise<TokenPermissions> {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      // Get user info
      const response = await this.octokit.request('GET /user');
      
      // Try to determine token type from rate limit
      try {
        const rateLimit = await this.octokit.rest.rateLimit.get();
        this.tokenType = rateLimit.data.resources.core ? 'classic' : 'fine-grained';
      } catch (rateLimitError) {
        this.tokenType = 'unknown';
      }

      const permissions = {
        type: this.tokenType || 'unknown',
        user: response.data
      };
      
      this.permissions = permissions;
      return permissions;
    } catch (error) {
      throw new Error(`Failed to check token permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if there's a valid stored token
   */
  hasStoredToken(): boolean {
    return this.secureTokenStorage.hasValidToken();
  }

  /**
   * Get stored token information
   */
  getStoredTokenInfo(): any {
    return this.secureTokenStorage.getTokenInfo();
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const response = await this.octokit.rest.users.getAuthenticated();
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Logout and clear authentication
   */
  logout(): void {
    this.octokit = null;
    this.isAuthenticated = false;
    this.permissions = null;
    this.tokenType = null;
    this.secureTokenStorage.clearToken();
  }

  /**
   * Get token type
   */
  getTokenType(): string | null {
    return this.tokenType;
  }

  /**
   * Get permissions
   */
  getPermissions(): TokenPermissions | null {
    return this.permissions;
  }
}