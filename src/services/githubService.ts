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

import { lazyLoadOctokit } from '../utils/lazyRouteUtils';
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
   * Get file content from GitHub repository with timeout handling
   */
  async getFileContent(owner: string, repo: string, path: string, ref: string = 'main'): Promise<string> {
    const timeoutMs = 15000; // 15 second timeout
    
    try {
      this.logger.debug('Getting file content', { owner, repo, path, ref });
      
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
      
      const { data } = await Promise.race([apiPromise, timeoutPromise]);

      // Handle file content
      if (data && typeof data === 'object' && 'type' in data && data.type === 'file' && 'content' in data && data.content) {
        // Decode base64 content
        const content = decodeURIComponent(escape(atob(data.content as string)));
        this.logger.debug('Successfully fetched file content', { 
          owner, repo, path, ref, 
          contentLength: content.length 
        });
        return content;
      } else {
        throw new Error('File not found or is not a file');
      }
    } catch (error) {
      this.logger.apiError('GET', `/repos/${owner}/${repo}/contents/${path}`, error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error(`GitHub API request timed out after ${timeoutMs / 1000} seconds. Please try again.`);
        }
      }
      
      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 403) {
          throw new Error('Access denied. This repository may be private or you may have hit rate limits.');
        } else if (error.status === 404) {
          throw new Error('File not found in the repository.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get directory contents (supports both authenticated and unauthenticated access)
   */
  async getDirectoryContents(owner: string, repo: string, path: string = '', ref: string = 'main'): Promise<any[]> {
    try {
      this.logger.debug('Getting directory contents', { owner, repo, path, ref });
      
      // Create temporary Octokit instance for unauthenticated access if needed
      const octokit = this.isAuthenticated ? this.octokit : await this.createOctokitInstance();
      
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(data)) {
        this.logger.debug('Successfully fetched directory contents', { 
          owner, repo, path, ref, 
          itemCount: data.length 
        });
        return data;
      } else {
        throw new Error('Not a directory');
      }
    } catch (error) {
      this.logger.apiError('GET', `/repos/${owner}/${repo}/contents/${path}`, error);
      throw error;
    }
  }

  /**
   * Get all BPMN files from a repository's business process directories recursively
   */
  async getBpmnFilesRecursive(owner: string, repo: string, path: string, ref: string = 'main', allFiles: any[] = []): Promise<any[]> {
    try {
      this.logger.debug('Searching for BPMN files recursively', { owner, repo, path, ref });
      
      // Use authenticated octokit if available, otherwise create a public instance
      const octokit = this.isAuthenticated ? this.octokit : await this.createOctokitInstance();
      
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      // Handle single file response
      if (!Array.isArray(data)) {
        if (data.name && data.name.endsWith('.bpmn')) {
          this.logger.debug('Found single BPMN file', { fileName: data.name });
          allFiles.push(data);
        }
        return allFiles;
      }

      // Handle directory response
      for (const item of data) {
        if (item.type === 'file' && item.name.endsWith('.bpmn')) {
          this.logger.debug('Found BPMN file', { fileName: item.name });
          allFiles.push(item);
        } else if (item.type === 'dir') {
          this.logger.debug('Found subdirectory, recursing', { dirName: item.name });
          // Recursively search subdirectories
          await this.getBpmnFilesRecursive(owner, repo, item.path, ref, allFiles);
        }
      }

      this.logger.debug('Completed recursive BPMN search', { 
        path, totalFilesFound: allFiles.length 
      });
      return allFiles;
    } catch (error) {
      this.logger.debug('Error during BPMN file search', { path, error });
      // If directory doesn't exist, return empty array (not an error)
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return allFiles;
      }
      throw error;
    }
  }

  /**
   * Get all BPMN files from a repository's business process directories
   */
  async getBpmnFiles(owner: string, repo: string, ref: string = 'main'): Promise<any[]> {
    this.logger.debug('Starting BPMN file search', { owner, repo, ref });
    const allBpmnFiles: any[] = [];
    
    // Search for BPMN files in the specified business process directories
    const possiblePaths = [
      'input/business-processes',
      'input/business-process'
    ];

    for (const path of possiblePaths) {
      try {
        this.logger.debug('Searching BPMN files in directory', { path });
        const files = await this.getBpmnFilesRecursive(owner, repo, path, ref);
        this.logger.debug('Found BPMN files in directory', { path, fileCount: files.length });
        allBpmnFiles.push(...files);
      } catch (error) {
        // Only log warnings for unexpected errors (not 404s which are expected when directories don't exist)
        if (error && typeof error === 'object' && 'status' in error && error.status !== 404) {
          this.logger.warn('Could not fetch BPMN files from directory', { 
            path, 
            error: error instanceof Error ? error.message : String(error) 
          });
        } else {
          this.logger.debug('Directory not found (expected)', { path });
        }
        // Continue trying other paths
      }
    }

    // Remove duplicates based on path (in case both directories exist and have overlapping files)
    const uniqueFiles = allBpmnFiles.filter((file, index, self) => 
      index === self.findIndex(f => f.path === file.path)
    );

    this.logger.debug('BPMN file search completed', { 
      totalFiles: uniqueFiles.length,
      fileNames: uniqueFiles.map(f => f.name)
    });
    return uniqueFiles;
  }

  /**
   * Update file content (requires authentication)
   */
  async updateFile(owner: string, repo: string, path: string, content: string, message: string, branch: string = 'main'): Promise<any> {
    if (!this.isAuthenticated || !this.octokit) {
      throw new Error('Authentication required to update files');
    }

    try {
      this.logger.debug('Updating file', { owner, repo, path, branch, message });
      
      // First, get the current file to get its SHA
      const { data: currentFile } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });

      if (Array.isArray(currentFile)) {
        throw new Error('Path is a directory, not a file');
      }

      // Update the file
      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha: currentFile.sha,
        branch
      });

      this.logger.debug('Successfully updated file', { owner, repo, path, branch });
      return data;
    } catch (error) {
      this.logger.apiError('PUT', `/repos/${owner}/${repo}/contents/${path}`, error);
      throw error;
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<ServiceResponse<GitHubRepository>> {
    try {
      this.logger.debug('Getting repository information', { owner, repo });
      
      // Use authenticated octokit if available, otherwise create a public instance for public repos
      const octokit = this.isAuthenticated ? this.octokit : await this.createOctokitInstance();
      
      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });
      
      this.logger.debug('Successfully fetched repository information', { owner, repo });
      return {
        success: true,
        data: data as GitHubRepository
      };
    } catch (error) {
      this.logger.apiError('GET', `/repos/${owner}/${repo}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch repository'
      };
    }  
  }

  /**
   * Get repository branches
   */
  async getBranches(owner: string, repo: string): Promise<ServiceResponse<any[]>> {
    try {
      this.logger.debug('Getting repository branches', { owner, repo });
      
      // Use authenticated octokit if available, otherwise create a public instance for public repos
      const octokit = this.isAuthenticated ? this.octokit : await this.createOctokitInstance();
      
      const { data } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100
      });
      
      this.logger.debug('Successfully fetched branches', { 
        owner, repo, branchCount: data.length 
      });
      return {
        success: true,
        data
      };
    } catch (error) {
      this.logger.apiError('GET', `/repos/${owner}/${repo}/branches`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch branches'
      };
    }
  }

  /**
   * Get commits for a repository (supports unauthenticated access)
   */
  async getCommits(owner: string, repo: string, options: {
    per_page?: number;
    page?: number;
    sha?: string;
    since?: string;
    until?: string;
  } = {}): Promise<ServiceResponse<any[]>> {
    try {
      this.logger.debug('Getting repository commits', { owner, repo, options });
      
      // Create temporary Octokit instance for unauthenticated access if needed
      const octokit = this.isAuthenticated ? this.octokit : await this.createOctokitInstance();
      
      const params = {
        owner,
        repo,
        per_page: options.per_page || 10,
        page: options.page || 1,
        ...(options.sha && { sha: options.sha }),
        ...(options.since && { since: options.since }),
        ...(options.until && { until: options.until })
      };

      const { data } = await octokit.rest.repos.listCommits(params);
      
      this.logger.debug('Successfully fetched commits', { 
        owner, repo, commitCount: data.length 
      });
      return {
        success: true,
        data
      };
    } catch (error) {
      this.logger.apiError('GET', `/repos/${owner}/${repo}/commits`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch commits'
      };
    }
  }

  /**
   * Get user's organizations (requires authentication)
   */
  async getUserOrganizations(): Promise<ServiceResponse<any[]>> {
    if (!this.isAuthenticated || !this.octokit) {
      return {
        success: false,
        error: 'Not authenticated with GitHub'
      };
    }

    try {
      this.logger.debug('Getting user organizations');
      const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser();
      
      this.logger.debug('Successfully fetched user organizations', { 
        orgCount: data.length 
      });
      return {
        success: true,
        data
      };
    } catch (error) {
      this.logger.apiError('GET', '/user/orgs', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch organizations'
      };
    }
  }

  /**
   * Get specific organization data (public data, no auth required)
   */
  async getOrganization(orgLogin: string): Promise<ServiceResponse<any>> {
    try {
      this.logger.debug('Getting organization information', { orgLogin });
      
      // Create a temporary Octokit instance for public API calls if we don't have one
      const octokit = this.octokit || await this.createOctokitInstance();
      
      const { data } = await octokit.rest.orgs.get({
        org: orgLogin
      });
      
      this.logger.debug('Successfully fetched organization information', { orgLogin });
      return {
        success: true,
        data
      };
    } catch (error) {
      this.logger.apiError('GET', `/orgs/${orgLogin}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to fetch organization ${orgLogin}`
      };
    }
  }

  /**
   * Get specific user data (public data, no auth required)
   */
  async getUser(username: string): Promise<ServiceResponse<GitHubUser>> {
    try {
      this.logger.debug('Getting user information', { username });
      
      // Create a temporary Octokit instance for public API calls if we don't have one
      const octokit = this.octokit || await this.createOctokitInstance();
      
      const { data } = await octokit.rest.users.getByUsername({
        username
      });
      
      this.logger.debug('Successfully fetched user information', { username });
      return {
        success: true,
        data: data as GitHubUser
      };
    } catch (error) {
      this.logger.apiError('GET', `/users/${username}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to fetch user ${username}`
      };
    }
  }

  /**
   * Get public repositories for a user or organization (no auth required)
   */
  async getPublicRepositories(owner: string, type: 'user' | 'org' = 'user'): Promise<ServiceResponse<GitHubRepository[]>> {
    try {
      this.logger.debug('Getting public repositories', { owner, type });
      
      // Create a temporary Octokit instance for public API calls if we don't have one
      const octokit = this.octokit || await this.createOctokitInstance();
      
      let repositories: any[] = [];
      let page = 1;
      let hasMorePages = true;

      // Fetch all public repositories using pagination
      while (hasMorePages) {
        let response;
        if (type === 'user') {
          response = await octokit.rest.repos.listForUser({
            username: owner,
            sort: 'updated',
            per_page: 100,
            page: page,
          });
        } else {
          response = await octokit.rest.repos.listForOrg({
            org: owner,
            sort: 'updated',
            per_page: 100,
            page: page,
          });
        }

        repositories = repositories.concat(response.data);
        
        // Check if there are more pages
        hasMorePages = response.data.length === 100;
        page++;
      }

      this.logger.debug('Successfully fetched public repositories', { 
        owner, type, repoCount: repositories.length 
      });
      return {
        success: true,
        data: repositories as GitHubRepository[]
      };
    } catch (error) {
      this.logger.apiError('GET', `/repos?owner=${owner}&type=${type}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to fetch public repositories for ${owner}`
      };
    }
  }
}

// Export singleton instance to maintain backward compatibility
const githubService = new GitHubService();
export default githubService;

// Also export the class for testing and advanced usage
export { GitHubService };