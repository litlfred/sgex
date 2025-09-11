/**
 * Repository Service Interface
 * 
 * Unified interface for repository operations that can be implemented
 * by both GitHubService (remote) and GitLocalService (local)
 */

import type {
  GitHubUser,
  GitHubRepository,
  GitHubBranch,
  DAKRepository,
  ServiceResponse,
  SushiConfig
} from '../types/core';

export interface FileContent {
  content: string;
  path: string;
  sha?: string;
  size: number;
  encoding?: string;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha?: string;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url?: string;
}

export interface RepositoryStats {
  commits: number;
  branches: number;
  contributors: number;
  lastCommit?: CommitInfo;
}

/**
 * Repository operation result types
 */
export interface RepositoryListResult {
  repositories: GitHubRepository[];
  totalCount: number;
  hasMore: boolean;
}

export interface DAKValidationInfo {
  isDak: boolean;
  sushiConfig?: SushiConfig;
  validationError?: string;
}

/**
 * Main repository service interface
 */
export interface IRepoService {
  // Authentication and initialization
  authenticate(token?: string): Promise<boolean>;
  signOut(): void;
  readonly authenticated: boolean;
  
  // User and organization management
  getCurrentUser(): Promise<ServiceResponse<GitHubUser>>;
  getUserOrganizations?(): Promise<ServiceResponse<GitHubUser[]>>;
  getUser?(username: string): Promise<ServiceResponse<GitHubUser>>;
  getOrganization?(orgLogin: string): Promise<ServiceResponse<GitHubUser>>;
  
  // Repository discovery and management
  listRepositories(owner: string, type?: 'user' | 'org'): Promise<ServiceResponse<RepositoryListResult>>;
  getRepository(owner: string, repo: string): Promise<ServiceResponse<GitHubRepository>>;
  validateDAKRepository(owner: string, repo: string, branch?: string): Promise<DAKValidationInfo>;
  
  // Branch operations
  getBranches(owner: string, repo: string): Promise<ServiceResponse<GitHubBranch[]>>;
  getBranch?(owner: string, repo: string, branch: string): Promise<ServiceResponse<GitHubBranch>>;
  createBranch?(owner: string, repo: string, branchName: string, fromBranch?: string): Promise<ServiceResponse<GitHubBranch>>;
  
  // File operations
  getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string>;
  listFiles?(owner: string, repo: string, path?: string, ref?: string): Promise<ServiceResponse<DirectoryEntry[]>>;
  
  // Staging and commit operations (optional for read-only services)
  stageFile?(owner: string, repo: string, path: string, content: string): Promise<ServiceResponse<void>>;
  unstageFile?(owner: string, repo: string, path: string): Promise<ServiceResponse<void>>;
  commit?(owner: string, repo: string, message: string, branch?: string): Promise<ServiceResponse<CommitInfo>>;
  
  // Repository statistics and metadata
  getRepositoryStats?(owner: string, repo: string, branch?: string): Promise<ServiceResponse<RepositoryStats>>;
  
  // Service type identification
  readonly serviceType: 'github' | 'local';
  readonly serviceName: string;
}

/**
 * Local repository service specific interface
 */
export interface ILocalRepoService extends IRepoService {
  // Local-specific methods
  scanLocalDirectory(directoryPath: string): Promise<ServiceResponse<GitHubRepository[]>>;
  setWorkingDirectory(directoryPath: string): Promise<ServiceResponse<void>>;
  getWorkingDirectory(): string | null;
  
  // Local file system operations
  createFile(owner: string, repo: string, path: string, content: string): Promise<ServiceResponse<void>>;
  deleteFile(owner: string, repo: string, path: string): Promise<ServiceResponse<void>>;
  renameFile(owner: string, repo: string, oldPath: string, newPath: string): Promise<ServiceResponse<void>>;
  
  // Git operations
  getGitStatus(owner: string, repo: string): Promise<ServiceResponse<any>>;
  resetChanges(owner: string, repo: string, path?: string): Promise<ServiceResponse<void>>;
}

/**
 * Service factory interface
 */
export interface IRepoServiceFactory {
  createGitHubService(): IRepoService;
  createLocalService(): ILocalRepoService;
  getCurrentService(): IRepoService;
  switchToService(serviceType: 'github' | 'local'): IRepoService;
}

export default IRepoService;