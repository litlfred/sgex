// Test to verify the routing fix - allowing access to any repository when verification fails

import dakValidationService from '../services/dakValidationService';
import githubService from '../services/githubService';

// Mock the GitHub service for testing
jest.mock('../services/githubService', () => ({
  getRepository: jest.fn(),
  getFileContent: jest.fn()
}));

describe('Routing Fix - Permissive Repository Access', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('allows access to WorldHealthOrganization/smart-ips-pilgrimage even when repository cannot be verified', async () => {
    // Simulate the exact scenario from the issue:
    // Repository existence check fails (could be due to auth or actual 404)
    githubService.getRepository.mockRejectedValue({ 
      status: 404, 
      message: 'Not Found'
    });
    
    // No sushi-config.yaml file found
    githubService.getFileContent.mockRejectedValue({ 
      status: 404, 
      message: 'Not Found'
    });

    // This should return true because we're permissive when verification fails
    const result = await dakValidationService.validateDAKRepository(
      'WorldHealthOrganization', 
      'smart-ips-pilgrimage'
    );
    
    expect(result).toBe(true);
  });

  test('allows access to any repositories when verification fails', async () => {
    githubService.getRepository.mockRejectedValue({ status: 404 });
    githubService.getFileContent.mockRejectedValue({ status: 404 });

    const testRepos = [
      { owner: 'WorldHealthOrganization', repo: 'smart-immunizations' },
      { owner: 'some-user', repo: 'documentation-repo' },
      { owner: 'example-org', repo: 'shared-content' },
      { owner: 'random-user', repo: 'any-repo' }
    ];

    for (const { owner, repo } of testRepos) {
      const result = await dakValidationService.validateDAKRepository(owner, repo);
      expect(result).toBe(true);
    }
  });

  test('still validates properly when repository exists and has valid DAK structure', async () => {
    const validSushiConfig = `
id: smart.who.int.immunizations
canonical: http://smart.who.int/immunizations
name: Immunizations
dependencies:
  smart.who.int.base: current
`;

    // Mock repository exists
    githubService.getRepository.mockResolvedValue({
      name: 'smart-immunizations', 
      full_name: 'WorldHealthOrganization/smart-immunizations'
    });
    
    // Mock valid sushi config
    githubService.getFileContent.mockResolvedValue(validSushiConfig);

    const result = await dakValidationService.validateDAKRepository(
      'WorldHealthOrganization', 
      'smart-immunizations'
    );
    
    expect(result).toBe(true);
  });
});