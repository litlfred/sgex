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

  // Get repositories for a user or organization
  async getRepositories(owner, type = 'user') {
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

      // Filter for repositories that might be DAK-related or have relevant topics
      return repositories.filter(repo => {
        const topics = repo.topics || [];
        const description = (repo.description || '').toLowerCase();
        const name = repo.name.toLowerCase();
        
        // Look for DAK-related keywords
        const dakKeywords = [
          'dak', 'smart', 'guidelines', 'who', 'health', 'fhir', 
          'implementation', 'guide', 'ig', 'clinical', 'maternal',
          'immunization', 'anc', 'digital', 'adaptation', 'kit'
        ];
        
        return topics.some(topic => 
          dakKeywords.some(keyword => topic.toLowerCase().includes(keyword))
        ) || dakKeywords.some(keyword => 
          description.includes(keyword) || name.includes(keyword)
        );
      });
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
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