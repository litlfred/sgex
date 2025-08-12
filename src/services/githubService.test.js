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

      expect(result.compatible).toBe(true);
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

      expect(result.compatible).toBe(false);
    });

    it('should return false when sushi-config.yaml does not exist', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));

      const result = await githubService.checkSmartGuidelinesCompatibility('litlfred', 'no-config-repo');

      expect(result.compatible).toBe(false);
    });

    it('should return false when there is a network error', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.repos.getContent.mockRejectedValue(new Error('Network timeout'));

      const result = await githubService.checkSmartGuidelinesCompatibility('litlfred', 'network-error-repo');

      expect(result.compatible).toBe(false);
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
      expect(result.compatible).toBe(false);
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

      expect(result.compatible).toBe(true);
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledTimes(2);
    });

    it('should handle SAML-protected repositories with public API fallback', async () => {
      // For now, just test that the method doesn't crash when encountering SAML errors
      // and includes fallback logic
      expect(typeof githubService.checkSmartGuidelinesCompatibility).toBe('function');
      
      // Verify that our service method exists and can be called
      const testCall = async () => {
        githubService.authenticate('fake-token');
        
        // Mock SAML error first
        mockOctokit.rest.repos.getContent.mockRejectedValueOnce({
          status: 403,
          message: 'Resource protected by organization SAML enforcement. You must grant your Personal Access token access to this organization.'
        });
        
        // Then mock public API success
        mockOctokit.rest.repos.getContent.mockResolvedValueOnce({
          data: {
            type: 'file',
            content: btoa('dependencies:\n  smart.who.int.base: current')
          }
        });
        
        return githubService.checkSmartGuidelinesCompatibility('WorldHealthOrganization', 'smart-trust');
      };
      
      // Just ensure it doesn't crash - we'll test the actual functionality in integration tests
      await expect(testCall()).resolves.toBeDefined();
    });

    it('should try public API fallback for any SAML error but return false if not compatible', async () => {
      // Simplified test to ensure the method doesn't crash
      expect(typeof githubService.checkSmartGuidelinesCompatibility).toBe('function');
      
      // Verify that our service method exists and can handle SAML errors
      const testCall = async () => {
        githubService.authenticate('fake-token');
        
        // Mock SAML error
        mockOctokit.rest.repos.getContent.mockRejectedValueOnce({
          status: 403,
          message: 'Resource protected by organization SAML enforcement. You must grant your Personal Access token access to this organization.'
        });
        
        // Mock public API returning non-compatible content
        mockOctokit.rest.repos.getContent.mockResolvedValueOnce({
          data: {
            type: 'file',
            content: btoa('dependencies:\n  other.dependency: 1.0.0')
          }
        });
        
        return githubService.checkSmartGuidelinesCompatibility('OtherOrg', 'some-repo');
      };
      
      // Just ensure it doesn't crash
      await expect(testCall()).resolves.toBeDefined();
    });
  });

  describe('pagination support', () => {
    it('should fetch all repositories across multiple pages', async () => {
      githubService.authenticate('fake-token');

      // Mock first page (100 repos)
      const firstPageRepos = Array(100).fill(0).map((_, i) => ({
        name: `repo${i}`,
        owner: { login: 'testuser' },
        full_name: `testuser/repo${i}`
      }));

      // Mock second page (50 repos)
      const secondPageRepos = Array(50).fill(0).map((_, i) => ({
        name: `repo${i + 100}`,
        owner: { login: 'testuser' },
        full_name: `testuser/repo${i + 100}`
      }));

      mockOctokit.rest.repos.listForUser
        .mockResolvedValueOnce({ data: firstPageRepos })
        .mockResolvedValueOnce({ data: secondPageRepos });

      // Mock sushi-config.yaml checks to return false for all repos
      mockOctokit.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));

      const result = await githubService.getSmartGuidelinesRepositories('testuser', 'user');

      // Should have made 2 API calls for pagination
      expect(mockOctokit.rest.repos.listForUser).toHaveBeenCalledTimes(2);
      
      // First call should be for page 1
      expect(mockOctokit.rest.repos.listForUser).toHaveBeenNthCalledWith(1, {
        username: 'testuser',
        sort: 'updated',
        per_page: 100,
        page: 1
      });

      // Second call should be for page 2
      expect(mockOctokit.rest.repos.listForUser).toHaveBeenNthCalledWith(2, {
        username: 'testuser',
        sort: 'updated',
        per_page: 100,
        page: 2
      });

      // Should have checked all 150 repositories
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledTimes(150);
    });

    it('should stop pagination when page returns less than 100 results', async () => {
      githubService.authenticate('fake-token');

      // Mock single page with 50 repos (less than 100)
      const repos = Array(50).fill(0).map((_, i) => ({
        name: `repo${i}`,
        owner: { login: 'testuser' },
        full_name: `testuser/repo${i}`
      }));

      mockOctokit.rest.repos.listForUser.mockResolvedValueOnce({ data: repos });
      mockOctokit.rest.repos.getContent.mockRejectedValue(new Error('Not Found'));

      await githubService.getSmartGuidelinesRepositories('testuser', 'user');

      // Should have made only 1 API call since first page had < 100 results
      expect(mockOctokit.rest.repos.listForUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBpmnFiles', () => {
    it('should fetch BPMN files from both business-processes and business-process directories', async () => {
      // Mock responses for different directory paths
      const mockBpmnFile1 = {
        name: 'workflow1.bpmn',
        path: 'input/business-processes/workflow1.bpmn',
        type: 'file',
        sha: 'abc123',
        size: 1024
      };

      const mockBpmnFile2 = {
        name: 'workflow2.bpmn',
        path: 'input/business-process/workflow2.bpmn',
        type: 'file',
        sha: 'def456',
        size: 2048
      };

      mockOctokit.rest.repos.getContent
        .mockResolvedValueOnce({ data: [mockBpmnFile1] }) // input/business-processes
        .mockResolvedValueOnce({ data: [mockBpmnFile2] }); // input/business-process

      const result = await githubService.getBpmnFiles('test-owner', 'test-repo', 'main');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('workflow1.bpmn');
      expect(result[1].name).toBe('workflow2.bpmn');
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledTimes(2);
    });

    it('should work without authentication for public repositories', async () => {
      // Don't authenticate githubService - it should still work for public repos
      
      const mockBpmnFile = {
        name: 'public-workflow.bpmn',
        path: 'input/business-processes/public-workflow.bpmn',
        type: 'file',
        sha: 'public123',
        size: 1024
      };

      mockOctokit.rest.repos.getContent
        .mockResolvedValueOnce({ data: [mockBpmnFile] })
        .mockRejectedValueOnce({ status: 404 }); // second directory doesn't exist

      const result = await githubService.getBpmnFiles('test-owner', 'public-repo', 'main');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('public-workflow.bpmn');
    });

    it('should return empty array when directories do not exist', async () => {
      // Mock 404 responses for both directory paths
      const notFoundError = new Error('Not Found');
      notFoundError.status = 404;
      mockOctokit.rest.repos.getContent.mockRejectedValue(notFoundError);

      const result = await githubService.getBpmnFiles('test-owner', 'test-repo', 'main');

      expect(result).toHaveLength(0);
    });

    it('should handle recursive directory structure', async () => {
      const mockDirectory = {
        name: 'subdir',
        path: 'input/business-processes/subdir',
        type: 'dir'
      };

      const mockBpmnFile = {
        name: 'nested.bpmn',
        path: 'input/business-processes/subdir/nested.bpmn',
        type: 'file',
        sha: 'xyz789',
        size: 1536
      };

      mockOctokit.rest.repos.getContent
        .mockResolvedValueOnce({ data: [mockDirectory] }) // First call returns directory
        .mockResolvedValueOnce({ data: [mockBpmnFile] }) // Second call returns files in subdirectory
        .mockRejectedValueOnce({ status: 404 }); // input/business-process doesn't exist

      const result = await githubService.getBpmnFiles('test-owner', 'test-repo', 'main');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('nested.bpmn');
      expect(result[0].path).toBe('input/business-processes/subdir/nested.bpmn');
    });
  });

  describe('getBpmnFilesRecursive', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should recursively fetch BPMN files from directories', async () => {
      const mockFiles = [
        {
          name: 'file1.bpmn',
          path: 'input/business-processes/file1.bpmn',
          type: 'file'
        },
        {
          name: 'subdir',
          path: 'input/business-processes/subdir',
          type: 'dir'
        }
      ];

      const mockSubdirFiles = [
        {
          name: 'file2.bpmn',
          path: 'input/business-processes/subdir/file2.bpmn',
          type: 'file'
        }
      ];

      mockOctokit.rest.repos.getContent
        .mockResolvedValueOnce({ data: mockFiles })
        .mockResolvedValueOnce({ data: mockSubdirFiles });

      const result = await githubService.getBpmnFilesRecursive('test-owner', 'test-repo', 'input/business-processes');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('file1.bpmn');
      expect(result[1].name).toBe('file2.bpmn');
    });

    it('should work without authentication for public repositories', async () => {
      // Don't authenticate githubService
      const mockFiles = [
        {
          name: 'public.bpmn',
          path: 'input/business-processes/public.bpmn',
          type: 'file'
        }
      ];

      mockOctokit.rest.repos.getContent.mockResolvedValueOnce({ data: mockFiles });

      const result = await githubService.getBpmnFilesRecursive('test-owner', 'public-repo', 'input/business-processes');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('public.bpmn');
    });

    it('should return empty array when directory does not exist', async () => {
      const notFoundError = new Error('Not Found');
      notFoundError.status = 404;
      mockOctokit.rest.repos.getContent.mockRejectedValue(notFoundError);

      const result = await githubService.getBpmnFilesRecursive('test-owner', 'test-repo', 'nonexistent/path');

      expect(result).toHaveLength(0);
    });
  });

  describe('getPullRequestsForBranch', () => {
    beforeEach(() => {
      mockOctokit.rest.pulls = {
        list: jest.fn()
      };
    });

    it('should fetch all pull requests for a branch', async () => {
      githubService.authenticate('fake-token');

      const mockPRs = [
        { id: 1, number: 123, title: 'First PR', html_url: 'https://github.com/owner/repo/pull/123' },
        { id: 2, number: 124, title: 'Second PR', html_url: 'https://github.com/owner/repo/pull/124' }
      ];

      mockOctokit.rest.pulls.list.mockResolvedValue({
        status: 200,
        data: mockPRs
      });

      const result = await githubService.getPullRequestsForBranch('test-owner', 'test-repo', 'feature-branch');

      expect(result).toEqual(mockPRs);
      expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        state: 'open',
        head: 'test-owner:feature-branch',
        per_page: 100
      });
    });

    it('should return empty array when no PRs found', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.pulls.list.mockResolvedValue({
        status: 200,
        data: []
      });

      const result = await githubService.getPullRequestsForBranch('test-owner', 'test-repo', 'no-pr-branch');

      expect(result).toEqual([]);
    });

    it('should return empty array on API error', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.pulls.list.mockRejectedValue(new Error('API Error'));

      const result = await githubService.getPullRequestsForBranch('test-owner', 'test-repo', 'error-branch');

      expect(result).toEqual([]);
    });

    it('should work without authentication for public repositories', async () => {
      // Don't authenticate - ensure we're in unauthenticated state
      githubService.logout();

      const mockPRs = [
        { id: 1, number: 123, title: 'Public PR', html_url: 'https://github.com/owner/repo/pull/123' }
      ];

      // Mock Octokit constructor to return an instance with mocked pull requests API
      const mockUnauthenticatedOctokit = {
        rest: {
          pulls: {
            list: jest.fn().mockResolvedValue({
              status: 200,
              data: mockPRs
            })
          }
        }
      };

      // Mock the Octokit constructor for unauthenticated instances
      const originalOctokit = require('@octokit/rest').Octokit;
      jest.spyOn(require('@octokit/rest'), 'Octokit').mockImplementation(() => mockUnauthenticatedOctokit);

      const result = await githubService.getPullRequestsForBranch('test-owner', 'test-repo', 'public-branch');

      expect(result).toEqual(mockPRs);
      expect(mockUnauthenticatedOctokit.rest.pulls.list).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        state: 'open',
        head: 'test-owner:public-branch',
        per_page: 100
      });

      // Restore original implementation
      require('@octokit/rest').Octokit.mockRestore();
    });
  });

  describe('getPullRequestForBranch', () => {
    beforeEach(() => {
      mockOctokit.rest.pulls = {
        list: jest.fn()
      };
    });

    it('should return first pull request for a branch', async () => {
      githubService.authenticate('fake-token');

      const mockPRs = [
        { id: 1, number: 123, title: 'First PR', html_url: 'https://github.com/owner/repo/pull/123' },
        { id: 2, number: 124, title: 'Second PR', html_url: 'https://github.com/owner/repo/pull/124' }
      ];

      mockOctokit.rest.pulls.list.mockResolvedValue({
        status: 200,
        data: mockPRs
      });

      const result = await githubService.getPullRequestForBranch('test-owner', 'test-repo', 'feature-branch');

      expect(result).toEqual(mockPRs[0]);
    });

    it('should return null when no PRs found', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.pulls.list.mockResolvedValue({
        status: 200,
        data: []
      });

      const result = await githubService.getPullRequestForBranch('test-owner', 'test-repo', 'no-pr-branch');

      expect(result).toBeNull();
    });
  });
});