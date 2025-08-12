import dakValidationService from '../services/dakValidationService';

import githubService from '../services/githubService';

// Mock the GitHub service
jest.mock('../services/githubService', () => ({
  isAuth: jest.fn(),
  octokit: {
    rest: {
      repos: {
        get: jest.fn(),
        getContent: jest.fn()
      }
    }
  }
}));

describe('Branch Switching Fix - DAK Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('litlfred/smart-ips-pilgrimage should be recognized as valid demo DAK repository', () => {
    const isValid = dakValidationService.validateDemoDAKRepository('litlfred', 'smart-ips-pilgrimage');
    expect(isValid).toBe(true);
  });

  test('litlfred/smart-ips-pilgrimage should be recognized as valid DAK repository in authenticated mode since repository exists', async () => {
    // Mock authenticated state
    githubService.isAuth.mockReturnValue(true);
    
    // Mock repository existence check - the repository exists on GitHub
    githubService.octokit.rest.repos.get.mockResolvedValue({
      data: {
        name: 'smart-ips-pilgrimage',
        full_name: 'litlfred/smart-ips-pilgrimage',
        owner: { login: 'litlfred' }
      }
    });
    
    // Mock that sushi-config.yaml doesn't exist (404)
    githubService.octokit.rest.repos.getContent.mockRejectedValue({ status: 404 });
    
    // Since the repository exists on GitHub, it should work for authenticated users
    const isValid = await dakValidationService.validateDAKRepository('litlfred', 'smart-ips-pilgrimage');
    expect(isValid).toBe(true);
  });

  test('should recognize smart-ips-* pattern repositories as valid DAK in demo mode', () => {
    // Test various smart-ips-* repositories
    const testCases = [
      ['litlfred', 'smart-ips-pilgrimage'],
      ['who', 'smart-ips-demo'],
      ['testuser', 'smart-ips-toolkit'],
      ['org', 'smart-ips-implementation']
    ];

    testCases.forEach(([owner, repo]) => {
      const isValid = dakValidationService.validateDemoDAKRepository(owner, repo);
      expect(isValid).toBe(true);
    });
  });

  test('should now accept any properly formatted repository', () => {
    // With the new validation logic, any properly formatted org/repo is accepted
    const isValid = dakValidationService.validateDemoDAKRepository('user', 'random-repo');
    expect(isValid).toBe(true);
  });

  test('should be case insensitive for repository matching', () => {
    const isValid = dakValidationService.validateDemoDAKRepository('litlfred', 'SMART-IPS-PILGRIMAGE');
    expect(isValid).toBe(true);
  });

  test('should be case insensitive for repository matching in authenticated mode', async () => {
    // Mock authenticated state  
    githubService.isAuth.mockReturnValue(true);
    
    // Mock repository existence check - the repository exists on GitHub
    githubService.octokit.rest.repos.get.mockResolvedValue({
      data: {
        name: 'SMART-IPS-PILGRIMAGE',
        full_name: 'litlfred/SMART-IPS-PILGRIMAGE',
        owner: { login: 'litlfred' }
      }
    });
    
    // Mock that sushi-config.yaml doesn't exist (404)
    githubService.octokit.rest.repos.getContent.mockRejectedValue({ status: 404 });
    
    // Since the repository exists on GitHub, it should work for authenticated users even with case variations
    const isValid = await dakValidationService.validateDAKRepository('litlfred', 'SMART-IPS-PILGRIMAGE');
    expect(isValid).toBe(true);
  });
});