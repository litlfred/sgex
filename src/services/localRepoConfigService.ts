/**
 * Local Repository Configuration Service
 * 
 * Manages configuration settings for local repository access
 */

import logger from '../utils/logger';

interface LocalRepoConfig {
  selectedDirectory?: string;
  lastUsedDirectories: string[];
  autoScanOnStartup: boolean;
  maxScanDepth: number;
  preferredServiceType: 'github' | 'local';
  fileSystemAccessPermissions?: boolean;
}

interface LocalRepoPreferences {
  showDAKBadges: boolean;
  autoValidateDAKs: boolean;
  cacheDiscoveredRepos: boolean;
  enableGitOperations: boolean;
  defaultBranch: string;
}

class LocalRepoConfigService {
  private readonly CONFIG_KEY = 'sgex_local_repo_config';
  private readonly PREFERENCES_KEY = 'sgex_local_repo_preferences';
  private readonly logger: any;
  private config: LocalRepoConfig;
  private preferences: LocalRepoPreferences;

  constructor() {
    this.logger = logger.getLogger('LocalRepoConfigService');
    this.config = this.loadConfig();
    this.preferences = this.loadPreferences();
    this.logger.debug('LocalRepoConfigService initialized', { 
      configExists: !!this.config,
      preferencesExists: !!this.preferences 
    });
  }

  private getDefaultConfig(): LocalRepoConfig {
    return {
      lastUsedDirectories: [],
      autoScanOnStartup: false,
      maxScanDepth: 3,
      preferredServiceType: 'github'
    };
  }

  private getDefaultPreferences(): LocalRepoPreferences {
    return {
      showDAKBadges: true,
      autoValidateDAKs: true,
      cacheDiscoveredRepos: true,
      enableGitOperations: true,
      defaultBranch: 'main'
    };
  }

  private loadConfig(): LocalRepoConfig {
    try {
      const stored = localStorage.getItem(this.CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultConfig(), ...parsed };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to load local repo config', { error: errorMessage });
    }
    return this.getDefaultConfig();
  }

  private loadPreferences(): LocalRepoPreferences {
    try {
      const stored = localStorage.getItem(this.PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.getDefaultPreferences(), ...parsed };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to load local repo preferences', { error: errorMessage });
    }
    return this.getDefaultPreferences();
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
      this.logger.debug('Local repo config saved');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to save local repo config', { error: errorMessage });
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(this.preferences));
      this.logger.debug('Local repo preferences saved');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to save local repo preferences', { error: errorMessage });
    }
  }

  // Configuration getters
  getConfig(): LocalRepoConfig {
    return { ...this.config };
  }

  getPreferences(): LocalRepoPreferences {
    return { ...this.preferences };
  }

  getSelectedDirectory(): string | undefined {
    return this.config.selectedDirectory;
  }

  getLastUsedDirectories(): string[] {
    return [...this.config.lastUsedDirectories];
  }

  getPreferredServiceType(): 'github' | 'local' {
    return this.config.preferredServiceType;
  }

  getMaxScanDepth(): number {
    return this.config.maxScanDepth;
  }

  shouldAutoScanOnStartup(): boolean {
    return this.config.autoScanOnStartup;
  }

  // Configuration setters
  setSelectedDirectory(directory: string): void {
    this.logger.debug('Setting selected directory', { directory });
    this.config.selectedDirectory = directory;
    this.addToLastUsedDirectories(directory);
    this.saveConfig();
  }

  addToLastUsedDirectories(directory: string): void {
    if (!this.config.lastUsedDirectories.includes(directory)) {
      this.config.lastUsedDirectories.unshift(directory);
      // Keep only last 10 directories
      this.config.lastUsedDirectories = this.config.lastUsedDirectories.slice(0, 10);
      this.saveConfig();
    }
  }

  setPreferredServiceType(serviceType: 'github' | 'local'): void {
    this.logger.debug('Setting preferred service type', { serviceType });
    this.config.preferredServiceType = serviceType;
    this.saveConfig();
  }

  setAutoScanOnStartup(enabled: boolean): void {
    this.config.autoScanOnStartup = enabled;
    this.saveConfig();
  }

  setMaxScanDepth(depth: number): void {
    this.config.maxScanDepth = Math.max(1, Math.min(10, depth)); // Clamp between 1-10
    this.saveConfig();
  }

  // Preference setters
  setShowDAKBadges(enabled: boolean): void {
    this.preferences.showDAKBadges = enabled;
    this.savePreferences();
  }

  setAutoValidateDAKs(enabled: boolean): void {
    this.preferences.autoValidateDAKs = enabled;
    this.savePreferences();
  }

  setCacheDiscoveredRepos(enabled: boolean): void {
    this.preferences.cacheDiscoveredRepos = enabled;
    this.savePreferences();
  }

  setEnableGitOperations(enabled: boolean): void {
    this.preferences.enableGitOperations = enabled;
    this.savePreferences();
  }

  setDefaultBranch(branch: string): void {
    this.preferences.defaultBranch = branch;
    this.savePreferences();
  }

  // Utility methods
  clearConfig(): void {
    this.logger.debug('Clearing local repo config');
    localStorage.removeItem(this.CONFIG_KEY);
    this.config = this.getDefaultConfig();
  }

  clearPreferences(): void {
    this.logger.debug('Clearing local repo preferences');
    localStorage.removeItem(this.PREFERENCES_KEY);
    this.preferences = this.getDefaultPreferences();
  }

  clearAll(): void {
    this.clearConfig();
    this.clearPreferences();
  }

  // Environment capabilities
  getEnvironmentInfo() {
    return {
      hasFileSystemAccess: 'showDirectoryPicker' in window,
      hasLocalStorage: this.hasLocalStorageSupport(),
      canPersistConfig: this.hasLocalStorageSupport(),
      isSecureContext: window.isSecureContext,
      userAgent: navigator.userAgent
    };
  }

  private hasLocalStorageSupport(): boolean {
    try {
      const test = 'sgex_test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Export/Import configuration
  exportConfig(): string {
    const exportData = {
      config: this.config,
      preferences: this.preferences,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  }

  importConfig(configJson: string): boolean {
    try {
      const importData = JSON.parse(configJson);
      
      if (importData.config) {
        this.config = { ...this.getDefaultConfig(), ...importData.config };
        this.saveConfig();
      }
      
      if (importData.preferences) {
        this.preferences = { ...this.getDefaultPreferences(), ...importData.preferences };
        this.savePreferences();
      }

      this.logger.debug('Configuration imported successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to import configuration', { error: errorMessage });
      return false;
    }
  }
}

// Create singleton instance
const localRepoConfigService = new LocalRepoConfigService();

export default localRepoConfigService;
export { LocalRepoConfigService };
export type { LocalRepoConfig, LocalRepoPreferences };