import { Octokit } from '@octokit/rest';
import { processConcurrently } from '../utils/concurrency';
import repositoryCompatibilityCache from '../utils/repositoryCompatibilityCache';
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

  // Initialize with a GitHub token (supports both OAuth and PAT tokens)
  authenticate(token) {
    const startTime = Date.now();
    this.logger.auth('Starting authentication', { tokenProvided: !!token, tokenLength: token ? token.length : 0 });
    
    try {
      this.octokit = new Octokit({
        auth: token,
      });
      this.isAuthenticated = true;
      
      const duration = Date.now() - startTime;
      this.logger.auth('Authentication successful', { duration });
      this.logger.performance('GitHub authentication', duration);
      
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.auth('Authentication failed', { error: error.message, duration });
      console.error('Failed to authenticate with GitHub:', error);
      this.isAuthenticated = false;
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
      
      const hasWriteAccess = ['write', 'admin'].includes(data.permission);
      this.logger.debug('Repository write permissions checked', { 
        owner, 
        repo, 
        permission: data.permission, 
        hasWriteAccess 
      });
      
      return hasWriteAccess;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.apiError('GET', `/repos/${owner}/${repo}/collaborators/*/permission`, error);
      this.logger.performance('Repository write permission check (failed)', duration);
      
      // If we can't check permissions, assume we don't have write access
      console.warn('Could not check repository write permissions:', error);
      this.logger.warn('Assuming no write access due to permission check failure', { owner, repo, error: error.message });
      return false;
    }
  }

  // Alias method for backward compatibility - delegates to checkRepositoryWritePermissions
  async checkRepositoryPermissions(owner, repo) {
    return this.checkRepositoryWritePermissions(owner, repo);
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
      const octokit = this.octokit || new Octokit();
      
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
      const octokit = this.octokit || new Octokit();
      
      const { data } = await octokit.rest.users.getByUsername({
        username
      });
      return data;
    } catch (error) {
      console.error(`Failed to fetch user ${username}:`, error);
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

  // Get repositories for a user or organization (now filters by SMART Guidelines compatibility)
  async getRepositories(owner, type = 'user', isDemo = false) {
    // Handle demo mode - return demo repositories without requiring authentication
    if (isDemo || owner === 'demo-user') {
      return this.getDemoRepositories(owner);
    }
    
    // Use the new SMART guidelines filtering method
    return this.getSmartGuidelinesRepositories(owner, type);
  }

  // Get demo repositories for demo mode (no authentication required)
  getDemoRepositories(owner) {
    const demoRepos = [
      {
        id: 'demo-smart-anc',
        name: 'smart-anc',
        full_name: `${owner}/smart-anc`,
        description: 'Demo SMART Guidelines Digital Adaptation Kit for Antenatal Care',
        private: false,
        owner: {
          login: owner,
          id: 'demo-owner',
          avatar_url: `https://github.com/${owner}.png`,
          type: 'User'
        },
        html_url: `https://github.com/${owner}/smart-anc`,
        clone_url: `https://github.com/${owner}/smart-anc.git`,
        language: 'FSH',
        stargazers_count: 15,
        forks_count: 3,
        open_issues_count: 2,
        topics: ['who', 'smart-guidelines', 'dak', 'antenatal-care', 'health'],
        created_at: '2023-01-15T10:00:00Z',
        updated_at: '2024-12-15T14:30:00Z',
        pushed_at: '2024-12-15T14:30:00Z',
        default_branch: 'main',
        smart_guidelines_compatible: true,
        isDemo: true
      },
      {
        id: 'demo-smart-tb',
        name: 'smart-tb',
        full_name: `${owner}/smart-tb`,
        description: 'Demo SMART Guidelines Digital Adaptation Kit for Tuberculosis Care',
        private: false,
        owner: {
          login: owner,
          id: 'demo-owner',
          avatar_url: `https://github.com/${owner}.png`,
          type: 'User'
        },
        html_url: `https://github.com/${owner}/smart-tb`,
        clone_url: `https://github.com/${owner}/smart-tb.git`,
        language: 'FSH',
        stargazers_count: 8,
        forks_count: 1,
        open_issues_count: 0,
        topics: ['who', 'smart-guidelines', 'dak', 'tuberculosis', 'health'],
        created_at: '2023-03-20T15:00:00Z',
        updated_at: '2024-11-30T09:15:00Z',
        pushed_at: '2024-11-30T09:15:00Z',
        default_branch: 'main',
        smart_guidelines_compatible: true,
        isDemo: true
      },
      {
        id: 'demo-smart-ips-pilgrimage',
        name: 'smart-ips-pilgrimage',
        full_name: `${owner}/smart-ips-pilgrimage`,
        description: 'Demo SMART Guidelines International Patient Summary for Pilgrimage',
        private: false,
        owner: {
          login: owner,
          id: 'demo-owner',
          avatar_url: `https://github.com/${owner}.png`,
          type: 'User'
        },
        html_url: `https://github.com/${owner}/smart-ips-pilgrimage`,
        clone_url: `https://github.com/${owner}/smart-ips-pilgrimage.git`,
        language: 'FSH',
        stargazers_count: 12,
        forks_count: 2,
        open_issues_count: 1,
        topics: ['who', 'smart-guidelines', 'dak', 'ips', 'pilgrimage', 'health'],
        created_at: '2023-06-10T12:00:00Z',
        updated_at: '2024-12-01T16:45:00Z',
        pushed_at: '2024-12-01T16:45:00Z',
        default_branch: 'main',
        smart_guidelines_compatible: true,
        isDemo: true
      }
    ];

    return Promise.resolve(demoRepos);
  }

  // Check if a repository has sushi-config.yaml with smart.who.int.base dependency
  async checkSmartGuidelinesCompatibility(owner, repo, retryCount = 2) {
    if (!this.isAuth()) {
      return false;
    }

    // Check cache first to prevent redundant downloads
    const cachedResult = repositoryCompatibilityCache.get(owner, repo);
    if (cachedResult !== null) {
      return cachedResult;
    }

    try {
      // Try to get sushi-config.yaml from the repository root
      const { data } = await this.octokit.rest.repos.getContent({
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
        return isCompatible;
      }
      
      // Cache negative result
      repositoryCompatibilityCache.set(owner, repo, false);
      return false;
    } catch (error) {
      // If it's a 404 (file not found), retry once more in case of temporary issues
      if (error.status === 404 && retryCount > 0) {
        console.warn(`File not found for ${owner}/${repo}, retrying... (${retryCount} attempts left)`);
        // Use shorter delay in test environment
        const delay = process.env.NODE_ENV === 'test' ? 10 : 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.checkSmartGuidelinesCompatibility(owner, repo, retryCount - 1);
      }
      
      // For any error (including rate limiting, network errors, or file not found after retries),
      // strictly return false - no fallback logic
      console.warn(`Failed to check ${owner}/${repo} for sushi-config.yaml with smart.who.int.base dependency:`, error.message);
      
      // Cache negative result
      repositoryCompatibilityCache.set(owner, repo, false);
      return false;
    }
  }



  // Get repositories that are SMART guidelines compatible
  async getSmartGuidelinesRepositories(owner, type = 'user') {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      let repositories = [];
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

      // Check each repository for SMART guidelines compatibility
      const smartGuidelinesRepos = [];
      for (const repo of repositories) {
        const isCompatible = await this.checkSmartGuidelinesCompatibility(repo.owner.login, repo.name);
        if (isCompatible) {
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
  async getSmartGuidelinesRepositoriesProgressive(owner, type = 'user', onRepositoryFound = null, onProgress = null) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      let repositories = [];
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

      // Process repositories concurrently with rate limiting and enhanced display
      const processor = async (repo, index) => {
        // Add a small delay to make scanning progress visible (similar to demo mode)
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        const isCompatible = await this.checkSmartGuidelinesCompatibility(repo.owner.login, repo.name);
        
        if (isCompatible) {
          const smartRepo = {
            ...repo,
            smart_guidelines_compatible: true
          };
          
          // Notify that a repository was found
          if (onRepositoryFound) {
            onRepositoryFound(smartRepo);
          }
          
          return smartRepo;
        }
        
        return null;
      };

      // Use concurrent processing with max 5 parallel requests
      const results = await processConcurrently(repositories, processor, {
        concurrency: 5,
        onProgress: (completed, total, repo, result) => {
          // Progress callback for completed items
          if (onProgress) {
            onProgress({
              current: completed,
              total: total,
              currentRepo: repo.name,
              progress: Math.round((completed / total) * 100),
              completed: true
            });
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
      
      return validResults;
    } catch (error) {
      console.error('Failed to fetch SMART guidelines repositories:', error);
      throw error;
    }
  }

  // Get a specific repository
  async getRepository(owner, repo) {
    try {
      // Use authenticated octokit if available, otherwise create a public instance for public repos
      const octokit = this.isAuth() ? this.octokit : new Octokit();
      
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
      const octokit = this.isAuth() ? this.octokit : new Octokit();
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
      const octokit = this.isAuth() ? this.octokit : new Octokit();
      
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
      // Use authenticated octokit if available, otherwise create a public instance
      const octokit = this.isAuth() ? this.octokit : new Octokit();
      
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      // Handle single file response
      if (!Array.isArray(data)) {
        if (data.name.endsWith('.bpmn')) {
          allFiles.push(data);
        }
        return allFiles;
      }

      // Handle directory response
      for (const item of data) {
        if (item.type === 'file' && item.name.endsWith('.bpmn')) {
          allFiles.push(item);
        } else if (item.type === 'dir') {
          // Recursively search subdirectories
          await this.getBpmnFilesRecursive(owner, repo, item.path, ref, allFiles);
        }
      }

      return allFiles;
    } catch (error) {
      // If directory doesn't exist, return empty array (not an error)
      if (error.status === 404) {
        return allFiles;
      }
      throw error;
    }
  }

  // Get all BPMN files from a repository's business process directories
  async getBpmnFiles(owner, repo, ref = 'main') {
    const allBpmnFiles = [];
    
    // Try multiple possible directory names where BPMN files might be stored
    const possiblePaths = [
      'input/business-processes',
      'input/business-process',
      'public/docs/workflows',
      'docs/workflows',
      'workflows',
      'bpmn',
      'processes'
    ];

    for (const path of possiblePaths) {
      try {
        const files = await this.getBpmnFilesRecursive(owner, repo, path, ref);
        allBpmnFiles.push(...files);
      } catch (error) {
        console.warn(`Could not fetch BPMN files from ${path}:`, error.message);
        // Continue trying other paths
      }
    }

    // Remove duplicates based on path (in case both directories exist and have overlapping files)
    const uniqueFiles = allBpmnFiles.filter((file, index, self) => 
      index === self.findIndex(f => f.path === file.path)
    );

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
      const octokit = this.isAuth() ? this.octokit : new Octokit();
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
        
        const content = decodeURIComponent(escape(atob(data.content)));
        console.log(`✅ githubService.getFileContent: Successfully fetched and decoded file content`);
        console.log('📏 githubService.getFileContent: Final content length:', content.length, 'characters');
        console.log('👀 githubService.getFileContent: Content preview (first 200 chars):', content.substring(0, 200));
        
        return content;
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

  // Get pull request for a specific branch
  async getPullRequestForBranch(owner, repo, branchName) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/pulls`, { state: 'open', head: `${owner}:${branchName}` });

    try {
      const response = await this.octokit.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        head: `${owner}:${branchName}`,
        per_page: 1
      });

      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls`, response.status, Date.now() - startTime);
      
      // Return the first matching PR or null if none found
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      this.logger.apiResponse('GET', `/repos/${owner}/${repo}/pulls`, error.status || 'error', Date.now() - startTime);
      console.error('Failed to fetch pull request for branch:', error);
      return null; // Return null instead of throwing to allow graceful fallback
    }
  }

  // Get pull request comments
  async getPullRequestComments(owner, repo, pullNumber) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, {});

    try {
      const response = await this.octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number: pullNumber,
        per_page: 100
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
  async getPullRequestIssueComments(owner, repo, pullNumber) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    const startTime = Date.now();
    this.logger.apiCall('GET', `/repos/${owner}/${repo}/issues/${pullNumber}/comments`, {});

    try {
      const response = await this.octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: pullNumber,
        per_page: 100
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
      const octokit = this.isAuth() ? this.octokit : new Octokit();
      
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
      const octokit = this.isAuth() ? this.octokit : new Octokit();
      
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
      const octokit = this.isAuth() ? this.octokit : new Octokit();
      
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
      const octokit = this.isAuth() ? this.octokit : new Octokit();
      
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
      const octokit = this.isAuth() ? this.octokit : new Octokit();
      
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

  // Logout
  logout() {
    this.octokit = null;
    this.isAuthenticated = false;
    this.tokenType = null;
    this.permissions = null;
    localStorage.removeItem('github_token');
    sessionStorage.removeItem('github_token');
    
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
      const octokit = this.isAuth() ? this.octokit : new Octokit();
      
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
}

// Create a singleton instance
const githubService = new GitHubService();

export default githubService;