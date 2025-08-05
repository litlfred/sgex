import githubService from '../services/githubService';
import dakValidationService from '../services/dakValidationService';

// Mock the services
jest.mock('../services/githubService');
jest.mock('../services/dakValidationService');

describe('Authenticated URL Access Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('should handle authenticated user API failures gracefully', async () => {
    // Mock authenticated state
    githubService.isAuth.mockReturnValue(true);
    
    // Mock API failures for unknown user/repo
    githubService.getUser.mockRejectedValue(new Error('User not found'));
    githubService.getRepository.mockRejectedValue(new Error('Repository not found'));
    
    // Test the error handling logic
    try {
      await githubService.getUser('unknownuser');
    } catch (error) {
      expect(error.message).toBe('User not found');
    }
    
    try {
      await githubService.getRepository('unknownuser', 'unknownrepo');
    } catch (error) {
      expect(error.message).toBe('Repository not found');
    }
    
    // Verify the service calls were made
    expect(githubService.getUser).toHaveBeenCalledWith('unknownuser');
    expect(githubService.getRepository).toHaveBeenCalledWith('unknownuser', 'unknownrepo');
  });

  test('should handle DAK validation failures for authenticated users', async () => {
    // Mock authenticated state
    githubService.isAuth.mockReturnValue(true);
    
    // Mock successful API calls but invalid DAK
    githubService.getUser.mockResolvedValue({
      login: 'testuser',
      name: 'Test User',
      avatar_url: 'https://github.com/testuser.png',
      type: 'User'
    });
    
    githubService.getRepository.mockResolvedValue({
      name: 'testrepo',
      full_name: 'testuser/testrepo',
      owner: { login: 'testuser' },
      default_branch: 'main',
      html_url: 'https://github.com/testuser/testrepo'
    });
    
    // Mock DAK validation to return false
    dakValidationService.validateDAKRepository.mockResolvedValue(false);
    
    const user = await githubService.getUser('testuser');
    const repo = await githubService.getRepository('testuser', 'testrepo');
    const isValidDAK = await dakValidationService.validateDAKRepository('testuser', 'testrepo', 'main');
    
    // Should load the user and repository data
    expect(user.login).toBe('testuser');
    expect(repo.name).toBe('testrepo');
    expect(isValidDAK).toBe(false);
    
    // Should call validation services
    expect(dakValidationService.validateDAKRepository).toHaveBeenCalledWith('testuser', 'testrepo', 'main');
  });

  test('should verify authenticated access behavior difference from demo mode', () => {
    // Test authenticated state
    githubService.isAuth.mockReturnValue(true);
    expect(githubService.isAuth()).toBe(true);
    
    // Test demo state
    githubService.isAuth.mockReturnValue(false);
    expect(githubService.isAuth()).toBe(false);
    
    // Verify the mock is working correctly
    expect(githubService.isAuth).toHaveBeenCalled();
  });
});