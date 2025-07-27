/**
 * Service for managing DAK branch context in session storage
 * Stores selected branch per repository to maintain context during DAK editing
 */

class BranchContextService {
  constructor() {
    this.storageKey = 'sgex_branch_context';
  }

  // Get the storage key for a specific repository
  getRepositoryKey(repository) {
    if (!repository || !repository.name) return null;
    const owner = repository.owner?.login || repository.full_name?.split('/')[0];
    if (!owner) return null;
    return `${owner}/${repository.name}`;
  }

  // Get the selected branch for a repository
  getSelectedBranch(repository) {
    if (!repository) return null;
    
    try {
      const branchContext = this.getBranchContext();
      const repoKey = this.getRepositoryKey(repository);
      return branchContext[repoKey] || null;
    } catch (error) {
      console.warn('Failed to get branch context:', error);
      return null;
    }
  }

  // Set the selected branch for a repository
  setSelectedBranch(repository, branch) {
    if (!repository || !branch) return;

    try {
      const branchContext = this.getBranchContext();
      const repoKey = this.getRepositoryKey(repository);
      branchContext[repoKey] = branch;
      this.setBranchContext(branchContext);
    } catch (error) {
      console.warn('Failed to set branch context:', error);
    }
  }

  // Clear branch context for a specific repository
  clearRepositoryBranch(repository) {
    if (!repository) return;

    try {
      const branchContext = this.getBranchContext();
      const repoKey = this.getRepositoryKey(repository);
      delete branchContext[repoKey];
      this.setBranchContext(branchContext);
    } catch (error) {
      console.warn('Failed to clear repository branch context:', error);
    }
  }

  // Clear all branch context (e.g., on logout)
  clearAllBranchContext() {
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to clear branch context:', error);
    }
  }

  // Get all branch context from storage
  getBranchContext() {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to parse branch context from storage:', error);
      return {};
    }
  }

  // Set branch context to storage
  setBranchContext(context) {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(context));
    } catch (error) {
      console.warn('Failed to save branch context to storage:', error);
    }
  }

  // Get default branch name (prefer 'main' over 'master')
  getDefaultBranchName(repository, availableBranches = []) {
    if (!repository) return 'main';

    // First try 'main'
    if (availableBranches.some(b => b.name === 'main')) {
      return 'main';
    }

    // Then try the repository's default branch
    if (repository.default_branch && 
        availableBranches.some(b => b.name === repository.default_branch)) {
      return repository.default_branch;
    }

    // Finally fall back to the first available branch or 'main'
    return availableBranches.length > 0 ? availableBranches[0].name : 'main';
  }

  // Check if a branch context exists for a repository
  hasBranchContext(repository) {
    return this.getSelectedBranch(repository) !== null;
  }

  // Get a formatted display string for the current branch context
  getBranchDisplayInfo(repository) {
    const selectedBranch = this.getSelectedBranch(repository);
    if (!selectedBranch) return null;

    const isDefault = selectedBranch === (repository?.default_branch || 'main');
    return {
      branch: selectedBranch,
      isDefault,
      displayText: isDefault ? `${selectedBranch} (default)` : selectedBranch
    };
  }
}

// Create a singleton instance
const branchContextService = new BranchContextService();

export default branchContextService;