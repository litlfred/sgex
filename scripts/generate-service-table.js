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
    const openApiPath = path.join(serviceDir, 'openapi.yaml');
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
            // Clean up description - remove excessive newlines and format properly
            let description = methodData.description || methodData.summary || 'No description available';
            description = description.replace(/\n\s*\n/g, ' '); // Replace double newlines with space
            description = description.replace(/\n/g, ' '); // Replace single newlines with space
            description = description.replace(/\s+/g, ' '); // Replace multiple spaces with single space
            description = description.trim(); // Remove leading/trailing whitespace
            
            this.services.push({
              category: '',
              name: methodData.operationId,
              description: description,
              inputParameters: this.extractInputParameters(methodData, openApiSpec),
              inputSchemas: this.extractInputSchemas(methodData, 'dak-faq-mcp'),
              outputDescription: this.extractOutputDescription(methodData),
              outputSchema: this.extractOutputSchema(methodData, 'dak-faq-mcp'),
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
   * Scan DAK Publication API services
   */
  async scanDAKPublicationAPI() {
    console.log('📖 Scanning DAK Publication API...');
    
    const publicationServicePath = path.join(this.basePath, 'services/dak-publication-api');
    
    // Check if service exists
    try {
      await fs.access(publicationServicePath);
    } catch (error) {
      console.warn('DAK Publication API not found, skipping...');
      return;
    }

    // Load OpenAPI specification
    let openApiSpec;
    try {
      const openApiPath = path.join(publicationServicePath, 'openapi.yaml');
      const openApiContent = await fs.readFile(openApiPath, 'utf8');
      openApiSpec = yaml.load(openApiContent);
    } catch (error) {
      console.warn(`Could not load Publication API OpenAPI spec: ${error.message}`);
      return;
    }

    // Load MCP manifest
    let mcpManifest;
    try {
      const mcpPath = path.join(publicationServicePath, 'mcp-manifest.json');
      const mcpContent = await fs.readFile(mcpPath, 'utf8');
      mcpManifest = JSON.parse(mcpContent);
    } catch (error) {
      console.warn(`Could not load Publication API MCP manifest: ${error.message}`);
    }

    // Add main DAK Publication category service
    this.services.push({
      category: 'DAK Publication',
      name: 'DAK Publication Main',
      description: 'Main publication generation and management service for DAKs',
      inputParameters: [
        '`dakRepository`: GitHub repository path',
        '`format`: Output format (html/epub/docbook/pdf)',
        '`templateId`: Template identifier'
      ],
      inputSchemas: [
        this.createSchemaLink('publication request schema', 'services/dak-publication-api/schemas/publication-request.schema.json'),
        this.createSchemaLink('template query schema', 'services/dak-publication-api/schemas/template-query.schema.json'),
        this.createSchemaLink('publication config schema', 'services/dak-publication-api/schemas/publication-config.schema.json')
      ],
      outputDescription: 'Generated publication files with metadata and download links',
      outputSchema: this.createSchemaLink('publication output schema', 'services/dak-publication-api/schemas/publication-output.schema.json'),
      openApiSpec: this.createSchemaLink('OpenAPI spec', 'services/dak-publication-api/openapi.yaml'),
      webInterface: 'Yes',
      mcpInterface: mcpManifest ? 'Yes' : 'No',
      openApiCompliance: 'Full'
    });

    // Add sub-services based on OpenAPI paths
    if (openApiSpec && openApiSpec.paths) {
      let servicesAdded = 0;
      for (const [pathKey, pathData] of Object.entries(openApiSpec.paths)) {
        for (const [method, methodData] of Object.entries(pathData)) {
          if (typeof methodData === 'object' && methodData.operationId) {
            // Clean up description - remove excessive newlines and format properly
            let description = methodData.description || methodData.summary || 'No description available';
            description = description.replace(/\n\s*\n/g, ' '); // Replace double newlines with space
            description = description.replace(/\n/g, ' '); // Replace single newlines with space
            description = description.replace(/\s+/g, ' '); // Replace multiple spaces with single space
            description = description.trim(); // Remove leading/trailing whitespace
            
            this.services.push({
              category: '',
              name: methodData.operationId,
              description: description,
              inputParameters: this.extractInputParameters(methodData, openApiSpec),
              inputSchemas: this.extractInputSchemas(methodData, 'dak-publication-api'),
              outputDescription: this.extractOutputDescription(methodData),
              outputSchema: this.extractOutputSchema(methodData, 'dak-publication-api'),
              openApiSpec: this.createSchemaLink('OpenAPI spec', 'services/dak-publication-api/openapi.yaml'),
              webInterface: pathKey.includes('/health') ? 'No' : 'Yes',
              mcpInterface: this.getMCPInterface(methodData.operationId, mcpManifest),
              openApiCompliance: 'Full'
            });
            servicesAdded++;
          }
        }
      }
      console.log(`✅ Added ${servicesAdded + 1} publication services (1 main + ${servicesAdded} endpoints)`);
    } else {
      console.log(`✅ Added 1 publication service (main only - no OpenAPI paths found)`);
    }
  }

  /**
   * Scan other services including publication API
   */
  async scanOtherServices() {
    console.log('📋 Scanning other services...');
    
    // Scan DAK Publication API
    await this.scanDAKPublicationAPI();
    
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
  extractInputParameters(methodData, openApiSpec = null) {
    const parameters = [];
    
    if (methodData.parameters) {
      for (const param of methodData.parameters) {
        let paramName, paramType, required;
        
        if (param.$ref && openApiSpec) {
          // Handle $ref parameters - resolve from OpenAPI spec
          const refPath = param.$ref.replace('#/', '').split('/');
          let refData = openApiSpec;
          for (const part of refPath) {
            refData = refData[part];
            if (!refData) break;
          }
          
          if (refData && refData.name) {
            paramName = refData.name;
            paramType = refData.schema?.type || 'string';
            required = refData.required !== false ? '' : ' (optional)';
          } else {
            // Fallback to ref name
            paramName = refPath[refPath.length - 1] || 'ref-parameter';
            paramType = 'string';
            required = ' (optional)';
          }
        } else {
          paramName = param.name || 'unnamed';
          paramType = param.schema?.type || 'string';
          required = param.required !== false ? '' : ' (optional)';
        }
        
        parameters.push(`\`${paramName}\`: ${paramType}${required}`);
      }
    }

    if (methodData.requestBody && methodData.requestBody.content) {
      const content = methodData.requestBody.content;
      if (content['application/json'] && content['application/json'].schema) {
        const schema = content['application/json'].schema;
        if (schema.properties) {
          for (const [propName, propData] of Object.entries(schema.properties)) {
            const required = schema.required && schema.required.includes(propName) ? '' : ' (optional)';
            const propType = propData.type || (propData.items ? 'array' : 'object');
            parameters.push(`\`${propName}\`: ${propType}${required}`);
          }
        }
      }
    }

    return parameters.length > 0 ? parameters : ['None'];
  }

  /**
   * Extract input schemas from OpenAPI method
   */
  extractInputSchemas(methodData, serviceType = 'dak-faq-mcp') {
    // This would normally extract actual schema references
    // For now, return placeholder based on service type
    return [this.createSchemaLink('input schema', `services/${serviceType}/schemas/input.schema.json`)];
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
  extractOutputSchema(methodData, serviceType = 'dak-faq-mcp') {
    return this.createSchemaLink('output schema', `services/${serviceType}/schemas/output.schema.json`);
  }

  /**
   * Get MCP interface status
   */
  getMCPInterface(operationId, mcpManifest) {
    if (!mcpManifest || !mcpManifest.tools) return 'No';
    
    const mcpTools = mcpManifest.tools.map(t => t.name);
    
    // Map operation IDs to MCP tool names for FAQ services
    const faqMapping = {
      'executeFAQQuestions': 'execute_faq_question',
      'getFAQCatalog': 'list_faq_questions',
      'getQuestionSchema': 'get_question_schema'
    };

    // Map operation IDs to MCP tool names for Publication services
    const publicationMapping = {
      'generatePublication': 'generate_publication',
      'listTemplates': 'list_publication_templates',
      'getTemplate': 'get_publication_template',
      'getHealth': 'get_service_integration_status',
      'resolveVariables': 'validate_publication_config',
      'batchExecuteFAQ': 'get_service_integration_status'
    };

    // Try FAQ mapping first, then publication mapping
    let mcpToolName = faqMapping[operationId] || publicationMapping[operationId];
    
    if (mcpToolName && mcpTools.includes(mcpToolName)) {
      return 'Yes';
    }
    
    // Check if any MCP tools exist for this service
    return mcpTools.length > 0 ? 'Partial' : 'No';
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