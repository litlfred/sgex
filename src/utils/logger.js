// Simple logger utility for SGEX
class Logger {
  constructor(name) {
    this.name = name;
  }

  debug(message, data = {}) {
    console.debug(`[${this.name}] ${message}`, data);
  }

  info(message, data = {}) {
    console.info(`[${this.name}] ${message}`, data);
  }

  warn(message, data = {}) {
    console.warn(`[${this.name}] ${message}`, data);
  }

  error(message, data = {}) {
    console.error(`[${this.name}] ${message}`, data);
  }

  componentMount() {
    this.debug(`${this.name} component mounted`);
  }

  componentUnmount() {
    this.debug(`${this.name} component unmounted`);
  }

  auth(message, data = {}) {
    this.info(`[AUTH] ${message}`, data);
  }

  apiCall(method, endpoint, data = {}) {
    this.debug(`[API] ${method} ${endpoint}`, data);
  }

  apiResponse(method, endpoint, status, duration) {
    this.debug(`[API] ${method} ${endpoint} - ${status} (${duration}ms)`);
  }

  performance(operation, duration) {
    this.debug(`[PERF] ${operation} completed in ${duration}ms`);
  }
}

class LoggerService {
  getLogger(name) {
    return new Logger(name);
  }
}

const logger = new LoggerService();
export default logger;