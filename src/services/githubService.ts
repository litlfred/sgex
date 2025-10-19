/**
 * GitHub Service - TypeScript Implementation
 * Provides comprehensive GitHub API integration for SGEX Workbench
 */

import type {
  GitHubUser,
  GitHubRepository,
  AuthenticationState,
  TokenValidationResult,
  TokenFormatValidation,
  GitHubPermissions,
  GitHubRateLimit,
  GitHubApiResponse,
  DAKRepository,
  DAKValidationResult,
  SushiConfig,
  Logger as LoggerType,
  AsyncResult,
  ServiceResponse
} from '../types/core';

import { lazyLoadOctokit } from '../services/libraryLoaderService';
import { processConcurrently } from '../utils/concurrency';
import repositoryCompatibilityCache from '../utils/repositoryCompatibilityCache';
import secureTokenStorage from './secureTokenStorage';
import logger from '../utils/logger';

// Type for Octokit instance (dynamic import)
type OctokitInstance = any;

class GitHubService {
  private octokit: OctokitInstance | null = null;
  private isAuthenticated: boolean = false;
  private permissions: GitHubPermissions | null = null;
  private tokenType: 'classic' | 'fine-grained' | 'oauth' | null = null;
  private readonly logger: LoggerType;

  constructor() {
    this.logger = logger.getLogger('GitHubService');
    this.logger.debug('GitHubService instance created');
  }

  /**
   * Helper method to create Octokit instance with lazy loading
   */
  private async createOctokitInstance(auth: string | null = null): Promise<OctokitInstance> {
    const Octokit = await lazyLoadOctokit();
    return new Octokit(auth ? { auth } : {});
  }

  /**
   * Initialize with a GitHub token (supports both OAuth and PAT tokens)
   */
  async authenticate(token: string): Promise<boolean> {
    const startTime = Date.now();
    this.logger.auth('Starting authentication', {
      tokenProvided: !!token,
      tokenMask: token ? secureTokenStorage.maskToken(token) : 'none'
    });

    try {
      // Validate token format using SecureTokenStorage
      const validation: TokenFormatValidation = secureTokenStorage.validateTokenFormat(token);
      if (!validation.isValid) {
        this.logger.warn('Token validation failed during authentication', {
          reason: validation.reason,
          tokenMask: secureTokenStorage.maskToken(token)
        });
        this.isAuthenticated = false;
        return false;
      }

      // Lazy load Octokit to reduce initial bundle size
      this.octokit = await this.createOctokitInstance(validation.token!);
      this.isAuthenticated = true;
      this.tokenType = validation.type as 'classic' | 'fine-grained';

      // Store token securely
      const stored = secureTokenStorage.storeToken(validation.token!);
      if (!stored) {
        this.logger.warn('Failed to store token securely, authentication will not persist');
      }

      const duration = Date.now() - startTime;
      this.logger.auth('Authentication successful', {
        duration,
        tokenType: this.tokenType,
        tokenMask: secureTokenStorage.maskToken(token),
        securelyStored: stored
      });
      this.logger.performance('GitHub authentication', duration);

      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.auth('Authentication failed', {
        error: error instanceof Error ? error.message : String(error),
        duration,
        tokenMask: secureTokenStorage.maskToken(token)
      });
      console.error('Failed to authenticate with GitHub:', error);
      this.isAuthenticated = false;
      secureTokenStorage.clearToken(); // Clear any partially stored data
      return false;
    }
  }

  /**
   * Initialize with an existing Octokit instance (for OAuth flow)
   */
  authenticateWithOctokit(octokitInstance: OctokitInstance): boolean {
    this.logger.auth('Starting OAuth authentication with Octokit instance');

    try {
      this.octokit = octokitInstance;
      this.isAuthenticated = true;
      this.tokenType = 'oauth';

      this.logger.auth('OAuth authentication successful', { tokenType: this.tokenType });
      return true;
    } catch (error) {
      this.logger.auth('OAuth authentication failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      console.error('Failed to authenticate with Octokit instance:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Initialize authentication from securely stored token
   */
  async initializeFromStoredToken(): Promise<boolean> {
    this.logger.auth('Attempting to initialize from stored token');

    try {
      const storedToken = secureTokenStorage.retrieveToken();
      if (!storedToken) {
        this.logger.auth('No stored token found');
        return false;
      }

      const success = await this.authenticate(storedToken);
      if (success) {
        this.logger.auth('Successfully initialized from stored token');
      } else {
        this.logger.auth('Failed to initialize from stored token, clearing stored data');
        secureTokenStorage.clearToken();
      }

      return success;
    } catch (error) {
      this.logger.auth('Error during stored token initialization', {
        error: error instanceof Error ? error.message : String(error)
      });
      secureTokenStorage.clearToken();
      return false;
    }
  }

  /**
   * Get current authentication state
   */
  getAuthenticationState(): AuthenticationState {
    return {
      isAuthenticated: this.isAuthenticated,
      tokenType: this.tokenType,
      token: this.isAuthenticated ? secureTokenStorage.retrieveToken() || undefined : undefined,
      scopes: [], // Will be populated when we fetch user info
      lastValidated: this.isAuthenticated ? new Date().toISOString() : undefined
    };
  }

  /**
   * Validate current token and get user information
   */
  async validateToken(): Promise<TokenValidationResult> {
    if (!this.isAuthenticated || !this.octokit) {
      return {
        isValid: false,
        tokenType: 'classic'
      };
    }

    const startTime = Date.now();
    this.logger.auth('Validating token');

    try {
      // Get current user information
      const userResponse = await this.octokit.rest.users.getAuthenticated();
      const user: GitHubUser = userResponse.data;

      // Get rate limit information to determine token type
      const rateLimitResponse = await this.octokit.rest.rateLimit.get();
      const rateLimit = rateLimitResponse.data;

      // Determine token type based on rate limit structure
      this.tokenType = rateLimit.resources.core ? 'classic' : 'fine-grained';

      const duration = Date.now() - startTime;
      this.logger.auth('Token validation successful', {
        user: user.login,
        tokenType: this.tokenType,
        duration,
        rateLimit: {
          limit: rateLimit.resources.core?.limit || rateLimit.rate?.limit,
          remaining: rateLimit.resources.core?.remaining || rateLimit.rate?.remaining,
          reset: rateLimit.resources.core?.reset || rateLimit.rate?.reset
        }
      });
      this.logger.performance('GitHub token validation', duration);

      return {
        isValid: true,
        user,
        tokenType: this.tokenType,
        rateLimit: {
          limit: rateLimit.resources.core?.limit || rateLimit.rate?.limit || 0,
          remaining: rateLimit.resources.core?.remaining || rateLimit.rate?.remaining || 0,
          reset: rateLimit.resources.core?.reset || rateLimit.rate?.reset || 0
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.auth('Token validation failed', {
        error: error instanceof Error ? error.message : String(error),
        duration
      });

      // Clear authentication on validation failure
      this.isAuthenticated = false;
      this.octokit = null;
      secureTokenStorage.clearToken();

      return {
        isValid: false,
        tokenType: this.tokenType || 'classic'
      };
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<ServiceResponse<GitHubUser>> {
    if (!this.isAuthenticated || !this.octokit) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }

    try {
      const response = await this.octokit.rest.users.getAuthenticated();
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      this.logger.apiError('GET', '/user', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user'
      };
    }
  }

  /**
   * Get directory contents from a GitHub repository
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param path - Directory path (defaults to root '')
   * @param ref - Branch/tag/commit reference (defaults to 'main')
   * @returns Promise<any[]> Array of directory contents
   * 
   * @example
   * const contents = await githubService.getDirectoryContents('who', 'anc-dak', 'input/fsh', 'main');
   */
  async getDirectoryContents(
    owner: string,
    repo: string,
    path: string = '',
    ref: string = 'main'
  ): Promise<any[]> {
    try {
      // Create temporary Octokit instance for unauthenticated access if needed
      const octokit = this.isAuthenticated && this.octokit ? this.octokit : await this.createOctokitInstance();
      
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(data)) {
        this.logger.apiSuccess('GET', `/repos/${owner}/${repo}/contents/${path}`);
        return data;
      } else {
        throw new Error('Not a directory');
      }
    } catch (error) {
      this.logger.apiError('GET', `/repos/${owner}/${repo}/contents/${path}`, error);
      throw new Error(
        `Failed to get directory contents for ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update or create a file in a GitHub repository
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param path - File path in the repository
   * @param content - New file content
   * @param message - Commit message
   * @param branch - Branch name (defaults to 'main')
   * @returns Promise<void>
   * 
   * @example
   * await githubService.updateFile('who', 'anc-dak', 'input/fsh/models/ANC.fsh', '...content...', 'Update ANC model', 'main');
   */
  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string = 'main'
  ): Promise<void> {
    if (!this.isAuthenticated || !this.octokit) {
      throw new Error('Not authenticated');
    }

    try {
      // Get the current file SHA if it exists
      let sha: string | undefined;
      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch
        });
        
        if ('sha' in data) {
          sha = data.sha;
        }
      } catch (error: any) {
        // File doesn't exist, that's okay for creation
        if (error.status !== 404) {
          throw error;
        }
      }

      // Create or update the file
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
        ...(sha && { sha })
      });
      
      this.logger.apiSuccess('PUT', `/repos/${owner}/${repo}/contents/${path}`);
    } catch (error) {
      this.logger.apiError('PUT', `/repos/${owner}/${repo}/contents/${path}`, error);
      throw new Error(
        `Failed to update file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if service is authenticated
   */
  get authenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get token type
   */
  get getTokenType(): 'classic' | 'fine-grained' | 'oauth' | null {
    return this.tokenType;
  }

  /**
   * Sign out and clear authentication
   */
  signOut(): void {
    this.logger.auth('Signing out');
    this.isAuthenticated = false;
    this.octokit = null;
    this.permissions = null;
    this.tokenType = null;
    secureTokenStorage.clearToken();
  }

  /**
   * Get directory contents
   * @param owner Repository owner
   * @param repo Repository name
   * @param path Directory path
   * @param ref Branch or commit reference (default: 'main')
   */
  async getDirectoryContents(
    owner: string,
    repo: string,
    path: string = '',
    ref: string = 'main'
  ): Promise<any[]> {
    this.logger.debug('Getting directory contents', { owner, repo, path, ref });

    try {
      // Use authenticated octokit if available, otherwise create a public instance
      const octokit = this.isAuthenticated ? this.octokit : await this.createOctokitInstance();
      
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(data)) {
        this.logger.debug('Directory contents retrieved', { count: data.length });
        return data;
      }

      this.logger.warn('Expected directory but got file', { path, type: (data as any).type });
      return [];
    } catch (error) {
      this.logger.error('Failed to get directory contents', {
        owner,
        repo,
        path,
        ref,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get file content from repository
   * @param owner Repository owner
   * @param repo Repository name
   * @param path File path
   * @param ref Branch or commit reference (default: 'main')
   * @returns Decoded file content as string
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref: string = 'main'
  ): Promise<string> {
    const timeoutMs = 15000; // 15 second timeout
    
    this.logger.debug('Getting file content', { owner, repo, path, ref });

    try {
      // Use authenticated octokit if available, otherwise create a public instance for public repos
      const octokit = this.isAuthenticated ? this.octokit : await this.createOctokitInstance();
      
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Race the GitHub API call against the timeout
      const apiPromise = octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });
      
      const startTime = Date.now();
      const { data } = await Promise.race([apiPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;
      
      this.logger.debug('API response received', { responseTime, type: (data as any).type });

      // Handle file content
      if ((data as any).type === 'file' && (data as any).content) {
        // Decode base64 content
        try {
          // Use browser-compatible base64 decoding
          const content = atob((data as any).content);
          // Convert to UTF-8 (atob returns Latin-1)
          const utf8Content = decodeURIComponent(escape(content));
          
          this.logger.debug('File content decoded', { 
            contentLength: utf8Content.length,
            responseTime 
          });
          
          return utf8Content;
        } catch (decodeError) {
          this.logger.error('Base64 decoding failed', { 
            error: decodeError instanceof Error ? decodeError.message : String(decodeError)
          });
          throw new Error(`Failed to decode file content: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`);
        }
      } else {
        this.logger.error('Invalid response - not a file or no content', {
          type: (data as any).type,
          hasContent: !!(data as any).content
        });
        throw new Error('File not found or is not a file');
      }
    } catch (error: any) {
      this.logger.error('Failed to fetch file content', {
        owner,
        repo,
        path,
        ref,
        error: error instanceof Error ? error.message : String(error),
        status: error.status
      });
      
      // Provide more specific error messages
      if (error.message.includes('timeout')) {
        throw new Error(`GitHub API request timed out after ${timeoutMs / 1000} seconds. Please try again.`);
      } else if (error.status === 403) {
        // Check if this is a SAML error
        const samlAuthService = await import('./samlAuthService');
        const samlHandled = samlAuthService.default.handleSAMLError(error, owner, repo);
        if (!samlHandled) {
          throw new Error('Access denied. This repository may be private or you may have hit rate limits.');
        } else {
          throw new Error('SAML SSO authorization required. Please authorize your token and try again.');
        }
      } else if (error.status === 404) {
        throw new Error('File not found in the repository.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        throw new Error('Network error occurred. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }

  // TODO: Continue with repository methods, DAK validation, etc.
  // This is Part 1 of the GitHub Service migration - authentication and user management
}

// Export singleton instance to maintain backward compatibility
const githubService = new GitHubService();
export default githubService;

// Also export the class for testing and advanced usage
export { GitHubService };