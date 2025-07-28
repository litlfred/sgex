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

  getFileContent: jest.fn((owner, repo, path, ref = 'main') => {
    // Mock BPMN file content
    if (path.endsWith('.bpmn')) {
      return Promise.resolve(`<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="79" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`);
    }
    return Promise.reject(new Error('File not found'));
  }),

  getUser: jest.fn((username) => {
    if (username === 'test-user') {
      return Promise.resolve({
        login: 'test-user',
        name: 'Test User',
        avatar_url: 'https://github.com/test-user.png',
        type: 'User'
      });
    }
    return Promise.reject(new Error('User not found'));
  }),

  getRepository: jest.fn((owner, repo) => {
    if (owner === 'test-user' && repo === 'smart-test-repo') {
      return Promise.resolve({
        id: 1,
        name: 'smart-test-repo',
        full_name: 'test-user/smart-test-repo',
        description: 'Test SMART guidelines repository',
        private: false,
        default_branch: 'main',
        owner: { login: 'test-user' },
        html_url: 'https://github.com/test-user/smart-test-repo'
      });
    }
    return Promise.reject(new Error('Repository not found'));
  }),

  getBranches: jest.fn((owner, repo) => {
    if (owner === 'test-user' && repo === 'smart-test-repo') {
      return Promise.resolve([
        { name: 'main', commit: { sha: 'abc123' } },
        { name: 'develop', commit: { sha: 'def456' } }
      ]);
    }
    return Promise.reject(new Error('Repository not found'));
  }),

  getBranch: jest.fn((owner, repo, branch) => {
    if (owner === 'test-user' && repo === 'smart-test-repo' && branch === 'main') {
      return Promise.resolve({
        name: 'main',
        commit: { sha: 'abc123' }
      });
    }
    return Promise.reject(new Error('Branch not found'));
  }),

  checkRepositoryWritePermissions: jest.fn(() => Promise.resolve(false)),
  
  logout: jest.fn(() => {
    mockGitHubService.isAuthenticated = false;
  })
};

export default mockGitHubService;