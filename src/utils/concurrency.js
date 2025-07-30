// Concurrency utilities
export const createMutex = () => {
  let locked = false;
  return {
    async acquire() {
      while (locked) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      locked = true;
    },
    release() {
      locked = false;
    }
  };
};

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const processConcurrently = async (items, processor, concurrency = 5) => {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
};