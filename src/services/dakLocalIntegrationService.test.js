/**
 * Tests for DAK Local Integration Service
 */

import dakLocalIntegrationService from '../dakLocalIntegrationService';
import repoServiceFactory from '../repoServiceFactory';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  getLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })
}));

// Mock the repo service factory
jest.mock('../repoServiceFactory', () => ({
  getCurrentService: jest.fn(),
  switchToService: jest.fn(),
  getServiceType: jest.fn()
}));

describe('DAKLocalIntegrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Compatibility', () => {
    test('should identify compatible components', () => {
      expect(dakLocalIntegrationService.isComponentCompatible('DAKDashboard', 'local')).toBe(true);
      expect(dakLocalIntegrationService.isComponentCompatible('DAKDashboard', 'github')).toBe(true);
      expect(dakLocalIntegrationService.isComponentCompatible('BPMNViewer', 'local')).toBe(true);
    });

    test('should handle unknown components', () => {
      expect(dakLocalIntegrationService.isComponentCompatible('UnknownComponent', 'local')).toBe(false);
    });

    test('should return correct fallback paths', () => {
      const fallbacks = dakLocalIntegrationService.getLocalFallbackPaths('BPMNViewer');
      expect(fallbacks).toEqual(['input/business-processes.bpmn', 'processes.bpmn']);
    });
  });

  describe('Repository Service Management', () => {
    test('should get current repository service', () => {
      const mockService = { serviceType: 'local', serviceName: 'Local Service' };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const service = dakLocalIntegrationService.getCurrentRepositoryService();
      expect(service).toBe(mockService);
      expect(repoServiceFactory.getCurrentService).toHaveBeenCalled();
    });

    test('should switch repository service', () => {
      const mockService = { serviceType: 'github', serviceName: 'GitHub Service' };
      repoServiceFactory.switchToService.mockReturnValue(mockService);

      const service = dakLocalIntegrationService.switchRepositoryService('github');
      expect(service).toBe(mockService);
      expect(repoServiceFactory.switchToService).toHaveBeenCalledWith('github');
    });
  });

  describe('Repository Context', () => {
    test('should create repository context', () => {
      const mockService = { serviceType: 'local', serviceName: 'Local Service' };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const context = dakLocalIntegrationService.createRepositoryContext('testuser', 'testrepo', 'main');
      
      expect(context).toEqual({
        service: mockService,
        serviceType: 'local',
        user: 'testuser',
        repo: 'testrepo',
        branch: 'main',
        isLocal: true,
        isGitHub: false
      });
    });

    test('should default to main branch', () => {
      const mockService = { serviceType: 'github', serviceName: 'GitHub Service' };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const context = dakLocalIntegrationService.createRepositoryContext('testuser', 'testrepo');
      
      expect(context.branch).toBe('main');
      expect(context.isLocal).toBe(false);
      expect(context.isGitHub).toBe(true);
    });
  });

  describe('Integration Status', () => {
    test('should get integration status for local service', () => {
      repoServiceFactory.getServiceType.mockReturnValue('local');

      const status = dakLocalIntegrationService.getIntegrationStatus();
      
      expect(status.currentServiceType).toBe('local');
      expect(status.supportedComponents).toContain('DAKDashboard');
      expect(status.supportedComponents).toContain('BPMNViewer');
      expect(status.recommendations).toContain('Ensure local repositories contain necessary DAK files');
    });

    test('should get integration status for GitHub service', () => {
      repoServiceFactory.getServiceType.mockReturnValue('github');

      const status = dakLocalIntegrationService.getIntegrationStatus();
      
      expect(status.currentServiceType).toBe('github');
      expect(status.supportedComponents).toContain('DAKDashboard');
      expect(status.recommendations).toContain('Ensure GitHub token has appropriate permissions');
    });
  });

  describe('Supported Operations', () => {
    test('should return correct operations for local service', () => {
      const mockService = { serviceType: 'local' };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const operations = dakLocalIntegrationService.getSupportedOperations();
      
      expect(operations).toEqual({
        canRead: true,
        canWrite: true,
        canCommit: false,
        canBranch: false,
        canCollaborate: false,
        hasHistory: false
      });
    });

    test('should return correct operations for GitHub service', () => {
      const mockService = { serviceType: 'github' };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const operations = dakLocalIntegrationService.getSupportedOperations();
      
      expect(operations).toEqual({
        canRead: true,
        canWrite: true,
        canCommit: true,
        canBranch: true,
        canCollaborate: true,
        hasHistory: true
      });
    });
  });

  describe('Local Repository Validation', () => {
    test('should validate GitHub repositories as valid', async () => {
      const mockService = { serviceType: 'github' };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const result = await dakLocalIntegrationService.validateLocalRepositoryForComponent(
        'DAKDashboard', 
        'testuser', 
        'testrepo'
      );
      
      expect(result.isValid).toBe(true);
    });

    test('should validate local repository with existing files', async () => {
      const mockService = {
        serviceType: 'local',
        getFileContent: jest.fn().mockResolvedValue('file content'),
        validateDAKRepository: jest.fn().mockResolvedValue({ isDak: true })
      };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const result = await dakLocalIntegrationService.validateLocalRepositoryForComponent(
        'DAKDashboard', 
        'testuser', 
        'testrepo'
      );
      
      expect(result.isValid).toBe(true);
      expect(result.foundFiles).toEqual(['dashboard', 'overview']);
    });

    test('should handle missing files in local repository', async () => {
      const mockService = {
        serviceType: 'local',
        getFileContent: jest.fn().mockRejectedValue(new Error('File not found')),
        validateDAKRepository: jest.fn().mockResolvedValue({ isDak: false })
      };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const result = await dakLocalIntegrationService.validateLocalRepositoryForComponent(
        'DAKDashboard', 
        'testuser', 
        'testrepo'
      );
      
      expect(result.isValid).toBe(false);
      expect(result.missingFiles).toContain('dashboard');
      expect(result.missingFiles).toContain('overview');
      expect(result.missingFiles).toContain('sushi-config.yaml');
    });
  });

  describe('File Reading with Fallback', () => {
    test('should read file from primary path', async () => {
      const mockService = {
        getFileContent: jest.fn().mockResolvedValue('primary content')
      };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const result = await dakLocalIntegrationService.readFileWithFallback(
        'testuser', 
        'testrepo', 
        'primary.txt', 
        ['fallback.txt']
      );
      
      expect(result).toEqual({
        content: 'primary content',
        actualPath: 'primary.txt'
      });
      expect(mockService.getFileContent).toHaveBeenCalledWith('testuser', 'testrepo', 'primary.txt');
    });

    test('should fallback to alternative path', async () => {
      const mockService = {
        getFileContent: jest.fn()
          .mockRejectedValueOnce(new Error('Primary not found'))
          .mockResolvedValueOnce('fallback content')
      };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const result = await dakLocalIntegrationService.readFileWithFallback(
        'testuser', 
        'testrepo', 
        'primary.txt', 
        ['fallback.txt']
      );
      
      expect(result).toEqual({
        content: 'fallback content',
        actualPath: 'fallback.txt'
      });
    });

    test('should return null when no files found', async () => {
      const mockService = {
        getFileContent: jest.fn().mockRejectedValue(new Error('File not found'))
      };
      repoServiceFactory.getCurrentService.mockReturnValue(mockService);

      const result = await dakLocalIntegrationService.readFileWithFallback(
        'testuser', 
        'testrepo', 
        'primary.txt', 
        ['fallback.txt']
      );
      
      expect(result).toBeNull();
    });
  });
});