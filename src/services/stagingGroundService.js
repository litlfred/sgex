/**
 * Staging Ground Service
 * 
 * Manages local changes to DAK components before they are committed to GitHub.
 * Provides persistent storage, versioning, and integration interfaces for DAK editing tools.
 */

class StagingGroundService {
  constructor() {
    this.listeners = new Set();
    this.currentRepository = null;
    this.currentBranch = null;
  }

  /**
   * Initialize staging ground for a specific repository and branch
   */
  initialize(repository, branch) {
    this.currentRepository = repository;
    this.currentBranch = branch;
    this.notifyListeners();
  }

  /**
   * Get the storage key for current repository and branch
   */
  getStorageKey() {
    if (!this.currentRepository || !this.currentBranch) {
      throw new Error('Staging ground not initialized');
    }
    return `sgex_staging_${this.currentRepository.full_name}_${this.currentBranch}`;
  }

  /**
   * Get current staging ground state
   */
  getStagingGround() {
    try {
      const key = this.getStorageKey();
      const stored = localStorage.getItem(key);
      if (!stored) {
        return this.createEmptyStagingGround();
      }
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Error reading staging ground from localStorage:', error);
      return this.createEmptyStagingGround();
    }
  }

  /**
   * Create empty staging ground structure
   */
  createEmptyStagingGround() {
    return {
      message: '',
      files: [],
      timestamp: Date.now(),
      branch: this.currentBranch,
      repository: this.currentRepository?.full_name
    };
  }

  /**
   * Save staging ground state to localStorage
   */
  saveStagingGround(stagingGround) {
    try {
      const key = this.getStorageKey();
      stagingGround.timestamp = Date.now();
      stagingGround.branch = this.currentBranch;
      stagingGround.repository = this.currentRepository?.full_name;
      
      localStorage.setItem(key, JSON.stringify(stagingGround));
      this.saveToHistory(stagingGround);
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error saving staging ground to localStorage:', error);
      return false;
    }
  }

  /**
   * Add or update a file in the staging ground
   */
  updateFile(filePath, content, metadata = {}) {
    const stagingGround = this.getStagingGround();
    
    // Find existing file or create new one
    const existingFileIndex = stagingGround.files.findIndex(f => f.path === filePath);
    const fileObject = {
      path: filePath,
      content: content,
      metadata: {
        ...metadata,
        lastModified: Date.now()
      },
      timestamp: Date.now()
    };

    if (existingFileIndex >= 0) {
      stagingGround.files[existingFileIndex] = fileObject;
    } else {
      stagingGround.files.push(fileObject);
    }

    return this.saveStagingGround(stagingGround);
  }

  /**
   * Remove a file from the staging ground
   */
  removeFile(filePath) {
    const stagingGround = this.getStagingGround();
    stagingGround.files = stagingGround.files.filter(f => f.path !== filePath);
    return this.saveStagingGround(stagingGround);
  }

  /**
   * Update commit message
   */
  updateCommitMessage(message) {
    const stagingGround = this.getStagingGround();
    stagingGround.message = message;
    return this.saveStagingGround(stagingGround);
  }

  /**
   * Check if there are any changes in staging ground
   */
  hasChanges() {
    const stagingGround = this.getStagingGround();
    return stagingGround.files.length > 0;
  }

  /**
   * Get count of changed files
   */
  getChangedFilesCount() {
    const stagingGround = this.getStagingGround();
    return stagingGround.files.length;
  }

  /**
   * Clear all changes
   */
  clearChanges() {
    const stagingGround = this.createEmptyStagingGround();
    return this.saveStagingGround(stagingGround);
  }

  /**
   * Save to history for potential recovery
   */
  saveToHistory(stagingGround) {
    try {
      const historyKey = `${this.getStorageKey()}_history`;
      let history = [];
      
      try {
        const existingHistory = localStorage.getItem(historyKey);
        if (existingHistory) {
          history = JSON.parse(existingHistory);
        }
      } catch (error) {
        console.warn('Error reading staging ground history:', error);
      }

      // Add current state to history
      history.unshift({
        ...stagingGround,
        savedAt: Date.now()
      });

      // Keep only last 10 states
      history = history.slice(0, 10);

      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.warn('Error saving staging ground history:', error);
    }
  }

  /**
   * Get history of staging ground states
   */
  getHistory() {
    try {
      const historyKey = `${this.getStorageKey()}_history`;
      const stored = localStorage.getItem(historyKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error reading staging ground history:', error);
      return [];
    }
  }

  /**
   * Restore from a specific history state
   */
  restoreFromHistory(historyIndex) {
    const history = this.getHistory();
    if (historyIndex >= 0 && historyIndex < history.length) {
      const historicalState = history[historyIndex];
      return this.saveStagingGround({
        message: historicalState.message,
        files: historicalState.files,
        timestamp: Date.now(),
        branch: this.currentBranch,
        repository: this.currentRepository?.full_name
      });
    }
    return false;
  }

  /**
   * Export staging ground as JSON for backup/sharing
   */
  exportStagingGround() {
    const stagingGround = this.getStagingGround();
    return JSON.stringify(stagingGround, null, 2);
  }

  /**
   * Import staging ground from JSON
   */
  importStagingGround(jsonData) {
    try {
      const importedData = JSON.parse(jsonData);
      if (importedData.files && Array.isArray(importedData.files)) {
        return this.saveStagingGround({
          message: importedData.message || '',
          files: importedData.files,
          timestamp: Date.now(),
          branch: this.currentBranch,
          repository: this.currentRepository?.full_name
        });
      }
      return false;
    } catch (error) {
      console.error('Error importing staging ground:', error);
      return false;
    }
  }

  /**
   * Clean up old staging ground data (call periodically)
   */
  cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    try {
      const now = Date.now();
      const keysToRemove = [];

      // Scan all localStorage keys for staging ground data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sgex_staging_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.timestamp && (now - data.timestamp) > maxAge) {
              keysToRemove.push(key);
              keysToRemove.push(`${key}_history`);
            }
          } catch (error) {
            // Invalid data, mark for removal
            keysToRemove.push(key);
          }
        }
      }

      // Remove old entries
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      return keysToRemove.length;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return 0;
    }
  }

  /**
   * Add listener for staging ground changes
   */
  addListener(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    const stagingGround = this.getStagingGround();
    this.listeners.forEach(callback => {
      try {
        callback(stagingGround);
      } catch (error) {
        console.error('Error in staging ground listener:', error);
      }
    });
  }

  /**
   * Interface for DAK editing tools to contribute files
   */
  contributeFiles(files, metadata = {}) {
    if (!Array.isArray(files)) {
      files = [files];
    }

    let success = true;
    const results = [];

    files.forEach(file => {
      if (!file.path || !file.content) {
        results.push({ path: file.path, success: false, error: 'Missing path or content' });
        success = false;
        return;
      }

      const result = this.updateFile(file.path, file.content, {
        ...metadata,
        source: metadata.tool || 'unknown',
        contributedAt: Date.now()
      });

      results.push({ path: file.path, success: result });
      if (!result) success = false;
    });

    return { success, results };
  }

  /**
   * Get status for DAK editing tools
   */
  getStatus() {
    const stagingGround = this.getStagingGround();
    return {
      hasChanges: this.hasChanges(),
      filesCount: this.getChangedFilesCount(),
      lastModified: stagingGround.timestamp,
      branch: this.currentBranch,
      repository: this.currentRepository?.full_name
    };
  }
}

// Create singleton instance
const stagingGroundService = new StagingGroundService();

export default stagingGroundService;