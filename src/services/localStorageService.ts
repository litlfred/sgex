/**
 * Service for managing feature file changes in browser localStorage
 * This allows users to edit and save feature files locally without requiring GitHub authentication
 */

interface FileMetadata {
  lastModified: string;
  originalPath: string;
  [key: string]: any; // Allow additional metadata properties
}

interface StorageInfo {
  fileCount: number;
  totalSize: number;
  changesSize: number;
  metadataSize: number;
  formattedSize: string;
}

interface ExportData {
  exported: string;
  version: string;
  changes: Record<string, string>;
  metadata: Record<string, FileMetadata>;
}

class LocalStorageService {
  private readonly storageKey: string;
  private readonly metadataKey: string;

  constructor() {
    this.storageKey = 'sgex_feature_files';
    this.metadataKey = 'sgex_feature_files_metadata';
  }

  /**
   * Get all locally stored feature file changes
   * @returns Object with file paths as keys and content as values
   */
  getAllLocalChanges(): Record<string, string> {
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
   * @param filePath - The file path
   * @returns The stored content or null if not found
   */
  getLocalContent(filePath: string): string | null {
    const changes = this.getAllLocalChanges();
    return changes[filePath] || null;
  }

  /**
   * Save feature file content to localStorage
   * @param filePath - The file path
   * @param content - The file content
   * @param metadata - Additional metadata (repository, branch, etc.)
   */
  saveLocal(filePath: string, content: string, metadata: Record<string, any> = {}): boolean {
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
   * @param filePath - The file path
   */
  removeLocal(filePath: string): boolean {
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
   * @returns Metadata object
   */
  getAllMetadata(): Record<string, FileMetadata> {
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
   * @param filePath - The file path
   * @returns The metadata or null if not found
   */
  getMetadata(filePath: string): FileMetadata | null {
    const metadata = this.getAllMetadata();
    return metadata[filePath] || null;
  }

  /**
   * Check if there are any local changes
   * @returns True if there are local changes
   */
  hasLocalChanges(): boolean {
    const changes = this.getAllLocalChanges();
    return Object.keys(changes).length > 0;
  }

  /**
   * Get the number of locally changed files
   * @returns Number of files with local changes
   */
  getLocalChangesCount(): number {
    const changes = this.getAllLocalChanges();
    return Object.keys(changes).length;
  }

  /**
   * Export local changes as a downloadable file
   * @param format - Export format ('json' or 'zip')
   * @returns The export data as a Blob
   */
  exportLocalChanges(format: string = 'json'): Blob {
    const changes = this.getAllLocalChanges();
    const metadata = this.getAllMetadata();

    if (format === 'json') {
      const exportData: ExportData = {
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
   * @param jsonData - The exported JSON data
   * @returns True if import was successful
   */
  importLocalChanges(jsonData: string): boolean {
    try {
      const importData: ExportData = JSON.parse(jsonData);
      
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
  clearAllLocalChanges(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.metadataKey);
  }

  /**
   * Get storage usage information
   * @returns Storage usage stats
   */
  getStorageInfo(): StorageInfo {
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
   * @param bytes - Number of bytes
   * @returns Formatted string
   */
  formatBytes(bytes: number): string {
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