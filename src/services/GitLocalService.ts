/**
 * Local Git Repository Service
 * 
 * Browser-based implementation for accessing local git repositories
 * Uses the File System Access API for directory access and isomorphic-git for git operations
 */

import git from 'isomorphic-git';
import type {
  GitHubUser,
  GitHubRepository,
  GitHubBranch,
  ServiceResponse,
  SushiConfig
} from '../types/core';

import type {
  ILocalRepoService,
  FileContent,
  DirectoryEntry,
  CommitInfo,
  RepositoryStats,
  RepositoryListResult,
  DAKValidationInfo
} from './IRepoService';

import logger from '../utils/logger';
import dakValidationService from './dakValidationService';

// File System Access API types (may not be available in all browsers)
interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
}

interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | ArrayBuffer | DataView): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>;
  }
}

class GitLocalService implements ILocalRepoService {
  private workingDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private workingDirectoryPath: string | null = null;
  private discoveredRepositories: Map<string, GitHubRepository> = new Map();
  private readonly logger: any;
  private isInitialized: boolean = false;

  constructor() {
    this.logger = logger.getLogger('GitLocalService');
    this.logger.debug('GitLocalService instance created');
  }

  // File System Access API support detection
  private get isFileSystemAccessSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  // Service identification
  get serviceType(): 'github' | 'local' {
    return 'local';
  }

  get serviceName(): string {
    return 'Local Git Repository Service';
  }

  get authenticated(): boolean {
    return this.isInitialized && this.workingDirectoryHandle !== null;
  }

  // Authentication - for local service, this means selecting a directory
  async authenticate(directoryPath?: string): Promise<boolean> {
    this.logger.debug('Authenticating local service', { directoryPath });

    try {
      if (!this.isFileSystemAccessSupported) {
        this.logger.error('File System Access API not supported in this browser');
        return false;
      }

      // If no specific path provided, prompt user to select directory
      if (!directoryPath) {
        const picker = window.showDirectoryPicker;
        if (!picker) {
          this.logger.error('Directory picker not available');
          return false;
        }
        this.workingDirectoryHandle = await picker({ mode: 'readwrite' });
        if (!this.workingDirectoryHandle) {
          return false;
        }
        this.workingDirectoryPath = this.workingDirectoryHandle.name;
      }

      this.isInitialized = true;
      this.logger.debug('Local service authenticated successfully', { 
        directoryName: this.workingDirectoryHandle?.name 
      });

      // Scan for repositories in the selected directory
      await this.scanCurrentDirectory();

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to authenticate local service', { error: errorMessage });
      return false;
    }
  }

  signOut(): void {
    this.logger.debug('Signing out from local service');
    this.workingDirectoryHandle = null;
    this.workingDirectoryPath = null;
    this.discoveredRepositories.clear();
    this.isInitialized = false;
  }

  // Local directory management
  async setWorkingDirectory(directoryPath: string): Promise<ServiceResponse<void>> {
    this.logger.debug('Setting working directory', { directoryPath });
    
    try {
      // For now, we can only work with the File System Access API selection
      // In a real implementation, this might store the path preference
      this.workingDirectoryPath = directoryPath;
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set working directory'
      };
    }
  }

  getWorkingDirectory(): string | null {
    return this.workingDirectoryPath;
  }

  // Repository discovery
  async scanLocalDirectory(directoryPath: string): Promise<ServiceResponse<GitHubRepository[]>> {
    this.logger.debug('Scanning local directory for repositories', { directoryPath });

    try {
      if (!this.workingDirectoryHandle) {
        return {
          success: false,
          error: 'No working directory selected. Please authenticate first.'
        };
      }

      const repositories = await this.scanDirectoryForRepos(this.workingDirectoryHandle);
      
      // Store discovered repositories
      repositories.forEach(repo => {
        this.discoveredRepositories.set(`${repo.owner.login}/${repo.name}`, repo);
      });

      this.logger.debug(`Found ${repositories.length} repositories`, { 
        repositories: repositories.map(r => r.full_name) 
      });

      return { success: true, data: repositories };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to scan local directory', { error: errorMessage });
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  private async scanCurrentDirectory(): Promise<void> {
    if (this.workingDirectoryHandle) {
      await this.scanLocalDirectory(this.workingDirectoryHandle.name);
    }
  }

  private async scanDirectoryForRepos(dirHandle: FileSystemDirectoryHandle): Promise<GitHubRepository[]> {
    const repositories: GitHubRepository[] = [];

    try {
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'directory') {
          const directoryHandle = handle as unknown as FileSystemDirectoryHandle;
          // Check if this directory is a git repository
          const isGitRepo = await this.isGitRepository(directoryHandle);
          if (isGitRepo) {
            const repo = await this.createRepositoryFromDirectory(directoryHandle);
            if (repo) {
              repositories.push(repo);
            }
          } else {
            // Recursively scan subdirectories (limited depth)
            const subRepos = await this.scanDirectoryForRepos(directoryHandle);
            repositories.push(...subRepos);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Error scanning directory', { error: errorMessage });
    }

    return repositories;
  }

  private async isGitRepository(dirHandle: FileSystemDirectoryHandle): Promise<boolean> {
    try {
      await dirHandle.getDirectoryHandle('.git');
      return true;
    } catch {
      return false;
    }
  }

  private async createRepositoryFromDirectory(dirHandle: FileSystemDirectoryHandle): Promise<GitHubRepository | null> {
    try {
      // Create a basic repository object from the directory
      const now = new Date().toISOString();
      
      // Get repository name and try to extract owner from git config
      const owner = await this.getRepositoryOwner(dirHandle) || 'local-user';
      
      const repository: GitHubRepository = {
        id: Math.floor(Math.random() * 1000000), // Generate pseudo-ID
        node_id: `local_${dirHandle.name}`,
        name: dirHandle.name,
        full_name: `${owner}/${dirHandle.name}`,
        private: false, // Assume public for local repos
        owner: {
          login: owner,
          id: 1,
          node_id: `local_user_${owner}`,
          avatar_url: '/sgex/cat-paw-icon.svg', // Use SGEX mascot as default
          gravatar_id: '',
          url: '',
          html_url: '',
          followers_url: '',
          following_url: '',
          gists_url: '',
          starred_url: '',
          subscriptions_url: '',
          organizations_url: '',
          repos_url: '',
          events_url: '',
          received_events_url: '',
          type: 'User',
          site_admin: false,
          public_repos: 0,
          public_gists: 0,
          followers: 0,
          following: 0,
          created_at: now,
          updated_at: now
        },
        html_url: `file:///${dirHandle.name}`,
        description: `Local repository: ${dirHandle.name}`,
        fork: false,
        url: '',
        archive_url: '',
        assignees_url: '',
        blobs_url: '',
        branches_url: '',
        collaborators_url: '',
        comments_url: '',
        commits_url: '',
        compare_url: '',
        contents_url: '',
        contributors_url: '',
        deployments_url: '',
        downloads_url: '',
        events_url: '',
        forks_url: '',
        git_commits_url: '',
        git_refs_url: '',
        git_tags_url: '',
        git_url: '',
        issue_comment_url: '',
        issue_events_url: '',
        issues_url: '',
        keys_url: '',
        labels_url: '',
        languages_url: '',
        merges_url: '',
        milestones_url: '',
        notifications_url: '',
        pulls_url: '',
        releases_url: '',
        ssh_url: '',
        stargazers_url: '',
        statuses_url: '',
        subscribers_url: '',
        subscription_url: '',
        tags_url: '',
        teams_url: '',
        trees_url: '',
        clone_url: '',
        mirror_url: undefined,
        hooks_url: '',
        svn_url: '',
        homepage: undefined,
        language: undefined,
        forks_count: 0,
        stargazers_count: 0,
        watchers_count: 0,
        size: 0,
        default_branch: 'main',
        open_issues_count: 0,
        is_template: false,
        topics: [],
        has_issues: false,
        has_projects: false,
        has_wiki: false,
        has_pages: false,
        has_downloads: false,
        archived: false,
        disabled: false,
        visibility: 'public',
        pushed_at: now,
        created_at: now,
        updated_at: now,
        permissions: {
          admin: true,
          push: true,
          pull: true
        }
      };

      return repository;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to create repository from directory', { 
        directory: dirHandle.name, 
        error: errorMessage
      });
      return null;
    }
  }

  private async getRepositoryOwner(dirHandle: FileSystemDirectoryHandle): Promise<string | null> {
    try {
      // Try to read git config to get user name
      const gitDir = await dirHandle.getDirectoryHandle('.git');
      const configFile = await gitDir.getFileHandle('config');
      const file = await configFile.getFile();
      const content = await file.text();
      
      // Parse basic git config for user name
      const userMatch = content.match(/\[user\][\s\S]*?name\s*=\s*(.+)/i);
      if (userMatch && userMatch[1]) {
        return userMatch[1].trim().replace(/"/g, '');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.debug('Could not read git config', { error: errorMessage });
    }
    
    return null;
  }

  // Placeholder implementations for required interface methods
  async getCurrentUser(): Promise<ServiceResponse<GitHubUser>> {
    const user: GitHubUser = {
      login: 'local-user',
      id: 1,
      node_id: 'local_user',
      avatar_url: '/sgex/cat-paw-icon.svg',
      gravatar_id: '',
      url: '',
      html_url: '',
      followers_url: '',
      following_url: '',
      gists_url: '',
      starred_url: '',
      subscriptions_url: '',
      organizations_url: '',
      repos_url: '',
      events_url: '',
      received_events_url: '',
      type: 'User',
      site_admin: false,
      public_repos: 0,
      public_gists: 0,
      followers: 0,
      following: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return { success: true, data: user };
  }

  async listRepositories(owner: string, type?: 'user' | 'org'): Promise<ServiceResponse<RepositoryListResult>> {
    const repositories = Array.from(this.discoveredRepositories.values());
    const filteredRepos = repositories.filter(repo => repo.owner.login === owner);

    return {
      success: true,
      data: {
        repositories: filteredRepos,
        totalCount: filteredRepos.length,
        hasMore: false
      }
    };
  }

  async getRepository(owner: string, repo: string): Promise<ServiceResponse<GitHubRepository>> {
    const key = `${owner}/${repo}`;
    const repository = this.discoveredRepositories.get(key);

    if (!repository) {
      return {
        success: false,
        error: `Repository ${key} not found in local repositories`
      };
    }

    return { success: true, data: repository };
  }

  async validateDAKRepository(owner: string, repo: string, branch = 'main'): Promise<DAKValidationInfo> {
    try {
      // Try to get the sushi-config.yaml file
      const sushiConfigContent = await this.getFileContent(owner, repo, 'sushi-config.yaml', branch);
      
      // Use existing DAK validation service
      // We need to adapt it for local content rather than GitHub API
      const isDak = sushiConfigContent.includes('smart.who.int.base');
      
      return {
        isDak,
        validationError: isDak ? undefined : 'No smart.who.int.base dependency found'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        isDak: false,
        validationError: `Could not read sushi-config.yaml: ${errorMessage}`
      };
    }
  }

  async getBranches(owner: string, repo: string): Promise<ServiceResponse<GitHubBranch[]>> {
    // TODO: Implement using isomorphic-git to list branches
    const branches: GitHubBranch[] = [
      {
        name: 'main',
        commit: {
          sha: 'local-commit-sha',
          url: ''
        },
        protected: false
      }
    ];

    return { success: true, data: branches };
  }

  async getFileContent(owner: string, repo: string, path: string, ref = 'main'): Promise<string> {
    this.logger.debug('Getting file content', { owner, repo, path, ref });

    if (!this.workingDirectoryHandle) {
      throw new Error('No working directory selected');
    }

    try {
      // Navigate to the repository directory
      const repoHandle = await this.workingDirectoryHandle.getDirectoryHandle(repo);
      
      // Navigate to the file path
      const pathParts = path.split('/').filter(part => part.length > 0);
      let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle = repoHandle;

      // Navigate through directories
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (currentHandle.kind !== 'directory') {
          throw new Error(`Path component '${pathParts[i]}' is not a directory`);
        }
        currentHandle = await (currentHandle as FileSystemDirectoryHandle).getDirectoryHandle(pathParts[i]);
      }

      // Get the final file
      const fileName = pathParts[pathParts.length - 1];
      const fileHandle = await (currentHandle as FileSystemDirectoryHandle).getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const content = await file.text();

      this.logger.debug('Successfully read file content', { 
        path, 
        contentLength: content.length 
      });

      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to read file content', { 
        owner, 
        repo, 
        path, 
        error: errorMessage
      });
      throw new Error(`Failed to read file ${path}: ${errorMessage}`);
    }
  }

  // Additional methods required by interface - basic implementations
  async createFile(owner: string, repo: string, path: string, content: string): Promise<ServiceResponse<void>> {
    return { success: false, error: 'Not yet implemented' };
  }

  async deleteFile(owner: string, repo: string, path: string): Promise<ServiceResponse<void>> {
    return { success: false, error: 'Not yet implemented' };
  }

  async renameFile(owner: string, repo: string, oldPath: string, newPath: string): Promise<ServiceResponse<void>> {
    return { success: false, error: 'Not yet implemented' };
  }

  async getGitStatus(owner: string, repo: string): Promise<ServiceResponse<any>> {
    return { success: false, error: 'Not yet implemented' };
  }

  async resetChanges(owner: string, repo: string, path?: string): Promise<ServiceResponse<void>> {
    return { success: false, error: 'Not yet implemented' };
  }
}

export default GitLocalService;