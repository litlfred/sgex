// Test for the WHO organization dynamic fetching functionality
import githubService from '../services/githubService';
import { Octokit } from '@octokit/rest';

// Mock the Octokit to avoid real API calls
jest.mock('@octokit/rest');

describe('GitHub Service WHO Organization Fetching', () => {
  let mockGet;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the Octokit constructor and methods
    mockGet = jest.fn();
    Octokit.mockImplementation(() => ({
      rest: {
        orgs: {
          get: mockGet
        }
      }
    }));

    // Reset the service state
    githubService.octokit = null;
    githubService.isAuthenticated = false;
  });

  afterEach(() => {
    githubService.logout();
  });

  it('should fetch WHO organization data from GitHub API', async () => {
    // Mock successful API response
    mockGet.mockResolvedValue({
      data: {
        id: 12261302,
        login: 'WorldHealthOrganization',
        name: 'World Health Organization',
        description: 'Official WHO GitHub organization',
        avatar_url: 'https://avatars.githubusercontent.com/u/12261302?v=4',
        html_url: 'https://github.com/WorldHealthOrganization'
      }
    });

    const whoOrganization = await githubService.getWHOOrganization();

    expect(whoOrganization).toEqual({
      id: 12261302,
      login: 'WorldHealthOrganization',
      display_name: 'World Health Organization',
      description: 'Official WHO GitHub organization',
      avatar_url: 'https://avatars.githubusercontent.com/u/12261302?v=4',
      html_url: 'https://github.com/WorldHealthOrganization',
      type: 'Organization',
      permissions: {
        can_create_repositories: true,
        can_create_private_repositories: true
      },
      plan: {
        name: 'Organization',
        private_repos: 'unlimited'
      },
      isWHO: true
    });

    expect(mockGet).toHaveBeenCalledWith({
      org: 'WorldHealthOrganization'
    });
  });

  it('should return fallback data when GitHub API fails', async () => {
    // Mock API failure
    mockGet.mockRejectedValue(new Error('API Error'));

    const whoOrganization = await githubService.getWHOOrganization();

    expect(whoOrganization).toEqual({
      id: 'who-organization',
      login: 'WorldHealthOrganization',
      display_name: 'World Health Organization',
      description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
      avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
      html_url: 'https://github.com/WorldHealthOrganization',
      type: 'Organization',
      permissions: {
        can_create_repositories: true,
        can_create_private_repositories: true
      },
      plan: {
        name: 'Organization',
        private_repos: 'unlimited'
      },
      isWHO: true
    });
  });

  it('should fetch organization data without authentication', async () => {
    // Ensure not authenticated
    expect(githubService.isAuth()).toBe(false);

    // Mock successful API response
    mockGet.mockResolvedValue({
      data: {
        id: 12261302,
        login: 'WorldHealthOrganization',
        name: 'World Health Organization',
        description: 'Official WHO GitHub organization',
        avatar_url: 'https://avatars.githubusercontent.com/u/12261302?v=4',
        html_url: 'https://github.com/WorldHealthOrganization'
      }
    });

    const orgData = await githubService.getOrganization('WorldHealthOrganization');

    expect(orgData).toEqual({
      id: 12261302,
      login: 'WorldHealthOrganization',
      name: 'World Health Organization',
      description: 'Official WHO GitHub organization',
      avatar_url: 'https://avatars.githubusercontent.com/u/12261302?v=4',
      html_url: 'https://github.com/WorldHealthOrganization'
    });

    // Should create a temporary Octokit instance since we're not authenticated
    expect(Octokit).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith({
      org: 'WorldHealthOrganization'
    });
  });

  it('should use existing Octokit instance when authenticated', async () => {
    // Mock authentication
    const mockOctokit = {
      rest: {
        orgs: {
          get: jest.fn().mockResolvedValue({
            data: {
              id: 12261302,
              login: 'WorldHealthOrganization',
              name: 'World Health Organization',
              description: 'Official WHO GitHub organization',
              avatar_url: 'https://avatars.githubusercontent.com/u/12261302?v=4',
              html_url: 'https://github.com/WorldHealthOrganization'
            }
          })
        }
      }
    };

    githubService.authenticateWithOctokit(mockOctokit);
    expect(githubService.isAuth()).toBe(true);

    const orgData = await githubService.getOrganization('WorldHealthOrganization');

    expect(orgData).toBeDefined();
    expect(mockOctokit.rest.orgs.get).toHaveBeenCalledWith({
      org: 'WorldHealthOrganization'
    });

    // Should not create a new Octokit instance
    expect(Octokit).not.toHaveBeenCalled();
  });
});