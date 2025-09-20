/**
 * Local Storage Implementation for MCP Server
 * Provides file system access for DAK FAQ operations
 */
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
export class LocalStorageImpl {
    basePath;
    constructor(basePath = process.cwd()) {
        this.basePath = basePath;
    }
    /**
     * Read a file as Buffer
     */
    async readFile(filePath) {
        try {
            const fullPath = path.resolve(this.basePath, filePath);
            return await fs.readFile(fullPath);
        }
        catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error.message}`);
        }
    }
    /**
     * Check if a file exists
     */
    async fileExists(filePath) {
        try {
            const fullPath = path.resolve(this.basePath, filePath);
            await fs.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * List files matching a pattern
     */
    async listFiles(pattern, options = {}) {
        try {
            const fullPattern = path.resolve(this.basePath, pattern);
            const files = await glob(fullPattern, {
                ...options,
                absolute: false
            });
            // Return paths relative to base path
            return files.map(file => path.relative(this.basePath, file));
        }
        catch (error) {
            throw new Error(`Failed to list files with pattern ${pattern}: ${error.message}`);
        }
    }
}
//# sourceMappingURL=LocalStorageImpl.js.map