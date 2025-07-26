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
        // Decode base64 content
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        
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
      // If it's a rate limiting or network error, try to fall back to other indicators
      if (error.status === 403 || error.status === 429 || error.message.includes('rate limit') || error.message.includes('Network')) {
        console.warn(`Rate limit or network error checking ${owner}/${repo}, trying fallback approach:`, error.message);
        const fallbackResult = await this.checkSmartGuidelinesFallback(owner, repo);
        
        // Cache the fallback result
        repositoryCompatibilityCache.set(owner, repo, fallbackResult);
        return fallbackResult;
      }
      
      // If it's a 404 (file not found), retry once more in case of temporary issues
      if (error.status === 404 && retryCount > 0) {
        console.warn(`File not found for ${owner}/${repo}, retrying... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.checkSmartGuidelinesCompatibility(owner, repo, retryCount - 1);
      }
      
      // For 404 errors after retries, or other errors, file doesn't exist or can't be accessed
      // Try fallback before giving up
      const fallbackResult = await this.checkSmartGuidelinesFallback(owner, repo);
      
      // Cache the result (could be true from fallback or false)
      repositoryCompatibilityCache.set(owner, repo, fallbackResult);
      return fallbackResult;
    }
  }

  // Fallback method to check for SMART Guidelines compatibility using other indicators
  async checkSmartGuidelinesFallback(owner, repo) {
    try {
      // Get repository details to check topics and description
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      // Enhanced smart indicators including patterns for repositories like smart-trust-phw
      const smartIndicators = [
        'smart-guidelines',
        'smart guidelines', // Add space variant
        'who-smart',
        'smart.who.int',
        'digital-adaptation-kit',
        'digital adaptation kit',
        'dak',
        'fhir-ig',
        'implementation-guide',
        'implementation guide', // Add space variant
        'smart-trust', // For smart-trust-phw specifically
        'trust-phw', // Another pattern for trust-related SMART repos
        'phw', // Public Health Web repositories
        'smart guide', // Another common variant
        'who guide', // WHO guideline patterns
        'fhir guide', // FHIR guideline patterns
      ];

      const topics = data.topics || [];
      const description = (data.description || '').toLowerCase();
      const repoName = repo.toLowerCase();

      // Check if any SMART guidelines indicators are present
      const hasSmartIndicators = smartIndicators.some(indicator => 
        topics.includes(indicator) || 
        description.includes(indicator.toLowerCase()) ||
        repoName.includes(indicator.replace(/[-\s]/g, ''))
      );

      // More lenient check for implementation guide patterns
      const hasIGPatterns = description.includes('implementation guide') ||
                           description.includes('fhir') ||
                           description.includes('smart') ||
                           description.includes('who') ||
                           description.includes('guideline');

      // Additional check for repositories that contain SMART-related keywords in name
      const hasSmartInName = repoName.includes('smart') || 
                            repoName.includes('dak') ||
                            repoName.includes('guideline') ||
                            repoName.includes('who') ||
                            repoName.includes('fhir') ||
                            (repoName.includes('trust') && repoName.includes('phw'));

      const isCompatible = hasSmartIndicators || hasSmartInName || hasIGPatterns;

      if (isCompatible) {
        console.info(`Repository ${owner}/${repo} has SMART guidelines indicators in topics/description, assuming compatible`);
        return true;
      }

      return false;
    } catch (fallbackError) {
      console.warn(`Fallback check also failed for ${owner}/${repo}:`, fallbackError.message);
      return false;
    }
  }

  // Get repositories that are SMART guidelines compatible
  async getSmartGuidelinesRepositories(owner, type = 'user') {
    if (!this.isAuth()) {
      throw new Error('Not authenticated with GitHub');
    }

    try {
      let repositories;
      if (type === 'user') {
        const { data } = await this.octokit.rest.repos.listForUser({
          username: owner,
          sort: 'updated',
          per_page: 100,
        });
        repositories = data;
      } else {
        const { data } = await this.octokit.rest.repos.listForOrg({
          org: owner,
          sort: 'updated',
          per_page: 100,
        });
        repositories = data;
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
      let repositories;
      if (type === 'user') {
        const { data } = await this.octokit.rest.repos.listForUser({
          username: owner,
          sort: 'updated',
          per_page: 100,
        });
        repositories = data;
      } else {
        const { data } = await this.octokit.rest.repos.listForOrg({
          org: owner,
          sort: 'updated',
          per_page: 100,
        });
        repositories = data;
      }

      // Process repositories concurrently with rate limiting
      const processor = async (repo, index) => {
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

  // Logout
  logout() {
    this.octokit = null;
    this.isAuthenticated = false;
    this.tokenType = null;
    this.permissions = null;
    localStorage.removeItem('github_token');
    sessionStorage.removeItem('github_token');
  }
}

// Create a singleton instance
const githubService = new GitHubService();

export default githubService;