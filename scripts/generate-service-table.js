#!/usr/bin/env node
/**
 * Service Table Generator
 * 
 * Automatically generates a comprehensive service table from the codebase,
 * extracting information from:
 * - OpenAPI specifications
 * - JSON schemas
 * - FAQ question definitions
 * - Service implementations
 * 
 * This table should be regenerated on every commit to stay current.
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class ServiceTableGenerator {
  constructor() {
    this.services = [];
    this.baseUrl = 'https://github.com/litlfred/sgex';
    this.basePath = '/home/runner/work/sgex/sgex';
  }

  /**
   * Main generation method
   */
  async generate() {
    console.log('🚀 Generating service table...');
    
    try {
      // Scan for all services
      await this.scanDAKFAQService();
      await this.scanOtherServices();
      
      // Generate the table
      const tableMarkdown = this.generateMarkdownTable();
      
      // Write to file
      const outputPath = path.join(this.basePath, 'docs/SERVICE_TABLE.md');
      await fs.writeFile(outputPath, tableMarkdown);
      
      console.log(`✅ Service table generated: ${outputPath}`);
      return tableMarkdown;
    } catch (error) {
      console.error('❌ Error generating service table:', error);
      throw error;
    }
  }

  /**
   * Scan DAK FAQ MCP service
   */
  async scanDAKFAQService() {
    console.log('📋 Scanning DAK FAQ MCP service...');
    
    const serviceDir = path.join(this.basePath, 'services/dak-faq-mcp');
    
    // Load OpenAPI spec
    const openApiPath = path.join(serviceDir, 'docs/openapi.yaml');
    let openApiSpec = null;
    try {
      const openApiContent = await fs.readFile(openApiPath, 'utf-8');
      openApiSpec = yaml.load(openApiContent);
    } catch (error) {
      console.warn(`Could not load OpenAPI spec: ${error.message}`);
    }

    // Load MCP manifest
    const mcpManifestPath = path.join(serviceDir, 'mcp-manifest.json');
    let mcpManifest = null;
    try {
      const mcpContent = await fs.readFile(mcpManifestPath, 'utf-8');
      mcpManifest = JSON.parse(mcpContent);
    } catch (error) {
      console.warn(`Could not load MCP manifest: ${error.message}`);
    }

    // Load FAQ questions catalog
    const questionIds = await this.loadFAQQuestionIds();

    // Add main DAK FAQ service
    this.services.push({
      category: 'DAK FAQ',
      name: 'DAK FAQ Main',
      description: 'Main FAQ answering for DAKs; structured/narrative output',
      inputParameters: [
        '`questionId`: FAQ question identifier',
        '`parameters`: Optional question parameters', 
        '`context`: Optional context (e.g., repository path)'
      ],
      inputSchemas: [
        this.createSchemaLink('questionId schema', 'services/dak-faq-mcp/schemas/questionId.schema.json'),
        this.createSchemaLink('parameters schema', 'services/dak-faq-mcp/schemas/faq-parameters.schema.json'),
        this.createSchemaLink('context schema', 'services/dak-faq-mcp/schemas/context.schema.json')
      ],
      outputDescription: 'Structured JSON result and narrative text',
      outputSchema: this.createSchemaLink('faq output schema', 'services/dak-faq-mcp/schemas/faq-output.schema.json'),
      openApiSpec: this.createSchemaLink('OpenAPI spec', 'services/dak-faq-mcp/openapi.yaml'),
      webInterface: 'Yes',
      mcpInterface: 'Yes',
      openApiCompliance: 'Partial'
    });

    // Add sub-services based on OpenAPI paths
    if (openApiSpec && openApiSpec.paths) {
      for (const [pathKey, pathData] of Object.entries(openApiSpec.paths)) {
        for (const [method, methodData] of Object.entries(pathData)) {
          if (typeof methodData === 'object' && methodData.operationId) {
            this.services.push({
              category: '',
              name: methodData.operationId,
              description: methodData.description || methodData.summary || 'No description available',
              inputParameters: this.extractInputParameters(methodData),
              inputSchemas: this.extractInputSchemas(methodData),
              outputDescription: this.extractOutputDescription(methodData),
              outputSchema: this.extractOutputSchema(methodData),
              openApiSpec: this.createSchemaLink('OpenAPI spec', 'services/dak-faq-mcp/openapi.yaml'),
              webInterface: pathKey.includes('/health') ? 'No' : 'Yes',
              mcpInterface: this.getMCPInterface(methodData.operationId, mcpManifest),
              openApiCompliance: 'Partial'
            });
          }
        }
      }
    }
  }

  /**
   * Load FAQ question IDs and generate enum
   */
  async loadFAQQuestionIds() {
    const questionIds = [];
    
    // Scan FAQ questions directories
    const questionsDir = path.join(this.basePath, 'src/dak/faq/questions');
    
    try {
      const levels = await fs.readdir(questionsDir);
      for (const level of levels) {
        const levelPath = path.join(questionsDir, level);
        const stat = await fs.stat(levelPath);
        if (stat.isDirectory()) {
          await this.scanQuestionLevel(levelPath, questionIds);
        }
      }
    } catch (error) {
      console.warn(`Could not scan questions: ${error.message}`);
    }

    // Update the questionId schema with dynamic enum
    await this.updateQuestionIdSchema(questionIds);

    return questionIds;
  }

  /**
   * Update the questionId schema with dynamic enum
   */
  async updateQuestionIdSchema(questionIds) {
    const schemaPath = path.join(this.basePath, 'services/dak-faq-mcp/schemas/questionId.schema.json');
    
    try {
      const schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "FAQ Question ID",
        "description": "Enum of valid FAQ question identifiers, dynamically generated from available questions",
        "type": "string",
        "enum": questionIds.sort(),
        "examples": questionIds.slice(0, 3),
        "errorMessage": {
          "enum": "Question ID must be one of the available FAQ questions. Use the list_faq_questions endpoint to get current options."
        },
        "_generated": {
          "timestamp": new Date().toISOString(),
          "count": questionIds.length,
          "source": "scripts/generate-service-table.js"
        }
      };

      await fs.writeFile(schemaPath, JSON.stringify(schema, null, 2));
      console.log(`✅ Updated questionId schema with ${questionIds.length} questions`);
    } catch (error) {
      console.warn(`Could not update questionId schema: ${error.message}`);
    }
  }
  async scanQuestionLevel(dirPath, questionIds) {
    try {
      const items = await fs.readdir(dirPath);
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          await this.scanQuestionLevel(itemPath, questionIds);
        } else if (item.endsWith('Question.js')) {
          // Extract question ID from file
          const content = await fs.readFile(itemPath, 'utf-8');
          const idMatch = content.match(/id:\s*['"`]([^'"`]+)['"`]/);
          if (idMatch) {
            questionIds.push(idMatch[1]);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Scan other services (placeholder for future expansion)
   */
  async scanOtherServices() {
    console.log('📋 Scanning other services...');
    
    // Add placeholder services based on the example table
    const placeholderServices = [
      {
        category: 'DAK Catalog',
        name: 'DAK Catalog Main',
        description: 'Catalog of DAKs, components, and assets',
        inputParameters: ['`filter`: object (optional)', '`dakId`: string (for specific queries)'],
        inputSchemas: [
          this.createSchemaLink('filter schema', 'services/dak-catalog/schemas/filter.schema.json'),
          this.createSchemaLink('dakId schema', 'services/dak-catalog/schemas/dakId.schema.json')
        ],
        outputDescription: 'List of DAKs/components/assets with metadata',
        outputSchema: this.createSchemaLink('catalog output schema', 'services/dak-catalog/schemas/catalog-output.schema.json'),
        openApiSpec: this.createSchemaLink('OpenAPI spec', 'services/dak-catalog/openapi.yaml'),
        webInterface: 'Yes',
        mcpInterface: 'Partial',
        openApiCompliance: 'Partial'
      },
      {
        category: 'DAK Component View',
        name: 'Component Browser',
        description: 'Browses components of DAKs',
        inputParameters: ['`componentId`: string or query params'],
        inputSchemas: [
          this.createSchemaLink('componentId schema', 'services/dak-components/schemas/componentId.schema.json')
        ],
        outputDescription: 'List/details of components with structure/metadata',
        outputSchema: this.createSchemaLink('component output schema', 'services/dak-components/schemas/component-output.schema.json'),
        openApiSpec: this.createSchemaLink('OpenAPI spec', 'services/dak-components/openapi.yaml'),
        webInterface: 'Yes',
        mcpInterface: 'No',
        openApiCompliance: 'Partial'
      },
      {
        category: 'Asset Browser',
        name: 'Asset Browser Main',
        description: 'Browses assets in DAKs/components',
        inputParameters: [
          '`componentId` or `dakId`: string (filter)',
          '`assetType`: string (optional)'
        ],
        inputSchemas: [
          this.createSchemaLink('componentId schema', 'services/assets/schemas/componentId.schema.json'),
          this.createSchemaLink('dakId schema', 'services/assets/schemas/dakId.schema.json'),
          this.createSchemaLink('assetType schema', 'services/assets/schemas/assetType.schema.json')
        ],
        outputDescription: 'List of assets with metadata and file links',
        outputSchema: this.createSchemaLink('assets output schema', 'services/assets/schemas/assets-output.schema.json'),
        openApiSpec: this.createSchemaLink('OpenAPI spec', 'services/assets/openapi.yaml'),
        webInterface: 'Yes',
        mcpInterface: 'No',
        openApiCompliance: 'Partial'
      },
      {
        category: 'MCP Tooling',
        name: 'MCP Server',
        description: 'Core MCP transport/tools, protocol handling',
        inputParameters: ['MCP-compliant JSON-RPC requests'],
        inputSchemas: [
          this.createSchemaLink('tools/call input schema', 'services/dak-faq-mcp/schemas/tools-call.schema.json')
        ],
        outputDescription: 'Structured tool results or MCP errors',
        outputSchema: this.createSchemaLink('tools output schema', 'services/dak-faq-mcp/schemas/tools-output.schema.json'),
        openApiSpec: this.createSchemaLink('MCP manifest', 'services/dak-faq-mcp/mcp-manifest.json'),
        webInterface: 'No',
        mcpInterface: 'Yes',
        openApiCompliance: 'No'
      },
      {
        category: 'Documentation Gen',
        name: 'Docs Generator',
        description: 'Generates documentation from schemas and service metadata',
        inputParameters: ['Project structure and schema definitions'],
        inputSchemas: [
          this.createSchemaLink('docs input schema', 'services/docs/schemas/docs-input.schema.json')
        ],
        outputDescription: 'Rendered docs (Markdown, OpenAPI, MCP manifest)',
        outputSchema: this.createSchemaLink('docs output schema', 'services/docs/schemas/docs-output.schema.json'),
        openApiSpec: this.createSchemaLink('OpenAPI spec', 'services/docs/openapi.yaml'),
        webInterface: 'Yes',
        mcpInterface: 'Partial',
        openApiCompliance: 'Yes'
      }
    ];

    this.services.push(...placeholderServices);
  }

  /**
   * Extract input parameters from OpenAPI method
   */
  extractInputParameters(methodData) {
    const parameters = [];
    
    if (methodData.parameters) {
      for (const param of methodData.parameters) {
        parameters.push(`\`${param.name}\`: ${param.schema?.type || 'string'}${param.required ? '' : ' (optional)'}`);
      }
    }

    if (methodData.requestBody && methodData.requestBody.content) {
      const content = methodData.requestBody.content;
      if (content['application/json'] && content['application/json'].schema) {
        const schema = content['application/json'].schema;
        if (schema.properties) {
          for (const [propName, propData] of Object.entries(schema.properties)) {
            const required = schema.required && schema.required.includes(propName) ? '' : ' (optional)';
            parameters.push(`\`${propName}\`: ${propData.type || 'object'}${required}`);
          }
        }
      }
    }

    return parameters.length > 0 ? parameters : ['None'];
  }

  /**
   * Extract input schemas from OpenAPI method
   */
  extractInputSchemas(methodData) {
    // This would normally extract actual schema references
    // For now, return placeholder
    return [this.createSchemaLink('input schema', 'services/dak-faq-mcp/schemas/input.schema.json')];
  }

  /**
   * Extract output description from OpenAPI method
   */
  extractOutputDescription(methodData) {
    if (methodData.responses && methodData.responses['200'] && methodData.responses['200'].description) {
      return methodData.responses['200'].description;
    }
    return 'No description available';
  }

  /**
   * Extract output schema from OpenAPI method
   */
  extractOutputSchema(methodData) {
    return this.createSchemaLink('output schema', 'services/dak-faq-mcp/schemas/output.schema.json');
  }

  /**
   * Get MCP interface status
   */
  getMCPInterface(operationId, mcpManifest) {
    if (!mcpManifest || !mcpManifest.tools) return 'No';
    
    const mcpTools = mcpManifest.tools.map(t => t.name);
    
    // Map operation IDs to MCP tool names
    const mapping = {
      'executeFAQQuestions': 'execute_faq_question',
      'getFAQCatalog': 'list_faq_questions',
      'getQuestionSchema': 'get_question_schema'
    };

    const mcpToolName = mapping[operationId];
    return mcpTools.includes(mcpToolName) ? 'Yes' : 'Partial';
  }

  /**
   * Create schema link with proper formatting
   */
  createSchemaLink(text, relativePath) {
    return `[${text}](${this.baseUrl}/blob/main/${relativePath})`;
  }

  /**
   * Generate markdown table
   */
  generateMarkdownTable() {
    const header = `# Service Table

This table is automatically generated from the codebase on every commit.

| Service Category    | Service Name / Sub-Service          | Description                                                       | Input Parameters (bulleted)                                                                                                                                         | Input JSON Schemas (ordered list)                                                                                                                                           | Output Description                                           | Output JSON Schema Link         | OpenAPI Spec Link        | Web Interface | MCP Interface | OpenAPI Compliance |
|---------------------|-------------------------------------|-------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|-------------------------------|--------------------------|:-------------:|:-------------:|:------------------:|`;

    let tableRows = '';
    
    for (const service of this.services) {
      const inputParams = Array.isArray(service.inputParameters) 
        ? service.inputParameters.map(p => `- ${p}`).join('<br>')
        : service.inputParameters;
      
      const inputSchemas = Array.isArray(service.inputSchemas)
        ? service.inputSchemas.map((s, i) => `${i + 1}. ${s}`).join('<br>')
        : service.inputSchemas;

      tableRows += `\n| ${service.category} | ${service.name} | ${service.description} | ${inputParams} | ${inputSchemas} | ${service.outputDescription} | ${service.outputSchema} | ${service.openApiSpec} | ${service.webInterface} | ${service.mcpInterface} | ${service.openApiCompliance} |`;
    }

    const legend = `

**Legend:**
- **Yes**: Fully supported/implemented
- **Partial**: Supported for some endpoints/tools, or in-progress
- **No**: Not supported/implemented

**Notes:**
- Input parameters are bullet lists for clarity, with input JSON schemas linked in the same order.
- Output schema links are provided for structured responses.
- OpenAPI Spec links point to the corresponding OpenAPI documentation in the repo.
- MCP manifest links included for MCP tooling.

*Generated on: ${new Date().toISOString()}*
*Generator: scripts/generate-service-table.js*
`;

    return header + tableRows + legend;
  }
}

// Main execution
async function main() {
  const generator = new ServiceTableGenerator();
  await generator.generate();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ServiceTableGenerator;