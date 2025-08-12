/**
 * Basic tests for the DAK Validation Framework
 */

import dakValidationRegistry from '../services/dakValidationRegistry';
import enhancedDAKValidationService from '../services/enhancedDAKValidationService';

describe('DAK Validation Framework', () => {
  
  describe('Validation Registry', () => {
    
    test('should initialize with expected validations', () => {
      const validations = dakValidationRegistry.getAllValidations();
      expect(validations.length).toBeGreaterThan(0);
      
      // Check that key validations are registered
      const validationIds = validations.map(v => v.id);
      expect(validationIds).toContain('dak-sushi-base');
      expect(validationIds).toContain('bpmn-business-rule-task-id');
      expect(validationIds).toContain('dmn-decision-label-id');
      expect(validationIds).toContain('xml-well-formed');
      expect(validationIds).toContain('json-valid');
    });

    test('should group validations by component', () => {
      const componentSummary = dakValidationRegistry.getComponentSummary();
      
      expect(componentSummary).toHaveProperty('dak-structure');
      expect(componentSummary).toHaveProperty('business-processes');
      expect(componentSummary).toHaveProperty('decision-support-logic');
      expect(componentSummary).toHaveProperty('file-structure');
      
      // Check validation counts
      expect(componentSummary['dak-structure'].validationCount).toBeGreaterThan(0);
      expect(componentSummary['business-processes'].validationCount).toBeGreaterThan(0);
    });

    test('should get validations for specific file types', () => {
      const bpmnValidations = dakValidationRegistry.getValidationsForFileType('bpmn');
      expect(bpmnValidations.length).toBeGreaterThan(0);
      
      const jsonValidations = dakValidationRegistry.getValidationsForFileType('json');
      expect(jsonValidations.length).toBeGreaterThan(0);
      
      const yamlValidations = dakValidationRegistry.getValidationsForFileType('yaml');
      expect(yamlValidations.length).toBeGreaterThan(0);
    });
  });

  describe('DAK Sushi Base Validation', () => {
    
    test('should validate valid sushi-config.yaml', async () => {
      const validConfig = `
id: test-dak
name: Test DAK
dependencies:
  smart.who.int.base: current
  hl7.fhir.r4.core: 4.0.1
`;
      
      const results = await dakValidationRegistry.validateFile('sushi-config.yaml', validConfig);
      const sushiBaseResults = results.filter(r => r.validationId === 'dak-sushi-base');
      expect(sushiBaseResults).toHaveLength(0); // No validation errors
    });

    test('should detect missing smart.who.int.base dependency', async () => {
      const invalidConfig = `
id: test-dak
name: Test DAK
dependencies:
  hl7.fhir.r4.core: 4.0.1
`;
      
      const results = await dakValidationRegistry.validateFile('sushi-config.yaml', invalidConfig);
      const sushiBaseResults = results.filter(r => r.validationId === 'dak-sushi-base');
      expect(sushiBaseResults).toHaveLength(1);
      expect(sushiBaseResults[0].level).toBe('error');
      expect(sushiBaseResults[0].message).toContain('smart.who.int.base');
    });

    test('should detect missing dependencies section', async () => {
      const invalidConfig = `
id: test-dak
name: Test DAK
version: 1.0.0
`;
      
      const results = await dakValidationRegistry.validateFile('sushi-config.yaml', invalidConfig);
      const sushiBaseResults = results.filter(r => r.validationId === 'dak-sushi-base');
      expect(sushiBaseResults).toHaveLength(1);
      expect(sushiBaseResults[0].level).toBe('error');
      expect(sushiBaseResults[0].message).toContain('dependencies');
    });
  });

  describe('BPMN Business Rule Task Validation', () => {
    
    test('should validate BPMN with proper business rule task IDs', async () => {
      const validBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <bpmn:process id="test-process">
    <bpmn:businessRuleTask id="determine-schedule" name="Determine Schedule" />
    <bpmn:businessRuleTask id="check-eligibility" name="Check Eligibility" />
  </bpmn:process>
</bpmn:definitions>`;
      
      const results = await dakValidationRegistry.validateFile('test.bpmn', validBpmn);
      const businessRuleResults = results.filter(r => r.validationId === 'bpmn-business-rule-task-id');
      expect(businessRuleResults).toHaveLength(0); // No validation errors
    });

    test('should detect business rule tasks without IDs', async () => {
      const invalidBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <bpmn:process id="test-process">
    <bpmn:businessRuleTask name="Task Without ID" />
    <bpmn:businessRuleTask id="valid-task" name="Valid Task" />
  </bpmn:process>
</bpmn:definitions>`;
      
      const results = await dakValidationRegistry.validateFile('test.bpmn', invalidBpmn);
      const businessRuleResults = results.filter(r => r.validationId === 'bpmn-business-rule-task-id');
      expect(businessRuleResults).toHaveLength(1);
      expect(businessRuleResults[0].level).toBe('error');
      expect(businessRuleResults[0].message).toContain('business rule task(s) without @id attributes');
    });
  });

  describe('DMN Decision Validation', () => {
    
    test('should validate DMN with proper decision elements', async () => {
      const validDmn = `<?xml version="1.0" encoding="UTF-8"?>
<dmn:definitions xmlns:dmn="https://www.omg.org/spec/DMN/20191111/MODEL/">
  <dmn:decision id="determine-schedule" label="Determine ANC Schedule">
    <dmn:decisionTable>
      <dmn:output id="output1" label="Schedule"/>
    </dmn:decisionTable>
  </dmn:decision>
</dmn:definitions>`;
      
      const results = await dakValidationRegistry.validateFile('test.dmn', validDmn);
      const dmnResults = results.filter(r => r.validationId === 'dmn-decision-label-id');
      expect(dmnResults).toHaveLength(0); // No validation errors
    });

    test('should detect decisions without required attributes', async () => {
      const invalidDmn = `<?xml version="1.0" encoding="UTF-8"?>
<dmn:definitions xmlns:dmn="https://www.omg.org/spec/DMN/20191111/MODEL/">
  <dmn:decision>
    <dmn:decisionTable>
      <dmn:output id="output1" label="Schedule"/>
    </dmn:decisionTable>
  </dmn:decision>
</dmn:definitions>`;
      
      const results = await dakValidationRegistry.validateFile('test.dmn', invalidDmn);
      const dmnResults = results.filter(r => r.validationId === 'dmn-decision-label-id');
      expect(dmnResults).toHaveLength(1);
      expect(dmnResults[0].level).toBe('error');
      expect(dmnResults[0].message).toContain('decision(s) with missing required attributes');
    });
  });

  describe('XML Well-formed Validation', () => {
    
    test('should validate well-formed XML', async () => {
      const validXml = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <element attribute="value">Content</element>
</root>`;
      
      const results = await dakValidationRegistry.validateFile('test.xml', validXml);
      const xmlResults = results.filter(r => r.validationId === 'xml-well-formed');
      expect(xmlResults).toHaveLength(0); // No validation errors
    });

    test('should detect malformed XML', async () => {
      const invalidXml = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <element attribute="value">Content
</root>`;
      
      const results = await dakValidationRegistry.validateFile('test.xml', invalidXml);
      const xmlResults = results.filter(r => r.validationId === 'xml-well-formed');
      expect(xmlResults).toHaveLength(1);
      expect(xmlResults[0].level).toBe('error');
      expect(xmlResults[0].message).toContain('XML parsing error');
    });
  });

  describe('JSON Validation', () => {
    
    test('should validate valid JSON', async () => {
      const validJson = `{
  "resourceType": "Patient",
  "id": "example",
  "name": [{"family": "Doe", "given": ["John"]}]
}`;
      
      const results = await dakValidationRegistry.validateFile('test.json', validJson);
      const jsonResults = results.filter(r => r.validationId === 'json-valid');
      expect(jsonResults).toHaveLength(0); // No validation errors
    });

    test('should detect invalid JSON', async () => {
      const invalidJson = `{
  "resourceType": "Patient",
  "id": "example",
  "name": [{"family": "Doe", "given": ["John"]}
}`;
      
      const results = await dakValidationRegistry.validateFile('test.json', invalidJson);
      const jsonResults = results.filter(r => r.validationId === 'json-valid');
      expect(jsonResults).toHaveLength(1);
      expect(jsonResults[0].level).toBe('error');
      expect(jsonResults[0].message).toContain('JSON syntax error');
    });
  });

  describe('Enhanced Validation Service', () => {
    
    test('should format validation results correctly', async () => {
      const invalidJson = '{"invalid": json}';
      const results = await enhancedDAKValidationService.validateFile('test.json', invalidJson);
      
      expect(results).toHaveProperty('summary');
      expect(results).toHaveProperty('byComponent');
      expect(results).toHaveProperty('byFile');
      expect(results).toHaveProperty('canSave');
      expect(results).toHaveProperty('total');
      
      expect(results.canSave).toBe(false);
      expect(results.summary.error).toBeGreaterThan(0);
    });

    test('should determine save capability based on error level', async () => {
      const validJson = '{"valid": "json"}';
      const results = await enhancedDAKValidationService.validateFile('test.json', validJson);
      
      expect(results.canSave).toBe(true);
      expect(results.summary.error).toBe(0);
    });
  });

  describe('File Naming Conventions', () => {
    
    test('should accept properly named files', async () => {
      const results = await dakValidationRegistry.validateFile('good-filename.json', '{}');
      const namingResults = results.filter(r => r.validationId === 'file-naming-conventions');
      expect(namingResults).toHaveLength(0); // No issues
    });

    test('should detect naming convention issues', async () => {
      const results = await dakValidationRegistry.validateFile('Bad File Name With Spaces.json', '{}');
      const namingResults = results.filter(r => r.validationId === 'file-naming-conventions');
      expect(namingResults).toHaveLength(1);
      expect(namingResults[0].level).toBe('info');
      expect(namingResults[0].message).toContain('convention issues');
    });
  });
});