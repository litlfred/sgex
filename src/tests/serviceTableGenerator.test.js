/**
 * Service Table Generator Tests
 * Tests the automatic generation of service tables from codebase
 */

const ServiceTableGenerator = require('../../scripts/generate-service-table.js');
const fs = require('fs').promises;
const path = require('path');

describe('Service Table Generator', () => {
  let generator;
  
  beforeEach(() => {
    generator = new ServiceTableGenerator();
  });

  test('should create instance', () => {
    expect(generator).toBeDefined();
    expect(generator.services).toEqual([]);
  });

  test('should load FAQ question IDs', async () => {
    const questionIds = await generator.loadFAQQuestionIds();
    
    expect(Array.isArray(questionIds)).toBe(true);
    expect(questionIds.length).toBeGreaterThan(0);
    
    // Should contain expected question IDs
    expect(questionIds).toContain('dak-name');
    expect(questionIds).toContain('dak-version');
  });

  test('should generate markdown table', async () => {
    // Add some test services
    generator.services = [
      {
        category: 'Test',
        name: 'Test Service',
        description: 'Test description',
        inputParameters: ['test param'],
        inputSchemas: ['test schema'],
        outputDescription: 'test output',
        outputSchema: 'test output schema',
        openApiSpec: 'test spec',
        webInterface: 'Yes',
        mcpInterface: 'No',
        openApiCompliance: 'Partial'
      }
    ];

    const table = generator.generateMarkdownTable();
    
    expect(table).toContain('# Service Table');
    expect(table).toContain('Test Service');
    expect(table).toContain('Generated on:');
    expect(table).toContain('scripts/generate-service-table.js');
  });

  test('should create schema links correctly', () => {
    const link = generator.createSchemaLink('test schema', 'path/to/schema.json');
    
    expect(link).toBe('[test schema](https://github.com/litlfred/sgex/blob/main/path/to/schema.json)');
  });

  test('should update questionId schema with dynamic enum', async () => {
    const testQuestionIds = ['test-question-1', 'test-question-2'];
    
    // Create a temp schema file for testing
    const tempSchemaPath = path.join(__dirname, '../../services/dak-faq-mcp/schemas/questionId.schema.json.test');
    generator.basePath = path.join(__dirname, '../..');
    
    // Mock the updateQuestionIdSchema to use temp file
    const originalUpdateMethod = generator.updateQuestionIdSchema;
    generator.updateQuestionIdSchema = async (questionIds) => {
      const schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "FAQ Question ID",
        "description": "Enum of valid FAQ question identifiers, dynamically generated from available questions",
        "type": "string",
        "enum": questionIds.sort(),
        "examples": questionIds.slice(0, 3),
        "_generated": {
          "timestamp": new Date().toISOString(),
          "count": questionIds.length,
          "source": "scripts/generate-service-table.js"
        }
      };

      await fs.writeFile(tempSchemaPath, JSON.stringify(schema, null, 2));
    };

    await generator.updateQuestionIdSchema(testQuestionIds);
    
    // Verify the schema was created
    const schemaContent = await fs.readFile(tempSchemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);
    
    expect(schema.enum).toEqual(['test-question-1', 'test-question-2']);
    expect(schema._generated.count).toBe(2);
    
    // Cleanup
    await fs.unlink(tempSchemaPath).catch(() => {});
  });

  test('should handle missing directories gracefully', async () => {
    // Test with non-existent path
    const originalBasePath = generator.basePath;
    generator.basePath = '/non/existent/path';
    
    const questionIds = await generator.loadFAQQuestionIds();
    
    expect(Array.isArray(questionIds)).toBe(true);
    expect(questionIds.length).toBe(0);
    
    generator.basePath = originalBasePath;
  });
});

describe('Service Table Integration', () => {
  test('should generate complete service table', async () => {
    const generator = new ServiceTableGenerator();
    
    // Mock console.log to capture output
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => logs.push(args.join(' '));
    
    try {
      await generator.generate();
      
      // Check that the service table file was created
      const tableContent = await fs.readFile(
        path.join(__dirname, '../../docs/SERVICE_TABLE.md'),
        'utf-8'
      );
      
      expect(tableContent).toContain('# Service Table');
      expect(tableContent).toContain('DAK FAQ');
      expect(tableContent).toContain('Generated on:');
      
      // Check logs
      expect(logs.some(log => log.includes('Generating service table'))).toBe(true);
      expect(logs.some(log => log.includes('Service table generated'))).toBe(true);
      
    } finally {
      console.log = originalLog;
    }
  });
});