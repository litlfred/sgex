// Mock implementation of the GitHub service for testing

const mockGitHubService = {
  isAuthenticated: false,
  
  authenticate: jest.fn(() => {
    mockGitHubService.isAuthenticated = true;
    return true;
  }),
  
  authenticateWithOctokit: jest.fn(() => {
    mockGitHubService.isAuthenticated = true;
    return true;
  }),
  
  isAuth: jest.fn(() => mockGitHubService.isAuthenticated),
  
  checkTokenPermissions: jest.fn(() => Promise.resolve({
    type: 'classic',
    user: {
      login: 'test-user',
      name: 'Test User',
      avatar_url: 'https://github.com/test-user.png'
    }
  })),
  
  getCurrentUser: jest.fn(() => Promise.resolve({
    login: 'test-user',
    name: 'Test User',
    avatar_url: 'https://github.com/test-user.png'
  })),
  
  getUserOrganizations: jest.fn(() => Promise.resolve([
    { login: 'test-org', name: 'Test Organization' }
  ])),
  
  getOrganization: jest.fn((orgLogin) => {
    if (orgLogin === 'WorldHealthOrganization') {
      return Promise.resolve({
        id: 12261302,
        login: 'WorldHealthOrganization',
        name: 'World Health Organization',
        description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
        avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
        html_url: 'https://github.com/WorldHealthOrganization',
        type: 'Organization'
      });
    }
    return Promise.reject(new Error('Organization not found'));
  }),
  
  getWHOOrganization: jest.fn(() => Promise.resolve({
    id: 12261302,
    login: 'WorldHealthOrganization',
    display_name: 'World Health Organization',
    description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
    avatar_url: 'https://avatars.githubusercontent.com/u/12261302?s=200&v=4',
    html_url: 'https://github.com/WorldHealthOrganization',
    type: 'Organization',
    permissions: {
      can_create_repositories: true,
      can_create_private_repositories: true
    },
    plan: {
      name: 'Organization',
      private_repos: 'unlimited'
    },
    isWHO: true
  })),
  
  getRepositories: jest.fn(() => Promise.resolve([
    {
      id: 1,
      name: 'test-repo',
      full_name: 'test-user/test-repo',
      description: 'Test repository',
      private: false,
      updated_at: '2024-01-01T00:00:00Z',
      language: 'JavaScript',
      stargazers_count: 1,
      forks_count: 0,
      topics: ['test']
    }
  ])),
  
  getSmartGuidelinesRepositories: jest.fn(() => Promise.resolve([
    {
      id: 1,
      name: 'smart-test-repo',
      full_name: 'test-user/smart-test-repo',
      description: 'Test SMART guidelines repository',
      private: false,
      updated_at: '2024-01-01T00:00:00Z',
      language: 'JavaScript',
      stargazers_count: 1,
      forks_count: 0,
      topics: ['smart-guidelines'],
      smart_guidelines_compatible: true
    }
  ])),

  getSmartGuidelinesRepositoriesProgressive: jest.fn(() => Promise.resolve([
    {
      id: 1,
      name: 'smart-test-repo',
      full_name: 'test-user/smart-test-repo',
      description: 'Test SMART guidelines repository',
      private: false,
      updated_at: '2024-01-01T00:00:00Z',
      language: 'JavaScript',
      stargazers_count: 1,
      forks_count: 0,
      topics: ['smart-guidelines'],
      smart_guidelines_compatible: true
    }
  ])),
  
  checkSmartGuidelinesCompatibility: jest.fn(() => Promise.resolve(true)),
  
  getBpmnFiles: jest.fn((owner, repo, ref = 'main') => {
    // Mock BPMN files that would be found in a real repository
    if (owner === 'WorldHealthOrganization' && repo === 'smart-dak-tb') {
      return Promise.resolve([
        {
          name: 'treatment-decision.bpmn',
          path: 'input/business-processes/treatment-decision.bpmn',
          sha: 'abc123',
          size: 4096,
          download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/input/business-processes/treatment-decision.bpmn`,
          html_url: `https://github.com/${owner}/${repo}/blob/${ref}/input/business-processes/treatment-decision.bpmn`
        },
        {
          name: 'patient-screening.bpmn',
          path: 'input/business-processes/screening/patient-screening.bpmn',
          sha: 'def456',
          size: 3072,
          download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/input/business-processes/screening/patient-screening.bpmn`,
          html_url: `https://github.com/${owner}/${repo}/blob/${ref}/input/business-processes/screening/patient-screening.bpmn`
        }
      ]);
    }
    // Return empty array for repositories without BPMN files
    return Promise.resolve([]);
  }),
  
  getBpmnFilesRecursive: jest.fn(() => Promise.resolve([])),
  
  logout: jest.fn(() => {
    mockGitHubService.isAuthenticated = false;
  })
};

export default mockGitHubService;