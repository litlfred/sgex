/**
 * TypeScript DAK Validation Test
 * 
 * Basic test to verify TypeScript validations work
 */

import dakValidationRegistry from '../services/dakValidationRegistry.ts';

describe('TypeScript DAK Validation Framework', () => {
  test('should have registered TypeScript validations', () => {
    const allValidations = dakValidationRegistry.getAllValidations();
    
    expect(allValidations.length).toBeGreaterThan(0);
    
    // Check that our TypeScript validations are registered
    const dakSushiValidation = dakValidationRegistry.getValidation('dak-sushi-base');
    const jsonValidValidation = dakValidationRegistry.getValidation('json-valid');
    
    expect(dakSushiValidation).toBeDefined();
    expect(jsonValidValidation).toBeDefined();
  });

  test('should validate DAK SUSHI base dependency', async () => {
    const validation = dakValidationRegistry.getValidation('dak-sushi-base');
    expect(validation).toBeDefined();

    // Test invalid sushi config
    const invalidConfig = `
id: test-dak
name: Test DAK
dependencies:
  other-dependency: current
`;

    const result = await validation.validate('sushi-config.yaml', invalidConfig, {});
    
    console.log('SUSHI validation result:', result);
    expect(result).not.toBeNull();
    expect(result.message).toContain('smart.who.int.base');
    expect(result.level).toBe('error');
  });

  test('should validate JSON syntax', async () => {
    const validation = dakValidationRegistry.getValidation('json-valid');
    expect(validation).toBeDefined();

    // Test invalid JSON
    const invalidJson = `{
  "name": "test",
  "invalid": 
}`;

    const result = await validation.validate('test.json', invalidJson, {});
    
    expect(result).not.toBeNull();
    expect(result.message).toContain('JSON syntax error');
    expect(result.level).toBe('error');
  });

  test('should validate valid JSON', async () => {
    const validation = dakValidationRegistry.getValidation('json-valid');
    expect(validation).toBeDefined();

    // Test valid JSON
    const validJson = `{
  "name": "test",
  "version": "1.0.0"
}`;

    const result = await validation.validate('test.json', validJson, {});
    
    expect(result).toBeNull(); // No validation errors
  });

  test('should format validation results correctly', () => {
    const mockResults = [
      {
        validationId: 'test-1',
        component: 'dak-structure',
        level: 'error',
        description: 'Test error',
        filePath: 'test.yaml',
        message: 'Test error message'
      },
      {
        validationId: 'test-2',
        component: 'file-structure',
        level: 'warning',
        description: 'Test warning',
        filePath: 'test.json',
        message: 'Test warning message'
      }
    ];

    const formatted = dakValidationRegistry.formatResults(mockResults);
    
    expect(formatted.summary.error).toBe(1);
    expect(formatted.summary.warning).toBe(1);
    expect(formatted.summary.info).toBe(0);
    expect(formatted.total).toBe(2);
    expect(formatted.canSave).toBe(false); // Has errors
    
    expect(formatted.byComponent['dak-structure']).toHaveLength(1);
    expect(formatted.byComponent['file-structure']).toHaveLength(1);
    
    expect(formatted.byFile['test.yaml']).toHaveLength(1);
    expect(formatted.byFile['test.json']).toHaveLength(1);
  });
});