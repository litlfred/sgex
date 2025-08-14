/**
 * Tests for DAK FAQ functionality
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { QuestionDefinition, ParameterDefinition, QuestionContext, QuestionResult, QuestionLevel } from '../dak/faq/types/QuestionDefinition.js';
import parameterRegistryService from '../dak/faq/registry/ParameterRegistryService.js';

describe('DAK FAQ Types', () => {
  test('QuestionDefinition should create valid instances', () => {
    const question = new QuestionDefinition({
      id: 'test-question',
      level: QuestionLevel.DAK,
      title: 'Test Question',
      description: 'A test question for validation'
    });

    expect(question.id).toBe('test-question');
    expect(question.level).toBe('dak');
    expect(question.title).toBe('Test Question');
    expect(question.description).toBe('A test question for validation');
    expect(question.parameters).toEqual([]);
    expect(question.tags).toEqual([]);
    expect(question.version).toBe('1.0.0');
  });

  test('ParameterDefinition should create valid instances', () => {
    const param = new ParameterDefinition({
      name: 'repository',
      type: 'string',
      required: true,
      description: 'Repository path'
    });

    expect(param.name).toBe('repository');
    expect(param.type).toBe('string');
    expect(param.required).toBe(true);
    expect(param.description).toBe('Repository path');
  });

  test('QuestionContext should create valid instances', () => {
    const context = new QuestionContext({
      repository: 'owner/repo',
      locale: 'en_US',
      branch: 'main'
    });

    expect(context.repository).toBe('owner/repo');
    expect(context.locale).toBe('en_US');
    expect(context.branch).toBe('main');
  });

  test('QuestionResult should create valid instances', () => {
    const result = new QuestionResult({
      structured: { name: 'Test DAK' },
      narrative: '<h4>Test</h4><p>Success</p>',
      warnings: ['Warning message'],
      errors: []
    });

    expect(result.structured).toEqual({ name: 'Test DAK' });
    expect(result.narrative).toBe('<h4>Test</h4><p>Success</p>');
    expect(result.warnings).toEqual(['Warning message']);
    expect(result.errors).toEqual([]);
  });
});

describe('Parameter Registry Service', () => {
  test('should validate required parameters', () => {
    const result = parameterRegistryService.validateParameters(
      {},
      'dak',
      null
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Required parameter 'repository' is missing");
  });

  test('should validate parameter types', () => {
    const result = parameterRegistryService.validateParameters(
      {
        repository: 'owner/repo',
        locale: 123 // Should be string
      },
      'dak',
      null
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.some(error => error.includes('Expected string, got number'))).toBe(true);
  });

  test('should accept valid parameters', () => {
    const result = parameterRegistryService.validateParameters(
      {
        repository: 'owner/repo',
        locale: 'en_US',
        branch: 'main'
      },
      'dak',
      null
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.normalized.repository).toBe('owner/repo');
    expect(result.normalized.locale).toBe('en_US');
    expect(result.normalized.branch).toBe('main');
  });

  test('should apply default values', () => {
    const result = parameterRegistryService.validateParameters(
      {
        repository: 'owner/repo'
      },
      'dak',
      null
    );

    expect(result.isValid).toBe(true);
    expect(result.normalized.locale).toBe('en_US');
    expect(result.normalized.branch).toBe('main');
  });

  test('should get parameters for specific level', () => {
    const dakParams = parameterRegistryService.getParameters('dak');
    expect(dakParams.length).toBeGreaterThan(0);
    
    const repoParam = dakParams.find(p => p.name === 'repository');
    expect(repoParam).toBeDefined();
    expect(repoParam.required).toBe(true);
    expect(repoParam.type).toBe('string');
  });
});

describe('Question Level Constants', () => {
  test('should have correct question levels', () => {
    expect(QuestionLevel.DAK).toBe('dak');
    expect(QuestionLevel.COMPONENT).toBe('component');
    expect(QuestionLevel.ASSET).toBe('asset');
  });
});