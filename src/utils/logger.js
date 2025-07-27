/**
 * Centralized logging utility for SGEX Workbench
 * Provides consistent, configurable logging for debugging during development
 */

class Logger {
  constructor() {
    // Check if we're in development mode
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // Log levels
    this.LEVELS = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    
    // Current log level (can be overridden via localStorage)
    this.currentLevel = this.isDevelopment ? this.LEVELS.DEBUG : this.LEVELS.ERROR;
    
    // Check for custom log level in localStorage
    const storedLevel = localStorage.getItem('sgex-log-level');
    if (storedLevel && this.LEVELS[storedLevel.toUpperCase()] !== undefined) {
      this.currentLevel = this.LEVELS[storedLevel.toUpperCase()];
    }
    
    // Component/service prefixes for organized logging
    this.prefixes = new Map();
  }
  
  /**
   * Set log level programmatically
   * @param {string} level - ERROR, WARN, INFO, or DEBUG
   */
  setLevel(level) {
    const upperLevel = level.toUpperCase();
    if (this.LEVELS[upperLevel] !== undefined) {
      this.currentLevel = this.LEVELS[upperLevel];
      localStorage.setItem('sgex-log-level', upperLevel);
    }
  }
  
  /**
   * Get a logger instance for a specific component/service
   * @param {string} name - Component or service name
   * @returns {Object} Logger instance with prefixed methods
   */
  getLogger(name) {
    const prefix = `[SGEX:${name}]`;
    return {
      error: (...args) => this._log(this.LEVELS.ERROR, prefix, ...args),
      warn: (...args) => this._log(this.LEVELS.WARN, prefix, ...args),
      info: (...args) => this._log(this.LEVELS.INFO, prefix, ...args),
      debug: (...args) => this._log(this.LEVELS.DEBUG, prefix, ...args),
      
      // Specialized logging methods
      apiCall: (method, url, data) => this._log(this.LEVELS.DEBUG, prefix, `API ${method}:`, url, data ? { data } : ''),
      apiResponse: (method, url, status, responseTime) => this._log(this.LEVELS.DEBUG, prefix, `API Response ${method}:`, url, `(${status}) ${responseTime}ms`),
      apiError: (method, url, error) => this._log(this.LEVELS.ERROR, prefix, `API Error ${method}:`, url, error),
      
      componentMount: (props) => this._log(this.LEVELS.DEBUG, prefix, 'Component mounted', props ? { props } : ''),
      componentUnmount: () => this._log(this.LEVELS.DEBUG, prefix, 'Component unmounted'),
      stateChange: (oldState, newState) => this._log(this.LEVELS.DEBUG, prefix, 'State change', { from: oldState, to: newState }),
      
      userAction: (action, details) => this._log(this.LEVELS.INFO, prefix, `User action: ${action}`, details),
      
      performance: (operation, duration) => this._log(this.LEVELS.INFO, prefix, `Performance: ${operation} took ${duration}ms`),
      
      auth: (event, details) => this._log(this.LEVELS.INFO, prefix, `Auth: ${event}`, details),
      
      navigation: (from, to) => this._log(this.LEVELS.INFO, prefix, `Navigation: ${from} -> ${to}`),
      
      cache: (operation, key, details) => this._log(this.LEVELS.DEBUG, prefix, `Cache ${operation}:`, key, details)
    };
  }
  
  /**
   * Internal logging method
   * @private
   */
  _log(level, prefix, ...args) {
    if (level <= this.currentLevel) {
      const timestamp = new Date().toISOString();
      const levelName = Object.keys(this.LEVELS)[Object.values(this.LEVELS).indexOf(level)];
      
      // Add timestamp and level to the log
      const logArgs = [`${timestamp} [${levelName}] ${prefix}`, ...args];
      
      // Use appropriate console method based on level
      switch (level) {
        case this.LEVELS.ERROR:
          console.error(...logArgs);
          break;
        case this.LEVELS.WARN:
          console.warn(...logArgs);
          break;
        case this.LEVELS.INFO:
          console.info(...logArgs);
          break;
        case this.LEVELS.DEBUG:
          console.log(...logArgs);
          break;
        default:
          console.log(...logArgs);
          break;
      }
    }
  }
  
  /**
   * Enable verbose logging for debugging
   */
  enableVerbose() {
    this.setLevel('DEBUG');
    console.info('[SGEX:Logger] Verbose logging enabled. Use logger.setLevel("ERROR") to disable.');
  }
  
  /**
   * Disable verbose logging
   */
  disableVerbose() {
    this.setLevel('ERROR');
    console.info('[SGEX:Logger] Verbose logging disabled.');
  }
}

// Export singleton instance
const logger = new Logger();

// Make logger available globally for debugging
if (typeof window !== 'undefined') {
  window.sgexLogger = logger;
}

export default logger;