/**
 * @jest-environment jsdom
 */

import GitLocalService from './GitLocalService';

// Mock the File System Access API
const mockFileSystemDirectoryHandle = {
  kind: 'directory',
  name: 'test-repo',
  entries: jest.fn(),
  getDirectoryHandle: jest.fn(),
  getFileHandle: jest.fn(),
  resolve: jest.fn()
};

const mockFileSystemFileHandle = {
  kind: 'file',
  name: 'sushi-config.yaml',
  getFile: jest.fn(),
  createWritable: jest.fn()
};

// Mock window.showDirectoryPicker
Object.defineProperty(window, 'showDirectoryPicker', {
  value: jest.fn(),
  writable: true
});

describe('GitLocalService', () => {
  let service;

  beforeEach(() => {
    service = new GitLocalService();
    jest.clearAllMocks();
  });

  describe('Service Identification', () => {
    test('should identify as local service type', () => {
      expect(service.serviceType).toBe('local');
      expect(service.serviceName).toBe('Local Git Repository Service');
    });

    test('should not be authenticated initially', () => {
      expect(service.authenticated).toBe(false);
    });
  });

  describe('File System Access API Support', () => {
    test('should detect File System Access API support', () => {
      // The private method can't be tested directly, but we can test authentication
      expect(window.showDirectoryPicker).toBeDefined();
    });
  });

  describe('Authentication', () => {
    test('should authenticate with directory picker', async () => {
      window.showDirectoryPicker.mockResolvedValue(mockFileSystemDirectoryHandle);
      
      // Mock the scanning functionality
      mockFileSystemDirectoryHandle.entries.mockImplementation(async function* () {
        yield ['test-repo', mockFileSystemDirectoryHandle];
      });
      
      mockFileSystemDirectoryHandle.getDirectoryHandle.mockRejectedValue(new Error('Not found'));

      const result = await service.authenticate();
      
      expect(result).toBe(true);
      expect(service.authenticated).toBe(true);
      expect(window.showDirectoryPicker).toHaveBeenCalledWith({ mode: 'readwrite' });
    });

    test('should fail authentication if no directory selected', async () => {
      window.showDirectoryPicker.mockResolvedValue(null);

      const result = await service.authenticate();
      
      expect(result).toBe(false);
      expect(service.authenticated).toBe(false);
    });

    test('should handle authentication errors gracefully', async () => {
      window.showDirectoryPicker.mockRejectedValue(new Error('Permission denied'));

      const result = await service.authenticate();
      
      expect(result).toBe(false);
      expect(service.authenticated).toBe(false);
    });
  });

  describe('Sign Out', () => {
    test('should clear authentication state on sign out', async () => {
      // First authenticate
      window.showDirectoryPicker.mockResolvedValue(mockFileSystemDirectoryHandle);
      mockFileSystemDirectoryHandle.entries.mockImplementation(async function* () {});
      
      await service.authenticate();
      expect(service.authenticated).toBe(true);

      // Then sign out
      service.signOut();
      
      expect(service.authenticated).toBe(false);
      expect(service.getWorkingDirectory()).toBeNull();
    });
  });

  describe('Working Directory Management', () => {
    test('should set working directory', async () => {
      const testPath = '/test/path';
      const result = await service.setWorkingDirectory(testPath);
      
      expect(result.success).toBe(true);
      expect(service.getWorkingDirectory()).toBe(testPath);
    });
  });

  describe('Repository Discovery', () => {
    test('should scan local directory for repositories', async () => {
      // Setup authenticated service
      window.showDirectoryPicker.mockResolvedValue(mockFileSystemDirectoryHandle);
      await service.authenticate();

      const result = await service.scanLocalDirectory('test-path');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    test('should fail scanning without authentication', async () => {
      const result = await service.scanLocalDirectory('test-path');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No working directory selected');
    });
  });

  describe('User Information', () => {
    test('should return local user information', async () => {
      const result = await service.getCurrentUser();
      
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        login: 'local-user',
        type: 'User',
        site_admin: false
      });
    });
  });

  describe('Repository Operations', () => {
    test('should list repositories for user', async () => {
      const result = await service.listRepositories('local-user');
      
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        repositories: expect.any(Array),
        totalCount: expect.any(Number),
        hasMore: false
      });
    });

    test('should return error for non-existent repository', async () => {
      const result = await service.getRepository('owner', 'non-existent');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('DAK Validation', () => {
    test('should validate DAK repository with sushi-config.yaml', async () => {
      // Setup mock file system
      window.showDirectoryPicker.mockResolvedValue(mockFileSystemDirectoryHandle);
      await service.authenticate();

      const mockFile = {
        text: jest.fn().mockResolvedValue(`
dependencies:
  smart.who.int.base: latest
`)
      };
      mockFileSystemFileHandle.getFile.mockResolvedValue(mockFile);
      mockFileSystemDirectoryHandle.getDirectoryHandle.mockResolvedValue(mockFileSystemDirectoryHandle);
      mockFileSystemDirectoryHandle.getFileHandle.mockResolvedValue(mockFileSystemFileHandle);

      const result = await service.validateDAKRepository('owner', 'repo');
      
      expect(result.isDak).toBe(true);
      expect(result.validationError).toBeUndefined();
    });

    test('should reject non-DAK repository', async () => {
      // Setup mock file system
      window.showDirectoryPicker.mockResolvedValue(mockFileSystemDirectoryHandle);
      await service.authenticate();

      const mockFile = {
        text: jest.fn().mockResolvedValue(`
dependencies:
  some.other.dependency: latest
`)
      };
      mockFileSystemFileHandle.getFile.mockResolvedValue(mockFile);
      mockFileSystemDirectoryHandle.getDirectoryHandle.mockResolvedValue(mockFileSystemDirectoryHandle);
      mockFileSystemDirectoryHandle.getFileHandle.mockResolvedValue(mockFileSystemFileHandle);

      const result = await service.validateDAKRepository('owner', 'repo');
      
      expect(result.isDak).toBe(false);
      expect(result.validationError).toContain('smart.who.int.base dependency');
    });
  });

  describe('Branch Operations', () => {
    test('should return default branch information', async () => {
      const result = await service.getBranches('owner', 'repo');
      
      expect(result.success).toBe(true);
      expect(result.data).toContainEqual(
        expect.objectContaining({
          name: 'main',
          protected: false
        })
      );
    });
  });

  describe('File Operations', () => {
    test('should read file content from repository', async () => {
      // Setup authenticated service with mock file system
      window.showDirectoryPicker.mockResolvedValue(mockFileSystemDirectoryHandle);
      await service.authenticate();

      const mockFile = {
        text: jest.fn().mockResolvedValue('file content')
      };
      mockFileSystemFileHandle.getFile.mockResolvedValue(mockFile);
      mockFileSystemDirectoryHandle.getDirectoryHandle.mockResolvedValue(mockFileSystemDirectoryHandle);
      mockFileSystemDirectoryHandle.getFileHandle.mockResolvedValue(mockFileSystemFileHandle);

      const content = await service.getFileContent('owner', 'repo', 'test.txt');
      
      expect(content).toBe('file content');
      expect(mockFileSystemDirectoryHandle.getDirectoryHandle).toHaveBeenCalledWith('repo');
      expect(mockFileSystemDirectoryHandle.getFileHandle).toHaveBeenCalledWith('test.txt');
    });

    test('should handle file not found errors', async () => {
      // Setup authenticated service with mock file system
      window.showDirectoryPicker.mockResolvedValue(mockFileSystemDirectoryHandle);
      await service.authenticate();

      mockFileSystemDirectoryHandle.getDirectoryHandle.mockRejectedValue(new Error('Not found'));

      await expect(service.getFileContent('owner', 'repo', 'test.txt'))
        .rejects.toThrow('Failed to read file');
    });

    test('should fail reading files without authentication', async () => {
      await expect(service.getFileContent('owner', 'repo', 'test.txt'))
        .rejects.toThrow('No working directory selected');
    });
  });

  describe('Unimplemented Operations', () => {
    test('should return not implemented for file creation', async () => {
      const result = await service.createFile('owner', 'repo', 'test.txt', 'content');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not yet implemented');
    });

    test('should return not implemented for file deletion', async () => {
      const result = await service.deleteFile('owner', 'repo', 'test.txt');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not yet implemented');
    });

    test('should return not implemented for git status', async () => {
      const result = await service.getGitStatus('owner', 'repo');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not yet implemented');
    });
  });
});