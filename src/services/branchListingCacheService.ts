/**
 * Branch Listing Cache Service
 * 
 * Provides caching functionality for branch and pull request data.
 * 
 * @module branchListingCacheService
 */

/**
 * Branch data structure
 * @example { "name": "main", "commit": { "sha": "abc123" }, "protected": false }
 */
export interface Branch {
  /** Branch name */
  name: string;
  /** Commit information */
  commit?: {
    /** Commit SHA */
    sha: string;
    /** Commit URL */
    url?: string;
  };
  /** Whether branch is protected */
  protected?: boolean;
}

/**
 * Pull request data structure
 * @example { "number": 123, "title": "Fix bug", "state": "open", "head": { "ref": "feature" } }
 */
export interface PullRequest {
  /** PR number */
  number: number;
  /** PR title */
  title: string;
  /** PR state */
  state: 'open' | 'closed' | 'merged';
  /** Head branch info */
  head: {
    /** Branch reference */
    ref: string;
    /** Repository info */
    repo?: {
      /** Full repository name */
      full_name: string;
    };
  };
  /** Base branch info */
  base?: {
    /** Branch reference */
    ref: string;
  };
}

/**
 * Cached repository data
 * @example { "branches": [], "pullRequests": [] }
 */
export interface CachedData {
  /** List of branches */
  branches: Branch[];
  /** List of pull requests */
  pullRequests: PullRequest[];
}

/**
 * Cache information for a repository
 * @example { "cached": true, "lastUpdated": "2025-10-15T10:00:00Z", "age": 60000, "valid": true }
 */
export interface CacheInfo {
  /** Whether data is cached */
  cached: boolean;
  /** Last update timestamp */
  lastUpdated: Date | null;
  /** Cache age in milliseconds */
  age: number;
  /** Whether cache is still valid */
  valid?: boolean;
}

/**
 * Branch Listing Cache Service class
 * 
 * Manages in-memory cache for branch and pull request listings.
 * 
 * @openapi
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         commit:
 *           type: object
 *           properties:
 *             sha:
 *               type: string
 *     PullRequest:
 *       type: object
 *       properties:
 *         number:
 *           type: number
 *         title:
 *           type: string
 *         state:
 *           type: string
 *           enum: [open, closed, merged]
 *     CachedData:
 *       type: object
 *       properties:
 *         branches:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Branch'
 *         pullRequests:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PullRequest'
 */
class BranchListingCacheService {
    private cache: Map<string, CachedData>;
    private cacheTimestamps: Map<string, number>;
    private readonly CACHE_DURATION: number;

    constructor() {
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    }

    /**
     * Generate cache key for a repository
     */
    getCacheKey(owner: string, repo: string): string {
        return `${owner}/${repo}`;
    }

    /**
     * Check if cache is valid for a given key
     */
    isCacheValid(cacheKey: string): boolean {
        const timestamp = this.cacheTimestamps.get(cacheKey);
        if (!timestamp) return false;
        return Date.now() - timestamp < this.CACHE_DURATION;
    }

    /**
     * Get cached data for a repository
     * 
     * @openapi
     * /api/cache/branch-listing/{owner}/{repo}:
     *   get:
     *     summary: Get cached branch and PR data
     *     parameters:
     *       - name: owner
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *       - name: repo
     *         in: path
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Cached data
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CachedData'
     *       404:
     *         description: No cached data
     */
    getCachedData(owner: string, repo: string): CachedData | null {
        const cacheKey = this.getCacheKey(owner, repo);
        
        if (this.isCacheValid(cacheKey)) {
            return this.cache.get(cacheKey) || null;
        }
        
        return null;
    }

    /**
     * Set cached data for a repository
     */
    setCachedData(owner: string, repo: string, branches?: Branch[], pullRequests?: PullRequest[]): void {
        const cacheKey = this.getCacheKey(owner, repo);
        const data: CachedData = {
            branches: branches || [],
            pullRequests: pullRequests || []
        };
        
        this.cache.set(cacheKey, data);
        this.cacheTimestamps.set(cacheKey, Date.now());
    }

    /**
     * Force refresh by clearing cache for a repository
     */
    forceRefresh(owner: string, repo: string): void {
        const cacheKey = this.getCacheKey(owner, repo);
        this.cache.delete(cacheKey);
        this.cacheTimestamps.delete(cacheKey);
    }

    /**
     * Get cache information for a repository
     */
    getCacheInfo(owner: string, repo: string): CacheInfo {
        const cacheKey = this.getCacheKey(owner, repo);
        const timestamp = this.cacheTimestamps.get(cacheKey);
        
        if (!timestamp) {
            return {
                cached: false,
                lastUpdated: null,
                age: 0
            };
        }

        const age = Date.now() - timestamp;
        return {
            cached: true,
            lastUpdated: new Date(timestamp),
            age: age,
            valid: this.isCacheValid(cacheKey)
        };
    }

    /**
     * Clear all cache
     */
    clearAll(): void {
        this.cache.clear();
        this.cacheTimestamps.clear();
    }
}

// Export singleton instance
const branchListingCacheService = new BranchListingCacheService();
export default branchListingCacheService;
