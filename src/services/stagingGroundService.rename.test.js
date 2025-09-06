/**
 * Tests for StagingGround Rename Functionality
 */

import stagingGroundService from '../services/stagingGroundService';

// Mock localStorage (using same pattern as stagingGroundService.test.js)
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

describe('StagingGroundService - Rename Functionality', () => {
  const mockRepository = {
    full_name: 'test/repo'
  };
  const mockBranch = 'main';

  beforeEach(() => {
    localStorageMock.clear();
    stagingGroundService.initialize(mockRepository, mockBranch);
  });

  describe('renameFile', () => {
    test('should rename a file in staging ground', () => {
      // Add a file to staging ground first
      const addResult = stagingGroundService.updateFile(
        'input/questionnaires/old-name.json',
        JSON.stringify({ resourceType: 'Questionnaire', id: 'old-name' }),
        { type: 'questionnaire' }
      );
      
      expect(addResult).toBe(true);
      
      // Verify file was added
      let stagingGround = stagingGroundService.getStagingGround();
      expect(stagingGround.files).toHaveLength(1);
      expect(stagingGround.files[0].path).toBe('input/questionnaires/old-name.json');

      // Rename the file
      const result = stagingGroundService.renameFile(
        'input/questionnaires/old-name.json',
        'input/questionnaires/new-name.json'
      );

      expect(result).toBe(true);

      stagingGround = stagingGroundService.getStagingGround();
      expect(stagingGround.files).toHaveLength(1);
      expect(stagingGround.files[0].path).toBe('input/questionnaires/new-name.json');
      expect(stagingGround.files[0].metadata.isRenamed).toBe(true);
      expect(stagingGround.files[0].metadata.originalPath).toBe('input/questionnaires/old-name.json');
    });

    test('should throw error if source file not found', () => {
      expect(() => {
        stagingGroundService.renameFile(
          'input/questionnaires/nonexistent.json',
          'input/questionnaires/new-name.json'
        );
      }).toThrow('File not found in staging ground');
    });

    test('should throw error if destination file already exists', () => {
      // Add two files
      stagingGroundService.updateFile(
        'input/questionnaires/file1.json',
        '{}',
        {}
      );
      stagingGroundService.updateFile(
        'input/questionnaires/file2.json', 
        '{}',
        {}
      );

      // Try to rename file1 to file2 (which already exists)
      expect(() => {
        stagingGroundService.renameFile(
          'input/questionnaires/file1.json',
          'input/questionnaires/file2.json'
        );
      }).toThrow('File already exists at destination');
    });

    test('should preserve file content during rename', () => {
      const originalContent = JSON.stringify({ 
        resourceType: 'Questionnaire', 
        id: 'test-questionnaire',
        title: 'Test Questionnaire' 
      });

      stagingGroundService.updateFile(
        'input/questionnaires/original.json',
        originalContent,
        { type: 'questionnaire', author: 'test' }
      );

      stagingGroundService.renameFile(
        'input/questionnaires/original.json',
        'input/questionnaires/renamed.json'
      );

      const stagingGround = stagingGroundService.getStagingGround();
      const renamedFile = stagingGround.files[0];
      
      expect(renamedFile.content).toBe(originalContent);
      expect(renamedFile.metadata.type).toBe('questionnaire');
      expect(renamedFile.metadata.author).toBe('test');
    });

    test('should update timestamp when renaming', () => {
      stagingGroundService.updateFile('input/test.json', '{}', {});
      
      const beforeRename = Date.now();
      stagingGroundService.renameFile('input/test.json', 'input/renamed.json');
      const afterRename = Date.now();

      const stagingGround = stagingGroundService.getStagingGround();
      const file = stagingGround.files[0];
      
      expect(file.timestamp).toBeGreaterThanOrEqual(beforeRename);
      expect(file.timestamp).toBeLessThanOrEqual(afterRename);
      expect(file.metadata.lastModified).toBeGreaterThanOrEqual(beforeRename);
      expect(file.metadata.lastModified).toBeLessThanOrEqual(afterRename);
    });
  });

  describe('getRenamedFiles', () => {
    test('should return only renamed files', () => {
      // Add a normal file
      stagingGroundService.updateFile('input/normal.json', '{}', {});
      
      // Add and rename a file
      stagingGroundService.updateFile('input/original.json', '{}', {});
      stagingGroundService.renameFile('input/original.json', 'input/renamed.json');

      const renamedFiles = stagingGroundService.getRenamedFiles();
      
      expect(renamedFiles).toHaveLength(1);
      expect(renamedFiles[0].path).toBe('input/renamed.json');
      expect(renamedFiles[0].metadata.originalPath).toBe('input/original.json');
    });

    test('should return empty array when no files are renamed', () => {
      stagingGroundService.updateFile('input/file1.json', '{}', {});
      stagingGroundService.updateFile('input/file2.json', '{}', {});

      const renamedFiles = stagingGroundService.getRenamedFiles();
      expect(renamedFiles).toHaveLength(0);
    });
  });

  describe('multiple renames', () => {
    test('should handle multiple renames correctly', () => {
      // Add multiple files
      stagingGroundService.updateFile('input/file1.json', '{"id": "file1"}', {});
      stagingGroundService.updateFile('input/file2.json', '{"id": "file2"}', {});
      
      // Rename both
      stagingGroundService.renameFile('input/file1.json', 'input/renamed1.json');
      stagingGroundService.renameFile('input/file2.json', 'input/renamed2.json');

      const stagingGround = stagingGroundService.getStagingGround();
      const renamedFiles = stagingGroundService.getRenamedFiles();
      
      expect(stagingGround.files).toHaveLength(2);
      expect(renamedFiles).toHaveLength(2);
      
      const paths = stagingGround.files.map(f => f.path).sort();
      expect(paths).toEqual(['input/renamed1.json', 'input/renamed2.json']);
    });

    test('should handle chain renames', () => {
      stagingGroundService.updateFile('input/original.json', '{}', {});
      
      // Rename: original -> intermediate -> final
      stagingGroundService.renameFile('input/original.json', 'input/intermediate.json');
      stagingGroundService.renameFile('input/intermediate.json', 'input/final.json');

      const stagingGround = stagingGroundService.getStagingGround();
      expect(stagingGround.files).toHaveLength(1);
      expect(stagingGround.files[0].path).toBe('input/final.json');
      
      // Should preserve the most recent original path
      expect(stagingGround.files[0].metadata.originalPath).toBe('input/intermediate.json');
    });
  });
});