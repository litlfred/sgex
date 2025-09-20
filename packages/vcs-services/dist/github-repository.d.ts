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
export declare class GitHubRepositoryService {
    private dakService;
    constructor(dakService: DAKService);
    /**
     * Get repository information
     */
    getRepository(octokit: any, owner: string, repo: string): Promise<Repository>;
    /**
     * Get repository permissions for authenticated user
     */
    getRepositoryPermissions(octokit: any, owner: string, repo: string): Promise<RepositoryPermissions>;
    /**
     * Check if repository has write permissions
     */
    hasWritePermissions(octokit: any, owner: string, repo: string): Promise<boolean>;
    /**
     * List repository branches
     */
    getBranches(octokit: any, owner: string, repo: string): Promise<Branch[]>;
    /**
     * Get default branch
     */
    getDefaultBranch(octokit: any, owner: string, repo: string): Promise<string>;
    /**
     * Get file content from repository
     */
    getFileContent(octokit: any, owner: string, repo: string, path: string, ref?: string): Promise<FileContent>;
    /**
     * Get directory contents
     */
    getDirectoryContents(octokit: any, owner: string, repo: string, path?: string, ref?: string): Promise<FileContent[]>;
    /**
     * Check if repository is a DAK
     */
    isDAKRepository(octokit: any, owner: string, repo: string, ref?: string): Promise<boolean>;
    /**
     * Get DAK configuration
     */
    getDAKConfig(octokit: any, owner: string, repo: string, ref?: string): Promise<any>;
    /**
     * Create or update file
     */
    createOrUpdateFile(octokit: any, owner: string, repo: string, path: string, content: string, message: string, sha?: string, branch?: string): Promise<any>;
    /**
     * Delete file
     */
    deleteFile(octokit: any, owner: string, repo: string, path: string, message: string, sha: string, branch?: string): Promise<any>;
    /**
     * Create branch
     */
    createBranch(octokit: any, owner: string, repo: string, branchName: string, fromBranch?: string): Promise<any>;
    /**
     * Fork repository
     */
    forkRepository(octokit: any, owner: string, repo: string, organization?: string): Promise<Repository>;
    /**
     * Get repository commits
     */
    getCommits(octokit: any, owner: string, repo: string, sha?: string, page?: number, perPage?: number): Promise<any[]>;
    /**
     * Search repositories
     */
    searchRepositories(octokit: any, query: string, page?: number, perPage?: number): Promise<any>;
}
//# sourceMappingURL=github-repository.d.ts.map