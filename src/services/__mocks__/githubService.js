// Mock implementation of the GitHub service for testing

const mockGitHubService = {
  isAuthenticated: false,
  
  authenticate: jest.fn(() => {
    mockGitHubService.isAuthenticated = true;
    return true;
  }),
  
  isAuth: jest.fn(() => mockGitHubService.isAuthenticated),
  
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
  
  logout: jest.fn(() => {
    mockGitHubService.isAuthenticated = false;
  })
};

export default mockGitHubService;