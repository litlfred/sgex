import { processConcurrently } from '../utils/concurrency';

describe('Concurrency Utils', () => {
  describe('processConcurrently', () => {
    it('should process items concurrently with specified limit', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const processingOrder = [];
      const completionOrder = [];
      
      const processor = async (item, index) => {
        processingOrder.push(item);
        // Simulate varying processing times
        const delay = item % 3 === 0 ? 100 : 50;
        await new Promise(resolve => setTimeout(resolve, delay));
        completionOrder.push(item);
        return item * 2;
      };

      const results = await processConcurrently(items, processor, {
        concurrency: 3
      });

      // Results should be in original order
      expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
      
      // Should have started processing multiple items concurrently
      expect(processingOrder.length).toBe(10);
      
      // First few items should start processing quickly (within concurrency limit)
      expect(processingOrder.slice(0, 3)).toContain(1);
      expect(processingOrder.slice(0, 3)).toContain(2);
      expect(processingOrder.slice(0, 3)).toContain(3);
    });

    it('should call progress callback correctly', async () => {
      const items = ['a', 'b', 'c'];
      const progressCalls = [];
      
      const processor = async (item) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return item.toUpperCase();
      };

      await processConcurrently(items, processor, {
        concurrency: 2,
        onProgress: (completed, total, item, result) => {
          progressCalls.push({ completed, total, item, result });
        }
      });

      expect(progressCalls).toHaveLength(3);
      expect(progressCalls[0].total).toBe(3);
      expect(progressCalls[2].completed).toBe(3);
    });

    it('should handle errors gracefully', async () => {
      const items = [1, 2, 3, 4, 5];
      
      const processor = async (item) => {
        if (item === 3) {
          throw new Error('Processing failed');
        }
        return item * 2;
      };

      const results = await processConcurrently(items, processor, {
        concurrency: 2
      });

      // Should have results for successful items and error objects for failed ones
      expect(results).toHaveLength(5);
      expect(results[0]).toBe(2);  // 1 * 2
      expect(results[1]).toBe(4);  // 2 * 2
      expect(results[2]).toHaveProperty('error');  // Failed item
      expect(results[2].item).toBe(3);
      expect(results[3]).toBe(8);  // 4 * 2
      expect(results[4]).toBe(10); // 5 * 2
    });

    it('should handle empty input', async () => {
      const processor = jest.fn();
      const results = await processConcurrently([], processor);
      
      expect(results).toEqual([]);
      expect(processor).not.toHaveBeenCalled();
    });

    it('should respect concurrency limit', async () => {
      const items = Array.from({ length: 20 }, (_, i) => i + 1);
      let activeCount = 0;
      let maxActiveCount = 0;
      
      const processor = async (item) => {
        activeCount++;
        maxActiveCount = Math.max(maxActiveCount, activeCount);
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 50));
        
        activeCount--;
        return item;
      };

      await processConcurrently(items, processor, {
        concurrency: 5
      });

      // Should never exceed concurrency limit
      expect(maxActiveCount).toBeLessThanOrEqual(5);
      expect(maxActiveCount).toBeGreaterThan(1); // Should be parallel
    });
  });
});