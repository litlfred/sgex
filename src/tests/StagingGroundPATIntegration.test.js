/**
 * Integration Test: Staging Ground + PAT Security Model
 * 
 * This test verifies that the staging ground functionality properly
 * integrates with the PAT-based security model.
 */

import stagingGroundService from '../services/stagingGroundService';
import patManagementService from '../services/patManagementService';
import dakComplianceService from '../services/dakComplianceService';

describe('Staging Ground + PAT Integration', () => {
  const mockRepository = {
    full_name: 'test-org/test-dak',
    name: 'test-dak',
    owner: { login: 'test-org' }
  };

  const mockBranch = 'main';

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Initialize staging ground
    stagingGroundService.initialize(mockRepository, mockBranch);
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('staging ground initializes correctly', () => {
    const stagingGround = stagingGroundService.getStagingGround();
    
    expect(stagingGround).toBeDefined();
    expect(stagingGround.files).toEqual([]);
    expect(stagingGround.repository).toBe(mockRepository.full_name);
    expect(stagingGround.branch).toBe(mockBranch);
  });

  test('staging ground can store and retrieve files', () => {
    const testFile = {
      path: 'test-file.json',
      content: '{"test": "data"}',
      metadata: { source: 'test' }
    };

    // Add file to staging ground
    const success = stagingGroundService.updateFile(
      testFile.path, 
      testFile.content, 
      testFile.metadata
    );
    
    expect(success).toBe(true);

    // Retrieve staging ground
    const stagingGround = stagingGroundService.getStagingGround();
    
    expect(stagingGround.files).toHaveLength(1);
    expect(stagingGround.files[0].path).toBe(testFile.path);
    expect(stagingGround.files[0].content).toBe(testFile.content);
    expect(stagingGround.files[0].metadata.source).toBe(testFile.metadata.source);
  });

  test('DAK compliance service can validate staged files', async () => {
    // Add valid JSON file
    stagingGroundService.updateFile('valid.json', '{"valid": true}');
    
    // Add invalid JSON file
    stagingGroundService.updateFile('invalid.json', '{"invalid": json}');
    
    // Add empty file
    stagingGroundService.updateFile('empty.txt', '');

    const stagingGround = stagingGroundService.getStagingGround();
    const validation = await dakComplianceService.validateFiles(stagingGround.files);

    expect(validation).toBeDefined();
    expect(validation.summary.totalFiles).toBe(3);
    expect(validation.summary.filesWithErrors).toBeGreaterThan(0);
    expect(validation.summary.filesWithWarnings).toBeGreaterThan(0);
  });

  test('staging ground persists across service reinitialization', () => {
    const testFile = {
      path: 'persistent.json',
      content: '{"persistent": true}'
    };

    // Add file
    stagingGroundService.updateFile(testFile.path, testFile.content);
    
    // Reinitialize service (simulates page reload)
    stagingGroundService.initialize(mockRepository, mockBranch);
    
    // Check file is still there
    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files).toHaveLength(1);
    expect(stagingGround.files[0].path).toBe(testFile.path);
  });

  test('staging ground can be cleared', () => {
    // Add some files
    stagingGroundService.updateFile('file1.txt', 'content1');
    stagingGroundService.updateFile('file2.json', '{"data": 2}');
    
    let stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files).toHaveLength(2);
    
    // Clear staging ground
    stagingGroundService.clearChanges();
    
    stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files).toHaveLength(0);
  });

  test('staging ground status reporting works correctly', () => {
    expect(stagingGroundService.hasChanges()).toBe(false);
    expect(stagingGroundService.getChangedFilesCount()).toBe(0);
    
    stagingGroundService.updateFile('test.txt', 'test content');
    
    expect(stagingGroundService.hasChanges()).toBe(true);
    expect(stagingGroundService.getChangedFilesCount()).toBe(1);
    
    const status = stagingGroundService.getStatus();
    expect(status.hasChanges).toBe(true);
    expect(status.filesCount).toBe(1);
    expect(status.repository).toBe(mockRepository.full_name);
    expect(status.branch).toBe(mockBranch);
  });

  test('staging ground listeners work correctly', (done) => {
    let callbackCount = 0;
    
    const unsubscribe = stagingGroundService.addListener((stagingGround) => {
      callbackCount++;
      
      if (callbackCount === 1) {
        // First call should be from updateFile
        expect(stagingGround.files).toHaveLength(1);
        done();
      }
    });

    // Add file to trigger listener
    stagingGroundService.updateFile('listener-test.txt', 'test');
    
    // Cleanup
    setTimeout(() => {
      unsubscribe();
    }, 100);
  });

  test('PAT management service integration check', () => {
    // This test ensures PAT management service is available for staging ground operations
    expect(patManagementService).toBeDefined();
    expect(typeof patManagementService.checkRepositoryWriteAccess).toBe('function');
    expect(typeof patManagementService.findBestPATForRepository).toBe('function');
  });

  test('staging ground file contribution interface', () => {
    const files = [
      { path: 'contributed1.json', content: '{"from": "tool1"}' },
      { path: 'contributed2.xml', content: '<root>tool2</root>' }
    ];

    const result = stagingGroundService.contributeFiles(files, {
      tool: 'test-editor',
      version: '1.0'
    });

    expect(result.success).toBe(true);
    expect(result.results).toHaveLength(2);
    expect(result.results.every(r => r.success)).toBe(true);

    const stagingGround = stagingGroundService.getStagingGround();
    expect(stagingGround.files).toHaveLength(2);
    expect(stagingGround.files[0].metadata.source).toBe('test-editor');
  });
});

export default {};