/**
 * TypeScript DAK Validation Test
 * 
 * Basic test to verify TypeScript validations work
 */

import dakValidationRegistry from '../services/dakValidationRegistry.ts';

describe('TypeScript DAK Validation Framework', () => {
  test('should have registered TypeScript validations', () => {
    const allValidations = dakValidationRegistry.getAllValidations();
    
    expect(allValidations.length).toBe(7); // Updated to expect 7 validations
    
    // Check that our TypeScript validations are registered
    const expectedValidations = [
      'dak-sushi-base',
      'json-valid',
      'bpmn-business-rule-task-id',
      'dmn-decision-label-id',
      'xml-well-formed',
      'file-naming-conventions',
      'dmn-bpmn-cross-reference'
    ];
    
    expectedValidations.forEach(validationId => {
      const validation = dakValidationRegistry.getValidation(validationId);
      expect(validation).toBeDefined();
      expect(validation.id).toBe(validationId);
    });
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
    
    expect(result).not.toBeNull();
    expect(result.message).toContain('smart.who.int.base');
    expect(result.level).toBe('error');
    expect(result.validationId).toBe('dak-sushi-base');
    expect(result.component).toBe('dak-structure');
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

  test('should validate XML well-formedness', async () => {
    const validation = dakValidationRegistry.getValidation('xml-well-formed');
    expect(validation).toBeDefined();

    // Test invalid XML
    const invalidXml = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <unclosed-tag>
</root>`;

    const result = await validation.validate('test.xml', invalidXml, {});
    
    expect(result).not.toBeNull();
    expect(result.message).toContain('XML parsing error');
    expect(result.level).toBe('error');
    expect(result.validationId).toBe('xml-well-formed');
  });

  test('should validate file naming conventions', async () => {
    const validation = dakValidationRegistry.getValidation('file-naming-conventions');
    expect(validation).toBeDefined();

    // Test file with spaces (invalid characters check comes first)
    const result = await validation.validate('file with spaces.txt', 'content', {});
    
    expect(result).not.toBeNull();
    expect(result.message).toContain('invalid characters');
    expect(result.level).toBe('error');
    expect(result.validationId).toBe('file-naming-conventions');
  });

  test('should get component summary', () => {
    const summary = dakValidationRegistry.getComponentSummary();
    
    expect(summary).toBeDefined();
    expect(summary['dak-structure']).toBeDefined();
    expect(summary['dak-structure'].validationCount).toBeGreaterThan(0);
    expect(summary['business-processes']).toBeDefined();
    expect(summary['file-structure']).toBeDefined();
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