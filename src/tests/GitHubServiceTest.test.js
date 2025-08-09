/**
 * Test to debug the specific issue with checkSmartGuidelinesCompatibility
 */

import githubService from '../services/githubService';
import repositoryCompatibilityCache from '../utils/repositoryCompatibilityCache';

describe('GitHub Service DAK Scanning Debug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repositoryCompatibilityCache.clear();
    githubService.isAuthenticated = false;
    githubService.octokit = null;
  });

  describe('checkSmartGuidelinesCompatibility method behavior', () => {
    beforeEach(() => {
      githubService.isAuthenticated = true;
      githubService.octokit = {
        rest: {
          repos: {
            getContent: jest.fn()
          }
        }
      };
    });

    test('should handle rate limiting and return error info', async () => {
      const error = new Error('API rate limit exceeded');
      error.status = 403;
      githubService.octokit.rest.repos.getContent.mockRejectedValue(error);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await githubService.checkSmartGuidelinesCompatibility(
        'WorldHealthOrganization',
        'test-repo'
      );

      expect(result.compatible).toBe(false);
      expect(result.error).toBe('API rate limit exceeded');
      expect(result.errorType).toBe('rate_limit');
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    test('should handle network errors and return error info', async () => {
      const error = new Error('Network Error');
      error.code = 'ENOTFOUND';
      githubService.octokit.rest.repos.getContent.mockRejectedValue(error);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await githubService.checkSmartGuidelinesCompatibility(
        'WorldHealthOrganization',
        'test-repo'
      );

      expect(result.compatible).toBe(false);
      expect(result.error).toBe('Network Error');
      expect(result.errorType).toBe('network_error');
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('processConcurrently behavior', () => {
    test('should handle processor function that returns null', async () => {
      const { processConcurrently } = require('../utils/concurrency');
      
      const items = [1, 2, 3, 4];
      const processor = jest.fn().mockImplementation(async (item) => {
        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 10));
        // Return null for all items (simulating failed compatibility checks)
        return null;
      });

      const onProgress = jest.fn();
      const onItemStart = jest.fn();

      const results = await processConcurrently(items, processor, {
        concurrency: 2,
        onProgress,
        onItemStart
      });

      expect(results).toEqual([null, null, null, null]);
      expect(processor).toHaveBeenCalledTimes(4);
    });

    test('should handle mixed null and valid results', async () => {
      const { processConcurrently } = require('../utils/concurrency');
      
      const items = [1, 2, 3, 4];
      const processor = jest.fn().mockImplementation(async (item) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        // Return valid result for odd numbers, null for even numbers
        return item % 2 === 1 ? { value: item } : null;
      });

      const onProgress = jest.fn();
      const onItemStart = jest.fn();

      const results = await processConcurrently(items, processor, {
        concurrency: 2,
        onProgress,
        onItemStart
      });

      expect(results).toEqual([{ value: 1 }, null, { value: 3 }, null]);
      expect(processor).toHaveBeenCalledTimes(4);
    });
  });
});