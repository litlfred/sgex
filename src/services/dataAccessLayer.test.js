/**
 * Tests for DataAccessLayer
 */
import dataAccessLayer, { SAVE_TARGETS, OPERATION_RESULTS } from './dataAccessLayer';

import userAccessService from './userAccessService';
import stagingGroundService from './stagingGroundService';
import githubService from './githubService';

// Mock dependencies
jest.mock('./userAccessService', () => ({
  initialize: jest.fn(),
  getUserType: jest.fn(),
  getRepositoryAccess: jest.fn(),
  getAccessBadge: jest.fn(),
  canSaveToGitHub: jest.fn(),
  canSaveLocal: jest.fn(),
  getUIBehavior: jest.fn()
}));

jest.mock('./stagingGroundService', () => ({
  initialize: jest.fn(),
  getStagingGround: jest.fn(),
  updateFile: jest.fn(),
  removeFile: jest.fn(),
  getStatus: jest.fn()
}));

jest.mock('./githubService', () => ({
  getFileContent: jest.fn(),
  updateFileContent: jest.fn()
}));

describe('DataAccessLayer', () => {
  const mockRepository = {
    name: 'test-repo',
    full_name: 'owner/test-repo',
    owner: { login: 'owner' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with repository and branch', async () => {
      userAccessService.initialize.mockResolvedValue();
      stagingGroundService.initialize.mockReturnValue();

      await dataAccessLayer.initialize(mockRepository, 'main');

      expect(stagingGroundService.initialize).toHaveBeenCalledWith(mockRepository, 'main');
      expect(userAccessService.initialize).toHaveBeenCalled();
    });
  });

  describe('Asset Loading', () => {
    test('should load asset from staging ground if available', async () => {
      userAccessService.getRepositoryAccess.mockResolvedValue('read');
      stagingGroundService.getStagingGround.mockReturnValue({
        files: [{
          path: 'test.json',
          content: '{"test": true}',
          metadata: { source: 'local' }
        }]
      });

      const result = await dataAccessLayer.getAsset('owner', 'repo', 'main', 'test.json');

      expect(result.content).toBe('{"test": true}');
      expect(result.source).toBe('local');
      expect(result.hasLocalChanges).toBe(true);
    });

    test('should load asset from GitHub if not in staging ground', async () => {
      userAccessService.getRepositoryAccess.mockResolvedValue('read');
      stagingGroundService.getStagingGround.mockReturnValue({ files: [] });
      githubService.getFileContent.mockResolvedValue('{"github": true}');

      const result = await dataAccessLayer.getAsset('owner', 'repo', 'main', 'test.json');

      expect(result.content).toBe('{"github": true}');
      expect(result.source).toBe('github');
      expect(result.hasLocalChanges).toBe(false);
    });
  });

  describe('Local Save Operations', () => {
    test('should save asset to staging ground successfully', async () => {
      userAccessService.getUserType.mockReturnValue('authenticated');
      stagingGroundService.updateFile.mockReturnValue(true);

      const result = await dataAccessLayer.saveAssetLocal('test.json', '{"test": true}');

      expect(result.result).toBe(OPERATION_RESULTS.SUCCESS);
      expect(result.target).toBe(SAVE_TARGETS.LOCAL);
      expect(stagingGroundService.updateFile).toHaveBeenCalledWith(
        'test.json',
        '{"test": true}',
        expect.objectContaining({
          savedBy: 'authenticated',
          saveTarget: SAVE_TARGETS.LOCAL
        })
      );
    });

    test('should handle local save failure', async () => {
      userAccessService.getUserType.mockReturnValue('authenticated');
      stagingGroundService.updateFile.mockReturnValue(false);

      const result = await dataAccessLayer.saveAssetLocal('test.json', '{"test": true}');

      expect(result.result).toBe(OPERATION_RESULTS.ERROR);
      expect(result.message).toContain('Failed to save to local storage');
    });
  });

  describe('GitHub Save Operations', () => {
    test('should save asset to GitHub successfully for authenticated users', async () => {
      userAccessService.canSaveToGitHub.mockResolvedValue(true);
      githubService.updateFileContent.mockResolvedValue({
        success: true,
        data: {
          commit: {
            sha: 'abc123',
            html_url: 'https://github.com/owner/repo/commit/abc123'
          }
        }
      });
      stagingGroundService.removeFile.mockReturnValue(true);

      const result = await dataAccessLayer.saveAssetGitHub(
        'owner',
        'repo',
        'main',
        'test.json',
        '{"test": true}',
        'Test commit'
      );

      expect(result.result).toBe(OPERATION_RESULTS.SUCCESS);
      expect(result.target).toBe(SAVE_TARGETS.GITHUB);
      expect(result.commitSha).toBe('abc123');
      expect(stagingGroundService.removeFile).toHaveBeenCalledWith('test.json');
    });



    test('should block GitHub save for unauthenticated users', async () => {
      userAccessService.canSaveToGitHub.mockResolvedValue(false);
      userAccessService.getUserType.mockReturnValue('unauthenticated');

      const result = await dataAccessLayer.saveAssetGitHub(
        'owner',
        'repo',
        'main',
        'test.json',
        '{"test": true}',
        'Test commit'
      );

      expect(result.result).toBe(OPERATION_RESULTS.PERMISSION_DENIED);
      expect(result.message).toContain('Please authenticate');
    });
  });

  describe('Save Options', () => {
    test('should return appropriate save options based on user type', async () => {
      userAccessService.canSaveToGitHub.mockResolvedValue(true);
      userAccessService.canSaveLocal.mockReturnValue(true);
      userAccessService.getUIBehavior.mockReturnValue({
        showSaveLocal: true,
        showSaveToGitHub: true,
        confirmBeforeSave: true
      });
      userAccessService.getUserType.mockReturnValue('authenticated');

      const options = await dataAccessLayer.getSaveOptions('owner', 'repo', 'main');

      expect(options.canSaveLocal).toBe(true);
      expect(options.canSaveGitHub).toBe(true);
      expect(options.showSaveLocal).toBe(true);
      expect(options.showSaveGitHub).toBe(true);
      expect(options.userType).toBe('authenticated');
    });
  });
});