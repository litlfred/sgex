import githubService from '../services/githubService';

// Mock the octokit instance
const mockOctokit = {
  rest: {
    pulls: {
      createReview: jest.fn(),
      dismissReview: jest.fn()
    },
    repos: {
      get: jest.fn()
    }
  }
};

describe('PR Review Functionality', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock authentication
    githubService.token = 'mock-token';
    githubService.octokit = mockOctokit;
  });

  afterEach(() => {
    githubService.token = null;
    githubService.octokit = null;
  });

  describe('checkPullRequestReviewPermissions', () => {
    it('should return false when not authenticated', async () => {
      githubService.token = null;
      
      const result = await githubService.checkPullRequestReviewPermissions('owner', 'repo', 1);
      
      expect(result).toBe(false);
    });

    it('should return true when authenticated and has write access', async () => {
      // Mock checkRepositoryWritePermissions to return true
      githubService.checkRepositoryWritePermissions = jest.fn().mockResolvedValue(true);
      
      const result = await githubService.checkPullRequestReviewPermissions('owner', 'repo', 1);
      
      expect(result).toBe(true);
      expect(githubService.checkRepositoryWritePermissions).toHaveBeenCalledWith('owner', 'repo');
    });
  });

  describe('createPullRequestReview', () => {
    it('should create a PR review successfully', async () => {
      const mockResponse = {
        data: {
          id: 123,
          state: 'APPROVED',
          body: 'Great work!',
          html_url: 'https://github.com/owner/repo/pull/1#pullrequestreview-123',
          submitted_at: '2023-01-01T00:00:00Z',
          user: {
            login: 'reviewer',
            avatar_url: 'https://github.com/reviewer.png'
          }
        },
        status: 200
      };

      mockOctokit.rest.pulls.createReview.mockResolvedValue(mockResponse);

      const result = await githubService.createPullRequestReview('owner', 'repo', 1, 'APPROVE', 'Great work!');

      expect(result.success).toBe(true);
      expect(result.review.id).toBe(123);
      expect(result.review.state).toBe('APPROVED');
      expect(mockOctokit.rest.pulls.createReview).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
        event: 'APPROVE',
        body: 'Great work!'
      });
    });

    it('should require authentication', async () => {
      githubService.token = null;

      await expect(
        githubService.createPullRequestReview('owner', 'repo', 1, 'APPROVE')
      ).rejects.toThrow('Authentication required to review pull requests');
    });
  });

  describe('approvePullRequest', () => {
    it('should approve a PR with optional comment', async () => {
      const mockResponse = {
        data: {
          id: 123,
          state: 'APPROVED',
          body: 'Looks good!',
          html_url: 'https://github.com/owner/repo/pull/1#pullrequestreview-123',
          submitted_at: '2023-01-01T00:00:00Z',
          user: {
            login: 'reviewer',
            avatar_url: 'https://github.com/reviewer.png'
          }
        },
        status: 200
      };

      mockOctokit.rest.pulls.createReview.mockResolvedValue(mockResponse);

      const result = await githubService.approvePullRequest('owner', 'repo', 1, 'Looks good!');

      expect(result.success).toBe(true);
      expect(mockOctokit.rest.pulls.createReview).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
        event: 'APPROVE',
        body: 'Looks good!'
      });
    });
  });

  describe('requestPullRequestChanges', () => {
    it('should request changes with required comment', async () => {
      const mockResponse = {
        data: {
          id: 123,
          state: 'CHANGES_REQUESTED',
          body: 'Please fix the tests',
          html_url: 'https://github.com/owner/repo/pull/1#pullrequestreview-123',
          submitted_at: '2023-01-01T00:00:00Z',
          user: {
            login: 'reviewer',
            avatar_url: 'https://github.com/reviewer.png'
          }
        },
        status: 200
      };

      mockOctokit.rest.pulls.createReview.mockResolvedValue(mockResponse);

      const result = await githubService.requestPullRequestChanges('owner', 'repo', 1, 'Please fix the tests');

      expect(result.success).toBe(true);
      expect(mockOctokit.rest.pulls.createReview).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
        event: 'REQUEST_CHANGES',
        body: 'Please fix the tests'
      });
    });

    it('should require a comment when requesting changes', async () => {
      await expect(
        githubService.requestPullRequestChanges('owner', 'repo', 1, '')
      ).rejects.toThrow('A comment is required when requesting changes');

      await expect(
        githubService.requestPullRequestChanges('owner', 'repo', 1, '   ')
      ).rejects.toThrow('A comment is required when requesting changes');
    });
  });

  describe('dismissPullRequestReview', () => {
    it('should dismiss a review successfully', async () => {
      const mockResponse = {
        data: {
          id: 123,
          state: 'DISMISSED'
        },
        status: 200
      };

      mockOctokit.rest.pulls.dismissReview.mockResolvedValue(mockResponse);

      const result = await githubService.dismissPullRequestReview('owner', 'repo', 1, 123, 'No longer relevant');

      expect(result.success).toBe(true);
      expect(mockOctokit.rest.pulls.dismissReview).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
        review_id: 123,
        message: 'No longer relevant'
      });
    });

    it('should require authentication', async () => {
      githubService.token = null;

      await expect(
        githubService.dismissPullRequestReview('owner', 'repo', 1, 123, 'message')
      ).rejects.toThrow('Authentication required to dismiss reviews');
    });
  });
});