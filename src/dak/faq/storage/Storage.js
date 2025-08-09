/**
 * Storage abstraction interface for FAQ questions
 * Provides unified access to file system operations for local repositories
 */

export class Storage {
  /**
   * Read a file from the repository
   * @param {string} path - Relative path to the file
   * @returns {Promise<Buffer>} - File content as Buffer
   */
  async readFile(path) {
    throw new Error('readFile must be implemented by subclass');
  }

  /**
   * Check if a file exists
   * @param {string} path - Relative path to the file
   * @returns {Promise<boolean>} - Whether the file exists
   */
  async fileExists(path) {
    throw new Error('fileExists must be implemented by subclass');
  }

  /**
   * List files matching a pattern
   * @param {string} pattern - Glob pattern or prefix
   * @param {Object} options - Options for listing
   * @returns {Promise<string[]>} - Array of matching file paths
   */
  async listFiles(pattern, options = {}) {
    throw new Error('listFiles must be implemented by subclass');
  }

  /**
   * Get file metadata
   * @param {string} path - Relative path to the file
   * @returns {Promise<Object>} - File metadata (size, modified, etc.)
   */
  async getFileInfo(path) {
    throw new Error('getFileInfo must be implemented by subclass');
  }
}

/**
 * GitHub-based storage implementation
 * Provides access to files in GitHub repositories
 */
export class GitHubStorage extends Storage {
  constructor(githubService, repository, branch = 'main') {
    super();
    this.githubService = githubService;
    this.repository = repository;
    this.branch = branch;
    this.cache = new Map();
  }

  /**
   * Parse repository string into owner/repo
   * @param {string} repository - Repository in format "owner/repo" or GitHub URL
   * @returns {Object} - {owner, repo}
   */
  parseRepository(repository) {
    if (typeof repository === 'string') {
      // Handle GitHub URLs
      if (repository.includes('github.com')) {
        const match = repository.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
        if (match) {
          return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
        }
      }
      
      // Handle owner/repo format
      const parts = repository.split('/');
      if (parts.length === 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }
    
    throw new Error(`Invalid repository format: ${repository}`);
  }

  async readFile(path) {
    const cacheKey = `${this.repository}:${this.branch}:${path}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const { owner, repo } = this.parseRepository(this.repository);
      const response = await this.githubService.getFileContent(owner, repo, path, this.branch);
      
      // GitHub API returns base64 encoded content
      const content = Buffer.from(response.content, 'base64');
      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error.message}`);
    }
  }

  async fileExists(path) {
    try {
      await this.readFile(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  async listFiles(pattern, options = {}) {
    try {
      const { owner, repo } = this.parseRepository(this.repository);
      
      // For GitHub API, we need to get the repository tree
      const tree = await this.githubService.getRepositoryTree(owner, repo, this.branch, true);
      
      // Filter files based on pattern
      const files = tree.tree
        .filter(item => item.type === 'blob')
        .map(item => item.path);

      // Simple pattern matching (could be enhanced with proper glob support)
      if (pattern.includes('*') || pattern.includes('?')) {
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        return files.filter(file => regex.test(file));
      } else {
        // Prefix matching
        return files.filter(file => file.startsWith(pattern));
      }
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async getFileInfo(path) {
    try {
      const { owner, repo } = this.parseRepository(this.repository);
      const response = await this.githubService.getFileContent(owner, repo, path, this.branch);
      
      return {
        size: Buffer.from(response.content, 'base64').length,
        sha: response.sha,
        path: response.path,
        type: response.type,
        url: response.html_url
      };
    } catch (error) {
      throw new Error(`Failed to get file info for ${path}: ${error.message}`);
    }
  }
}

/**
 * Local file system storage implementation
 * For MCP server and local development
 */
export class LocalStorage extends Storage {
  constructor(rootPath) {
    super();
    this.rootPath = rootPath;
  }

  async readFile(path) {
    const fs = require('fs').promises;
    const fullPath = require('path').join(this.rootPath, path);
    
    // Security check: ensure path is within root directory
    if (!require('path').resolve(fullPath).startsWith(require('path').resolve(this.rootPath))) {
      throw new Error('Path traversal not allowed');
    }
    
    try {
      return await fs.readFile(fullPath);
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error.message}`);
    }
  }

  async fileExists(path) {
    const fs = require('fs').promises;
    const fullPath = require('path').join(this.rootPath, path);
    
    try {
      await fs.access(fullPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  async listFiles(pattern, options = {}) {
    const glob = require('glob');
    const fullPattern = require('path').join(this.rootPath, pattern);
    
    return new Promise((resolve, reject) => {
      glob(fullPattern, options, (err, files) => {
        if (err) {
          reject(new Error(`Failed to list files: ${err.message}`));
        } else {
          // Return relative paths
          const relativePaths = files.map(file => 
            require('path').relative(this.rootPath, file)
          );
          resolve(relativePaths);
        }
      });
    });
  }

  async getFileInfo(path) {
    const fs = require('fs').promises;
    const fullPath = require('path').join(this.rootPath, path);
    
    try {
      const stats = await fs.stat(fullPath);
      return {
        size: stats.size,
        modified: stats.mtime,
        created: stats.birthtime,
        path: path
      };
    } catch (error) {
      throw new Error(`Failed to get file info for ${path}: ${error.message}`);
    }
  }
}