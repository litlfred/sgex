/**
 * Local Storage Implementation for MCP Server
 * Provides file system access for DAK FAQ operations
 */
import { StorageInterface } from '../../types.js';
export declare class LocalStorageImpl implements StorageInterface {
    private basePath;
    constructor(basePath?: string);
    /**
     * Read a file as Buffer
     */
    readFile(filePath: string): Promise<Buffer>;
    /**
     * Check if a file exists
     */
    fileExists(filePath: string): Promise<boolean>;
    /**
     * List files matching a pattern
     */
    listFiles(pattern: string, options?: Record<string, any>): Promise<string[]>;
}
//# sourceMappingURL=LocalStorageImpl.d.ts.map