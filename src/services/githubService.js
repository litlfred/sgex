import { lazyLoadOctokit } from '../utils/lazyRouteUtils';
import { processConcurrently } from '../utils/concurrency';
import repositoryCompatibilityCache from '../utils/repositoryCompatibilityCache';
import secureTokenStorage from './secureTokenStorage';
import logger from '../utils/logger';



class GitHubService {
  constructor() {
    this.octokit = null;
    this.isAuthenticated = false;
    this.permissions = null;
    this.tokenType = null; // 'classic', 'fine-grained', or 'oauth'
    this.logger = logger.getLogger('GitHubService');
    this.logger.debug('GitHubService instance created');
  }

  // Helper method to create Octokit instance with lazy loading
  async createOctokitInstance(auth = null) {
    const Octokit = await lazyLoadOctokit();
    return new Octokit(auth ? { auth } : {});
  }

  // Initialize with a GitHub token (supports both OAuth and PAT tokens)
  async authenticate(token) {
    const startTime = Date.now();
    this.logger.auth('Starting authentication', { 
      tokenProvided: !!token, 
      tokenMask: token ? secureTokenStorage.maskToken(token) : 'none'
    });
    
    try {
      // Validate token format using SecureTokenStorage
      const validation = secureTokenStorage.validateTokenFormat(token);
      if (!validation.isValid) {
        this.logger.warn('Token validation failed during authentication', { 
          reason: validation.reason,
          tokenMask: secureTokenStorage.maskToken(token)
        });
        this.isAuthenticated = false;
        return false;
      }

      // Lazy load Octokit to reduce initial bundle size
      this.octokit = await this.createOctokitInstance(validation.token);
      this.isAuthenticated = true;
      this.tokenType = validation.type;
      
      // Store token securely
      const stored = secureTokenStorage.storeToken(validation.token);
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
        error: error.message, 
        duration,
        tokenMask: secureTokenStorage.maskToken(token)
      });
      console.error('Failed to authenticate with GitHub:', error);
      this.isAuthenticated = false;
      secureTokenStorage.clearToken(); // Clear any partially stored data
      return false;
    }
  }

  // Initialize with an existing Octokit instance (for OAuth flow)
  authenticateWithOctokit(octokitInstance) {
    this.logger.auth('Starting OAuth authentication with Octokit instance');
    
    try {
      this.octokit = octokitInstance;
      this.isAuthenticated = true;
      this.tokenType = 'oauth';
      
      this.logger.auth('OAuth authentication successful', { tokenType: this.tokenType });
      return true;
    } catch (error) {
      this.logger.auth('OAuth authentication failed', { error: error.message });
      console.error('Failed to authenticate with Octokit instance:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  // Initialize authentication from securely stored token
  async initializeFromStoredToken() {
    this.logger.auth('Attempting to initialize from stored token');
    
    try {
      // First try to migrate any legacy tokens
      const migrated = secureTokenStorage.migrateLegacyToken();
      if (migrated) {
        this.logger.debug('Successfully migrated legacy token to secure storage');
      }

      // Retrieve token from secure storage
      const tokenData = secureTokenStorage.retrieveToken();
      if (!tokenData) {
        this.logger.debug('No valid stored token found');
        return false;
      }

      // Initialize Octokit with stored token using lazy loading
      this.octokit = await this.createOctokitInstance(tokenData.token);
      this.isAuthenticated = true;
      this.tokenType = tokenData.type;
      
      this.logger.auth('Successfully initialized from stored token', {
        tokenType: this.tokenType,
        tokenMask: secureTokenStorage.maskToken(tokenData.token),
        expires: new Date(tokenData.expires).toISOString()
      });
      
      return true;
    } catch (error) {
      this.logger.auth('Failed to initialize from stored token', { error: error.message });
      this.isAuthenticated = false;
      secureTokenStorage.clearToken();
      return false;
    }
  }

  // Check if there's a valid stored token
  hasStoredToken() {
    return secureTokenStorage.hasValidToken();
  }

  // Get information about stored token
  getStoredTokenInfo() {
    return secureTokenStorage.getTokenInfo();
  }

  // Check token permissions and type
  async checkTokenPermissions() {
    if (!this.isAuth()) {
      const error = new Error('Not authenticated with GitHub');
      this.logger.error('Token permission check failed - not authenticated');
      throw error;
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', '/user', null);

    try {
      // Try to get token info to determine type and permissions
      const response = await this.octokit.request('GET /user');
      this.logger.apiResponse('GET', '/user', response.status, Date.now() - startTime);
      
      // Check if this is a fine-grained token by trying to access rate limit info
      try {
        const rateLimitStart = Date.now();
        this.logger.apiCall('GET', '/rate_limit', null);
        const rateLimit = await this.octokit.rest.rateLimit.get();
        this.logger.apiResponse('GET', '/rate_limit', rateLimit.status, Date.now() - rateLimitStart);
        
        // Fine-grained tokens have different rate limit structure
        this.tokenType = rateLimit.data.resources.core ? 'classic' : 'fine-grained';
        this.logger.debug('Token type determined', { tokenType: this.tokenType, hasCore: !!rateLimit.data.resources.core });
      } catch (rateLimitError) {
        this.tokenType = 'unknown';
        this.logger.warn('Could not determine token type from rate limit', { error: rateLimitError.message });
      }

      const permissions = {
        type: this.tokenType,
        user: response.data
      };
      
      this.permissions = permissions;
      this.logger.debug('Token permissions checked successfully', { 
        tokenType: this.tokenType, 
        username: response.data.login 
      });
      
      return permissions;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.apiError('GET', '/user', error);
      this.logger.performance('Token permission check (failed)', duration);
      console.error('Failed to check token permissions:', error);
      throw error;
    }
  }

  // Check if we have write permissions for a specific repository
  async checkRepositoryWritePermissions(owner, repo) {
    if (!this.isAuth()) {
      this.logger.warn('Cannot check repository write permissions - not authenticated', { owner, repo });
      return false;
    }

    const startTime = Date.now();
    this.logger.debug('Checking write permissions for repository', { owner, repo });

    try {
      // Get current user first
      const currentUser = await this.getCurrentUser();
      const username = currentUser.login;
      
      this.logger.apiCall('GET', `/repos/${owner}/${repo}/collaborators/${username}/permission`, null);
      
      // Try to get repository collaborator permissions
      const { data } = await this.octokit.rest.repos.getCollaboratorPermissionLevel({
        owner,
        repo,
        username
      });
      
      const duration = Date.now() - startTime;
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/collaborators/${username}/permission`, 200, duration);
      
      // GitHub permission levels: read, triage, write, maintain, admin
      // Users with write, maintain, or admin permissions can merge PRs
      const hasWriteAccess = ['write', 'maintain', 'admin'].includes(data.permission);
      this.logger.debug('Repository write permissions checked', { 
        owner, 
        repo, 
        permission: data.permission, 
        hasWriteAccess,
        supportedLevels: ['write', 'maintain', 'admin']
      });
      
      return hasWriteAccess;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.apiError('GET', `/repos/${owner}/${repo}/collaborators/*/permission`, error);
      this.logger.performance('Repository write permission check (failed)', duration);
      
      // Better error logging to help debug permission issues
      console.warn(`Could not check repository write permissions for ${owner}/${repo}:`, {
        error: error.message,
        status: error.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers
      });
      
      this.logger.warn('Assuming no write access due to permission check failure', { 
        owner, 
        repo, 
        error: error.message,
        status: error.status,
        userGuidance: 'Check if your Personal Access Token has the required scopes: repo (classic) or Contents+Pull requests (fine-grained)'
      });
      return false;
    }
  }

  // Alias method for backward compatibility - delegates to checkRepositoryWritePermissions
  async checkRepositoryPermissions(owner, repo) {
    return this.checkRepositoryWritePermissions(owner, repo);
  }

  // Check if the token has permission to create comments on issues/PRs
  async checkCommentPermissions(owner, repo) {
    if (!this.isAuth()) {
      this.logger.warn('Cannot check comment permissions - not authenticated', { owner, repo });
      return false;
    }

    const startTime = Date.now();
    this.logger.debug('Checking comment permissions for repository', { owner, repo });

    try {
      // Try to access the issues endpoint, which is required for commenting on PRs
      // This is a safe read operation that will fail gracefully if no permission
      this.logger.apiCall('GET', `/repos/${owner}/${repo}/issues`, { per_page: 1 });
      
      await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        per_page: 1,
        state: 'all'
      });
      
      const duration = Date.now() - startTime;
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/issues`, 200, duration);
      
      // If we can read issues, we likely can comment on them
      // But this is just a heuristic - the actual test is when we try to comment
      this.logger.debug('Issues endpoint accessible - comment permissions likely available', { owner, repo });
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.apiError('GET', `/repos/${owner}/${repo}/issues`, error);
      this.logger.performance('Comment permission check (failed)', duration);
      
      // Check if it's a permissions error
      if (error.status === 403 || error.status === 401) {
        this.logger.warn('Token does not have permission to access issues/comments', { 
          owner, 
          repo, 
          error: error.message,
          status: error.status 
        });
        return false;
      }
      
      // For other errors, assume we have permission and let the actual comment attempt handle it
      this.logger.warn('Could not determine comment permissions, assuming available', { 
        owner, 
        repo, 
        error: error.message 
      });
      return true;
    }
  }

  // Check if authenticated
  isAuth() {
    return this.isAuthenticated && this.octokit !== null;
  }

  // Get current user data
  async getCurrentUser() {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }

  // Get user's organizations
  async getUserOrganizations() {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser();
      return data;
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      throw error;
    }
  }

  // Get specific organization data (public data, no auth required)
  async getOrganization(orgLogin) {
    try {
      // Create a temporary Octokit instance for public API calls if we don't have one
      const octokit = this.octokit || await this.createOctokitInstance();
      
      const { data } = await octokit.rest.orgs.get({
        org: orgLogin
      });
      return data;
    } catch (error) {
      console.error(`Failed to fetch organization ${orgLogin}:`, error);
      throw error;
    }
  }

  // Get specific user data (public data, no auth required)
  async getUser(username) {
    try {
      // Create a temporary Octokit instance for public API calls if we don't have one
      const octokit = this.octokit || await this.createOctokitInstance();
      
      const { data } = await octokit.rest.users.getByUsername({
        username
      });
      return data;
    } catch (error) {
      console.error(`Failed to fetch user ${username}:`, error);
      throw error;
    }
  }

  // Get public repositories for a user or organization (no auth required)
  async getPublicRepositories(owner, type = 'user') {
    try {
      // Create a temporary Octokit instance for public API calls if we don't have one
      const octokit = this.octokit || await this.createOctokitInstance();
      
      let repositories = [];
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

      return repositories;
    } catch (error) {
      console.error(`Failed to fetch public repositories for ${owner}:`, error);
      throw error;
    }
  }

  // Get WHO organization data with fresh avatar
  async getWHOOrganization() {
    try {
      const whoData = await this.getOrganization('WorldHealthOrganization');
      return {
        id: whoData.id,
        login: whoData.login,
        display_name: whoData.name || 'World Health Organization',
        description: whoData.description || 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
        avatar_url: whoData.avatar_url,
        html_url: whoData.html_url,
        type: 'Organization',
        permissions: {
          can_create_repositories: true,
          can_create_private_repositories: true
        },
        plan: {
          name: 'Organization',
          private_repos: 'unlimited'
        },
        isWHO: true
      };
    } catch (error) {
      console.warn('Could not fetch WHO organization data from API, using fallback:', error);
      // Return hardcoded fallback data
      return {
        id: 'who-organization',
        login: 'WorldHealthOrganization',
        display_name: 'World Health Organization',
        description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
        avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
        html_url: 'https://github.com/WorldHealthOrganization',
        type: 'Organization',
        permissions: {
          can_create_repositories: true,
          can_create_private_repositories: true
        },
        plan: {
          name: 'Organization',
          private_repos: 'unlimited'
        },
        isWHO: true
      };
    }
  }

  // Rate limiting management methods
  async checkRateLimit() {
    try {
      const octokit = this.octokit || await this.createOctokitInstance();
      const { data } = await octokit.rest.rateLimit.get();
      return {
        core: {
          limit: data.rate.limit,
          remaining: data.rate.remaining,
          reset: data.rate.reset,
          used: data.rate.used
        },
        search: {
          limit: data.search.limit,
          remaining: data.search.remaining,
          reset: data.search.reset,
          used: data.search.used
        },
        isAuthenticated: this.isAuthenticated
      };
    } catch (error) {
      console.warn('Could not check rate limit:', error);
      return {
        core: {
          limit: this.isAuthenticated ? 5000 : 60,
          remaining: 0,
          reset: Date.now() + 3600000,
          used: this.isAuthenticated ? 5000 : 60
        },
        search: {
          limit: this.isAuthenticated ? 30 : 10,
          remaining: 0,
          reset: Date.now() + 60000,
          used: this.isAuthenticated ? 30 : 10
        },
        isAuthenticated: this.isAuthenticated
      };
    }
  }

  // Check if we should skip API calls due to rate limiting
  async shouldSkipApiCalls() {
    if (this.isAuthenticated) {
      return false; // Authenticated users have higher limits
    }

    try {
      const rateLimit = await this.checkRateLimit();
      const remaining = rateLimit.core.remaining;
      
      // For unauthenticated users, be conservative and stop making calls if less than 10 remaining
      if (remaining < 10) {
        console.warn(`🚫 Rate limit protection: Only ${remaining} API calls remaining, skipping compatibility checks`);
        return true;
      }
      
      return false;
    } catch (error) {
      // If we can't check rate limits, assume we should be conservative
      console.warn('⚠️ Cannot check rate limits, enabling conservative mode');
      return !this.isAuthenticated; // Skip for unauthenticated users when in doubt
    }
  }

  // Get repositories for a user or organization (now filters by SMART Guidelines compatibility)
  async getRepositories(owner, type = 'user') {
    // Use the new SMART guidelines filtering method
    return this.getSmartGuidelinesRepositories(owner, type);
  }

  // Check if a repository has sushi-config.yaml with smart.who.int.base dependency
  async checkSmartGuidelinesCompatibility(owner, repo, retryCount = 2) {

    // Check cache first to prevent redundant downloads
    const cachedResult = repositoryCompatibilityCache.get(owner, repo);
    if (cachedResult !== null) {
      return { compatible: cachedResult, cached: true };
    }

    // Check if we should skip this API call due to rate limiting
    if (!this.isAuthenticated) {
      try {
        const shouldSkip = await this.shouldSkipApiCalls();
        if (shouldSkip) {
          console.warn(`⚡ Skipping compatibility check for ${owner}/${repo} due to rate limit protection`);
          // Return false but don't cache it since we didn't actually check
          return { 
            compatible: false, 
            skipped: true, 
            reason: 'Rate limit protection - API call skipped' 
          };
        }
      } catch (rateLimitCheckError) {
        console.warn('Could not check rate limits, proceeding with API call:', rateLimitCheckError);
      }
    }

    try {
      // Use authenticated or public API depending on authentication state
      const octokit = this.octokit || await this.createOctokitInstance();
      
      // Try to get sushi-config.yaml from the repository root
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: 'sushi-config.yaml',
      });

      if (data.type === 'file' && data.content) {
        // Decode base64 content (browser-compatible)
        const content = decodeURIComponent(escape(atob(data.content)));
        
        // Check if the content contains smart.who.int.base in dependencies
        const isCompatible = content.includes('smart.who.int.base');
        
        // Cache the result
        repositoryCompatibilityCache.set(owner, repo, isCompatible);
        return { compatible: isCompatible };
      }
      
      // Cache negative result
      repositoryCompatibilityCache.set(owner, repo, false);
      return { compatible: false, reason: 'No sushi-config.yaml file found' };
    } catch (error) {
      // If it's a 404 (file not found), retry once more in case of temporary issues
      if (error.status === 404 && retryCount > 0) {
        console.warn(`File not found for ${owner}/${repo}, retrying... (${retryCount} attempts left)`);
        // Use shorter delay in test environment
        const delay = process.env.NODE_ENV === 'test' ? 10 : 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.checkSmartGuidelinesCompatibility(owner, repo, retryCount - 1);
      }
      
      // Special handling for SAML-protected repositories - fallback to public API
      if (error.status === 403 && error.message.includes('SAML enforcement') && this.octokit) {
        console.log(`SAML-protected repository ${owner}/${repo}, trying public API fallback`);
        
        try {
          // Try with public API (unauthenticated)
          const publicOctokit = await this.createOctokitInstance();
          const { data } = await publicOctokit.rest.repos.getContent({
            owner,
            repo,
            path: 'sushi-config.yaml',
          });

          if (data.type === 'file' && data.content) {
            // Decode base64 content (browser-compatible)
            const content = decodeURIComponent(escape(atob(data.content)));
            
            // Check if the content contains smart.who.int.base in dependencies
            const isCompatible = content.includes('smart.who.int.base');
            
            if (isCompatible) {
              console.log(`Repository ${owner}/${repo} is compatible via public API despite SAML protection`);
              
              // Cache the result
              repositoryCompatibilityCache.set(owner, repo, true);
              return { 
                compatible: true, 
                reason: 'SMART Guidelines DAK (SAML-protected, verified via public API)',
                requiresAuthentication: true
              };
            } else {
              // Cache negative result
              repositoryCompatibilityCache.set(owner, repo, false);
              return { compatible: false, reason: 'No smart.who.int.base dependency found (via public API)' };
            }
          }
        } catch (publicApiError) {
          console.warn(`Public API fallback also failed for ${owner}/${repo}:`, publicApiError.message);
          // Continue to normal error handling
        }
      }
      
      // For any other error (including rate limiting, network errors, or file not found after retries),
      // return error information instead of just logging
      const errorInfo = {
        compatible: false,
        error: error.message,
        errorType: this._categorizeError(error),
        status: error.status,
        retryable: this._isRetryableError(error)
      };

      console.warn(`Failed to check ${owner}/${repo} for sushi-config.yaml with smart.who.int.base dependency:`, error.message);
      
      // Cache negative result
      repositoryCompatibilityCache.set(owner, repo, false);
      return errorInfo;
    }
  }

  // Helper method to categorize errors
  _categorizeError(error) {
    if (error.status === 403) {
      if (error.message.includes('rate limit')) {
        return 'rate_limit';
      }
      return 'permission_denied';
    }
    if (error.status === 404) {
      return 'not_found';
    }
    if (error.status === 401) {
      return 'authentication_failed';
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
      return 'network_error';
    }
    return 'unknown_error';
  }

  // Helper method to determine if error is retryable
  _isRetryableError(error) {
    return ['rate_limit', 'network_error'].includes(this._categorizeError(error));
  }



  // Get repositories that are SMART guidelines compatible
  async getSmartGuidelinesRepositories(owner, type = 'user', skipCompatibilityCheck = false) {
    try {
      let repositories = [];
      
      if (this.isAuth()) {
        // Use authenticated API for full access
        let page = 1;
        let hasMorePages = true;

        // Fetch all repositories using pagination
        while (hasMorePages) {
          let response;
          if (type === 'user') {
            response = await this.octokit.rest.repos.listForUser({
              username: owner,
              sort: 'updated',
              per_page: 100,
              page: page,
            });
          } else {
            response = await this.octokit.rest.repos.listForOrg({
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
      } else {
        // Use public API for unauthenticated access (only public repositories)
        repositories = await this.getPublicRepositories(owner, type);
      }

      // Skip compatibility checks if requested (to avoid rate limiting for unauthenticated users)
      if (skipCompatibilityCheck) {
        console.log(`⚡ Skipping compatibility checks for ${repositories.length} repositories to avoid rate limiting`);
        return repositories.map(repo => ({
          ...repo,
          smart_guidelines_compatible: true // Assume compatible when skipping checks
        }));
      }

      // Check each repository for SMART guidelines compatibility
      const smartGuidelinesRepos = [];
      for (const repo of repositories) {
        const compatibilityResult = await this.checkSmartGuidelinesCompatibility(repo.owner.login, repo.name);
        if (compatibilityResult.compatible) {
          smartGuidelinesRepos.push({
            ...repo,
            smart_guidelines_compatible: true
          });
        }
      }

      return smartGuidelinesRepos;
    } catch (error) {
      console.error('Failed to fetch SMART guidelines repositories:', error);
      throw error;
    }
  }

  // Get repositories with progressive scanning (for real-time updates)
  async getSmartGuidelinesRepositoriesProgressive(owner, type = 'user', onRepositoryFound = null, onProgress = null, onError = null) {
    try {
      let repositories = [];
      let page = 1;
      let hasMorePages = true;

      if (this.isAuth()) {
        // Fetch all repositories using pagination when authenticated
        while (hasMorePages) {
          let response;
          if (type === 'user') {
            response = await this.octokit.rest.repos.listForUser({
              username: owner,
              sort: 'updated',
              per_page: 100,
              page: page,
            });
          } else {
            response = await this.octokit.rest.repos.listForOrg({
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
      } else {
        // Use public API for unauthenticated access (only public repositories)
        repositories = await this.getPublicRepositories(owner, type);
      }

      // Handle case where user has no repositories
      if (repositories.length === 0) {
        console.log('📊 No repositories found for user, completing scan immediately');
        // Call progress callback to indicate completion
        if (onProgress) {
          onProgress({
            current: 0,
            total: 0,
            currentRepo: 'none',
            progress: 100,
            completed: true
          });
        }
        return [];
      }

      // Track scanning errors for reporting
      const scanningErrors = {
        rateLimited: [],
        networkErrors: [],
        permissionDenied: [],
        otherErrors: [],
        totalErrors: 0,
        totalScanned: 0
      };

      // Process repositories concurrently with rate limiting and enhanced display
      const processor = async (repo, index) => {
        // Add a small delay to make scanning progress visible (similar to demo mode)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        const compatibilityResult = await this.checkSmartGuidelinesCompatibility(repo.owner.login, repo.name);
        scanningErrors.totalScanned++;

        // Handle the new return format
        if (compatibilityResult.compatible) {
          const smartRepo = {
            ...repo,
            smart_guidelines_compatible: true
          };
          
          // Notify that a repository was found
          if (onRepositoryFound) {
            onRepositoryFound(smartRepo);
          }
          
          return smartRepo;
        } else if (compatibilityResult.error) {
          // Track the error for reporting
          scanningErrors.totalErrors++;
          const errorInfo = {
            repo: repo.name,
            error: compatibilityResult.error,
            errorType: compatibilityResult.errorType,
            retryable: compatibilityResult.retryable
          };

          switch (compatibilityResult.errorType) {
            case 'rate_limit':
              scanningErrors.rateLimited.push(errorInfo);
              break;
            case 'network_error':
              scanningErrors.networkErrors.push(errorInfo);
              break;
            case 'permission_denied':
              scanningErrors.permissionDenied.push(errorInfo);
              break;
            default:
              scanningErrors.otherErrors.push(errorInfo);
          }

          // Report error if callback provided
          if (onError) {
            onError(errorInfo);
          }
        }
        
        return null;
      };

      // Use concurrent processing with max 5 parallel requests
      const results = await processConcurrently(repositories, processor, {
        concurrency: 5,
        onProgress: (completed, total, repo, result) => {
          // Progress callback for completed items
          if (onProgress) {
            const progressData = {
              current: completed,
              total: total,
              currentRepo: repo.name,
              progress: Math.round((completed / total) * 100),
              completed: true,
              scanningErrors: scanningErrors.totalErrors > 0 ? {
                totalErrors: scanningErrors.totalErrors,
                rateLimitedCount: scanningErrors.rateLimited.length,
                networkErrorCount: scanningErrors.networkErrors.length,
                hasRetryableErrors: [...scanningErrors.rateLimited, ...scanningErrors.networkErrors].some(e => e.retryable)
              } : null
            };
            onProgress(progressData);
          }
        },
        onItemStart: (repo, index) => {
          // Progress callback for started items
          if (onProgress) {
            onProgress({
              current: index + 1,
              total: repositories.length,
              currentRepo: repo.name,
              progress: Math.round(((index + 1) / repositories.length) * 100),
              completed: false,
              started: true
            });
          }
        }
      });

      // Filter out null results and collect smart repositories
      const validResults = results.filter(result => result !== null && !result.error);
      
      // Log summary of scanning results
      if (scanningErrors.totalErrors > 0) {
        console.warn(`Repository scanning completed with ${scanningErrors.totalErrors} errors out of ${scanningErrors.totalScanned} repositories checked:`);
        if (scanningErrors.rateLimited.length > 0) {
          console.warn(`- Rate limited: ${scanningErrors.rateLimited.length} repositories`);
        }
        if (scanningErrors.networkErrors.length > 0) {
          console.warn(`- Network errors: ${scanningErrors.networkErrors.length} repositories`);
        }
        if (scanningErrors.permissionDenied.length > 0) {
          console.warn(`- Permission denied: ${scanningErrors.permissionDenied.length} repositories`);
        }
        if (scanningErrors.otherErrors.length > 0) {
          console.warn(`- Other errors: ${scanningErrors.otherErrors.length} repositories`);
        }
      }

      // Return results along with error summary
      return {
        repositories: validResults,
        scanningErrors: scanningErrors.totalErrors > 0 ? scanningErrors : null
      };
    } catch (error) {
      console.error('Failed to fetch SMART guidelines repositories:', error);
      throw error;
    }
  }

  // Get a specific repository
  async getRepository(owner, repo) {
    try {
      // Use authenticated octokit if available, otherwise create a public instance for public repos
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      
      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch repository:', error);
      throw error;
    }  
  }

  // Get repository branches
  async getBranches(owner, repo) {
    try {
      console.log(`githubService.getBranches: Fetching branches for ${owner}/${repo}`);
      console.log('githubService.getBranches: Authentication status:', this.isAuth());
      
      // Use authenticated octokit if available, otherwise create a public instance for public repos
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      console.log('githubService.getBranches: Using', this.isAuth() ? 'authenticated' : 'public', 'octokit instance');
      
      const { data } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100
      });
      
      console.log(`githubService.getBranches: Successfully fetched ${data.length} branches`);
      return data;
    } catch (error) {
      console.error('githubService.getBranches: Failed to fetch branches:', error);
      console.error('githubService.getBranches: Error details:', {
        status: error.status,
        message: error.message,
        owner,
        repo
      });
      throw error;
    }
  }

  // Create a new branch
  async createBranch(owner, repo, branchName, fromBranch = 'main') {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      // First get the SHA of the source branch
      const { data: refData } = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranch}`
      });

      // Create the new branch
      const { data } = await this.octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha
      });

      return data;
    } catch (error) {
      console.error('Failed to create branch:', error);
      throw error;
    }
  }

  // Get a specific branch
  async getBranch(owner, repo, branch) {
    try {
      // Use authenticated octokit if available, otherwise create a public instance for public repos
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      
      const { data } = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch branch:', error);
      throw error;
    }
  }

  // GitHub Actions API methods
  
  // Get workflows for a repository (using GitHub API to include workflow IDs)
  async getWorkflows(owner, repo) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      // Use GitHub Actions API to get workflows with their IDs
      const { data } = await this.octokit.rest.actions.listRepoWorkflows({
        owner,
        repo
      });

      return data.workflows.map(workflow => ({
        id: workflow.id, // This is the crucial missing piece!
        name: workflow.name,
        filename: workflow.path.split('/').pop(), // Extract filename from path
        path: workflow.path,
        state: workflow.state,
        created_at: workflow.created_at,
        updated_at: workflow.updated_at,
        url: workflow.html_url,
        triggers: ['unknown'], // GitHub API doesn't provide trigger info directly
        lastModified: workflow.updated_at
      }));
    } catch (error) {
      if (error.status === 404) {
        // No workflows or repository not found
        return [];
      }
      console.error('Failed to fetch workflows:', error);
      throw error;
    }
  }

  // Get workflow runs for a repository
  async getWorkflowRuns(owner, repo, options = {}) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const params = {
        owner,
        repo,
        per_page: options.per_page || 10,
        page: options.page || 1
      };

      if (options.branch) {
        params.branch = options.branch;
      }

      if (options.workflow_id) {
        params.workflow_id = options.workflow_id;
      }

      const { data } = await this.octokit.rest.actions.listWorkflowRunsForRepo(params);
      return data;
    } catch (error) {
      console.error('Failed to fetch workflow runs:', error);
      throw error;
    }
  }

  // Get workflow runs for a specific workflow
  async getWorkflowRunsForWorkflow(owner, repo, workflow_id, options = {}) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const params = {
        owner,
        repo,
        workflow_id,
        per_page: options.per_page || 10,
        page: options.page || 1
      };

      if (options.branch) {
        params.branch = options.branch;
      }

      const { data } = await this.octokit.rest.actions.listWorkflowRuns(params);
      return data;
    } catch (error) {
      console.error('Failed to fetch workflow runs for workflow:', error);
      throw error;
    }
  }

  // Trigger a workflow run
  async triggerWorkflow(owner, repo, workflow_id, ref = 'main', inputs = {}) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id,
        ref,
        inputs
      });
      return data;
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
      throw error;
    }
  }

  // Re-run a workflow
  async rerunWorkflow(owner, repo, run_id) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.actions.reRunWorkflow({
        owner,
        repo,
        run_id
      });
      return data;
    } catch (error) {
      console.error('Failed to re-run workflow:', error);
      throw error;
    }
  }

  // Get workflow run logs
  async getWorkflowRunLogs(owner, repo, run_id) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.actions.downloadWorkflowRunLogs({
        owner,
        repo,
        run_id
      });
      return data;
    } catch (error) {
      console.error('Failed to get workflow run logs:', error);
      throw error;
    }
  }

  // Approve a workflow run
  async approveWorkflowRun(owner, repo, run_id) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.actions.approveWorkflowRun({
        owner,
        repo,
        run_id
      });
      return data;
    } catch (error) {
      console.error('Failed to approve workflow run:', error);
      throw error;
    }
  }

  // Get commit comparison (diff)
  async getCommitDiff(owner, repo, base, head) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.repos.compareCommits({
        owner,
        repo,
        base,
        head
      });
      return data;
    } catch (error) {
      console.error('Failed to get commit diff:', error);
      throw error;
    }
  }

  // Get commit details
  async getCommit(owner, repo, sha) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: sha
      });
      return data;
    } catch (error) {
      console.error('Failed to get commit details:', error);
      throw error;
    }
  }

  // Releases API methods

  // Get releases for a repository
  async getReleases(owner, repo, options = {}) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.repos.listReleases({
        owner,
        repo,
        per_page: options.per_page || 10,
        page: options.page || 1
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch releases:', error);
      throw error;
    }
  }

  // Get latest release
  async getLatestRelease(owner, repo) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.repos.getLatestRelease({
        owner,
        repo
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch latest release:', error);
      throw error;
    }
  }

  // Recursively fetch BPMN files from a directory and its subdirectories
  async getBpmnFilesRecursive(owner, repo, path, ref = 'main', allFiles = []) {
    try {
      console.log(`🔎 githubService.getBpmnFilesRecursive: Searching ${owner}/${repo}/${path} (ref: ${ref})`);
      // Use authenticated octokit if available, otherwise create a public instance
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      console.log(`🔐 githubService.getBpmnFilesRecursive: Using ${this.isAuth() ? 'authenticated' : 'public'} octokit`);
      
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      console.log(`📦 githubService.getBpmnFilesRecursive: Received data type: ${Array.isArray(data) ? 'array' : 'single file'}, length: ${Array.isArray(data) ? data.length : 1}`);

      // Handle single file response
      if (!Array.isArray(data)) {
        if (data.name.endsWith('.bpmn')) {
          console.log(`📄 githubService.getBpmnFilesRecursive: Found single BPMN file: ${data.name}`);
          allFiles.push(data);
        }
        return allFiles;
      }

      // Handle directory response
      for (const item of data) {
        if (item.type === 'file' && item.name.endsWith('.bpmn')) {
          console.log(`📄 githubService.getBpmnFilesRecursive: Found BPMN file: ${item.name}`);
          allFiles.push(item);
        } else if (item.type === 'dir') {
          console.log(`📁 githubService.getBpmnFilesRecursive: Found subdirectory: ${item.name}, recursing...`);
          // Recursively search subdirectories
          await this.getBpmnFilesRecursive(owner, repo, item.path, ref, allFiles);
        }
      }

      console.log(`✅ githubService.getBpmnFilesRecursive: Completed search of ${path}, found ${allFiles.length} total files so far`);
      return allFiles;
    } catch (error) {
      console.log(`❌ githubService.getBpmnFilesRecursive: Error searching ${path}:`, error.status, error.message);
      // If directory doesn't exist, return empty array (not an error)
      if (error.status === 404) {
        return allFiles;
      }
      throw error;
    }
  }

  // Get all BPMN files from a repository's business process directories
  async getBpmnFiles(owner, repo, ref = 'main') {
    console.log(`🔍 githubService.getBpmnFiles: Starting search for ${owner}/${repo} (ref: ${ref})`);
    const allBpmnFiles = [];
    
    // Search for BPMN files in the specified business process directories
    const possiblePaths = [
      'input/business-processes',
      'input/business-process'
    ];

    for (const path of possiblePaths) {
      try {
        console.log(`📁 githubService.getBpmnFiles: Searching in directory: ${path}`);
        const files = await this.getBpmnFilesRecursive(owner, repo, path, ref);
        console.log(`✅ githubService.getBpmnFiles: Found ${files.length} BPMN files in ${path}`);
        allBpmnFiles.push(...files);
      } catch (error) {
        // Only log warnings for unexpected errors (not 404s which are expected when directories don't exist)
        if (error.status !== 404) {
          console.warn(`❌ Could not fetch BPMN files from ${path}:`, error.message);
        } else {
          console.log(`📂 githubService.getBpmnFiles: Directory ${path} not found (404) - this is expected if the directory doesn't exist`);
        }
        // Continue trying other paths
      }
    }

    // Remove duplicates based on path (in case both directories exist and have overlapping files)
    const uniqueFiles = allBpmnFiles.filter((file, index, self) => 
      index === self.findIndex(f => f.path === file.path)
    );

    console.log(`🎯 githubService.getBpmnFiles: Final result - ${uniqueFiles.length} unique BPMN files found`);
    console.log(`📋 githubService.getBpmnFiles: File list:`, uniqueFiles.map(f => f.name));
    return uniqueFiles;
  }

  // Get file content from GitHub repository with timeout handling
  async getFileContent(owner, repo, path, ref = 'main') {
    const timeoutMs = 15000; // 15 second timeout
    
    try {
      console.log(`🚀 githubService.getFileContent: Starting request for ${owner}/${repo}/${path} (ref: ${ref})`);
      console.log('🔐 githubService.getFileContent: Authentication status:', this.isAuth());
      console.log('📋 githubService.getFileContent: Request parameters:', { owner, repo, path, ref });
      
      // Use authenticated octokit if available, otherwise create a public instance for public repos
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      console.log('🔧 githubService.getFileContent: Using', this.isAuth() ? 'authenticated' : 'public', 'octokit instance');
      
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise((_, reject) => {
        console.log(`⏰ githubService.getFileContent: Setting up ${timeoutMs}ms timeout`);
        setTimeout(() => {
          console.error(`⏰ githubService.getFileContent: Request timed out after ${timeoutMs}ms`);
          reject(new Error(`Request timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Race the GitHub API call against the timeout
      console.log('🌐 githubService.getFileContent: Creating GitHub API promise...');
      const apiPromise = octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });
      
      console.log('📡 githubService.getFileContent: API request initiated, waiting for response...');
      const startTime = Date.now();
      
      const { data } = await Promise.race([apiPromise, timeoutPromise]);
      const responseTime = Date.now() - startTime;
      
      console.log(`✅ githubService.getFileContent: API response received in ${responseTime}ms`);
      console.log('📂 githubService.getFileContent: Response data type:', data.type);
      console.log('📊 githubService.getFileContent: Response details:', {
        type: data.type,
        name: data.name,
        size: data.size,
        encoding: data.encoding,
        hasContent: !!data.content
      });

      // Handle file content
      if (data.type === 'file' && data.content) {
        // Decode base64 content
        console.log('🔧 githubService.getFileContent: Decoding base64 content...');
        console.log('📊 githubService.getFileContent: Base64 content length:', data.content.length);
        
        try {
          // Use modern Buffer approach for reliable base64 decoding
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          console.log(`✅ githubService.getFileContent: Successfully fetched and decoded file content`);
          console.log('📏 githubService.getFileContent: Final content length:', content.length, 'characters');
          console.log('👀 githubService.getFileContent: Content preview (first 200 chars):', content.substring(0, 200));
          
          return content;
        } catch (decodeError) {
          console.error('❌ githubService.getFileContent: Base64 decoding failed:', decodeError);
          console.error('🔍 githubService.getFileContent: Raw base64 content preview:', data.content.substring(0, 100));
          throw new Error(`Failed to decode file content: ${decodeError.message}`);
        }
      } else {
        console.error('❌ githubService.getFileContent: Invalid response - not a file or no content');
        console.error('🔍 githubService.getFileContent: Full response data:', JSON.stringify(data, null, 2));
        throw new Error('File not found or is not a file');
      }
    } catch (error) {
      console.error(`💥 githubService.getFileContent: Failed to fetch file content from ${owner}/${repo}/${path}:`, error);
      console.error('🔍 githubService.getFileContent: Error analysis:', {
        type: typeof error,
        status: error.status,
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500) + '...'
      });
      
      // Provide more specific error messages
      if (error.message.includes('timeout')) {
        console.error('⏰ githubService.getFileContent: Timeout error detected');
        throw new Error(`GitHub API request timed out after ${timeoutMs / 1000} seconds. Please try again.`);
      } else if (error.status === 403) {
        console.error('🔒 githubService.getFileContent: 403 Forbidden error detected');
        throw new Error('Access denied. This repository may be private or you may have hit rate limits.');
      } else if (error.status === 404) {
        console.error('🔍 githubService.getFileContent: 404 Not Found error detected');
        throw new Error('File not found in the repository.');
      } else if (error.message.includes('rate limit')) {
        console.error('🚦 githubService.getFileContent: Rate limit error detected');
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        console.error('🌐 githubService.getFileContent: Network error detected');
        throw new Error('Network error occurred. Please check your internet connection and try again.');
      }
      
      console.error('❓ githubService.getFileContent: Unknown error type, re-throwing original error');
      throw error;
    }
  }

  // Create a commit with multiple files
  async createCommit(owner, repo, branch, message, files) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      // Get the latest commit SHA
      const { data: refData } = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${branch}`
      });
      const latestCommitSha = refData.object.sha;

      // Get the tree SHA from the latest commit
      const { data: commitData } = await this.octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: latestCommitSha
      });
      const baseTreeSha = commitData.tree.sha;

      // Create blobs for all files
      const blobs = await Promise.all(
        files.map(async (file) => {
          const { data: blobData } = await this.octokit.rest.git.createBlob({
            owner,
            repo,
            content: file.content,
            encoding: 'utf-8'
          });
          return {
            path: file.path,
            mode: '100644',
            type: 'blob',
            sha: blobData.sha
          };
        })
      );

      // Create a new tree with the blobs
      const { data: treeData } = await this.octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: baseTreeSha,
        tree: blobs
      });

      // Create the commit
      const { data: newCommitData } = await this.octokit.rest.git.createCommit({
        owner,
        repo,
        message,
        tree: treeData.sha,
        parents: [latestCommitSha]
      });

      // Update the branch reference
      await this.octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${branch}`,
        sha: newCommitData.sha
      });

      return {
        sha: newCommitData.sha,
        html_url: `https://github.com/${owner}/${repo}/commit/${newCommitData.sha}`,
        message: newCommitData.message,
        author: newCommitData.author,
        committer: newCommitData.committer
      };
    } catch (error) {
      console.error('Failed to create commit:', error);
      throw error;
    }
  }

  // Get recent commits for a repository branch
  async getRecentCommits(owner, repo, branch = 'main', per_page = 5) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/commits`, { sha: branch, per_page });

    try {
      const response = await this.octokit.rest.repos.listCommits({
        owner,
        repo,
        sha: branch,
        per_page
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/commits`, response.status, Date.now() - startTime);
      
      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date
        },
        html_url: commit.html_url,
        stats: commit.stats
      }));
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/commits`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to fetch recent commits:', error);
      throw error;
    }
  }

  // Get open pull requests count
  async getOpenPullRequestsCount(owner, repo) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/pulls`, { state: 'open', per_page: 1 });

    try {
      const response = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 1
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls`, response.status, Date.now() - startTime);
      
      // GitHub includes the total count in the response headers
      const linkHeader = response.headers.link;
      if (linkHeader && linkHeader.includes('rel="last"')) {
        const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (lastPageMatch) {
          return parseInt(lastPageMatch[1], 10);
        }
      }
      
      // Fallback: use the length of returned items (may not be accurate for large counts)
      return response.data.length;
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to fetch pull requests count:', error);
      throw error;
    }
  }

  // Get pull request for a specific branch (returns first PR only for backward compatibility)
  async getPullRequestForBranch(owner, repo, branchName) {
    const prs = await this.getPullRequestsForBranch(owner, repo, branchName);
    return prs && prs.length > 0 ? prs[0] : null;
  }

  // Get all pull requests for a specific branch
  async getPullRequestsForBranch(owner, repo, branchName) {
    // Use authenticated octokit if available, otherwise create a public instance for public repos
    const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/pulls`, { state: 'open', head: `${owner}:${branchName}` });

    try {
      const response = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        head: `${owner}:${branchName}`,
        per_page: 100 // Get up to 100 PRs for a branch
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls`, response.status, Date.now() - startTime);
      
      // Return all matching PRs or empty array if none found
      return response.data || [];
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to fetch pull requests for branch:', error);
      return []; // Return empty array instead of throwing to allow graceful fallback
    }
  }

  // Get pull request comments
  async getPullRequestComments(owner, repo, pullNumber, page = 1, per_page = 100) {
    // Use authenticated octokit if available, otherwise create a public instance for public repos
    const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, { page, per_page });

    try {
      const response = await octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number: pullNumber,
        page,
        per_page
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, response.status, Date.now() - startTime);
      return response.data;
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to fetch pull request comments:', error);
      throw error;
    }
  }

  // Get pull request issue comments (general comments on the PR conversation)
  async getPullRequestIssueComments(owner, repo, pullNumber, page = 1, per_page = 100) {
    // Use authenticated octokit if available, otherwise create a public instance for public repos
    const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/issues/${pullNumber}/comments`, { page, per_page });

    try {
      const response = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: pullNumber,
        page,
        per_page
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/issues/${pullNumber}/comments`, response.status, Date.now() - startTime);
      return response.data;
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/issues/${pullNumber}/comments`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to fetch pull request issue comments:', error);
      throw error;
    }
  }

  // Create a comment on a pull request
  async createPullRequestComment(owner, repo, pullNumber, body) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    const startTime = Date.now();
    this.logger.apiCall('POST', `/repos/${owner}/${repo}/issues/${pullNumber}/comments`, { body });

    try {
      const response = await this.octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body
      });

      this.logger.apiResponse('POST', `/repos/${owner}/${repo}/issues/${pullNumber}/comments`, response.status, Date.now() - startTime);
      return response.data;
    } catch (error) {
      this.logger.apiResponse('POST', `/repos/${owner}/${repo}/issues/${pullNumber}/comments`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to create pull request comment:', error);
      throw error;
    }
  }

  // Get pull request timeline events (status updates, reviews, etc.)
  async getPullRequestTimeline(owner, repo, pullNumber, page = 1, per_page = 100) {
    // Use authenticated octokit if available, otherwise create a public instance for public repos
    const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/issues/${pullNumber}/timeline`, { page, per_page });

    try {
      const response = await octokit.rest.issues.listEventsForTimeline({
        owner,
        repo,
        issue_number: pullNumber,
        page,
        per_page
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/issues/${pullNumber}/timeline`, response.status, Date.now() - startTime);
      return response.data;
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/issues/${pullNumber}/timeline`, error.status || 'error', Date.now() - startTime);
      console.debug('Failed to fetch pull request timeline:', error);
      return []; // Return empty array for graceful fallback
    }
  }

  // Merge a pull request
  async mergePullRequest(owner, repo, pullNumber, options = {}) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    const startTime = Date.now();
    this.logger.apiCall('PUT', `/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, options);

    try {
      const mergeOptions = {
        owner,
        repo,
        pull_number: pullNumber,
        commit_title: options.commit_title,
        commit_message: options.commit_message,
        merge_method: options.merge_method || 'merge', // 'merge', 'squash', or 'rebase'
        ...options
      };

      const response = await this.octokit.rest.pulls.merge(mergeOptions);

      this.logger.apiResponse('PUT', `/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, response.status, Date.now() - startTime);
      return response.data;
    } catch (error) {
      this.logger.apiResponse('PUT', `/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to merge pull request:', error);
      throw error;
    }
  }

  // Check if the current user can merge a specific pull request
  async checkPullRequestMergePermissions(owner, repo, pullNumber) {
    if (!this.isAuth()) {
      this.logger.warn('Cannot check PR merge permissions - not authenticated', { owner, repo, pullNumber });
      return false;
    }

    try {
      const startTime = Date.now();
      this.logger.apiCall('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}`, {});

      // Get the pull request details to check mergeable state and permissions
      const response = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}`, response.status, Date.now() - startTime);
      
      const pr = response.data;
      
      // Check if PR is in a mergeable state
      if (pr.state !== 'open') {
        this.logger.debug('PR not mergeable - not open', { owner, repo, pullNumber, state: pr.state });
        return false;
      }

      if (pr.draft) {
        this.logger.debug('PR not mergeable - is draft', { owner, repo, pullNumber });
        return false;
      }

      // Check if the user has write permissions to the repository
      const hasWriteAccess = await this.checkRepositoryWritePermissions(owner, repo);
      if (!hasWriteAccess) {
        this.logger.debug('PR not mergeable - no write access', { owner, repo, pullNumber });
        return false;
      }

      // Additional checks could include:
      // - Required status checks
      // - Required reviews
      // - Admin enforcement
      // For now, we'll rely on the GitHub API to provide proper error messages when merge is attempted

      return true;
    } catch (error) {
      this.logger.warn('Error checking PR merge permissions', { owner, repo, pullNumber, error: error.message });
      return false;
    }
  }

  // Get open issues count
  async getOpenIssuesCount(owner, repo) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/issues`, { state: 'open', per_page: 1 });

    try {
      const response = await this.octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 1
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/issues`, response.status, Date.now() - startTime);
      
      // GitHub includes the total count in the response headers
      const linkHeader = response.headers.link;
      if (linkHeader && linkHeader.includes('rel="last"')) {
        const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (lastPageMatch) {
          return parseInt(lastPageMatch[1], 10);
        }
      }
      
      // Fallback: use the length of returned items (may not be accurate for large counts)
      return response.data.length;
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/issues`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to fetch issues count:', error);
      throw error;
    }
  }

  // Get repository statistics (combined method for efficiency)
  async getRepositoryStats(owner, repo, branch = 'main') {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const [recentCommits, openPRsCount, openIssuesCount] = await Promise.allSettled([
        this.getRecentCommits(owner, repo, branch, 1),
        this.getOpenPullRequestsCount(owner, repo),
        this.getOpenIssuesCount(owner, repo)
      ]);

      return {
        recentCommits: recentCommits.status === 'fulfilled' ? recentCommits.value : [],
        openPullRequestsCount: openPRsCount.status === 'fulfilled' ? openPRsCount.value : 0,
        openIssuesCount: openIssuesCount.status === 'fulfilled' ? openIssuesCount.value : 0,
        errors: {
          recentCommits: recentCommits.status === 'rejected' ? recentCommits.reason : null,
          openPullRequestsCount: openPRsCount.status === 'rejected' ? openPRsCount.reason : null,
          openIssuesCount: openIssuesCount.status === 'rejected' ? openIssuesCount.reason : null
        }
      };
    } catch (error) {
      console.error('Failed to fetch repository stats:', error);
      throw error;
    }
  }

  // Get directory contents (supports both authenticated and unauthenticated access)
  async getDirectoryContents(owner, repo, path = '', ref = 'main') {
    try {
      // Create temporary Octokit instance for unauthenticated access if needed
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(data)) {
        return data;
      } else {
        throw new Error('Not a directory');
      }
    } catch (error) {
      console.error(`Failed to get directory contents for ${path}:`, error);
      throw error;
    }
  }

  // Update file content (requires authentication)
  async updateFile(owner, repo, path, content, message, branch = 'main') {
    if (!this.isAuth()) {
      throw new Error('Authentication required to update files');
    }

    try {
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

      return data;
    } catch (error) {
      console.error(`Failed to update file ${path}:`, error);
      throw error;
    }
  }

  // Get commits for a repository (supports unauthenticated access)
  async getCommits(owner, repo, options = {}) {
    try {
      // Create temporary Octokit instance for unauthenticated access if needed
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      
      const params = {
        owner,
        repo,
        per_page: options.per_page || 10,
        page: options.page || 1
      };

      if (options.sha) {
        params.sha = options.sha;
      }

      if (options.since) {
        params.since = options.since;
      }

      if (options.until) {
        params.until = options.until;
      }

      const { data } = await octokit.rest.repos.listCommits(params);
      return data;
    } catch (error) {
      console.error('Failed to fetch commits:', error);
      throw error;
    }
  }

  // Get issues for a repository (supports unauthenticated access)
  async getIssues(owner, repo, options = {}) {
    try {
      // Create temporary Octokit instance for unauthenticated access if needed
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      
      const params = {
        owner,
        repo,
        state: options.state || 'all',
        per_page: options.per_page || 30,
        page: options.page || 1
      };

      if (options.labels) {
        params.labels = options.labels;
      }

      if (options.milestone) {
        params.milestone = options.milestone;
      }

      const { data } = await octokit.rest.issues.listForRepo(params);
      return data;
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      throw error;
    }
  }

  // Alias method for backward compatibility - delegates to getIssues
  async getRepositoryIssues(owner, repo, options = {}) {
    return this.getIssues(owner, repo, options);
  }

  // Get repository forks
  async getForks(owner, repo, options = {}) {
    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/forks`, options);

    try {
      // Use the GitHub API to fetch forks, no authentication required for public repos
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      
      const params = {
        owner,
        repo,
        sort: options.sort || 'newest',
        per_page: options.per_page || 100,
        page: options.page || 1
      };

      const { data } = await octokit.rest.repos.listForks(params);
      
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/forks`, 200, Date.now() - startTime);
      
      // Return formatted fork data
      return data.map(fork => ({
        id: fork.id,
        name: fork.name,
        full_name: fork.full_name,
        owner: {
          login: fork.owner.login,
          avatar_url: fork.owner.avatar_url,
          html_url: fork.owner.html_url,
          type: fork.owner.type
        },
        description: fork.description,
        html_url: fork.html_url,
        clone_url: fork.clone_url,
        created_at: fork.created_at,
        updated_at: fork.updated_at,
        pushed_at: fork.pushed_at,
        stargazers_count: fork.stargazers_count,
        forks_count: fork.forks_count,
        open_issues_count: fork.open_issues_count,
        default_branch: fork.default_branch,
        private: fork.private,
        fork: fork.fork,
        parent: fork.parent ? {
          full_name: fork.parent.full_name,
          html_url: fork.parent.html_url
        } : null
      }));
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/forks`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to fetch repository forks:', error);
      throw error;
    }
  }

  // Get pull requests for a specific repository
  async getPullRequests(owner, repo, options = {}) {
    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/pulls`, options);

    try {
      // Use the GitHub API to fetch pull requests, no authentication required for public repos
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      
      const params = {
        owner,
        repo,
        state: options.state || 'open',
        sort: options.sort || 'updated',
        direction: options.direction || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      };

      // Add optional filters
      if (options.head) {
        params.head = options.head;
      }
      if (options.base) {
        params.base = options.base;
      }

      const { data } = await octokit.rest.pulls.list(params);
      
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls`, 200, Date.now() - startTime);
      
      // Return formatted pull request data
      return data.map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        locked: pr.locked,
        user: {
          login: pr.user.login,
          avatar_url: pr.user.avatar_url,
          html_url: pr.user.html_url,
          type: pr.user.type
        },
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        closed_at: pr.closed_at,
        merged_at: pr.merged_at,
        html_url: pr.html_url,
        diff_url: pr.diff_url,
        patch_url: pr.patch_url,
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
          repo: pr.head.repo ? {
            name: pr.head.repo.name,
            full_name: pr.head.repo.full_name,
            owner: {
              login: pr.head.repo.owner.login,
              avatar_url: pr.head.repo.owner.avatar_url
            },
            html_url: pr.head.repo.html_url
          } : null
        },
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
          repo: {
            name: pr.base.repo.name,
            full_name: pr.base.repo.full_name,
            owner: {
              login: pr.base.repo.owner.login,
              avatar_url: pr.base.repo.owner.avatar_url
            },
            html_url: pr.base.repo.html_url
          }
        },
        draft: pr.draft,
        mergeable: pr.mergeable,
        mergeable_state: pr.mergeable_state,
        comments: pr.comments,
        review_comments: pr.review_comments,
        commits: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files
      }));
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to fetch pull requests:', error);
      throw error;
    }
  }

  // Create an issue (requires authentication)
  async createIssue(owner, repo, title, body, labels = [], assignees = []) {
    if (!this.isAuth()) {
      throw new Error('Authentication required to create issues');
    }

    const startTime = Date.now();
    this.logger.apiCall('POST', `/repos/${owner}/${repo}/issues`, { title, bodyLength: body?.length, labels, assignees });

    try {
      const params = {
        owner,
        repo,
        title,
        body
      };

      // Add optional parameters if provided
      if (labels.length > 0) {
        params.labels = labels;
      }
      
      if (assignees.length > 0) {
        params.assignees = assignees;
      }

      const response = await this.octokit.rest.issues.create(params);
      
      this.logger.apiResponse('POST', `/repos/${owner}/${repo}/issues`, response.status, Date.now() - startTime);
      
      return {
        success: true,
        issue: {
          id: response.data.id,
          number: response.data.number,
          title: response.data.title,
          body: response.data.body,
          html_url: response.data.html_url,
          state: response.data.state,
          created_at: response.data.created_at,
          user: {
            login: response.data.user.login,
            avatar_url: response.data.user.avatar_url
          },
          labels: response.data.labels.map(label => ({
            name: label.name,
            color: label.color
          }))
        }
      };
    } catch (error) {
      this.logger.apiResponse('POST', `/repos/${owner}/${repo}/issues`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to create issue:', error);
      
      // Return structured error response
      return {
        success: false,
        error: {
          message: error.message,
          status: error.status,
          type: error.status === 403 ? 'permission_denied' : 
                error.status === 422 ? 'validation_error' : 
                error.status === 404 ? 'repository_not_found' : 'unknown_error'
        }
      };
    }
  }

  // Get a specific issue
  async getIssue(owner, repo, issueNumber) {
    if (!this.isAuth()) {
      throw new Error('Authentication required to get issue details');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/issues/${issueNumber}`);

    try {
      const response = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/issues/${issueNumber}`, response.status, Date.now() - startTime);

      return {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        body: response.data.body,
        html_url: response.data.html_url,
        state: response.data.state,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        closed_at: response.data.closed_at,
        user: {
          login: response.data.user.login,
          avatar_url: response.data.user.avatar_url
        },
        labels: response.data.labels.map(label => ({
          name: label.name,
          color: label.color
        }))
      };
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/issues/${issueNumber}`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to get issue:', error);
      throw error;
    }
  }

  // Get a specific pull request
  async getPullRequest(owner, repo, pullNumber) {
    if (!this.isAuth()) {
      throw new Error('Authentication required to get pull request details');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}`);

    try {
      const response = await this.octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}`, response.status, Date.now() - startTime);

      return {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        body: response.data.body,
        html_url: response.data.html_url,
        state: response.data.state,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        closed_at: response.data.closed_at,
        merged_at: response.data.merged_at,
        user: {
          login: response.data.user.login,
          avatar_url: response.data.user.avatar_url
        },
        head: {
          ref: response.data.head.ref,
          sha: response.data.head.sha
        },
        base: {
          ref: response.data.base.ref,
          sha: response.data.base.sha
        }
      };
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to get pull request:', error);
      throw error;
    }
  }

  // Search issues using GitHub search API
  async searchIssues(query, options = {}) {
    if (!this.isAuth()) {
      throw new Error('Authentication required to search issues');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', '/search/issues', { query, type: 'issue' });

    try {
      const response = await this.octokit.rest.search.issuesAndPullRequests({
        q: query,
        sort: options.sort || 'created',
        order: options.order || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      });

      this.logger.apiResponse('GET', '/search/issues', response.status, Date.now() - startTime);

      return {
        total_count: response.data.total_count,
        incomplete_results: response.data.incomplete_results,
        items: response.data.items.map(item => ({
          id: item.id,
          number: item.number,
          title: item.title,
          body: item.body,
          html_url: item.html_url,
          state: item.state,
          created_at: item.created_at,
          updated_at: item.updated_at,
          closed_at: item.closed_at,
          labels: item.labels || [],
          user: {
            login: item.user.login,
            avatar_url: item.user.avatar_url
          },
          repository: item.repository_url ? {
            name: item.repository_url.split('/').slice(-1)[0],
            full_name: item.repository_url.split('/').slice(-2).join('/')
          } : null
        }))
      };
    } catch (error) {
      this.logger.apiResponse('GET', '/search/issues', error.status || 'error', Date.now() - startTime);
      console.error('Failed to search issues:', error);
      throw error;
    }
  }

  // Search pull requests using GitHub search API
  async searchPullRequests(query, options = {}) {
    if (!this.isAuth()) {
      throw new Error('Authentication required to search pull requests');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', '/search/issues', { query, type: 'pr' });

    try {
      const response = await this.octokit.rest.search.issuesAndPullRequests({
        q: query,
        sort: options.sort || 'created',
        order: options.order || 'desc',
        per_page: options.per_page || 30,
        page: options.page || 1
      });

      this.logger.apiResponse('GET', '/search/issues', response.status, Date.now() - startTime);

      return {
        total_count: response.data.total_count,
        incomplete_results: response.data.incomplete_results,
        items: response.data.items.map(item => ({
          id: item.id,
          number: item.number,
          title: item.title,
          body: item.body,
          html_url: item.html_url,
          state: item.state,
          created_at: item.created_at,
          updated_at: item.updated_at,
          closed_at: item.closed_at,
          user: {
            login: item.user.login,
            avatar_url: item.user.avatar_url
          },
          repository: item.repository_url ? {
            name: item.repository_url.split('/').slice(-1)[0],
            full_name: item.repository_url.split('/').slice(-2).join('/')
          } : null
        }))
      };
    } catch (error) {
      this.logger.apiResponse('GET', '/search/issues', error.status || 'error', Date.now() - startTime);
      console.error('Failed to search pull requests:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    this.logger.auth('Logging out and clearing stored token');
    
    this.octokit = null;
    this.isAuthenticated = false;
    this.tokenType = null;
    this.permissions = null;
    
    // Clear secure token storage
    secureTokenStorage.clearToken();
    
    // Clear branch context on logout
    try {
      const { default: branchContextService } = require('../services/branchContextService');
      branchContextService.clearAllBranchContext();
    } catch (error) {
      // Service might not be available during testing
      sessionStorage.removeItem('sgex_branch_context');
    }
  }

  // Get repository forks
  async getRepositoryForks(owner, repo, options = {}) {
    const startTime = Date.now();
    this.logger.debug('Fetching repository forks', { owner, repo, options });

    try {
      // Create temporary Octokit instance for unauthenticated access if needed
      const octokit = this.isAuth() ? this.octokit : await this.createOctokitInstance();
      
      this.logger.apiCall('GET', `/repos/${owner}/${repo}/forks`, options);
      
      const { data } = await octokit.rest.repos.listForks({
        owner,
        repo,
        sort: 'newest', // Sort by newest first
        per_page: options.per_page || 100,
        page: options.page || 1
      });

      const duration = Date.now() - startTime;
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/forks`, 200, duration, { forkCount: data.length });
      this.logger.performance('Repository forks fetch', duration);

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.apiError('GET', `/repos/${owner}/${repo}/forks`, error);
      this.logger.performance('Repository forks fetch (failed)', duration);
      console.error(`Failed to fetch forks for ${owner}/${repo}:`, error);
      throw error;
    }
  }

  // Check if the current user can review pull requests
  async checkPullRequestReviewPermissions(owner, repo, pullNumber) {
    try {
      if (!this.isAuth()) {
        return false;
      }

      // Check if user has write access or is a collaborator
      const hasWriteAccess = await this.checkRepositoryWritePermissions(owner, repo);
      
      if (hasWriteAccess) {
        return true;
      }

      // For forks, check if user can review (they need read access at minimum)
      const response = await this.octokit.rest.repos.get({
        owner,
        repo
      });

      return response.status === 200;
    } catch (error) {
      console.debug('Cannot check PR review permissions:', error);
      return false;
    }
  }

  // Create a pull request review (approve, request changes, or comment)
  async createPullRequestReview(owner, repo, pullNumber, event, body = '') {
    if (!this.isAuth()) {
      throw new Error('Authentication required to review pull requests');
    }

    const startTime = Date.now();
    this.logger.apiCall('POST', `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, { event, bodyLength: body?.length });

    try {
      const params = {
        owner,
        repo,
        pull_number: pullNumber,
        event // 'APPROVE', 'REQUEST_CHANGES', or 'COMMENT'
      };

      if (body && body.trim()) {
        params.body = body;
      }

      const response = await this.octokit.rest.pulls.createReview(params);
      
      this.logger.apiResponse('POST', `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, response.status, Date.now() - startTime);
      
      return {
        success: true,
        review: {
          id: response.data.id,
          state: response.data.state,
          body: response.data.body,
          html_url: response.data.html_url,
          submitted_at: response.data.submitted_at,
          user: {
            login: response.data.user.login,
            avatar_url: response.data.user.avatar_url
          }
        }
      };
    } catch (error) {
      this.logger.apiResponse('POST', `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to create pull request review:', error);
      throw error;
    }
  }

  // Approve a pull request
  async approvePullRequest(owner, repo, pullNumber, body = '') {
    return this.createPullRequestReview(owner, repo, pullNumber, 'APPROVE', body);
  }

  // Request changes on a pull request
  async requestPullRequestChanges(owner, repo, pullNumber, body) {
    if (!body || !body.trim()) {
      throw new Error('A comment is required when requesting changes');
    }
    return this.createPullRequestReview(owner, repo, pullNumber, 'REQUEST_CHANGES', body);
  }

  // Dismiss a pull request review
  async dismissPullRequestReview(owner, repo, pullNumber, reviewId, message) {
    if (!this.isAuth()) {
      throw new Error('Authentication required to dismiss reviews');
    }

    const startTime = Date.now();
    this.logger.apiCall('PUT', `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews/${reviewId}/dismissals`, { messageLength: message?.length });

    try {
      const response = await this.octokit.rest.pulls.dismissReview({
        owner,
        repo,
        pull_number: pullNumber,
        review_id: reviewId,
        message: message || 'Review dismissed'
      });
      
      this.logger.apiResponse('PUT', `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews/${reviewId}/dismissals`, response.status, Date.now() - startTime);
      
      return {
        success: true,
        review: response.data
      };
    } catch (error) {
      this.logger.apiResponse('PUT', `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews/${reviewId}/dismissals`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to dismiss pull request review:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const githubService = new GitHubService();

export default githubService;