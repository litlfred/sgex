# MCP + OpenAPI Integration Guide

This guide demonstrates how the DAK FAQ service implements both Model Context Protocol (MCP) and REST API interfaces with comprehensive documentation.

## Documentation Architecture

```
📚 Documentation Strategy
├── 🔌 MCP Protocol
│   ├── mcp-manifest.json          # MCP server specification
│   ├── Tool schemas (JSON Schema) # Input/output contracts
│   └── Usage examples             # MCP client integration
├── 🌐 REST API  
│   ├── docs/openapi.yaml          # OpenAPI 3.0 specification
│   ├── HTTP endpoints             # Traditional REST routes
│   └── cURL examples              # HTTP client integration
└── 🔄 Shared Components
    ├── JSON schemas               # Common data structures
    ├── TypeScript types           # Type safety across protocols
    └── Validation logic           # Consistent behavior
```

## 1. MCP Documentation Features

### Server Manifest (`mcp-manifest.json`)
```json
{
  "name": "dak-faq-mcp-server",
  "version": "1.0.0",
  "capabilities": {
    "tools": { "listChanged": true }
  },
  "transport": {
    "stdio": {
      "command": "node",
      "args": ["dist/mcp-server.js"]
    }
  },
  "tools": [
    {
      "name": "execute_faq_question",
      "description": "Execute a specific DAK FAQ question",
      "inputSchema": { /* JSON Schema */ },
      "outputSchema": { /* JSON Schema */ }
    }
  ]
}
```

### Benefits of MCP Documentation:
- **Self-Describing**: Tools include their own schemas
- **Runtime Introspection**: Clients can discover capabilities
- **Standards Compliance**: Follows official MCP specification
- **AI Integration**: Optimized for AI assistant consumption

## 2. OpenAPI Documentation Features

### REST API Specification (`docs/openapi.yaml`)
```yaml
openapi: 3.0.3
info:
  title: DAK FAQ REST API
  description: |
    REST API for WHO SMART Guidelines DAK FAQ functionality.
    **Related MCP Server**: See `mcp-manifest.json` for MCP protocol documentation.
paths:
  /faq/questions/execute:
    post:
      summary: Execute FAQ Questions (Batch)
      description: |
        **MCP Equivalent**: `execute_faq_question` tool (single execution)
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BatchExecuteRequest'
```

### Benefits of OpenAPI Documentation:
- **Web Integration**: HTTP protocol familiarity
- **Tooling Ecosystem**: Swagger UI, Postman, Insomnia support
- **Code Generation**: Client SDK generation
- **Traditional Workflows**: Fits existing REST patterns

## 3. Integration Patterns

### Pattern 1: Protocol-Specific Documentation

**Use Case**: Different audiences for different protocols
- **MCP Docs**: AI developers, CLI tool builders
- **REST Docs**: Web developers, traditional integrations

**Implementation**:
```typescript
// MCP tool definition
{
  name: "execute_faq_question",
  inputSchema: {
    type: "object",
    properties: {
      questionId: { type: "string" },
      parameters: { type: "object" }
    }
  }
}
```

```yaml
# OpenAPI endpoint definition
/faq/questions/execute:
  post:
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BatchExecuteRequest'
```

### Pattern 2: Cross-Referenced Documentation

**Use Case**: Users might switch between protocols
- **MCP Manifest**: References OpenAPI spec in `externalDocs`
- **OpenAPI Spec**: References MCP tools in endpoint descriptions

**Implementation**:
```json
// In mcp-manifest.json
{
  "externalDocs": {
    "description": "REST API Documentation", 
    "url": "./docs/openapi.yaml"
  }
}
```

```yaml
# In openapi.yaml
paths:
  /faq/questions/execute:
    post:
      description: |
        **MCP Equivalent**: `execute_faq_question` tool
externalDocs:
  description: MCP Protocol Documentation
  url: ./mcp-manifest.json
```

### Pattern 3: Shared Schema Definitions

**Use Case**: Maintain consistency between protocols

**Implementation**:
```typescript
// Shared TypeScript types
interface ExecuteRequest {
  questionId: string;
  parameters?: Record<string, any>;
}

// Generate MCP schema
const mcpSchema = generateMCPSchema<ExecuteRequest>();

// Generate OpenAPI schema  
const openApiSchema = generateOpenAPISchema<ExecuteRequest>();
```

## 4. Documentation Tooling Integration

### MCP-Compatible Tools:
1. **MCP Inspector** - Runtime exploration of MCP servers
2. **TypeScript Generator** - Generate types from MCP manifests
3. **MCP Client Libraries** - SDK documentation

### OpenAPI-Compatible Tools:
1. **Swagger UI** - Interactive API documentation
2. **Redoc** - Beautiful API documentation
3. **Insomnia/Postman** - API testing and documentation

### Unified Documentation Tools:
1. **GitBook** - Can embed both MCP and OpenAPI docs
2. **Docusaurus** - Custom docs with both protocol support
3. **Stoplight Studio** - Handles both JSON Schema and OpenAPI

## 5. Best Practices for Hybrid Documentation

### ✅ Do:
- **Cross-reference protocols** in descriptions
- **Share schema definitions** where possible
- **Provide migration guides** between protocols
- **Include usage examples** for both protocols
- **Document protocol-specific benefits**

### ❌ Don't:
- **Duplicate schema definitions** unnecessarily
- **Ignore protocol differences** in documentation
- **Mix protocol concepts** in single docs
- **Forget to update both** when making changes

## 6. Example Usage Scenarios

### Scenario 1: AI Assistant Integration (MCP)
```typescript
// AI assistant discovers and uses tools
const tools = await mcpClient.listTools();
const result = await mcpClient.callTool({
  name: "execute_faq_question",
  arguments: { questionId: "dak-name" }
});
```

### Scenario 2: Web Application Integration (REST)
```typescript
// React component uses REST API
const response = await fetch('/faq/questions/execute', {
  method: 'POST',
  body: JSON.stringify({ 
    requests: [{ questionId: 'dak-name' }] 
  })
});
```

### Scenario 3: CLI Tool Integration (MCP + stdio)
```bash
# Command-line usage via stdio
echo '{"method":"tools/call","params":{"name":"execute_faq_question","arguments":{"questionId":"dak-name"}}}' | node dist/mcp-server.js
```

## 7. Documentation Maintenance

### Version Synchronization:
```json
{
  "mcp-manifest.json": { "version": "1.0.0" },
  "docs/openapi.yaml": { "info": { "version": "1.0.0" } },
  "package.json": { "version": "1.0.0" }
}
```

### Schema Validation:
```bash
# Validate MCP manifest
npx @modelcontextprotocol/validate-manifest mcp-manifest.json

# Validate OpenAPI spec
npx @apidevtools/swagger-parser validate docs/openapi.yaml
```

### Documentation Generation:
```bash
# Generate documentation from schemas
npm run docs:generate-mcp
npm run docs:generate-openapi
npm run docs:build-site
```

## Conclusion

The hybrid MCP + OpenAPI documentation approach provides:

1. **Protocol-Appropriate Documentation** - Each protocol gets optimized docs
2. **Cross-Protocol Discovery** - Users can find the right protocol for their needs  
3. **Shared Schema Consistency** - Same underlying data structures
4. **Future-Proof Architecture** - Ready for evolving protocol standards

This approach maximizes integration flexibility while maintaining documentation quality and developer experience across both protocols.