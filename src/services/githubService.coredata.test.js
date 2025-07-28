import githubService from '../services/githubService';

// Mock the Octokit rest API
const mockGetContent = jest.fn();
const mockOctokit = {
  rest: {
    repos: {
      getContent: mockGetContent
    }
  }
};

describe('GitHubService - Core Data Dictionary Methods', () => {
  beforeEach(() => {
    // Reset mocks
    mockGetContent.mockClear();
    
    // Set up authenticated service
    githubService.octokit = mockOctokit;
    githubService.isAuthenticated = true;
  });

  afterEach(() => {
    // Clean up
    githubService.octokit = null;
    githubService.isAuthenticated = false;
  });

  describe('getDirectoryContents', () => {
    it('should fetch directory contents successfully', async () => {
      const mockData = [
        { name: 'file1.fsh', type: 'file', path: 'input/fsh/file1.fsh' },
        { name: 'file2.fsh', type: 'file', path: 'input/fsh/file2.fsh' }
      ];

      mockGetContent.mockResolvedValue({ data: mockData });

      const result = await githubService.getDirectoryContents('owner', 'repo', 'input/fsh', 'main');

      expect(mockGetContent).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        path: 'input/fsh',
        ref: 'main'
      });
      expect(result).toEqual(mockData);
    });

    it('should handle single file response', async () => {
      const mockData = { name: 'file1.fsh', type: 'file', path: 'input/fsh/file1.fsh' };

      mockGetContent.mockResolvedValue({ data: mockData });

      const result = await githubService.getDirectoryContents('owner', 'repo', 'input/fsh');

      expect(result).toEqual([mockData]);
    });

    it('should throw error when not authenticated', async () => {
      githubService.isAuthenticated = false;

      await expect(
        githubService.getDirectoryContents('owner', 'repo', 'input/fsh')
      ).rejects.toThrow('Not authenticated with GitHub');
    });
  });

  describe('getFileContent', () => {
    it('should fetch and decode file content successfully', async () => {
      const fileContent = 'Profile: MyProfile\nDescription: "A test profile"';
      const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));
      
      const mockData = {
        type: 'file',
        content: encodedContent
      };

      mockGetContent.mockResolvedValue({ data: mockData });

      const result = await githubService.getFileContent('owner', 'repo', 'input/fsh/profile.fsh', 'main');

      expect(mockGetContent).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        path: 'input/fsh/profile.fsh',
        ref: 'main'
      });
      expect(result).toBe(fileContent);
    });

    it('should throw error for non-file types', async () => {
      const mockData = {
        type: 'dir'
      };

      mockGetContent.mockResolvedValue({ data: mockData });

      await expect(
        githubService.getFileContent('owner', 'repo', 'input/fsh')
      ).rejects.toThrow('File not found or is not a file');
    });

    it('should throw error when not authenticated', async () => {
      githubService.isAuthenticated = false;

      await expect(
        githubService.getFileContent('owner', 'repo', 'input/fsh/profile.fsh')
      ).rejects.toThrow('Not authenticated with GitHub');
    });
  });
});