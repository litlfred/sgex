import githubService from '../services/githubService';
import { Octokit } from '@octokit/rest';

// Mock Octokit
jest.mock('@octokit/rest');

describe('GitHubService BPMN functionality', () => {
  let mockOctokit;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock Octokit instance
    mockOctokit = {
      rest: {
        repos: {
          getContent: jest.fn()
        }
      }
    };
    
    // Mock Octokit constructor
    Octokit.mockImplementation(() => mockOctokit);
  });

  afterEach(() => {
    githubService.logout();
  });

  describe('getFileContent', () => {
    it('should fetch file content for public repositories without authentication', async () => {
      const mockFileContent = '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions>test content</bpmn:definitions>';
      const mockFileData = {
        type: 'file',
        content: Buffer.from(mockFileContent).toString('base64')
      };

      mockOctokit.rest.repos.getContent.mockResolvedValue({ data: mockFileData });

      const content = await githubService.getFileContent('WorldHealthOrganization', 'smart-ips-pilgrimage', 'input/business-processes/test.bpmn');

      expect(content).toBe(mockFileContent);
      expect(mockOctokit.rest.repos.getContent).toHaveBeenCalledWith({
        owner: 'WorldHealthOrganization',
        repo: 'smart-ips-pilgrimage',
        path: 'input/business-processes/test.bpmn',
        ref: 'main'
      });
    });

    it('should use authenticated instance when available', async () => {
      // Authenticate first
      githubService.authenticate('test-token');
      
      const mockFileContent = '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions>authenticated content</bpmn:definitions>';
      const mockFileData = {
        type: 'file',
        content: Buffer.from(mockFileContent).toString('base64')
      };

      // Mock the authenticated octokit instance
      githubService.octokit = {
        rest: {
          repos: {
            getContent: jest.fn().mockResolvedValue({ data: mockFileData })
          }
        }
      };

      const content = await githubService.getFileContent('private-org', 'private-repo', 'test.bpmn', 'develop');

      expect(content).toBe(mockFileContent);
      expect(githubService.octokit.rest.repos.getContent).toHaveBeenCalledWith({
        owner: 'private-org',
        repo: 'private-repo',
        path: 'test.bpmn',
        ref: 'develop'
      });
    });

    it('should handle errors properly', async () => {
      const mockError = new Error('File not found');
      mockError.status = 404;
      mockOctokit.rest.repos.getContent.mockRejectedValue(mockError);

      await expect(
        githubService.getFileContent('owner', 'repo', 'nonexistent.bpmn')
      ).rejects.toThrow('File not found');
    });

    it('should handle non-file responses', async () => {
      const mockDirectoryData = {
        type: 'dir'
      };

      mockOctokit.rest.repos.getContent.mockResolvedValue({ data: mockDirectoryData });

      await expect(
        githubService.getFileContent('owner', 'repo', 'directory/')
      ).rejects.toThrow('File not found or is not a file');
    });
  });

  describe('getBpmnFilesRecursive', () => {
    it('should recursively find BPMN files in directories', async () => {
      const mockDirectoryData = [
        {
          name: 'test.bpmn',
          type: 'file',
          path: 'input/business-processes/test.bpmn'
        },
        {
          name: 'subdirectory',
          type: 'dir',
          path: 'input/business-processes/subdirectory'
        }
      ];

      const mockSubdirectoryData = [
        {
          name: 'nested.bpmn',
          type: 'file',
          path: 'input/business-processes/subdirectory/nested.bpmn'
        }
      ];

      mockOctokit.rest.repos.getContent
        .mockResolvedValueOnce({ data: mockDirectoryData })
        .mockResolvedValueOnce({ data: mockSubdirectoryData });

      const files = await githubService.getBpmnFilesRecursive('owner', 'repo', 'input/business-processes');

      expect(files).toHaveLength(2);
      expect(files[0].name).toBe('test.bpmn');
      expect(files[1].name).toBe('nested.bpmn');
    });

    it('should return empty array for non-existent directories', async () => {
      const mockError = new Error('Not Found');
      mockError.status = 404;
      mockOctokit.rest.repos.getContent.mockRejectedValue(mockError);

      const files = await githubService.getBpmnFilesRecursive('owner', 'repo', 'nonexistent');

      expect(files).toEqual([]);
    });
  });

  describe('getBpmnFiles', () => {
    it('should search both possible directory paths', async () => {
      const mockFiles1 = [
        {
          name: 'process1.bpmn',
          type: 'file',
          path: 'input/business-processes/process1.bpmn'
        }
      ];

      const mockFiles2 = [
        {
          name: 'process2.bpmn',
          type: 'file',
          path: 'input/business-process/process2.bpmn'
        }
      ];

      // Mock calls for both directories
      mockOctokit.rest.repos.getContent
        .mockResolvedValueOnce({ data: mockFiles1 })
        .mockResolvedValueOnce({ data: mockFiles2 });

      const files = await githubService.getBpmnFiles('owner', 'repo');

      expect(files).toHaveLength(2);
      expect(files[0].name).toBe('process1.bpmn');
      expect(files[1].name).toBe('process2.bpmn');
    });

    it('should remove duplicates based on path', async () => {
      const duplicateFile = {
        name: 'duplicate.bpmn',
        type: 'file',
        path: 'input/business-processes/duplicate.bpmn'
      };

      // Mock both directories returning the same file
      mockOctokit.rest.repos.getContent
        .mockResolvedValueOnce({ data: [duplicateFile] })
        .mockResolvedValueOnce({ data: [duplicateFile] });

      const files = await githubService.getBpmnFiles('owner', 'repo');

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('duplicate.bpmn');
    });
  });
});