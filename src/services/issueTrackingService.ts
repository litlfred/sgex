/**
 * Issue Tracking Service
 * 
 * Manages tracked issues and pull requests for authenticated users.
 * Stores data in localStorage and syncs with GitHub API when possible.
 * 
 * @module issueTrackingService
 */

import githubService from './githubService';
import logger from '../utils/logger';
import repositoryConfig from '../config/repositoryConfig';

/**
 * Tracked item (issue or PR)
 * @example { "type": "issue", "number": 123, "owner": "litlfred", "repo": "sgex" }
 */
export interface TrackedItem {
  /** Item type */
  type: 'issue' | 'pull_request';
  /** Item number */
  number: number;
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
  /** Item title */
  title?: string;
  /** Item state */
  state?: 'open' | 'closed';
  /** Tracked since */
  trackedSince: string;
  /** Last updated */
  lastUpdated?: string;
  /** Labels */
  labels?: string[];
}

/**
 * Repository filter
 */
export interface RepositoryFilter {
  /** Repository owner */
  owner: string;
  /** Repository name */
  repo: string;
  /** Filter enabled */
  enabled: boolean;
}

/**
 * Stored tracking data
 */
interface StoredTrackingData {
  /** Tracked items by key */
  trackedItems: Record<string, TrackedItem>;
}

/**
 * Issue Tracking Service class
 * 
 * @openapi
 * components:
 *   schemas:
 *     TrackedItem:
 *       type: object
 *       required:
 *         - type
 *         - number
 *         - owner
 *         - repo
 *       properties:
 *         type:
 *           type: string
 *           enum: [issue, pull_request]
 *         number:
 *           type: integer
 */
class IssueTrackingService {
  private storageKey: string;
  private repositoryFiltersKey: string;
  private logger: any;
  private syncInterval: NodeJS.Timeout | null;
  private syncIntervalMs: number;

  constructor() {
    this.storageKey = 'sgex_tracked_items';
    this.repositoryFiltersKey = 'sgex_repository_filters';
    this.logger = logger.getLogger('IssueTrackingService');
    this.syncInterval = null;
    this.syncIntervalMs = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get the storage key for tracked items
   */
  _getStorageKey(): string {
    return this.storageKey;
  }

  /**
   * Get all tracked items from localStorage
   */
  _getStoredData(): StoredTrackingData {
    try {
      const data = localStorage.getItem(this._getStorageKey());
      return data ? JSON.parse(data) : { trackedItems: {} };
    } catch (error) {
      this.logger.error('Failed to parse stored tracking data:', error);
      return { trackedItems: {} };
    }
  }

  /**
   * Get repository filters from localStorage
   */
  _getRepositoryFilters(): Record<string, RepositoryFilter> {
    try {
      const data = localStorage.getItem(this.repositoryFiltersKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      this.logger.error('Failed to parse repository filters:', error);
      return {};
    }
  }

  /**
   * Save tracked items to localStorage
   */
  _saveStoredData(data: StoredTrackingData): void {
    try {
      localStorage.setItem(this._getStorageKey(), JSON.stringify(data));
    } catch (error) {
      this.logger.error('Failed to save tracking data:', error);
    }
  }

  /**
   * Save repository filters to localStorage
   */
  _saveRepositoryFilters(filters: Record<string, RepositoryFilter>): void {
    try {
      localStorage.setItem(this.repositoryFiltersKey, JSON.stringify(filters));
    } catch (error) {
      this.logger.error('Failed to save repository filters:', error);
    }
  }

  /**
   * Generate unique key for item
   */
  _getItemKey(owner: string, repo: string, type: 'issue' | 'pull_request', number: number): string {
    return `${owner}/${repo}/${type}/${number}`;
  }

  /**
   * Track an issue or pull request
   */
  trackItem(owner: string, repo: string, type: 'issue' | 'pull_request', number: number, title?: string): void {
    const data = this._getStoredData();
    const key = this._getItemKey(owner, repo, type, number);

    data.trackedItems[key] = {
      type,
      number,
      owner,
      repo,
      title,
      trackedSince: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this._saveStoredData(data);
    this.logger.info(`Tracking ${type} #${number} in ${owner}/${repo}`);
  }

  /**
   * Untrack an item
   */
  untrackItem(owner: string, repo: string, type: 'issue' | 'pull_request', number: number): void {
    const data = this._getStoredData();
    const key = this._getItemKey(owner, repo, type, number);

    if (data.trackedItems[key]) {
      delete data.trackedItems[key];
      this._saveStoredData(data);
      this.logger.info(`Untracked ${type} #${number} in ${owner}/${repo}`);
    }
  }

  /**
   * Check if an item is tracked
   */
  isTracked(owner: string, repo: string, type: 'issue' | 'pull_request', number: number): boolean {
    const data = this._getStoredData();
    const key = this._getItemKey(owner, repo, type, number);
    return !!data.trackedItems[key];
  }

  /**
   * Get all tracked items
   */
  getAllTrackedItems(): TrackedItem[] {
    const data = this._getStoredData();
    return Object.values(data.trackedItems);
  }

  /**
   * Get tracked items for a repository
   */
  getTrackedItemsForRepository(owner: string, repo: string): TrackedItem[] {
    return this.getAllTrackedItems().filter(
      item => item.owner === owner && item.repo === repo
    );
  }

  /**
   * Sync tracked items with GitHub
   */
  async syncTrackedItems(): Promise<void> {
    const items = this.getAllTrackedItems();
    const data = this._getStoredData();

    for (const item of items) {
      try {
        let updated: any;
        if (item.type === 'issue') {
          updated = await githubService.getIssue(item.owner, item.repo, item.number);
        } else {
          updated = await githubService.getPullRequest(item.owner, item.repo, item.number);
        }

        if (updated) {
          const key = this._getItemKey(item.owner, item.repo, item.type, item.number);
          data.trackedItems[key] = {
            ...item,
            title: updated.title,
            state: updated.state,
            lastUpdated: new Date().toISOString(),
            labels: updated.labels?.map((l: any) => l.name) || []
          };
        }
      } catch (error) {
        this.logger.error(`Failed to sync ${item.type} #${item.number}:`, error);
      }
    }

    this._saveStoredData(data);
  }

  /**
   * Start automatic syncing
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      return;
    }

    this.syncInterval = setInterval(() => {
      this.syncTrackedItems();
    }, this.syncIntervalMs);

    this.logger.info('Started auto-sync for tracked items');
  }

  /**
   * Stop automatic syncing
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.logger.info('Stopped auto-sync for tracked items');
    }
  }

  /**
   * Enable repository filter
   */
  enableRepositoryFilter(owner: string, repo: string): void {
    const filters = this._getRepositoryFilters();
    const key = `${owner}/${repo}`;
    filters[key] = { owner, repo, enabled: true };
    this._saveRepositoryFilters(filters);
  }

  /**
   * Disable repository filter
   */
  disableRepositoryFilter(owner: string, repo: string): void {
    const filters = this._getRepositoryFilters();
    const key = `${owner}/${repo}`;
    if (filters[key]) {
      filters[key].enabled = false;
      this._saveRepositoryFilters(filters);
    }
  }

  /**
   * Get enabled repository filters
   */
  getEnabledRepositoryFilters(): RepositoryFilter[] {
    const filters = this._getRepositoryFilters();
    return Object.values(filters).filter(f => f.enabled);
  }

  /**
   * Clear all tracked items
   */
  clearAllTrackedItems(): void {
    this._saveStoredData({ trackedItems: {} });
    this.logger.info('Cleared all tracked items');
  }

  /**
   * Create issue
   */
  async createIssue(owner: string, repo: string, issueData: any): Promise<any> {
    try {
      const issue = await githubService.createIssue(owner, repo, issueData);
      if (issue) {
        this.trackItem(owner, repo, 'issue', issue.number, issue.title);
      }
      return issue;
    } catch (error) {
      this.logger.error('Failed to create issue:', error);
      throw error;
    }
  }
}

// Export singleton instance
const issueTrackingService = new IssueTrackingService();
export default issueTrackingService;
