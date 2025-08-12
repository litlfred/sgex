/**
 * Utility for managing concurrent async operations with rate limiting
 */

/**
 * Options for concurrent processing
 */
export interface ConcurrencyOptions<T, R> {
  /** Maximum concurrent operations (default: 5) */
  concurrency?: number;
  /** Progress callback (current, total, item, result) */
  onProgress?: (current: number, total: number, item: T, result: R | null) => void;
  /** Callback when item completes (item, result, error) */
  onItemComplete?: (item: T, result: R | null, error: Error | null) => void;
  /** Callback when item starts processing (item, index) */
  onItemStart?: (item: T, index: number) => void;
}

/**
 * Work item for processing queue
 */
interface WorkItem<T> {
  item: T;
  index: number;
}

/**
 * Result with error handling
 */
interface ProcessingResult<T, R> {
  error: Error;
  item: T;
}

/**
 * Processes items concurrently with a specified concurrency limit
 * @param items - Items to process
 * @param processor - Async function to process each item
 * @param options - Options for concurrency control
 * @returns Array of results (in original order)
 */
export async function processConcurrently<T, R>(
  items: T[], 
  processor: (item: T, index: number) => Promise<R>, 
  options: ConcurrencyOptions<T, R> = {}
): Promise<(R | ProcessingResult<T, R>)[]> {
  const {
    concurrency = 5,
    onProgress = null,
    onItemComplete = null,
    onItemStart = null
  } = options;

  if (!items || items.length === 0) {
    return [];
  }

  const results = new Array<R | ProcessingResult<T, R>>(items.length);
  const total = items.length;
  let completed = 0;

  // Create a queue of work items
  const queue: WorkItem<T>[] = items.map((item, index) => ({ item, index }));
  
  // Worker function that processes items from the queue
  const worker = async (): Promise<void> => {
    while (queue.length > 0) {
      const { item, index } = queue.shift()!;
      
      // Notify that processing is starting
      if (onItemStart) {
        onItemStart(item, index);
      }
      
      try {
        const result = await processor(item, index);
        results[index] = result;
        
        completed++;
        
        // Call callbacks
        if (onProgress) {
          onProgress(completed, total, item, result);
        }
        if (onItemComplete) {
          onItemComplete(item, result, null);
        }
      } catch (error) {
        // Store error as result
        results[index] = { error: error as Error, item };
        
        completed++;
        
        // Call callbacks
        if (onProgress) {
          onProgress(completed, total, item, null);
        }
        if (onItemComplete) {
          onItemComplete(item, null, error as Error);
        }
      }
    }
  };

  // Start worker promises (limited by concurrency)
  const workers = Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(() => worker());

  // Wait for all workers to complete
  await Promise.all(workers);

  return results;
}

/**
 * Rate-limited function executor
 * Useful for API calls that need to respect rate limits
 */
export class RateLimiter {
  private requestsPerSecond: number;
  private requests: number[];
  private interval: number;

  constructor(requestsPerSecond: number = 5) {
    this.requestsPerSecond = requestsPerSecond;
    this.requests = [];
    this.interval = 1000 / requestsPerSecond; // ms between requests
  }

  /**
   * Execute a function with rate limiting
   * @param fn - Function to execute
   * @returns Result of the function
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    
    // Remove requests older than 1 second
    this.requests = this.requests.filter(time => now - time < 1000);
    
    // If we're at the limit, wait
    if (this.requests.length >= this.requestsPerSecond) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = 1000 - (now - oldestRequest) + 10; // Add 10ms buffer
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // Record this request
    this.requests.push(Date.now());
    
    // Execute the function
    return await fn();
  }
}