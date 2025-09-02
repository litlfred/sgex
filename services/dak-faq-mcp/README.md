# DAK FAQ MCP Server (TypeScript)

A TypeScript-based hybrid server providing WHO SMART Guidelines Digital Adaptation Kit (DAK) FAQ functionality through both **Model Context Protocol (MCP)** and **REST API** interfaces.

## Dual Protocol Architecture

This service implements **both MCP and REST protocols** to maximize integration flexibility:

- **🔌 MCP Protocol** (stdio transport) - For AI assistants, CLI tools, and MCP-compatible applications
- **🌐 REST API** (HTTP) - For web applications, traditional integrations, and browser-based tools

## Features

- **🚀 Official MCP SDK Integration**: Standards-compliant MCP server using `@modelcontextprotocol/sdk@^1.17.4`
- **📋 Comprehensive Documentation**: Both OpenAPI specs and MCP manifests
- **🔧 Full TypeScript Implementation**: Type-safe API with comprehensive interfaces
- **🛡️ Local Security**: Localhost-only binding for development safety
- **📚 FAQ Question Registry**: Extensible system for registering custom questions
- **⚡ Batch Processing**: Execute multiple FAQ questions in a single request
- **🔄 Protocol Interoperability**: Same functionality available via both MCP and REST

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Build
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Start MCP Server (Recommended for AI/CLI integration)
```bash
# Start MCP server with stdio transport
npm run start-mcp

# Or with development mode
npm run dev-mcp
```

### Start REST API Server (For web/HTTP integration)  
```bash
# Start REST API server
npm start

# Or with development mode
npm run dev
```

## Protocol Comparison

| Feature | MCP Protocol | REST API |
|---------|-------------|----------|
| **Transport** | stdio (JSON-RPC 2.0) | HTTP |
| **Integration** | AI assistants, CLI tools | Web apps, browsers |
| **Documentation** | `mcp-manifest.json` | `docs/openapi.yaml` |
| **Discoverability** | Tool introspection | OpenAPI schema |
| **Examples** | MCP client calls | cURL commands |

## MCP Protocol Usage

### Available Tools
- **`execute_faq_question`** - Execute specific DAK FAQ questions
- **`list_faq_questions`** - List available questions with filtering
- **`get_question_schema`** - Get parameter schemas for questions

### Example MCP Client Usage
```json
{
  "method": "tools/call",
  "params": {
    "name": "execute_faq_question",
    "arguments": {
      "questionId": "dak-name",
      "parameters": {
        "repository": "who/smart-immunizations",
        "locale": "en"
      }
    }
  }
}
```

### Integration with MCP Clients
```bash
# Using the MCP server in an MCP-compatible client
node dist/mcp-server.js
```

## REST API Endpoints

### Health Check
```bash
curl http://127.0.0.1:3001/health
```

### Question Catalog
```bash
curl "http://127.0.0.1:3001/faq/questions/catalog?level=dak&tags=metadata"
```

### Execute Questions (Batch)
```bash
curl -X POST http://127.0.0.1:3001/faq/questions/execute \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "questionId": "dak-name",
        "parameters": {
          "repository": "who/smart-immunizations",
          "locale": "en_US"
        }
      }
    ],
    "context": {
      "repositoryPath": "/path/to/dak"
    }
  }'
```

### Get Question Schema
```bash
curl http://127.0.0.1:3001/faq/schema/dak-name
```

## Documentation

### MCP Protocol Documentation
- **📋 MCP Manifest**: [`mcp-manifest.json`](./mcp-manifest.json) - Complete MCP server specification
- **🔧 Tool Schemas**: Detailed JSON schemas for all MCP tools
- **📖 Usage Examples**: MCP client integration patterns

### REST API Documentation  
- **📊 OpenAPI Spec**: [`docs/openapi.yaml`](./docs/openapi.yaml) - Complete REST API specification
- **🌐 Interactive Docs**: Import OpenAPI spec into Swagger UI, Insomnia, or Postman
- **📝 HTTP Examples**: cURL commands and request/response examples

### Shared Schemas
Both protocols use the same underlying JSON schemas for:
- Question definitions (`questions/*/definition.json`)
- Parameter validation and type safety
- Response formats and error handling

## TypeScript Architecture

### Core Types
- `FAQQuestion`: Question metadata interface
- `ExecuteRequest`: Single question execution request  
- `ExecuteResponse`: Question execution result
- `BatchExecuteResponse`: Batch execution response
- `ValidationResult`: Request validation result

### Key Classes
- **`DAKFAQMCPServer`**: MCP protocol server implementation
- **`FAQExecutionEngineLocal`**: Main execution engine (shared between protocols)
- **`LocalStorageImpl`**: File system storage interface
- **Express route handlers**: REST API endpoints with full type safety

### Protocol Implementations

#### MCP Server (`mcp-server.ts`)
```typescript
import { DAKFAQMCPServer } from './mcp-server.js';

// Start MCP server with stdio transport
const server = new DAKFAQMCPServer();
await server.start();
```

#### REST Server (`index.ts`)  
```typescript
import express from 'express';
import { executeRoute, catalogRoute, schemaRoute } from './server/routes/index.js';

const app = express();
app.use('/faq/questions', executeRoute);
// ... additional routes
```

### Type-Safe Features
- Comprehensive interfaces for all API requests/responses
- Generic type parameters for Express routes  
- Strict null checks and error handling
- Auto-completion support in IDEs
- Shared validation logic between MCP and REST

## Development

### Build System
```bash
npm run build       # Compile TypeScript to dist/
npm run clean       # Remove build artifacts
npm run watch       # Watch mode compilation
npm run start-mcp   # Start MCP server
npm run start       # Start REST API server
```

### Adding New Questions
1. **Define question metadata** in `questions/{level}/{id}/definition.json`
2. **Implement execution logic** with proper TypeScript typing
3. **Register in `FAQExecutionEngineLocal`** (shared by both protocols)
4. **Test via both MCP and REST** endpoints

### Protocol-Specific Development

#### MCP Development
- Tools are auto-discovered from question definitions
- JSON schemas define tool input/output contracts
- Use `npm run dev-mcp` for development with hot reload

#### REST Development  
- Routes use shared execution engine
- OpenAPI spec auto-generates from TypeScript types
- Use `npm run dev` for development with hot reload

### Testing Both Protocols
```bash
# Test MCP protocol
echo '{"method":"tools/call","params":{"name":"list_faq_questions","arguments":{}}}' | node dist/mcp-server.js

# Test REST API
curl http://127.0.0.1:3001/faq/questions/catalog
```

### Security
- **Local-only binding** (127.0.0.1) for both protocols
- **Path traversal protection** for file operations
- **CORS restricted** to localhost:3000 for REST API
- **Request validation** with type checking and schema validation
- **Stdio transport security** for MCP (no network exposure)

## Configuration

### Environment Variables
- `PORT`: REST API server port (default: 3001)
- `NODE_ENV`: Environment mode

### TypeScript Configuration
See `tsconfig.json` for compiler options:
- Target: ES2022
- Module: ESNext  
- Strict type checking enabled
- Source maps and declarations generated

## Integration Examples

### Frontend Integration (REST)
```typescript
// React/Vue/Angular integration
const response = await fetch('http://127.0.0.1:3001/faq/questions/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requests: [{ questionId: 'dak-name', parameters: { repository: 'who/smart-immunizations' } }]
  })
});

const result: BatchExecuteResponse = await response.json();
```

### AI Assistant Integration (MCP)
```typescript
// MCP client integration example
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client(
  { name: "dak-faq-client", version: "1.0.0" },
  { capabilities: {} }
);

// Execute FAQ question via MCP
const result = await client.callTool({
  name: "execute_faq_question", 
  arguments: {
    questionId: "dak-name",
    parameters: { repository: "who/smart-immunizations" }
  }
});
```

### CLI Integration (MCP)
```bash
# Direct stdio integration
echo '{"method":"tools/call","params":{"name":"execute_faq_question","arguments":{"questionId":"dak-name","parameters":{"repository":"who/smart-immunizations"}}}}' | node dist/mcp-server.js
```

## Migration Between Protocols

### From REST to MCP
- **Same functionality**: All REST endpoints have MCP tool equivalents
- **Better discoverability**: MCP tools are self-documenting
- **Enhanced integration**: Better for AI assistants and CLI tools

### From MCP to REST  
- **Web compatibility**: HTTP protocol works in browsers
- **Traditional integration**: Fits existing HTTP-based workflows
- **Familiar tooling**: Use curl, Postman, or standard HTTP libraries

## WHO SMART Guidelines Compliance

- **Follows WHO DAK component specifications**
- **Supports standard question taxonomy levels** (dak, component, asset)
- **Compatible with FHIR R4, BPMN 2.0, DMN 1.3** standards
- **Implements WHO terminology binding patterns**
- **Maintains consistency** across both protocol implementations

---

## 🔗 Quick Links

- **📋 MCP Manifest**: [`mcp-manifest.json`](./mcp-manifest.json)
- **📊 OpenAPI Spec**: [`docs/openapi.yaml`](./docs/openapi.yaml)  
- **📖 Documentation Strategy**: [`docs/mcp-documentation-plan.md`](./docs/mcp-documentation-plan.md)
- **🏥 WHO SMART Guidelines**: https://smart.who.int/
- **🔌 MCP Specification**: https://modelcontextprotocol.io/