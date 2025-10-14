/**
 * Service for managing feature file changes in browser localStorage
 * This allows users to edit and save feature files locally without requiring GitHub authentication
 */

/**
 * Local changes mapping file paths to content
 * @example { "/path/to/file.bpmn": "<?xml version...", "/path/to/file2.dmn": "<?xml..." }
 */
export interface LocalChanges {
  [filePath: string]: string;
}

/**
 * Metadata for a locally stored file
 * @example { "repository": "who/anc-dak", "branch": "main", "lastModified": 1234567890, "author": "user" }
 */
export interface FileMetadata {
  /** Repository identifier (owner/name) */
  repository?: string;
  /** Branch name */
  branch?: string;
  /** Last modification timestamp */
  lastModified?: number;
  /** Author information */
  author?: string;
  /** File size in bytes */
  size?: number;
  /** File type */
  fileType?: string;
}

/**
 * All metadata mapping file paths to metadata
 * @example { "/path/to/file.bpmn": { "repository": "who/anc-dak", "branch": "main", "lastModified": 1234567890 } }
 */
export interface AllMetadata {
  [filePath: string]: FileMetadata;
}

/**
 * Service for managing local storage of feature files
 */
class LocalStorageService {
  private readonly storageKey: string = 'sgex_feature_files';
  private readonly metadataKey: string = 'sgex_feature_files_metadata';

  /**
   * Get all locally stored feature file changes
   * @returns Object with file paths as keys and content as values
   * @example
   * const changes = service.getAllLocalChanges();
   * // Returns: { "/path/to/file.bpmn": "<?xml version..." }
   */
  getAllLocalChanges(): LocalChanges {
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
   * @example
   * const content = service.getLocalContent("/path/to/file.bpmn");
   * // Returns: "<?xml version..." or null
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
   * @example
   * service.saveLocal("/path/to/file.bpmn", "<?xml version...", { repository: "who/anc-dak", branch: "main" });
   */
  saveLocal(filePath: string, content: string, metadata: FileMetadata = {}): void {
    try {
      // Save the content
      const changes = this.getAllLocalChanges();
      changes[filePath] = content;
      localStorage.setItem(this.storageKey, JSON.stringify(changes));

      // Save metadata
      const allMetadata = this.getAllMetadata();
      allMetadata[filePath] = {
        ...metadata,
        lastModified: Date.now(),
        size: content.length
      };
      localStorage.setItem(this.metadataKey, JSON.stringify(allMetadata));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  /**
   * Remove a file from localStorage
   * @param filePath - The file path to remove
   * @returns true if file was removed, false otherwise
   * @example
   * const removed = service.removeLocal("/path/to/file.bpmn");
   */
  removeLocal(filePath: string): boolean {
    try {
      // Remove content
      const changes = this.getAllLocalChanges();
      if (!(filePath in changes)) {
        return false;
      }
      delete changes[filePath];
      localStorage.setItem(this.storageKey, JSON.stringify(changes));

      // Remove metadata
      const allMetadata = this.getAllMetadata();
      if (filePath in allMetadata) {
        delete allMetadata[filePath];
        localStorage.setItem(this.metadataKey, JSON.stringify(allMetadata));
      }

      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  /**
   * Get metadata for a specific file
   * @param filePath - The file path
   * @returns File metadata or null if not found
   * @example
   * const metadata = service.getMetadata("/path/to/file.bpmn");
   * // Returns: { repository: "who/anc-dak", branch: "main", lastModified: 1234567890 }
   */
  getMetadata(filePath: string): FileMetadata | null {
    const allMetadata = this.getAllMetadata();
    return allMetadata[filePath] || null;
  }

  /**
   * Get all metadata
   * @returns Object mapping file paths to metadata
   * @private
   */
  private getAllMetadata(): AllMetadata {
    try {
      const data = localStorage.getItem(this.metadataKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading metadata:', error);
      return {};
    }
  }

  /**
   * Check if a file has local changes
   * @param filePath - The file path to check
   * @returns true if file has local changes, false otherwise
   * @example
   * const hasChanges = service.hasLocalChanges("/path/to/file.bpmn");
   */
  hasLocalChanges(filePath: string): boolean {
    const changes = this.getAllLocalChanges();
    return filePath in changes;
  }

  /**
   * Get count of locally stored files
   * @returns Number of files with local changes
   * @example
   * const count = service.getLocalChangesCount();
   * // Returns: 3
   */
  getLocalChangesCount(): number {
    const changes = this.getAllLocalChanges();
    return Object.keys(changes).length;
  }

  /**
   * Clear all local changes
   * @example
   * service.clearAllLocal();
   */
  clearAllLocal(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.metadataKey);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Get all file paths with local changes
   * @returns Array of file paths
   * @example
   * const paths = service.getLocalFilePaths();
   * // Returns: ["/path/to/file1.bpmn", "/path/to/file2.dmn"]
   */
  getLocalFilePaths(): string[] {
    const changes = this.getAllLocalChanges();
    return Object.keys(changes);
  }

  /**
   * Export all local changes as JSON string
   * @returns JSON string of all local changes and metadata
   * @example
   * const exported = service.exportLocalChanges();
   */
  exportLocalChanges(): string {
    const changes = this.getAllLocalChanges();
    const metadata = this.getAllMetadata();
    return JSON.stringify({ changes, metadata }, null, 2);
  }

  /**
   * Import local changes from JSON string
   * @param jsonData - JSON string containing changes and metadata
   * @throws Error if JSON is invalid
   * @example
   * service.importLocalChanges(jsonData);
   */
  importLocalChanges(jsonData: string): void {
    try {
      const { changes, metadata } = JSON.parse(jsonData);
      localStorage.setItem(this.storageKey, JSON.stringify(changes));
      localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error importing local changes:', error);
      throw new Error('Invalid JSON data for import');
    }
  }
}

// Export singleton instance
const localStorageService = new LocalStorageService();
export default localStorageService;
