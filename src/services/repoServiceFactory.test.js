/**
 * @jest-environment jsdom
 */

import repoServiceFactory from './repoServiceFactory';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock showDirectoryPicker for local service support
Object.defineProperty(window, 'showDirectoryPicker', {
  value: jest.fn(),
  writable: true
});

describe('RepoServiceFactory', () => {
  beforeEach(() => {
    repoServiceFactory.reset();
    jest.clearAllMocks();
  });

  describe('Service Creation', () => {
    test('should create GitHub service', () => {
      const service = repoServiceFactory.createGitHubService();
      
      expect(service).toBeDefined();
      expect(service.serviceType).toBe('github');
    });

    test('should create local service', () => {
      const service = repoServiceFactory.createLocalService();
      
      expect(service).toBeDefined();
      expect(service.serviceType).toBe('local');
    });

    test('should return same instance when called multiple times', () => {
      const service1 = repoServiceFactory.createGitHubService();
      const service2 = repoServiceFactory.createGitHubService();
      
      expect(service1).toBe(service2);
    });
  });

  describe('Service Switching', () => {
    test('should switch to GitHub service', () => {
      const service = repoServiceFactory.switchToService('github');
      
      expect(service.serviceType).toBe('github');
      expect(repoServiceFactory.getServiceType()).toBe('github');
    });

    test('should switch to local service', () => {
      const service = repoServiceFactory.switchToService('local');
      
      expect(service.serviceType).toBe('local');
      expect(repoServiceFactory.getServiceType()).toBe('local');
    });

    test('should return current service if already using requested type', () => {
      const service1 = repoServiceFactory.switchToService('github');
      const service2 = repoServiceFactory.switchToService('github');
      
      expect(service1).toBe(service2);
    });

    test('should throw error for unknown service type', () => {
      expect(() => {
        repoServiceFactory.switchToService('unknown');
      }).toThrow('Unknown service type: unknown');
    });
  });

  describe('Current Service Management', () => {
    test('should return default GitHub service when no service selected', () => {
      const service = repoServiceFactory.getCurrentService();
      
      expect(service.serviceType).toBe('github');
    });

    test('should return currently selected service', () => {
      repoServiceFactory.switchToService('local');
      const service = repoServiceFactory.getCurrentService();
      
      expect(service.serviceType).toBe('local');
    });
  });

  describe('Service Capabilities', () => {
    test('should return GitHub service capabilities', () => {
      const capabilities = repoServiceFactory.getServiceCapabilities('github');
      
      expect(capabilities).toMatchObject({
        hasAuthentication: true,
        hasOrganizations: true,
        hasCollaboration: true,
        hasRemoteOperations: true,
        hasIssues: true,
        hasPullRequests: true,
        hasActions: true,
        requiresToken: true,
        supportsPrivateRepos: true
      });
    });

    test('should return local service capabilities', () => {
      const capabilities = repoServiceFactory.getServiceCapabilities('local');
      
      expect(capabilities).toMatchObject({
        hasAuthentication: false,
        hasOrganizations: false,
        hasCollaboration: false,
        hasRemoteOperations: false,
        hasIssues: false,
        hasPullRequests: false,
        hasActions: false,
        requiresToken: false,
        supportsPrivateRepos: true,
        hasFileSystemAccess: true,
        hasLocalBranching: true,
        hasLocalCommits: true
      });
    });

    test('should return capabilities for current service type', () => {
      repoServiceFactory.switchToService('local');
      const capabilities = repoServiceFactory.getServiceCapabilities();
      
      expect(capabilities.hasFileSystemAccess).toBe(true);
    });
  });

  describe('Service Type Support', () => {
    test('should support GitHub service', () => {
      const isSupported = repoServiceFactory.isServiceTypeSupported('github');
      
      expect(isSupported).toBe(true);
    });

    test('should support local service when File System Access API available', () => {
      const isSupported = repoServiceFactory.isServiceTypeSupported('local');
      
      expect(isSupported).toBe(true); // We mocked showDirectoryPicker
    });

    test('should not support unknown service type', () => {
      const isSupported = repoServiceFactory.isServiceTypeSupported('unknown');
      
      expect(isSupported).toBe(false);
    });
  });

  describe('Available Service Types', () => {
    test('should return all available service types', () => {
      const available = repoServiceFactory.getAvailableServiceTypes();
      
      expect(available).toContain('github');
      expect(available).toContain('local');
    });

    test('should only include supported service types', () => {
      // Remove the File System Access API mock
      delete window.showDirectoryPicker;
      
      const available = repoServiceFactory.getAvailableServiceTypes();
      
      expect(available).toContain('github');
      expect(available).not.toContain('local');
    });
  });

  describe('Service Reset', () => {
    test('should reset all services', () => {
      // Create and switch to services
      const githubService = repoServiceFactory.createGitHubService();
      const localService = repoServiceFactory.createLocalService();
      repoServiceFactory.switchToService('local');
      
      // Reset
      repoServiceFactory.reset();
      
      // Should create new instances after reset
      const newService = repoServiceFactory.getCurrentService();
      expect(newService.serviceType).toBe('github'); // Default
    });

    test('should call signOut on all services during reset', () => {
      const githubService = repoServiceFactory.createGitHubService();
      const localService = repoServiceFactory.createLocalService();
      
      const githubSignOutSpy = jest.spyOn(githubService, 'signOut');
      const localSignOutSpy = jest.spyOn(localService, 'signOut');
      
      repoServiceFactory.reset();
      
      expect(githubSignOutSpy).toHaveBeenCalled();
      expect(localSignOutSpy).toHaveBeenCalled();
    });
  });

  describe('Service Type Detection', () => {
    test('should return current service type', () => {
      expect(repoServiceFactory.getServiceType()).toBe('github'); // Default
      
      repoServiceFactory.switchToService('local');
      expect(repoServiceFactory.getServiceType()).toBe('local');
    });
  });
});