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
export declare class GitHubUserService {
    /**
     * Get current authenticated user
     */
    getCurrentUser(octokit: any): Promise<User>;
    /**
     * Get user by username
     */
    getUser(octokit: any, username: string): Promise<User>;
    /**
     * Get user organizations
     */
    getUserOrganizations(octokit: any, username?: string): Promise<Organization[]>;
    /**
     * Get organization
     */
    getOrganization(octokit: any, org: string): Promise<Organization>;
    /**
     * Get WHO organization (special handling)
     */
    getWHOOrganization(octokit: any): Promise<Organization>;
    /**
     * Get public repositories for user or organization
     */
    getPublicRepositories(octokit: any, owner: string, type?: 'user' | 'org', page?: number, perPage?: number): Promise<any[]>;
    /**
     * Get authenticated user repositories
     */
    getUserRepositories(octokit: any, page?: number, perPage?: number): Promise<any[]>;
    /**
     * Check rate limit
     */
    checkRateLimit(octokit: any): Promise<RateLimit>;
    /**
     * Check if API calls should be skipped due to rate limiting
     */
    shouldSkipApiCalls(octokit: any, threshold?: number): Promise<boolean>;
    /**
     * Get remaining rate limit
     */
    getRemainingRateLimit(octokit: any): Promise<number>;
    /**
     * Get rate limit reset time
     */
    getRateLimitResetTime(octokit: any): Promise<Date>;
    /**
     * Search users
     */
    searchUsers(octokit: any, query: string, page?: number, perPage?: number): Promise<any>;
    /**
     * Check if user has admin access to organization
     */
    hasOrgAdminAccess(octokit: any, org: string, username?: string): Promise<boolean>;
    /**
     * Check if user is member of organization
     */
    isOrgMember(octokit: any, org: string, username?: string): Promise<boolean>;
}
//# sourceMappingURL=github-user.d.ts.map