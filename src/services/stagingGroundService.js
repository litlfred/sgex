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
   * Rename a file in the staging ground
   * @param {string} oldPath - Current file path
   * @param {string} newPath - New file path
   * @returns {boolean} Success indicator
   */
  renameFile(oldPath, newPath) {
    try {
      const stagingGround = this.getStagingGround();
      
      // Find the file to rename
      const fileIndex = stagingGround.files.findIndex(f => f.path === oldPath);
      if (fileIndex === -1) {
        throw new Error(`File not found in staging ground: ${oldPath}`);
      }

      // Check if new path already exists
      const existingFileIndex = stagingGround.files.findIndex(f => f.path === newPath);
      if (existingFileIndex >= 0) {
        throw new Error(`File already exists at destination: ${newPath}`);
      }

      // Update the file path
      const file = stagingGround.files[fileIndex];
      const renamedFile = {
        ...file,
        path: newPath,
        metadata: {
          ...file.metadata,
          lastModified: Date.now(),
          originalPath: oldPath,
          isRenamed: true
        },
        timestamp: Date.now()
      };

      stagingGround.files[fileIndex] = renamedFile;

      const success = this.saveStagingGround(stagingGround);
      
      if (success) {
        console.log(`File renamed from ${oldPath} to ${newPath}`);
      }
      
      return success;
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    }
  }

  /**
   * Get renamed files information
   * @returns {Array} Array of files that have been renamed
   */
  getRenamedFiles() {
    const stagingGround = this.getStagingGround();
    return stagingGround.files.filter(file => file.metadata?.isRenamed);
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
   * Check if staging ground has changes
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
   * Clear all changes in staging ground
   */
  clearStagingGround() {
    const empty = this.createEmptyStagingGround();
    return this.saveStagingGround(empty);
  }

  /**
   * Save current state to history for rollback
   */
  saveToHistory(stagingGround) {
    try {
      const historyKey = `${this.getStorageKey()}_history`;
      const history = this.getHistory();
      
      // Add current state to history
      history.push({
        ...stagingGround,
        savedAt: Date.now()
      });

      // Keep only last 10 saves
      const recentHistory = history.slice(-10);
      localStorage.setItem(historyKey, JSON.stringify(recentHistory));
      
    } catch (error) {
      console.warn('Error saving to history:', error);
    }
  }

  /**
   * Get history of saves
   */
  getHistory() {
    try {
      const historyKey = `${this.getStorageKey()}_history`;
      const stored = localStorage.getItem(historyKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error reading history:', error);
      return [];
    }
  }

  /**
   * Rollback to a previous save
   */
  rollbackToSave(timestamp) {
    const history = this.getHistory();
    const save = history.find(s => s.savedAt === timestamp);
    
    if (!save) {
      throw new Error('Save not found in history');
    }

    // Remove the savedAt timestamp before restoring
    const { savedAt, ...stagingGroundState } = save;
    return this.saveStagingGround(stagingGroundState);
  }

  /**
   * Export staging ground state for backup/sharing
   */
  exportStagingGround() {
    const stagingGround = this.getStagingGround();
    const history = this.getHistory();
    
    return {
      current: stagingGround,
      history: history,
      exportedAt: Date.now(),
      repository: this.currentRepository?.full_name,
      branch: this.currentBranch
    };
  }

  /**
   * Import staging ground state from backup
   */
  importStagingGround(exportedData) {
    if (!exportedData.current || !exportedData.repository || !exportedData.branch) {
      throw new Error('Invalid export data format');
    }

    if (exportedData.repository !== this.currentRepository?.full_name ||
        exportedData.branch !== this.currentBranch) {
      throw new Error('Export data is for different repository or branch');
    }

    // Save current state and import new one
    this.saveStagingGround(exportedData.current);
    
    // Import history if available
    if (exportedData.history) {
      try {
        const historyKey = `${this.getStorageKey()}_history`;
        localStorage.setItem(historyKey, JSON.stringify(exportedData.history));
      } catch (error) {
        console.warn('Error importing history:', error);
      }
    }

    return true;
  }

  /**
   * Clean up old staging grounds and history
   */
  cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    try {
      const now = Date.now();
      const keysToRemove = [];

      // Check all localStorage keys for old staging grounds
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