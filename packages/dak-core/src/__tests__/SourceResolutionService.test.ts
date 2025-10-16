import { SourceResolutionService } from '../sourceResolution';
import { DAKComponentSource } from '../types';

// Mock fetch for URL resolution tests
global.fetch = jest.fn();

describe('SourceResolutionService', () => {
  let service: SourceResolutionService;

  beforeEach(() => {
    service = new SourceResolutionService();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Canonical URI Resolution', () => {
    it('should resolve canonical URI source', async () => {
      const source: DAKComponentSource<any> = {
        canonical: 'http://smart.who.int/anc-dak/ValueSet/anc-codes'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ resourceType: 'ValueSet', id: 'anc-codes' })
      });

      const result = await service.resolve(source);

      expect(result.data).toEqual({ resourceType: 'ValueSet', id: 'anc-codes' });
      expect(result.source).toBe('canonical');
    });

    it('should cache canonical URI resolutions', async () => {
      const source: DAKComponentSource<any> = {
        canonical: 'http://smart.who.int/anc-dak/ValueSet/test'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
      });

      await service.resolve(source);
      await service.resolve(source);

      // Should only fetch once due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle canonical resolution errors', async () => {
      const source: DAKComponentSource<any> = {
        canonical: 'http://invalid-url.com/resource'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(service.resolve(source)).rejects.toThrow();
    });
  });

  describe('Absolute URL Resolution', () => {
    it('should resolve absolute HTTP URL', async () => {
      const source: DAKComponentSource<any> = {
        url: 'https://example.com/data.json'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ test: 'data' })
      });

      const result = await service.resolve(source);

      expect(result.data).toEqual({ test: 'data' });
      expect(result.source).toBe('url');
    });

    it('should resolve absolute HTTPS URL', async () => {
      const source: DAKComponentSource<any> = {
        url: 'https://secure.example.com/data.json'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => 'text content'
      });

      const result = await service.resolve(source);

      expect(result.data).toBe('text content');
    });

    it('should handle URL resolution errors', async () => {
      const source: DAKComponentSource<any> = {
        url: 'https://example.com/not-found.json'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(service.resolve(source)).rejects.toThrow();
    });
  });

  describe('Relative URL Resolution', () => {
    it('should resolve relative URL (relative to input/)', async () => {
      const source: DAKComponentSource<any> = {
        url: 'fsh/actors/Nurse.fsh'
      };

      const mockStagingGroundService = {
        loadFile: jest.fn().mockResolvedValue('Instance: Nurse\nInstanceOf: Actor')
      };

      service.setStagingGroundService(mockStagingGroundService as any);

      const result = await service.resolve(source, 'user', 'repo', 'main');

      expect(result.data).toBe('Instance: Nurse\nInstanceOf: Actor');
      expect(mockStagingGroundService.loadFile).toHaveBeenCalledWith(
        'user',
        'repo',
        'main',
        'input/fsh/actors/Nurse.fsh'
      );
    });

    it('should handle relative URL with different paths', async () => {
      const source: DAKComponentSource<any> = {
        url: 'vocabulary/valuesets/my-valueset.json'
      };

      const mockStagingGroundService = {
        loadFile: jest.fn().mockResolvedValue('{ "resourceType": "ValueSet" }')
      };

      service.setStagingGroundService(mockStagingGroundService as any);

      await service.resolve(source, 'user', 'repo', 'main');

      expect(mockStagingGroundService.loadFile).toHaveBeenCalledWith(
        'user',
        'repo',
        'main',
        'input/vocabulary/valuesets/my-valueset.json'
      );
    });
  });

  describe('Inline Instance Data', () => {
    it('should return inline instance data directly', async () => {
      const inlineData = { name: 'Test Actor', role: 'Nurse' };
      const source: DAKComponentSource<any> = {
        instance: inlineData
      };

      const result = await service.resolve(source);

      expect(result.data).toEqual(inlineData);
      expect(result.source).toBe('inline');
    });

    it('should handle complex inline data structures', async () => {
      const complexData = {
        id: 'test-123',
        metadata: { version: '1.0' },
        content: ['item1', 'item2']
      };

      const source: DAKComponentSource<any> = {
        instance: complexData
      };

      const result = await service.resolve(source);

      expect(result.data).toEqual(complexData);
    });
  });

  describe('Source Validation', () => {
    it('should validate source has at least one resolution method', () => {
      const invalidSource: any = {
        metadata: { some: 'data' }
      };

      expect(() => service.validate(invalidSource)).toThrow();
    });

    it('should accept source with canonical', () => {
      const source: DAKComponentSource<any> = {
        canonical: 'http://example.com/resource'
      };

      expect(() => service.validate(source)).not.toThrow();
    });

    it('should accept source with url', () => {
      const source: DAKComponentSource<any> = {
        url: 'https://example.com/data.json'
      };

      expect(() => service.validate(source)).not.toThrow();
    });

    it('should accept source with instance', () => {
      const source: DAKComponentSource<any> = {
        instance: { data: 'value' }
      };

      expect(() => service.validate(source)).not.toThrow();
    });
  });

  describe('Cache Management', () => {
    it('should respect cache TTL', async () => {
      const shortTTLService = new SourceResolutionService({ cacheTTL: 100 });
      const source: DAKComponentSource<any> = {
        canonical: 'http://example.com/resource'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
      });

      await shortTTLService.resolve(source);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await shortTTLService.resolve(source);

      // Should fetch twice due to cache expiration
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should allow cache invalidation', async () => {
      const source: DAKComponentSource<any> = {
        canonical: 'http://example.com/resource'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' })
      });

      await service.resolve(source);
      service.clearCache();
      await service.resolve(source);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
