/**
 * Enhanced MCP Services Logging Utility
 * Leverages existing SGEX logging service with additional MCP-specific features
 * Provides service filtering, interactive/non-interactive modes, and centralized logging
 */
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
declare class EnhancedMCPLogger {
    private serviceName;
    private serviceCategory;
    private isInteractive;
    private logLevel;
    private logFile?;
    private startTime;
    private levels;
    private currentLevel;
    private colors;
    private fileStream?;
    private logHistory;
    private maxHistorySize;
    private filter;
    private sgexLogger;
    constructor(serviceName: string, options?: MCPLoggerOptions);
    /**
     * Initialize integration with existing SGEX logging service
     */
    private initializeSGEXIntegration;
    /**
     * Get service category from directory name and package.json
     */
    private inferServiceCategory;
    /**
     * Set log filter for filtering messages by category, level, or text
     */
    setFilter(filter: LogFilter): void;
    /**
     * Get filtered log history
     */
    getFilteredLogs(): LogEntry[];
    /**
     * Check if log entry matches current filter
     */
    private matchesFilter;
    /**
     * Log service initialization
     */
    logInitialization(): void;
    /**
     * Log service running status
     */
    logRunning(port: number, host?: string): void;
    /**
     * Log service shutdown
     */
    logShutdown(reason?: string): void;
    /**
     * Log API queries/requests
     */
    logQuery(method: string, path: string, params?: any, responseTime?: number | null, statusCode?: number | null): void;
    /**
     * Log errors with stack traces
     */
    logError(category: string, message: string, error?: Error | null): void;
    /**
     * Core logging method with SGEX integration
     */
    log(level: LogLevel, category: string, message: string, colorOverride?: string | null): void;
    /**
     * Convenience methods for different log levels
     */
    error(category: string, message: string, error?: Error): void;
    warn(category: string, message: string): void;
    info(category: string, message: string): void;
    debug(category: string, message: string): void;
    trace(category: string, message: string): void;
    success(category: string, message: string): void;
    /**
     * Format uptime duration
     */
    private formatUptime;
    /**
     * Get available service categories for filtering
     */
    static getServiceCategories(): ServiceCategory[];
}
/**
 * Factory function to create logger instances
 */
export declare function createMCPLogger(serviceName: string, options?: MCPLoggerOptions): EnhancedMCPLogger;
/**
 * Default export for backward compatibility
 */
export default EnhancedMCPLogger;
//# sourceMappingURL=logger.d.ts.map