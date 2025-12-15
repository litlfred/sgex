# MCP Migration Implementation Plan

## Executive Summary

This document outlines a specific implementation plan for migrating the current DAK FAQ "MCP" service from a custom REST API to a proper Model Context Protocol implementation using the official `@modelcontextprotocol/sdk@1.17.4`.

## Migration Strategy: Hybrid Approach

### Phase 1: Add Official MCP Support (Recommended First Step)

#### 1.1 Update Dependencies

```bash
# In services/dak-faq-mcp/
npm install @modelcontextprotocol/sdk@^1.17.4
npm install zod@^3.23.8  # For schema validation
```

#### 1.2 Create MCP Server Implementation

**New file: `services/dak-faq-mcp/src/mcp-server.ts`**

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Import existing FAQ logic
import { FAQExecutionEngineLocal } from "./engine/local.js";
import { LocalStorageImpl } from "./storage/local.js";

// Tool schema definitions
const ExecuteFAQToolSchema = z.object({
  questionId: z.string(),
  parameters: z.record(z.any()).optional(),
  context: z.object({
    repositoryPath: z.string().optional()
  }).optional()
});

class DAKFAQMCPServer {
  private server: Server;
  private faqEngine: FAQExecutionEngineLocal;

  constructor() {
    this.server = new Server(
      {
        name: "dak-faq-mcp-server",
        version: "1.0.0",
        description: "WHO SMART Guidelines DAK FAQ MCP Server"
      },
      {
        capabilities: {
          tools: {
            listChanged: true
          },
          resources: {
            subscribe: false,
            listChanged: false
          }
        }
      }
    );

    this.faqEngine = new FAQExecutionEngineLocal(new LocalStorageImpl());
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const questions = await this.faqEngine.getAvailableQuestions();
      
      return {
        tools: [
          {
            name: "execute_faq_question",
            description: "Execute a DAK FAQ question and return structured results",
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
                  description: "Parameters for the question execution"
                },
                context: {
                  type: "object",
                  properties: {
                    repositoryPath: {
                      type: "string",
                      description: "Path to the DAK repository"
                    }
                  }
                }
              },
              required: ["questionId"]
            }
          },
          {
            name: "list_faq_questions",
            description: "List all available DAK FAQ questions with metadata",
            inputSchema: {
              type: "object",
              properties: {
                level: {
                  type: "string",
                  enum: ["dak", "component", "asset"],
                  description: "Filter questions by hierarchy level"
                },
                componentType: {
                  type: "string",
                  description: "Filter questions by component type"
                }
              }
            }
          }
        ]
      };
    });

    // Execute tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "execute_faq_question":
          return this.executeQuestion(args);
        
        case "list_faq_questions":
          return this.listQuestions(args);
        
        default:
          throw new Error(`Tool ${name} not found`);
      }
    });
  }

  private async executeQuestion(args: any) {
    const parsed = ExecuteFAQToolSchema.parse(args);
    
    try {
      const result = await this.faqEngine.executeQuestion(
        parsed.questionId,
        parsed.parameters || {},
        parsed.context
      );

      return {
        content: [
          {
            type: "text",
            text: `# ${parsed.questionId} Results\n\n## Structured Data\n\`\`\`json\n${JSON.stringify(result.structured, null, 2)}\n\`\`\`\n\n## Narrative\n${result.narrative}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing question ${parsed.questionId}: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  private async listQuestions(args: any) {
    const questions = await this.faqEngine.getAvailableQuestions(args);
    
    return {
      content: [
        {
          type: "text",
          text: `# Available DAK FAQ Questions\n\n${questions.map(q => 
            `## ${q.title} (${q.id})\n${q.description}\n- Level: ${q.level}\n- Tags: ${q.tags.join(', ')}\n`
          ).join('\n')}`
        }
      ]
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DAKFAQMCPServer();
  server.start().catch(console.error);
}

export { DAKFAQMCPServer };
```

#### 1.3 Update Package Scripts

**Update `services/dak-faq-mcp/package.json`:**

```json
{
  "scripts": {
    "build": "tsc",
    "start": "npm run build && node dist/index.js",
    "start-mcp": "npm run build && node dist/mcp-server.js",
    "dev": "npm run build && node dist/index.js --dev",
    "dev-mcp": "npm run build && node dist/mcp-server.js",
    "watch": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.17.4",
    "zod": "^3.23.8",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "js-yaml": "^4.1.0",
    "@xmldom/xmldom": "^0.8.10",
    "glob": "^10.3.10"
  }
}
```

#### 1.4 Create MCP Client Integration

**New file: `src/services/mcpClient.js`:**

```javascript
import { spawn } from 'child_process';

export class DAKFAQMCPClient {
  constructor() {
    this.process = null;
    this.messageId = 0;
    this.pendingRequests = new Map();
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.process = spawn('node', ['../services/dak-faq-mcp/dist/mcp-server.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      this.process.stdout.on('data', (data) => {
        this.handleMessage(data.toString());
      });

      this.process.on('error', reject);
      
      // Initialize MCP session
      this.sendMessage({
        jsonrpc: '2.0',
        id: this.messageId++,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true }
          },
          clientInfo: {
            name: 'sgex-workbench',
            version: '1.0.0'
          }
        }
      }).then(resolve).catch(reject);
    });
  }

  async executeQuestion(questionId, parameters = {}, context = {}) {
    return this.sendMessage({
      jsonrpc: '2.0',
      id: this.messageId++,
      method: 'tools/call',
      params: {
        name: 'execute_faq_question',
        arguments: {
          questionId,
          parameters,
          context
        }
      }
    });
  }

  async listQuestions(filters = {}) {
    return this.sendMessage({
      jsonrpc: '2.0',
      id: this.messageId++,
      method: 'tools/call',
      params: {
        name: 'list_faq_questions',
        arguments: filters
      }
    });
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        reject(new Error('MCP server not started'));
        return;
      }

      this.pendingRequests.set(message.id, { resolve, reject });
      this.process.stdin.write(JSON.stringify(message) + '\n');
    });
  }

  handleMessage(data) {
    try {
      const lines = data.trim().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          const message = JSON.parse(line);
          
          if (message.id && this.pendingRequests.has(message.id)) {
            const { resolve, reject } = this.pendingRequests.get(message.id);
            this.pendingRequests.delete(message.id);
            
            if (message.error) {
              reject(new Error(message.error.message));
            } else {
              resolve(message.result);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error parsing MCP message:', error);
    }
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}
```

### Phase 2: Update Main Project Integration

#### 2.1 Update Build Scripts

**Add to main `package.json`:**

```json
{
  "scripts": {
    "build-mcp": "cd services/dak-faq-mcp && npm install && npm run build",
    "run-mcp": "cd services/dak-faq-mcp && npm start",
    "run-mcp-server": "cd services/dak-faq-mcp && npm run start-mcp",
    "generate-dak-faq-docs": "npm run build-mcp && node scripts/generate-dak-faq-docs.js"
  }
}
```

#### 2.2 Update Documentation Generator

**Update `scripts/generate-dak-faq-docs.js`:**

```javascript
// Add MCP server introspection
async function startMCPServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['services/dak-faq-mcp/dist/mcp-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Implement MCP handshake and tool listing
    // Return MCP tool definitions for documentation
  });
}
```

### Phase 3: Testing and Validation

#### 3.1 Create MCP Integration Tests

**New file: `services/dak-faq-mcp/test/mcp-integration.test.ts`:**

```typescript
import { DAKFAQMCPServer } from '../src/mcp-server.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

describe('MCP Server Integration', () => {
  test('should list available tools', async () => {
    // Test MCP tool listing
  });

  test('should execute FAQ questions via MCP', async () => {
    // Test MCP tool execution
  });
});
```

## Migration Benefits

### Immediate Benefits
1. **Standards Compliance**: Real MCP protocol implementation
2. **CLI Integration**: stdio transport for command-line usage
3. **Better Tool Discovery**: Standard MCP tool listing
4. **Error Handling**: Proper MCP error responses

### Long-term Benefits
1. **Ecosystem Integration**: Works with MCP-aware clients
2. **Transport Flexibility**: Easy to add HTTP/WebSocket transports
3. **Tool Reusability**: Standard tool definitions
4. **Future Proofing**: Aligned with MCP evolution

## Rollout Plan

### Week 1: Foundation
- Install MCP SDK
- Implement basic MCP server
- Create stdio transport

### Week 2: Integration
- Add MCP client to main app
- Update documentation generator
- Maintain REST API compatibility

### Week 3: Testing
- Comprehensive MCP testing
- Performance validation
- Documentation updates

### Week 4: Deployment
- Deploy hybrid system
- Monitor performance
- Gather feedback

## Compatibility Matrix

| Feature | REST API | MCP Protocol | Status |
|---------|----------|--------------|--------|
| Question Execution | ✅ | ✅ | Parallel |
| Batch Processing | ✅ | ✅ | MCP uses multiple calls |
| Question Catalog | ✅ | ✅ | MCP tool listing |
| Schema Validation | ✅ | ✅ | Zod schemas |
| CLI Integration | ❌ | ✅ | New capability |
| Error Handling | Custom | Standard | Improved |

This migration plan provides a concrete path to adopt proper MCP standards while maintaining backward compatibility and introducing new capabilities.