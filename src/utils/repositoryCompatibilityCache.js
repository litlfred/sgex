// Repository compatibility cache
const cache = new Map();

export const getCompatibilityInfo = (repoId) => {
  return cache.get(repoId) || { compatible: true, version: '1.0.0' };
};

export const setCompatibilityInfo = (repoId, info) => {
  cache.set(repoId, info);
};

export const clearCache = () => {
  cache.clear();
};

const repositoryCompatibilityCache = {
  getCompatibilityInfo,
  setCompatibilityInfo,
  clearCache
};

export default repositoryCompatibilityCache;