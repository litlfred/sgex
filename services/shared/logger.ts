/**
 * Enhanced MCP Services Logging Utility
 * Leverages existing SGEX logging service with additional MCP-specific features
 * Provides service filtering, interactive/non-interactive modes, and centralized logging
 */

import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
type ServiceCategory = 'mcp-dak-faq' | 'mcp-publication-api' | 'web-service' | 'shared-service';

interface LogEntry {
  timestamp: string;
  message: string;
  level: LogLevel;
  category: string;
  serviceCategory: ServiceCategory;
}

interface MCPLoggerOptions {
  logLevel?: LogLevel;
  logFile?: string;
  serviceCategory?: ServiceCategory;
}

interface LogFilter {
  levels?: LogLevel[];
  categories?: string[];
  serviceCategories?: ServiceCategory[];
  searchText?: string;
}

class EnhancedMCPLogger {
  private serviceName: string;
  private serviceCategory: ServiceCategory;
  private isInteractive: boolean;
  private logLevel: LogLevel;
  private logFile?: string;
  private startTime: Date;
  private levels: Record<LogLevel, number>;
  private currentLevel: number;
  private colors: Record<string, string>;
  private fileStream?: WriteStream;
  private logHistory: LogEntry[] = [];
  private maxHistorySize: number = 1000;
  private filter: LogFilter = {};

  // Integration with SGEX logger
  private sgexLogger: any = null;

  constructor(serviceName: string, options: MCPLoggerOptions = {}) {
    this.serviceName = serviceName;
    this.serviceCategory = options.serviceCategory || this.inferServiceCategory(serviceName);
    this.isInteractive = process.env.MCP_INTERACTIVE === 'true';
    this.logLevel = options.logLevel || (process.env.MCP_LOG_LEVEL as LogLevel) || 'info';
    this.logFile = options.logFile;
    this.startTime = new Date();
    
    // Log levels
    this.levels = {
      error: 0,
      warn: 1, 
      info: 2,
      debug: 3,
      trace: 4
    };
    
    this.currentLevel = this.levels[this.logLevel] || this.levels.info;
    
    // Color codes for interactive mode
    this.colors = {
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      info: '\x1b[36m',    // Cyan
      debug: '\x1b[37m',   // White
      trace: '\x1b[90m',   // Gray
      success: '\x1b[32m', // Green
      reset: '\x1b[0m'     // Reset
    };
    
    // Initialize SGEX logger integration
    this.initializeSGEXIntegration();
    
    // Initialize log file if specified
    if (this.logFile) {
      this.fileStream = createWriteStream(this.logFile, { flags: 'a' });
    }
    
    this.logInitialization();
  }

  /**
   * Initialize integration with existing SGEX logging service
   */
  private initializeSGEXIntegration(): void {
    try {
      // Try to import SGEX logger if available
      if (typeof window !== 'undefined' && (window as any).sgexLogger) {
        this.sgexLogger = (window as any).sgexLogger.getLogger(this.serviceName);
      } else {
        // For Node.js environment, try to load the logger
        try {
          const loggerPath = process.cwd().includes('services') 
            ? '../../src/utils/logger.js'
            : './src/utils/logger.js';
          // Note: Dynamic import would be used in real implementation
          // this.sgexLogger = require(loggerPath).default?.getLogger(this.serviceName);
        } catch (error) {
          // SGEX logger not available, continue with standalone logging
        }
      }
    } catch (error) {
      // SGEX logger integration failed, continue with standalone logging
    }
  }

  /**
   * Get service category from directory name and package.json
   */
  private inferServiceCategory(serviceName: string): ServiceCategory {
    try {
      // Get the current working directory to determine service location
      const cwd = process.cwd();
      const pathParts = cwd.split('/');
      
      // Look for service directory name
      let serviceDir = '';
      if (pathParts.includes('services')) {
        const servicesIndex = pathParts.indexOf('services');
        if (servicesIndex + 1 < pathParts.length) {
          serviceDir = pathParts[servicesIndex + 1];
        }
      }
      
      // Try to read package.json for service category information
      try {
        const fs = require('fs');
        const path = require('path');
        
        let packageJsonPath = path.join(cwd, 'package.json');
        if (!fs.existsSync(packageJsonPath) && serviceDir) {
          // Try relative path for services
          packageJsonPath = path.join(cwd, '..', '..', 'services', serviceDir, 'package.json');
        }
        
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          
          // Check for explicit service category in package.json
          if (packageJson.serviceCategory) {
            return packageJson.serviceCategory as ServiceCategory;
          }
          
          // Infer from package name or description
          const name = packageJson.name?.toLowerCase() || '';
          const description = packageJson.description?.toLowerCase() || '';
          
          if (name.includes('dak-faq') || description.includes('faq')) {
            return 'mcp-dak-faq';
          } else if (name.includes('publication') || name.includes('dak-publication') || description.includes('publication')) {
            return 'mcp-publication-api';
          } else if (name.includes('sgex') || description.includes('workbench') || description.includes('web')) {
            return 'web-service';
          }
        }
      } catch (error) {
        // Fall back to directory-based inference
      }
      
      // Infer from directory name
      if (serviceDir) {
        if (serviceDir.includes('dak-faq') || serviceDir.includes('faq')) {
          return 'mcp-dak-faq';
        } else if (serviceDir.includes('publication') || serviceDir.includes('api')) {
          return 'mcp-publication-api';
        } else if (serviceDir.includes('web') || serviceDir.includes('sgex')) {
          return 'web-service';
        }
      }
      
      // Final fallback to service name inference
      const name = serviceName.toLowerCase();
      if (name.includes('dak-faq') || name.includes('faq')) {
        return 'mcp-dak-faq';
      } else if (name.includes('publication') || name.includes('api')) {
        return 'mcp-publication-api';
      } else if (name.includes('web') || name.includes('sgex')) {
        return 'web-service';
      } else {
        return 'shared-service';
      }
    } catch (error) {
      return 'shared-service';
    }
  }

  /**
   * Set log filter for filtering messages by category, level, or text
   */
  setFilter(filter: LogFilter): void {
    this.filter = { ...filter };
  }

  /**
   * Get filtered log history
   */
  getFilteredLogs(): LogEntry[] {
    return this.logHistory.filter(entry => this.matchesFilter(entry));
  }

  /**
   * Check if log entry matches current filter
   */
  private matchesFilter(entry: LogEntry): boolean {
    // Filter by levels
    if (this.filter.levels && !this.filter.levels.includes(entry.level)) {
      return false;
    }

    // Filter by categories
    if (this.filter.categories && !this.filter.categories.includes(entry.category)) {
      return false;
    }

    // Filter by service categories
    if (this.filter.serviceCategories && !this.filter.serviceCategories.includes(entry.serviceCategory)) {
      return false;
    }

    // Filter by search text
    if (this.filter.searchText) {
      const searchText = this.filter.searchText.toLowerCase();
      const messageText = entry.message.toLowerCase();
      if (!messageText.includes(searchText)) {
        return false;
      }
    }

    return true;
  }
  
  /**
   * Log service initialization
   */
  logInitialization(): void {
    this.info('SERVICE_INIT', `${this.serviceName} starting up...`);
    this.debug('SERVICE_INIT', `Process ID: ${process.pid}`);
    this.debug('SERVICE_INIT', `Node version: ${process.version}`);
    this.debug('SERVICE_INIT', `Platform: ${process.platform}`);
    this.debug('SERVICE_INIT', `Service Category: ${this.serviceCategory}`);
    this.debug('SERVICE_INIT', `Mode: ${this.isInteractive ? 'interactive' : 'non-interactive'}`);
  }
  
  /**
   * Log service running status
   */
  logRunning(port: number, host: string = 'localhost'): void {
    this.success('SERVICE_RUNNING', `${this.serviceName} is running on http://${host}:${port}`);
    this.info('SERVICE_RUNNING', `Started at: ${this.startTime.toISOString()}`);
  }
  
  /**
   * Log service shutdown
   */
  logShutdown(reason: string = 'Unknown'): void {
    const uptime = Date.now() - this.startTime.getTime();
    this.info('SERVICE_SHUTDOWN', `${this.serviceName} shutting down...`);
    this.info('SERVICE_SHUTDOWN', `Reason: ${reason}`);
    this.info('SERVICE_SHUTDOWN', `Uptime: ${this.formatUptime(uptime)}`);
    
    if (this.fileStream) {
      this.fileStream.end();
    }
  }
  
  /**
   * Log API queries/requests
   */
  logQuery(method: string, path: string, params: any = null, responseTime: number | null = null, statusCode: number | null = null): void {
    const timestamp = new Date().toISOString();
    let message = `${method} ${path}`;
    
    if (params) {
      message += ` | Params: ${JSON.stringify(params)}`;
    }
    
    if (responseTime !== null) {
      message += ` | ${responseTime}ms`;
    }
    
    if (statusCode !== null) {
      const statusColor = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'success';
      message += ` | ${statusCode}`;
      this.log('info', 'API_QUERY', message, statusColor);
    } else {
      this.info('API_QUERY', message);
    }
  }
  
  /**
   * Log errors with stack traces
   */
  logError(category: string, message: string, error: Error | null = null): void {
    this.error(category, message);
    if (error && error.stack) {
      this.error(category, `Stack trace: ${error.stack}`);
    }
  }
  
  /**
   * Core logging method with SGEX integration
   */
  log(level: LogLevel, category: string, message: string, colorOverride: string | null = null): void {
    const levelNum = this.levels[level];
    if (levelNum === undefined || levelNum > this.currentLevel) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.serviceName}] [${level.toUpperCase()}] [${category}]`;
    const fullMessage = `${prefix} ${message}`;
    
    // Create log entry for history
    const logEntry: LogEntry = {
      timestamp,
      message,
      level,
      category,
      serviceCategory: this.serviceCategory
    };
    
    // Add to history
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }

    // Forward to SGEX logger if available
    if (this.sgexLogger) {
      try {
        switch (level) {
          case 'error':
            this.sgexLogger.error(message);
            break;
          case 'warn':
            this.sgexLogger.warn(message);
            break;
          case 'info':
            this.sgexLogger.info(message);
            break;
          case 'debug':
            this.sgexLogger.debug(message);
            break;
          default:
            this.sgexLogger.info(message);
        }
      } catch (error) {
        // SGEX logger call failed, continue with standalone logging
      }
    }
    
    // Color for interactive mode
    const color = colorOverride || level;
    const colorCode = this.colors[color] || '';
    const resetCode = this.colors.reset;
    
    if (this.isInteractive) {
      // Interactive mode: use colored output to stdout
      console.log(`${colorCode}${fullMessage}${resetCode}`);
    } else {
      // Non-interactive mode: plain text to stderr
      console.error(fullMessage);
    }
    
    // Always write to log file if configured (without colors)
    if (this.fileStream) {
      this.fileStream.write(fullMessage + '\n');
    }
  }
  
  /**
   * Convenience methods for different log levels
   */
  error(category: string, message: string, error?: Error): void {
    this.log('error', category, message);
    if (error) {
      this.logError(category, 'Error details:', error);
    }
  }
  
  warn(category: string, message: string): void {
    this.log('warn', category, message);
  }
  
  info(category: string, message: string): void {
    this.log('info', category, message);
  }
  
  debug(category: string, message: string): void {
    this.log('debug', category, message);
  }
  
  trace(category: string, message: string): void {
    this.log('trace', category, message);
  }
  
  success(category: string, message: string): void {
    this.log('info', category, message, 'success');
  }
  
  /**
   * Format uptime duration
   */
  private formatUptime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get available service categories for filtering
   */
  static getServiceCategories(): ServiceCategory[] {
    return ['mcp-dak-faq', 'mcp-publication-api', 'web-service', 'shared-service'];
  }
}

/**
 * Factory function to create logger instances
 */
export function createMCPLogger(serviceName: string, options: MCPLoggerOptions = {}): EnhancedMCPLogger {
  return new EnhancedMCPLogger(serviceName, options);
}

/**
 * Default export for backward compatibility
 */
export default EnhancedMCPLogger;