// Integration test to verify the fix for the DAK selection issue
// This test demonstrates that repositories like litlfred/smart-trust-phw 
// will now be included even when sushi-config.yaml check fails

import githubService from '../services/githubService';

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn()
}));

describe('DAK Selection Fix Integration', () => {
  const { Octokit } = require('@octokit/rest');

  beforeEach(() => {
    // Reset service state
    githubService.logout();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should include smart-trust-phw repository even when sushi-config.yaml check fails', async () => {
    // Mock authentication
    const mockOctokit = {
      rest: {
        repos: {
          listForUser: jest.fn(),
          getContent: jest.fn(),
          get: jest.fn()
        }
      },
      request: jest.fn()
    };

    // Mock the Octokit constructor
    Octokit.mockImplementation(() => mockOctokit);

    githubService.authenticate('test-token');

    // Mock the repository list - simulating litlfred's repositories
    const mockRepos = [
      {
        id: 1,
        name: 'smart-trust-phw',
        owner: { login: 'litlfred' },
        full_name: 'litlfred/smart-trust-phw',
        description: 'Trust infrastructure implementation for SMART Guidelines',
        topics: ['trust', 'smart-guidelines', 'who']
      },
      {
        id: 2,
        name: 'regular-repo',
        owner: { login: 'litlfred' },
        full_name: 'litlfred/regular-repo',
        description: 'A regular repository for JavaScript development',
      }
    ];

    mockOctokit.rest.repos.listForUser.mockResolvedValue({
      data: mockRepos
    });

    // Mock failure when checking sushi-config.yaml (simulating network error, rate limiting, etc.)
    mockOctokit.rest.repos.getContent.mockRejectedValue({
      status: 429,
      message: 'rate limit exceeded'
    });

    // Mock successful fallback for smart-trust-phw (has smart-guidelines topic)
    mockOctokit.rest.repos.get
      .mockResolvedValueOnce({
        data: {
          name: 'smart-trust-phw',
          description: 'Trust infrastructure implementation for SMART Guidelines',
          topics: ['trust', 'smart-guidelines', 'who']
        }
      })
      .mockResolvedValueOnce({
        data: {
          name: 'regular-repo',
          description: 'A regular repository for JavaScript development',
          topics: ['javascript', 'node']
        }
      });

    // Call the method that was failing before our fix
    const result = await githubService.getSmartGuidelinesRepositories('litlfred', 'user');

    // Verify that smart-trust-phw is included even though sushi-config.yaml check failed
    expect(result).toHaveLength(1); // Only the DAK repo should be included now
    const smartTrustRepo = result.find(r => r.name === 'smart-trust-phw');
    expect(smartTrustRepo).toBeDefined();
    expect(smartTrustRepo.smart_guidelines_compatible).toBe(true);
    
    // Verify that regular-repo is NOT included due to strict filtering
    const regularRepo = result.find(r => r.name === 'regular-repo');
    expect(regularRepo).toBeUndefined();
    
    // Verify that the fallback method was called
    expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
      owner: 'litlfred',
      repo: 'smart-trust-phw'
    });
  });

  it('should demonstrate the fix for the specific issue mentioned', async () => {
    // This test demonstrates the exact scenario from the issue:
    // "when in the DAK selection menu, i dont see any repos listed"
    // "this one should match: https://github.com/litlfred/smart-trust-phw when the user is @litlfred"

    // Simulate the exact scenario
    const mockOctokit = {
      rest: {
        repos: {
          listForUser: jest.fn(),
          getContent: jest.fn(),
          get: jest.fn()
        }
      },
      request: jest.fn()
    };

    Octokit.mockImplementation(() => mockOctokit);

    githubService.authenticate('valid-token');

    // Mock litlfred's repository list including smart-trust-phw
    mockOctokit.rest.repos.listForUser.mockResolvedValue({
      data: [
        {
          id: 12345,
          name: 'smart-trust-phw',
          owner: { login: 'litlfred' },
          full_name: 'litlfred/smart-trust-phw',
          description: 'An empty Implementation Guide to be used as a starting point for building SMART Guidelines Implementation Guides',
          topics: [] // Even if topics are empty, the description should trigger our fallback
        }
      ]
    });

    // Mock sushi-config.yaml check failure (the original problem)
    // This could be due to network issues, rate limiting, temporary GitHub API issues, etc.
    mockOctokit.rest.repos.getContent.mockRejectedValue(new Error('Network timeout'));

    // Mock fallback repository details - this should detect SMART guidelines compatibility
    mockOctokit.rest.repos.get.mockResolvedValue({
      data: {
        name: 'smart-trust-phw',
        description: 'An empty Implementation Guide to be used as a starting point for building SMART Guidelines Implementation Guides',
        topics: []
      }
    });

    const repositories = await githubService.getSmartGuidelinesRepositories('litlfred', 'user');

    // Before our fix: repositories would be empty []
    // After our fix: repositories should contain smart-trust-phw
    expect(repositories).toHaveLength(1);
    expect(repositories[0].name).toBe('smart-trust-phw');
    expect(repositories[0].full_name).toBe('litlfred/smart-trust-phw');
    expect(repositories[0].smart_guidelines_compatible).toBe(true);

    console.log('✅ Fix verified: smart-trust-phw would now appear in DAK selection for @litlfred');
  });
});