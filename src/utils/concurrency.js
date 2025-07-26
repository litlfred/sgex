/**
 * Utility for managing concurrent async operations with rate limiting
 */

/**
 * Processes items concurrently with a specified concurrency limit
 * @param {Array} items - Items to process
 * @param {Function} processor - Async function to process each item
 * @param {Object} options - Options for concurrency control
 * @param {number} options.concurrency - Maximum concurrent operations (default: 5)
 * @param {Function} options.onProgress - Progress callback (current, total, item, result)
 * @param {Function} options.onItemComplete - Callback when item completes (item, result, error)
 * @param {Function} options.onItemStart - Callback when item starts processing (item, index)
 * @returns {Promise<Array>} Array of results (in original order)
 */
export async function processConcurrently(items, processor, options = {}) {
  const {
    concurrency = 5,
    onProgress = null,
    onItemComplete = null,
    onItemStart = null
  } = options;

  if (!items || items.length === 0) {
    return [];
  }

  const results = new Array(items.length);
  const total = items.length;
  let completed = 0;

  // Create a queue of work items
  const queue = items.map((item, index) => ({ item, index }));
  
  // Worker function that processes items from the queue
  const worker = async () => {
    while (queue.length > 0) {
      const { item, index } = queue.shift();
      
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
        results[index] = { error, item };
        
        completed++;
        
        // Call callbacks
        if (onProgress) {
          onProgress(completed, total, item, null);
        }
        if (onItemComplete) {
          onItemComplete(item, null, error);
        }
      }
    }
  };

  // Start worker promises (limited by concurrency)
  const workers = Array(Math.min(concurrency, items.length))
    .fill()
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
  constructor(requestsPerSecond = 5) {
    this.requestsPerSecond = requestsPerSecond;
    this.requests = [];
    this.interval = 1000 / requestsPerSecond; // ms between requests
  }

  /**
   * Execute a function with rate limiting
   * @param {Function} fn - Function to execute
   * @returns {Promise} Result of the function
   */
  async execute(fn) {
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