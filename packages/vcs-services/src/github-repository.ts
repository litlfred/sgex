import { DAKService } from '@sgex/dak-core';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  private: boolean;
  description?: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  clone_url: string;
  html_url: string;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface RepositoryPermissions {
  admin: boolean;
  push: boolean;
  pull: boolean;
}

export interface FileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

/**
 * GitHub Repository Service
 * 
 * Handles repository operations including DAK validation,
 * file operations, branch management, and repository metadata.
 */
export class GitHubRepositoryService {
  private dakService: DAKService;

  constructor(dakService: DAKService) {
    this.dakService = dakService;
  }

  /**
   * Get repository information
   */
  async getRepository(octokit: any, owner: string, repo: string): Promise<Repository> {
    try {
      const response = await octokit.rest.repos.get({
        owner,
        repo
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get repository ${owner}/${repo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get repository permissions for authenticated user
   */
  async getRepositoryPermissions(octokit: any, owner: string, repo: string): Promise<RepositoryPermissions> {
    try {
      const response = await octokit.rest.repos.get({
        owner,
        repo
      });
      
      const permissions = response.data.permissions || {};
      return {
        admin: permissions.admin || false,
        push: permissions.push || false,
        pull: permissions.pull || false
      };
    } catch (error) {
      throw new Error(`Failed to get repository permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if repository has write permissions
   */
  async hasWritePermissions(octokit: any, owner: string, repo: string): Promise<boolean> {
    try {
      const permissions = await this.getRepositoryPermissions(octokit, owner, repo);
      return permissions.push || permissions.admin;
    } catch (error) {
      return false;
    }
  }

  /**
   * List repository branches
   */
  async getBranches(octokit: any, owner: string, repo: string): Promise<Branch[]> {
    try {
      const response = await octokit.rest.repos.listBranches({
        owner,
        repo,
        per_page: 100
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get default branch
   */
  async getDefaultBranch(octokit: any, owner: string, repo: string): Promise<string> {
    try {
      const repository = await this.getRepository(octokit, owner, repo);
      return repository.default_branch;
    } catch (error) {
      throw new Error(`Failed to get default branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file content from repository
   */
  async getFileContent(octokit: any, owner: string, repo: string, path: string, ref: string = 'main'): Promise<FileContent> {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (Array.isArray(response.data)) {
        throw new Error('Path is a directory, not a file');
      }

      return response.data as FileContent;
    } catch (error) {
      throw new Error(`Failed to get file content for ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get directory contents
   */
  async getDirectoryContents(octokit: any, owner: string, repo: string, path: string = '', ref: string = 'main'): Promise<FileContent[]> {
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Path is a file, not a directory');
      }

      return response.data as FileContent[];
    } catch (error) {
      throw new Error(`Failed to get directory contents for ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if repository is a DAK
   */
  async isDAKRepository(octokit: any, owner: string, repo: string, ref: string = 'main'): Promise<boolean> {
    try {
      // Check for sushi-config.yaml file
      await this.getFileContent(octokit, owner, repo, 'sushi-config.yaml', ref);
      
      // Additional validation can be done here using DAKService
      return true;
    } catch (error) {
      try {
        // Also check for sushi-config.yml
        await this.getFileContent(octokit, owner, repo, 'sushi-config.yml', ref);
        return true;
      } catch (ymlError) {
        return false;
      }
    }
  }

  /**
   * Get DAK configuration
   */
  async getDAKConfig(octokit: any, owner: string, repo: string, ref: string = 'main'): Promise<any> {
    try {
      let configFile: FileContent;
      
      try {
        configFile = await this.getFileContent(octokit, owner, repo, 'sushi-config.yaml', ref);
      } catch (error) {
        configFile = await this.getFileContent(octokit, owner, repo, 'sushi-config.yml', ref);
      }

      // Decode content
      const content = Buffer.from(configFile.content, 'base64').toString('utf-8');
      
      // Parse YAML (would need yaml library)
      // For now, return raw content
      return { raw: content };
    } catch (error) {
      throw new Error(`Repository is not a DAK (no sushi-config.yaml found): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create or update file
   */
  async createOrUpdateFile(
    octokit: any,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch: string = 'main'
  ): Promise<any> {
    try {
      const response = await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha,
        branch
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create/update file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file
   */
  async deleteFile(
    octokit: any,
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch: string = 'main'
  ): Promise<any> {
    try {
      const response = await octokit.rest.repos.deleteFile({
        owner,
        repo,
        path,
        message,
        sha,
        branch
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create branch
   */
  async createBranch(octokit: any, owner: string, repo: string, branchName: string, fromBranch: string = 'main'): Promise<any> {
    try {
      // Get the SHA of the source branch
      const sourceRef = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranch}`
      });

      // Create new branch
      const response = await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: sourceRef.data.object.sha
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create branch ${branchName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fork repository
   */
  async forkRepository(octokit: any, owner: string, repo: string, organization?: string): Promise<Repository> {
    try {
      const response = await octokit.rest.repos.createFork({
        owner,
        repo,
        organization
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fork repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get repository commits
   */
  async getCommits(octokit: any, owner: string, repo: string, sha?: string, page: number = 1, perPage: number = 30): Promise<any[]> {
    try {
      const response = await octokit.rest.repos.listCommits({
        owner,
        repo,
        sha,
        page,
        per_page: perPage
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get commits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search repositories
   */
  async searchRepositories(octokit: any, query: string, page: number = 1, perPage: number = 30): Promise<any> {
    try {
      const response = await octokit.rest.search.repos({
        q: query,
        page,
        per_page: perPage
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search repositories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}