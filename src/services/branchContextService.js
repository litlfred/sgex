// Branch context service stub
class BranchContextService {
  constructor() {
    this.branchContexts = new Map();
  }

  getCurrentContext() {
    return {
      user: 'litlfred',
      repo: 'sgex',
      branch: 'main'
    };
  }

  setCurrentContext(context) {
    console.log('Branch context set:', context);
  }

  getSelectedBranch(repository) {
    const key = `${repository.owner?.login || repository.full_name?.split('/')[0]}/${repository.name}`;
    return this.branchContexts.get(key) || repository.default_branch || 'main';
  }

  setSelectedBranch(repository, branch) {
    const key = `${repository.owner?.login || repository.full_name?.split('/')[0]}/${repository.name}`;
    this.branchContexts.set(key, branch);
    console.log(`Branch context set for ${key}: ${branch}`);
  }

  clearAllBranchContext() {
    this.branchContexts.clear();
    console.log('All branch contexts cleared');
  }
}

const branchContextService = new BranchContextService();
export default branchContextService;