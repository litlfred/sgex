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
  
  // Get workflows for a repository (detailed version with file parsing)
  async getWorkflows(owner, repo) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      // First, try to get the .github/workflows directory
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path: '.github/workflows'
      });

      // Filter for YAML/YML files
      const workflowFiles = Array.isArray(data) 
        ? data.filter(file => file.name.endsWith('.yml') || file.name.endsWith('.yaml'))
        : [];

      // Fetch workflow details for each file
      const workflows = await Promise.all(
        workflowFiles.map(async (file) => {
          try {
            // Get file content to parse workflow name
            const contentResponse = await this.octokit.rest.repos.getContent({
              owner,
              repo,
              path: file.path
            });

            const content = Buffer.from(contentResponse.data.content, 'base64').toString('utf-8');
            
            // Parse workflow name from YAML (simple regex approach)
            const nameMatch = content.match(/^name:\s*(.+)$/m);
            const workflowName = nameMatch ? nameMatch[1].replace(/['"]/g, '') : file.name.replace(/\.(yml|yaml)$/, '');

            // Parse triggers
            const onMatch = content.match(/^on:\s*$/m);
            let triggers = [];
            if (onMatch) {
              const pushMatch = content.match(/^\s*push:/m);
              const prMatch = content.match(/^\s*pull_request:/m);
              const scheduleMatch = content.match(/^\s*schedule:/m);
              const workflowDispatchMatch = content.match(/^\s*workflow_dispatch:/m);
              
              if (pushMatch) triggers.push('push');
              if (prMatch) triggers.push('pull_request');
              if (scheduleMatch) triggers.push('schedule');
              if (workflowDispatchMatch) triggers.push('manual');
            }

            return {
              name: workflowName,
              filename: file.name,
              path: file.path,
              size: file.size,
              sha: file.sha,
              url: file.html_url,
              triggers: triggers.length > 0 ? triggers : ['push'], // default to push if we can't parse
              lastModified: contentResponse.data.last_modified || 'Unknown'
            };
          } catch (error) {
            console.warn(`Failed to fetch workflow details for ${file.name}:`, error);
            return {
              name: file.name.replace(/\.(yml|yaml)$/, ''),
              filename: file.name,
              path: file.path,
              size: file.size,
              sha: file.sha,
              url: file.html_url,
              triggers: ['unknown'],
              lastModified: 'Unknown'
            };
          }
        })
      );

      return workflows;
    } catch (error) {
      if (error.status === 404) {
        // No .github/workflows directory exists
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

  // Get directory contents
  async getDirectoryContents(owner, repo, path, branch = null) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const params = {
        owner,
        repo,
        path
      };
      
      if (branch) {
        params.ref = branch;
      }

      const { data } = await this.octokit.rest.repos.getContent(params);
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error(`Failed to fetch directory contents for ${path}:`, error);
      throw error;
    }
  }

  // Get file content
  async getFileContent(owner, repo, path, branch = null) {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      const params = {
        owner,
        repo,
        path
      };
      
      if (branch) {
        params.ref = branch;
      }

      const { data } = await this.octokit.rest.repos.getContent(params);
      
      if (data.type === 'file' && data.content) {
        // Decode base64 content (browser-compatible)
        return decodeURIComponent(escape(atob(data.content)));
      } else {
        throw new Error('File not found or is not a file');
      }
    } catch (error) {
      console.error(`Failed to fetch file content for ${path}:`, error);
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