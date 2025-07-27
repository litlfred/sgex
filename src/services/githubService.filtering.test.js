import githubService from './githubService';

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn()
}));

describe('GitHubService Repository Filtering', () => {
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

  describe('Issue #125 - Repository filtering should only show DAK repos', () => {
    it('should exclude repositories without smart.who.int.base dependency', async () => {
      // Mock authentication
      githubService.authenticate('fake-token');

      // Mock repository list with both DAK and non-DAK repositories
      const mockRepos = [
        {
          id: 1,
          name: 'smart-immunizations', // This is a valid DAK repo
          owner: { login: 'WorldHealthOrganization' },
          full_name: 'WorldHealthOrganization/smart-immunizations',
          description: 'WHO SMART Guidelines for immunizations'
        },
        {
          id: 2,
          name: 'dhis-web-script-library', // This should be filtered out
          owner: { login: 'litlfred' },
          full_name: 'litlfred/dhis-web-script-library',
          description: 'DHIS2 web scripts library'
        }
      ];

      mockOctokit.rest.repos.listForUser.mockResolvedValue({
        data: mockRepos
      });

      // Mock sushi-config.yaml content for smart-immunizations (should be included)
      // Mock missing sushi-config.yaml for dhis-web-script-library (should be excluded)
      mockOctokit.rest.repos.getContent
        .mockImplementationOnce(async (params) => {
          if (params.repo === 'smart-immunizations') {
            return {
              data: {
                type: 'file',
                content: Buffer.from(`dependencies:
  smart.who.int.base:
    id: sb
    version: 0.1.0`).toString('base64')
              }
            };
          }
          throw new Error('Not found');
        })
        .mockImplementationOnce(async (params) => {
          if (params.repo === 'dhis-web-script-library') {
            throw { status: 404, message: 'Not Found' };
          }
          throw new Error('Not found');
        });

      // Mock fallback repo.get calls (these should still fail for dhis-web-script-library)
      mockOctokit.rest.repos.get
        .mockImplementationOnce(async (params) => {
          if (params.repo === 'dhis-web-script-library') {
            return {
              data: {
                name: 'dhis-web-script-library',
                description: 'DHIS2 web scripts library', // No DAK-related keywords
                topics: ['dhis2', 'javascript'] // No SMART guidelines topics
              }
            };
          }
          throw new Error('Not found');
        });

      const result = await githubService.getSmartGuidelinesRepositories('litlfred', 'user');

      // Should only return the repository with smart.who.int.base dependency
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('smart-immunizations');
      expect(result[0].smart_guidelines_compatible).toBe(true);
      
      // dhis-web-script-library should NOT be included
      expect(result.find(repo => repo.name === 'dhis-web-script-library')).toBeUndefined();
    });

    it('should exclude repositories with DAK-like names but no smart.who.int.base dependency', async () => {
      // Mock authentication
      githubService.authenticate('fake-token');

      // Mock repository with DAK-like name but no proper dependency
      const mockRepos = [
        {
          id: 1,
          name: 'my-smart-guideline-fake', // Looks like it might be a DAK repo
          owner: { login: 'testuser' },
          full_name: 'testuser/my-smart-guideline-fake',
          description: 'A fake smart guideline repository'
        }
      ];

      mockOctokit.rest.repos.listForUser.mockResolvedValue({
        data: mockRepos
      });

      // Mock sushi-config.yaml exists but WITHOUT smart.who.int.base dependency
      mockOctokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          content: Buffer.from(`dependencies:
  other.dependency.base:
    id: other
    version: 1.0.0`).toString('base64')
        }
      });

      const result = await githubService.getSmartGuidelinesRepositories('testuser', 'user');

      // Should return empty array since no repository has smart.who.int.base
      expect(result).toHaveLength(0);
    });

    it('should exclude repositories that cannot access sushi-config.yaml due to rate limiting', async () => {
      // This tests that repositories without accessible sushi-config.yaml are excluded,
      // even if they have DAK-like names or descriptions
      
      // Mock authentication
      githubService.authenticate('fake-token');

      // Mock repository similar to dhis-web-script-library but with keywords that WOULD trigger fallback
      const mockRepos = [
        {
          id: 1,
          name: 'dhis-web-script-library',
          owner: { login: 'litlfred' },
          full_name: 'litlfred/dhis-web-script-library',
          description: 'DHIS2 web scripts library with WHO integration', // Contains 'WHO' keyword
          topics: ['dhis2', 'web'] // No SMART topics
        }
      ];

      mockOctokit.rest.repos.listForUser.mockResolvedValue({
        data: mockRepos
      });

      // Mock rate limiting error - should now result in exclusion
      mockOctokit.rest.repos.getContent.mockRejectedValue({ 
        status: 429, 
        message: 'rate limit exceeded' 
      });

      const result = await githubService.getSmartGuidelinesRepositories('litlfred', 'user');

      // With strict filtering, this should be empty since sushi-config.yaml is not accessible
      expect(result).toHaveLength(0);
    });

    it('should exclude repositories with smart- prefix that lack sushi-config.yaml with smart.who.int.base', async () => {
      jest.setTimeout(10000); // Increase timeout for this test
      
      // This tests that repositories with smart- prefix are excluded if they don't have
      // the required sushi-config.yaml with smart.who.int.base dependency
      
      // Mock authentication
      githubService.authenticate('fake-token');

      // Mock repositories with smart- prefix that should now be excluded without proper dependency
      const mockRepos = [
        {
          id: 1,
          name: 'smart-ra',
          owner: { login: 'litlfred' },
          full_name: 'litlfred/smart-ra',
          description: 'SMART Risk Assessment guidelines'
        },
        {
          id: 2,
          name: 'smart-trust-phw',
          owner: { login: 'litlfred' },
          full_name: 'litlfred/smart-trust-phw',
          description: 'SMART Trust PHW guidelines'
        },
        {
          id: 3,
          name: 'smart-x', // Should be excluded (no proper dependency)
          owner: { login: 'testuser' },
          full_name: 'testuser/smart-x',
          description: 'Some smart guideline'
        },
        {
          id: 4,
          name: 'smart', // Should be excluded (no sushi-config.yaml)
          owner: { login: 'testuser' },
          full_name: 'testuser/smart',
          description: 'Just smart'
        }
      ];

      mockOctokit.rest.repos.listForUser.mockResolvedValue({
        data: mockRepos
      });

      // Mock sushi-config.yaml not found for all repositories
      mockOctokit.rest.repos.getContent.mockRejectedValue({ 
        status: 404, 
        message: 'Not Found' 
      });

      const result = await githubService.getSmartGuidelinesRepositories('litlfred', 'user');

      // With strict filtering, all should be excluded since none have accessible sushi-config.yaml
      expect(result).toHaveLength(0);
    });

    it('should include repositories that have sushi-config.yaml with smart.who.int.base even with generic names', async () => {
      // This tests that the strict filtering correctly includes repositories with the proper dependency
      
      // Mock authentication
      githubService.authenticate('fake-token');

      // Mock repository with generic name but proper dependency
      const mockRepos = [
        {
          id: 1,
          name: 'my-project',
          owner: { login: 'testuser' },
          full_name: 'testuser/my-project',
          description: 'A generic project'
        }
      ];

      mockOctokit.rest.repos.listForUser.mockResolvedValue({
        data: mockRepos
      });

      // Mock sushi-config.yaml WITH smart.who.int.base dependency
      mockOctokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          content: Buffer.from(`name: my-project
dependencies:
  smart.who.int.base:
    id: sb
    version: 0.1.0
  other.dependency:
    id: other
    version: 1.0.0`).toString('base64')
        }
      });

      const result = await githubService.getSmartGuidelinesRepositories('testuser', 'user');

      // Should include the repository since it has the required dependency
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('my-project');
      expect(result[0].smart_guidelines_compatible).toBe(true);
    });
  });
});