import githubService from './githubService';
import logger from '../utils/logger';

/**
 * Issue Tracking Service
 * 
 * Manages tracked issues and pull requests for authenticated users.
 * Stores data in localStorage and syncs with GitHub API when possible.
 */
class IssueTrackingService {
  constructor() {
    this.storageKey = 'sgex_tracked_items';
    this.logger = logger.getLogger('IssueTrackingService');
    this.syncInterval = null;
    this.syncIntervalMs = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get the storage key for tracked items
   */
  _getStorageKey() {
    return this.storageKey;
  }

  /**
   * Get all tracked items from localStorage
   */
  _getStoredData() {
    try {
      const data = localStorage.getItem(this._getStorageKey());
      return data ? JSON.parse(data) : { trackedItems: {} };
    } catch (error) {
      this.logger.error('Failed to parse stored tracking data:', error);
      return { trackedItems: {} };
    }
  }

  /**
   * Save tracked items to localStorage
   */
  _saveStoredData(data) {
    try {
      localStorage.setItem(this._getStorageKey(), JSON.stringify(data));
      return true;
    } catch (error) {
      this.logger.error('Failed to save tracking data:', error);
      return false;
    }
  }

  /**
   * Get the current authenticated user's username
   */
  async _getCurrentUsername() {
    if (!githubService.isAuth()) {
      return null;
    }

    try {
      const user = await githubService.getCurrentUser();
      return user.login;
    } catch (error) {
      this.logger.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Get tracked items for a specific user
   */
  async getTrackedItems(username = null) {
    if (!username) {
      username = await this._getCurrentUsername();
      if (!username) return { issues: [], pullRequests: [] };
    }

    const data = this._getStoredData();
    const userItems = data.trackedItems[username] || { issues: [], pullRequests: [] };
    
    return {
      issues: userItems.issues || [],
      pullRequests: userItems.pullRequests || []
    };
  }

  /**
   * Add a tracked issue
   */
  async addTrackedIssue(issueData) {
    const username = await this._getCurrentUsername();
    if (!username) {
      this.logger.warn('Cannot track issue: user not authenticated');
      return false;
    }

    const data = this._getStoredData();
    
    // Ensure user data structure exists
    if (!data.trackedItems[username]) {
      data.trackedItems[username] = { issues: [], pullRequests: [] };
    }

    // Check if issue is already tracked
    const existingIssue = data.trackedItems[username].issues.find(
      issue => issue.id === issueData.id || issue.number === issueData.number
    );

    if (existingIssue) {
      this.logger.debug('Issue already tracked:', issueData.number);
      return true;
    }

    // Add the issue
    const trackedIssue = {
      id: issueData.id,
      number: issueData.number,
      title: issueData.title,
      html_url: issueData.html_url,
      created_at: issueData.created_at || new Date().toISOString(),
      repository: issueData.repository || 'litlfred/sgex',
      state: issueData.state || 'open',
      labels: issueData.labels || [],
      trackedAt: new Date().toISOString()
    };

    data.trackedItems[username].issues.push(trackedIssue);
    
    const saved = this._saveStoredData(data);
    if (saved) {
      this.logger.info('Issue tracked successfully:', trackedIssue.number);
      
      // Start background sync if not already running
      this.startBackgroundSync();
      
      // Try to find related PRs immediately
      this._findRelatedPRs(username, trackedIssue);
    }
    
    return saved;
  }

  /**
   * Add a tracked pull request
   */
  async addTrackedPR(prData, linkedIssues = []) {
    const username = await this._getCurrentUsername();
    if (!username) {
      this.logger.warn('Cannot track PR: user not authenticated');
      return false;
    }

    const data = this._getStoredData();
    
    // Ensure user data structure exists
    if (!data.trackedItems[username]) {
      data.trackedItems[username] = { issues: [], pullRequests: [] };
    }

    // Check if PR is already tracked
    const existingPR = data.trackedItems[username].pullRequests.find(
      pr => pr.id === prData.id || pr.number === prData.number
    );

    if (existingPR) {
      // Update linked issues if provided
      if (linkedIssues.length > 0) {
        existingPR.linkedIssues = [...new Set([...(existingPR.linkedIssues || []), ...linkedIssues])];
        this._saveStoredData(data);
      }
      return true;
    }

    // Add the PR
    const trackedPR = {
      id: prData.id,
      number: prData.number,
      title: prData.title,
      html_url: prData.html_url,
      created_at: prData.created_at || new Date().toISOString(),
      repository: prData.repository || 'litlfred/sgex',
      state: prData.state || 'open',
      linkedIssues: linkedIssues,
      trackedAt: new Date().toISOString()
    };

    data.trackedItems[username].pullRequests.push(trackedPR);
    
    const saved = this._saveStoredData(data);
    if (saved) {
      this.logger.info('PR tracked successfully:', trackedPR.number);
    }
    
    return saved;
  }

  /**
   * Remove a tracked issue
   */
  async removeTrackedIssue(issueNumber) {
    const username = await this._getCurrentUsername();
    if (!username) return false;

    const data = this._getStoredData();
    
    if (!data.trackedItems[username] || !data.trackedItems[username].issues) {
      return false;
    }

    const originalLength = data.trackedItems[username].issues.length;
    data.trackedItems[username].issues = data.trackedItems[username].issues.filter(
      issue => issue.number !== issueNumber
    );

    if (data.trackedItems[username].issues.length < originalLength) {
      this._saveStoredData(data);
      this.logger.info('Issue untracked:', issueNumber);
      return true;
    }

    return false;
  }

  /**
   * Remove a tracked pull request
   */
  async removeTrackedPR(prNumber) {
    const username = await this._getCurrentUsername();
    if (!username) return false;

    const data = this._getStoredData();
    
    if (!data.trackedItems[username] || !data.trackedItems[username].pullRequests) {
      return false;
    }

    const originalLength = data.trackedItems[username].pullRequests.length;
    data.trackedItems[username].pullRequests = data.trackedItems[username].pullRequests.filter(
      pr => pr.number !== prNumber
    );

    if (data.trackedItems[username].pullRequests.length < originalLength) {
      this._saveStoredData(data);
      this.logger.info('PR untracked:', prNumber);
      return true;
    }

    return false;
  }

  /**
   * Get count of tracked items
   */
  async getTrackedCounts(username = null) {
    const items = await this.getTrackedItems(username);
    return {
      issues: items.issues.length,
      pullRequests: items.pullRequests.length,
      total: items.issues.length + items.pullRequests.length
    };
  }

  /**
   * Find related pull requests for a tracked issue
   */
  async _findRelatedPRs(username, issue) {
    if (!githubService.isAuth()) return;

    try {
      // Extract owner/repo from repository string
      const [owner, repo] = issue.repository.split('/');
      if (!owner || !repo) return;

      // Search for PRs that mention this issue
      const searchQuery = `is:pr repo:${owner}/${repo} ${issue.number}`;
      const results = await githubService.searchPullRequests(searchQuery);

      if (results && results.items && results.items.length > 0) {
        for (const pr of results.items) {
          // Check if PR title or body references the issue
          const prText = `${pr.title} ${pr.body || ''}`.toLowerCase();
          const issueRefs = [
            `#${issue.number}`,
            `issue ${issue.number}`,
            `fixes #${issue.number}`,
            `closes #${issue.number}`,
            `resolves #${issue.number}`
          ];

          const isRelated = issueRefs.some(ref => prText.includes(ref.toLowerCase()));
          
          if (isRelated) {
            await this.addTrackedPR({
              id: pr.id,
              number: pr.number,
              title: pr.title,
              html_url: pr.html_url,
              created_at: pr.created_at,
              repository: issue.repository,
              state: pr.state
            }, [issue.number]);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to find related PRs:', error);
    }
  }

  /**
   * Sync tracked items with GitHub to update their status
   */
  async syncTrackedItems() {
    if (!githubService.isAuth()) return;

    const username = await this._getCurrentUsername();
    if (!username) return;

    const items = await this.getTrackedItems(username);
    let updated = false;

    // Update issue states
    for (const issue of items.issues) {
      try {
        const [owner, repo] = issue.repository.split('/');
        if (!owner || !repo) continue;

        const currentIssue = await githubService.getIssue(owner, repo, issue.number);
        if (currentIssue && currentIssue.state !== issue.state) {
          issue.state = currentIssue.state;
          updated = true;
        }
      } catch (error) {
        this.logger.debug(`Failed to sync issue ${issue.number}:`, error);
      }
    }

    // Update PR states
    for (const pr of items.pullRequests) {
      try {
        const [owner, repo] = pr.repository.split('/');
        if (!owner || !repo) continue;

        const currentPR = await githubService.getPullRequest(owner, repo, pr.number);
        if (currentPR && currentPR.state !== pr.state) {
          pr.state = currentPR.state;
          updated = true;
        }
      } catch (error) {
        this.logger.debug(`Failed to sync PR ${pr.number}:`, error);
      }
    }

    // Save updated data
    if (updated) {
      const data = this._getStoredData();
      data.trackedItems[username] = items;
      this._saveStoredData(data);
      this.logger.info('Tracked items synced successfully');
    }
  }

  /**
   * Start background sync process
   */
  startBackgroundSync() {
    if (this.syncInterval) return; // Already running

    this.syncInterval = setInterval(() => {
      this.syncTrackedItems().catch(error => {
        this.logger.error('Background sync failed:', error);
      });
    }, this.syncIntervalMs);

    this.logger.debug('Background sync started');
  }

  /**
   * Stop background sync process
   */
  stopBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.logger.debug('Background sync stopped');
    }
  }

  /**
   * Clear all tracked items for current user
   */
  async clearTrackedItems() {
    const username = await this._getCurrentUsername();
    if (!username) return false;

    const data = this._getStoredData();
    if (data.trackedItems[username]) {
      delete data.trackedItems[username];
      this._saveStoredData(data);
      this.logger.info('All tracked items cleared for user:', username);
      return true;
    }

    return false;
  }

  /**
   * Clear all tracking data (for debugging/testing)
   */
  clearAllData() {
    localStorage.removeItem(this._getStorageKey());
    this.stopBackgroundSync();
    this.logger.info('All tracking data cleared');
  }
}

// Create and export singleton instance
const issueTrackingService = new IssueTrackingService();
export default issueTrackingService;