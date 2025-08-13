/**
 * Tests for Runtime Validation Service
 */

import runtimeValidationService, { RuntimeValidationService } from '../services/runtimeValidationService';
import { GitHubUser, GitHubRepository, DAKValidationResult } from '../types/core';

describe('RuntimeValidationService', () => {
  beforeEach(() => {
    // Clear any existing schemas
    runtimeValidationService.clearSchemas();
  });

  describe('Schema Registration', () => {
    test('should register schema successfully', () => {
      const userSchema = {
        type: 'object',
        required: ['login', 'id'],
        properties: {
          login: { type: 'string' },
          id: { type: 'number' }
        }
      };

      expect(() => runtimeValidationService.registerSchema('GitHubUser', userSchema)).not.toThrow();
      expect(runtimeValidationService.hasType('GitHubUser')).toBe(true);
    });

    test('should handle invalid schema gracefully', () => {
      const invalidSchema = {
        // Missing type property
        properties: {}
      };

      expect(() => runtimeValidationService.registerSchema('InvalidSchema', invalidSchema)).not.toThrow();
      expect(runtimeValidationService.hasType('InvalidSchema')).toBe(true); // Schema gets registered even if invalid
    });

    test('should track multiple schemas', () => {
      const schema1 = { type: 'object', properties: { name: { type: 'string' } } };
      const schema2 = { type: 'object', properties: { id: { type: 'number' } } };

      runtimeValidationService.registerSchema('Schema1', schema1);
      runtimeValidationService.registerSchema('Schema2', schema2);

      const stats = runtimeValidationService.getValidationStats();
      expect(stats.registeredSchemas).toBe(2);
      expect(stats.compiledValidators).toBe(2);
    });
  });

  describe('Data Validation', () => {
    beforeEach(() => {
      const userSchema = {
        type: 'object',
        required: ['login', 'id'],
        properties: {
          login: { type: 'string', format: 'github-username' },
          id: { type: 'number' },
          name: { type: ['string', 'null'] },
          email: { type: ['string', 'null'], format: 'email' }
        }
      };

      runtimeValidationService.registerSchema('GitHubUser', userSchema);
    });

    test('should validate correct data successfully', () => {
      const validUser = {
        login: 'testuser',
        id: 12345,
        name: 'Test User',
        email: 'test@example.com'
      };

      const result = runtimeValidationService.validate<GitHubUser>('GitHubUser', validUser);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validUser);
    });

    test('should detect validation errors', () => {
      const invalidUser = {
        login: 'testuser',
        // Missing required 'id' field
        name: 'Test User'
      };

      const result = runtimeValidationService.validate<GitHubUser>('GitHubUser', invalidUser);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('REQUIRED');
    });

    test('should handle unknown schema gracefully', () => {
      const data = { some: 'data' };

      const result = runtimeValidationService.validate('UnknownSchema', data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('SCHEMA_NOT_FOUND');
    });
  });

  describe('Batch Validation', () => {
    beforeEach(() => {
      const numberSchema = {
        type: 'object',
        required: ['value'],
        properties: {
          value: { type: 'number', minimum: 0 }
        }
      };

      runtimeValidationService.registerSchema('NumberValue', numberSchema);
    });

    test('should validate multiple items', () => {
      const dataArray = [
        { value: 10 },
        { value: 20 },
        { value: -5 }, // Invalid - negative number
        { value: 30 }
      ];

      const results = runtimeValidationService.validateBatch('NumberValue', dataArray);

      expect(results).toHaveLength(4);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(true);
      expect(results[2].isValid).toBe(false); // Negative number
      expect(results[3].isValid).toBe(true);
    });
  });

  describe('Custom Formats', () => {
    beforeEach(() => {
      const githubSchema = {
        type: 'object',
        properties: {
          username: { type: 'string', format: 'github-username' },
          token: { type: 'string', format: 'github-token' },
          fhirId: { type: 'string', format: 'fhir-id' },
          dakId: { type: 'string', format: 'dak-id' },
          whoBase: { type: 'string', format: 'who-smart-base' }
        }
      };

      runtimeValidationService.registerSchema('GitHubData', githubSchema);
    });

    test('should validate GitHub username format', () => {
      const validData = {
        username: 'valid-user123'
      };

      const result = runtimeValidationService.validate('GitHubData', validData);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid GitHub username', () => {
      const invalidData = {
        username: '-invalid-username' // Cannot start with hyphen
      };

      const result = runtimeValidationService.validate('GitHubData', invalidData);
      expect(result.isValid).toBe(false);
    });

    test('should validate WHO SMART base dependency', () => {
      const dataWithToken = {
        whoBase: 'smart.who.int.base'
      };

      const result = runtimeValidationService.validate('GitHubData', dataWithToken);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Configuration', () => {
    test('should get validation statistics', () => {
      const testSchema = { type: 'object', properties: { test: { type: 'string' } } };
      runtimeValidationService.registerSchema('TestSchema', testSchema);

      const stats = runtimeValidationService.getValidationStats();
      expect(stats.registeredSchemas).toBe(1);
      expect(stats.compiledValidators).toBe(1);
      expect(stats.configuration).toBeDefined();
    });
  });

  describe('Type-safe Integration', () => {
    beforeEach(() => {
      const testSchema = {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          value: { type: 'number' }
        }
      };

      runtimeValidationService.registerSchema('TestType', testSchema);
    });

    test('should integrate with TypeScript types', () => {
      const data = { name: 'test', value: 42 };

      const result = runtimeValidationService.validate('TestType', data);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(data);
    });
  });

  describe('Async Validation Methods', () => {
    test('should validate DAK config', async () => {
      const dakData = {
        id: 'test-dak',
        version: '1.0.0',
        dependencies: {
          'smart.who.int.base': '^1.0.0'
        }
      };

      const result = await runtimeValidationService.validateDAKConfig(dakData);
      expect(result.success).toBe(true);
    });

    test('should validate GitHub repository', async () => {
      const repoData = {
        id: 123,
        name: 'test-repo',
        full_name: 'user/test-repo',
        private: false,
        owner: {
          login: 'testuser',
          id: 456,
          avatar_url: 'https://example.com/avatar.png'
        }
      };

      const result = await runtimeValidationService.validateGitHubRepository(repoData);
      expect(result.success).toBe(true);
    });
  });
});