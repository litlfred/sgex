// Cache management service
const caches = new Map();

export const getCache = (cacheName) => {
  if (!caches.has(cacheName)) {
    caches.set(cacheName, new Map());
  }
  return caches.get(cacheName);
};

export const clearCache = (cacheName) => {
  if (caches.has(cacheName)) {
    caches.get(cacheName).clear();
  }
};

export const clearAllCaches = () => {
  caches.forEach(cache => cache.clear());
};

const cacheManagementService = {
  getCache,
  clearCache,
  clearAllCaches
};

export default cacheManagementService;