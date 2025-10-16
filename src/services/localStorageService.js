/**
 * Service for managing feature file changes in browser localStorage
 * This allows users to edit and save feature files locally without requiring GitHub authentication
 */

class LocalStorageService {
  constructor() {
    this.storageKey = 'sgex_feature_files';
    this.metadataKey = 'sgex_feature_files_metadata';
  }

  /**
   * Get all locally stored feature file changes
   * @returns {Object} Object with file paths as keys and content as values
   */
  getAllLocalChanges() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading local changes:', error);
      return {};
    }
  }

  /**
   * Get locally stored content for a specific file
   * @param {string} filePath - The file path
   * @returns {string|null} The stored content or null if not found
   */
  getLocalContent(filePath) {
    const changes = this.getAllLocalChanges();
    return changes[filePath] || null;
  }

  /**
   * Save feature file content to localStorage
   * @param {string} filePath - The file path
   * @param {string} content - The file content
   * @param {Object} metadata - Additional metadata (repository, branch, etc.)
   */
  saveLocal(filePath, content, metadata = {}) {
    try {
      // Save the content
      const changes = this.getAllLocalChanges();
      changes[filePath] = content;
      localStorage.setItem(this.storageKey, JSON.stringify(changes));

      // Save metadata
      const allMetadata = this.getAllMetadata();
      allMetadata[filePath] = {
        ...metadata,
        lastModified: new Date().toISOString(),
        originalPath: filePath
      };
      localStorage.setItem(this.metadataKey, JSON.stringify(allMetadata));

      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  /**
   * Remove locally stored content for a file
   * @param {string} filePath - The file path
   */
  removeLocal(filePath) {
    try {
      const changes = this.getAllLocalChanges();
      delete changes[filePath];
      localStorage.setItem(this.storageKey, JSON.stringify(changes));

      const metadata = this.getAllMetadata();
      delete metadata[filePath];
      localStorage.setItem(this.metadataKey, JSON.stringify(metadata));

      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  /**
   * Get metadata for all locally stored files
   * @returns {Object} Metadata object
   */
  getAllMetadata() {
    try {
      const data = localStorage.getItem(this.metadataKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading metadata:', error);
      return {};
    }
  }

  /**
   * Get metadata for a specific file
   * @param {string} filePath - The file path
   * @returns {Object|null} The metadata or null if not found
   */
  getMetadata(filePath) {
    const metadata = this.getAllMetadata();
    return metadata[filePath] || null;
  }

  /**
   * Check if there are any local changes
   * @returns {boolean} True if there are local changes
   */
  hasLocalChanges() {
    const changes = this.getAllLocalChanges();
    return Object.keys(changes).length > 0;
  }

  /**
   * Get the number of locally changed files
   * @returns {number} Number of files with local changes
   */
  getLocalChangesCount() {
    const changes = this.getAllLocalChanges();
    return Object.keys(changes).length;
  }

  /**
   * Export local changes as a downloadable file
   * @param {string} format - Export format ('json' or 'zip')
   * @returns {Blob} The export data as a Blob
   */
  exportLocalChanges(format = 'json') {
    const changes = this.getAllLocalChanges();
    const metadata = this.getAllMetadata();

    if (format === 'json') {
      const exportData = {
        exported: new Date().toISOString(),
        version: '1.0',
        changes,
        metadata
      };
      
      return new Blob(
        [JSON.stringify(exportData, null, 2)], 
        { type: 'application/json' }
      );
    }

    // For future expansion - could support ZIP format with individual files
    throw new Error(`Export format '${format}' not supported`);
  }

  /**
   * Import local changes from exported data
   * @param {string} jsonData - The exported JSON data
   * @returns {boolean} True if import was successful
   */
  importLocalChanges(jsonData) {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.changes || !importData.metadata) {
        throw new Error('Invalid import data format');
      }

      // Merge with existing data
      const existingChanges = this.getAllLocalChanges();
      const existingMetadata = this.getAllMetadata();

      const mergedChanges = { ...existingChanges, ...importData.changes };
      const mergedMetadata = { ...existingMetadata, ...importData.metadata };

      localStorage.setItem(this.storageKey, JSON.stringify(mergedChanges));
      localStorage.setItem(this.metadataKey, JSON.stringify(mergedMetadata));

      return true;
    } catch (error) {
      console.error('Error importing local changes:', error);
      return false;
    }
  }

  /**
   * Clear all local changes
   */
  clearAllLocalChanges() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.metadataKey);
  }

  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getStorageInfo() {
    const changes = this.getAllLocalChanges();
    const metadata = this.getAllMetadata();
    
    const changesSize = JSON.stringify(changes).length;
    const metadataSize = JSON.stringify(metadata).length;
    const totalSize = changesSize + metadataSize;

    return {
      fileCount: Object.keys(changes).length,
      totalSize,
      changesSize,
      metadataSize,
      formattedSize: this.formatBytes(totalSize)
    };
  }

  /**
   * Format bytes into human readable string
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create and export a singleton instance
const localStorageService = new LocalStorageService();
export default localStorageService;