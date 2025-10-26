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
   * Check if the service is currently authenticated
   * @returns {boolean} True if authenticated, false otherwise
   */
  isAuth(): boolean {
    return this.isAuthenticated;
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
   * Get issue details
   */
  async getIssue(owner: string, repo: string, issue_number: number): Promise<any> {
    if (!this.isAuthenticated || !this.octokit) {
      throw new Error('Not authenticated');
    }

    try {
      const { data } = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number
      });
      return data;
    } catch (error) {
      this.logger.error('Failed to get issue', { owner, repo, issue_number, error });
      throw error;
    }
  }

  /**
   * Get pull request details
   */
  async getPullRequest(owner: string, repo: string, pull_number: number): Promise<any> {
    if (!this.isAuthenticated || !this.octokit) {
      throw new Error('Not authenticated');
    }

    try {
      const { data } = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number
      });
      return data;
    } catch (error) {
      this.logger.error('Failed to get pull request', { owner, repo, pull_number, error });
      throw error;
    }
  }

  /**
   * Get pull request review comments with pagination support
   */
  async getPullRequestComments(owner: string, repo: string, pull_number: number, page: number = 1, per_page: number = 30): Promise<any[]> {
    if (!this.isAuthenticated || !this.octokit) {
      throw new Error('Not authenticated');
    }

    try {
      const { data } = await this.octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number,
        page,
        per_page
      });
      return data;
    } catch (error: any) {
      this.logger.error('Failed to get pull request review comments', { owner, repo, pull_number, error });
      return [];
    }
  }

  /**
   * Get pull request issue comments
   */
  async getPullRequestIssueComments(owner: string, repo: string, pull_number: number, page: number = 1, per_page: number = 30): Promise<any[]> {
    if (!this.isAuthenticated || !this.octokit) {
      throw new Error('Not authenticated');
    }

    try {
      const { data } = await this.octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: pull_number,
        page,
        per_page
      });
      return data;
    } catch (error: any) {
      this.logger.error('Failed to get pull request issue comments', { owner, repo, pull_number, error });
      return [];
    }
  }

  /**
   * Get pull request timeline events
   */
  async getPullRequestTimeline(owner: string, repo: string, pull_number: number, page: number = 1, per_page: number = 30): Promise<any[]> {
    if (!this.isAuthenticated || !this.octokit) {
      throw new Error('Not authenticated');
    }

    try {
      const { data } = await this.octokit.rest.issues.listEventsForTimeline({
        owner,
        repo,
        issue_number: pull_number,
        page,
        per_page
      });
      return data;
    } catch (error: any) {
      this.logger.error('Failed to get pull request timeline', { owner, repo, pull_number, error });
      return [];
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(owner: string, repo: string, issueData: any): Promise<any> {
    if (!this.isAuthenticated || !this.octokit) {
      throw new Error('Not authenticated');
    }

    try {
      const { data } = await this.octokit.rest.issues.create({
        owner,
        repo,
        title: issueData.title,
        body: issueData.body,
        labels: issueData.labels,
        assignees: issueData.assignees
      });
      return data;
    } catch (error) {
      this.logger.error('Failed to create issue', { owner, repo, error });
      throw error;
    }
  }

  /**
   * Get repository information
   */
  async getRepository(owner: string, repo: string): Promise<any> {
    try {
      const octokit = this.isAuthenticated && this.octokit ? this.octokit : await this.createOctokitInstance();
      const { data } = await octokit.rest.repos.get({
        owner,
        repo
      });
      return data;
    } catch (error) {
      this.logger.error('Failed to get repository', { owner, repo, error });
      throw error;
    }
  }

  /**
   * Get repository statistics including recent commits, PRs, and issues
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param branch - Branch name (optional)
   * @returns Promise resolving to repository statistics
   */
  async getRepositoryStats(owner: string, repo: string, branch?: string): Promise<{
    recentCommits: any[];
    openPullRequestsCount: number;
    openIssuesCount: number;
  }> {
    try {
      const octokit = this.isAuthenticated && this.octokit ? this.octokit : await this.createOctokitInstance();
      
      // Get recent commits
      const commitsOptions: any = {
        owner,
        repo,
        per_page: 5
      };
      if (branch) {
        commitsOptions.sha = branch;
      }
      const { data: recentCommits } = await octokit.rest.repos.listCommits(commitsOptions);

      // Get open PRs count
      const { data: pullRequests } = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 1
      });

      // Get open issues count
      const { data: issues } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 1
      });

      return {
        recentCommits,
        openPullRequestsCount: pullRequests.length,
        openIssuesCount: issues.length
      };
    } catch (error) {
      this.logger.error('Failed to get repository stats', { owner, repo, branch, error });
      throw error;
    }
  }

  /**
   * Check if user has write access to repository
   */
  async hasRepositoryWriteAccess(owner: string, repo: string): Promise<boolean> {
    if (!this.isAuthenticated || !this.octokit) {
      return false;
    }

    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo
      });
      
      // Check if user has push/write permissions
      return data.permissions?.push === true || data.permissions?.admin === true;
    } catch (error) {
      this.logger.debug('Failed to check write access', { owner, repo, error });
      return false;
    }
  }

  /**
   * Get repository forks
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Promise resolving to array of fork repositories
   */
  async getRepositoryForks(owner: string, repo: string): Promise<any[]> {
    try {
      const octokit = this.isAuthenticated && this.octokit ? this.octokit : await this.createOctokitInstance();
      const { data } = await octokit.rest.repos.listForks({
        owner,
        repo,
        per_page: 100
      });
      return data;
    } catch (error) {
      this.logger.error('Failed to get repository forks', { owner, repo, error });
      throw error;
    }
  }

  /**
   * Get pull requests for a specific branch
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param branchName - Branch name to filter PRs
   * @returns Promise<any[]> Array of pull requests
   */
  async getPullRequestsForBranch(owner: string, repo: string, branchName: string): Promise<any[]> {
    try {
      const octokit = this.isAuthenticated && this.octokit ? this.octokit : await this.createOctokitInstance();
      const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        head: `${owner}:${branchName}`,
        state: 'all',
        per_page: 100
      });
      return data;
    } catch (error: any) {
      this.logger.error('Failed to get pull requests for branch', { owner, repo, branchName, error });
      // Return empty array instead of throwing to allow graceful degradation
      return [];
    }
  }

  /**
   * Get commits for a repository
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param options - Commit list options (sha, per_page, page)
   * @returns Promise<any[]> Array of commits
   * 
   * @example
   * const commits = await githubService.getCommits('who', 'anc-dak', { sha: 'main', per_page: 10, page: 1 });
   */
  async getCommits(
    owner: string,
    repo: string,
    options: { sha?: string; per_page?: number; page?: number } = {}
  ): Promise<any[]> {
    try {
      const octokit = this.isAuthenticated && this.octokit ? this.octokit : await this.createOctokitInstance();
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        ...options
      });
      return data;
    } catch (error) {
      this.logger.error('Failed to get commits', { owner, repo, options, error });
      throw error;
    }
  }

  /**
   * Get a single commit with its details
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param ref - Commit SHA or ref
   * @returns Promise resolving to commit data
   */
  async getCommit(owner: string, repo: string, ref: string): Promise<any> {
    try {
      const octokit = this.isAuthenticated && this.octokit ? this.octokit : await this.createOctokitInstance();
      const { data } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref
      });
      return data;
    } catch (error) {
      this.logger.error('Failed to get commit', { owner, repo, ref, error });
      throw error;
    }
  }

  /**
   * Get branches from a GitHub repository
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param options - Optional parameters for pagination
   * @returns Promise<any[]> Array of branch data
   * 
   * @example
   * const branches = await githubService.getBranches('who', 'anc-dak', { per_page: 30, page: 1 });
   */
  async getBranches(
    owner: string,
    repo: string,
    options: { per_page?: number; page?: number } = {}
  ): Promise<any[]> {
    try {
      const octokit = this.isAuthenticated && this.octokit ? this.octokit : await this.createOctokitInstance();
      const { data } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: options.per_page || 100,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      this.logger.error('Failed to get branches', { owner, repo, options, error });
      throw error;
    }
  }

  /**
   * Create a new branch in a GitHub repository
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param branchName - Name for the new branch
   * @param sourceBranch - Source branch to create from (defaults to 'main')
   * @returns Promise<any> Created branch reference
   * 
   * @example
   * const branch = await githubService.createBranch('who', 'anc-dak', 'feature-branch', 'main');
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    sourceBranch: string = 'main'
  ): Promise<any> {
    try {
      const octokit = this.isAuthenticated && this.octokit ? this.octokit : await this.createOctokitInstance();
      
      // Get the SHA of the source branch
      const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${sourceBranch}`
      });
      
      const sha = refData.object.sha;
      
      // Create the new branch
      const { data } = await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha
      });
      
      this.logger.info('Branch created successfully', { owner, repo, branchName, sourceBranch });
      return data;
    } catch (error) {
      this.logger.error('Failed to create branch', { owner, repo, branchName, sourceBranch, error });
      throw error;
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
        this.logger.debug('GET directory contents success', { path: `/repos/${owner}/${repo}/contents/${path}` });
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
      
      this.logger.debug('PUT file success', { path: `/repos/${owner}/${repo}/contents/${path}` });
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
   * Get the stored token
   */
  get token(): string | null {
    return secureTokenStorage.retrieveToken();
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

  /**
   * Merge a pull request
   */
  async mergePullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
    options?: {
      commit_title?: string;
      commit_message?: string;
      merge_method?: 'merge' | 'squash' | 'rebase';
    }
  ): Promise<any> {
    this.logger.debug('Merging pull request', { owner, repo, pullNumber, options });
    
    if (!this.octokit) {
      throw new Error('Not authenticated. Please authenticate first.');
    }

    try {
      const response = await this.octokit.rest.pulls.merge({
        owner,
        repo,
        pull_number: pullNumber,
        commit_title: options?.commit_title,
        commit_message: options?.commit_message,
        merge_method: options?.merge_method || 'merge'
      });

      this.logger.debug('Pull request merged successfully', {
        owner,
        repo,
        pullNumber,
        sha: response.data.sha
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to merge pull request', {
        owner,
        repo,
        pullNumber,
        error: error instanceof Error ? error.message : String(error),
        status: error.status
      });
      throw error;
    }
  }

  /**
   * Approve a pull request
   */
  async approvePullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
    body?: string
  ): Promise<any> {
    this.logger.debug('Approving pull request', { owner, repo, pullNumber });
    
    if (!this.octokit) {
      throw new Error('Not authenticated. Please authenticate first.');
    }

    try {
      const response = await this.octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        event: 'APPROVE',
        body: body || ''
      });

      this.logger.debug('Pull request approved successfully', {
        owner,
        repo,
        pullNumber
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to approve pull request', {
        owner,
        repo,
        pullNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Request changes on a pull request
   */
  async requestPullRequestChanges(
    owner: string,
    repo: string,
    pullNumber: number,
    body: string
  ): Promise<any> {
    this.logger.debug('Requesting changes on pull request', { owner, repo, pullNumber });
    
    if (!this.octokit) {
      throw new Error('Not authenticated. Please authenticate first.');
    }

    try {
      const response = await this.octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        event: 'REQUEST_CHANGES',
        body
      });

      this.logger.debug('Changes requested successfully', {
        owner,
        repo,
        pullNumber
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to request changes', {
        owner,
        repo,
        pullNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Mark a pull request as ready for review
   */
  async markPullRequestReadyForReview(
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<any> {
    this.logger.debug('Marking pull request as ready for review', { owner, repo, pullNumber });
    
    if (!this.octokit) {
      throw new Error('Not authenticated. Please authenticate first.');
    }

    try {
      const response = await this.octokit.rest.pulls.update({
        owner,
        repo,
        pull_number: pullNumber,
        draft: false
      });

      this.logger.debug('Pull request marked as ready for review', {
        owner,
        repo,
        pullNumber
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to mark pull request as ready for review', {
        owner,
        repo,
        pullNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Check if user has permission to comment on issues/PRs
   */
  async checkCommentPermissions(owner: string, repo: string): Promise<boolean> {
    this.logger.debug('Checking comment permissions', { owner, repo });
    
    if (!this.octokit) {
      return false;
    }

    try {
      // Check repository permissions
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo
      });

      // If repo is public or user has push access, they can comment
      return !repoData.private || repoData.permissions?.push || repoData.permissions?.admin || false;
    } catch (error: any) {
      this.logger.debug('Failed to check comment permissions', {
        owner,
        repo,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Check if user has permission to merge PRs
   */
  async checkPullRequestMergePermissions(owner: string, repo: string, pullNumber: number): Promise<boolean> {
    this.logger.debug('Checking PR merge permissions', { owner, repo, pullNumber });
    
    if (!this.octokit) {
      return false;
    }

    try {
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo
      });

      return repoData.permissions?.push || repoData.permissions?.admin || false;
    } catch (error: any) {
      this.logger.debug('Failed to check PR merge permissions', {
        owner,
        repo,
        pullNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Check if user has permission to review PRs
   */
  async checkPullRequestReviewPermissions(owner: string, repo: string, pullNumber: number): Promise<boolean> {
    this.logger.debug('Checking PR review permissions', { owner, repo, pullNumber });
    
    if (!this.octokit) {
      return false;
    }

    try {
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo
      });

      // Can review if has push or admin access
      return repoData.permissions?.push || repoData.permissions?.admin || false;
    } catch (error: any) {
      this.logger.debug('Failed to check PR review permissions', {
        owner,
        repo,
        pullNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Check if user has write permissions on repository
   */
  async checkRepositoryWritePermissions(owner: string, repo: string): Promise<boolean> {
    this.logger.debug('Checking repository write permissions', { owner, repo });
    
    if (!this.octokit) {
      return false;
    }

    try {
      const { data: repoData } = await this.octokit.rest.repos.get({
        owner,
        repo
      });

      return repoData.permissions?.push || repoData.permissions?.admin || false;
    } catch (error: any) {
      this.logger.debug('Failed to check repository write permissions', {
        owner,
        repo,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  /**
   * Create a comment on a pull request
   */
  async createPullRequestComment(
    owner: string,
    repo: string,
    pullNumber: number,
    body: string
  ): Promise<any> {
    this.logger.debug('Creating PR comment', { owner, repo, pullNumber });
    
    if (!this.octokit) {
      throw new Error('Not authenticated. Please authenticate first.');
    }

    try {
      const response = await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body
      });

      this.logger.debug('PR comment created successfully', {
        owner,
        repo,
        pullNumber,
        commentId: response.data.id
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to create PR comment', {
        owner,
        repo,
        pullNumber,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

// Export singleton instance to maintain backward compatibility
const githubService = new GitHubService();
export default githubService;

// Also export the class for testing and advanced usage
export { GitHubService };