import { Octokit } from '@octokit/rest';
import { processConcurrently } from '../utils/concurrency';
import repositoryCompatibilityCache from '../utils/repositoryCompatibilityCache';

class GitHubService {
  constructor() {
    this.octokit = null;
    this.isAuthenticated = false;
    this.permissions = null;
    this.tokenType = null; // 'classic', 'fine-grained', or 'oauth'
  }

  // Initialize with a GitHub token (supports both OAuth and PAT tokens)
  authenticate(token) {
    try {
      this.octokit = new Octokit({
        auth: token,
      });
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      console.error('Failed to authenticate with GitHub:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  // Initialize with an existing Octokit instance (for OAuth flow)
  authenticateWithOctokit(octokitInstance) {
    try {
      this.octokit = octokitInstance;
      this.isAuthenticated = true;
      this.tokenType = 'oauth';
      return true;
    } catch (error) {
      console.error('Failed to authenticate with Octokit instance:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  // Check token permissions and type
  async checkTokenPermissions() {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      // Try to get token info to determine type and permissions
      const response = await this.octokit.request('GET /user');
      
      // Check if this is a fine-grained token by trying to access rate limit info
      try {
        const rateLimit = await this.octokit.rest.rateLimit.get();
        // Fine-grained tokens have different rate limit structure
        this.tokenType = rateLimit.data.resources.core ? 'classic' : 'fine-grained';
      } catch {
        this.tokenType = 'unknown';
      }

      return {
        type: this.tokenType,
        user: response.data
      };
    } catch (error) {
      console.error('Failed to check token permissions:', error);
      throw error;
    }
  }

  // Check if we have write permissions for a specific repository
  async checkRepositoryWritePermissions(owner, repo) {
    if (!this.isAuth()) {
      return false;
    }

    try {
      // Try to get repository collaborator permissions
      const { data } = await this.octokit.rest.repos.getCollaboratorPermissionLevel({
        owner,
        repo,
        username: (await this.getCurrentUser()).login
      });
      
      return ['write', 'admin'].includes(data.permission);
    } catch (error) {
      // If we can't check permissions, assume we don't have write access
      console.warn('Could not check repository write permissions:', error);
      return false;
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
  async getRepositories(owner, type = 'user') {
    // Use the new SMART guidelines filtering method
    return this.getSmartGuidelinesRepositories(owner, type);
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
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.repos.get({
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
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch branches:', error);
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
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.repos.getBranch({
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
  
  // Get workflows for a repository
  async getWorkflows(owner, repo) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const { data } = await this.octokit.rest.actions.listRepoWorkflows({
        owner,
        repo
      });
      return data.workflows;
    } catch (error) {
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
}

// Create a singleton instance
const githubService = new GitHubService();

export default githubService;