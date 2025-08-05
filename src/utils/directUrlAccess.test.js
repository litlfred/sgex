/**
 * Tests for direct URL access scenarios
 * This test file specifically validates that users can directly edit URLs in the browser
 * and access DAK content without being redirected to 404
 */

import dakValidationService from '../services/dakValidationService';

describe('Direct URL Access', () => {
  beforeEach(() => {
    // Clear console before each test
    jest.clearAllMocks();
  });

  test('should validate known demo DAK repositories correctly', () => {
    // Test that known DAK patterns work
    expect(dakValidationService.validateDemoDAKRepository('litlfred', 'smart-ips-pilgrimage')).toBe(true);
    expect(dakValidationService.validateDemoDAKRepository('WorldHealthOrganization', 'smart-immunizations')).toBe(true);
  });

  test('should return false for unknown repositories but not crash', () => {
    // Test that unknown repositories return false but don't throw errors
    expect(dakValidationService.validateDemoDAKRepository('unknown', 'invalid-repo')).toBe(false);
    expect(dakValidationService.validateDemoDAKRepository('litlfred', 'sgex')).toBe(false);
  });

  test('should handle patterns correctly', () => {
    // Test pattern matching for smart-ips-* repositories
    expect(dakValidationService.validateDemoDAKRepository('testuser', 'smart-ips-test')).toBe(true);
    expect(dakValidationService.validateDemoDAKRepository('testuser', 'smart-ips-demo')).toBe(true);
    expect(dakValidationService.validateDemoDAKRepository('testuser', 'smart-guidelines')).toBe(true);
  });
});