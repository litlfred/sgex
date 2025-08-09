/**
 * Schema Service Tests
 * 
 * Basic tests to validate schema service functionality
 */

import schemaService from '../services/schemaService';

describe('SchemaService', () => {
  test('should provide access to DAK question schema', () => {
    const dakQuestionSchema = schemaService.getSchema('dak-question');
    expect(dakQuestionSchema).toBeDefined();
    expect(dakQuestionSchema.title).toBe('DAK Question Form');
    expect(dakQuestionSchema.required).toEqual(['repositoryUrl']);
  });

  test('should provide access to minimal DAK selection schema', () => {
    const dakSelectionSchema = schemaService.getSchema('dak-selection-form');
    expect(dakSelectionSchema).toBeDefined();
    expect(dakSelectionSchema.required).toEqual(['repositoryUrl']);
  });

  test('should provide access to minimal DAK config schema', () => {
    const dakConfigSchema = schemaService.getSchema('dak-config-form');
    expect(dakConfigSchema).toBeDefined();
    expect(dakConfigSchema.required).toEqual(['repositoryUrl', 'sushiConfig']);
  });

  test('should validate DAK question data correctly', () => {
    const validData = {
      repositoryUrl: 'who/smart-immunizations',
      locale: 'en'
    };
    
    const validation = schemaService.validateData('dak-question', validData);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should reject invalid DAK question data', () => {
    const invalidData = {
      locale: 'en'
      // Missing required repositoryUrl
    };
    
    const validation = schemaService.validateData('dak-question', invalidData);
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain("Required field 'repositoryUrl' is missing");
  });

  test('should parse repository URLs correctly', () => {
    const testCases = [
      { input: 'who/smart-immunizations', expected: { user: 'who', repo: 'smart-immunizations' } },
      { input: 'https://github.com/who/smart-immunizations', expected: { user: 'who', repo: 'smart-immunizations' } },
      { input: 'litlfred/anc-dak', expected: { user: 'litlfred', repo: 'anc-dak' } },
      { input: 'invalid-url', expected: null }
    ];

    testCases.forEach(({ input, expected }) => {
      const result = schemaService.parseRepositoryUrl(input);
      expect(result).toEqual(expected);
    });
  });

  test('should create repository URLs correctly', () => {
    expect(schemaService.createRepositoryUrl('who', 'smart-immunizations')).toBe('who/smart-immunizations');
    expect(schemaService.createRepositoryUrl('who', 'smart-immunizations', 'full')).toBe('https://github.com/who/smart-immunizations');
  });

  test('should list all available schemas', () => {
    const schemas = schemaService.getAvailableSchemas();
    expect(schemas).toContain('dak-question');
    expect(schemas).toContain('dak-selection-form');
    expect(schemas).toContain('dak-config-form');
    expect(schemas).toContain('dak-action-form');
  });
});