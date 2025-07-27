import githubService from './githubService';

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn()
}));

describe('GitHubService', () => {
  let mockOctokit;
  const { Octokit } = require('@octokit/rest');

  beforeEach(() => {
    mockOctokit = {
      rest: {
        users: {
          getAuthenticated: jest.fn()
        },
        repos: {
          listForUser: jest.fn(),
          getContent: jest.fn(),
          get: jest.fn()
        }
      },
      request: jest.fn()
    };
    
    Octokit.mockImplementation(() => mockOctokit);
    
    // Reset service state and clear cache
    githubService.logout();
    
    // Clear the repository compatibility cache
    const repositoryCompatibilityCache = require('../utils/repositoryCompatibilityCache');
    if (repositoryCompatibilityCache.default && repositoryCompatibilityCache.default.clear) {
      repositoryCompatibilityCache.default.clear();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSmartGuidelinesRepositories', () => {
    it('should return repositories with SMART guidelines compatibility', async () => {
      // Mock authentication
      githubService.authenticate('fake-token');

      // Mock repository list
      const mockRepos = [
        {
          id: 1,
          name: 'smart-trust-phw',
          owner: { login: 'litlfred' },
          full_name: 'litlfred/smart-trust-phw',
          description: 'A SMART guidelines repository'
        },
        {
          id: 2,
          name: 'regular-repo',
          owner: { login: 'litlfred' },
          full_name: 'litlfred/regular-repo',
          description: 'A regular repository'
        }
      ];

      mockOctokit.rest.repos.listForUser.mockResolvedValue({
        data: mockRepos
      });

      // Mock sushi-config.yaml content for smart-trust-phw (compatible)
      mockOctokit.rest.repos.getContent
        .mockResolvedValueOnce({
          data: {
            type: 'file',
            content: Buffer.from(`dependencies:
  smart.who.int.base:
    id: sb
    version: 0.1.0`).toString('base64')
          }
        })
        // Mock failure for regular-repo (not compatible)
        .mockRejectedValueOnce(new Error('File not found'));

      const result = await githubService.getSmartGuidelinesRepositories('litlfred', 'user');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('smart-trust-phw');
      expect(result[0].smart_guidelines_compatible).toBe(true);
    });

    it('should handle errors gracefully when checking sushi-config.yaml (strict mode)', async () => {
      // Mock authentication
      githubService.authenticate('fake-token');

      // Mock repository list
      const mockRepos = [
        {
          id: 1,
          name: 'smart-trust-phw',
          owner: { login: 'litlfred' },
          full_name: 'litlfred/smart-trust-phw',
          description: 'A SMART guidelines repository',
          topics: ['smart-guidelines', 'who', 'dak']
        }
      ];

      mockOctokit.rest.repos.listForUser.mockResolvedValue({
        data: mockRepos
      });

      // Mock network error when checking sushi-config.yaml
      mockOctokit.rest.repos.getContent.mockRejectedValue({ 
        status: 429, 
        message: 'rate limit exceeded' 
      });

      const result = await githubService.getSmartGuidelinesRepositories('litlfred', 'user');

      // With strict filtering, should return no repositories when sushi-config.yaml is not accessible
      expect(result).toHaveLength(0);
    });
  });

  describe('checkSmartGuidelinesCompatibility', () => {
    it('should return true for repo with smart.who.int.base dependency', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          content: Buffer.from(`dependencies:
  smart.who.int.base:
    id: sb
    version: 0.1.0`).toString('base64')
        }
      });

      const result = await githubService.checkSmartGuidelinesCompatibility('litlfred', 'smart-trust-phw');

      expect(result).toBe(true);
    });

    it('should return false for repo without smart.who.int.base dependency', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          content: Buffer.from(`dependencies:
  some.other.base:
    id: other
    version: 1.0.0`).toString('base64')
        }
      });

      const result = await githubService.checkSmartGuidelinesCompatibility('litlfred', 'regular-repo');

      expect(result).toBe(false);
    });

    it('should return false when sushi-config.yaml does not exist', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));

      const result = await githubService.checkSmartGuidelinesCompatibility('litlfred', 'no-config-repo');

      expect(result).toBe(false);
    });

    it('should return false when there is a network error', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.repos.getContent.mockRejectedValue(new Error('Network timeout'));

      const result = await githubService.checkSmartGuidelinesCompatibility('litlfred', 'network-error-repo');

      expect(result).toBe(false);
    });

    it('should return false when rate limited (no fallback)', async () => {
      githubService.authenticate('fake-token');

      // Mock rate limit error
      mockOctokit.rest.repos.getContent.mockRejectedValue({ 
        status: 429, 
        message: 'rate limit exceeded' 
      });

      const result = await githubService.checkSmartGuidelinesCompatibility('litlfred', 'rate-limited-repo');

      // With strict filtering, rate limiting should result in false
      expect(result).toBe(false);
    });

    it('should retry on 404 errors', async () => {
      githubService.authenticate('fake-token');

      // Mock 404 error first, then success
      mockOctokit.rest.repos.getContent
        .mockRejectedValueOnce({ status: 404, message: 'Not Found' })
        .mockResolvedValueOnce({
          data: {
            type: 'file',
            content: Buffer.from(`dependencies:
  smart.who.int.base:
    id: sb
    version: 0.1.0`).toString('base64')
          }
        });

      const result = await githubService.checkSmartGuidelinesCompatibility('litlfred', 'retry-repo');

      expect(result).toBe(true);
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledTimes(2);
    });
  });
});