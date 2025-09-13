/**
 * Repository Configuration Service
 * 
 * Provides centralized repository configuration that can be set at build time
 * or determined from environment variables and package.json.
 * 
 * This allows for fork-friendly deployment where the repository owner/name
 * is automatically detected rather than hardcoded.
 */

class RepositoryConfig {
  constructor() {
    this._config = null;
    this._initialized = false;
  }

  /**
   * Initialize repository configuration
   * Priority order:
   * 1. Build-time environment variables (REACT_APP_REPO_OWNER, REACT_APP_REPO_NAME)
   * 2. Package.json repository field
   * 3. Default fallback to original repository
   */
  _initialize() {
    if (this._initialized) return;

    // Try build-time environment variables first
    const envOwner = process.env.REACT_APP_REPO_OWNER;
    const envRepo = process.env.REACT_APP_REPO_NAME;
    
    if (envOwner && envRepo) {
      this._config = {
        owner: envOwner,
        name: envRepo,
        fullName: `${envOwner}/${envRepo}`,
        source: 'environment'
      };
      this._initialized = true;
      return;
    }

    // Try to extract from package.json repository field
    try {
      // This would be injected at build time or available as a build variable
      const packageRepo = process.env.REACT_APP_PACKAGE_REPOSITORY;
      if (packageRepo) {
        // Parse repository URL like "https://github.com/owner/repo.git"
        const match = packageRepo.match(/github\.com[/:]([\w-]+)\/([\w-]+?)(?:\.git)?$/);
        if (match) {
          const [, owner, name] = match;
          this._config = {
            owner,
            name,
            fullName: `${owner}/${name}`,
            source: 'package.json'
          };
          this._initialized = true;
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to parse repository from package.json:', error);
    }

    // Default fallback to original repository
    this._config = {
      owner: 'litlfred',
      name: 'sgex',
      fullName: 'litlfred/sgex',
      source: 'default'
    };
    this._initialized = true;
  }

  /**
   * Get repository owner
   */
  getOwner() {
    this._initialize();
    return this._config.owner;
  }

  /**
   * Get repository name
   */
  getName() {
    this._initialize();
    return this._config.name;
  }

  /**
   * Get full repository name (owner/name)
   */
  getFullName() {
    this._initialize();
    return this._config.fullName;
  }

  /**
   * Get repository URL for GitHub
   */
  getGitHubUrl() {
    this._initialize();
    return `https://github.com/${this._config.fullName}`;
  }

  /**
   * Get repository URL for GitHub API
   */
  getApiUrl() {
    this._initialize();
    return `https://api.github.com/repos/${this._config.fullName}`;
  }

  /**
   * Get configuration source for debugging
   */
  getSource() {
    this._initialize();
    return this._config.source;
  }

  /**
   * Get full configuration object
   */
  getConfig() {
    this._initialize();
    return { ...this._config };
  }

  /**
   * Check if this is the default repository (litlfred/sgex)
   */
  isDefaultRepository() {
    this._initialize();
    return this._config.fullName === 'litlfred/sgex';
  }

  /**
   * Override configuration (for testing or manual setup)
   */
  setConfig(owner, name) {
    this._config = {
      owner,
      name,
      fullName: `${owner}/${name}`,
      source: 'manual'
    };
    this._initialized = true;
  }

  /**
   * Reset configuration to force re-initialization
   */
  reset() {
    this._config = null;
    this._initialized = false;
  }
}

// Create and export singleton instance
const repositoryConfig = new RepositoryConfig();
export default repositoryConfig;