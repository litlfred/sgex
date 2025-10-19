/**
 * Service for managing DAK branch context in session storage
 * Stores selected branch per repository to maintain context during DAK editing
 */

/**
 * Repository information for branch context
 * @example { "name": "anc-dak", "owner": { "login": "who" }, "full_name": "who/anc-dak" }
 */
export interface RepositoryInfo {
  /** Repository name */
  name: string;
  /** Repository owner information */
  owner?: {
    /** Owner username */
    login: string;
  };
  /** Full repository name (owner/repo) */
  full_name?: string;
}

/**
 * Branch context storage mapping repository keys to branch names
 * @example { "who/anc-dak": "main", "who/immunization-dak": "develop" }
 */
export interface BranchContext {
  [repositoryKey: string]: string;
}

/**
 * Service for managing DAK branch context
 */
class BranchContextService {
  private readonly storageKey: string = 'sgex_branch_context';

  /**
   * Get the storage key for a specific repository
   * @param repository - Repository information
   * @returns Repository key in format "owner/name" or null if invalid
   * @example
   * const key = service.getRepositoryKey({ name: "anc-dak", owner: { login: "who" } });
   * // Returns: "who/anc-dak"
   */
  getRepositoryKey(repository: RepositoryInfo | null | undefined): string | null {
    if (!repository || !repository.name) return null;
    const owner = repository.owner?.login || repository.full_name?.split('/')[0];
    if (!owner) return null;
    return `${owner}/${repository.name}`;
  }

  /**
   * Get the selected branch for a repository
   * @param repository - Repository information
   * @returns Selected branch name or null if not found
   * @example
   * const branch = service.getSelectedBranch(repository);
   * // Returns: "main" or null
   */
  getSelectedBranch(repository: RepositoryInfo | null | undefined): string | null {
    if (!repository) return null;
    
    try {
      const branchContext = this.getBranchContext();
      const repoKey = this.getRepositoryKey(repository);
      return repoKey ? branchContext[repoKey] || null : null;
    } catch (error) {
      console.warn('Failed to get branch context:', error);
      return null;
    }
  }

  /**
   * Set the selected branch for a repository
   * @param repository - Repository information
   * @param branch - Branch name to set
   * @example
   * service.setSelectedBranch(repository, "main");
   */
  setSelectedBranch(repository: RepositoryInfo | null | undefined, branch: string | null | undefined): void {
    if (!repository || !branch) return;

    try {
      const branchContext = this.getBranchContext();
      const repoKey = this.getRepositoryKey(repository);
      if (repoKey) {
        branchContext[repoKey] = branch;
        this.setBranchContext(branchContext);
      }
    } catch (error) {
      console.warn('Failed to set branch context:', error);
    }
  }

  /**
   * Clear branch context for a specific repository
   * @param repository - Repository information
   * @example
   * service.clearRepositoryBranch(repository);
   */
  clearRepositoryBranch(repository: RepositoryInfo | null | undefined): void {
    if (!repository) return;

    try {
      const branchContext = this.getBranchContext();
      const repoKey = this.getRepositoryKey(repository);
      if (repoKey && repoKey in branchContext) {
        delete branchContext[repoKey];
        this.setBranchContext(branchContext);
      }
    } catch (error) {
      console.warn('Failed to clear branch context:', error);
    }
  }

  /**
   * Get all branch context from session storage
   * @returns Branch context object mapping repository keys to branch names
   * @private
   */
  private getBranchContext(): BranchContext {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to read branch context from session storage:', error);
      return {};
    }
  }

  /**
   * Save branch context to session storage
   * @param branchContext - Branch context object to save
   * @private
   */
  private setBranchContext(branchContext: BranchContext): void {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(branchContext));
    } catch (error) {
      console.error('Failed to save branch context to session storage:', error);
    }
  }

  /**
   * Clear all branch context
   * @example
   * service.clearAll();
   */
  clearAll(): void {
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear branch context:', error);
    }
  }

  /**
   * Get all stored branch contexts
   * @returns Object mapping repository keys to branch names
   * @example
   * const contexts = service.getAllBranchContexts();
   * // Returns: { "who/anc-dak": "main", "who/immunization-dak": "develop" }
   */
  getAllBranchContexts(): BranchContext {
    return this.getBranchContext();
  }
}

// Export singleton instance
const branchContextService = new BranchContextService();
export default branchContextService;
