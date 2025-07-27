import stagingGroundService from '../services/stagingGroundService';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('StagingGroundService', () => {
  const mockRepository = {
    full_name: 'test/repo',
    name: 'repo',
    owner: { login: 'test' }
  };
  const mockBranch = 'main';

  beforeEach(() => {
    localStorageMock.clear();
    stagingGroundService.initialize(mockRepository, mockBranch);
  });

  test('initializes correctly', () => {
    expect(stagingGroundService.currentRepository).toBe(mockRepository);
    expect(stagingGroundService.currentBranch).toBe(mockBranch);
  });

  test('creates empty staging ground', () => {
    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround).toEqual({
      message: '',
      files: [],
      timestamp: expect.any(Number),
      branch: mockBranch,
      repository: mockRepository.full_name
    });
  });

  test('updates file in staging ground', () => {
    const result = stagingGroundService.updateFile('test.txt', 'Hello World');
    expect(result).toBe(true);

    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files).toHaveLength(1);
    expect(stagingGround.files[0]).toEqual({
      path: 'test.txt',
      content: 'Hello World',
      metadata: {
        lastModified: expect.any(Number)
      },
      timestamp: expect.any(Number)
    });
  });

  test('removes file from staging ground', () => {
    stagingGroundService.updateFile('test.txt', 'Hello World');
    const result = stagingGroundService.removeFile('test.txt');
    expect(result).toBe(true);

    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files).toHaveLength(0);
  });

  test('updates commit message', () => {
    const result = stagingGroundService.updateCommitMessage('Test commit');
    expect(result).toBe(true);

    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.message).toBe('Test commit');
  });

  test('detects changes', () => {
    expect(stagingGroundService.hasChanges()).toBe(false);
    
    stagingGroundService.updateFile('test.txt', 'Hello World');
    expect(stagingGroundService.hasChanges()).toBe(true);
    expect(stagingGroundService.getChangedFilesCount()).toBe(1);
  });

  test('clears staging ground', () => {
    stagingGroundService.updateFile('test.txt', 'Hello World');
    stagingGroundService.updateCommitMessage('Test commit');

    const result = stagingGroundService.clearStagingGround();
    expect(result).toBe(true);

    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files).toHaveLength(0);
    expect(stagingGround.message).toBe('');
  });

  test('contributes files interface', () => {
    const files = [
      { path: 'file1.txt', content: 'Content 1' },
      { path: 'file2.txt', content: 'Content 2' }
    ];

    const result = stagingGroundService.contributeFiles(files, { tool: 'test-tool' });
    expect(result.success).toBe(true);
    expect(result.results).toHaveLength(2);

    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files).toHaveLength(2);
    expect(stagingGround.files[0].metadata.source).toBe('test-tool');
  });

  test('gets status for DAK editing tools', () => {
    stagingGroundService.updateFile('test.txt', 'Hello World');
    
    const status = stagingGroundService.getStatus();
    expect(status).toEqual({
      hasChanges: true,
      filesCount: 1,
      lastModified: expect.any(Number),
      branch: mockBranch,
      repository: mockRepository.full_name
    });
  });

  test('manages history and rollback', () => {
    // Create initial state
    stagingGroundService.updateFile('test.txt', 'Version 1');
    const history1 = stagingGroundService.getHistory();
    expect(history1).toHaveLength(1);

    // Update and create second state
    stagingGroundService.updateFile('test.txt', 'Version 2');
    const history2 = stagingGroundService.getHistory();
    expect(history2).toHaveLength(2);

    // Rollback to first version
    const firstSave = history2[0];
    stagingGroundService.rollbackToSave(firstSave.savedAt);
    
    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files[0].content).toBe('Version 1');
  });

  test('exports and imports staging ground', () => {
    stagingGroundService.updateFile('test.txt', 'Hello World');
    stagingGroundService.updateCommitMessage('Test commit');

    const exported = stagingGroundService.exportStagingGround();
    expect(exported.current.files).toHaveLength(1);
    expect(exported.current.message).toBe('Test commit');
    expect(exported.repository).toBe(mockRepository.full_name);

    // Clear and import
    stagingGroundService.clearStagingGround();
    const result = stagingGroundService.importStagingGround(exported);
    expect(result).toBe(true);

    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files).toHaveLength(1);
    expect(stagingGround.message).toBe('Test commit');
  });
});