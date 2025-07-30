/**
 * Simple logging utility for SGEX Workbench
 * Provides structured logging with different levels and component tracking
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor(component) {
    this.component = component;
    this.level = this.getLogLevel();
  }

  getLogLevel() {
    const level = process.env.REACT_APP_LOG_LEVEL || 'INFO';
    return LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO;
  }

  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      component: this.component,
      message,
      ...data
    };
    return logData;
  }

  log(level, message, data = {}) {
    if (LOG_LEVELS[level] <= this.level) {
      const logData = this.formatMessage(level, message, data);
      
      switch (level) {
        case 'ERROR':
          console.error(`[${logData.timestamp}] ERROR [${this.component}]:`, message, data);
          break;
        case 'WARN':
          console.warn(`[${logData.timestamp}] WARN [${this.component}]:`, message, data);
          break;
        case 'INFO':
          console.info(`[${logData.timestamp}] INFO [${this.component}]:`, message, data);
          break;
        case 'DEBUG':
          console.debug(`[${logData.timestamp}] DEBUG [${this.component}]:`, message, data);
          break;
        default:
          console.log(`[${logData.timestamp}] ${level} [${this.component}]:`, message, data);
      }
    }
  }

  error(message, data = {}) {
    this.log('ERROR', message, data);
  }

  warn(message, data = {}) {
    this.log('WARN', message, data);
  }

  info(message, data = {}) {
    this.log('INFO', message, data);
  }

  debug(message, data = {}) {
    this.log('DEBUG', message, data);
  }

  // Component lifecycle logging helpers
  componentMount() {
    this.debug(`Component ${this.component} mounted`);
  }

  componentUnmount() {
    this.debug(`Component ${this.component} unmounted`);
  }

  componentUpdate(changes = {}) {
    this.debug(`Component ${this.component} updated`, changes);
  }

  // API request logging helpers
  apiRequest(method, url, data = {}) {
    this.info(`API ${method} request to ${url}`, data);
  }

  apiResponse(method, url, status, data = {}) {
    this.info(`API ${method} response from ${url}`, { status, ...data });
  }

  apiError(method, url, error) {
    this.error(`API ${method} error for ${url}`, { 
      message: error.message,
      stack: error.stack 
    });
  }
}

// Factory function to create component-specific loggers
const logger = {
  getLogger: (component) => new Logger(component)
};

export default logger;