/**
 * Simple in-memory cache for repository compatibility checks
 * Prevents redundant sushi-config.yaml downloads during scanning
 * 
 * @module repositoryCompatibilityCache
 */

/**
 * Cache entry for repository compatibility
 * @example { "compatible": true, "timestamp": 1699564800000 }
 */
export interface CacheEntry {
  /** Whether repository is SMART guidelines compatible */
  compatible: boolean;
  /** Timestamp when entry was cached (milliseconds since epoch) */
  timestamp: number;
}

/**
 * Repository cache statistics
 * @example { "size": 5, "ttlMinutes": 30, "entries": [...] }
 */
export interface CacheStats {
  /** Number of cached entries */
  size: number;
  /** Time-to-live in minutes */
  ttlMinutes: number;
  /** List of cached entries with details */
  entries: Array<{
    /** Repository identifier (owner/repo) */
    repository: string;
    /** Compatibility status */
    compatible: boolean;
    /** Age of cache entry in minutes */
    ageMinutes: number;
  }>;
}

/**
 * Simple in-memory cache for repository compatibility checks
 * Prevents redundant sushi-config.yaml downloads during scanning
 * 
 * @example
 * const cache = new RepositoryCompatibilityCache(30);
 * cache.set("who", "anc-dak", true);
 * const isCompatible = cache.get("who", "anc-dak"); // true
 */
export class RepositoryCompatibilityCache {
  private cache: Map<string, CacheEntry>;
  private ttl: number;

  /**
   * Create a new repository compatibility cache
   * @param ttlMinutes - Time-to-live for cache entries in minutes (default: 30)
   * 
   * @example
   * const cache = new RepositoryCompatibilityCache(60); // 1 hour TTL
   */
  constructor(ttlMinutes: number = 30) {
    this.cache = new Map<string, CacheEntry>();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Generate cache key for a repository
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Cache key
   * 
   * @example
   * _getCacheKey("who", "anc-dak"); // "who/anc-dak"
   */
  private _getCacheKey(owner: string, repo: string): string {
    return `${owner}/${repo}`;
  }

  /**
   * Check if cache entry is still valid
   * @param entry - Cache entry
   * @returns True if valid
   * 
   * @example
   * const entry = { compatible: true, timestamp: Date.now() };
   * _isValid(entry); // true
   */
  private _isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.ttl;
  }

  /**
   * Get cached compatibility result
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Cached result or null if not cached/expired
   * 
   * @example
   * const isCompatible = cache.get("who", "anc-dak");
   * if (isCompatible === null) {
   *   // Not cached or expired, need to check
   * }
   */
  get(owner: string, repo: string): boolean | null {
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
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param compatible - Whether repository is SMART guidelines compatible
   * 
   * @example
   * cache.set("who", "anc-dak", true);
   */
  set(owner: string, repo: string, compatible: boolean): void {
    const key = this._getCacheKey(owner, repo);
    this.cache.set(key, {
      compatible,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached entries
   * 
   * @example
   * cache.clear(); // Remove all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   * 
   * @example
   * cache.cleanup(); // Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns Cache stats with size, TTL, and entry details
   * 
   * @example
   * const stats = cache.getStats();
   * console.log(`Cache has ${stats.size} entries`);
   */
  getStats(): CacheStats {
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

/**
 * Singleton instance of repository compatibility cache
 * Default TTL: 30 minutes
 * 
 * @example
 * import repositoryCompatibilityCache from './repositoryCompatibilityCache';
 * repositoryCompatibilityCache.set("who", "anc-dak", true);
 * const isCompatible = repositoryCompatibilityCache.get("who", "anc-dak");
 */
const repositoryCompatibilityCache = new RepositoryCompatibilityCache();

export default repositoryCompatibilityCache;
