import dakValidationService from '../services/dakValidationService';

describe('Branch Switching Fix - DAK Validation', () => {
  test('litlfred/smart-ips-pilgrimage should be recognized as valid demo DAK repository', () => {
    const isValid = dakValidationService.validateDemoDAKRepository('litlfred', 'smart-ips-pilgrimage');
    expect(isValid).toBe(true);
  });

  test('litlfred/smart-ips-pilgrimage should be recognized as valid DAK repository in authenticated mode since repository exists', async () => {
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

  test('should still reject non-DAK repositories', () => {
    const isValid = dakValidationService.validateDemoDAKRepository('user', 'random-repo');
    expect(isValid).toBe(false);
  });

  test('should be case insensitive for repository matching', () => {
    const isValid = dakValidationService.validateDemoDAKRepository('litlfred', 'SMART-IPS-PILGRIMAGE');
    expect(isValid).toBe(true);
  });

  test('should be case insensitive for repository matching in authenticated mode', async () => {
    // Since the repository exists on GitHub, it should work for authenticated users even with case variations
    const isValid = await dakValidationService.validateDAKRepository('litlfred', 'SMART-IPS-PILGRIMAGE');
    expect(isValid).toBe(true);
  });
});