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
        const match = repository.match(/github\.com\/([^/]+)\/([^/?#]+)/);
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
      console.log(`GitHubStorage.readFile: Cache hit for ${path}`);
      return this.cache.get(cacheKey);
    }

    try {
      const { owner, repo } = this.parseRepository(this.repository);
      console.log(`GitHubStorage.readFile: Reading file ${path} from ${owner}/${repo} (branch: ${this.branch})`);
      const contentString = await this.githubService.getFileContent(owner, repo, path, this.branch);
      
      // Convert the decoded string content to Buffer 
      // (githubService.getFileContent already decodes the base64 content to a string)
      const content = Buffer.from(contentString, 'utf-8');
      this.cache.set(cacheKey, content);
      console.log(`GitHubStorage.readFile: Successfully read file ${path}, size: ${content.length} bytes`);
      console.log(`GitHubStorage.readFile: Content preview (first 200 chars):`, contentString.substring(0, 200));
      return content;
    } catch (error) {
      console.error(`GitHubStorage.readFile: Failed to read file ${path}:`, error.message);
      throw new Error(`Failed to read file ${path}: ${error.message}`);
    }
  }

  async fileExists(path) {
    try {
      console.log(`GitHubStorage.fileExists: Checking if file exists: ${path}`);
      console.log(`GitHubStorage.fileExists: Repository: ${this.repository}, Branch: ${this.branch}`);
      
      // Validate repository format before making API call
      const { owner, repo } = this.parseRepository(this.repository);
      console.log(`GitHubStorage.fileExists: Parsed repository - owner: ${owner}, repo: ${repo}`);
      
      // Check authentication status
      if (this.githubService && this.githubService.isAuth) {
        console.log(`GitHubStorage.fileExists: Authentication status: ${this.githubService.isAuth()}`);
      } else {
        console.log(`GitHubStorage.fileExists: GitHub service not available or no auth method`);
      }
      
      await this.readFile(path);
      console.log(`GitHubStorage.fileExists: File ${path} exists`);
      return true;
    } catch (error) {
      console.log(`GitHubStorage.fileExists: File ${path} does not exist:`, error.message);
      console.log(`GitHubStorage.fileExists: Full error:`, error);
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
 * Mock storage implementation for browser testing
 * Can be used when no real storage is available
 */
export class MockStorage extends Storage {
  constructor(mockFiles = {}) {
    super();
    this.mockFiles = mockFiles;
  }

  async readFile(path) {
    if (this.mockFiles[path]) {
      return Buffer.from(this.mockFiles[path], 'utf-8');
    }
    throw new Error(`File not found: ${path}`);
  }

  async fileExists(path) {
    return this.mockFiles.hasOwnProperty(path);
  }

  async listFiles(pattern, options = {}) {
    const files = Object.keys(this.mockFiles);
    
    if (pattern.includes('*') || pattern.includes('?')) {
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      const regex = new RegExp(`^${regexPattern}$`);
      return files.filter(file => regex.test(file));
    } else {
      return files.filter(file => file.startsWith(pattern));
    }
  }

  async getFileInfo(path) {
    if (this.mockFiles[path]) {
      return {
        size: Buffer.from(this.mockFiles[path], 'utf-8').length,
        path: path,
        type: 'file'
      };
    }
    throw new Error(`File not found: ${path}`);
  }
}