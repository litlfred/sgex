/**
 * Staging Ground Service
 * 
 * Manages local changes to DAK components before they are committed to GitHub.
 * Provides persistent storage, versioning, and integration interfaces for DAK editing tools.
 * 
 * @module stagingGroundService
 */

/**
 * File metadata
 * @example { "lastModified": 1697486400000, "source": "bpmn-editor" }
 */
export interface FileMetadata {
  /** Last modification timestamp */
  lastModified: number;
  /** Source tool that modified the file */
  source?: string;
  /** When file was contributed */
  contributedAt?: number;
  /** Additional metadata */
  [key: string]: any;
}

/**
 * Staged file
 * @example { "path": "input/cql/logic.cql", "content": "library Logic", "timestamp": 1697486400000 }
 */
export interface StagedFile {
  /** File path relative to repository root */
  path: string;
  /** File content */
  content: string;
  /** File metadata */
  metadata: FileMetadata;
  /** Timestamp when file was staged */
  timestamp: number;
}

/**
 * Repository information
 * @example { "full_name": "who/anc-dak" }
 */
export interface RepositoryInfo {
  /** Full repository name (owner/repo) */
  full_name: string;
  /** Additional repository properties */
  [key: string]: any;
}

/**
 * Staging ground state
 * @example { "message": "Update logic", "files": [], "timestamp": 1697486400000, "branch": "main" }
 */
export interface StagingGround {
  /** Commit message */
  message: string;
  /** Staged files */
  files: StagedFile[];
  /** Last update timestamp */
  timestamp: number;
  /** Branch name */
  branch: string | null;
  /** Repository name */
  repository: string | null;
}

/**
 * Historical staging ground save
 */
export interface HistoricalSave extends StagingGround {
  /** When this save was created */
  savedAt: number;
}

/**
 * Exported staging ground data
 * @example { "current": {}, "history": [], "exportedAt": 1697486400000 }
 */
export interface ExportedStagingGround {
  /** Current staging ground state */
  current: StagingGround;
  /** History of saves */
  history: HistoricalSave[];
  /** Export timestamp */
  exportedAt: number;
  /** Repository name */
  repository: string | null;
  /** Branch name */
  branch: string | null;
}

/**
 * File contribution result
 */
export interface FileContributionResult {
  /** File path */
  path: string;
  /** Whether contribution succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Batch contribution result
 */
export interface ContributionResult {
  /** Overall success status */
  success: boolean;
  /** Individual file results */
  results: FileContributionResult[];
}

/**
 * Staging ground status
 * @example { "hasChanges": true, "filesCount": 3, "lastModified": 1697486400000 }
 */
export interface StagingGroundStatus {
  /** Whether there are staged changes */
  hasChanges: boolean;
  /** Number of staged files */
  filesCount: number;
  /** Last modification timestamp */
  lastModified: number;
  /** Current branch */
  branch: string | null;
  /** Current repository */
  repository: string | null;
}

/**
 * Staging ground listener callback
 */
export type StagingGroundListener = (stagingGround: StagingGround) => void;

/**
 * Unsubscribe function
 */
export type UnsubscribeFunction = () => void;

/**
 * Staging Ground Service class
 * 
 * Manages local staging of DAK file changes.
 * 
 * @openapi
 * components:
 *   schemas:
 *     StagedFile:
 *       type: object
 *       properties:
 *         path:
 *           type: string
 *         content:
 *           type: string
 *         timestamp:
 *           type: number
 *     StagingGround:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         files:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StagedFile'
 *         timestamp:
 *           type: number
 */
class StagingGroundService {
  private listeners: Set<StagingGroundListener>;
  private currentRepository: RepositoryInfo | null;
  private currentBranch: string | null;

  constructor() {
    this.listeners = new Set();
    this.currentRepository = null;
    this.currentBranch = null;
  }

  /**
   * Initialize staging ground for a specific repository and branch
   */
  initialize(repository: RepositoryInfo, branch: string): void {
    this.currentRepository = repository;
    this.currentBranch = branch;
    this.notifyListeners();
  }

  /**
   * Get the storage key for current repository and branch
   */
  getStorageKey(): string {
    if (!this.currentRepository || !this.currentBranch) {
      throw new Error('Staging ground not initialized');
    }
    return `sgex_staging_${this.currentRepository.full_name}_${this.currentBranch}`;
  }

  /**
   * Get current staging ground state
   * 
   * @openapi
   * /api/staging-ground:
   *   get:
   *     summary: Get staging ground state
   *     responses:
   *       200:
   *         description: Staging ground state
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StagingGround'
   */
  getStagingGround(): StagingGround {
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
  createEmptyStagingGround(): StagingGround {
    return {
      message: '',
      files: [],
      timestamp: Date.now(),
      branch: this.currentBranch,
      repository: this.currentRepository?.full_name || null
    };
  }

  /**
   * Save staging ground state to localStorage
   */
  saveStagingGround(stagingGround: StagingGround): boolean {
    try {
      const key = this.getStorageKey();
      stagingGround.timestamp = Date.now();
      stagingGround.branch = this.currentBranch;
      stagingGround.repository = this.currentRepository?.full_name || null;
      
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
  updateFile(filePath: string, content: string, metadata: Partial<FileMetadata> = {}): boolean {
    const stagingGround = this.getStagingGround();
    
    // Find existing file or create new one
    const existingFileIndex = stagingGround.files.findIndex(f => f.path === filePath);
    const fileObject: StagedFile = {
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
  removeFile(filePath: string): boolean {
    const stagingGround = this.getStagingGround();
    stagingGround.files = stagingGround.files.filter(f => f.path !== filePath);
    return this.saveStagingGround(stagingGround);
  }

  /**
   * Update commit message
   */
  updateCommitMessage(message: string): boolean {
    const stagingGround = this.getStagingGround();
    stagingGround.message = message;
    return this.saveStagingGround(stagingGround);
  }

  /**
   * Check if staging ground has changes
   */
  hasChanges(): boolean {
    const stagingGround = this.getStagingGround();
    return stagingGround.files.length > 0;
  }

  /**
   * Get count of changed files
   */
  getChangedFilesCount(): number {
    const stagingGround = this.getStagingGround();
    return stagingGround.files.length;
  }

  /**
   * Clear all changes in staging ground
   */
  clearStagingGround(): boolean {
    const empty = this.createEmptyStagingGround();
    return this.saveStagingGround(empty);
  }

  /**
   * Save current state to history for rollback
   */
  saveToHistory(stagingGround: StagingGround): void {
    try {
      const historyKey = `${this.getStorageKey()}_history`;
      const history = this.getHistory();
      
      // Add current state to history
      const historicalSave: HistoricalSave = {
        ...stagingGround,
        savedAt: Date.now()
      };
      history.push(historicalSave);

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
  getHistory(): HistoricalSave[] {
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
  rollbackToSave(timestamp: number): boolean {
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
  exportStagingGround(): ExportedStagingGround {
    const stagingGround = this.getStagingGround();
    const history = this.getHistory();
    
    return {
      current: stagingGround,
      history: history,
      exportedAt: Date.now(),
      repository: this.currentRepository?.full_name || null,
      branch: this.currentBranch
    };
  }

  /**
   * Import staging ground state from backup
   */
  importStagingGround(exportedData: ExportedStagingGround): boolean {
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
  cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): number { // 7 days default
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      // Check all localStorage keys for old staging grounds
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sgex_staging_')) {
          try {
            const dataStr = localStorage.getItem(key);
            if (dataStr) {
              const data = JSON.parse(dataStr);
              if (data.timestamp && (now - data.timestamp) > maxAge) {
                keysToRemove.push(key);
                keysToRemove.push(`${key}_history`);
              }
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
  addListener(callback: StagingGroundListener): UnsubscribeFunction {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
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
  contributeFiles(files: StagedFile | StagedFile[], metadata: Partial<FileMetadata> = {}): ContributionResult {
    const fileArray = Array.isArray(files) ? files : [files];

    let success = true;
    const results: FileContributionResult[] = [];

    fileArray.forEach(file => {
      if (!file.path || !file.content) {
        results.push({ path: file.path, success: false, error: 'Missing path or content' });
        success = false;
        return;
      }

      const result = this.updateFile(file.path, file.content, {
        ...metadata,
        source: (metadata as any).tool || 'unknown',
        contributedAt: Date.now()
      });

      results.push({ path: file.path, success: result });
      if (!result) success = false;
    });

    return { success, results };
  }

  /**
   * Get status for DAK editing tools
   * 
   * @openapi
   * /api/staging-ground/status:
   *   get:
   *     summary: Get staging ground status
   *     responses:
   *       200:
   *         description: Staging ground status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 hasChanges:
   *                   type: boolean
   *                 filesCount:
   *                   type: number
   */
  getStatus(): StagingGroundStatus {
    const stagingGround = this.getStagingGround();
    return {
      hasChanges: this.hasChanges(),
      filesCount: this.getChangedFilesCount(),
      lastModified: stagingGround.timestamp,
      branch: this.currentBranch,
      repository: this.currentRepository?.full_name || null
    };
  }
}

// Create singleton instance
const stagingGroundService = new StagingGroundService();

export default stagingGroundService;
