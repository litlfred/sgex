// Concurrency utilities
export const processConcurrently = async (items, processor, maxConcurrency = 5) => {
  const results = [];
  
  for (let i = 0; i < items.length; i += maxConcurrency) {
    const batch = items.slice(i, i + maxConcurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
};