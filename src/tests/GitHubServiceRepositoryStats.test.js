/**
 * Tests for new GitHub repository statistics methods
 */

import githubService from '../services/githubService';

// Mock the Octokit instance
const mockOctokit = {
  rest: {
    repos: {
      listCommits: jest.fn()
    },
    pulls: {
      list: jest.fn()
    },
    issues: {
      listForRepo: jest.fn()
    }
  }
};

describe('GitHubService Repository Stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    githubService.octokit = mockOctokit;
    githubService.isAuthenticated = true;
  });

  describe('getRecentCommits', () => {
    it('should fetch recent commits successfully', async () => {
      const mockCommits = [
        {
          sha: 'abc123',
          commit: {
            message: 'Test commit message',
            author: {
              name: 'Test Author',
              email: 'test@example.com',
              date: '2024-01-01T10:00:00Z'
            },
            committer: {
              name: 'Test Committer',
              email: 'committer@example.com',
              date: '2024-01-01T10:00:00Z'
            }
          },
          html_url: 'https://github.com/test/repo/commit/abc123'
        }
      ];

      mockOctokit.rest.repos.listCommits.mockResolvedValue({
        data: mockCommits,
        status: 200
      });

      const result = await githubService.getRecentCommits('testuser', 'testrepo', 'main', 5);

      expect(mockOctokit.rest.repos.listCommits).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'testrepo',
        sha: 'main',
        per_page: 5
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        sha: 'abc123',
        message: 'Test commit message',
        html_url: 'https://github.com/test/repo/commit/abc123'
      });
    });

    it('should throw error when not authenticated', async () => {
      githubService.isAuthenticated = false;

      await expect(githubService.getRecentCommits('testuser', 'testrepo'))
        .rejects.toThrow('Not authenticated with GitHub');
    });
  });

  describe('getOpenPullRequestsCount', () => {
    it('should return pull requests count from response length', async () => {
      mockOctokit.rest.pulls.list.mockResolvedValue({
        data: [{ id: 1 }, { id: 2 }],
        status: 200,
        headers: {}
      });

      const result = await githubService.getOpenPullRequestsCount('testuser', 'testrepo');

      expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'testrepo',
        state: 'open',
        per_page: 1
      });

      expect(result).toBe(2);
    });

    it('should parse count from link header when available', async () => {
      mockOctokit.rest.pulls.list.mockResolvedValue({
        data: [{ id: 1 }],
        status: 200,
        headers: {
          link: '<https://api.github.com/repos/test/repo/pulls?page=10>; rel="last"'
        }
      });

      const result = await githubService.getOpenPullRequestsCount('testuser', 'testrepo');
      expect(result).toBe(10);
    });
  });

  describe('getOpenIssuesCount', () => {
    it('should return issues count from response length', async () => {
      mockOctokit.rest.issues.listForRepo.mockResolvedValue({
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        status: 200,
        headers: {}
      });

      const result = await githubService.getOpenIssuesCount('testuser', 'testrepo');

      expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith({
        owner: 'testuser',
        repo: 'testrepo',
        state: 'open',
        per_page: 1
      });

      expect(result).toBe(3);
    });
  });

  describe('getRepositoryStats', () => {
    it('should fetch all repository statistics', async () => {
      const mockCommits = [{
        sha: 'abc123',
        commit: {
          message: 'Latest commit',
          author: {
            name: 'Test Author',
            email: 'test@example.com',
            date: '2024-01-01T10:00:00Z'
          },
          committer: {
            name: 'Test Committer',
            email: 'committer@example.com',
            date: '2024-01-01T10:00:00Z'
          }
        },
        html_url: 'https://github.com/test/repo/commit/abc123'
      }];

      mockOctokit.rest.repos.listCommits.mockResolvedValue({
        data: mockCommits,
        status: 200
      });

      mockOctokit.rest.pulls.list.mockResolvedValue({
        data: [{ id: 1 }, { id: 2 }],
        status: 200,
        headers: {}
      });

      mockOctokit.rest.issues.listForRepo.mockResolvedValue({
        data: [{ id: 1 }],
        status: 200,
        headers: {}
      });

      const result = await githubService.getRepositoryStats('testuser', 'testrepo', 'main');

      expect(result).toMatchObject({
        recentCommits: expect.arrayContaining([
          expect.objectContaining({
            sha: 'abc123',
            message: 'Latest commit'
          })
        ]),
        openPullRequestsCount: 2,
        openIssuesCount: 1,
        errors: {
          recentCommits: null,
          openPullRequestsCount: null,
          openIssuesCount: null
        }
      });
    });

    it('should handle partial failures gracefully', async () => {
      mockOctokit.rest.repos.listCommits.mockRejectedValue(new Error('Commits API failed'));
      mockOctokit.rest.pulls.list.mockResolvedValue({
        data: [{ id: 1 }],
        status: 200,
        headers: {}
      });
      mockOctokit.rest.issues.listForRepo.mockResolvedValue({
        data: [{ id: 1 }, { id: 2 }],
        status: 200,
        headers: {}
      });

      const result = await githubService.getRepositoryStats('testuser', 'testrepo', 'main');

      expect(result).toMatchObject({
        recentCommits: [],
        openPullRequestsCount: 1,
        openIssuesCount: 2,
        errors: {
          recentCommits: expect.any(Error),
          openPullRequestsCount: null,
          openIssuesCount: null
        }
      });
    });
  });
});