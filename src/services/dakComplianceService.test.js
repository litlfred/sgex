import dakComplianceService from '../services/dakComplianceService';

describe('DAKComplianceService', () => {
  test('validates XML well-formed content', async () => {
    const validXml = '<?xml version="1.0"?><root><child>content</child></root>';
    const invalidXml = '<?xml version="1.0"?><root><child>content</root>';

    const validResult = await dakComplianceService.validateFile('test.xml', validXml);
    const xmlErrors = validResult.filter(r => r.validatorId === 'xml-well-formed');
    expect(xmlErrors).toHaveLength(0);

    const invalidResult = await dakComplianceService.validateFile('test.xml', invalidXml);
    const xmlValidationErrors = invalidResult.filter(r => r.validatorId === 'xml-well-formed');
    expect(xmlValidationErrors.length).toBeGreaterThan(0);
    expect(xmlValidationErrors[0].level).toBe('error');
  });

  test('validates BPMN namespace', async () => {
    const validBpmn = `<?xml version="1.0"?>
      <definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
        <process><startEvent/></process>
      </definitions>`;
    
    const invalidBpmn = `<?xml version="1.0"?>
      <definitions xmlns:bpmn="http://wrong.namespace">
        <process><startEvent/></process>
      </definitions>`;

    const validResult = await dakComplianceService.validateFile('test.bpmn', validBpmn);
    const namespaceIssues = validResult.filter(r => r.validatorId === 'bpmn-namespace');
    expect(namespaceIssues).toHaveLength(0);

    const invalidResult = await dakComplianceService.validateFile('test.bpmn', invalidBpmn);
    const namespaceErrors = invalidResult.filter(r => r.validatorId === 'bpmn-namespace');
    expect(namespaceErrors).toHaveLength(1);
    expect(namespaceErrors[0].level).toBe('error');
  });

  test('validates JSON syntax', async () => {
    const validJson = '{"test": "value"}';
    const invalidJson = '{"test": "value"';

    const validResult = await dakComplianceService.validateFile('test.json', validJson);
    const syntaxIssues = validResult.filter(r => r.validatorId === 'json-valid');
    expect(syntaxIssues).toHaveLength(0);

    const invalidResult = await dakComplianceService.validateFile('test.json', invalidJson);
    const syntaxErrors = invalidResult.filter(r => r.validatorId === 'json-valid');
    expect(syntaxErrors).toHaveLength(1);
    expect(syntaxErrors[0].level).toBe('error');
  });

  test('validates file size limits', async () => {
    const smallContent = 'small file content';
    const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB

    const smallResult = await dakComplianceService.validateFile('small.txt', smallContent);
    const sizeIssues = smallResult.filter(r => r.validatorId === 'file-size-limit');
    expect(sizeIssues).toHaveLength(0);

    const largeResult = await dakComplianceService.validateFile('large.txt', largeContent);
    const sizeWarnings = largeResult.filter(r => r.validatorId === 'file-size-limit');
    expect(sizeWarnings).toHaveLength(1);
    expect(sizeWarnings[0].level).toBe('warning');
  });

  test('validates filename conventions', async () => {
    const goodFilename = 'good-filename.txt';
    const badFilename = 'bad filename with spaces.txt';

    const goodResult = await dakComplianceService.validateFile(goodFilename, 'content');
    const conventionIssues = goodResult.filter(r => r.validatorId === 'filename-conventions');
    expect(conventionIssues).toHaveLength(0);

    const badResult = await dakComplianceService.validateFile(badFilename, 'content');
    const conventionWarnings = badResult.filter(r => r.validatorId === 'filename-conventions');
    expect(conventionWarnings).toHaveLength(1);
    expect(conventionWarnings[0].level).toBe('info');
  });

  test('validates entire staging ground', async () => {
    const stagingGround = {
      files: [
        { path: 'valid.json', content: '{"valid": true}' },
        { path: 'invalid.json', content: '{"invalid": true' },
        { path: 'test.bpmn', content: '<?xml version="1.0"?><definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"><process><startEvent/></process></definitions>' }
      ]
    };

    const result = await dakComplianceService.validateStagingGround(stagingGround);
    
    expect(result.summary.error).toBe(1); // Invalid JSON
    expect(result.summary.warning).toBeGreaterThanOrEqual(0);
    expect(result.summary.info).toBeGreaterThanOrEqual(0);
    
    expect(result.files['valid.json']).toBeDefined();
    expect(result.files['invalid.json']).toBeDefined();
    expect(result.files['test.bpmn']).toBeDefined();
  });

  test('determines if staging ground can be saved', async () => {
    const validStagingGround = {
      files: [
        { path: 'valid.json', content: '{"valid": true}' }
      ]
    };

    const invalidStagingGround = {
      files: [
        { path: 'invalid.json', content: '{"invalid": true' }
      ]
    };

    const canSaveValid = await dakComplianceService.canSave(validStagingGround);
    expect(canSaveValid).toBe(true);

    const canSaveInvalid = await dakComplianceService.canSave(invalidStagingGround);
    expect(canSaveInvalid).toBe(false);
  });

  test('formats validation results for display', () => {
    const validation = {
      summary: { error: 1, warning: 2, info: 1 },
      files: {
        'test.json': [
          {
            level: 'error',
            message: 'JSON syntax error',
            description: 'Invalid JSON',
            suggestion: 'Fix JSON syntax'
          }
        ]
      }
    };

    const formatted = dakComplianceService.formatValidationResults(validation);
    expect(formatted.canSave).toBe(false);
    expect(formatted.summary).toEqual({ error: 1, warning: 2, info: 1 });
    expect(formatted.files).toHaveLength(1);
    expect(formatted.files[0].path).toBe('test.json');
    expect(formatted.files[0].issues).toHaveLength(1);
  });

  test('gets validation summary for UI display', () => {
    const validation = {
      summary: { error: 0, warning: 1, info: 2 }
    };

    const summary = dakComplianceService.getValidationSummary(validation);
    expect(summary).toEqual({
      error: 0,
      warning: 1,
      info: 2,
      canSave: true,
      hasIssues: true
    });
  });

  test('adds and removes custom validators', async () => {
    // Add custom validator
    dakComplianceService.addValidator('txt', 'custom-test', {
      level: 'warning',
      description: 'Custom test validator',
      validator: async (filePath, content) => {
        if (content.includes('test')) {
          return { message: 'Contains test word', filePath };
        }
        return null;
      }
    });

    const result = await dakComplianceService.validateFile('test.txt', 'This is a test');
    const customIssues = result.filter(r => r.validatorId === 'custom-test');
    expect(customIssues).toHaveLength(1);
    expect(customIssues[0].level).toBe('warning');

    // Remove custom validator
    dakComplianceService.removeValidator('txt', 'custom-test');
    
    const result2 = await dakComplianceService.validateFile('test.txt', 'This is a test');
    const customIssues2 = result2.filter(r => r.validatorId === 'custom-test');
    expect(customIssues2).toHaveLength(0);
  });
});