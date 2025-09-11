/**
 * Enhanced tests for GitLocalService file operations
 */

import GitLocalService from '../GitLocalService';

// Mock the logger
jest.mock('../../utils/logger', () => ({
  getLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })
}));

// Mock isomorphic-git
jest.mock('isomorphic-git', () => ({
  statusMatrix: jest.fn()
}));

// Mock DAK validation service
jest.mock('../dakValidationService', () => ({}));

describe('GitLocalService - Enhanced Operations', () => {
  let service;
  let mockDirectoryHandle;
  let mockFileHandle;
  let mockRepoHandle;

  beforeEach(() => {
    service = new GitLocalService();
    
    // Mock File System API
    mockFileHandle = {
      kind: 'file',
      name: 'test.txt',
      getFile: jest.fn().mockResolvedValue({
        text: jest.fn().mockResolvedValue('file content'),
        size: 100
      }),
      createWritable: jest.fn().mockResolvedValue({
        write: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined)
      })
    };

    mockRepoHandle = {
      kind: 'directory',
      name: 'test-repo',
      entries: jest.fn().mockReturnValue([
        ['file.txt', mockFileHandle],
        ['subdir', { kind: 'directory', name: 'subdir' }]
      ]),
      getDirectoryHandle: jest.fn().mockResolvedValue({
        kind: 'directory',
        getFileHandle: jest.fn().mockResolvedValue(mockFileHandle),
        removeEntry: jest.fn().mockResolvedValue(undefined)
      }),
      getFileHandle: jest.fn().mockResolvedValue(mockFileHandle),
      removeEntry: jest.fn().mockResolvedValue(undefined)
    };

    mockDirectoryHandle = {
      kind: 'directory',
      name: 'workspace',
      getDirectoryHandle: jest.fn().mockResolvedValue(mockRepoHandle)
    };

    // Set up the working directory
    service.workingDirectoryHandle = mockDirectoryHandle;
    service.isInitialized = true;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('File Operations', () => {
    describe('createFile', () => {
      test('should create file successfully', async () => {
        const result = await service.createFile('owner', 'repo', 'test.txt', 'content');
        
        expect(result.success).toBe(true);
        expect(mockDirectoryHandle.getDirectoryHandle).toHaveBeenCalledWith('repo');
      });

      test('should create file in subdirectory', async () => {
        const mockSubDir = {
          getFileHandle: jest.fn().mockResolvedValue(mockFileHandle)
        };
        mockRepoHandle.getDirectoryHandle.mockResolvedValue(mockSubDir);

        const result = await service.createFile('owner', 'repo', 'subdir/test.txt', 'content');
        
        expect(result.success).toBe(true);
        expect(mockRepoHandle.getDirectoryHandle).toHaveBeenCalledWith('subdir');
      });

      test('should handle file creation errors', async () => {
        mockDirectoryHandle.getDirectoryHandle.mockRejectedValue(new Error('Access denied'));

        const result = await service.createFile('owner', 'repo', 'test.txt', 'content');
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to create file');
      });

      test('should reject when no working directory', async () => {
        service.workingDirectoryHandle = null;

        const result = await service.createFile('owner', 'repo', 'test.txt', 'content');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('No working directory selected');
      });
    });

    describe('deleteFile', () => {
      test('should delete file successfully', async () => {
        const result = await service.deleteFile('owner', 'repo', 'test.txt');
        
        expect(result.success).toBe(true);
        expect(mockRepoHandle.removeEntry).toHaveBeenCalledWith('test.txt');
      });

      test('should delete file in subdirectory', async () => {
        const mockSubDir = {
          removeEntry: jest.fn().mockResolvedValue(undefined)
        };
        mockRepoHandle.getDirectoryHandle.mockResolvedValue(mockSubDir);

        const result = await service.deleteFile('owner', 'repo', 'subdir/test.txt');
        
        expect(result.success).toBe(true);
        expect(mockSubDir.removeEntry).toHaveBeenCalledWith('test.txt');
      });

      test('should handle file deletion errors', async () => {
        mockRepoHandle.removeEntry.mockRejectedValue(new Error('File not found'));

        const result = await service.deleteFile('owner', 'repo', 'test.txt');
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to delete file');
      });
    });

    describe('renameFile', () => {
      test('should rename file successfully', async () => {
        // Mock getFileContent to return content
        service.getFileContent = jest.fn().mockResolvedValue('file content');
        service.createFile = jest.fn().mockResolvedValue({ success: true });
        service.deleteFile = jest.fn().mockResolvedValue({ success: true });

        const result = await service.renameFile('owner', 'repo', 'old.txt', 'new.txt');
        
        expect(result.success).toBe(true);
        expect(service.createFile).toHaveBeenCalledWith('owner', 'repo', 'new.txt', 'file content');
        expect(service.deleteFile).toHaveBeenCalledWith('owner', 'repo', 'old.txt');
      });

      test('should cleanup on rename failure', async () => {
        service.getFileContent = jest.fn().mockResolvedValue('file content');
        service.createFile = jest.fn().mockResolvedValue({ success: true });
        service.deleteFile = jest.fn()
          .mockResolvedValueOnce({ success: false, error: 'Delete failed' })
          .mockResolvedValueOnce({ success: true }); // Cleanup call

        const result = await service.renameFile('owner', 'repo', 'old.txt', 'new.txt');
        
        expect(result.success).toBe(false);
        expect(service.deleteFile).toHaveBeenCalledTimes(2); // Original + cleanup
      });
    });

    describe('listFiles', () => {
      test('should list files in directory', async () => {
        const mockEntries = [
          ['file1.txt', { kind: 'file', getFile: () => ({ size: 100 }) }],
          ['file2.txt', { kind: 'file', getFile: () => ({ size: 200 }) }],
          ['subdir', { kind: 'directory' }]
        ];
        
        const mockIterator = {
          async *[Symbol.asyncIterator]() {
            for (const entry of mockEntries) {
              yield entry;
            }
          }
        };
        
        mockRepoHandle.entries = jest.fn().mockReturnValue(mockIterator);

        const result = await service.listFiles('owner', 'repo');
        
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data[0]).toEqual({
          name: 'file1.txt',
          path: 'file1.txt',
          type: 'file',
          size: 100
        });
        expect(result.data[2]).toEqual({
          name: 'subdir',
          path: 'subdir',
          type: 'dir'
        });
      });

      test('should list files in subdirectory', async () => {
        const mockSubDir = {
          entries: jest.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield ['nested.txt', { kind: 'file', getFile: () => ({ size: 50 }) }];
            }
          })
        };
        
        mockRepoHandle.getDirectoryHandle.mockResolvedValue(mockSubDir);

        const result = await service.listFiles('owner', 'repo', 'subdir');
        
        expect(result.success).toBe(true);
        expect(result.data[0].path).toBe('subdir/nested.txt');
      });

      test('should handle listing errors', async () => {
        mockDirectoryHandle.getDirectoryHandle.mockRejectedValue(new Error('Access denied'));

        const result = await service.listFiles('owner', 'repo');
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Failed to list files');
      });
    });
  });

  describe('Staging Operations', () => {
    describe('stageFile', () => {
      test('should stage file successfully', async () => {
        service.createFile = jest.fn().mockResolvedValue({ success: true });

        const result = await service.stageFile('owner', 'repo', 'test.txt', 'content');
        
        expect(result.success).toBe(true);
        expect(service.createFile).toHaveBeenCalledWith('owner', 'repo', 'test.txt', 'content');
      });

      test('should handle staging errors', async () => {
        service.createFile = jest.fn().mockResolvedValue({ 
          success: false, 
          error: 'Create failed' 
        });

        const result = await service.stageFile('owner', 'repo', 'test.txt', 'content');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Create failed');
      });
    });

    describe('commit', () => {
      test('should create commit successfully', async () => {
        const result = await service.commit('owner', 'repo', 'Test commit');
        
        expect(result.success).toBe(true);
        expect(result.data.message).toBe('Test commit');
        expect(result.data.author.name).toBe('Local User');
        expect(result.data.sha).toMatch(/^local-\d+$/);
      });

      test('should handle commit errors when no working directory', async () => {
        service.workingDirectoryHandle = null;

        const result = await service.commit('owner', 'repo', 'Test commit');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('No working directory selected');
      });
    });
  });

  describe('Repository Statistics', () => {
    test('should get repository stats', async () => {
      const result = await service.getRepositoryStats('owner', 'repo');
      
      expect(result.success).toBe(true);
      expect(result.data.commits).toBe(1);
      expect(result.data.branches).toBe(1);
      expect(result.data.contributors).toBe(1);
      expect(result.data.lastCommit).toBeDefined();
    });

    test('should handle stats errors', async () => {
      service.workingDirectoryHandle = null;

      const result = await service.getRepositoryStats('owner', 'repo');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No working directory selected');
    });
  });

  describe('Enhanced Branch Operations', () => {
    test('should get branches with enhanced implementation', async () => {
      const result = await service.getBranches('owner', 'repo');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('main');
      expect(result.data[0].commit.sha).toBe('local-main-sha');
    });

    test('should handle branch listing errors', async () => {
      service.workingDirectoryHandle = null;

      const result = await service.getBranches('owner', 'repo');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No working directory selected');
    });
  });

  describe('Git Status Operations', () => {
    test('should handle git status with limited implementation', async () => {
      const result = await service.getGitStatus('owner', 'repo');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to get git status');
    });
  });

  describe('Service Properties', () => {
    test('should have correct service type and name', () => {
      expect(service.serviceType).toBe('local');
      expect(service.serviceName).toBe('Local Git Repository Service');
    });

    test('should report authenticated when directory selected', () => {
      expect(service.authenticated).toBe(true);
    });

    test('should report not authenticated when no directory', () => {
      service.workingDirectoryHandle = null;
      service.isInitialized = false;
      
      expect(service.authenticated).toBe(false);
    });
  });
});