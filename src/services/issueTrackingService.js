import githubService from './githubService';
import logger from '../utils/logger';
import environmentConfig from '../config/environmentConfig';

/**
 * Issue Tracking Service
 * 
 * Manages tracked issues and pull requests for authenticated users.
 * Stores data in localStorage and syncs with GitHub API when possible.
 */
class IssueTrackingService {
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
   * Get repository filters from localStorage
   */
  _getRepositoryFilters() {
    try {
      const data = localStorage.getItem(this.repositoryFiltersKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      this.logger.error('Failed to parse repository filters:', error);
      return {};
    }
  }

  /**
   * Save repository filters to localStorage
   */
  _saveRepositoryFilters(filters) {
    try {
      localStorage.setItem(this.repositoryFiltersKey, JSON.stringify(filters));
      return true;
    } catch (error) {
      this.logger.error('Failed to save repository filters:', error);
      return false;
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
   * Initialize default repository filters for a user
   */
  async _initializeDefaultFilters(username) {
    const filters = this._getRepositoryFilters();
    
    if (!filters[username]) {
      filters[username] = {};
    }
    
    // Get all tracked repositories
    const repositories = await this.getTrackedRepositories();
    
    // Set default filters for any repositories that don't have explicit settings
    let filtersUpdated = false;
    for (const repo of repositories) {
      if (!filters[username][repo]) {
        if (repo === environmentConfig.getFullRepoName()) {
          // Current repository is visible by default
          filters[username][repo] = { hidden: false };
        } else {
          // All other repositories are hidden by default
          filters[username][repo] = { hidden: true };
        }
        filtersUpdated = true;
      }
    }
    
    if (filtersUpdated) {
      this._saveRepositoryFilters(filters);
    }
  }

  /**
   * Enable filter for a specific DAK repository when user visits it
   */
  async enableDAKRepositoryFilter(dakRepository) {
    const username = await this._getCurrentUsername();
    if (!username || !dakRepository) return false;

    let filters = this._getRepositoryFilters();
    
    if (!filters[username]) {
      // Initialize user filters first
      await this._initializeDefaultFilters(username);
      // Get updated filters after initialization
      filters = this._getRepositoryFilters();
    }
    
    // Ensure user filters exist
    if (!filters[username]) {
      filters[username] = {};
    }
    
    // Only enable the specific DAK repository, don't affect others
    filters[username][dakRepository] = { hidden: false };
    
    return this._saveRepositoryFilters(filters);
  }

  /**
   * Clean up tracked items from non-DAK repositories
   * This removes any previously tracked items from repositories that are not DAKs or the current repository
   */
  async cleanupNonDAKRepositories() {
    const username = await this._getCurrentUsername();
    if (!username) return false;

    const items = await this.getTrackedItems(username);
    let cleaned = false;

    // Check issues
    const validIssues = [];
    for (const issue of items.issues) {
      const isAllowed = await this._isAllowedRepository(issue.repository);
      if (isAllowed) {
        validIssues.push(issue);
      } else {
        this.logger.info(`Removing tracked issue from non-DAK repository: ${issue.repository}#${issue.number}`);
        cleaned = true;
      }
    }

    // Check PRs
    const validPRs = [];
    for (const pr of items.pullRequests) {
      const isAllowed = await this._isAllowedRepository(pr.repository);
      if (isAllowed) {
        validPRs.push(pr);
      } else {
        this.logger.info(`Removing tracked PR from non-DAK repository: ${pr.repository}#${pr.number}`);
        cleaned = true;
      }
    }

    // Save cleaned data if anything was removed
    if (cleaned) {
      const data = this._getStoredData();
      data.trackedItems[username] = {
        issues: validIssues,
        pullRequests: validPRs
      };
      this._saveStoredData(data);
      this.logger.info('Cleaned up tracked items from non-DAK repositories');
    }

    return cleaned;
  }

  /**
   * Get filtered tracked items and ensure cleanup of non-DAK repositories
   */
  async getFilteredTrackedItems(username = null) {
    // First, cleanup any non-DAK repositories
    await this.cleanupNonDAKRepositories();
    
    const items = await this.getTrackedItems(username);
    
    if (!username) {
      username = await this._getCurrentUsername();
      if (!username) return items;
    }

    // Initialize default filters if they don't exist
    await this._initializeDefaultFilters(username);
    
    const filters = this._getRepositoryFilters();
    const userFilters = filters[username] || {};
    
    // For repositories not explicitly in the filter list, apply default behavior:
    // - Current repository is visible by default
    // - all other repositories are hidden by default
    const filteredIssues = items.issues.filter(issue => {
      const repository = issue.repository;
      if (userFilters[repository] !== undefined) {
        // Use explicit filter setting
        return !userFilters[repository].hidden;
      } else {
        // Apply default: only current repository is visible by default
        return repository === environmentConfig.getFullRepoName();
      }
    });
    
    const filteredPRs = items.pullRequests.filter(pr => {
      const repository = pr.repository;
      if (userFilters[repository] !== undefined) {
        // Use explicit filter setting
        return !userFilters[repository].hidden;
      } else {
        // Apply default: only current repository is visible by default
        return repository === environmentConfig.getFullRepoName();
      }
    });

    return {
      issues: filteredIssues,
      pullRequests: filteredPRs
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
      updated_at: issueData.updated_at || issueData.created_at || new Date().toISOString(),
      repository: issueData.repository || environmentConfig.getFullRepoName(),
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
      updated_at: prData.updated_at || prData.created_at || new Date().toISOString(),
      repository: prData.repository || environmentConfig.getFullRepoName(),
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
    const items = await this.getFilteredTrackedItems(username);
    return {
      issues: items.issues.length,
      pullRequests: items.pullRequests.length,
      total: items.issues.length + items.pullRequests.length
    };
  }

  /**
   * Set repository visibility for a user
   */
  async setRepositoryVisibility(repository, hidden = false) {
    const username = await this._getCurrentUsername();
    if (!username) return false;

    const filters = this._getRepositoryFilters();
    
    if (!filters[username]) {
      filters[username] = {};
    }
    
    if (!filters[username][repository]) {
      filters[username][repository] = {};
    }
    
    filters[username][repository].hidden = hidden;
    
    return this._saveRepositoryFilters(filters);
  }

  /**
   * Get repository filters for current user
   */
  async getRepositoryFilters() {
    const username = await this._getCurrentUsername();
    if (!username) return {};

    const filters = this._getRepositoryFilters();
    return filters[username] || {};
  }

  /**
   * Get list of unique repositories from tracked items
   */
  async getTrackedRepositories() {
    const items = await this.getTrackedItems();
    const repositories = new Set();
    
    items.issues.forEach(issue => repositories.add(issue.repository));
    items.pullRequests.forEach(pr => repositories.add(pr.repository));
    
    return Array.from(repositories).sort();
  }

  /**
   * Check if a repository is a DAK or the current repository
   */
  async _isAllowedRepository(repositoryFullName) {
    // Always allow current repository
    if (repositoryFullName === environmentConfig.getFullRepoName()) {
      return true;
    }
    
    // Check if repository is a DAK
    try {
      const [owner, repo] = repositoryFullName.split('/');
      if (!owner || !repo) return false;
      
      const compatibility = await githubService.checkSmartGuidelinesCompatibility(owner, repo);
      return compatibility.compatible;
    } catch (error) {
      this.logger.debug(`Failed to check DAK compatibility for ${repositoryFullName}:`, error);
      return false;
    }
  }

  /**
   * Discover new user activity - issues and PRs created by or commented on by the user
   * Only includes items from DAK repositories or the current repository
   */
  async _discoverUserActivity(username, existingItems) {
    const newIssues = [];
    const newPRs = [];
    
    try {
      // Search for open issues created by the user
      const createdIssuesQuery = `is:issue author:${username} state:open`;
      const createdIssuesResult = await githubService.searchIssues(createdIssuesQuery, { per_page: 50 });
      
      // Search for open issues where user commented
      const commentedIssuesQuery = `is:issue commenter:${username} state:open`;
      const commentedIssuesResult = await githubService.searchIssues(commentedIssuesQuery, { per_page: 50 });
      
      // Search for open PRs created by the user  
      const createdPRsQuery = `is:pr author:${username} state:open`;
      const createdPRsResult = await githubService.searchPullRequests(createdPRsQuery, { per_page: 50 });
      
      // Search for open PRs where user commented
      const commentedPRsQuery = `is:pr commenter:${username} state:open`;
      const commentedPRsResult = await githubService.searchPullRequests(commentedPRsQuery, { per_page: 50 });

      // Combine and deduplicate issues
      const allFoundIssues = [...(createdIssuesResult.items || []), ...(commentedIssuesResult.items || [])];
      const uniqueIssues = this._deduplicateItems(allFoundIssues);
      
      // Combine and deduplicate PRs
      const allFoundPRs = [...(createdPRsResult.items || []), ...(commentedPRsResult.items || [])];
      const uniquePRs = this._deduplicateItems(allFoundPRs);

      // Filter out already tracked issues and check repository compatibility
      for (const issue of uniqueIssues) {
        const isAlreadyTracked = existingItems.issues.some(
          existing => existing.id === issue.id || existing.number === issue.number
        );
        
        if (!isAlreadyTracked) {
          const repositoryFullName = issue.repository ? issue.repository.full_name : 'unknown/unknown';
          
          // Only include issues from DAK repositories or the current repository
          const isAllowed = await this._isAllowedRepository(repositoryFullName);
          if (!isAllowed) {
            this.logger.debug(`Skipping issue from non-DAK repository: ${repositoryFullName}`);
            continue;
          }
          
          const trackedIssue = {
            id: issue.id,
            number: issue.number,
            title: issue.title,
            html_url: issue.html_url,
            created_at: issue.created_at,
            updated_at: issue.updated_at || issue.created_at,
            repository: repositoryFullName,
            state: issue.state,
            labels: issue.labels || [],
            trackedAt: new Date().toISOString(),
            discoveredBy: 'sync'
          };
          newIssues.push(trackedIssue);
        }
      }

      // Filter out already tracked PRs and check repository compatibility
      for (const pr of uniquePRs) {
        const isAlreadyTracked = existingItems.pullRequests.some(
          existing => existing.id === pr.id || existing.number === pr.number
        );
        
        if (!isAlreadyTracked) {
          const repositoryFullName = pr.repository ? pr.repository.full_name : 'unknown/unknown';
          
          // Only include PRs from DAK repositories or the current repository
          const isAllowed = await this._isAllowedRepository(repositoryFullName);
          if (!isAllowed) {
            this.logger.debug(`Skipping PR from non-DAK repository: ${repositoryFullName}`);
            continue;
          }
          
          const trackedPR = {
            id: pr.id,
            number: pr.number,
            title: pr.title,
            html_url: pr.html_url,
            created_at: pr.created_at,
            updated_at: pr.updated_at || pr.created_at,
            repository: repositoryFullName,
            state: pr.state,
            linkedIssues: [],
            trackedAt: new Date().toISOString(),
            discoveredBy: 'sync'
          };
          newPRs.push(trackedPR);
        }
      }

    } catch (error) {
      this.logger.error('Failed to discover user activity:', error);
    }

    return { issues: newIssues, pullRequests: newPRs };
  }

  /**
   * Deduplicate items by ID, keeping the first occurrence
   */
  _deduplicateItems(items) {
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.id)) {
        return false;
      }
      seen.add(item.id);
      return true;
    });
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

      // Search for PRs that mention this issue (exclude merged PRs)
      const searchQuery = `is:pr repo:${owner}/${repo} is:unmerged ${issue.number}`;
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
   * Sync tracked items with GitHub to update their status and discover new user activity
   */
  async syncTrackedItems() {
    if (!githubService.isAuth()) return;

    const username = await this._getCurrentUsername();
    if (!username) return;

    const items = await this.getTrackedItems(username);
    let updated = false;

    // Update existing issue states
    for (const issue of items.issues) {
      try {
        const [owner, repo] = issue.repository.split('/');
        if (!owner || !repo) continue;

        const currentIssue = await githubService.getIssue(owner, repo, issue.number);
        if (currentIssue && currentIssue.state !== issue.state) {
          issue.state = currentIssue.state;
          issue.updated_at = currentIssue.updated_at || issue.updated_at;
          updated = true;
        }
      } catch (error) {
        this.logger.debug(`Failed to sync issue ${issue.number}:`, error);
      }
    }

    // Update existing PR states
    for (const pr of items.pullRequests) {
      try {
        const [owner, repo] = pr.repository.split('/');
        if (!owner || !repo) continue;

        const currentPR = await githubService.getPullRequest(owner, repo, pr.number);
        if (currentPR && currentPR.state !== pr.state) {
          pr.state = currentPR.state;
          pr.updated_at = currentPR.updated_at || pr.updated_at;
          updated = true;
        }
      } catch (error) {
        this.logger.debug(`Failed to sync PR ${pr.number}:`, error);
      }
    }

    // Discover new user activity - look for issues and PRs created by or commented on by the user
    try {
      const newItems = await this._discoverUserActivity(username, items);
      if (newItems.issues.length > 0 || newItems.pullRequests.length > 0) {
        // Add newly discovered items
        items.issues.push(...newItems.issues);
        items.pullRequests.push(...newItems.pullRequests);
        updated = true;
        
        this.logger.info('Discovered new user activity', { 
          newIssues: newItems.issues.length,
          newPRs: newItems.pullRequests.length 
        });
      }
    } catch (error) {
      this.logger.debug('Failed to discover new user activity:', error);
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