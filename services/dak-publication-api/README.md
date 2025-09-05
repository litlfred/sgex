# DAK Publication Services API

OpenAPI-driven microservice for WHO SMART Guidelines DAK publication generation with WYSIWYG-first architecture.

## Overview

This service replaces YAML-based configuration files with RESTful API endpoints, providing a service-oriented architecture for DAK publication generation that integrates seamlessly with existing MCP and FAQ services.

## Key Features

- **🚫 No YAML Files**: All configuration managed through API endpoints
- **🔗 Service Integration**: Native integration with MCP and DAK FAQ services
- **✏️ WYSIWYG Support**: API-driven template variables and user-editable content
- **🏗️ OpenAPI-First**: Complete OpenAPI 3.0 specification with code generation
- **🔄 Real-time Variables**: Dynamic variable resolution from multiple sources
- **📄 Template Management**: Create, update, and manage publication templates via API

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│ Publication API │◄──►│   FAQ Service   │
│   (WYSIWYG)     │    │  (Port 3002)    │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │  MCP Services   │
                      │  Integration    │
                      └─────────────────┘
```

## Quick Start

### 1. Installation

```bash
cd services/dak-publication-api
npm install
```

### 2. Start the Service

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build && npm start
```

### 3. API Documentation

Access the interactive API documentation at: http://localhost:3002/docs

### 4. Health Check

```bash
curl http://localhost:3002/health
```

## API Usage Examples

### Create a Publication Template

```bash
curl -X POST http://localhost:3002/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom WHO Template",
    "templateType": "organization", 
    "sections": [
      {
        "id": "executive-summary",
        "name": "Executive Summary", 
        "order": 1,
        "enabled": true,
        "template": "# Executive Summary\n${publication.customPreface}"
      }
    ]
  }'
```

### Resolve Template Variables

```bash
curl -X POST http://localhost:3002/variables/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "dakRepository": "who/smart-immunizations",
    "templateId": "who-dak-standard-v1",
    "userContent": {
      "publication.title": "Custom Publication Title"
    },
    "serviceIntegration": {
      "useFAQ": true
    }
  }'
```

### Generate Publication

```bash
curl -X POST http://localhost:3002/publications/generate \
  -H "Content-Type: application/json" \
  -d '{
    "dakRepository": "who/smart-immunizations",
    "templateId": "who-dak-standard-v1", 
    "formats": ["html"],
    "options": {
      "wysiwygMode": true
    }
  }'
```

## Service Integration

### FAQ Service Integration

The API automatically integrates with the existing DAK FAQ MCP service:

```javascript
// Batch execute FAQ questions for DAK metadata extraction
const faqResults = await fetch('/integrations/faq/batch', {
  method: 'POST',
  body: JSON.stringify({
    dakRepository: 'who/smart-immunizations',
    questions: [
      { questionId: 'dak-name' },
      { questionId: 'dak-version' },
      { questionId: 'business-process-workflows' }
    ]
  })
});
```

### MCP Service Integration

```javascript
// Execute MCP calls for AI-driven content generation
const mcpResult = await fetch('/integrations/mcp/execute', {
  method: 'POST', 
  body: JSON.stringify({
    service: 'content-analysis',
    method: 'generateSummary',
    parameters: { dakRepository: 'who/smart-immunizations' }
  })
});
```

## WYSIWYG Integration

### Frontend Integration

```javascript
// Get editable content fields for WYSIWYG editor
const fields = await fetch(`/content/user/${dakRepo}/fields?templateId=${templateId}`);

// Update user content via WYSIWYG
const result = await fetch(`/content/user/${dakRepo}`, {
  method: 'PUT',
  body: JSON.stringify({
    templateId,
    content: {
      'publication.title': 'New Title',
      'publication.customPreface': '<p>Rich text content</p>'
    }
  })
});

// Generate publication with WYSIWYG support
const publication = await fetch('/publications/generate', {
  method: 'POST',
  body: JSON.stringify({
    dakRepository: dakRepo,
    templateId,
    options: { wysiwygMode: true }
  })
});
```

### Template Variables

Variables are resolved dynamically from multiple sources:

- **User Content**: Editable via WYSIWYG interface
- **DAK Metadata**: Extracted via FAQ service integration
- **MCP Services**: AI-generated content
- **Asset Metadata**: File and resource information

```json
{
  "variables": {
    "publication": {
      "title": "Smart Immunizations - Digital Adaptation Kit",
      "copyright": "© 2024 World Health Organization"
    },
    "dak": {
      "name": "Smart Immunizations", 
      "version": "1.0.0"
    },
    "components": {
      "businessProcesses": {
        "workflows": [...]
      }
    }
  },
  "sources": {
    "userContent": ["publication.title"],
    "faqService": ["dak.name", "dak.version"], 
    "dakMetadata": ["components.businessProcesses.workflows"]
  }
}
```

## Replacing YAML Configurations

### Before (YAML-based)

```yaml
# Old approach: parameters/registry.yaml
dak:
  repository:
    type: string
    required: true
component:
  businessProcess:
    bpmnDirectory:
      type: string
      default: "input/images"
```

### After (API-based)

```javascript
// New approach: Dynamic via service integration
const schema = await fetch('/variables/schema?templateId=who-dak-standard-v1');
const variables = await fetch('/variables/resolve', {
  method: 'POST',
  body: JSON.stringify({
    dakRepository: 'who/smart-immunizations',
    templateId: 'who-dak-standard-v1',
    serviceIntegration: { useFAQ: true }
  })
});
```

## Development

### Project Structure

```
services/dak-publication-api/
├── openapi.yaml              # OpenAPI 3.0 specification
├── integration-guide.md      # Service integration documentation
├── package.json              # Node.js dependencies and scripts
├── src/                      # TypeScript source code
│   ├── server.ts            # Express server setup
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic services
│   ├── types/               # TypeScript type definitions
│   └── middleware/          # Express middleware
├── tests/                   # Test files
└── dist/                    # Compiled JavaScript (generated)
```

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run validate-api # Validate OpenAPI specification
npm run generate-client # Generate TypeScript client from OpenAPI spec
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Run integration tests
npm run integration-test
```

## API Reference

The complete API reference is available at:
- **Interactive Docs**: http://localhost:3002/docs (when running)
- **OpenAPI Spec**: [openapi.yaml](./openapi.yaml)
- **Integration Guide**: [integration-guide.md](./integration-guide.md)

### Key Endpoints

- `GET /health` - Service health check
- `GET /templates` - List publication templates  
- `POST /templates` - Create new template
- `POST /variables/resolve` - Resolve template variables
- `POST /publications/generate` - Generate DAK publication
- `POST /integrations/faq/batch` - Batch execute FAQ questions

## Configuration

### Environment Variables

```bash
PORT=3002                    # Service port
FAQ_SERVICE_URL=http://localhost:3001  # FAQ service endpoint
MCP_SERVICE_URL=http://localhost:3003  # MCP service endpoint
LOG_LEVEL=info              # Logging level
CORS_ORIGIN=http://localhost:3000      # CORS origin for frontend
```

### Service Dependencies

- **DAK FAQ MCP Service** (Port 3001): For DAK metadata extraction
- **MCP Services** (Port 3003): For AI-driven content generation
- **Frontend** (Port 3000): WYSIWYG interface

## Deployment

### Docker

```bash
# Build image
docker build -t sgex/dak-publication-api .

# Run container
docker run -p 3002:3002 \
  -e FAQ_SERVICE_URL=http://faq-service:3001 \
  sgex/dak-publication-api
```

### Production

```bash
# Install production dependencies
npm ci --only=production

# Build application
npm run build

# Start service
npm start
```

## Contributing

1. Follow the OpenAPI-first development approach
2. Update the OpenAPI specification before implementing new endpoints
3. Ensure all endpoints integrate properly with MCP and FAQ services
4. Add comprehensive tests for new functionality
5. Update documentation for API changes

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

## Related Services

- [DAK FAQ MCP Service](../dak-faq-mcp/README.md) - FAQ functionality via MCP protocol
- [SGeX Workbench](../../README.md) - Main application
- [DAK Components Documentation](../../public/docs/dak-components.md) - DAK component specifications