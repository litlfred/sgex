// Repository cache service
const repositoryCache = new Map();

export const getCachedRepository = (key) => {
  return repositoryCache.get(key);
};

export const setCachedRepository = (key, data) => {
  repositoryCache.set(key, data);
};

export const clearRepositoryCache = () => {
  repositoryCache.clear();
};

export const getRepositoryList = () => {
  return Array.from(repositoryCache.values());
};

const repositoryCacheService = {
  getCachedRepository,
  setCachedRepository,
  clearRepositoryCache,
  getRepositoryList
};

export default repositoryCacheService;