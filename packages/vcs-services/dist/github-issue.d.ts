export interface Issue {
    id: number;
    number: number;
    title: string;
    body?: string;
    state: 'open' | 'closed';
    user: {
        login: string;
        avatar_url: string;
    };
    assignees: any[];
    labels: any[];
    created_at: string;
    updated_at: string;
    closed_at?: string;
    html_url: string;
}
export interface PullRequest {
    id: number;
    number: number;
    title: string;
    body?: string;
    state: 'open' | 'closed' | 'merged';
    user: {
        login: string;
        avatar_url: string;
    };
    head: {
        ref: string;
        sha: string;
    };
    base: {
        ref: string;
        sha: string;
    };
    created_at: string;
    updated_at: string;
    closed_at?: string;
    merged_at?: string;
    html_url: string;
    draft: boolean;
    mergeable?: boolean;
    mergeable_state?: string;
}
export interface Comment {
    id: number;
    body: string;
    user: {
        login: string;
        avatar_url: string;
    };
    created_at: string;
    updated_at: string;
    html_url: string;
}
/**
 * GitHub Issue Service
 *
 * Handles issue and pull request operations including
 * comments, timeline events, and state management.
 */
export declare class GitHubIssueService {
    /**
     * Get issue
     */
    getIssue(octokit: any, owner: string, repo: string, issueNumber: number): Promise<Issue>;
    /**
     * Get pull request
     */
    getPullRequest(octokit: any, owner: string, repo: string, pullNumber: number): Promise<PullRequest>;
    /**
     * List issues
     */
    listIssues(octokit: any, owner: string, repo: string, state?: 'open' | 'closed' | 'all', page?: number, perPage?: number): Promise<Issue[]>;
    /**
     * List pull requests
     */
    listPullRequests(octokit: any, owner: string, repo: string, state?: 'open' | 'closed' | 'all', page?: number, perPage?: number): Promise<PullRequest[]>;
    /**
     * Get pull requests for specific branch
     */
    getPullRequestsForBranch(octokit: any, owner: string, repo: string, branchName: string): Promise<PullRequest[]>;
    /**
     * Get first pull request for branch (backward compatibility)
     */
    getPullRequestForBranch(octokit: any, owner: string, repo: string, branchName: string): Promise<PullRequest | null>;
    /**
     * Get open pull requests count
     */
    getOpenPullRequestsCount(octokit: any, owner: string, repo: string): Promise<number>;
    /**
     * Create issue
     */
    createIssue(octokit: any, owner: string, repo: string, title: string, body?: string, labels?: string[]): Promise<Issue>;
    /**
     * Create pull request
     */
    createPullRequest(octokit: any, owner: string, repo: string, title: string, head: string, base: string, body?: string, draft?: boolean): Promise<PullRequest>;
    /**
     * Get issue comments
     */
    getIssueComments(octokit: any, owner: string, repo: string, issueNumber: number, page?: number, perPage?: number): Promise<Comment[]>;
    /**
     * Get pull request comments (review comments)
     */
    getPullRequestComments(octokit: any, owner: string, repo: string, pullNumber: number, page?: number, perPage?: number): Promise<Comment[]>;
    /**
     * Get pull request issue comments (general comments)
     */
    getPullRequestIssueComments(octokit: any, owner: string, repo: string, pullNumber: number, page?: number, perPage?: number): Promise<Comment[]>;
    /**
     * Create comment on issue/PR
     */
    createComment(octokit: any, owner: string, repo: string, issueNumber: number, body: string): Promise<Comment>;
    /**
     * Create pull request comment alias
     */
    createPullRequestComment(octokit: any, owner: string, repo: string, pullNumber: number, body: string): Promise<Comment>;
    /**
     * Get pull request timeline events
     */
    getPullRequestTimeline(octokit: any, owner: string, repo: string, pullNumber: number, page?: number, perPage?: number): Promise<any[]>;
    /**
     * Merge pull request
     */
    mergePullRequest(octokit: any, owner: string, repo: string, pullNumber: number, options?: any): Promise<any>;
    /**
     * Close issue
     */
    closeIssue(octokit: any, owner: string, repo: string, issueNumber: number): Promise<Issue>;
    /**
     * Close pull request
     */
    closePullRequest(octokit: any, owner: string, repo: string, pullNumber: number): Promise<PullRequest>;
}
//# sourceMappingURL=github-issue.d.ts.map