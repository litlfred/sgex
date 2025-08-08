import githubService from './githubService';
import { Octokit } from '@octokit/rest';

// Mock the Octokit module
jest.mock('@octokit/rest');

describe('GitHubService - Fork and PR Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service state before each test
    githubService.logout();
  });

  describe('getForks', () => {
    it('should fetch repository forks successfully', async () => {
      const mockApiData = [
        {
          id: 1,
          name: 'sgex',
          full_name: 'user1/sgex',
          owner: {
            login: 'user1',
            avatar_url: 'https://github.com/user1.png',
            html_url: 'https://github.com/user1',
            type: 'User'
          },
          description: 'Fork of sgex repository',
          html_url: 'https://github.com/user1/sgex',
          clone_url: 'https://github.com/user1/sgex.git',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          pushed_at: '2024-01-15T10:00:00Z',
          stargazers_count: 5,
          forks_count: 1,
          open_issues_count: 2,
          default_branch: 'main',
          private: false,
          fork: true,
          parent: {
            full_name: 'litlfred/sgex',
            html_url: 'https://github.com/litlfred/sgex'
          }
        }
      ];

      const mockOctokit = {
        rest: {
          repos: {
            listForks: jest.fn().mockResolvedValue({ data: mockApiData })
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      const result = await githubService.getForks('litlfred', 'sgex');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'sgex',
        full_name: 'user1/sgex',
        fork: true
      });
      expect(mockOctokit.rest.repos.listForks).toHaveBeenCalledWith({
        owner: 'litlfred',
        repo: 'sgex',
        sort: 'newest',
        per_page: 100,
        page: 1
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
        githubService.getForks('litlfred', 'sgex')
      ).rejects.toThrow('API Error');
    });

    it('should work without authentication', async () => {
      const mockApiData = [];
      const mockOctokit = {
        rest: {
          repos: {
            listForks: jest.fn().mockResolvedValue({ data: mockApiData })
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      // Ensure not authenticated
      githubService.isAuthenticated = false;
      githubService.octokit = null;

      const result = await githubService.getForks('litlfred', 'sgex');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
      expect(Octokit).toHaveBeenCalledWith(); // Called without auth
    });
  });

  describe('getPullRequests', () => {
    it('should fetch pull requests successfully', async () => {
      const mockApiData = [
        {
          id: 101,
          number: 1,
          title: 'Test PR 1',
          body: 'PR description',
          state: 'open',
          locked: false,
          user: {
            login: 'contributor1',
            avatar_url: 'https://github.com/contributor1.png',
            html_url: 'https://github.com/contributor1',
            type: 'User'
          },
          head: {
            ref: 'feature-branch',
            sha: 'abc123',
            repo: {
              name: 'sgex',
              full_name: 'contributor1/sgex',
              owner: {
                login: 'contributor1',
                avatar_url: 'https://github.com/contributor1.png'
              },
              html_url: 'https://github.com/contributor1/sgex'
            }
          },
          base: {
            ref: 'main',
            sha: 'def456',
            repo: {
              name: 'sgex',
              full_name: 'litlfred/sgex',
              owner: {
                login: 'litlfred',
                avatar_url: 'https://github.com/litlfred.png'
              },
              html_url: 'https://github.com/litlfred/sgex'
            }
          },
          html_url: 'https://github.com/litlfred/sgex/pull/1',
          diff_url: 'https://github.com/litlfred/sgex/pull/1.diff',
          patch_url: 'https://github.com/litlfred/sgex/pull/1.patch',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T11:00:00Z',
          closed_at: null,
          merged_at: null,
          draft: false,
          mergeable: true,
          mergeable_state: 'clean',
          comments: 0,
          review_comments: 0,
          commits: 1,
          additions: 10,
          deletions: 5,
          changed_files: 2
        }
      ];

      const mockOctokit = {
        rest: {
          pulls: {
            list: jest.fn().mockResolvedValue({ data: mockApiData })
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      const result = await githubService.getPullRequests('litlfred', 'sgex', { 
        state: 'open', 
        per_page: 5 
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 101,
        number: 1,
        title: 'Test PR 1',
        state: 'open'
      });
      expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith({
        owner: 'litlfred',
        repo: 'sgex',
        state: 'open',
        sort: 'updated',
        direction: 'desc',
        per_page: 5,
        page: 1
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockOctokit = {
        rest: {
          pulls: {
            list: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      await expect(
        githubService.getPullRequests('litlfred', 'sgex')
      ).rejects.toThrow('API Error');
    });

    it('should respect options parameters', async () => {
      const mockApiData = [];
      const mockOctokit = {
        rest: {
          pulls: {
            list: jest.fn().mockResolvedValue({ data: mockApiData })
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      const options = {
        state: 'closed',
        sort: 'created',
        direction: 'asc',
        per_page: 10,
        page: 1
      };

      await githubService.getPullRequests('litlfred', 'sgex', options);

      expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith({
        owner: 'litlfred',
        repo: 'sgex',
        state: 'closed',
        sort: 'created',
        direction: 'asc',
        per_page: 10,
        page: 1
      });
    });

    it('should work without authentication', async () => {
      const mockApiData = [];
      const mockOctokit = {
        rest: {
          pulls: {
            list: jest.fn().mockResolvedValue({ data: mockApiData })
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      // Ensure not authenticated
      githubService.isAuthenticated = false;
      githubService.octokit = null;

      const result = await githubService.getPullRequests('litlfred', 'sgex');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
      expect(Octokit).toHaveBeenCalledWith(); // Called without auth
    });
  });

  describe('integration scenarios', () => {
    it('should handle the litlfred/sgex repository scenario', async () => {
      const mockForksData = [
        {
          id: 1,
          name: 'sgex',
          full_name: 'contributor/sgex',
          owner: {
            login: 'contributor',
            avatar_url: 'https://github.com/contributor.png',
            html_url: 'https://github.com/contributor',
            type: 'User'
          },
          description: 'Fork for contributions',
          html_url: 'https://github.com/contributor/sgex',
          clone_url: 'https://github.com/contributor/sgex.git',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          pushed_at: '2024-01-15T10:00:00Z',
          stargazers_count: 5,
          forks_count: 0,
          open_issues_count: 1,
          default_branch: 'main',
          private: false,
          fork: true,
          parent: {
            full_name: 'litlfred/sgex',
            html_url: 'https://github.com/litlfred/sgex'
          }
        }
      ];

      const mockPRsData = [
        {
          id: 101,
          number: 1,
          title: 'Add fork selector feature',
          body: 'PR description for fork selector',
          state: 'open',
          locked: false,
          user: {
            login: 'contributor',
            avatar_url: 'https://github.com/contributor.png',
            html_url: 'https://github.com/contributor',
            type: 'User'
          },
          head: {
            ref: 'fork-selector',
            sha: 'abc123',
            repo: {
              name: 'sgex',
              full_name: 'contributor/sgex',
              owner: {
                login: 'contributor',
                avatar_url: 'https://github.com/contributor.png'
              },
              html_url: 'https://github.com/contributor/sgex'
            }
          },
          base: {
            ref: 'main',
            sha: 'def456',
            repo: {
              name: 'sgex',
              full_name: 'litlfred/sgex',
              owner: {
                login: 'litlfred',
                avatar_url: 'https://github.com/litlfred.png'
              },
              html_url: 'https://github.com/litlfred/sgex'
            }
          },
          html_url: 'https://github.com/litlfred/sgex/pull/1',
          diff_url: 'https://github.com/litlfred/sgex/pull/1.diff',
          patch_url: 'https://github.com/litlfred/sgex/pull/1.patch',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T11:00:00Z',
          closed_at: null,
          merged_at: null,
          draft: false,
          mergeable: true,
          mergeable_state: 'clean',
          comments: 0,
          review_comments: 0,
          commits: 1,
          additions: 20,
          deletions: 5,
          changed_files: 3
        }
      ];

      const mockOctokit = {
        rest: {
          repos: {
            listForks: jest.fn().mockResolvedValue({ data: mockForksData })
          },
          pulls: {
            list: jest.fn().mockResolvedValue({ data: mockPRsData })
          }
        }
      };

      Octokit.mockImplementation(() => mockOctokit);

      // Test fork fetching
      const forks = await githubService.getForks('litlfred', 'sgex');
      expect(Array.isArray(forks)).toBe(true);
      expect(forks).toHaveLength(1);

      // Test PR fetching
      const prs = await githubService.getPullRequests('litlfred', 'sgex', { 
        state: 'open',
        per_page: 10 
      });
      expect(Array.isArray(prs)).toBe(true);
      expect(prs).toHaveLength(1);

      // Test that each PR has the expected structure for our UI
      prs.forEach(pr => {
        expect(pr).toHaveProperty('number');
        expect(pr).toHaveProperty('title');
        expect(pr).toHaveProperty('state');
        expect(pr).toHaveProperty('user.login');
        expect(pr).toHaveProperty('head.ref');
        expect(pr).toHaveProperty('html_url');
        expect(pr).toHaveProperty('created_at');
        expect(pr).toHaveProperty('updated_at');
      });
    });
  });
});