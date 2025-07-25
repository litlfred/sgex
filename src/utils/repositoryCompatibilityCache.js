/**
 * Simple in-memory cache for repository compatibility checks
 * Prevents redundant sushi-config.yaml downloads during scanning
 */

class RepositoryCompatibilityCache {
  constructor(ttlMinutes = 30) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Generate cache key for a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {string} Cache key
   */
  _getCacheKey(owner, repo) {
    return `${owner}/${repo}`;
  }

  /**
   * Check if cache entry is still valid
   * @param {Object} entry - Cache entry
   * @returns {boolean} True if valid
   */
  _isValid(entry) {
    return Date.now() - entry.timestamp < this.ttl;
  }

  /**
   * Get cached compatibility result
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {boolean|null} Cached result or null if not cached/expired
   */
  get(owner, repo) {
    const key = this._getCacheKey(owner, repo);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (!this._isValid(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.compatible;
  }

  /**
   * Set cached compatibility result
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {boolean} compatible - Whether repository is SMART guidelines compatible
   */
  set(owner, repo, compatible) {
    const key = this._getCacheKey(owner, repo);
    this.cache.set(key, {
      compatible,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getStats() {
    this.cleanup();
    return {
      size: this.cache.size,
      ttlMinutes: this.ttl / (60 * 1000),
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        repository: key,
        compatible: entry.compatible,
        ageMinutes: Math.round((Date.now() - entry.timestamp) / (60 * 1000))
      }))
    };
  }
}

// Create a singleton instance
const repositoryCompatibilityCache = new RepositoryCompatibilityCache();

export default repositoryCompatibilityCache;