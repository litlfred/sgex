// Repository compatibility cache
class RepositoryCompatibilityCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

const repositoryCompatibilityCache = new RepositoryCompatibilityCache();
export default repositoryCompatibilityCache;