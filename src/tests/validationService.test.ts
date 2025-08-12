/**
 * Test suite for the runtime validation service
 * 
 * Tests the TypeScript-to-JSON-Schema validation framework
 * that enables runtime type safety for API responses.
 */

import { validationService, validateGitHubRepository, validateRouteParams } from '../services/validationService';
import { GitHubRepository, RouteParams } from '../types/common';
import { JSONSchemaType } from 'ajv';

describe('ValidationService', () => {
  beforeEach(() => {
    // Reset validation service for each test
    validationService.validators.clear();
    
    // Re-initialize built-in validators
    const privateService = validationService as any;
    privateService.initializeBuiltInValidators();
  });

  describe('Schema Registration', () => {
    test('should register a valid schema successfully', () => {
      interface TestType {
        id: number;
        name: string;
      }

      const testSchema: JSONSchemaType<TestType> = {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" }
        },
        required: ["id", "name"],
        additionalProperties: false
      };

      expect(() => {
        validationService.registerSchema('TestType', testSchema);
      }).not.toThrow();

      expect(validationService.validators.has('TestType')).toBe(true);
    });

    test('should provide validation statistics', () => {
      const stats = validationService.getValidationStats();
      
      expect(stats.registeredValidators).toBeGreaterThan(0);
      expect(stats.availableTypes).toContain('GitHubRepository');
      expect(stats.availableTypes).toContain('RouteParams');
    });
  });

  describe('GitHub Repository Validation', () => {
    test('should validate a complete GitHub repository object', () => {
      const validRepo: GitHubRepository = {
        id: 123456789,
        name: "test-repo",
        full_name: "testuser/test-repo",
        owner: {
          login: "testuser",
          type: "User"
        },
        description: "A test repository",
        private: false,
        default_branch: "main",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-02T00:00:00Z",
        pushed_at: "2023-01-03T00:00:00Z"
      };

      const result = validateGitHubRepository(validRepo);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validRepo);
      expect(result.errors).toBeUndefined();
    });

    test('should reject invalid GitHub repository object', () => {
      const invalidRepo = {
        id: "not-a-number", // Should be number
        name: "test-repo",
        // Missing required fields
      };

      const result = validateGitHubRepository(invalidRepo);

      expect(result.isValid).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    test('should handle null and undefined inputs gracefully', () => {
      const nullResult = validateGitHubRepository(null);
      const undefinedResult = validateGitHubRepository(undefined);

      expect(nullResult.isValid).toBe(false);
      expect(undefinedResult.isValid).toBe(false);
    });
  });

  describe('Route Parameters Validation', () => {
    test('should validate valid route parameters', () => {
      const validParams: RouteParams = {
        user: "testuser",
        repo: "test-repo",
        branch: "main",
        asset: "test.md"
      };

      const result = validateRouteParams(validParams);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validParams);
    });

    test('should validate partial route parameters', () => {
      const partialParams = {
        user: "testuser",
        repo: "test-repo"
        // branch and asset are optional
      };

      const result = validateRouteParams(partialParams);

      expect(result.isValid).toBe(true);
      expect(result.data?.user).toBe("testuser");
      expect(result.data?.repo).toBe("test-repo");
    });

    test('should validate empty route parameters', () => {
      const emptyParams = {};

      const result = validateRouteParams(emptyParams);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({});
    });
  });

  describe('GitHub API Response Validation', () => {
    test('should validate array of GitHub repositories', () => {
      const mockApiResponse = [
        {
          id: 1,
          name: "repo1",
          full_name: "user/repo1",
          owner: { login: "user", type: "User" },
          description: "First repo",
          private: false,
          default_branch: "main",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
          pushed_at: "2023-01-01T00:00:00Z"
        },
        {
          id: 2,
          name: "repo2",
          full_name: "user/repo2",
          owner: { login: "user", type: "User" },
          description: "Second repo",
          private: true,
          default_branch: "develop",
          created_at: "2023-01-02T00:00:00Z",
          updated_at: "2023-01-02T00:00:00Z",
          pushed_at: "2023-01-02T00:00:00Z"
        }
      ];

      const result = validationService.validateGitHubApiResponse<GitHubRepository[]>(
        mockApiResponse, 
        'GitHubRepository'
      );

      expect(result.isValid).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    test('should handle mixed valid/invalid array items', () => {
      const mixedApiResponse = [
        {
          id: 1,
          name: "valid-repo",
          full_name: "user/valid-repo",
          owner: { login: "user", type: "User" },
          description: "Valid repo",
          private: false,
          default_branch: "main",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
          pushed_at: "2023-01-01T00:00:00Z"
        },
        {
          id: "invalid", // Wrong type
          name: "invalid-repo"
          // Missing required fields
        }
      ];

      const result = validationService.validateGitHubApiResponse<GitHubRepository[]>(
        mixedApiResponse,
        'GitHubRepository'
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.some(error => error.includes('Item 1'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle validation of unregistered types', () => {
      const result = validationService.validateAndCast('NonExistentType', { any: 'data' });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No validator registered for type: NonExistentType');
    });

    test('should provide detailed error messages for validation failures', () => {
      const invalidData = {
        id: "should-be-number",
        name: 123, // Should be string
        missing_required_fields: true
      };

      const result = validateGitHubRepository(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      
      // Check that error messages contain useful information
      const errorString = result.errors!.join(' ');
      expect(errorString.length).toBeGreaterThan(0);
    });
  });

  describe('Schema Loading (Browser Environment)', () => {
    // Mock fetch for testing schema loading
    const mockFetch = jest.fn();
    global.fetch = mockFetch as any;

    beforeEach(() => {
      mockFetch.mockClear();
    });

    test('should handle successful schema loading', async () => {
      const mockSchemaIndex = {
        schemas: [
          {
            name: 'TestType',
            file: 'TestType.json',
            url: './schemas/TestType.json'
          }
        ]
      };

      const mockSchema = {
        type: "object",
        properties: {
          id: { type: "number" },
          name: { type: "string" }
        },
        required: ["id", "name"]
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSchemaIndex)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSchema)
        });

      await validationService.loadSchemasFromDirectory('/test/schemas');

      expect(mockFetch).toHaveBeenCalledWith('/test/schemas/index.json');
      expect(mockFetch).toHaveBeenCalledWith('/test/schemas/TestType.json');
    });

    test('should handle schema loading failures gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      // Should not throw
      await expect(
        validationService.loadSchemasFromDirectory('/nonexistent/schemas')
      ).resolves.not.toThrow();
    });
  });

  describe('Integration with TypeScript Types', () => {
    test('should maintain type safety in successful validation', () => {
      const validRepo: GitHubRepository = {
        id: 123,
        name: "test",
        full_name: "user/test",
        owner: { login: "user", type: "User" },
        description: "Test",
        private: false,
        default_branch: "main",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
        pushed_at: "2023-01-01T00:00:00Z"
      };

      const result = validateGitHubRepository(validRepo);

      if (result.isValid && result.data) {
        // TypeScript should know result.data is GitHubRepository
        expect(typeof result.data.id).toBe('number');
        expect(typeof result.data.name).toBe('string');
        expect(typeof result.data.owner.login).toBe('string');
      }
    });
  });
});