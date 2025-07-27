import { Octokit } from '@octokit/rest';
import { processConcurrently } from '../utils/concurrency';
import repositoryCompatibilityCache from '../utils/repositoryCompatibilityCache';
import oauthService from './oauthService';

class GitHubService {
  constructor() {
    this.isAuthenticated = false;
    this.tokenType = 'oauth';
  }

  // Initialize OAuth mode - this is now the only authentication method
  enableOAuthMode() {
    this.isAuthenticated = true;
    this.tokenType = 'oauth';
    return true;
  }

  // Get appropriate Octokit instance for repository operations
  getOctokitForRepo(repoOwner, repoName, operation = 'read') {
    // Always use OAuth service to get appropriate token
    return oauthService.createOctokit(
      operation === 'write' ? 'WRITE_ACCESS' : 'READ_ONLY',
      repoOwner,
      repoName
    );
  }

  // Check if authenticated
  isAuth() {
    // In OAuth mode, check if we have any tokens
    return oauthService.hasAccess('READ_ONLY') || oauthService.hasAccess('WRITE_ACCESS');
  }

  // Get current user data
  async getCurrentUser() {
    return oauthService.getCurrentUser();
  }

  // Get user's organizations
  async getUserOrganizations() {
    // Use best available token for organizations
    const octokit = oauthService.createOctokit('READ_ONLY');
    const { data } = await octokit.rest.orgs.listForAuthenticatedUser();
    return data;
  }

  // Get specific organization data (public data, no auth required)
  async getOrganization(orgLogin) {
    try {
      // Create a public Octokit instance for public API calls
      const octokit = new Octokit();
      
      const { data } = await octokit.rest.orgs.get({
        org: orgLogin
      });
      return data;
    } catch (error) {
      console.error(`Failed to fetch organization ${orgLogin}:`, error);
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
    // Check cache first to prevent redundant downloads
    const cachedResult = repositoryCompatibilityCache.get(owner, repo);
    if (cachedResult !== null) {
      return cachedResult;
    }

    try {
      // Get appropriate Octokit instance for this repo
      const octokit = this.getOctokitForRepo(owner, repo, 'read');
      
      // Try to get sushi-config.yaml from the repository root
      const { data } = await octokit.rest.repos.getContent({
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
      const octokit = this.getOctokitForRepo(owner, repo, 'read');
      const { data } = await octokit.rest.repos.get({
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
    try {
      let repositories;
      const octokit = this.getOctokitForRepo(owner, null, 'read');
      
      if (type === 'user') {
        const { data } = await octokit.rest.repos.listForUser({
          username: owner,
          sort: 'updated',
          per_page: 100,
        });
        repositories = data;
      } else {
        const { data } = await octokit.rest.repos.listForOrg({
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
    try {
      let repositories;
      const octokit = this.getOctokitForRepo(owner, null, 'read');
      
      if (type === 'user') {
        const { data } = await octokit.rest.repos.listForUser({
          username: owner,
          sort: 'updated',
          per_page: 100,
        });
        repositories = data;
      } else {
        const { data } = await octokit.rest.repos.listForOrg({
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
    try {
      const octokit = this.getOctokitForRepo(owner, repo, 'read');
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

  // Logout
  logout() {
    this.isAuthenticated = false;
    this.tokenType = 'oauth';
  }
}

// Create a singleton instance
const githubService = new GitHubService();

export default githubService;