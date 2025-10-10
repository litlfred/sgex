/**
 * MCP (Model Context Protocol) Server Implementation for DAK FAQ
 * Provides standard MCP protocol support alongside existing REST API
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  Tool,
  CallToolRequest,
  CallToolResult 
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { FAQExecutionEngineLocal } from "./server/util/FAQExecutionEngineLocal.js";
import { CanonicalSchemaService } from "./server/util/CanonicalSchemaService.js";
import { FAQSchemaService } from "./server/util/FAQSchemaService.js";

// Zod schemas for tool validation
const ExecuteFAQToolSchema = z.object({
  questionId: z.string().describe("ID of the FAQ question to execute"),
  parameters: z.record(z.any()).optional().describe("Parameters for the question execution"),
  context: z.object({
    repositoryPath: z.string().optional().describe("Path to the DAK repository")
  }).optional().describe("Execution context")
});

const ListQuestionsSchema = z.object({
  level: z.enum(["dak", "component", "asset"]).optional().describe("Filter questions by hierarchy level"),
  componentType: z.string().optional().describe("Filter questions by component type"),
  tags: z.array(z.string()).optional().describe("Filter questions by tags")
});

const AuditCanonicalsSchema = z.object({
  includeDetails: z.boolean().optional().describe("Include detailed canonical reference information")
});

const GetCanonicalSchema = z.object({
  canonicalUrl: z.string().describe("WHO canonical URL to fetch (e.g., ValueSet or Logical Model)")
});

/**
 * DAK FAQ MCP Server
 * 
 * Implements the Model Context Protocol for WHO SMART Guidelines DAK FAQ functionality.
 * Provides standardized tools for executing FAQ questions and listing available questions.
 */
export class DAKFAQMCPServer {
  private server: Server;
  private faqEngine: FAQExecutionEngineLocal;
  private canonicalService: CanonicalSchemaService;
  private schemaService: FAQSchemaService;

  constructor() {
    // Initialize MCP server with metadata
    this.server = new Server(
      {
        name: "dak-faq-mcp-server",
        version: "1.0.0",
        description: "WHO SMART Guidelines DAK FAQ MCP Server - Provides FAQ functionality for Digital Adaptation Kits"
      },
      {
        capabilities: {
          tools: {
            listChanged: true  // Support tool list updates
          },
          resources: {
            subscribe: false,   // No resource subscriptions yet
            listChanged: false
          },
          prompts: {
            listChanged: false  // No prompts yet
          }
        }
      }
    );

    // Initialize services
    this.faqEngine = new FAQExecutionEngineLocal();
    this.canonicalService = CanonicalSchemaService.getInstance();
    this.schemaService = FAQSchemaService.getInstance();
    
    this.setupMCPHandlers();
  }

  /**
   * Set up MCP protocol message handlers
   */
  private setupMCPHandlers(): void {
    // Handle tool listing requests
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      await this.ensureInitialized();
      
      const questions = this.faqEngine.getCatalog();
      
      const tools: Tool[] = [
        {
          name: "execute_faq_question",
          description: "Execute a specific DAK FAQ question and return structured results with narrative explanation",
          inputSchema: {
            type: "object",
            properties: {
              questionId: {
                type: "string",
                description: "ID of the FAQ question to execute",
                enum: questions.map(q => q.id)
              },
              parameters: {
                type: "object",
                description: "Parameters specific to the question (varies by question type)",
                additionalProperties: true
              },
              context: {
                type: "object",
                properties: {
                  repositoryPath: {
                    type: "string",
                    description: "File system path to the DAK repository"
                  }
                },
                additionalProperties: true,
                description: "Execution context and environment settings"
              }
            },
            required: ["questionId"],
            additionalProperties: false
          }
        },
        {
          name: "list_faq_questions",
          description: "List all available DAK FAQ questions with metadata and filtering options",
          inputSchema: {
            type: "object",
            properties: {
              level: {
                type: "string",
                enum: ["dak", "component", "asset"],
                description: "Filter questions by hierarchy level (dak=project-wide, component=component-specific, asset=file-specific)"
              },
              componentType: {
                type: "string",
                description: "Filter questions by DAK component type (e.g., 'business-processes', 'decision-support')"
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Filter questions by tags (e.g., 'metadata', 'validation', 'structure')"
              }
            },
            additionalProperties: false
          }
        },
        {
          name: "get_question_schema",
          description: "Get the JSON schema for a specific FAQ question's parameters",
          inputSchema: {
            type: "object",
            properties: {
              questionId: {
                type: "string",
                description: "ID of the FAQ question",
                enum: questions.map(q => q.id)
              }
            },
            required: ["questionId"],
            additionalProperties: false
          }
        },
        {
          name: "audit_canonical_references",
          description: "Audit all FAQ question schemas for WHO SMART Guidelines canonical references (ValueSets, Logical Models)",
          inputSchema: {
            type: "object",
            properties: {
              includeDetails: {
                type: "boolean",
                description: "Include detailed information about each canonical reference",
                default: false
              }
            },
            additionalProperties: false
          }
        },
        {
          name: "get_canonical_resource",
          description: "Fetch a WHO SMART Guidelines canonical resource (ValueSet or Logical Model) by URL",
          inputSchema: {
            type: "object",
            properties: {
              canonicalUrl: {
                type: "string",
                description: "WHO canonical URL (e.g., https://worldhealthorganization.github.io/smart-base/ValueSet-CDHIv1.schema.json)"
              }
            },
            required: ["canonicalUrl"],
            additionalProperties: false
          }
        },
        {
          name: "list_cached_canonicals",
          description: "List all WHO canonical resources currently cached locally",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false
          }
        }
      ];

      return { tools };
    });

    // Handle tool execution requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "execute_faq_question":
            return await this.executeQuestion(args);
          
          case "list_faq_questions":
            return await this.listQuestions(args);
          
          case "get_question_schema":
            return await this.getQuestionSchema(args);
          
          case "audit_canonical_references":
            return await this.auditCanonicalReferences(args);
          
          case "get_canonical_resource":
            return await this.getCanonicalResource(args);
          
          case "list_cached_canonicals":
            return await this.listCachedCanonicals(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        // Return MCP-compliant error response
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  /**
   * Execute a specific FAQ question
   */
  private async executeQuestion(args: any): Promise<CallToolResult> {
    const parsed = ExecuteFAQToolSchema.parse(args);
    
    await this.ensureInitialized();
    
    try {
      // Create ExecuteRequest compatible with the engine
      const request = {
        questionId: parsed.questionId,
        parameters: parsed.parameters || {},
        assetFiles: []
      };

      const result = await this.faqEngine.executeSingle(
        request,
        parsed.context || {}
      );

      // Format response with structured data and narrative
      const content = [
        {
          type: "text" as const,
          text: `# FAQ Question: ${parsed.questionId}\n\n` +
                `## Structured Results\n\n` +
                `\`\`\`json\n${JSON.stringify(result.result?.structured, null, 2)}\n\`\`\`\n\n` +
                `## Narrative Explanation\n\n${result.result?.narrative || 'No narrative available'}\n\n` +
                (result.result?.warnings && result.result.warnings.length > 0 ? `## Warnings\n${result.result.warnings.map((w: string) => `- ${w}`).join('\n')}\n\n` : '') +
                (result.result?.errors && result.result.errors.length > 0 ? `## Errors\n${result.result.errors.map((e: string) => `- ${e}`).join('\n')}\n` : '')
        }
      ];

      return {
        content,
        isError: !result.success
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const, 
            text: `Failed to execute question "${parsed.questionId}": ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * List available FAQ questions with optional filtering
   */
  private async listQuestions(args: any): Promise<CallToolResult> {
    const parsed = ListQuestionsSchema.parse(args);
    
    await this.ensureInitialized();
    
    const questions = this.faqEngine.getCatalog({
      level: parsed.level,
      componentType: parsed.componentType,
      tags: parsed.tags
    });

    const content = [
      {
        type: "text" as const,
        text: `# Available DAK FAQ Questions\n\n` +
              `Found ${questions.length} questions matching the criteria.\n\n` +
              questions.map(q => 
                `## ${q.title} (\`${q.id}\`)\n\n` +
                `**Description:** ${q.description}\n\n` +
                `**Level:** ${q.level}\n` +
                `**Tags:** ${q.tags.join(', ')}\n` +
                (q.componentType ? `**Component Type:** ${q.componentType}\n` : '') +
                (q.assetType ? `**Asset Type:** ${q.assetType}\n` : '') +
                `**Parameters:** ${q.parameters.length} parameter(s)\n\n` +
                `---\n`
              ).join('\n')
      }
    ];

    return { content };
  }

  /**
   * Get JSON schema for a specific question's parameters
   */
  private async getQuestionSchema(args: any): Promise<CallToolResult> {
    const { questionId } = args;
    
    await this.ensureInitialized();
    
    const question = this.faqEngine.getCatalog().find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    const content = [
      {
        type: "text" as const,
        text: `# Parameter Schema for ${question.title}\n\n` +
              `\`\`\`json\n${JSON.stringify(question.schema || {}, null, 2)}\n\`\`\`\n\n` +
              `## Parameter Details\n\n` +
              question.parameters.map(p => 
                `- **${p.name}** (${p.type}): ${p.description}\n` +
                `  - Required: ${p.required ? 'Yes' : 'No'}\n` +
                (p.defaultValue !== undefined ? `  - Default: \`${JSON.stringify(p.defaultValue)}\`\n` : '')
              ).join('\n')
      }
    ];

    return { content };
  }

  /**
   * Audit canonical references in question schemas
   */
  private async auditCanonicalReferences(args: any): Promise<CallToolResult> {
    const parsed = AuditCanonicalsSchema.parse(args);
    
    await this.ensureInitialized();
    await this.schemaService.initialize();
    
    const audit = await this.schemaService.auditCanonicalReferences();
    
    let text = `# WHO Canonical References Audit\n\n`;
    text += `## Summary\n\n`;
    text += `- **Total Questions:** ${audit.questionsWithCanonicals.length + audit.questionsWithoutCanonicals.length}\n`;
    text += `- **Questions with Canonicals:** ${audit.questionsWithCanonicals.length}\n`;
    text += `- **Questions without Canonicals:** ${audit.questionsWithoutCanonicals.length}\n`;
    text += `- **Total Canonical URLs:** ${audit.totalCanonicals}\n\n`;
    
    if (audit.questionsWithCanonicals.length > 0) {
      text += `## ✅ Questions with Canonical References\n\n`;
      for (const questionId of audit.questionsWithCanonicals) {
        const canonicals = audit.canonicalsByQuestion[questionId];
        text += `### ${questionId}\n\n`;
        for (const url of canonicals) {
          text += `- ${url}\n`;
        }
        text += `\n`;
      }
    }
    
    if (parsed.includeDetails && audit.questionsWithoutCanonicals.length > 0) {
      text += `## ⚠️ Questions without Canonical References\n\n`;
      for (const questionId of audit.questionsWithoutCanonicals) {
        text += `- ${questionId}\n`;
      }
    }
    
    const content = [{ type: "text" as const, text }];
    return { content };
  }

  /**
   * Get a canonical resource by URL
   */
  private async getCanonicalResource(args: any): Promise<CallToolResult> {
    const parsed = GetCanonicalSchema.parse(args);
    
    await this.canonicalService.initialize();
    
    const resource = await this.canonicalService.fetchCanonicalResource(parsed.canonicalUrl);
    
    if (!resource) {
      throw new Error(`Could not fetch canonical resource: ${parsed.canonicalUrl}`);
    }
    
    let text = `# Canonical Resource\n\n`;
    text += `**URL:** ${resource.url}\n`;
    text += `**Type:** ${resource.type}\n`;
    if (resource.version) {
      text += `**Version:** ${resource.version}\n`;
    }
    if (resource.lastFetched) {
      text += `**Last Fetched:** ${new Date(resource.lastFetched).toISOString()}\n`;
    }
    text += `\n## Schema\n\n`;
    text += `\`\`\`json\n${JSON.stringify(resource.schema, null, 2)}\n\`\`\`\n`;
    
    if (resource.type === 'ValueSet') {
      const enumValues = this.canonicalService.extractValueSetEnum(resource.schema);
      if (enumValues) {
        text += `\n## Allowed Values\n\n`;
        text += enumValues.map(v => `- \`${v}\``).join('\n');
        text += `\n`;
      }
    }
    
    const content = [{ type: "text" as const, text }];
    return { content };
  }

  /**
   * List cached canonical resources
   */
  private async listCachedCanonicals(args: any): Promise<CallToolResult> {
    await this.canonicalService.initialize();
    
    const cached = this.canonicalService.getCachedResources();
    
    let text = `# Cached WHO Canonical Resources\n\n`;
    text += `Found ${cached.length} cached resource(s).\n\n`;
    
    if (cached.length === 0) {
      text += `No resources cached yet. Use \`get_canonical_resource\` to fetch and cache resources.\n`;
    } else {
      for (const resource of cached) {
        text += `## ${resource.type}\n\n`;
        text += `- **URL:** ${resource.url}\n`;
        if (resource.lastFetched) {
          text += `- **Last Fetched:** ${new Date(resource.lastFetched).toISOString()}\n`;
        }
        text += `\n`;
      }
    }
    
    const content = [{ type: "text" as const, text }];
    return { content };
  }

  /**
   * Ensure the FAQ engine is initialized
   */
  private async ensureInitialized(): Promise<void> {
    try {
      await this.faqEngine.initialize();
    } catch (error: any) {
      throw new Error(`Failed to initialize FAQ engine: ${error.message}`);
    }
  }

  /**
   * Start the MCP server with stdio transport
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('DAK FAQ MCP Server started (stdio transport)');
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    await this.server.close();
  }
}

// CLI entry point for stdio MCP server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DAKFAQMCPServer();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error('Received SIGINT, shutting down MCP server...');
    await server.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.error('Received SIGTERM, shutting down MCP server...');
    await server.stop();
    process.exit(0);
  });
  
  // Start the server
  server.start().catch((error: any) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

export default DAKFAQMCPServer;