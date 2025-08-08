/**
 * SUSHI Service
 * 
 * Provides client-side FSH file loading and management for SGEX Workbench.
 * Integrates with GitHub repositories and staging ground to load and process FSH files.
 * 
 * Key features:
 * - Load FSH files from GitHub repositories
 * - Override with staging ground files  
 * - Provide file merging logic as requested
 * - Detailed logging and error reporting
 * - Future SUSHI compilation support when library is compatible
 */

import githubService from './githubService';
import stagingGroundService from './stagingGroundService';

class SushiService {
  constructor() {
    this.initialized = true; // Simplified for now
    this.compilationResults = null;
    this.logs = [];
    this.listeners = new Set();
  }

  /**
   * Load all FSH files from GitHub repository and staging ground
   * GitHub files are loaded first, then overridden by staging ground files
   */
  async loadFSHFiles(repository, branch, profile) {
    this.log('info', `Loading FSH files from ${repository.full_name}/${branch}`);
    
    try {
      // Step 1: Load all FSH files from GitHub repository
      const githubFiles = await this.loadGitHubFSHFiles(repository, branch, profile);
      this.log('info', `Loaded ${githubFiles.length} FSH files from GitHub`);
      
      // Step 2: Load staging ground files and override GitHub files
      const stagingFiles = await this.loadStagingGroundFSHFiles();
      this.log('info', `Loaded ${stagingFiles.length} FSH files from staging ground`);
      
      // Step 3: Merge files - staging ground overrides GitHub
      const mergedFiles = this.mergeFSHFiles(githubFiles, stagingFiles);
      this.log('info', `Total FSH files after merge: ${mergedFiles.length}`);
      
      return mergedFiles;
    } catch (error) {
      this.log('error', `Failed to load FSH files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load FSH files from GitHub repository
   */
  async loadGitHubFSHFiles(repository, branch, profile) {
    const fshFiles = [];
    
    try {
      // Common FSH directories to check
      const fshDirectories = [
        'input/fsh',
        'fsh', 
        'input/fsh/profiles',
        'input/fsh/extensions',
        'input/fsh/valuesets',
        'input/fsh/codesystems',
        'input/fsh/examples',
        'input/fsh/rules',
        'input/fsh/aliases'
      ];

      for (const directory of fshDirectories) {
        try {
          const files = await githubService.getRepositoryContents(
            repository.owner.login,
            repository.name,
            directory,
            branch,
            profile.token
          );

          if (Array.isArray(files)) {
            for (const file of files) {
              if (file.type === 'file' && file.name.endsWith('.fsh')) {
                const content = await githubService.getFileContent(
                  repository.owner.login,
                  repository.name,
                  file.path,
                  branch,
                  profile.token
                );
                
                fshFiles.push({
                  path: file.path,
                  name: file.name,
                  content: content,
                  source: 'github',
                  size: file.size
                });
              }
            }
          }
        } catch (error) {
          // Directory might not exist, continue with next
          this.log('debug', `Directory ${directory} not found or inaccessible`);
        }
      }

      // Also check for any .fsh files in the root
      try {
        const rootFiles = await githubService.getRepositoryContents(
          repository.owner.login,
          repository.name,
          '',
          branch,
          profile.token
        );

        if (Array.isArray(rootFiles)) {
          for (const file of rootFiles) {
            if (file.type === 'file' && file.name.endsWith('.fsh')) {
              const content = await githubService.getFileContent(
                repository.owner.login,
                repository.name,
                file.path,
                branch,
                profile.token
              );
              
              fshFiles.push({
                path: file.path,
                name: file.name,
                content: content,
                source: 'github',
                size: file.size
              });
            }
          }
        }
      } catch (error) {
        this.log('debug', `Root directory check failed: ${error.message}`);
      }

    } catch (error) {
      this.log('error', `Failed to load GitHub FSH files: ${error.message}`);
      throw error;
    }

    return fshFiles;
  }

  /**
   * Load FSH files from staging ground
   */
  async loadStagingGroundFSHFiles() {
    const fshFiles = [];
    
    try {
      const stagingGround = stagingGroundService.getStagingGround();
      
      if (stagingGround && stagingGround.files) {
        for (const file of stagingGround.files) {
          if (file.path.endsWith('.fsh')) {
            fshFiles.push({
              path: file.path,
              name: file.path.split('/').pop(),
              content: file.content,
              source: 'staging',
              metadata: file.metadata,
              timestamp: file.timestamp
            });
          }
        }
      }
    } catch (error) {
      this.log('error', `Failed to load staging ground FSH files: ${error.message}`);
      throw error;
    }

    return fshFiles;
  }

  /**
   * Merge GitHub and staging ground FSH files
   * Staging ground files override GitHub files with the same path
   */
  mergeFSHFiles(githubFiles, stagingFiles) {
    const mergedFiles = [...githubFiles];
    
    // Override GitHub files with staging ground files
    for (const stagingFile of stagingFiles) {
      const existingIndex = mergedFiles.findIndex(f => f.path === stagingFile.path);
      
      if (existingIndex >= 0) {
        // Override existing file
        mergedFiles[existingIndex] = stagingFile;
        this.log('debug', `Overriding ${stagingFile.path} with staging ground version`);
      } else {
        // Add new file from staging ground
        mergedFiles.push(stagingFile);
        this.log('debug', `Adding new file ${stagingFile.path} from staging ground`);
      }
    }

    return mergedFiles;
  }

  /**
   * Load SUSHI configuration from repository
   */
  async loadSushiConfig(repository, branch, profile) {
    try {
      const configContent = await githubService.getFileContent(
        repository.owner.login,
        repository.name,
        'sushi-config.yaml',
        branch,
        profile.token
      );

      // Parse YAML config using js-yaml which is already available
      const yaml = await import('js-yaml');
      const config = yaml.load(configContent);
      
      this.log('info', `Loaded SUSHI configuration: ${config.id || 'unnamed'}`);
      return config;
    } catch (error) {
      this.log('error', `Failed to load sushi-config.yaml: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run FSH file loading and analysis (simplified version)
   * This loads and validates FSH files without full SUSHI compilation
   */
  async runSUSHI(repository, branch, profile, options = {}) {
    this.log('info', 'Starting FSH file loading and analysis...');
    this.clearLogs();

    try {
      // Load FSH files and configuration
      const fshFiles = await this.loadFSHFiles(repository, branch, profile);
      const config = await this.loadSushiConfig(repository, branch, profile);

      if (fshFiles.length === 0) {
        this.log('warn', 'No FSH files found to process');
        return {
          success: false,
          message: 'No FSH files found to process',
          files: [],
          logs: this.logs
        };
      }

      // Analyze FSH files
      const analysis = this.analyzeFSHFiles(fshFiles);

      this.compilationResults = {
        files: fshFiles,
        config: config,
        analysis: analysis
      };
      
      this.log('info', 'FSH file loading and analysis completed');
      this.notifyListeners();

      return {
        success: true,
        result: {
          files: fshFiles,
          config: config,
          analysis: analysis,
          message: 'FSH files loaded successfully. Full SUSHI compilation will be available in future releases.'
        },
        files: fshFiles,
        logs: this.logs,
        stats: this.getAnalysisStats(analysis)
      };

    } catch (error) {
      this.log('error', `FSH processing failed: ${error.message}`);
      this.notifyListeners();
      
      return {
        success: false,
        error: error.message,
        logs: this.logs
      };
    }
  }

  /**
   * Analyze FSH files to provide useful information
   */
  analyzeFSHFiles(fshFiles) {
    const analysis = {
      totalFiles: fshFiles.length,
      githubFiles: fshFiles.filter(f => f.source === 'github').length,
      stagingFiles: fshFiles.filter(f => f.source === 'staging').length,
      overrides: [],
      fileTypes: {},
      totalLines: 0,
      profiles: 0,
      extensions: 0,
      valueSets: 0,
      codeSystems: 0,
      instances: 0
    };

    fshFiles.forEach(file => {
      // Count basic FSH constructs
      const content = file.content;
      analysis.totalLines += content.split('\n').length;

      // Basic FSH construct detection
      if (content.includes('Profile:')) analysis.profiles++;
      if (content.includes('Extension:')) analysis.extensions++;
      if (content.includes('ValueSet:')) analysis.valueSets++;
      if (content.includes('CodeSystem:')) analysis.codeSystems++;
      if (content.includes('Instance:')) analysis.instances++;

      // Track overrides
      if (file.source === 'staging') {
        analysis.overrides.push(file.path);
      }

      // File type analysis
      const extension = file.path.split('.').pop();
      analysis.fileTypes[extension] = (analysis.fileTypes[extension] || 0) + 1;
    });

    return analysis;
  }

  /**
   * Get analysis statistics
   */
  getAnalysisStats(analysis) {
    return {
      files: analysis.totalFiles,
      lines: analysis.totalLines,
      sources: {
        github: analysis.githubFiles,
        staging: analysis.stagingFiles
      },
      constructs: {
        profiles: analysis.profiles,
        extensions: analysis.extensions,
        valueSets: analysis.valueSets,
        codeSystems: analysis.codeSystems,
        instances: analysis.instances
      },
      overrides: analysis.overrides.length
    };
  }

  /**
   * Clear compilation logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Add a log entry
   */
  log(level, message, location = null) {
    const logEntry = {
      level: level,
      message: message,
      location: location,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    console[level] && console[level](`[SUSHI] ${message}`);
  }

  /**
   * Get all logs
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Search logs by content
   */
  searchLogs(searchTerm) {
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Export logs as text
   */
  exportLogsAsText() {
    return this.logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.location ? ` (${log.location})` : ''}`
    ).join('\n');
  }

  /**
   * Get compilation results
   */
  getCompilationResults() {
    return this.compilationResults;
  }

  /**
   * Add change listener
   */
  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener({
          logs: this.logs,
          results: this.compilationResults,
          stats: this.compilationResults ? this.getAnalysisStats(this.compilationResults.analysis) : null
        });
      } catch (error) {
        console.error('Error notifying SUSHI service listener:', error);
      }
    });
  }

  /**
   * Check if SUSHI is available and initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Validate FSH syntax (basic validation for now)
   */
  async validateFSH(fshContent) {
    try {
      // Basic FSH validation - check for common syntax patterns
      const errors = [];
      const warnings = [];
      
      const lines = fshContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Basic syntax checks
        if (line.includes('Profile:') && !line.includes('=')) {
          warnings.push(`Line ${i + 1}: Profile declaration might be missing metadata`);
        }
        
        if (line.includes('*') && !line.includes('=') && !line.includes('//')) {
          warnings.push(`Line ${i + 1}: Rule might be missing assignment`);
        }
      }
      
      return {
        valid: errors.length === 0,
        errors: errors,
        warnings: warnings
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
        warnings: []
      };
    }
  }
}

// Export singleton instance
const sushiService = new SushiService();
export default sushiService;