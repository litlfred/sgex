import githubService from '../services/githubService';

// Mock Octokit
const mockOctokit = {
  rest: {
    pulls: {
      merge: jest.fn(),
      get: jest.fn()
    }
  }
};

// Mock the logger
const mockLogger = {
  apiCall: jest.fn(),
  apiResponse: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

describe('GitHubService Merge PR Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up the service with mocked dependencies
    githubService.octokit = mockOctokit;
    githubService.isAuthenticated = true;
    githubService.logger = mockLogger;
  });

  describe('mergePullRequest', () => {
    test('merges PR with default options', async () => {
      const mockMergeResponse = {
        status: 200,
        data: {
          sha: 'merged-commit-sha',
          merged: true,
          message: 'Pull Request successfully merged'
        }
      };

      mockOctokit.rest.pulls.merge.mockResolvedValue(mockMergeResponse);

      const result = await githubService.mergePullRequest('testowner', 'testrepo', 123);

      expect(mockOctokit.rest.pulls.merge).toHaveBeenCalledWith({
        owner: 'testowner',
        repo: 'testrepo',
        pull_number: 123,
        merge_method: 'merge',
        commit_title: undefined,
        commit_message: undefined
      });

      expect(result).toEqual(mockMergeResponse.data);
      expect(mockLogger.apiCall).toHaveBeenCalledWith(
        'PUT',
        '/repos/testowner/testrepo/pulls/123/merge',
        {}
      );
      expect(mockLogger.apiResponse).toHaveBeenCalledWith(
        'PUT',
        '/repos/testowner/testrepo/pulls/123/merge',
        200,
        expect.any(Number)
      );
    });

    test('merges PR with custom options', async () => {
      const mockMergeResponse = {
        status: 200,
        data: {
          sha: 'merged-commit-sha',
          merged: true,
          message: 'Pull Request successfully merged'
        }
      };

      const customOptions = {
        commit_title: 'Custom merge title',
        commit_message: 'Custom merge message',
        merge_method: 'squash'
      };

      mockOctokit.rest.pulls.merge.mockResolvedValue(mockMergeResponse);

      const result = await githubService.mergePullRequest('testowner', 'testrepo', 123, customOptions);

      expect(mockOctokit.rest.pulls.merge).toHaveBeenCalledWith({
        owner: 'testowner',
        repo: 'testrepo',
        pull_number: 123,
        commit_title: 'Custom merge title',
        commit_message: 'Custom merge message',
        merge_method: 'squash'
      });

      expect(result).toEqual(mockMergeResponse.data);
    });

    test('throws error when not authenticated', async () => {
      githubService.isAuthenticated = false;

      await expect(
        githubService.mergePullRequest('testowner', 'testrepo', 123)
      ).rejects.toThrow('Not authenticated with GitHub');

      expect(mockOctokit.rest.pulls.merge).not.toHaveBeenCalled();
    });

    test('handles API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockError.status = 422;

      mockOctokit.rest.pulls.merge.mockRejectedValue(mockError);

      await expect(
        githubService.mergePullRequest('testowner', 'testrepo', 123)
      ).rejects.toThrow('API Error');

      expect(mockLogger.apiResponse).toHaveBeenCalledWith(
        'PUT',
        '/repos/testowner/testrepo/pulls/123/merge',
        422,
        expect.any(Number)
      );
    });
  });

  describe('checkPullRequestMergePermissions', () => {
    test('returns true for open PR with write access', async () => {
      const mockPRResponse = {
        status: 200,
        data: {
          state: 'open',
          draft: false,
          number: 123,
          title: 'Test PR'
        }
      };

      mockOctokit.rest.pulls.get.mockResolvedValue(mockPRResponse);
      
      // Mock the write permissions check
      githubService.checkRepositoryWritePermissions = jest.fn().mockResolvedValue(true);

      const result = await githubService.checkPullRequestMergePermissions('testowner', 'testrepo', 123);

      expect(result).toBe(true);
      expect(mockOctokit.rest.pulls.get).toHaveBeenCalledWith({
        owner: 'testowner',
        repo: 'testrepo',
        pull_number: 123
      });
      expect(githubService.checkRepositoryWritePermissions).toHaveBeenCalledWith('testowner', 'testrepo');
    });

    test('returns false for closed PR', async () => {
      const mockPRResponse = {
        status: 200,
        data: {
          state: 'closed',
          draft: false,
          number: 123,
          title: 'Test PR'
        }
      };

      mockOctokit.rest.pulls.get.mockResolvedValue(mockPRResponse);

      const result = await githubService.checkPullRequestMergePermissions('testowner', 'testrepo', 123);

      expect(result).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'PR not mergeable - not open',
        { owner: 'testowner', repo: 'testrepo', pullNumber: 123, state: 'closed' }
      );
    });

    test('returns false for draft PR', async () => {
      const mockPRResponse = {
        status: 200,
        data: {
          state: 'open',
          draft: true,
          number: 123,
          title: 'Test PR'
        }
      };

      mockOctokit.rest.pulls.get.mockResolvedValue(mockPRResponse);

      const result = await githubService.checkPullRequestMergePermissions('testowner', 'testrepo', 123);

      expect(result).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'PR not mergeable - is draft',
        { owner: 'testowner', repo: 'testrepo', pullNumber: 123 }
      );
    });

    test('returns false when user lacks write access', async () => {
      const mockPRResponse = {
        status: 200,
        data: {
          state: 'open',
          draft: false,
          number: 123,
          title: 'Test PR'
        }
      };

      mockOctokit.rest.pulls.get.mockResolvedValue(mockPRResponse);
      
      // Mock the write permissions check to return false
      githubService.checkRepositoryWritePermissions = jest.fn().mockResolvedValue(false);

      const result = await githubService.checkPullRequestMergePermissions('testowner', 'testrepo', 123);

      expect(result).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'PR not mergeable - no write access',
        { owner: 'testowner', repo: 'testrepo', pullNumber: 123 }
      );
    });

    test('returns false when not authenticated', async () => {
      githubService.isAuthenticated = false;

      const result = await githubService.checkPullRequestMergePermissions('testowner', 'testrepo', 123);

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Cannot check PR merge permissions - not authenticated',
        { owner: 'testowner', repo: 'testrepo', pullNumber: 123 }
      );
      expect(mockOctokit.rest.pulls.get).not.toHaveBeenCalled();
    });

    test('handles API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockError.status = 404;

      mockOctokit.rest.pulls.get.mockRejectedValue(mockError);

      const result = await githubService.checkPullRequestMergePermissions('testowner', 'testrepo', 123);

      expect(result).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Error checking PR merge permissions',
        { owner: 'testowner', repo: 'testrepo', pullNumber: 123, error: 'API Error' }
      );
    });
  });

  describe('isAuth method compatibility', () => {
    test('isAuth returns correct authentication status', () => {
      githubService.isAuthenticated = true;
      expect(githubService.isAuth()).toBe(true);

      githubService.isAuthenticated = false;
      expect(githubService.isAuth()).toBe(false);
    });
  });
});