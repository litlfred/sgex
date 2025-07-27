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
    
    // Reset service state
    githubService.logout();
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

    it('should handle errors gracefully when checking sushi-config.yaml', async () => {
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

      // Mock network error when checking sushi-config.yaml, but success for fallback
      mockOctokit.rest.repos.getContent.mockRejectedValue({ 
        status: 429, 
        message: 'rate limit exceeded' 
      });
      
      // Mock fallback repository details call
      mockOctokit.rest.repos.get.mockResolvedValue({
        data: {
          name: 'smart-trust-phw',
          description: 'A SMART guidelines repository',
          topics: ['smart-guidelines', 'who', 'dak']
        }
      });

      const result = await githubService.getSmartGuidelinesRepositories('litlfred', 'user');

      // Should now return the repository using fallback indicators
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('smart-trust-phw');
      expect(result[0].smart_guidelines_compatible).toBe(true);
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

    it('should use fallback method when rate limited', async () => {
      githubService.authenticate('fake-token');

      // Mock rate limit error
      mockOctokit.rest.repos.getContent.mockRejectedValue({ 
        status: 429, 
        message: 'rate limit exceeded' 
      });

      // Mock successful fallback
      mockOctokit.rest.repos.get.mockResolvedValue({
        data: {
          name: 'smart-trust-phw',
          description: 'A SMART guidelines repository',
          topics: ['smart-guidelines', 'dak']
        }
      });

      const result = await githubService.checkSmartGuidelinesCompatibility('litlfred', 'smart-trust-phw');

      expect(result).toBe(true);
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

  describe('checkSmartGuidelinesFallback', () => {
    it('should return true for repository with SMART guidelines topics', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.repos.get.mockResolvedValue({
        data: {
          name: 'test-repo',
          description: 'A test repository',
          topics: ['smart-guidelines', 'fhir', 'who']
        }
      });

      const result = await githubService.checkSmartGuidelinesFallback('litlfred', 'test-repo');

      expect(result).toBe(true);
    });

    it('should return true for repository with SMART guidelines in description', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.repos.get.mockResolvedValue({
        data: {
          name: 'test-repo',
          description: 'This is a digital adaptation kit for WHO SMART guidelines',
          topics: []
        }
      });

      const result = await githubService.checkSmartGuidelinesFallback('litlfred', 'test-repo');

      expect(result).toBe(true);
    });

    it('should return false for repository without SMART guidelines indicators', async () => {
      githubService.authenticate('fake-token');

      mockOctokit.rest.repos.get.mockResolvedValue({
        data: {
          name: 'regular-repo',
          description: 'Just a regular repository',
          topics: ['javascript', 'node']
        }
      });

      const result = await githubService.checkSmartGuidelinesFallback('litlfred', 'regular-repo');

      expect(result).toBe(false);
    });
  });

  describe('getBpmnFiles', () => {
    it('should fetch BPMN files from both business-processes and business-process directories', async () => {
      githubService.authenticate('fake-token');

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

    it('should return empty array when directories do not exist', async () => {
      githubService.authenticate('fake-token');

      // Mock 404 responses for both directory paths
      const notFoundError = new Error('Not Found');
      notFoundError.status = 404;
      mockOctokit.rest.repos.getContent.mockRejectedValue(notFoundError);

      const result = await githubService.getBpmnFiles('test-owner', 'test-repo', 'main');

      expect(result).toHaveLength(0);
    });

    it('should handle recursive directory structure', async () => {
      githubService.authenticate('fake-token');

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

    it('should throw error when not authenticated', async () => {
      await expect(githubService.getBpmnFiles('test-owner', 'test-repo'))
        .rejects.toThrow('Not authenticated with GitHub');
    });
  });

  describe('getBpmnFilesRecursive', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      githubService.authenticate('fake-token');
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

    it('should return empty array when directory does not exist', async () => {
      const notFoundError = new Error('Not Found');
      notFoundError.status = 404;
      mockOctokit.rest.repos.getContent.mockRejectedValue(notFoundError);

      const result = await githubService.getBpmnFilesRecursive('test-owner', 'test-repo', 'nonexistent/path');

      expect(result).toHaveLength(0);
    });
  });
});