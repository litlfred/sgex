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
  
  checkSmartGuidelinesCompatibility: jest.fn(() => Promise.resolve(true)),
  
  logout: jest.fn(() => {
    mockGitHubService.isAuthenticated = false;
  })
};

export default mockGitHubService;