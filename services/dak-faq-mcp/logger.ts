/**
 * Centralized MCP Services Logging Utility
 * Provides consistent logging across all MCP services with support for
 * both interactive and non-interactive modes
 */

import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface LogEntry {
  timestamp: string;
  message: string;
  level: LogLevel;
}

interface MCPLoggerOptions {
  logLevel?: LogLevel;
  logFile?: string;
}

class MCPLogger {
  private serviceName: string;
  private isInteractive: boolean;
  private logLevel: LogLevel;
  private logFile?: string;
  private startTime: Date;
  private levels: Record<LogLevel, number>;
  private currentLevel: number;
  private colors: Record<string, string>;
  private fileStream?: WriteStream;

  constructor(serviceName: string, options: MCPLoggerOptions = {}) {
    this.serviceName = serviceName;
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
    
    // Initialize log file if specified
    if (this.logFile) {
      this.fileStream = createWriteStream(this.logFile, { flags: 'a' });
    }
    
    this.logInitialization();
  }
  
  /**
   * Log service initialization
   */
  logInitialization(): void {
    this.info('SERVICE_INIT', `${this.serviceName} starting up...`);
    this.debug('SERVICE_INIT', `Process ID: ${process.pid}`);
    this.debug('SERVICE_INIT', `Node version: ${process.version}`);
    this.debug('SERVICE_INIT', `Platform: ${process.platform}`);
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
   * Core logging method
   */
  log(level: LogLevel, category: string, message: string, colorOverride: string | null = null): void {
    const levelNum = this.levels[level];
    if (levelNum === undefined || levelNum > this.currentLevel) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.serviceName}] [${level.toUpperCase()}] [${category}]`;
    const fullMessage = `${prefix} ${message}`;
    
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
}

/**
 * Factory function to create logger instances
 */
export function createMCPLogger(serviceName: string, options: MCPLoggerOptions = {}): MCPLogger {
  return new MCPLogger(serviceName, options);
}

/**
 * Default export for backward compatibility
 */
export default MCPLogger;