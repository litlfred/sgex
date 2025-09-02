# MCP Service Documentation Strategy

## Analysis of MCP Documentation Best Practices

Based on research of the Model Context Protocol ecosystem and integration with existing OpenAPI documentation, here are the recommended approaches for documenting MCP services:

## 1. MCP Protocol Documentation Standards

### MCP Server Manifest
The official MCP specification recommends documenting servers through:
- **Server Manifest**: JSON file describing capabilities, tools, resources, and prompts
- **Tool Schemas**: JSON Schema definitions for each tool's input/output
- **Protocol Compliance**: Documentation of supported MCP capabilities

### Recommended MCP Documentation Formats:

1. **MCP Manifest File** (`mcp-manifest.json`)
2. **Tool Documentation** (JSON Schema + Examples)
3. **Integration Guide** (How to use via MCP clients)
4. **Protocol Specification** (Capabilities and transport details)

## 2. OpenAPI Integration Approaches

### Challenges with OpenAPI + MCP Integration:
- **Different Protocols**: OpenAPI is HTTP-based, MCP uses JSON-RPC 2.0 over stdio/transport
- **Schema Differences**: OpenAPI 3.x vs JSON Schema (MCP uses pure JSON Schema)
- **Transport Differences**: REST endpoints vs stdio/websocket/sse

### Integration Strategies:

#### Strategy 1: Dual Documentation (Recommended)
- Maintain separate OpenAPI spec for REST endpoints
- Create MCP manifest and documentation for MCP tools
- Share JSON schemas between both formats where possible
- Cross-reference between the two systems

#### Strategy 2: Unified Documentation Platform
- Use tools like GitBook, Notion, or custom docs that can document both
- Generate documentation from shared schema definitions
- Maintain protocol-specific sections

#### Strategy 3: Schema-Driven Generation
- Define schemas once in JSON Schema format
- Generate OpenAPI specs for REST endpoints
- Generate MCP manifests for MCP tools
- Tools: `json-schema-to-openapi`, custom generators

## 3. Recommended Implementation for DAK FAQ Service

### A. Create MCP Manifest File
```json
{
  "name": "dak-faq-mcp-server",
  "version": "1.0.0",
  "description": "WHO SMART Guidelines DAK FAQ MCP Server",
  "capabilities": {
    "tools": { "listChanged": true },
    "resources": { "subscribe": false },
    "prompts": { "listChanged": false }
  },
  "transport": ["stdio"],
  "tools": [...]
}
```

### B. Enhanced Tool Documentation
- JSON Schema for each tool
- Usage examples
- Integration patterns

### C. Dual Protocol Documentation
- Keep existing OpenAPI for REST
- Add MCP documentation alongside
- Shared schema definitions

### D. Integration Examples
- MCP client integration
- REST API integration
- CLI usage patterns

## 4. Tools and Libraries for MCP Documentation

### MCP-Specific Tools:
1. **@modelcontextprotocol/sdk** - Provides TypeScript types for documentation
2. **MCP Inspector** - Runtime tool for exploring MCP servers
3. **Schema validators** - Validate MCP manifests and tool definitions

### Documentation Generation:
1. **json-schema-faker** - Generate examples from schemas
2. **@apidevtools/json-schema-ref-parser** - Resolve schema references
3. **typescript-json-schema** - Generate schemas from TypeScript types

### Integration Platforms:
1. **Stoplight Studio** - Can handle both OpenAPI and JSON Schema
2. **Insomnia** - Supports both REST and JSON-RPC
3. **Custom documentation sites** - React/Vue apps with both protocol support

## 5. Implementation Plan

### Phase 1: MCP Manifest and Core Documentation
1. Create `mcp-manifest.json` with full server metadata
2. Enhance tool schemas with comprehensive examples
3. Add MCP-specific README section

### Phase 2: Shared Schema Architecture
1. Extract common schemas to shared location
2. Generate OpenAPI components from shared schemas
3. Generate MCP tool definitions from shared schemas

### Phase 3: Unified Documentation Site
1. Create documentation site supporting both protocols
2. Interactive examples for both REST and MCP
3. Migration guides between protocols

## 6. Benefits of This Approach

### For Developers:
- Clear understanding of both protocols
- Easy migration between REST and MCP
- Comprehensive examples and schemas

### For Integration:
- Multiple integration options (REST, MCP, CLI)
- Standards-compliant implementations
- Future-proof architecture

### For Maintenance:
- Single source of truth for schemas
- Automated documentation generation
- Consistent versioning across protocols

## Next Steps

1. **Immediate**: Create MCP manifest and enhanced documentation
2. **Short-term**: Implement shared schema architecture
3. **Long-term**: Build unified documentation platform

This approach provides the best of both worlds: proper MCP protocol compliance with good integration into existing OpenAPI workflows.