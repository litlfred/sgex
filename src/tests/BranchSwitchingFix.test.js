import dakValidationService from '../services/dakValidationService';

describe('Branch Switching Fix - DAK Validation', () => {
  test('litlfred/smart-ips-pilgrimage should be recognized as valid demo DAK repository', () => {
    const isValid = dakValidationService.validateDemoDAKRepository('litlfred', 'smart-ips-pilgrimage');
    expect(isValid).toBe(true);
  });

  test('should recognize smart-ips-* pattern repositories as valid DAK', () => {
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
});