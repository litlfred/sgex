/**
 * Tests for UserAccessService
 */
import userAccessService, { USER_TYPES, ACCESS_LEVELS } from './userAccessService';

import githubService from './githubService';
import dakValidationService from './dakValidationService';

// Mock dependencies
jest.mock('./githubService', () => ({
  isAuth: jest.fn(),
  getCurrentUser: jest.fn(),
  getRepository: jest.fn(),
  hasRepositoryWriteAccess: jest.fn()
}));

jest.mock('./dakValidationService', () => ({
  validateDemoDAKRepository: jest.fn(),
  validateDAKRepository: jest.fn()
}));

describe('UserAccessService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    // Reset service state
    userAccessService.currentUser = null;
    userAccessService.userType = USER_TYPES.UNAUTHENTICATED;
    userAccessService.permissions.clear();
  });

  describe('User Type Detection', () => {
    test('should detect unauthenticated user', async () => {
      githubService.isAuth.mockReturnValue(false);
      
      await userAccessService.detectUserType();
      
      expect(userAccessService.getUserType()).toBe(USER_TYPES.UNAUTHENTICATED);
      expect(userAccessService.getCurrentUser()).toBeNull();
    });

    test('should detect authenticated user', async () => {
      githubService.isAuth.mockReturnValue(true);
      localStorage.setItem('sgex_demo_mode', 'false');
      githubService.getCurrentUser.mockResolvedValue({
        login: 'testuser',
        name: 'Test User'
      });
      
      await userAccessService.detectUserType();
      
      expect(userAccessService.getUserType()).toBe(USER_TYPES.AUTHENTICATED);
      expect(userAccessService.getCurrentUser()).toEqual({
        login: 'testuser',
        name: 'Test User'
      });
    });

    test('should detect demo user', async () => {
      githubService.isAuth.mockReturnValue(true);
      localStorage.setItem('sgex_demo_mode', 'true');
      githubService.getCurrentUser.mockResolvedValue({
        login: 'testuser',
        name: 'Test User'
      });
      
      await userAccessService.detectUserType();
      
      expect(userAccessService.getUserType()).toBe(USER_TYPES.DEMO);
      expect(userAccessService.getCurrentUser()).toHaveProperty('isDemo', true);
      expect(userAccessService.getCurrentUser()).toHaveProperty('demoData');
    });
  });

  describe('Repository Access', () => {
    test('should return READ access for unauthenticated users', async () => {
      userAccessService.userType = USER_TYPES.UNAUTHENTICATED;
      
      const access = await userAccessService.getRepositoryAccess('owner', 'repo');
      
      expect(access).toBe(ACCESS_LEVELS.READ);
    });

    test('should return READ access for demo users with demo DAKs', async () => {
      userAccessService.userType = USER_TYPES.DEMO;
      userAccessService.currentUser = {
        demoData: {
          daks: [{ owner: 'WHO', repo: 'smart-anc' }]
        }
      };
      
      const access = await userAccessService.getRepositoryAccess('WHO', 'smart-anc');
      
      expect(access).toBe(ACCESS_LEVELS.READ);
    });

    test('should return WRITE access for authenticated users with permissions', async () => {
      userAccessService.userType = USER_TYPES.AUTHENTICATED;
      githubService.getRepository.mockResolvedValue({ name: 'repo' });
      githubService.hasRepositoryWriteAccess.mockResolvedValue(true);
      
      const access = await userAccessService.getRepositoryAccess('owner', 'repo');
      
      expect(access).toBe(ACCESS_LEVELS.WRITE);
    });
  });

  describe('Save Permissions', () => {
    test('should allow local save for all user types', () => {
      userAccessService.userType = USER_TYPES.UNAUTHENTICATED;
      expect(userAccessService.canSaveLocal()).toBe(true);
      
      userAccessService.userType = USER_TYPES.DEMO;
      expect(userAccessService.canSaveLocal()).toBe(true);
      
      userAccessService.userType = USER_TYPES.AUTHENTICATED;
      expect(userAccessService.canSaveLocal()).toBe(true);
    });

    test('should only allow GitHub save for authenticated non-demo users', async () => {
      userAccessService.userType = USER_TYPES.UNAUTHENTICATED;
      expect(await userAccessService.canSaveToGitHub('owner', 'repo')).toBe(false);
      
      userAccessService.userType = USER_TYPES.DEMO;
      expect(await userAccessService.canSaveToGitHub('owner', 'repo')).toBe(false);
      
      userAccessService.userType = USER_TYPES.AUTHENTICATED;
      userAccessService.permissions.set('owner/repo/main', ACCESS_LEVELS.WRITE);
      expect(await userAccessService.canSaveToGitHub('owner', 'repo')).toBe(true);
    });
  });

  describe('UI Behavior', () => {
    test('should return appropriate UI behavior for each user type', () => {
      userAccessService.userType = USER_TYPES.UNAUTHENTICATED;
      let behavior = userAccessService.getUIBehavior();
      expect(behavior.showEditFeatures).toBe(false);
      expect(behavior.showSaveToGitHub).toBe(false);
      
      userAccessService.userType = USER_TYPES.DEMO;
      behavior = userAccessService.getUIBehavior();
      expect(behavior.showEditFeatures).toBe(true);
      expect(behavior.showSaveToGitHub).toBe(false);
      
      userAccessService.userType = USER_TYPES.AUTHENTICATED;
      behavior = userAccessService.getUIBehavior();
      expect(behavior.showEditFeatures).toBe(true);
      expect(behavior.showSaveToGitHub).toBe(true);
    });
  });

  describe('Access Badges', () => {
    test('should return correct badge for write access', async () => {
      userAccessService.permissions.set('owner/repo/main', ACCESS_LEVELS.WRITE);
      
      const badge = await userAccessService.getAccessBadge('owner', 'repo');
      
      expect(badge.text).toBe('Write Access');
      expect(badge.color).toBe('green');
      expect(badge.icon).toBe('✏️');
    });

    test('should return correct badge for read access', async () => {
      userAccessService.permissions.set('owner/repo/main', ACCESS_LEVELS.READ);
      
      const badge = await userAccessService.getAccessBadge('owner', 'repo');
      
      expect(badge.text).toBe('Read Only');
      expect(badge.color).toBe('blue');
      expect(badge.icon).toBe('👁️');
    });
  });
});