/**
 * Environment Configuration Service
 * 
 * Provides immediate access to environment variables at application startup.
 * This service validates and caches all required environment variables to 
 * prevent timing issues during component initialization.
 * 
 * Key Features:
 * - Validates environment variables at app startup
 * - Provides immediate access without initialization delays
 * - Fails fast with clear error messages
 * - Caches values for performance
 */

class EnvironmentConfig {
  constructor() {
    this._config = null;
    this._validated = false;
    this._initializeAtStartup();
  }

  /**
   * Initialize and validate environment variables immediately
   * This happens at module load time to catch issues early
   */
  _initializeAtStartup() {
    try {
      // Only initialize in browser environment
      if (typeof window === 'undefined') {
        return; // Skip during SSR or build processes
      }

      this._validateAndCache();
    } catch (error) {
      console.warn('Environment config validation deferred:', error.message);
      // Don't throw error at module load time, allow deferred validation
    }
  }

  /**
   * Validate and cache all environment variables
   */
  _validateAndCache() {
    if (this._validated) return;

    // Required environment variables
    const requiredVars = {
      REACT_APP_REPO_OWNER: process.env.REACT_APP_REPO_OWNER,
      REACT_APP_REPO_NAME: process.env.REACT_APP_REPO_NAME
    };

    // Optional environment variables with defaults
    const optionalVars = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PUBLIC_URL: process.env.PUBLIC_URL || '/sgex',
      REACT_APP_REPO_CONFIG_SOURCE: process.env.REACT_APP_REPO_CONFIG_SOURCE || 'environment'
    };

    // Validate required variables
    const missingVars = Object.entries(requiredVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      const error = new Error(
        `Missing required environment variables: ${missingVars.join(', ')}. ` +
        'Please run "npm run configure:repo" or ensure package.json has a valid repository field.'
      );
      error.code = 'MISSING_ENV_VARS';
      error.missingVars = missingVars;
      throw error;
    }

    // Cache validated configuration
    this._config = {
      ...requiredVars,
      ...optionalVars,
      // Computed values
      fullRepoName: `${requiredVars.REACT_APP_REPO_OWNER}/${requiredVars.REACT_APP_REPO_NAME}`,
      githubUrl: `https://github.com/${requiredVars.REACT_APP_REPO_OWNER}/${requiredVars.REACT_APP_REPO_NAME}`,
      apiUrl: `https://api.github.com/repos/${requiredVars.REACT_APP_REPO_OWNER}/${requiredVars.REACT_APP_REPO_NAME}`,
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production'
    };

    this._validated = true;
  }

  /**
   * Get repository owner (immediately available)
   */
  getRepoOwner() {
    this._ensureValidated();
    return this._config.REACT_APP_REPO_OWNER;
  }

  /**
   * Get repository name (immediately available)
   */
  getRepoName() {
    this._ensureValidated();
    return this._config.REACT_APP_REPO_NAME;
  }

  /**
   * Get full repository name (owner/name)
   */
  getFullRepoName() {
    this._ensureValidated();
    return this._config.fullRepoName;
  }

  /**
   * Get GitHub repository URL
   */
  getGitHubUrl() {
    this._ensureValidated();
    return this._config.githubUrl;
  }

  /**
   * Get GitHub API URL
   */
  getApiUrl() {
    this._ensureValidated();
    return this._config.apiUrl;
  }

  /**
   * Get environment type
   */
  getEnvironment() {
    this._ensureValidated();
    return this._config.NODE_ENV;
  }

  /**
   * Check if in development mode
   */
  isDevelopment() {
    this._ensureValidated();
    return this._config.isDevelopment;
  }

  /**
   * Check if in production mode
   */
  isProduction() {
    this._ensureValidated();
    return this._config.isProduction;
  }

  /**
   * Get public URL for assets
   */
  getPublicUrl() {
    this._ensureValidated();
    return this._config.PUBLIC_URL;
  }

  /**
   * Get all configuration as object
   */
  getAllConfig() {
    this._ensureValidated();
    return { ...this._config };
  }

  /**
   * Check if environment variables are available
   * Returns true if available, false if not (allows graceful handling)
   */
  isAvailable() {
    try {
      this._ensureValidated();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get availability status with error details
   */
  getAvailabilityStatus() {
    try {
      this._ensureValidated();
      return { available: true, error: null };
    } catch (error) {
      return { 
        available: false, 
        error: error.message,
        code: error.code,
        missingVars: error.missingVars
      };
    }
  }

  /**
   * Ensure configuration is validated
   * @private
   */
  _ensureValidated() {
    if (!this._validated) {
      this._validateAndCache();
    }
  }

  /**
   * Reset configuration (for testing)
   */
  reset() {
    this._config = null;
    this._validated = false;
  }

  /**
   * Set configuration manually (for testing)
   */
  setConfig(owner, name, options = {}) {
    this._config = {
      REACT_APP_REPO_OWNER: owner,
      REACT_APP_REPO_NAME: name,
      NODE_ENV: options.environment || 'development',
      PUBLIC_URL: options.publicUrl || '/sgex',
      REACT_APP_REPO_CONFIG_SOURCE: 'manual',
      fullRepoName: `${owner}/${name}`,
      githubUrl: `https://github.com/${owner}/${name}`,
      apiUrl: `https://api.github.com/repos/${owner}/${name}`,
      isDevelopment: (options.environment || 'development') === 'development',
      isProduction: (options.environment || 'development') === 'production'
    };
    this._validated = true;
  }
}

// Create and export singleton instance
const environmentConfig = new EnvironmentConfig();

export default environmentConfig;