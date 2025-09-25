"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubIssueService = void 0;
/**
 * GitHub Issue Service
 *
 * Handles issue and pull request operations including
 * comments, timeline events, and state management.
 */
class GitHubIssueService {
    /**
     * Get issue
     */
    async getIssue(octokit, owner, repo, issueNumber) {
        try {
            const response = await octokit.rest.issues.get({
                owner,
                repo,
                issue_number: issueNumber
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get issue #${issueNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get pull request
     */
    async getPullRequest(octokit, owner, repo, pullNumber) {
        try {
            const response = await octokit.rest.pulls.get({
                owner,
                repo,
                pull_number: pullNumber
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get pull request #${pullNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * List issues
     */
    async listIssues(octokit, owner, repo, state = 'open', page = 1, perPage = 30) {
        try {
            const response = await octokit.rest.issues.listForRepo({
                owner,
                repo,
                state,
                page,
                per_page: perPage,
                sort: 'updated',
                direction: 'desc'
            });
            return response.data.filter((item) => !item.pull_request); // Filter out PRs
        }
        catch (error) {
            throw new Error(`Failed to list issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * List pull requests
     */
    async listPullRequests(octokit, owner, repo, state = 'open', page = 1, perPage = 30) {
        try {
            const response = await octokit.rest.pulls.list({
                owner,
                repo,
                state,
                page,
                per_page: perPage,
                sort: 'updated',
                direction: 'desc'
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to list pull requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get pull requests for specific branch
     */
    async getPullRequestsForBranch(octokit, owner, repo, branchName) {
        try {
            const response = await octokit.rest.pulls.list({
                owner,
                repo,
                state: 'open',
                head: `${owner}:${branchName}`,
                per_page: 100
            });
            return response.data || [];
        }
        catch (error) {
            console.error('Failed to fetch pull requests for branch:', error);
            return [];
        }
    }
    /**
     * Get first pull request for branch (backward compatibility)
     */
    async getPullRequestForBranch(octokit, owner, repo, branchName) {
        const prs = await this.getPullRequestsForBranch(octokit, owner, repo, branchName);
        return prs && prs.length > 0 ? prs[0] : null;
    }
    /**
     * Get open pull requests count
     */
    async getOpenPullRequestsCount(octokit, owner, repo) {
        try {
            const response = await octokit.rest.pulls.list({
                owner,
                repo,
                state: 'open',
                per_page: 1
            });
            // Check link header for total count
            const linkHeader = response.headers.link;
            if (linkHeader && linkHeader.includes('rel="last"')) {
                const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
                if (lastPageMatch) {
                    return parseInt(lastPageMatch[1], 10);
                }
            }
            return response.data.length;
        }
        catch (error) {
            throw new Error(`Failed to get open pull requests count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create issue
     */
    async createIssue(octokit, owner, repo, title, body, labels) {
        try {
            const response = await octokit.rest.issues.create({
                owner,
                repo,
                title,
                body,
                labels
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to create issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create pull request
     */
    async createPullRequest(octokit, owner, repo, title, head, base, body, draft = false) {
        try {
            const response = await octokit.rest.pulls.create({
                owner,
                repo,
                title,
                head,
                base,
                body,
                draft
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to create pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get issue comments
     */
    async getIssueComments(octokit, owner, repo, issueNumber, page = 1, perPage = 100) {
        try {
            const response = await octokit.rest.issues.listComments({
                owner,
                repo,
                issue_number: issueNumber,
                page,
                per_page: perPage
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get issue comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get pull request comments (review comments)
     */
    async getPullRequestComments(octokit, owner, repo, pullNumber, page = 1, perPage = 100) {
        try {
            const response = await octokit.rest.pulls.listReviewComments({
                owner,
                repo,
                pull_number: pullNumber,
                page,
                per_page: perPage
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get pull request comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get pull request issue comments (general comments)
     */
    async getPullRequestIssueComments(octokit, owner, repo, pullNumber, page = 1, perPage = 100) {
        try {
            const response = await octokit.rest.issues.listComments({
                owner,
                repo,
                issue_number: pullNumber,
                page,
                per_page: perPage
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to get pull request issue comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create comment on issue/PR
     */
    async createComment(octokit, owner, repo, issueNumber, body) {
        try {
            const response = await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create pull request comment alias
     */
    async createPullRequestComment(octokit, owner, repo, pullNumber, body) {
        return this.createComment(octokit, owner, repo, pullNumber, body);
    }
    /**
     * Get pull request timeline events
     */
    async getPullRequestTimeline(octokit, owner, repo, pullNumber, page = 1, perPage = 100) {
        try {
            const response = await octokit.rest.issues.listEventsForTimeline({
                owner,
                repo,
                issue_number: pullNumber,
                page,
                per_page: perPage
            });
            return response.data;
        }
        catch (error) {
            console.debug('Failed to fetch pull request timeline:', error);
            return [];
        }
    }
    /**
     * Merge pull request
     */
    async mergePullRequest(octokit, owner, repo, pullNumber, options = {}) {
        try {
            const mergeOptions = {
                owner,
                repo,
                pull_number: pullNumber,
                commit_title: options.commit_title,
                commit_message: options.commit_message,
                merge_method: options.merge_method || 'merge'
            };
            const response = await octokit.rest.pulls.merge(mergeOptions);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to merge pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Close issue
     */
    async closeIssue(octokit, owner, repo, issueNumber) {
        try {
            const response = await octokit.rest.issues.update({
                owner,
                repo,
                issue_number: issueNumber,
                state: 'closed'
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to close issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Close pull request
     */
    async closePullRequest(octokit, owner, repo, pullNumber) {
        try {
            const response = await octokit.rest.pulls.update({
                owner,
                repo,
                pull_number: pullNumber,
                state: 'closed'
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to close pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.GitHubIssueService = GitHubIssueService;
//# sourceMappingURL=github-issue.js.map