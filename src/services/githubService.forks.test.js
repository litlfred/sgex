import githubService from './githubService';
import { Octokit } from '@octokit/rest';

// Mock the Octokit module
jest.mock('@octokit/rest');

describe('GitHubService - Repository Forks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRepositoryForks', () => {
    it('should fetch repository forks successfully', async () => {
      const mockForks = [
        {
          id: 1,
          name: 'sgex',
          full_name: 'user1/sgex',
          owner: {
            login: 'user1',
            avatar_url: 'https://github.com/user1.png',
            type: 'User'
          },
          description: 'Fork of sgex repository',
          stargazers_count: 5,
          open_issues_count: 2,
          default_branch: 'main',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'sgex',
          full_name: 'user2/sgex',
          owner: {
            login: 'user2',
            avatar_url: 'https://github.com/user2.png',
            type: 'User'
          },
          description: 'Another fork of sgex',
          stargazers_count: 3,
          open_issues_count: 0,
          default_branch: 'main',
          updated_at: '2024-01-20T15:00:00Z'
        }
      ];

      const mockOctokit = {
        rest: {
          repos: {
            listForks: jest.fn().mockResolvedValue({ data: mockForks })
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      const result = await githubService.getRepositoryForks('litlfred', 'sgex');

      expect(result).toEqual(mockForks);
      expect(mockOctokit.rest.repos.listForks).toHaveBeenCalledWith({
        owner: 'litlfred',
        repo: 'sgex',
        sort: 'newest',
        per_page: 100,
        page: 1
      });
    });

    it('should handle pagination options', async () => {
      const mockForks = [];
      const mockOctokit = {
        rest: {
          repos: {
            listForks: jest.fn().mockResolvedValue({ data: mockForks })
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      await githubService.getRepositoryForks('litlfred', 'sgex', {
        per_page: 50,
        page: 2
      });

      expect(mockOctokit.rest.repos.listForks).toHaveBeenCalledWith({
        owner: 'litlfred',
        repo: 'sgex',
        sort: 'newest',
        per_page: 50,
        page: 2
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockOctokit = {
        rest: {
          repos: {
            listForks: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      await expect(
        githubService.getRepositoryForks('litlfred', 'sgex')
      ).rejects.toThrow('API Error');
    });

    it('should work without authentication', async () => {
      const mockForks = [];
      const mockOctokit = {
        rest: {
          repos: {
            listForks: jest.fn().mockResolvedValue({ data: mockForks })
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      // Ensure not authenticated
      githubService.isAuthenticated = false;
      githubService.octokit = null;

      const result = await githubService.getRepositoryForks('litlfred', 'sgex');

      expect(result).toEqual(mockForks);
      expect(Octokit).toHaveBeenCalledWith(); // Called without auth
    });
  });
});