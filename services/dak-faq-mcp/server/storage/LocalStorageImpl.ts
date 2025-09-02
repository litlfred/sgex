/**
 * Local Storage Implementation for MCP Server
 * Provides file system access for DAK FAQ operations
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { StorageInterface } from '../../types.js';

export class LocalStorageImpl implements StorageInterface {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  /**
   * Read a file as Buffer
   */
  async readFile(filePath: string): Promise<Buffer> {
    try {
      const fullPath = path.resolve(this.basePath, filePath);
      return await fs.readFile(fullPath);
    } catch (error: any) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(this.basePath, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List files matching a pattern
   */
  async listFiles(pattern: string, options: Record<string, any> = {}): Promise<string[]> {
    try {
      const fullPattern = path.resolve(this.basePath, pattern);
      const files = await glob(fullPattern, {
        ...options,
        absolute: false
      });
      
      // Return paths relative to base path
      return files.map(file => path.relative(this.basePath, file));
    } catch (error: any) {
      throw new Error(`Failed to list files with pattern ${pattern}: ${error.message}`);
    }
  }
}