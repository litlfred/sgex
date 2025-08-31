# DAK FAQ MCP Server (TypeScript)

A TypeScript-based MCP (Model Context Protocol) server for WHO SMART Guidelines Digital Adaptation Kit (DAK) FAQ functionality.

## Features

- **Full TypeScript Implementation**: Type-safe API with comprehensive interfaces
- **Express.js Server**: RESTful API endpoints for FAQ operations
- **Local Security**: Localhost-only binding for development safety
- **FAQ Question Registry**: Extensible system for registering custom questions
- **Batch Processing**: Execute multiple FAQ questions in a single request
- **OpenAPI Schema**: Auto-generated API documentation

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start

# Development with watch mode
npm run watch & npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status and version information.

### Question Catalog
```
GET /faq/questions/catalog?level=dak&tags=metadata
```
Returns available FAQ questions with optional filtering.

### Execute Questions
```
POST /faq/questions/execute
```
Execute one or more FAQ questions in batch.

Example request body:
```json
{
  "requests": [
    {
      "questionId": "dak-name",
      "parameters": {
        "locale": "en_US"
      }
    }
  ],
  "context": {
    "repositoryPath": "/path/to/dak"
  }
}
```

### WHO SMART Guidelines Canonical Schema Operations

```
GET /faq/canonical/known
```
Get known canonical ValueSets and Logical Models.

```
POST /faq/canonical/validate
```
Validate data against a canonical schema.

```
GET /faq/canonical/valuesets/*/expand
```
Expand a ValueSet to get all codes.

```
POST /faq/canonical/valuesets/validate-code
```
Validate a code against a ValueSet.

```
GET /faq/canonical/schemas/*
```
Load a canonical schema.

```
GET /faq/canonical/questions/:questionId/valuesets
```
Get ValueSet information for question parameters.

```
GET /faq/canonical/cache/stats
DELETE /faq/canonical/cache
```
Cache management operations.

## TypeScript Architecture

### Core Types
- `FAQQuestion`: Question metadata interface
- `ExecuteRequest`: Single question execution request
- `ExecuteResponse`: Question execution result
- `BatchExecuteResponse`: Batch execution response
- `ValidationResult`: Request validation result

### Key Classes
- `FAQExecutionEngineLocal`: Main execution engine
- `LocalStorageImpl`: File system storage interface
- Express route handlers with full type safety

### Type-Safe Features
- Comprehensive interfaces for all API requests/responses
- Generic type parameters for Express routes
- Strict null checks and error handling
- Auto-completion support in IDEs

## Development

### Build System
```bash
npm run build    # Compile TypeScript to dist/
npm run clean    # Remove build artifacts
npm run watch    # Watch mode compilation
```

### Adding New Questions
1. Define question metadata interface
2. Implement execution logic with proper typing
3. Register in `FAQExecutionEngineLocal`
4. Add to question registry with type safety

### Security
- Local-only binding (127.0.0.1)
- Path traversal protection
- CORS restricted to localhost:3000
- Request validation with type checking

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode

### TypeScript Configuration
See `tsconfig.json` for compiler options:
- Target: ES2022
- Module: ESNext
- Strict type checking enabled
- Source maps and declarations generated

## Integration

The TypeScript MCP server integrates with SGeX Workbench React frontend:

```typescript
// Frontend integration example
const response = await fetch('http://127.0.0.1:3001/faq/questions/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requests: [{ questionId: 'dak-name' }]
  })
});

const result: BatchExecuteResponse = await response.json();
```

## WHO SMART Guidelines Compliance

- Follows WHO DAK component specifications
- Supports standard question taxonomy levels (dak, component, asset)
- Compatible with FHIR R4, BPMN 2.0, DMN 1.3 standards
- Implements WHO terminology binding patterns
- **NEW**: Integrated with WHO SMART Guidelines canonical ValueSets and Logical Models
- **NEW**: Enhanced validation against canonical FHIR schemas
- **NEW**: Support for WHO ValueSet expansion and code validation