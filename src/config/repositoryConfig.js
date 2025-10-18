/**
 * Repository Configuration Service
 * 
 * Provides centralized repository configuration that must be set at build time
 * from environment variables. These are set by the configure-repository.js script
 * which extracts and validates repository information from package.json.
 * 
 * This ensures fork-friendly deployment where the repository owner/name
 * is automatically detected and validated rather than hardcoded.
 */

class RepositoryConfig {
  constructor() {
    this._config = null;
    this._initialized = false;
  }

  /**
   * Initialize repository configuration
   * Requires build-time environment variables set by configure-repository.js script:
   * - REACT_APP_REPO_OWNER: Repository owner
   * - REACT_APP_REPO_NAME: Repository name
   * 
   * These are validated and set during the build process to ensure consistency.
   */
  _initialize() {
    if (this._initialized) return;

    // Require build-time environment variables
    const envOwner = process.env.REACT_APP_REPO_OWNER;
    const envRepo = process.env.REACT_APP_REPO_NAME;
    const configSource = process.env.REACT_APP_REPO_CONFIG_SOURCE;
    
    if (!envOwner || !envRepo) {
      throw new Error(
        'Repository configuration not found. ' +
        'Build-time environment variables REACT_APP_REPO_OWNER and REACT_APP_REPO_NAME must be set. ' +
        'Please run "npm run configure:repo" or ensure package.json has a valid repository field.'
      );
    }

    this._config = {
      owner: envOwner,
      name: envRepo,
      fullName: `${envOwner}/${envRepo}`,
      source: configSource || 'environment'
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

  /**
   * Check if running in GitHub Pages (SPA) mode
   * Returns true if deployed as a static site on GitHub Pages
   */
  isGitHubPages() {
    // Check if hostname ends with .github.io
    return typeof window !== 'undefined' && 
           window.location.hostname.endsWith('.github.io');
  }

  /**
   * Check if SAML authorization is supported
   * SAML requires a backend service, not supported in SPA mode
   */
  isSAMLSupported() {
    return !this.isGitHubPages();
  }
}

// Create and export singleton instance
const repositoryConfig = new RepositoryConfig();

export default repositoryConfig;