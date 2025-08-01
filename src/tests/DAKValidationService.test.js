import dakValidationService from '../services/dakValidationService';

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

import githubService from '../services/githubService';

describe('DAK Validation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateDAKRepository', () => {
    test('returns true for repository with valid sushi-config.yaml containing smart.who.int.base', async () => {
      const validSushiConfig = `
id: smart.who.int.immunizations
canonical: http://smart.who.int/immunizations
name: Immunizations
dependencies:
  smart.who.int.base: current
  hl7.fhir.uv.extensions.r4: 5.1.0
`;

      githubService.isAuth.mockReturnValue(true);
      
      // Mock repository existence check
      githubService.octokit.rest.repos.get.mockResolvedValue({
        data: { name: 'smart-immunizations', full_name: 'WorldHealthOrganization/smart-immunizations' }
      });
      
      githubService.octokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          content: Buffer.from(validSushiConfig).toString('base64')
        }
      });

      const result = await dakValidationService.validateDAKRepository('WorldHealthOrganization', 'smart-immunizations');
      expect(result).toBe(true);
    });

    test('returns false for repository with sushi-config.yaml but missing smart.who.int.base', async () => {
      const invalidSushiConfig = `
id: some.other.project
canonical: http://example.com/project
name: Some Project
dependencies:
  hl7.fhir.uv.extensions.r4: 5.1.0
  other.dependency: 1.0.0
`;

      githubService.isAuth.mockReturnValue(true);
      
      // Mock repository does not exist (404)
      githubService.octokit.rest.repos.get.mockRejectedValue({ status: 404 });
      
      githubService.octokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          content: Buffer.from(invalidSushiConfig).toString('base64')
        }
      });

      const result = await dakValidationService.validateDAKRepository('user', 'invalid-repo');
      expect(result).toBe(false);
    });

    test('returns false for repository without sushi-config.yaml', async () => {
      githubService.isAuth.mockReturnValue(true);
      
      // Mock repository does not exist (404)
      githubService.octokit.rest.repos.get.mockRejectedValue({ status: 404 });
      
      githubService.octokit.rest.repos.getContent.mockRejectedValue({ status: 404 });

      const result = await dakValidationService.validateDAKRepository('user', 'no-config-repo');
      expect(result).toBe(false);
    });

    test('returns false when not authenticated', async () => {
      githubService.isAuth.mockReturnValue(false);

      const result = await dakValidationService.validateDAKRepository('user', 'any-repo');
      expect(result).toBe(false);
    });

    test('handles invalid YAML gracefully', async () => {
      const invalidYaml = 'invalid: yaml: content: [unclosed';

      githubService.isAuth.mockReturnValue(true);
      
      // Mock repository does not exist (404) 
      githubService.octokit.rest.repos.get.mockRejectedValue({ status: 404 });
      
      githubService.octokit.rest.repos.getContent.mockResolvedValue({
        data: {
          type: 'file',
          content: Buffer.from(invalidYaml).toString('base64')
        }
      });

      const result = await dakValidationService.validateDAKRepository('user', 'invalid-yaml-repo');
      expect(result).toBe(false);
    });
  });

  describe('validateDemoDAKRepository', () => {
    test('returns true for known WHO DAK repositories', () => {
      expect(dakValidationService.validateDemoDAKRepository('WorldHealthOrganization', 'smart-immunizations')).toBe(true);
      expect(dakValidationService.validateDemoDAKRepository('WorldHealthOrganization', 'smart-anc-toolkit')).toBe(true);
      expect(dakValidationService.validateDemoDAKRepository('WorldHealthOrganization', 'smart-base')).toBe(true);
    });

    test('returns true for known demo repositories', () => {
      expect(dakValidationService.validateDemoDAKRepository('litlfred', 'smart-guidelines-demo')).toBe(true);
      expect(dakValidationService.validateDemoDAKRepository('litlfred', 'sgex-demo')).toBe(true);
    });

    test('returns false for invalid repositories', () => {
      expect(dakValidationService.validateDemoDAKRepository('litlfred', 'smart-trust-gdhcnv')).toBe(false);
      expect(dakValidationService.validateDemoDAKRepository('user', 'random-repo')).toBe(false);
      expect(dakValidationService.validateDemoDAKRepository('someone', 'not-a-dak')).toBe(false);
    });

    test('is case insensitive', () => {
      expect(dakValidationService.validateDemoDAKRepository('worldhealthorganization', 'smart-immunizations')).toBe(true);
      expect(dakValidationService.validateDemoDAKRepository('LITLFRED', 'SMART-GUIDELINES-DEMO')).toBe(true);
    });
  });
});