/**
 * Test to reproduce and debug WHO repository scanning failures
 * This test helps identify why scanning fails silently for WHO organization
 */

import githubService from '../services/githubService';
import repositoryCompatibilityCache from '../utils/repositoryCompatibilityCache';

describe('WHO Repository Scanning', () => {
  // Mock GitHub API responses for WHO organization
  const mockWHORepositories = [
    {
      id: 1,
      name: 'smart-immunizations',
      full_name: 'WorldHealthOrganization/smart-immunizations',
      owner: { login: 'WorldHealthOrganization' },
      description: 'WHO SMART Guidelines for Immunizations',
      private: false,
      html_url: 'https://github.com/WorldHealthOrganization/smart-immunizations',
      topics: ['who', 'smart-guidelines', 'immunizations'],
      language: 'FML',
      stargazers_count: 20,
      forks_count: 5,
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'smart-base',
      full_name: 'WorldHealthOrganization/smart-base',
      owner: { login: 'WorldHealthOrganization' },
      description: 'WHO SMART Guidelines Base Implementation Guide',
      private: false,
      html_url: 'https://github.com/WorldHealthOrganization/smart-base',
      topics: ['who', 'smart-guidelines', 'base'],
      language: 'FML',
      stargazers_count: 35,
      forks_count: 8,
      updated_at: '2024-01-20T14:15:00Z'
    },
    {
      id: 3,
      name: 'smart-anc',
      full_name: 'WorldHealthOrganization/smart-anc',
      owner: { login: 'WorldHealthOrganization' },
      description: 'WHO SMART Guidelines for Antenatal Care',
      private: false,
      html_url: 'https://github.com/WorldHealthOrganization/smart-anc',
      topics: ['who', 'smart-guidelines', 'anc'],
      language: 'FML',
      stargazers_count: 15,
      forks_count: 3,
      updated_at: '2024-01-18T09:20:00Z'
    },
    {
      id: 4,
      name: 'regular-repo',
      full_name: 'WorldHealthOrganization/regular-repo',
      owner: { login: 'WorldHealthOrganization' },
      description: 'A regular repository without SMART Guidelines',
      private: false,
      html_url: 'https://github.com/WorldHealthOrganization/regular-repo',
      topics: ['health', 'documentation'],
      language: 'Markdown',
      stargazers_count: 5,
      forks_count: 1,
      updated_at: '2024-01-10T16:30:00Z'
    }
  ];

  // Mock sushi-config.yaml content for SMART Guidelines repositories
  const mockSushiConfigWithSmartBase = `
id: smart.who.int.immunizations
canonical: http://smart.who.int/immunizations
name: SmartImmunizations
title: WHO SMART Guidelines - Immunizations
description: WHO SMART Guidelines for Immunizations
status: draft
version: 1.0.0
fhirVersion: 4.0.1
copyrightYear: 2024+
releaseLabel: ci-build
publisher:
  name: World Health Organization (WHO)
  url: https://www.who.int

dependencies:
  smart.who.int.base: current
  hl7.fhir.uv.extensions: current

parameters:
  show-inherited-invariants: false
`;

  const mockSushiConfigWithoutSmartBase = `
id: regular.repo
canonical: http://example.org/regular
name: RegularRepo
title: Regular Repository
description: A regular repository
status: draft
version: 1.0.0
fhirVersion: 4.0.1

dependencies:
  hl7.fhir.uv.extensions: current
`;

  beforeEach(() => {
    // Clear any existing mocks
    jest.clearAllMocks();
    
    // Clear repository compatibility cache
    repositoryCompatibilityCache.clear();
    
    // Reset github service state
    githubService.isAuthenticated = false;
    githubService.octokit = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when not authenticated', () => {
    test('should throw error for WHO repository scanning', async () => {
      expect(githubService.isAuth()).toBe(false);
      
      await expect(
        githubService.getSmartGuidelinesRepositoriesProgressive('WorldHealthOrganization', 'org')
      ).rejects.toThrow('Not authenticated with GitHub');
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      // Mock authentication
      githubService.isAuthenticated = true;
      githubService.octokit = {
        rest: {
          repos: {
            listForOrg: jest.fn(),
            getContent: jest.fn()
          }
        }
      };
    });

    test('should successfully scan WHO repositories and find SMART Guidelines repos', async () => {
      // Mock the API calls
      githubService.octokit.rest.repos.listForOrg.mockResolvedValue({
        data: mockWHORepositories
      });

      // Mock sushi-config.yaml responses to return new format
      githubService.octokit.rest.repos.getContent.mockImplementation(({ owner, repo, path }) => {
        if (path === 'sushi-config.yaml') {
          if (repo === 'smart-immunizations' || repo === 'smart-base' || repo === 'smart-anc') {
            return Promise.resolve({
              data: {
                type: 'file',
                content: btoa(mockSushiConfigWithSmartBase)
              }
            });
          } else if (repo === 'regular-repo') {
            return Promise.resolve({
              data: {
                type: 'file',
                content: btoa(mockSushiConfigWithoutSmartBase)
              }
            });
          }
        }
        // Return 404 for other cases
        const error = new Error('Not Found');
        error.status = 404;
        return Promise.reject(error);
      });

      const foundRepositories = [];
      const progressUpdates = [];

      const result = await githubService.getSmartGuidelinesRepositoriesProgressive(
        'WorldHealthOrganization',
        'org',
        (repo) => foundRepositories.push(repo),
        (progress) => progressUpdates.push(progress)
      );

      // Handle new return format
      const repositories = result.repositories || result;
      const scanningErrors = result.scanningErrors;

      // Should find 3 SMART Guidelines repositories
      expect(repositories).toHaveLength(3);
      expect(foundRepositories).toHaveLength(3);
      
      const repoNames = repositories.map(repo => repo.name);
      expect(repoNames).toContain('smart-immunizations');
      expect(repoNames).toContain('smart-base');
      expect(repoNames).toContain('smart-anc');
      expect(repoNames).not.toContain('regular-repo');

      // All found repositories should be marked as compatible
      repositories.forEach(repo => {
        expect(repo.smart_guidelines_compatible).toBe(true);
      });

      // Should have progress updates
      expect(progressUpdates.length).toBeGreaterThan(0);
      
      // Should not have scanning errors for this successful case
      expect(scanningErrors).toBeNull();
    });

    test('should handle rate limiting errors gracefully', async () => {
      // Mock the repository listing
      githubService.octokit.rest.repos.listForOrg.mockResolvedValue({
        data: mockWHORepositories
      });

      // Mock rate limiting error for sushi-config.yaml checks
      githubService.octokit.rest.repos.getContent.mockImplementation(() => {
        const error = new Error('API rate limit exceeded');
        error.status = 403;
        error.response = {
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': Math.floor(Date.now() / 1000) + 3600
          }
        };
        return Promise.reject(error);
      });

      const foundRepositories = [];
      const progressUpdates = [];
      
      // Capture console warnings to check error handling
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await githubService.getSmartGuidelinesRepositoriesProgressive(
        'WorldHealthOrganization',
        'org',
        (repo) => foundRepositories.push(repo),
        (progress) => progressUpdates.push(progress)
      );

      // Handle new return format
      const repositories = result.repositories || result;
      const scanningErrors = result.scanningErrors;

      // Should return empty array when all checks fail due to rate limiting
      expect(repositories).toHaveLength(0);
      expect(foundRepositories).toHaveLength(0);

      // Should have scanning errors reported
      expect(scanningErrors).toBeTruthy();
      expect(scanningErrors.totalErrors).toBe(4); // 4 repositories
      expect(scanningErrors.rateLimited.length).toBe(4);

      // Should have logged warnings for each failed repository check (including retries)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(6); // 4 repositories, some with retries
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to check WorldHealthOrganization/smart-immunizations'),
        expect.anything()
      );

      consoleWarnSpy.mockRestore();
    });

    test('should handle network errors gracefully', async () => {
      // Mock the repository listing
      githubService.octokit.rest.repos.listForOrg.mockResolvedValue({
        data: mockWHORepositories
      });

      // Mock network error for sushi-config.yaml checks
      githubService.octokit.rest.repos.getContent.mockImplementation(() => {
        const error = new Error('Network Error');
        error.code = 'ENOTFOUND';
        return Promise.reject(error);
      });

      const foundRepositories = [];
      const progressUpdates = [];
      
      // Capture console warnings to check error handling
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await githubService.getSmartGuidelinesRepositoriesProgressive(
        'WorldHealthOrganization',
        'org',
        (repo) => foundRepositories.push(repo),
        (progress) => progressUpdates.push(progress)
      );

      // Handle new return format
      const repositories = result.repositories || result;
      const scanningErrors = result.scanningErrors;

      // Should return empty array when all checks fail due to network errors
      expect(repositories).toHaveLength(0);
      expect(foundRepositories).toHaveLength(0);

      // Should have scanning errors reported
      expect(scanningErrors).toBeTruthy();
      expect(scanningErrors.totalErrors).toBe(4); // 4 repositories
      expect(scanningErrors.networkErrors.length).toBe(4);

      // Should have logged warnings for each failed repository check (including retries)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(6); // 4 repositories, some with retries
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to check WorldHealthOrganization/smart-immunizations'),
        expect.anything()
      );

      consoleWarnSpy.mockRestore();
    });

    test('should handle mixed success and failure scenarios', async () => {
      // Mock the repository listing
      githubService.octokit.rest.repos.listForOrg.mockResolvedValue({
        data: mockWHORepositories
      });

      // Mock mixed responses: some succeed, some fail
      githubService.octokit.rest.repos.getContent.mockImplementation(({ owner, repo, path }) => {
        if (path === 'sushi-config.yaml') {
          if (repo === 'smart-immunizations') {
            // This one succeeds
            return Promise.resolve({
              data: {
                type: 'file',
                content: btoa(mockSushiConfigWithSmartBase)
              }
            });
          } else if (repo === 'smart-base') {
            // This one fails with rate limiting
            const error = new Error('API rate limit exceeded');
            error.status = 403;
            return Promise.reject(error);
          } else if (repo === 'smart-anc') {
            // This one succeeds
            return Promise.resolve({
              data: {
                type: 'file',
                content: btoa(mockSushiConfigWithSmartBase)
              }
            });
          } else {
            // Others fail with 404
            const error = new Error('Not Found');
            error.status = 404;
            return Promise.reject(error);
          }
        }
      });

      const foundRepositories = [];
      const progressUpdates = [];
      
      // Capture console warnings to check error handling
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await githubService.getSmartGuidelinesRepositoriesProgressive(
        'WorldHealthOrganization',
        'org',
        (repo) => foundRepositories.push(repo),
        (progress) => progressUpdates.push(progress)
      );

      // Handle new return format
      const repositories = result.repositories || result;
      const scanningErrors = result.scanningErrors;

      // Should find only the 2 repositories that succeeded
      expect(repositories).toHaveLength(2);
      expect(foundRepositories).toHaveLength(2);
      
      const repoNames = repositories.map(repo => repo.name);
      expect(repoNames).toContain('smart-immunizations');
      expect(repoNames).toContain('smart-anc');
      expect(repoNames).not.toContain('smart-base'); // Failed due to rate limiting
      expect(repoNames).not.toContain('regular-repo'); // 404

      // Should have scanning errors reported
      expect(scanningErrors).toBeTruthy();
      expect(scanningErrors.totalErrors).toBe(2); // smart-base + regular-repo
      expect(scanningErrors.rateLimited.length).toBe(1); // smart-base

      // Should have logged warnings for failed checks (including retries)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to check WorldHealthOrganization/smart-base'),
        expect.anything()
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('checkSmartGuidelinesCompatibility method', () => {
    beforeEach(() => {
      githubService.isAuthenticated = true;
      githubService.octokit = {
        rest: {
          repos: {
            getContent: jest.fn()
          }
        }
      };
    });

    test('should return compatibility result with error info for repository with smart.who.int.base dependency', async () => {
      githubService.octokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          content: btoa(mockSushiConfigWithSmartBase)
        }
      });

      const result = await githubService.checkSmartGuidelinesCompatibility(
        'WorldHealthOrganization',
        'smart-immunizations'
      );

      expect(result.compatible).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should return compatibility result with error info for repository without smart.who.int.base dependency', async () => {
      githubService.octokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          content: btoa(mockSushiConfigWithoutSmartBase)
        }
      });

      const result = await githubService.checkSmartGuidelinesCompatibility(
        'WorldHealthOrganization',
        'regular-repo'
      );

      expect(result.compatible).toBe(false);
      expect(result.error).toBeUndefined();
    });

    test('should return error info for 404 errors', async () => {
      const error = new Error('Not Found');
      error.status = 404;
      githubService.octokit.rest.repos.getContent.mockRejectedValue(error);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await githubService.checkSmartGuidelinesCompatibility(
        'WorldHealthOrganization',
        'no-sushi-config'
      );

      expect(result.compatible).toBe(false);
      expect(result.error).toBe('Not Found');
      expect(result.errorType).toBe('not_found');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to check WorldHealthOrganization/no-sushi-config'),
        expect.anything()
      );

      consoleWarnSpy.mockRestore();
    });

    test('should return error info for rate limiting errors', async () => {
      const error = new Error('API rate limit exceeded');
      error.status = 403;
      githubService.octokit.rest.repos.getContent.mockRejectedValue(error);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await githubService.checkSmartGuidelinesCompatibility(
        'WorldHealthOrganization',
        'rate-limited-repo'
      );

      expect(result.compatible).toBe(false);
      expect(result.error).toBe('API rate limit exceeded');
      expect(result.errorType).toBe('rate_limit');
      expect(result.retryable).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to check WorldHealthOrganization/rate-limited-repo'),
        expect.anything()
      );

      consoleWarnSpy.mockRestore();
    });
  });
});