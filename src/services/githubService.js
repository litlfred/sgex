import { Octokit } from '@octokit/rest';

class GitHubService {
  constructor() {
    this.octokit = null;
    this.isAuthenticated = false;
    this.permissions = null;
    this.tokenType = null; // 'classic' or 'fine-grained'
  }

  // Initialize with a GitHub token
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
        return content.includes('smart.who.int.base');
      }
      
      return false;
    } catch (error) {
      // If it's a rate limiting or network error, try to fall back to other indicators
      if (error.status === 403 || error.status === 429 || error.message.includes('rate limit') || error.message.includes('Network')) {
        console.warn(`Rate limit or network error checking ${owner}/${repo}, trying fallback approach:`, error.message);
        return this.checkSmartGuidelinesFallback(owner, repo);
      }
      
      // If it's a 404 (file not found), retry once more in case of temporary issues
      if (error.status === 404 && retryCount > 0) {
        console.warn(`File not found for ${owner}/${repo}, retrying... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return this.checkSmartGuidelinesCompatibility(owner, repo, retryCount - 1);
      }
      
      // For 404 errors after retries, or other errors, file doesn't exist or can't be accessed
      return false;
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

      // Check if repository topics or description contain SMART guidelines indicators
      const smartIndicators = [
        'smart-guidelines',
        'who-smart',
        'smart.who.int',
        'digital-adaptation-kit',
        'digital adaptation kit',
        'dak',
        'fhir-ig',
        'implementation-guide'
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

      if (hasSmartIndicators) {
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
    localStorage.removeItem('github_token');
  }
}

// Create a singleton instance
const githubService = new GitHubService();

export default githubService;