import githubService from '../services/githubService';

// Test the new GitHub service method for marking PR ready for review
describe('markPullRequestReadyForReview GitHub Service', () => {
  let originalOctokit;
  let originalIsAuthenticated;
  let originalLogger;

  beforeEach(() => {
    // Save original state
    originalOctokit = githubService.octokit;
    originalIsAuthenticated = githubService.isAuthenticated;
    originalLogger = githubService.logger;

    // Mock the Octokit instance
    githubService.octokit = {
      rest: {
        pulls: {
          update: jest.fn()
        }
      }
    };
    githubService.isAuthenticated = true;
    githubService.logger = {
      apiCall: jest.fn(),
      apiResponse: jest.fn()
    };
  });

  afterEach(() => {
    // Restore original state
    githubService.octokit = originalOctokit;
    githubService.isAuthenticated = originalIsAuthenticated;
    githubService.logger = originalLogger;
  });

  test('successfully marks draft PR as ready for review', async () => {
    const mockResponse = {
      status: 200,
      data: {
        id: 123,
        number: 456,
        draft: false,
        state: 'open',
        title: 'Test PR',
        html_url: 'https://github.com/test/repo/pull/456'
      }
    };

    githubService.octokit.rest.pulls.update.mockResolvedValue(mockResponse);

    const result = await githubService.markPullRequestReadyForReview('test-owner', 'test-repo', 456);

    expect(githubService.octokit.rest.pulls.update).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      pull_number: 456,
      draft: false
    });

    expect(result).toEqual({
      success: true,
      pullRequest: {
        id: 123,
        number: 456,
        draft: false,
        state: 'open',
        title: 'Test PR',
        html_url: 'https://github.com/test/repo/pull/456'
      }
    });

    expect(githubService.logger.apiCall).toHaveBeenCalledWith(
      'PATCH', 
      '/repos/test-owner/test-repo/pulls/456', 
      { draft: false }
    );
    expect(githubService.logger.apiResponse).toHaveBeenCalledWith(
      'PATCH', 
      '/repos/test-owner/test-repo/pulls/456', 
      200, 
      expect.any(Number)
    );
  });

  test('throws error when not authenticated', async () => {
    githubService.isAuthenticated = false;

    await expect(
      githubService.markPullRequestReadyForReview('test-owner', 'test-repo', 456)
    ).rejects.toThrow('Authentication required to mark PR as ready for review');
  });

  test('handles 403 permission error', async () => {
    const apiError = new Error('Forbidden');
    apiError.status = 403;
    githubService.octokit.rest.pulls.update.mockRejectedValue(apiError);

    await expect(
      githubService.markPullRequestReadyForReview('test-owner', 'test-repo', 456)
    ).rejects.toThrow('Forbidden');

    expect(githubService.logger.apiResponse).toHaveBeenCalledWith(
      'PATCH', 
      '/repos/test-owner/test-repo/pulls/456', 
      403, 
      expect.any(Number)
    );
  });

  test('handles 404 not found error', async () => {
    const apiError = new Error('Not Found');
    apiError.status = 404;
    githubService.octokit.rest.pulls.update.mockRejectedValue(apiError);

    await expect(
      githubService.markPullRequestReadyForReview('test-owner', 'test-repo', 456)
    ).rejects.toThrow('Not Found');
  });
});