export interface User {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  company?: string;
}

export interface Organization {
  login: string;
  id: number;
  url: string;
  avatar_url: string;
  description?: string;
  name?: string;
  email?: string;
  location?: string;
  html_url: string;
}

export interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

/**
 * GitHub User Service
 * 
 * Handles user and organization operations, rate limiting,
 * and public data access.
 */
export class GitHubUserService {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(octokit: any): Promise<User> {
    try {
      const response = await octokit.rest.users.getAuthenticated();
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user by username
   */
  async getUser(octokit: any, username: string): Promise<User> {
    try {
      const response = await octokit.rest.users.getByUsername({
        username
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user ${username}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user organizations
   */
  async getUserOrganizations(octokit: any, username?: string): Promise<Organization[]> {
    try {
      let response;
      if (username) {
        response = await octokit.rest.orgs.listForUser({
          username,
          per_page: 100
        });
      } else {
        response = await octokit.rest.orgs.listForAuthenticatedUser({
          per_page: 100
        });
      }
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get organizations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get organization
   */
  async getOrganization(octokit: any, org: string): Promise<Organization> {
    try {
      const response = await octokit.rest.orgs.get({
        org
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get organization ${org}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get WHO organization (special handling)
   */
  async getWHOOrganization(octokit: any): Promise<Organization> {
    return this.getOrganization(octokit, 'WorldHealthOrganization');
  }

  /**
   * Get public repositories for user or organization
   */
  async getPublicRepositories(octokit: any, owner: string, type: 'user' | 'org' = 'user', page: number = 1, perPage: number = 30): Promise<any[]> {
    try {
      let response;
      if (type === 'org') {
        response = await octokit.rest.repos.listForOrg({
          org: owner,
          type: 'public',
          page,
          per_page: perPage,
          sort: 'updated',
          direction: 'desc'
        });
      } else {
        response = await octokit.rest.repos.listForUser({
          username: owner,
          type: 'public',
          page,
          per_page: perPage,
          sort: 'updated',
          direction: 'desc'
        });
      }
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get public repositories for ${owner}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get authenticated user repositories
   */
  async getUserRepositories(octokit: any, page: number = 1, perPage: number = 30): Promise<any[]> {
    try {
      const response = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: 'all',
        affiliation: 'owner,collaborator,organization_member',
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user repositories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(octokit: any): Promise<RateLimit> {
    try {
      const response = await octokit.rest.rateLimit.get();
      return response.data.rate;
    } catch (error) {
      throw new Error(`Failed to check rate limit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if API calls should be skipped due to rate limiting
   */
  async shouldSkipApiCalls(octokit: any, threshold: number = 100): Promise<boolean> {
    try {
      const rateLimit = await this.checkRateLimit(octokit);
      return rateLimit.remaining < threshold;
    } catch (error) {
      // If we can't check rate limit, err on the side of caution
      return true;
    }
  }

  /**
   * Get remaining rate limit
   */
  async getRemainingRateLimit(octokit: any): Promise<number> {
    try {
      const rateLimit = await this.checkRateLimit(octokit);
      return rateLimit.remaining;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get rate limit reset time
   */
  async getRateLimitResetTime(octokit: any): Promise<Date> {
    try {
      const rateLimit = await this.checkRateLimit(octokit);
      return new Date(rateLimit.reset * 1000);
    } catch (error) {
      return new Date();
    }
  }

  /**
   * Search users
   */
  async searchUsers(octokit: any, query: string, page: number = 1, perPage: number = 30): Promise<any> {
    try {
      const response = await octokit.rest.search.users({
        q: query,
        page,
        per_page: perPage
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user has admin access to organization
   */
  async hasOrgAdminAccess(octokit: any, org: string, username?: string): Promise<boolean> {
    try {
      let targetUsername = username;
      if (!targetUsername) {
        const user = await this.getCurrentUser(octokit);
        targetUsername = user.login;
      }

      const response = await octokit.rest.orgs.getMembershipForUser({
        org,
        username: targetUsername
      });

      return response.data.role === 'admin';
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user is member of organization
   */
  async isOrgMember(octokit: any, org: string, username?: string): Promise<boolean> {
    try {
      let targetUsername = username;
      if (!targetUsername) {
        const user = await this.getCurrentUser(octokit);
        targetUsername = user.login;
      }

      await octokit.rest.orgs.getMembershipForUser({
        org,
        username: targetUsername
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}