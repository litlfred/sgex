/**
 * Centralized logging utility for SGEX Workbench
 * Provides consistent, configurable logging for debugging during development
 */

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export interface LoggerConfig {
  isDevelopment?: boolean;
  defaultLevel?: LogLevel;
}

export interface ComponentLogger {
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  
  // Specialized logging methods
  apiCall: (method: string, url: string, data?: any) => void;
  apiResponse: (method: string, url: string, status: number, responseTime: number) => void;
  apiError: (method: string, url: string, error: any) => void;
  
  componentMount: (props?: any) => void;
  componentUnmount: () => void;
  stateChange: (oldState: any, newState: any) => void;
  
  userAction: (action: string, details?: any) => void;
  
  performance: (operation: string, duration: number) => void;
  
  auth: (event: string, details?: any) => void;
  
  navigation: (from: string, to: string) => void;
  
  cache: (operation: string, key: string, details?: any) => void;
}

export interface LogLevels {
  readonly ERROR: 0;
  readonly WARN: 1;
  readonly INFO: 2;
  readonly DEBUG: 3;
}

class Logger {
  private isDevelopment: boolean;
  private _levelChecked: boolean = false;
  private prefixes: Map<string, string> = new Map();
  
  public readonly LEVELS: LogLevels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  } as const;
  
  public currentLevel: number;

  constructor(config: LoggerConfig = {}) {
    // Check if we're in development mode
    this.isDevelopment = config.isDevelopment ?? process.env.NODE_ENV === 'development';
    
    // Current log level (can be overridden via localStorage)
    this.currentLevel = this.isDevelopment ? this.LEVELS.DEBUG : this.LEVELS.ERROR;
    
    if (config.defaultLevel) {
      this.currentLevel = this.LEVELS[config.defaultLevel];
    }
  }
  
  /**
   * Lazy check for stored log level
   */
  private _checkStoredLevel(): void {
    if (!this._levelChecked) {
      try {
        const storedLevel = localStorage.getItem('sgex-log-level');
        if (storedLevel && this.LEVELS[storedLevel.toUpperCase() as LogLevel] !== undefined) {
          this.currentLevel = this.LEVELS[storedLevel.toUpperCase() as LogLevel];
        }
      } catch (error) {
        // localStorage not available or error accessing it
      }
      this._levelChecked = true;
    }
  }
  
  /**
   * Set log level programmatically
   */
  setLevel(level: LogLevel): void {
    const upperLevel = level.toUpperCase() as LogLevel;
    if (this.LEVELS[upperLevel] !== undefined) {
      this.currentLevel = this.LEVELS[upperLevel];
      try {
        localStorage.setItem('sgex-log-level', upperLevel);
      } catch (error) {
        // localStorage not available
      }
    }
  }
  
  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    this._checkStoredLevel();
    const levelIndex = this.currentLevel;
    return Object.keys(this.LEVELS)[Object.values(this.LEVELS).indexOf(levelIndex)] as LogLevel;
  }
  
  /**
   * Check if a log level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    this._checkStoredLevel();
    return this.LEVELS[level] <= this.currentLevel;
  }
  
  /**
   * Get a logger instance for a specific component/service
   */
  getLogger(name: string): ComponentLogger {
    const prefix = `[SGEX:${name}]`;
    return {
      error: (...args: any[]) => this._log(this.LEVELS.ERROR, prefix, ...args),
      warn: (...args: any[]) => this._log(this.LEVELS.WARN, prefix, ...args),
      info: (...args: any[]) => this._log(this.LEVELS.INFO, prefix, ...args),
      debug: (...args: any[]) => this._log(this.LEVELS.DEBUG, prefix, ...args),
      
      // Specialized logging methods
      apiCall: (method: string, url: string, data?: any) => 
        this._log(this.LEVELS.DEBUG, prefix, `API ${method}:`, url, data ? { data } : ''),
      
      apiResponse: (method: string, url: string, status: number, responseTime: number) => 
        this._log(this.LEVELS.DEBUG, prefix, `API Response ${method}:`, url, `(${status}) ${responseTime}ms`),
      
      apiError: (method: string, url: string, error: any) => 
        this._log(this.LEVELS.ERROR, prefix, `API Error ${method}:`, url, error),
      
      componentMount: (props?: any) => 
        this._log(this.LEVELS.DEBUG, prefix, 'Component mounted', props ? { props } : ''),
      
      componentUnmount: () => 
        this._log(this.LEVELS.DEBUG, prefix, 'Component unmounted'),
      
      stateChange: (oldState: any, newState: any) => 
        this._log(this.LEVELS.DEBUG, prefix, 'State change', { from: oldState, to: newState }),
      
      userAction: (action: string, details?: any) => 
        this._log(this.LEVELS.INFO, prefix, `User action: ${action}`, details),
      
      performance: (operation: string, duration: number) => 
        this._log(this.LEVELS.INFO, prefix, `Performance: ${operation} took ${duration}ms`),
      
      auth: (event: string, details?: any) => 
        this._log(this.LEVELS.INFO, prefix, `Auth: ${event}`, details),
      
      navigation: (from: string, to: string) => 
        this._log(this.LEVELS.INFO, prefix, `Navigation: ${from} -> ${to}`),
      
      cache: (operation: string, key: string, details?: any) => 
        this._log(this.LEVELS.DEBUG, prefix, `Cache ${operation}:`, key, details)
    };
  }
  
  /**
   * Internal logging method
   */
  private _log(level: number, prefix: string, ...args: any[]): void {
    // Check stored level lazily
    this._checkStoredLevel();
    
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
  enableVerbose(): void {
    this.setLevel('DEBUG');
    console.info('[SGEX:Logger] Verbose logging enabled. Use logger.setLevel("ERROR") to disable.');
  }
  
  /**
   * Disable verbose logging
   */
  disableVerbose(): void {
    this.setLevel('ERROR');
    console.info('[SGEX:Logger] Verbose logging disabled.');
  }
  
  /**
   * Create a timer for performance logging
   */
  timer(label: string): { end: () => void } {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        this.performance(label, Math.round(duration * 100) / 100);
      }
    };
  }
  
  /**
   * Log with a custom prefix (useful for one-off logging)
   */
  withPrefix(prefix: string) {
    return {
      error: (...args: any[]) => this._log(this.LEVELS.ERROR, prefix, ...args),
      warn: (...args: any[]) => this._log(this.LEVELS.WARN, prefix, ...args),
      info: (...args: any[]) => this._log(this.LEVELS.INFO, prefix, ...args),
      debug: (...args: any[]) => this._log(this.LEVELS.DEBUG, prefix, ...args)
    };
  }
  
  // Direct logging methods on the main logger instance
  error = (...args: any[]) => this._log(this.LEVELS.ERROR, '[SGEX]', ...args);
  warn = (...args: any[]) => this._log(this.LEVELS.WARN, '[SGEX]', ...args);
  info = (...args: any[]) => this._log(this.LEVELS.INFO, '[SGEX]', ...args);
  debug = (...args: any[]) => this._log(this.LEVELS.DEBUG, '[SGEX]', ...args);
  performance = (operation: string, duration: number) => this._log(this.LEVELS.INFO, '[SGEX]', `Performance: ${operation} took ${duration}ms`);
}

// Export singleton instance
const logger = new Logger();

// Make logger available globally for debugging
declare global {
  interface Window {
    sgexLogger?: Logger;
  }
}

if (typeof window !== 'undefined') {
  window.sgexLogger = logger;
}

export default logger;

// Export commonly used logger instances
export const githubLogger = logger.getLogger('GitHub');
export const cacheLogger = logger.getLogger('Cache');
export const authLogger = logger.getLogger('Auth');
export const uiLogger = logger.getLogger('UI');
export const validationLogger = logger.getLogger('Validation');