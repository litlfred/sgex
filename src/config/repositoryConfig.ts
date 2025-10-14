/**
 * Repository Configuration Service
 * 
 * Provides centralized repository configuration that must be set at build time
 * from environment variables. These are set by the configure-repository.js script
 * which extracts and validates repository information from package.json.
 * 
 * This ensures fork-friendly deployment where the repository owner/name
 * is automatically detected and validated rather than hardcoded.
 * 
 * @module repositoryConfig
 */

/**
 * Repository configuration object
 * @example { "owner": "litlfred", "name": "sgex", "fullName": "litlfred/sgex", "source": "environment" }
 */
export interface RepositoryConfigData {
  /** Repository owner (user or organization) */
  owner: string;
  /** Repository name */
  name: string;
  /** Full repository name (owner/name) */
  fullName: string;
  /** Configuration source (environment, manual, etc.) */
  source: string;
}

/**
 * Repository configuration service class
 * Manages repository settings from build-time environment variables
 * 
 * @example
 * const config = new RepositoryConfig();
 * const owner = config.getOwner(); // "litlfred"
 * const name = config.getName(); // "sgex"
 */
export class RepositoryConfig {
  private _config: RepositoryConfigData | null = null;
  private _initialized: boolean = false;

  /**
   * Initialize repository configuration
   * Requires build-time environment variables set by configure-repository.js script:
   * - REACT_APP_REPO_OWNER: Repository owner
   * - REACT_APP_REPO_NAME: Repository name
   * 
   * These are validated and set during the build process to ensure consistency.
   * @throws {Error} If required environment variables are not set
   */
  private _initialize(): void {
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
   * @returns Repository owner username or organization name
   * 
   * @example
   * const owner = repositoryConfig.getOwner(); // "litlfred"
   */
  getOwner(): string {
    this._initialize();
    return this._config!.owner;
  }

  /**
   * Get repository name
   * @returns Repository name
   * 
   * @example
   * const name = repositoryConfig.getName(); // "sgex"
   */
  getName(): string {
    this._initialize();
    return this._config!.name;
  }

  /**
   * Get full repository name (owner/name)
   * @returns Full repository identifier
   * 
   * @example
   * const fullName = repositoryConfig.getFullName(); // "litlfred/sgex"
   */
  getFullName(): string {
    this._initialize();
    return this._config!.fullName;
  }

  /**
   * Get repository URL for GitHub
   * @returns GitHub repository URL
   * 
   * @example
   * const url = repositoryConfig.getGitHubUrl(); // "https://github.com/litlfred/sgex"
   */
  getGitHubUrl(): string {
    this._initialize();
    return `https://github.com/${this._config!.fullName}`;
  }

  /**
   * Get repository URL for GitHub API
   * @returns GitHub API URL for repository
   * 
   * @example
   * const apiUrl = repositoryConfig.getApiUrl(); // "https://api.github.com/repos/litlfred/sgex"
   */
  getApiUrl(): string {
    this._initialize();
    return `https://api.github.com/repos/${this._config!.fullName}`;
  }

  /**
   * Get configuration source for debugging
   * @returns Configuration source identifier
   * 
   * @example
   * const source = repositoryConfig.getSource(); // "environment" or "manual"
   */
  getSource(): string {
    this._initialize();
    return this._config!.source;
  }

  /**
   * Get full configuration object
   * @returns Copy of configuration data
   * 
   * @example
   * const config = repositoryConfig.getConfig();
   * // { owner: "litlfred", name: "sgex", fullName: "litlfred/sgex", source: "environment" }
   */
  getConfig(): RepositoryConfigData {
    this._initialize();
    return { ...this._config! };
  }

  /**
   * Override configuration (for testing or manual setup)
   * @param owner - Repository owner
   * @param name - Repository name
   * 
   * @example
   * repositoryConfig.setConfig("testuser", "testrepo");
   */
  setConfig(owner: string, name: string): void {
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
   * Useful for testing scenarios
   * 
   * @example
   * repositoryConfig.reset(); // Clear cached configuration
   */
  reset(): void {
    this._config = null;
    this._initialized = false;
  }
}

/**
 * Singleton instance of repository configuration
 * Pre-configured from build-time environment variables
 * 
 * @example
 * import repositoryConfig from './repositoryConfig';
 * const owner = repositoryConfig.getOwner();
 * const name = repositoryConfig.getName();
 */
const repositoryConfig = new RepositoryConfig();

export default repositoryConfig;
