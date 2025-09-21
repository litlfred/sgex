// Test to verify the routing fix for WorldHealthOrganization repositories

import dakValidationService from '../services/dakValidationService';
import githubService from '../services/githubService';

// Mock the GitHub service for testing
jest.mock('../services/githubService', () => ({
  getRepository: jest.fn(),
  getFileContent: jest.fn()
}));

describe('Routing Fix for WHO Repositories', () => {
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

    // This should still return true because WHO is a well-known organization
    const result = await dakValidationService.validateDAKRepository(
      'WorldHealthOrganization', 
      'smart-ips-pilgrimage'
    );
    
    expect(result).toBe(true);
  });

  test('allows access to other WHO repositories', async () => {
    githubService.getRepository.mockRejectedValue({ status: 404 });
    githubService.getFileContent.mockRejectedValue({ status: 404 });

    const whoRepos = [
      'smart-immunizations',
      'smart-anc-toolkit', 
      'smart-base',
      'smart-tb',
      'smart-ips-pilgrimage'
    ];

    for (const repo of whoRepos) {
      const result = await dakValidationService.validateDAKRepository(
        'WorldHealthOrganization', 
        repo
      );
      expect(result).toBe(true);
    }
  });

  test('still rejects unknown organizations when repository cannot be verified', async () => {
    githubService.getRepository.mockRejectedValue({ status: 404 });
    githubService.getFileContent.mockRejectedValue({ status: 404 });

    const result = await dakValidationService.validateDAKRepository(
      'unknown-user', 
      'some-repo'
    );
    
    expect(result).toBe(false);
  });

  test('properly identifies well-known organizations', () => {
    expect(dakValidationService.isWellKnownOrganization('WorldHealthOrganization')).toBe(true);
    expect(dakValidationService.isWellKnownOrganization('WHO')).toBe(true);
    expect(dakValidationService.isWellKnownOrganization('HL7')).toBe(true);
    expect(dakValidationService.isWellKnownOrganization('litlfred')).toBe(true);
    expect(dakValidationService.isWellKnownOrganization('unknown-user')).toBe(false);
  });
});