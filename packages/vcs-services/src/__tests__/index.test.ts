import {
  GitHubAuthenticationService,
  GitHubRepositoryService,
  GitHubUserService,
  GitHubIssueService
} from '../index';

// Mock dependencies
const mockSecureTokenStorage = {
  storeToken: jest.fn(),
  retrieveToken: jest.fn(),
  hasValidToken: jest.fn(),
  getTokenInfo: jest.fn(),
  clearToken: jest.fn(),
  migrateLegacyToken: jest.fn(),
  validateTokenFormat: jest.fn(),
  maskToken: jest.fn()
};

const mockDAKService = {} as any; // Mock as any for testing

const mockOctokit = {
  request: jest.fn(),
  rest: {
    users: {
      getAuthenticated: jest.fn()
    },
    rateLimit: {
      get: jest.fn()
    },
    repos: {
      get: jest.fn(),
      listBranches: jest.fn(),
      getContent: jest.fn(),
      createOrUpdateFileContents: jest.fn(),
      deleteFile: jest.fn(),
      createFork: jest.fn(),
      listCommits: jest.fn()
    },
    git: {
      getRef: jest.fn(),
      createRef: jest.fn()
    },
    orgs: {
      listForUser: jest.fn(),
      listForAuthenticatedUser: jest.fn(),
      get: jest.fn()
    },
    issues: {
      get: jest.fn(),
      listForRepo: jest.fn(),
      listComments: jest.fn(),
      createComment: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    pulls: {
      get: jest.fn(),
      list: jest.fn(),
      listReviewComments: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      merge: jest.fn()
    },
    search: {
      repos: jest.fn(),
      users: jest.fn()
    }
  }
};

describe('VCS Services Package', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GitHubAuthenticationService', () => {
    let authService: GitHubAuthenticationService;

    beforeEach(() => {
      authService = new GitHubAuthenticationService(mockSecureTokenStorage);
    });

    test('should authenticate with valid token', async () => {
      mockSecureTokenStorage.validateTokenFormat.mockReturnValue({
        isValid: true,
        token: 'valid-token',
        type: 'classic'
      });
      mockSecureTokenStorage.storeToken.mockReturnValue(true);

      const result = await authService.authenticate('valid-token');

      expect(result.success).toBe(true);
      expect(result.tokenType).toBe('classic');
    });

    test('should fail authentication with invalid token', async () => {
      mockSecureTokenStorage.validateTokenFormat.mockReturnValue({
        isValid: false,
        reason: 'Invalid format'
      });

      const result = await authService.authenticate('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid format');
    });

    test('should check if authenticated', () => {
      expect(authService.isAuth()).toBe(false);
    });
  });

  describe('GitHubRepositoryService', () => {
    let repoService: GitHubRepositoryService;

    beforeEach(() => {
      repoService = new GitHubRepositoryService(mockDAKService);
    });

    test('should get repository', async () => {
      const mockRepo = { name: 'test-repo', owner: { login: 'test-user' } };
      mockOctokit.rest.repos.get.mockResolvedValue({ data: mockRepo });

      const result = await repoService.getRepository(mockOctokit, 'test-user', 'test-repo');

      expect(result).toEqual(mockRepo);
      expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({
        owner: 'test-user',
        repo: 'test-repo'
      });
    });

    test('should get repository branches', async () => {
      const mockBranches = [{ name: 'main' }, { name: 'develop' }];
      mockOctokit.rest.repos.listBranches.mockResolvedValue({ data: mockBranches });

      const result = await repoService.getBranches(mockOctokit, 'test-user', 'test-repo');

      expect(result).toEqual(mockBranches);
    });

    test('should check if repository is DAK', async () => {
      mockOctokit.rest.repos.getContent.mockResolvedValue({
        data: { content: 'mock-content' }
      });

      const result = await repoService.isDAKRepository(mockOctokit, 'test-user', 'test-repo');

      expect(result).toBe(true);
    });
  });

  describe('GitHubUserService', () => {
    let userService: GitHubUserService;

    beforeEach(() => {
      userService = new GitHubUserService();
    });

    test('should get current user', async () => {
      const mockUser = { login: 'test-user', id: 123 };
      mockOctokit.rest.users.getAuthenticated.mockResolvedValue({ data: mockUser });

      const result = await userService.getCurrentUser(mockOctokit);

      expect(result).toEqual(mockUser);
    });

    test('should check rate limit', async () => {
      const mockRateLimit = { limit: 5000, remaining: 4999, reset: 1234567890 };
      mockOctokit.rest.rateLimit.get.mockResolvedValue({ data: { rate: mockRateLimit } });

      const result = await userService.checkRateLimit(mockOctokit);

      expect(result).toEqual(mockRateLimit);
    });
  });

  describe('GitHubIssueService', () => {
    let issueService: GitHubIssueService;

    beforeEach(() => {
      issueService = new GitHubIssueService();
    });

    test('should get issue', async () => {
      const mockIssue = { number: 1, title: 'Test Issue' };
      mockOctokit.rest.issues.get.mockResolvedValue({ data: mockIssue });

      const result = await issueService.getIssue(mockOctokit, 'test-user', 'test-repo', 1);

      expect(result).toEqual(mockIssue);
    });

    test('should create issue', async () => {
      const mockIssue = { number: 1, title: 'New Issue' };
      mockOctokit.rest.issues.create.mockResolvedValue({ data: mockIssue });

      const result = await issueService.createIssue(mockOctokit, 'test-user', 'test-repo', 'New Issue');

      expect(result).toEqual(mockIssue);
      expect(mockOctokit.rest.issues.create).toHaveBeenCalledWith({
        owner: 'test-user',
        repo: 'test-repo',
        title: 'New Issue',
        body: undefined,
        labels: undefined
      });
    });

    test('should get pull requests for branch', async () => {
      const mockPRs = [{ number: 1, title: 'Test PR' }];
      mockOctokit.rest.pulls.list.mockResolvedValue({ data: mockPRs });

      const result = await issueService.getPullRequestsForBranch(mockOctokit, 'test-user', 'test-repo', 'feature-branch');

      expect(result).toEqual(mockPRs);
    });
  });
});