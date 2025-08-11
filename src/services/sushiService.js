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
import yaml from 'js-yaml';

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
    this.log('info', `Loading FSH files from ${repository.full_name}/${branch}`, null, repository, branch);
    
    try {
      // Step 1: Load all FSH files from GitHub repository
      const githubFiles = await this.loadGitHubFSHFiles(repository, branch, profile);
      this.log('info', `Loaded ${githubFiles.length} FSH files from GitHub`, null, repository, branch);
      
      // Step 2: Load staging ground files and override GitHub files
      const stagingFiles = await this.loadStagingGroundFSHFiles();
      this.log('info', `Loaded ${stagingFiles.length} FSH files from staging ground`, null, repository, branch);
      
      // Step 3: Merge files - staging ground overrides GitHub
      const mergedFiles = this.mergeFSHFiles(githubFiles, stagingFiles, repository, branch);
      this.log('info', `Total FSH files after merge: ${mergedFiles.length}`, null, repository, branch);
      
      return mergedFiles;
    } catch (error) {
      this.log('error', `Failed to load FSH files: ${error.message}`, null, repository, branch);
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
                
                this.log('info', `Found FSH file: ${file.path}`, null, repository, { name: repository.name, owner: repository.owner });
                
                fshFiles.push({
                  path: file.path,
                  name: file.name,
                  content: content,
                  source: 'github',
                  size: file.size,
                  githubUrl: `https://github.com/${repository.owner.login}/${repository.name}/blob/${branch}/${file.path}`
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
              
              this.log('info', `Found FSH file: ${file.path}`, null, repository, { name: repository.name, owner: repository.owner });
              
              fshFiles.push({
                path: file.path,
                name: file.name,
                content: content,
                source: 'github',
                size: file.size,
                githubUrl: `https://github.com/${repository.owner.login}/${repository.name}/blob/${branch}/${file.path}`
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
            this.log('info', `Found staging FSH file: ${file.path}`, null, null, null);
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
  mergeFSHFiles(githubFiles, stagingFiles, repository, branch) {
    const mergedFiles = [...githubFiles];
    
    // Override GitHub files with staging ground files
    for (const stagingFile of stagingFiles) {
      const existingIndex = mergedFiles.findIndex(f => f.path === stagingFile.path);
      
      if (existingIndex >= 0) {
        // Override existing file
        mergedFiles[existingIndex] = stagingFile;
        this.log('debug', `Overriding ${stagingFile.path} with staging ground version`, null, repository, branch);
      } else {
        // Add new file from staging ground
        mergedFiles.push(stagingFile);
        this.log('debug', `Adding new file ${stagingFile.path} from staging ground`, null, repository, branch);
      }
    }

    return mergedFiles;
  }

  /**
   * Load SUSHI configuration from repository and staging ground
   */
  async loadSushiConfig(repository, branch, profile) {
    try {
      let githubConfig = null;
      let stagingConfig = null;

      // Load from GitHub
      try {
        const configContent = await githubService.getFileContent(
          repository.owner.login,
          repository.name,
          'sushi-config.yaml',
          branch,
          profile.token
        );
        githubConfig = yaml.load(configContent);
        this.log('info', `Loaded SUSHI configuration from GitHub: ${githubConfig.id || 'unnamed'}`);
      } catch (error) {
        this.log('warn', `Could not load sushi-config.yaml from GitHub: ${error.message}`);
      }

      // Load from staging ground if available
      try {
        const stagingFiles = stagingGroundService.getStagingFiles();
        const stagingConfigFile = stagingFiles.find(file => file.path === 'sushi-config.yaml');
        if (stagingConfigFile) {
          stagingConfig = yaml.load(stagingConfigFile.content);
          this.log('info', `Loaded SUSHI configuration from staging: ${stagingConfig.id || 'unnamed'}`);
        }
      } catch (error) {
        this.log('warn', `Could not load sushi-config.yaml from staging: ${error.message}`);
      }

      // Return staging config if available, otherwise GitHub config
      const config = stagingConfig || githubConfig;
      if (!config) {
        throw new Error('No sushi-config.yaml found in repository or staging');
      }

      return {
        config,
        hasGithubVersion: !!githubConfig,
        hasStagingVersion: !!stagingConfig,
        isUsingStaging: !!stagingConfig
      };
    } catch (error) {
      this.log('error', `Failed to load sushi-config.yaml: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save SUSHI configuration to staging ground
   */
  async saveSushiConfigToStaging(config) {
    try {
      const yamlContent = yaml.dump(config, {
        indent: 2,
        lineWidth: 120,
        quotingType: '"'
      });

      stagingGroundService.saveFile('sushi-config.yaml', yamlContent);
      this.log('info', 'Saved SUSHI configuration to staging ground');
      return true;
    } catch (error) {
      this.log('error', `Failed to save sushi-config.yaml to staging: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate SUSHI configuration
   */
  validateSushiConfig(config) {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!config.id) {
      errors.push('id field is required');
    } else if (!/^[a-z0-9]+(\.[a-z0-9]+)*$/.test(config.id)) {
      errors.push('id must be lowercase alphanumeric with dots only (e.g., who.fhir.anc)');
    }

    if (!config.name) {
      errors.push('name field is required');
    } else if (/\s/.test(config.name)) {
      errors.push('name should not contain spaces (use PascalCase, e.g., WHOANCGuidelines)');
    }

    if (!config.version) {
      errors.push('version field is required');
    } else if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/.test(config.version)) {
      errors.push('version must follow semantic versioning (e.g., 1.0.0)');
    }

    if (!config.fhirVersion) {
      warnings.push('fhirVersion not specified, defaulting to 4.0.1');
    } else if (!['4.0.1', '4.3.0', '5.0.0'].includes(config.fhirVersion)) {
      warnings.push('fhirVersion should be one of: 4.0.1, 4.3.0, 5.0.0');
    }

    // Publisher validation
    if (!config.publisher) {
      warnings.push('publisher information is recommended');
    } else if (typeof config.publisher === 'object') {
      if (!config.publisher.name) {
        warnings.push('publisher.name is recommended');
      }
      if (config.publisher.url && !/^https?:\/\//.test(config.publisher.url)) {
        errors.push('publisher.url must be a valid URL starting with http:// or https://');
      }
      if (config.publisher.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.publisher.email)) {
        errors.push('publisher.email must be a valid email address');
      }
    }

    // Dependencies validation - ensure WHO base dependency for DAKs
    if (!config.dependencies) {
      warnings.push('dependencies section is recommended for WHO SMART Guidelines DAKs');
    } else if (!config.dependencies['hl7.fhir.uv.sdc'] && !config.dependencies['smart.who.int.base']) {
      warnings.push('WHO SMART Guidelines DAKs should include smart.who.int.base dependency');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get pages from sushi config and link to source files
   */
  async loadPagesWithSources(repository, branch, profile, config) {
    const pages = [];
    
    if (config.pages) {
      for (const [pageKey, pageValue] of Object.entries(config.pages)) {
        const page = {
          key: pageKey,
          ...pageValue,
          sources: {
            github: null,
            staging: null
          }
        };

        // Check for source file in input/pagecontent
        const sourceFileName = `input/pagecontent/${pageKey}.md`;
        
        // Check GitHub
        try {
          const content = await githubService.getFileContent(
            repository.owner.login,
            repository.name,
            sourceFileName,
            branch,
            profile.token
          );
          page.sources.github = {
            path: sourceFileName,
            url: `https://github.com/${repository.owner.login}/${repository.name}/blob/${branch}/${sourceFileName}`,
            size: content.length
          };
        } catch (error) {
          // Page source not found in GitHub
        }

        // Check staging
        try {
          const stagingFiles = stagingGroundService.getStagingFiles();
          const stagingFile = stagingFiles.find(file => file.path === sourceFileName);
          if (stagingFile) {
            page.sources.staging = {
              path: sourceFileName,
              size: stagingFile.content.length
            };
          }
        } catch (error) {
          // Page source not found in staging
        }

        pages.push(page);
      }
    }

    return pages;
  }

  /**
   * Run FSH file loading and analysis (simplified version)
   * This loads and validates FSH files without full SUSHI compilation
   */
  async runSUSHI(repository, branch, profile, options = {}) {
    this.log('info', 'Starting FSH file loading and analysis...', null, repository, branch);
    this.clearLogs();

    try {
      // Load FSH files and configuration
      const fshFiles = await this.loadFSHFiles(repository, branch, profile);
      const configResult = await this.loadSushiConfig(repository, branch, profile);

      if (fshFiles.length === 0) {
        this.log('warn', 'No FSH files found to process', null, repository, branch);
        return {
          success: false,
          message: 'No FSH files found to process',
          files: [],
          logs: this.logs
        };
      }

      // Analyze FSH files
      const analysis = this.analyzeFSHFiles(fshFiles, repository, branch);

      this.compilationResults = {
        files: fshFiles,
        config: configResult.config,
        analysis: analysis,
        repository: repository,
        branch: branch,
        configSources: {
          hasGithubVersion: configResult.hasGithubVersion,
          hasStagingVersion: configResult.hasStagingVersion,
          isUsingStaging: configResult.isUsingStaging
        }
      };
      
      this.log('info', 'FSH file loading and analysis completed', null, repository, branch);
      this.notifyListeners();

      return {
        success: true,
        result: {
          files: fshFiles,
          config: configResult.config,
          configSources: configResult,
          analysis: analysis,
          message: 'FSH files loaded successfully. Full SUSHI compilation will be available in future releases.'
        },
        files: fshFiles,
        logs: this.logs,
        stats: this.getAnalysisStats(analysis)
      };

    } catch (error) {
      this.log('error', `FSH processing failed: ${error.message}`, null, repository, branch);
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
  analyzeFSHFiles(fshFiles, repository, branch) {
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

      // Log file processing
      this.log('debug', `Analyzing file: ${file.path} (${file.source})`, null, repository, branch);

      // Basic FSH construct detection
      if (content.includes('Profile:')) analysis.profiles++;
      if (content.includes('Extension:')) analysis.extensions++;
      if (content.includes('ValueSet:')) analysis.valueSets++;
      if (content.includes('CodeSystem:')) analysis.codeSystems++;
      if (content.includes('Instance:')) analysis.instances++;

      // Track overrides
      if (file.source === 'staging') {
        analysis.overrides.push(file.path);
        this.log('info', `File ${file.path} overridden by staging ground version`, null, repository, branch);
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
   * Add a log entry with enhanced file linking
   */
  log(level, message, location = null, repository = null, branch = null) {
    const logEntry = {
      id: Date.now() + Math.random(), // Unique ID for log entry
      level: level,
      message: message,
      location: location,
      repository: repository,
      branch: branch,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    console[level] && console[level](`[SUSHI] ${message}`);
  }

  /**
   * Parse log message to identify file references and create appropriate links
   */
  parseLogMessage(message, repository, branch) {
    if (!message || typeof message !== 'string') {
      return message;
    }

    // Enhanced regex to find valid file paths - must be preceded by whitespace or start of line
    // and must be a complete path (not part of a longer word)
    const filePathRegex = /(?:^|\s)((?:input\/fsh\/[a-zA-Z0-9_/-]*\/)?[a-zA-Z0-9_.-]+\.(?:fsh|yaml|yml|json))(?=\s|$|[.,!])/g;
    const matches = [...message.matchAll(filePathRegex)];
    
    if (matches.length === 0) {
      return { text: message, hasLinks: false };
    }
    
    let lastIndex = 0;
    const parts = [];
    
    matches.forEach((match) => {
      const fullMatch = match[0];
      const filePath = match[1];
      const matchIndex = match.index;
      
      // Add text before the match
      if (matchIndex > lastIndex) {
        parts.push({
          type: 'text',
          content: message.substring(lastIndex, matchIndex)
        });
      }
      
      // Add the leading whitespace if present
      const leadingWhitespace = fullMatch.substring(0, fullMatch.indexOf(filePath));
      if (leadingWhitespace) {
        parts.push({
          type: 'text',
          content: leadingWhitespace
        });
      }
      
      // Determine link type based on file location and availability
      const linkInfo = this.getFileLinkInfo(filePath, repository, branch);
      
      parts.push({
        type: 'link',
        content: filePath,
        linkInfo: linkInfo
      });
      
      lastIndex = matchIndex + fullMatch.length;
    });
    
    // Add remaining text
    if (lastIndex < message.length) {
      parts.push({
        type: 'text',
        content: message.substring(lastIndex)
      });
    }
    
    return { parts: parts, hasLinks: true };
  }

  /**
   * Get file link information for a given file path
   */
  getFileLinkInfo(filePath, repository, branch) {
    // Check if file exists in our known file lists
    const results = this.compilationResults;
    
    if (results && results.files) {
      const knownFile = results.files.find(f => f.path === filePath || f.path.endsWith(`/${filePath}`));
      
      if (knownFile) {
        if (knownFile.source === 'staging') {
          return {
            type: 'staging',
            title: 'File from Staging Ground',
            icon: '📝',
            path: filePath,
            source: 'staging'
          };
        } else if (knownFile.source === 'github') {
          const owner = repository?.owner?.login || repository?.full_name?.split('/')[0];
          const repoName = repository?.name || repository?.full_name?.split('/')[1];
          
          return {
            type: 'github',
            title: 'Open in GitHub',
            icon: '🔗',
            path: filePath,
            source: 'github',
            url: `https://github.com/${owner}/${repoName}/blob/${branch}/${filePath}`
          };
        }
      }
    }
    
    // Check for specific file types and provide DAK component links
    if (filePath.startsWith('input/fsh/')) {
      const pathParts = filePath.split('/');
      if (pathParts.length > 2) {
        const subDir = pathParts[2];
        const componentInfo = this.getDakComponentInfo(subDir);
        
        return {
          type: 'dak',
          title: `View in DAK ${componentInfo.component}`,
          icon: componentInfo.icon,
          path: filePath,
          source: 'dak',
          component: componentInfo.component
        };
      }
    }
    
    // Special handling for sushi-config.yaml
    if (filePath === 'sushi-config.yaml' && repository && branch) {
      const owner = repository?.owner?.login || repository?.full_name?.split('/')[0];
      const repoName = repository?.name || repository?.full_name?.split('/')[1];
      
      return {
        type: 'config',
        title: 'SUSHI Configuration File',
        icon: '⚙️',
        path: filePath,
        source: 'github',
        url: `https://github.com/${owner}/${repoName}/blob/${branch}/${filePath}`
      };
    }
    
    // Default to a generic file mention
    return {
      type: 'file',
      title: 'File Reference',
      icon: '📄',
      path: filePath,
      source: 'unknown'
    };
  }

  /**
   * Get DAK component information based on directory structure
   */
  getDakComponentInfo(subDir) {
    switch (subDir) {
      case 'profiles':
        return { component: 'Profiles', icon: '👤' };
      case 'examples':
        return { component: 'Examples', icon: '📋' };
      case 'valuesets':
        return { component: 'ValueSets', icon: '📊' };
      case 'codesystems':
        return { component: 'CodeSystems', icon: '🔢' };
      case 'extensions':
        return { component: 'Extensions', icon: '🔧' };
      case 'rules':
        return { component: 'Rules', icon: '📏' };
      case 'aliases':
        return { component: 'Aliases', icon: '🔗' };
      default:
        return { component: 'FSH Files', icon: '📄' };
    }
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