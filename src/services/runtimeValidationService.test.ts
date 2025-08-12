/**
 * Tests for Runtime Validation Service
 */

import { runtimeValidator, validateData, validateAndCast } from '../services/runtimeValidationService';
import { GitHubUser, GitHubRepository, DAKValidationResult } from '../types/core';

describe('RuntimeValidationService', () => {
  beforeEach(() => {
    // Clear any existing schemas
    runtimeValidator.clearSchemas();
  });

  describe('Schema Registration', () => {
    test('should register a schema successfully', () => {
      const userSchema = {
        type: 'object',
        properties: {
          login: { type: 'string' },
          id: { type: 'number' },
          avatar_url: { type: 'string' }
        },
        required: ['login', 'id'],
        additionalProperties: false
      };

      expect(() => runtimeValidator.registerSchema('GitHubUser', userSchema)).not.toThrow();
      expect(runtimeValidator.hasSchema('GitHubUser')).toBe(true);
    });

    test('should handle invalid schema registration', () => {
      const invalidSchema = {
        type: 'invalid-type'
      };

      // Should not throw by default
      expect(() => runtimeValidator.registerSchema('InvalidSchema', invalidSchema)).not.toThrow();
      expect(runtimeValidator.hasSchema('InvalidSchema')).toBe(false);
    });

    test('should list registered schemas', () => {
      const schema1 = { type: 'object', properties: {} };
      const schema2 = { type: 'object', properties: {} };

      runtimeValidator.registerSchema('Schema1', schema1);
      runtimeValidator.registerSchema('Schema2', schema2);

      const schemas = runtimeValidator.getRegisteredSchemas();
      expect(schemas).toContain('Schema1');
      expect(schemas).toContain('Schema2');
      expect(schemas).toHaveLength(2);
    });
  });

  describe('Data Validation', () => {
    beforeEach(() => {
      // Register a test schema
      const userSchema = {
        type: 'object',
        properties: {
          login: { type: 'string', format: 'github-username' },
          id: { type: 'number' },
          avatar_url: { type: 'string', format: 'uri' },
          name: { type: 'string' }
        },
        required: ['login', 'id'],
        additionalProperties: false
      };

      runtimeValidator.registerSchema('GitHubUser', userSchema);
    });

    test('should validate valid data', () => {
      const validUser = {
        login: 'testuser',
        id: 12345,
        avatar_url: 'https://github.com/testuser.jpg'
      };

      const result = runtimeValidator.validate<GitHubUser>('GitHubUser', validUser);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toEqual(validUser);
    });

    test('should detect validation errors', () => {
      const invalidUser = {
        login: '', // Invalid: empty string
        // Missing required 'id' field
        avatar_url: 'not-a-url' // Invalid URL
      };

      const result = runtimeValidator.validate<GitHubUser>('GitHubUser', invalidUser);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check for missing 'id' field error
      const hasIdError = result.errors.some(e => 
        e.message.toLowerCase().includes('id') || 
        e.path === '/id' ||
        e.code === 'REQUIRED'
      );
      expect(hasIdError).toBe(true);
    });

    test('should handle unknown schema', () => {
      const data = { test: 'data' };
      
      const result = runtimeValidator.validate('UnknownSchema', data);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('SCHEMA_NOT_FOUND');
    });

    test('should validate and cast data', () => {
      const validUser = {
        login: 'testuser',
        id: 12345,
        avatar_url: 'https://github.com/testuser.jpg'
      };

      const result = runtimeValidator.validateAndCast<GitHubUser>('GitHubUser', validUser);
      
      expect(result).toEqual(validUser);
      expect(typeof result.id).toBe('number');
    });
  });

  describe('Async Validation', () => {
    beforeEach(() => {
      const simpleSchema = {
        type: 'object',
        properties: {
          message: { type: 'string' }
        },
        required: ['message']
      };

      runtimeValidator.registerSchema('SimpleMessage', simpleSchema);
    });

    test('should validate data asynchronously', async () => {
      const data = { message: 'Hello World' };
      
      const result = await runtimeValidator.validateAsync('SimpleMessage', data);
      
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(data);
    });

    test('should handle async validation errors', async () => {
      const invalidData = { notMessage: 'Hello' };
      
      const result = await runtimeValidator.validateAsync('SimpleMessage', invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Batch Validation', () => {
    beforeEach(() => {
      const numberSchema = {
        type: 'object',
        properties: {
          value: { type: 'number', minimum: 0 }
        },
        required: ['value']
      };

      runtimeValidator.registerSchema('NumberValue', numberSchema);
    });

    test('should validate array of data', () => {
      const dataArray = [
        { value: 10 },
        { value: 20 },
        { value: -5 }, // Invalid: negative number
        { value: 30 }
      ];

      const results = runtimeValidator.validateBatch('NumberValue', dataArray);
      
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
          repoName: { type: 'string', format: 'github-repo-name' },
          token: { type: 'string', format: 'github-token' }
        },
        required: ['username', 'repoName']
      };

      runtimeValidator.registerSchema('GitHubData', githubSchema);
    });

    test('should validate GitHub username format', () => {
      const validData = {
        username: 'valid-user-123',
        repoName: 'my-repo.name'
      };

      const result = runtimeValidator.validate('GitHubData', validData);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid GitHub username', () => {
      const invalidData = {
        username: '-invalid-start', // Cannot start with hyphen
        repoName: 'valid-repo'
      };

      const result = runtimeValidator.validate('GitHubData', invalidData);
      expect(result.isValid).toBe(false);
    });

    test('should validate GitHub token format', () => {
      const dataWithToken = {
        username: 'testuser',
        repoName: 'testrepo',
        token: 'ghp_1234567890abcdef1234567890abcdef12345678' // Valid classic token format
      };

      const result = runtimeValidator.validate('GitHubData', dataWithToken);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Configuration Updates', () => {
    test('should update configuration successfully', () => {
      const newConfig = {
        strict: true,
        throwOnError: true
      };

      expect(() => runtimeValidator.updateConfig(newConfig)).not.toThrow();
    });

    test('should re-register schemas after config update', () => {
      const schema = {
        type: 'object',
        properties: { test: { type: 'string' } }
      };

      runtimeValidator.registerSchema('TestSchema', schema);
      expect(runtimeValidator.hasSchema('TestSchema')).toBe(true);

      runtimeValidator.updateConfig({ strict: true });
      expect(runtimeValidator.hasSchema('TestSchema')).toBe(true);
    });
  });

  describe('Convenience Functions', () => {
    beforeEach(() => {
      const testSchema = {
        type: 'object',
        properties: {
          id: { type: 'string' },
          count: { type: 'number' }
        },
        required: ['id']
      };

      runtimeValidator.registerSchema('TestType', testSchema);
    });

    test('should work with validateData function', () => {
      const data = { id: 'test-123', count: 42 };
      
      const result = validateData('TestType', data);
      
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(data);
    });

    test('should work with validateAndCast function', () => {
      const data = { id: 'test-456', count: 99 };
      
      const result = validateAndCast('TestType', data);
      
      expect(result).toEqual(data);
    });
  });
});