/**
 * Tests for FHIR Resource Loader Service
 */

import {
  loadFHIRResource,
  loadMultipleFHIRResources,
  clearResourceCache,
  getCacheSize,
  isResourceCached,
} from './fhirResourceLoaderService';

// Mock fetch globally
global.fetch = jest.fn();

describe('FHIRResourceLoaderService', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearResourceCache();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  describe('loadFHIRResource', () => {
    it('should load a resource from published URL', async () => {
      const mockResource = {
        resourceType: 'ValueSet',
        id: 'test-valueset',
        url: 'http://example.org/fhir/ValueSet/test-valueset',
        name: 'Test ValueSet',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResource,
      });

      const result = await loadFHIRResource('http://example.org/fhir/ValueSet/test-valueset');

      expect(result).toEqual(mockResource);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://example.org/fhir/ValueSet/test-valueset.json',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/fhir+json, application/json',
          }),
        })
      );
    });

    it('should handle URL already ending with .json', async () => {
      const mockResource = {
        resourceType: 'CodeSystem',
        id: 'test-codesystem',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResource,
      });

      const result = await loadFHIRResource('http://example.org/fhir/CodeSystem/test.json');

      expect(result).toEqual(mockResource);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://example.org/fhir/CodeSystem/test.json',
        expect.any(Object)
      );
    });

    it('should fallback to CI build URL when published fails', async () => {
      const mockResource = {
        resourceType: 'ValueSet',
        id: 'test-valueset',
      };

      // First call (published) fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      // Second call (CI build) succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResource,
      });

      const result = await loadFHIRResource(
        'https://myprofile.github.io/myrepo/ValueSet/test-valueset'
      );

      expect(result).toEqual(mockResource);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://myprofile.github.io/myrepo/ValueSet/test-valueset.json',
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://myprofile.github.io/myrepo/test-valueset.json',
        expect.any(Object)
      );
    });

    it('should return null when resource is not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await loadFHIRResource('http://example.org/fhir/ValueSet/nonexistent');

      expect(result).toBeNull();
    });

    it('should cache resources when caching is enabled', async () => {
      const mockResource = {
        resourceType: 'ValueSet',
        id: 'test-valueset',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResource,
      });

      // First call - should fetch
      await loadFHIRResource('http://example.org/fhir/ValueSet/test-valueset', { cache: true });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result = await loadFHIRResource('http://example.org/fhir/ValueSet/test-valueset', {
        cache: true,
      });
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not called again
      expect(result).toEqual(mockResource);
    });

    it('should not cache when caching is disabled', async () => {
      const mockResource = {
        resourceType: 'ValueSet',
        id: 'test-valueset',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResource,
      });

      // First call
      await loadFHIRResource('http://example.org/fhir/ValueSet/test-valueset', { cache: false });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call - should fetch again
      await loadFHIRResource('http://example.org/fhir/ValueSet/test-valueset', { cache: false });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should respect allowPublished option', async () => {
      const mockResource = {
        resourceType: 'ValueSet',
        id: 'test-valueset',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResource,
      });

      // With allowPublished: false, should go straight to CI build
      const result = await loadFHIRResource(
        'https://myprofile.github.io/myrepo/ValueSet/test-valueset',
        { allowPublished: false }
      );

      expect(result).toEqual(mockResource);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://myprofile.github.io/myrepo/test-valueset.json',
        expect.any(Object)
      );
    });

    it('should respect allowCIBuild option', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      // With allowCIBuild: false, should not try CI build
      const result = await loadFHIRResource(
        'https://myprofile.github.io/myrepo/ValueSet/test-valueset',
        { allowCIBuild: false }
      );

      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only published attempt
    });
  });

  describe('loadMultipleFHIRResources', () => {
    it('should load multiple resources in parallel', async () => {
      const mockResources = [
        { resourceType: 'ValueSet', id: 'valueset1' },
        { resourceType: 'CodeSystem', id: 'codesystem1' },
        { resourceType: 'ConceptMap', id: 'conceptmap1' },
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => mockResources[0] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockResources[1] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockResources[2] });

      const results = await loadMultipleFHIRResources([
        'http://example.org/ValueSet/valueset1',
        'http://example.org/CodeSystem/codesystem1',
        'http://example.org/ConceptMap/conceptmap1',
      ]);

      expect(results).toEqual(mockResources);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      const mockResource1 = { resourceType: 'ValueSet', id: 'valueset1' };
      const mockResource3 = { resourceType: 'ConceptMap', id: 'conceptmap1' };

      (global.fetch as jest.Mock)
        // First resource - published succeeds
        .mockResolvedValueOnce({ ok: true, json: async () => mockResource1 })
        // Second resource - published fails
        .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' })
        // Third resource - published fails
        .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' })
        // Second resource - CI build fails (not a GitHub URL, so no CI attempt)
        // Third resource - CI build succeeds
        .mockResolvedValueOnce({ ok: true, json: async () => mockResource3 });

      const results = await loadMultipleFHIRResources([
        'http://example.org/ValueSet/valueset1',
        'http://example.org/CodeSystem/codesystem1', // Not a GitHub URL, will only try published
        'https://myprofile.github.io/myrepo/ConceptMap/conceptmap1', // GitHub URL, will try CI build
      ]);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(mockResource1);
      expect(results[1]).toBeNull();
      expect(results[2]).toEqual(mockResource3);
    });
  });

  describe('Cache management', () => {
    it('should track cache size correctly', async () => {
      expect(getCacheSize()).toBe(0);

      const mockResource = { resourceType: 'ValueSet', id: 'test' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResource,
      });

      await loadFHIRResource('http://example.org/ValueSet/test1', { cache: true });
      expect(getCacheSize()).toBe(1);

      await loadFHIRResource('http://example.org/ValueSet/test2', { cache: true });
      expect(getCacheSize()).toBe(2);

      clearResourceCache();
      expect(getCacheSize()).toBe(0);
    });

    it('should check if resource is cached', async () => {
      const url = 'http://example.org/ValueSet/test';
      expect(isResourceCached(url)).toBe(false);

      const mockResource = { resourceType: 'ValueSet', id: 'test' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResource,
      });

      await loadFHIRResource(url, { cache: true });
      expect(isResourceCached(url)).toBe(true);
    });

    it('should clear specific resource from cache', async () => {
      const mockResource = { resourceType: 'ValueSet', id: 'test' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResource,
      });

      const url1 = 'http://example.org/ValueSet/test1';
      const url2 = 'http://example.org/ValueSet/test2';

      await loadFHIRResource(url1, { cache: true });
      await loadFHIRResource(url2, { cache: true });
      expect(getCacheSize()).toBe(2);

      clearResourceCache(url1);
      expect(getCacheSize()).toBe(1);
      expect(isResourceCached(url1)).toBe(false);
      expect(isResourceCached(url2)).toBe(true);
    });
  });
});
