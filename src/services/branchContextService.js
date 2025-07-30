// Branch context service
let currentContext = {
  owner: null,
  repo: null,
  branch: 'main',
  path: ''
};

export const getBranchContext = () => currentContext;

export const setBranchContext = (context) => {
  currentContext = { ...currentContext, ...context };
};

export const clearBranchContext = () => {
  currentContext = { owner: null, repo: null, branch: 'main', path: '' };
};

const branchContextService = {
  getBranchContext,
  setBranchContext,
  clearBranchContext
};

export default branchContextService;