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
export class GitHubIssueService {
  /**
   * Get issue
   */
  async getIssue(octokit: any, owner: string, repo: string, issueNumber: number): Promise<Issue> {
    try {
      const response = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get issue #${issueNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get pull request
   */
  async getPullRequest(octokit: any, owner: string, repo: string, pullNumber: number): Promise<PullRequest> {
    try {
      const response = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get pull request #${pullNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List issues
   */
  async listIssues(octokit: any, owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', page: number = 1, perPage: number = 30): Promise<Issue[]> {
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
      return response.data.filter((item: any) => !item.pull_request); // Filter out PRs
    } catch (error) {
      throw new Error(`Failed to list issues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List pull requests
   */
  async listPullRequests(octokit: any, owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', page: number = 1, perPage: number = 30): Promise<PullRequest[]> {
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
    } catch (error) {
      throw new Error(`Failed to list pull requests: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get pull requests for specific branch
   */
  async getPullRequestsForBranch(octokit: any, owner: string, repo: string, branchName: string): Promise<PullRequest[]> {
    try {
      const response = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'open',
        head: `${owner}:${branchName}`,
        per_page: 100
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch pull requests for branch:', error);
      return [];
    }
  }

  /**
   * Get first pull request for branch (backward compatibility)
   */
  async getPullRequestForBranch(octokit: any, owner: string, repo: string, branchName: string): Promise<PullRequest | null> {
    const prs = await this.getPullRequestsForBranch(octokit, owner, repo, branchName);
    return prs && prs.length > 0 ? prs[0] : null;
  }

  /**
   * Get open pull requests count
   */
  async getOpenPullRequestsCount(octokit: any, owner: string, repo: string): Promise<number> {
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
    } catch (error) {
      throw new Error(`Failed to get open pull requests count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create issue
   */
  async createIssue(octokit: any, owner: string, repo: string, title: string, body?: string, labels?: string[]): Promise<Issue> {
    try {
      const response = await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create pull request
   */
  async createPullRequest(octokit: any, owner: string, repo: string, title: string, head: string, base: string, body?: string, draft: boolean = false): Promise<PullRequest> {
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
    } catch (error) {
      throw new Error(`Failed to create pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get issue comments
   */
  async getIssueComments(octokit: any, owner: string, repo: string, issueNumber: number, page: number = 1, perPage: number = 100): Promise<Comment[]> {
    try {
      const response = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
        page,
        per_page: perPage
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get issue comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get pull request comments (review comments)
   */
  async getPullRequestComments(octokit: any, owner: string, repo: string, pullNumber: number, page: number = 1, perPage: number = 100): Promise<Comment[]> {
    try {
      const response = await octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number: pullNumber,
        page,
        per_page: perPage
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get pull request comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get pull request issue comments (general comments)
   */
  async getPullRequestIssueComments(octokit: any, owner: string, repo: string, pullNumber: number, page: number = 1, perPage: number = 100): Promise<Comment[]> {
    try {
      const response = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: pullNumber,
        page,
        per_page: perPage
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get pull request issue comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create comment on issue/PR
   */
  async createComment(octokit: any, owner: string, repo: string, issueNumber: number, body: string): Promise<Comment> {
    try {
      const response = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create pull request comment alias
   */
  async createPullRequestComment(octokit: any, owner: string, repo: string, pullNumber: number, body: string): Promise<Comment> {
    return this.createComment(octokit, owner, repo, pullNumber, body);
  }

  /**
   * Get pull request timeline events
   */
  async getPullRequestTimeline(octokit: any, owner: string, repo: string, pullNumber: number, page: number = 1, perPage: number = 100): Promise<any[]> {
    try {
      const response = await octokit.rest.issues.listEventsForTimeline({
        owner,
        repo,
        issue_number: pullNumber,
        page,
        per_page: perPage
      });
      return response.data;
    } catch (error) {
      console.debug('Failed to fetch pull request timeline:', error);
      return [];
    }
  }

  /**
   * Merge pull request
   */
  async mergePullRequest(octokit: any, owner: string, repo: string, pullNumber: number, options: any = {}): Promise<any> {
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
    } catch (error) {
      throw new Error(`Failed to merge pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close issue
   */
  async closeIssue(octokit: any, owner: string, repo: string, issueNumber: number): Promise<Issue> {
    try {
      const response = await octokit.rest.issues.update({
        owner,
        repo,
        issue_number: issueNumber,
        state: 'closed'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to close issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close pull request
   */
  async closePullRequest(octokit: any, owner: string, repo: string, pullNumber: number): Promise<PullRequest> {
    try {
      const response = await octokit.rest.pulls.update({
        owner,
        repo,
        pull_number: pullNumber,
        state: 'closed'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to close pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}